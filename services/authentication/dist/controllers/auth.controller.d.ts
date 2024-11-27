import { AuthenticationService } from '../services/authentication.service';
export declare class AuthController {
    private readonly authenticationService;
    constructor(authenticationService: AuthenticationService);
    login(body: Record<string, any>): Promise<{
        access_token: string;
        user: string;
    }>;
    register(body: Record<string, any>): Promise<any>;
}
