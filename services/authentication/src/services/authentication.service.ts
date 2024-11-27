import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthenticationOptionsType } from '../authentication.types';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('AUTH_OPTIONS') private readonly options: AuthenticationOptionsType,
    @Inject('USER_REPOSITORY') private readonly userRepository: Repository<any>,
  ) {}

  async findUserByAuthField(value: string): Promise<any | null> {
    const field = this.options.authenticationField!;
    const user = await this.userRepository.findOne({ where: { [field]: value } });
    return user || null;
  }

  async validateUser(authFieldValue: string, password: string): Promise<any | null> {
    const user = await this.findUserByAuthField(authFieldValue);
    if (user && (await this.options.hashValidation!(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: any): Promise<{ access_token: string, user: string }> {
    const payload = { [this.options.authenticationField!]: user[this.options.authenticationField!], sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: user[this.options.authenticationField!],
    };
  }

  async register(userDetails: any): Promise<any> {
    const encryptedPassword = await this.options.hashingStrategy!(userDetails.password);
    const newUser = this.userRepository.create({ ...userDetails, password: encryptedPassword });
    return await this.userRepository.save(newUser);
  }
  getAuthenticationField(): string {
    return this.options.authenticationField!;
  }
  getRegistrationFields(): string[] {
    return this.options.registrationFields!;
  }
}