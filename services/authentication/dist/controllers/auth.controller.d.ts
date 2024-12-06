import { AuthenticationService } from '../services/authentication.service';
import { AuthenticationOptionsType } from '../authentication.type';
export declare class AuthController {
    private readonly authenticationService;
    private readonly options;
    constructor(authenticationService: AuthenticationService, options: AuthenticationOptionsType);
    login(body: Record<string, any>): Promise<{
        access_token: string;
        user: string;
    }>;
    register(body: Record<string, any>): Promise<any>;
}
