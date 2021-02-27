export interface ADC {
	vin: number,
	vout: number,
};

export interface PWM {
	dutyCycle: number,
};

export interface ArduinoData {
	ADC: ADC,
	PWM: PWM,
};
