import SerialPortStream from '@serialport/stream';
import SerialPort, { PortInfo } from 'serialport';
import CircularBuffer from 'circular-buffer';
import { v4 as uuidv4 } from 'uuid';
import { MessageRegister } from '../util';
import { PortData, MessageCategories } from '../models';
import { dateTimeFormatter } from '../util/datetime';

const MAX_HISTORY_SIZE = 32;
// we can have more than one port open at the same time, so map them by their port path
let portMap = new Map<String, SerialPortStream>();
// keeps PortData records for each open port
let portHistoryDataMap = new Map<String, CircularBuffer<PortData>>();
// current PortData incoming from the ports
let portCurrentDataMap = new Map<String, PortData>();
// errors and warning register, both have id for easier manipulation
let messages = new MessageRegister(uuidv4);
let allowConsoleLog = true;



export const resolvers = {
	Query: {
		portList: async (): Promise<PortInfo[]> => {
			const portList = await SerialPort.list();

			return portList;
		},
		isPortOpen: ({ path }): Boolean => {
			try {
				return portMap.get(path).isOpen;
				// catch errors in case the port is not in map for some reason
			} catch (error) {
				messages.add(error.message, MessageCategories.ERROR);

				return false;
			}
		},
		messages: () => {

			return messages.all();
		},
		dataBuffer: ({ path }) => {
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
		currentData: ({ path }) => {
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
		openPort: async ({ path, openOptions, delimiter }) => {

			const portList = await SerialPort.list();
			if ((portList.length !== 0) && (path in SerialPort.list())) {
				const warning = `Serial port ${path} not existing or not available.`;
				messages.add(warning, MessageCategories.WARNING);
				if (allowConsoleLog) { console.log(warning); }

				return false;
			}

			if (portMap.has(path) && portMap.get(path).isOpen) {
				const info = `Port ${path} is already opened`;

				if (allowConsoleLog) { console.log(info); }
				messages.add(info, MessageCategories.INFO);

				return true;
			}

			let port: SerialPortStream = SerialPortStream(path, openOptions);
			const parser = new SerialPort.parsers.Delimiter({ delimiter });

			port.pipe(parser);

			port.on('open', () => {

				if (!portHistoryDataMap.has(port)) {
					portHistoryDataMap.set(path, new CircularBuffer(MAX_HISTORY_SIZE));
				}

				parser.on('PortData', (payload: Buffer) => {
					let currentData: PortData;

					try {
						currentData = JSON.parse(payload.toString().trim()) as PortData;

						currentData.path = path;
						currentData.timestamp = dateTimeFormatter.format(Date.now());

						portCurrentDataMap.set(path, currentData);
						let historyData: CircularBuffer = portHistoryDataMap.get(path);
						historyData.push(currentData);
						portHistoryDataMap.set(path, historyData);

						return true;

					} catch (error) {
						if (allowConsoleLog) { console.log(error); }
						messages.add(error.message, MessageCategories.DEBUG);

						return false;
					}
				});

				parser.on('error', (error) => {
					console.log(error);
					messages.add(error.message, MessageCategories.ERROR);
				});

			});

			await port.open();

			if (allowConsoleLog) {
				const msg = `Port ${path} is ready`;
				console.log(msg);
				messages.add(msg, MessageCategories.INFO);
			}

			portMap.set(path, port);

			return true;
		},
		closePort: ({ path }) => {
			let mappedPort = portMap.get(path);

			if (mappedPort !== null) {
				try {
					mappedPort.close();
				} catch (error) {
					console.log(error);
					messages.add(error.message, MessageCategories.ERROR);

					return false;

				}

				const msg = `Port ${path} is closed`;
				console.log(msg);
				messages.add(msg, MessageCategories.INFO);

				return true;
			}

			return false;
		},
		deleteMessage: ({ id }) => {
			return messages.delete(id);
		},
		clearMessages: () => {
			messages.clear();
		}
	},
};
