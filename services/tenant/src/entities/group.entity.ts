import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
}