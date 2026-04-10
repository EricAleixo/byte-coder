import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './users.repository';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UploadImageService } from '../upload-image/upload-image.service';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly uploadService: UploadImageService
  ) { }

  async create(createUserDto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(createUserDto.password, SALT_ROUNDS);
    return this.userRepository.create({ ...createUserDto, passwordHash });
  }

  async findOrCreateOAuthUser(profile: {
    email: string;
    name: string;
    provider: 'google' | 'github';
    providerId: string;
    avatarUrl?: string; // ← URL da foto vinda do provider
  }) {
    let user = await this.userRepository.findByProviderId(
      profile.provider,
      profile.providerId,
    );

    if (!user) {
      user = await this.userRepository.findByEmail(profile.email);
    }

    if (!user) {
      let avatarUrl: string | undefined;
      let avatarPublicId: string | undefined;

      // Faz upload da foto do provider para o Cloudinary
      if (profile.avatarUrl) {
        const upload = await this.uploadService.uploadFromUrl(
          profile.avatarUrl,
          'avatars',
        );
        avatarUrl = upload.url;
        avatarPublicId = upload.public_id;
      }

      user = await this.userRepository.createOAuthUser({
        ...profile,
        avatarUrl,
        avatarPublicId,
      });
    }

    return user;
  }

  findAll() {
    return this.userRepository.findAll();
  }

  findOne(id: string) {
    return this.userRepository.findById(id);
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const passwordHash = updateUserDto.password
      ? await bcrypt.hash(updateUserDto.password, SALT_ROUNDS)
      : undefined;
    return this.userRepository.update(id, { ...updateUserDto, passwordHash });
  }

  remove(id: string) {
    return this.userRepository.delete(id);
  }

  async updateProfile(id: string, body: any, file?: Express.Multer.File) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const data: {
      name?: string;
      avatarUrl?: string;
      avatarPublicId?: string;
      passwordHash?: string;
    } = {};

    // 🔹 Nome
    if (body.name !== undefined) {
      data.name = body.name;
    }

    // 🔹 Avatar
    if (file) {
      if (user.avatarPublicId) {
        await this.uploadService.delete(user.avatarPublicId);
      }
      const upload = await this.uploadService.upload(file, 'avatars');
      data.avatarUrl = upload.url;
      data.avatarPublicId = upload.public_id;
    }

    // 🔹 Senha — bloqueado para usuários OAuth
    if (body.newPassword) {
      if (!user.passwordHash) {
        throw new BadRequestException(
          `Conta criada com ${user.provider}. Não é possível definir uma senha.`,
        );
      }

      if (!body.currentPassword) {
        throw new BadRequestException('Senha atual obrigatória');
      }

      const isValid = await this.validatePassword(
        body.currentPassword,
        user.passwordHash,
      );

      if (!isValid) {
        throw new BadRequestException('Senha atual inválida');
      }

      data.passwordHash = await bcrypt.hash(body.newPassword, SALT_ROUNDS);
    }

    // 🔹 Se nada foi enviado
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Nenhum dado para atualizar');
    }

    return this.userRepository.update(id, data);
  }

  validatePassword(plainPassword: string, passwordHash: string) {
    return bcrypt.compare(plainPassword, passwordHash);
  }
}