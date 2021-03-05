export interface Arduino {
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

export interface Data {
	path: string;
	timestamp: string;
	ADC: ADC;
	PWM: PWM;
};
