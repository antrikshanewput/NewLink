import { JwtService } from '@nestjs/jwt';
export declare class JwtServiceWrapper {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    decodeToken(token: string): any;
    verifyToken(token: string): any;
}
