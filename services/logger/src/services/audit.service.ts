import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";

@Injectable()
export class AuditService {
  constructor(
    @Inject("AUDIT_LOG_REPOSITORY") private readonly auditRepository: Repository<any>
  ) {}

  async recordAction(oldData: object, newData: object, action: string, tableName: string): Promise<any> {
    await this.auditRepository.create({
      action,
      tableName,
      oldData,
      newData,
    });
    return true;
  }
}
