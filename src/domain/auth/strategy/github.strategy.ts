// auth/strategies/github.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly usersService: UsersService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!, // ex: http://localhost:3000/auth/github/callback
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: Function,
  ) {
    const user = await this.usersService.findOrCreateOAuthUser({
      email: profile.emails[0].value,
      name: profile.displayName || profile.username,
      provider: 'github',
      providerId: profile.id.toString(),
      avatarUrl: profile.photos?.[0]?.value,
    });

    done(null, user);
  }
}