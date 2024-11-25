import { AuthService } from '../services/auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: Record<string, any>): Promise<{
        access_token: string;
        user: string;
    }>;
    register(body: Record<string, any>): Promise<any>;
    check(req: any): Promise<any>;
}
