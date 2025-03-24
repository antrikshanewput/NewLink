interface ProviderDtoType {
	provide: string;
	useValue: any;
}

export interface NotificationModuleOptions {
	email?: {
		host?: string;
		port?: number;
		user?: string;
		pass?: string;
		from?: string;
	};
	sms?: {
		provider?: string;
		authId?: string;
		authToken?: string;
		from?: string;
		whatsappFrom?: string;
		whatsappTemplate?: string;
	};
	dto?: ProviderDtoType[];
}
