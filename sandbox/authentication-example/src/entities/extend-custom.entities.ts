import { Entity, Column } from 'typeorm';
import { BaseUser } from '@newlink/authentication';

@Entity('users')
export class User extends BaseUser {
    @Column({ nullable: true })
    profilePictureUrl?: string;
}