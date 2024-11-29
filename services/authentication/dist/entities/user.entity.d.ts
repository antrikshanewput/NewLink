export declare class BaseUser {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
    last_login: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    userTenants: any[];
}
