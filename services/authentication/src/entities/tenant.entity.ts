import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserTenant } from "./user-tenant.entity";

@Entity('tenants')
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id!: number;

    @Column()
    name!: string;
    
    @Column()
    address!: string;
    
    @Column()
    city!: string;
    
    @Column()
    state!: string;
    
    @Column()
    zip!: string;
    
    @Column()
    country!: string;
    
    @Column()
    status!: string;
    
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

    @OneToMany(() => UserTenant, (userTenant) => userTenant.tenant)
    userTenants!: UserTenant[];
}