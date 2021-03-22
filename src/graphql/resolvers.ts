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
let portDataBufferMap = new Map<String, CircularBuffer<PortData>>();
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
		isPortOpen: (root, { path }, context): Boolean => {
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
		dataBuffer: (root, { path }, context) => {
			if (allowConsoleLog) {
				console.log(path);
				console.log(portDataBufferMap);
			}

			if (portDataBufferMap.has(path)) {
				return portDataBufferMap.get(path).toarray();
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

			if (portMap.has(path) && (portMap.get(path).isOpen)) {
				const info = `Port ${path} is already opened`;

				if (allowConsoleLog) { console.log(info); }
				messages.add(info, MessageCategories.INFO);

				return true;
			}

			let port: SerialPortStream = SerialPortStream(path, openOptions);
			const parser = new SerialPort.parsers.Delimiter({ delimiter });

			port.pipe(parser);

			port.on('open', () => {

				if (!portDataBufferMap.has(port)) {
					portDataBufferMap.set(path, new CircularBuffer(MAX_HISTORY_SIZE));
				}

				parser.on('data', (payload: Buffer) => {
					// currentData = JSON.parse(payload.toString().trim()) as PortData;
					try {
						let currentData = {
							data: payload.toString().trim(),
							path: path,
							timestamp: dateTimeFormatter.format(Date.now())
						} as PortData;

						portCurrentDataMap.set(path, currentData);
						let historyData: CircularBuffer = portDataBufferMap.get(path);
						historyData.push(currentData);
						portDataBufferMap.set(path, historyData);

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

			// this made me go nuts, just pass empty "error" handler
			await port.open(() => { return true; });

			if (allowConsoleLog) {
				const msg = `Port ${path} is ready`;
				console.log(msg);
				messages.add(msg, MessageCategories.INFO);
			}

			portMap.set(path, port);

			return true;
		},
		closePort: (root, { path }, context) => {
			let mappedPort = portMap.get(path);

			if (mappedPort !== null) {
				try {
					mappedPort.close(() => {});
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
		deleteMessage: (root, { id }, context) => {
			return messages.delete(id);
		},
		clearMessages: () => {
			messages.clear();
		}
	},
};
