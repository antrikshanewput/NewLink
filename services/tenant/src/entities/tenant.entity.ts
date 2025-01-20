import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('tenants')
export class Tenant {
    @PrimaryGeneratedColumn('uuid')
    id!: number;

    @Column()
    name!: string;

    @Column({ nullable: true })
    address!: string;

    @Column({ nullable: true })
    city!: string;

    @Column({ nullable: true })
    state!: string;

    @Column({ nullable: true })
    zip!: string;

    @Column({ nullable: true })
    country!: string;

    @Column({ nullable: true })
    status!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column()
    createdBy!: string;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ nullable: true })
    modifiedBy!: string;

    @DeleteDateColumn()
    deletedAt!: Date;

    @Column({ nullable: true })
    deletedBy!: string;
}