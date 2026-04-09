import { eq } from 'drizzle-orm';
import { db } from '../../database';
import { tags } from '../../database/schemas/tag.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

export class TagsRepository {
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  async create(data: CreateTagDto) {
    const slug = this.generateSlug(data.name);

    const existing = await db.query.tags.findFirst({
      where: eq(tags.slug, slug),
    });

    if (existing) throw new ConflictException('Tag já existente.');

    return await db.insert(tags).values({
      name: data.name,
      slug,
    }).returning();
  }

  async findAll() {
    return await db.query.tags.findMany();
  }

  async findById(id: string) {
    const tag = await db.query.tags.findFirst({
      where: eq(tags.id, id),
    });

    if (!tag) throw new NotFoundException('Tag não encontrada.');

    return tag;
  }

  async findBySlug(slug: string) {
    const tag = await db.query.tags.findFirst({
      where: eq(tags.slug, slug),
    });

    if (!tag) throw new NotFoundException('Tag não encontrada.');

    return tag;
  }

  async update(id: string, data: UpdateTagDto) {
    await this.findById(id);

    const slug = data.name ? this.generateSlug(data.name) : undefined;

    if (slug) {
      const existing = await db.query.tags.findFirst({
        where: eq(tags.slug, slug),
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Já existe uma tag com esse nome.');
      }
    }

    return await db
      .update(tags)
      .set({
        ...(data.name && { name: data.name }),
        ...(slug && { slug }),
      })
      .where(eq(tags.id, id))
      .returning();
  }

  async delete(id: string) {
    await this.findById(id);

    await db.delete(tags).where(eq(tags.id, id));

    return { message: 'Tag deletada com sucesso.' };
  }
}