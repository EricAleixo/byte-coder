import { Controller, Post, Body, Get, UseGuards, Request, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/signup.sto';
import { LogInDto } from './dtos/login.dto';
import { JwtGuard } from './guards/jwt.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  signIn(@Body() dto: LogInDto) {
    return this.authService.logIn(dto);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@Request() req: any) {
    return this.authService.me(req.user.sub);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const { token } = await this.authService.oAuthLogin(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }

  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubLogin() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req, @Res() res: Response) {
    const { token } = await this.authService.oAuthLogin(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
}