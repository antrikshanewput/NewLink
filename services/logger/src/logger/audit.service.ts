import { Injectable, Inject } from '@nestjs/common';
import { LoggerConfig } from './interface/logger-config.interface';
import { DataSource } from 'typeorm';

@Injectable()
export class AuditService {
  constructor(@Inject('LOGGER_CONFIG') private readonly config: LoggerConfig, private readonly dataSource: DataSource) {
    this.initializeAudit();
  }

  private async initializeAudit() {
    await this.createLogTable();
    await this.createTriggerFunction();

    if (this.config.dbaudit.enableAudit) {
      await this.attachTriggers();
    }

    if (this.config.dbaudit.disableAudit) {
      await this.removeTriggers();
    }
  }

  async createLogTable() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS action_logs (
        id SERIAL PRIMARY KEY,
        table_name TEXT NOT NULL,  
        action TEXT NOT NULL,      
        old_data JSONB,            
        new_data JSONB,            
        changed_at TIMESTAMP DEFAULT now()
      );
    `);
    await queryRunner.release();
  }

  async createTriggerFunction() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION log_table_changes()
      RETURNS TRIGGER AS $$
      BEGIN
          INSERT INTO action_logs (table_name, action, old_data, new_data, changed_at)
          VALUES (
              TG_TABLE_NAME,
              TG_OP,
              CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
              CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
              now()
          );
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await queryRunner.release();
  }

  async attachTriggers() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.query(`
      DO $$ 
      DECLARE 
          tbl RECORD;
      BEGIN
          FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
          LOOP
              EXECUTE format(
                  'CREATE TRIGGER trigger_%I
                  AFTER INSERT OR UPDATE OR DELETE ON %I
                  FOR EACH ROW
                  EXECUTE FUNCTION log_table_changes();',
                  tbl.tablename, tbl.tablename
              );
          END LOOP;
      END $$;
    `);
    await queryRunner.release();
  }

  async removeTriggers() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.query(`
      DO $$ 
      DECLARE 
          tbl RECORD;
      BEGIN
          FOR tbl IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
          LOOP
              EXECUTE format(
                  'DROP TRIGGER IF EXISTS trigger_%I ON %I;',
                  tbl.tablename, tbl.tablename
              );
          END LOOP;
      END $$;
    `);
    await queryRunner.release();
  }
}
