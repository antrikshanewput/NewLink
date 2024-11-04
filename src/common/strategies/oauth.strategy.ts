import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '../../config/services/config.service';

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, 'oauth') {
  constructor(configService: ConfigService) {
    super({
      authorizationURL: configService.get('OAUTH_AUTHORIZATION_URL'),
      tokenURL: configService.get('OAUTH_TOKEN_URL'),
      clientID: configService.get('OAUTH_CLIENT_ID'),
      clientSecret: configService.get('OAUTH_CLIENT_SECRET'),
      callbackURL: configService.get('OAUTH_CALLBACK_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return { accessToken, profile };
  }
}