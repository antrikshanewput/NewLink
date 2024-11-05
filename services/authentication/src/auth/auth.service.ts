import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('AUTH_OPTIONS') readonly options: {
      authenticationField: string;
      registrationFields: string[];
      encryptionStrategy: (password: string) => Promise<string>;
    }
  ) { }

  async validateUser(authFieldValue: string, password: string): Promise<any> {

    const user = await this.findUserByAuthField(authFieldValue);
    if (user) {
      const encryptedPassword = await this.options.encryptionStrategy(password);
      if (user.password === encryptedPassword) {
        return user;
      }
    }
    return null;
  }

  async register(userDetails: any): Promise<any> {
    const encryptedPassword = await this.options.encryptionStrategy(userDetails.password);
    return { ...userDetails, password: encryptedPassword };
  }

  async findUserByAuthField(value: string): Promise<any> {

  }

  async login(user: any) {
    const payload = { [this.options.authenticationField]: user[this.options.authenticationField], sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}