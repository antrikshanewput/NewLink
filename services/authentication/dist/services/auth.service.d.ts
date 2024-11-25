import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthOptionsType } from '../auth.types';
export declare class AuthService {
    private readonly jwtService;
    private readonly options;
    private readonly userRepository;
    constructor(jwtService: JwtService, options: AuthOptionsType, userRepository: Repository<any>);
    findUserByAuthField(value: string): Promise<any | null>;
    validateUser(authFieldValue: string, password: string): Promise<any | null>;
    login(user: any): Promise<{
        access_token: string;
        user: string;
    }>;
    register(userDetails: any): Promise<any>;
    getAuthenticationField(): string;
    getRegistrationFields(): string[];
}
