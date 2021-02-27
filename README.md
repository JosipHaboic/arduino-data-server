# GraphQL based server for Arduino

## Install

``` bash
npm install
```

## Run server

``` bash
npm start
```

Now open browser and go to url: http://localhost:3000

Examples:

``` bash
# Write your query or mutation here
query { portList {path}}
# query {isPortOpen(path: "COM5")}
# query {dataBuffer(path: "COM5") {ADC {vin, vout}, PWM {dutyCycle}}}
# query { currentData(path: "COM5") {ADC {vin, vout}, PWM {dutyCycle}}}
# mutation { openPort(path:"COM5", openOptions: {baudRate: 9600}, delimiter: "\r\n")}
# mutation { closePort(path:"COM5")}
```

## Operations supported by GraphQL backend:

	* List ports
	* Data stream to the PC from arduino
	* Data history
