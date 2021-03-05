import SerialPortStream from '@serialport/stream';
import SerialPort, { PortInfo } from 'serialport';
import CircularBuffer from 'circular-buffer';
import { v4 as uuidv4 } from 'uuid';
import { Register } from '../util';
import { ArduinoData } from '../models/arduinoData';
import { dateTimeFormatter } from '../util/datetime';

const MAX_HISTORY_SIZE = 32;
// we can have more than one port open at the same time, so map them by their port path
let portMap = new Map<String, SerialPortStream>();
// keeps data records for each open port
let portHistoryDataMap = new Map<String, CircularBuffer<ArduinoData>>();
// current data incoming from the ports
let portCurrentDataMap = new Map<String, ArduinoData>();
// errors and warning register, both have id for easier manipulation
let errors = new Register<Error>(uuidv4);
let warnings = new Register<string>(uuidv4);
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
				errors.add(error.message);

				return false;
			}
		},
		errors: (root, args, context) => {

			return errors.all();
		},
		warnings: (root, args, context) => {

			return warnings.all();
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
				errors.add(error.message);

				return null;
			}
		},
	},
	Mutation: {
		openPort: async (root, { path, openOptions, delimiter }, context) => {

			const portList = await SerialPort.list();
			if ((portList.length !== 0) && (path in SerialPort.list())) {
				const warning = `Serial port ${path} not existing or not available.`;
				warnings.add(warning);
				if (allowConsoleLog) { console.log(warning); }

				return false;
			}

			if (portMap.has(path) && portMap.get(path).isOpen) {
				const warning = `Port ${path} is already opened`;

				if (allowConsoleLog) { console.log(warning); }
				warnings.add(warning);

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
					let currentData: ArduinoData;

					try {
						currentData = JSON.parse(payload.toString().trim()) as ArduinoData;

						currentData.path = path;
						currentData.timestamp = dateTimeFormatter.format(Date.now());

						portCurrentDataMap.set(path, currentData);
						let historyData: CircularBuffer = portHistoryDataMap.get(path);
						historyData.push(currentData);
						portHistoryDataMap.set(path, historyData);

						return true;

					} catch (error) {
						if (allowConsoleLog) { console.log(error); }
						errors.add(error.message);

						return false;
					}
				});

				parser.on('error', (error) => {
					console.log(error);
					errors.add(error);
				});

			});

			if (allowConsoleLog) {
				console.log(`Port ${path} is ready`);
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
				errors.add(error.message);

				return false;

			}
		},
	},
};
