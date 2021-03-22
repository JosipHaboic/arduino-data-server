export interface PortInfo {
	path: string;
	manufacturer: string;
	serialNumber: string;
	pnpId: string;
	locationId: string;
	vendorId: string;
	productId: string;
}

export interface PortData {
	path: string;
	timestamp: string;
	data: any;
};
