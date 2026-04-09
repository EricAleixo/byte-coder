import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/signup.sto';
import { LogInDto } from './dtos/login.dto';
import { JwtGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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
}