import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserTenant } from "./user-tenant.entity";

@Entity('groups')
export class Group {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column()
    createdBy!: string;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column()
    modifiedBy!: string;

    @DeleteDateColumn()
    deletedAt!: Date;

    @Column()
    deletedBy!: string;

    @ManyToMany(() => UserTenant, (userTenant) => userTenant.groups)
    userTenants!: UserTenant[];
}
