import { eq } from 'drizzle-orm';
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

  async findByEmail(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return user;
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