import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('AUTH_OPTIONS') readonly options: {
      authenticationField: string;
      registrationFields: string[];
      encryptionStrategy: (password: string) => Promise<string>;
    },
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async findUserByAuthField(value: string): Promise<User | null> {
    const field = this.options.authenticationField;
    const user = await this.userRepository.findOne({ where: { [field]: value } });
    return user || null;
  }

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

  async login(user: any) {
    const payload = { [this.options.authenticationField]: user[this.options.authenticationField], sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userDetails: any): Promise<any> {
    const encryptedPassword = await this.options.encryptionStrategy(userDetails.password);
    const newUser = this.userRepository.create({ ...userDetails, password: encryptedPassword });
    return await this.userRepository.save(newUser);
  }
}