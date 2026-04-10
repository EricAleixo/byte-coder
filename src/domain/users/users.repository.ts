import { eq, and } from 'drizzle-orm';
import { db } from '../../database';
import { users } from '../../database/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

export class UserRepository {
  async create(data: CreateUserDto & { passwordHash: string }) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existing) throw new ConflictException('Usuário já existente.');

    return await db.insert(users).values({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      avatarUrl: data.avatarUrl,
      role: data.role,
    }).returning();
  }

  async findByProviderId(provider: 'google' | 'github', providerId: string) {
    return db
      .select()
      .from(users)
      .where(and(eq(users.provider, provider), eq(users.providerId, providerId)))
      .then(r => r[0] ?? null);
  }

  async createOAuthUser(profile: {
    email: string;
    name: string;
    provider: 'google' | 'github';
    providerId: string;
  }) {
    return db
      .insert(users)
      .values({ ...profile, role: 'BASIC' })
      .returning()
      .then(r => r[0]);
  }

  async findAll() {
    return await db.query.users.findMany();
  }

  async findById(id: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return user;
  }

  // users.repository.ts
  async findByEmail(email: string) {
    return db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then(r => r[0] ?? null);
  }

  async update(id: string, data: UpdateUserDto & { passwordHash?: string }) {
    await this.findById(id);

    return await db
      .update(users)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.passwordHash !== undefined && { passwordHash: data.passwordHash }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.avatarPublicId !== undefined && { avatarPublicId: data.avatarPublicId }),
        ...(data.role !== undefined && { role: data.role }),
      })
      .where(eq(users.id, id))
      .returning();
  }

  async delete(id: string) {
    await this.findById(id);

    await db.delete(users).where(eq(users.id, id));

    return { message: 'Usuário deletado com sucesso.' };
  }
}