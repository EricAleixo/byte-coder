import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { GoogleStrategy } from './strategy/google.strategy';
import { GithubStrategy } from './strategy/github.strategy';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard, RolesGuard, GoogleStrategy, GithubStrategy],
  exports: [AuthService, JwtGuard, RolesGuard, JwtModule],
})
export class AuthModule {}