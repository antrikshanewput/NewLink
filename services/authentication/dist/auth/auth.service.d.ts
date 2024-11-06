import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class AuthService {
    private readonly jwtService;
    readonly options: {
        authenticationField: string;
        registrationFields: string[];
        encryptionStrategy: (password: string) => Promise<string>;
    };
    private readonly userRepository;
    constructor(jwtService: JwtService, options: {
        authenticationField: string;
        registrationFields: string[];
        encryptionStrategy: (password: string) => Promise<string>;
    }, userRepository: Repository<User>);
    findUserByAuthField(value: string): Promise<User | null>;
    validateUser(authFieldValue: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    register(userDetails: any): Promise<any>;
}
