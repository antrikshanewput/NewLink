import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthenticationOptionsType } from '../authentication.type';
import { LoginDto } from 'dto/login.dto';
import { RegisterDto } from 'dto/register.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('AUTHENTICATION_OPTIONS') private readonly options: AuthenticationOptionsType,
    @Inject('USER_REPOSITORY') private readonly userRepository: Repository<any>,
    @Inject('USERTENANT_REPOSITORY')
    private readonly userTenantRepository: Repository<any>,
  ) { }

  async findUserByAuthField(value: string): Promise<any | null> {
    const field = this.options.authenticationField!;

    if (value === undefined) {
      return null;
    }

    const user = await this.userRepository.findOne({ where: { [field]: value } });
    return user || null;
  }

  async findUserByUsername(username: string): Promise<any | null> {
    const user = await this.userRepository.findOne({ where: { username } });
    return user || null;
  }

  async validateUser(data: LoginDto): Promise<any | null> {

    const { password } = data;
    const field = this.options.authenticationField;
    const value = data[field];

    const user = await this.findUserByAuthField(value);

    if (user && (await this.options.hashValidation!(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any): Promise<{ access_token: string; user: string }> {

    const userTenants = await this.userTenantRepository.find({
      where: { user: { id: user.id } },
      relations: ['tenant', 'role', 'features'],
    });

    const roles: { [tenantId: string]: string[] } = {};
    const permissions: { [tenantId: string]: string[] } = {};

    for (const userTenant of userTenants) {
      const tenantId = userTenant.tenant.id;

      if (!roles[tenantId]) {
        roles[tenantId] = [];
      }
      if (!roles[tenantId].includes(userTenant.role.name)) {
        roles[tenantId].push(userTenant.role.name);
      }

      if (!permissions[tenantId]) {
        permissions[tenantId] = [];
      }
      for (const feature of userTenant.features) {
        if (!permissions[tenantId].includes(feature.name)) {
          permissions[tenantId].push(feature.name);
        }
      }
    }

    const payload = {
      [this.options.authenticationField!]: user[this.options.authenticationField!],
      id: user.id,
      roles,
      permissions,
    };

    // Update last login
    await this.userRepository.update(user.id, { last_login: new Date() });

    // Return the access token and user
    return {
      access_token: this.jwtService.sign(payload),
      user: user[this.options.authenticationField!],
    };
  }

  async register(userDetails: RegisterDto): Promise<any> {
    const encryptedPassword = await this.options.hashingStrategy!(userDetails.password);
    let newUser = this.userRepository.create({ ...userDetails, password: encryptedPassword });
    newUser = await this.userRepository.save(newUser);
    return await this.login(newUser);
  }
  getAuthenticationField(): string {
    return this.options.authenticationField!;
  }
  getRegistrationFields(): string[] {
    return this.options.registrationFields!;
  }
}