import { gql } from 'apollo-server';

export const typeDefs = gql`
	type PortInfo {
		path: String
		manufacturer: String
		serialNumber: String
		pnpId: String
		locationId: String
		vendorId: String
		productId: String
	}

	type ADC {
		vin: Float
		vout: Float
	}

	type PWM {
		dutyCycle: Float
	}

	type ArduinoData {
		ADC: ADC
		PWM: PWM
	}

	input OpenOptions {
		baudRate: Int = 9600
		autoOpen: Boolean = True
	  	endOnClose: Boolean = False
	  	dataBits: Int = 8
	  	hupcl:  Boolean = True
	  	lock: Boolean = True
	  	parity: String = "none"
	  	rtscts: Boolean = False
	  	stopBits: Int = 1
	  	xany: Boolean = False
	  	xoff: Boolean = False
	  	xon: Boolean = False
	  	highWaterMark: Int = 65536
	}

	type Error {
		name: String!
		message: String!
		stack: String
	}

	type Query {
		portList: [PortInfo]
		isPortOpen(path: String!): Boolean
		dataBuffer(path: String!): [ArduinoData]
		currentData(path: String!): ArduinoData
		errors: [Error]
		warnings: [String]
	}

	type Mutation {
		openPort(path: String!, openOptions: OpenOptions, delimiter: String!): Boolean
		closePort(path: String!): Boolean
		setDataBufferSize(size: Int = 32): Boolean
	}
`