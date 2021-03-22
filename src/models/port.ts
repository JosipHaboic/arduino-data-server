export interface PortInfo {
	path: string;
	manufacturer: string;
	serialNumber: string;
	pnpId: string;
	locationId: string;
	vendorId: string;
	productId: string;
}

export interface ADC {
	vin: number;
	vout: number;
};

export interface PWM {
	dutyCycle: number;
};

export interface PortData {
	path: string;
	timestamp: string;
	adc: ADC;
	pwm: PWM;
};
