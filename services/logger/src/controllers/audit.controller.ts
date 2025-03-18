import { Body, Controller, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

import { AuditService } from 'services/audit.service';
@Controller('audit')
export class AuditController {
	static AuditDTO: any;

	constructor(
		private readonly auditService: AuditService,
		@Inject('AUDIT_DTO') private readonly AuditDTO: any,
	) {
		AuditController.AuditDTO = AuditDTO;
	}

	@Post('')
	@ApiBody({ type: () => AuditController.AuditDTO })
	@ApiResponse({ status: HttpStatus.CREATED, description: 'Action successfully recorded' })
	@ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid data' })
	async register(@Body() body: InstanceType<typeof this.AuditDTO>) {
    const response = await this.auditService.recordAction(body.oldData, body.newData, body.action, body.tableName);
		return response;
	}
}
