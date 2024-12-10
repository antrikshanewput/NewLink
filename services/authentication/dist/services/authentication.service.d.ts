import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthenticationOptionsType } from '../authentication.type';
export declare class AuthenticationService {
    private readonly jwtService;
    private readonly options;
    private readonly userRepository;
    private readonly userTenantRepository;
    constructor(jwtService: JwtService, options: AuthenticationOptionsType, userRepository: Repository<any>, userTenantRepository: Repository<any>);
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
