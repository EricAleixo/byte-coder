import { desc, eq } from 'drizzle-orm';
import { db } from '../../database';
import { categories } from '../../database/schemas/category.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { posts } from '../../database/schemas';

export class CategoriesRepository {
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  async create(data: CreateCategoryDto) {
    const slug = this.generateSlug(data.name);

    const existing = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });

    if (existing) throw new ConflictException('Categoria já existente.');

    return await db.insert(categories).values({
      name: data.name,
      color: data.color,
      icon: data.icon,
      slug,
    }).returning();
  }

  async findAll() {
    return await db.query.categories.findMany();
  }

  async findById(id: string) {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, id),
    });

    if (!category) throw new NotFoundException('Categoria não encontrada.');

    return category;
  }

  async findBySlug(slug: string) {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });

    if (!category) throw new NotFoundException('Categoria não encontrada.');

    return category;
  }

  async findWithPosts(limit: number) {
    return await db.query.categories.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        color: true,
        icon: true,
      },
      with: {
        posts: {
          columns: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            coverImage: true,
            publishedAt: true,
            createdAt: true,
            readTime: true,
            updatedAt: true
          },
          where: eq(posts.status, "PUBLISHED"),
          orderBy: desc(posts.publishedAt),
          limit: limit,
          with: {
            postTags: {
              with: {
                tag: {
                  columns: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            category: {
              columns: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
            author: {
              columns: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateCategoryDto) {
    await this.findById(id);

    const slug = data.name ? this.generateSlug(data.name) : undefined;

    if (slug) {
      const existing = await db.query.categories.findFirst({
        where: eq(categories.slug, slug),
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Já existe uma categoria com esse nome.');
      }
    }

    return await db
      .update(categories)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.color && { color: data.color }),
        ...(data.icon && { icon: data.icon }),
        ...(slug && { slug }),
      })
      .where(eq(categories.id, id))
      .returning();
  }

  async delete(id: string) {
    await this.findById(id);

    await db.delete(categories).where(eq(categories.id, id));

    return { message: 'Categoria deletada com sucesso.' };
  }
}