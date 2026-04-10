import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dtos/signup.sto';
import { LogInDto } from './dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async signUp(dto: SignUpDto) {
    const user = await this.usersService.create(dto);
    const token = this.generateToken(user[0].id, user[0].email, user[0].role);
    return { user: user[0], token };
  }

  async me(userId: string) {
    const user = await this.usersService.findOne(userId);
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async logIn(dto: LogInDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        `Essa conta foi criada com ${user.provider}. Use o login social.`,
      );
    }

    const passwordValid = await this.usersService.validatePassword(
      dto.password,
      user.passwordHash,
    );

    if (!passwordValid) throw new UnauthorizedException('Credenciais inválidas.');

    const token = this.generateToken(user.id, user.email, user.role);
    return { user, token };
  }

  async oAuthLogin(user: { id: string; email: string; role: string }) {
    const token = this.generateToken(user.id, user.email, user.role);
    return { user, token };
  }

  private generateToken(userId: string, email: string, role: string) {
    return this.jwtService.sign({ sub: userId, email, role });
  }
}