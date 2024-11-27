import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthenticationOptionsType } from '../authentication.types';
export declare class AuthorizationSeederService implements OnApplicationBootstrap {
    private readonly config;
    private readonly roleRepository;
    private readonly featureRepository;
    constructor(config: AuthenticationOptionsType, roleRepository: Repository<any>, featureRepository: Repository<any>);
    onApplicationBootstrap(): Promise<void>;
}
