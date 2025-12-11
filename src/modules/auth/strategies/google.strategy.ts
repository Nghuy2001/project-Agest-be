import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('clientId')!,
      clientSecret: configService.get<string>('clientSecret')!,
      callbackURL: configService.get<string>('callbackUrl')!,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ) {
    if (!profile || !profile.id) {
      return done(new Error('Google profile not found'));
    }

    const user = {
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      avatar: profile.photos?.[0]?.value,
      provider: 'google',
      providerId: profile.id,
    };

    done(null, user);
  }
}
