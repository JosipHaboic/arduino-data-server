export interface ADC {
	vin: number,
	vout: number,
};

export interface PWM {
	dutyCycle: number,
};

export interface ArduinoData {
	path: string,
	timestamp: string,
	ADC: ADC,
	PWM: PWM,
};
