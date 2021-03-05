import SerialPortStream from '@serialport/stream';
import SerialPort, { PortInfo } from 'serialport';
import CircularBuffer from 'circular-buffer';
import { v4 as uuidv4 } from 'uuid';
import { MessageRegister } from '../util';
import { Data, MessageCategories } from '../models';
import { dateTimeFormatter } from '../util/datetime';

const MAX_HISTORY_SIZE = 32;
// we can have more than one port open at the same time, so map them by their port path
let portMap = new Map<String, SerialPortStream>();
// keeps data records for each open port
let portHistoryDataMap = new Map<String, CircularBuffer<Data>>();
// current data incoming from the ports
let portCurrentDataMap = new Map<String, Data>();
// errors and warning register, both have id for easier manipulation
let messages = new MessageRegister(uuidv4);
let allowConsoleLog = true;



export const resolvers = {
	Query: {
		portList: async (root, args, context): Promise<PortInfo[]> => {
			const portList = await SerialPort.list();

			return portList;
		},
		isPortOpen: (root, { path }, context): Boolean => {
			try {
				return portMap.get(path).isOpen;
				// catch errors in case the port is not in map for some reason
			} catch (error) {
				messages.add(error.message, MessageCategories.ERROR);

				return false;
			}
		},
		messages: (root, args, context) => {

			return messages.all();
		},
		dataBuffer: (root, { path }, context) => {
			if (allowConsoleLog) {
				console.log(path);
				console.log(portHistoryDataMap);
			}

			if (portHistoryDataMap.has(path)) {
				return portHistoryDataMap.get(path).toarray();
			} else {

				return [];
			}
		},
		currentData: (root, { path }, context) => {
			try {

				return portCurrentDataMap.get(path);
			} catch (error) {
				if (allowConsoleLog) { console.log(error); }
				messages.add(error.message, MessageCategories.ERROR);

				return null;
			}
		},
	},
	Mutation: {
		openPort: async (root, { path, openOptions, delimiter }, context) => {

			const portList = await SerialPort.list();
			if ((portList.length !== 0) && (path in SerialPort.list())) {
				const warning = `Serial port ${path} not existing or not available.`;
				messages.add(warning, MessageCategories.WARNING);
				if (allowConsoleLog) { console.log(warning); }

				return false;
			}

			if (portMap.has(path) && portMap.get(path).isOpen) {
				const warning = `Port ${path} is already opened`;

				if (allowConsoleLog) { console.log(warning); }
				messages.add(warning, MessageCategories.WARNING);

				return true;
			}

			let port: SerialPortStream = SerialPortStream(path, openOptions);
			const parser = new SerialPort.parsers.Delimiter({ delimiter });

			port.pipe(parser);

			port.on('open', () => {

				if (!portHistoryDataMap.has(port)) {
					portHistoryDataMap.set(path, new CircularBuffer(MAX_HISTORY_SIZE));
				}

				parser.on('data', (payload: Buffer) => {
					let currentData: Data;

					try {
						currentData = JSON.parse(payload.toString().trim()) as Data;

						currentData.path = path;
						currentData.timestamp = dateTimeFormatter.format(Date.now());

						portCurrentDataMap.set(path, currentData);
						let historyData: CircularBuffer = portHistoryDataMap.get(path);
						historyData.push(currentData);
						portHistoryDataMap.set(path, historyData);

						return true;

					} catch (error) {
						if (allowConsoleLog) { console.log(error); }
						messages.add(error.message, MessageCategories.ERROR);

						return false;
					}
				});

				parser.on('error', (error) => {
					console.log(error);
					messages.add(error.message, MessageCategories.ERROR);
				});

			});

			if (allowConsoleLog) {
				const msg = `Port ${path} is ready`;
				console.log(msg);
				messages.add(msg, MessageCategories.INFO);
			}

			portMap.set(path, port);

			return true;
		},
		closePort: (root, { path }, context) => {
			try {
				let mappedPort = portMap.get(path);
				mappedPort.close();
				console.log(`Port ${path} is closed`);

				return true;

			} catch (error) {
				console.log(error);
				messages.add(error.message, MessageCategories.ERROR);

				return false;

			}
		},
		clearMessages: (root, args, context) => {
			messages.clear();
		}
	},
};
