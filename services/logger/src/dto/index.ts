import { AuditDto } from 'dto/audit.dto';

export const DefaultDTO = [
	{
		provide: 'AUDIT_DTO',
		useValue: AuditDto,
	},
];
