import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userRepository;
    constructor(configService: ConfigService, userRepository: Repository<any>);
    validate(payload: any): Promise<any>;
}
export {};
