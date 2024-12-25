import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtServiceWrapper {
    constructor(private readonly jwtService: JwtService) { }

    decodeToken(token: string): any {
        return this.jwtService.decode(token);
    }

    verifyToken(token: string): any {
        return this.jwtService.verify(token);
    }
}