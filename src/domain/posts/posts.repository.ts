import { and, eq, ilike, inArray, ne, or, sql } from 'drizzle-orm';
import { db } from '../../database';
import { posts } from '../../database/schemas/post.schema';
import { postTags } from '../../database/schemas/post-tags.schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { categories } from '../../database/schemas';

export class PostsRepository {
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  async incrementViews(postId: string) {
  const [updated] = await db
    .update(posts)
    .set({
      views: sql`${posts.views} + 1`,
    })
    .where(eq(posts.id, postId))
    .returning({ views: posts.views });

  return updated?.views ?? 0;
}

  async create(data: CreatePostDto, authorId: string) {
    const slug = this.generateSlug(data.title);

    const existing = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
    });

    if (existing) {
      throw new ConflictException("Já existe um post com esse título.");
    }

    const [post] = await db
      .insert(posts)
      .values({
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        coverImagePublicId: data.coverImagePublicId,
        readTime: data.readTime,
        categoryId: data.categoryId,
        status: data.status ?? "DRAFT",
        authorId,
      })
      .returning();

    if (data.tagIds?.length) {
      await db.insert(postTags).values(
        data.tagIds.map((tagId) => ({
          postId: post.id,
          tagId,
        }))
      );
    }

    return this.findById(post.id);
  }
  async findAll({ page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      db.query.posts.findMany({
        with: {
          author: { columns: { passwordHash: false } },
          category: true,
          postTags: { with: { tag: true } },
        },
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
        limit,
        offset,
      }),
      db.$count(posts),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,  // ← adiciona
        hasPrevPage: page > 1,           // ← adiciona
      },
    };
  }

  async findById(id: string) {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        author: { columns: { passwordHash: false } },
        category: true,
        postTags: { with: { tag: true } },
      },
    });

    if (!post) throw new NotFoundException('Post não encontrado.');

    return post;
  }

  async findAllPublished(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [data, total] = await Promise.all([
      db.query.posts.findMany({
        where: eq(posts.status, 'PUBLISHED'),
        with: {
          author: { columns: { passwordHash: false } },
          category: true,
          postTags: { with: { tag: true } },
        },
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
        limit,
        offset,
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(posts)
        .where(eq(posts.status, 'PUBLISHED'))
        .then((res) => res[0].count),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findBySlug(slug: string) {
    const post = await db.query.posts.findFirst({
      where: and(
        eq(posts.slug, slug),
        eq(posts.status, 'PUBLISHED' as const),
      ),
      with: {
        author: { columns: { passwordHash: false } },
        category: true,
        postTags: { with: { tag: true } },
      },
    });

    if (!post) throw new NotFoundException('Post não encontrado.');
    return post;
  }

  async findRelated(slug: string, limit = 4) {
    // busca o post de referência
    const reference = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
      with: { postTags: true },
    });

    if (!reference) throw new NotFoundException('Post não encontrado.');

    const tagIds = reference.postTags.map((pt) => pt.tagId);

    // busca posts que compartilham categoria ou tag
    const related = await db.query.posts.findMany({
      where: and(
        ne(posts.id, reference.id),
        eq(posts.status, 'PUBLISHED'),
        or(
          eq(posts.categoryId, reference.categoryId),
          tagIds.length ? inArray(
            posts.id,
            db.select({ id: postTags.postId })
              .from(postTags)
              .where(inArray(postTags.tagId, tagIds))
          ) : undefined,
        ),
      ),
      with: {
        author: { columns: { passwordHash: false } },
        category: true,
        postTags: { with: { tag: true } },
      },
      limit,
    });

    // ordena: posts com mais matches (categoria + tag) primeiro
    return related.sort((a, b) => {
      const score = (post: typeof a) => {
        let s = 0;
        if (post.categoryId === reference.categoryId) s += 2;
        const postTagIds = post.postTags.map((pt) => pt.tagId);
        s += postTagIds.filter((id) => tagIds.includes(id)).length;
        return s;
      };
      return score(b) - score(a);
    });
  }

  async search(query: string) {
    return await db.query.posts.findMany({
      where: and(
        eq(posts.status, 'PUBLISHED' as const),
        or(
          ilike(posts.title, `%${query}%`),
          ilike(posts.excerpt, `%${query}%`),
          ilike(posts.content, `%${query}%`),
        ),
      ),
      with: {
        author: { columns: { passwordHash: false } },
        category: true,
        postTags: { with: { tag: true } },
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      limit: 10,
    });
  }

  async findByCategory(categorySlug: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
    });

    if (!category) throw new NotFoundException('Categoria não encontrada.');

    const [data, total] = await Promise.all([
      db.query.posts.findMany({
        where: and(
          eq(posts.categoryId, category.id),
          eq(posts.status, 'PUBLISHED' as const),
        ),
        with: {
          author: { columns: { passwordHash: false } },
          category: true,
          postTags: { with: { tag: true } },
        },
        orderBy: (posts, { desc }) => [desc(posts.createdAt)],
        limit,
        offset,
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(posts)
        .innerJoin(categories, eq(posts.categoryId, categories.id))
        .where(and(
          eq(categories.slug, categorySlug),
          eq(posts.status, 'PUBLISHED' as const),
        ))
        .then((res) => res[0].count),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async update(id: string, data: UpdatePostDto) {
    await this.findById(id);

    const slug = data.title ? this.generateSlug(data.title) : undefined;

    if (slug) {
      const existing = await db.query.posts.findFirst({
        where: eq(posts.slug, slug),
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Já existe um post com esse título.');
      }
    }

    await db
      .update(posts)
      .set({
        ...(data.title && { title: data.title }),
        ...(slug && { slug }),
        ...(data.excerpt && { excerpt: data.excerpt }),
        ...(data.content && { content: data.content }),
        ...(data.coverImage && { coverImage: data.coverImage }),
        ...(data.coverImagePublicId && { coverImagePublicId: data.coverImagePublicId }),
        ...(data.readTime && { readTime: data.readTime }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.status && { status: data.status }),
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    if (data.tagIds) {
      await db.delete(postTags).where(eq(postTags.postId, id));

      if (data.tagIds.length) {
        await db.insert(postTags).values(
          data.tagIds.map((tagId) => ({ postId: id, tagId })),
        );
      }
    }

    return this.findById(id);
  }

  async delete(id: string) {
    await this.findById(id);

    await db.delete(posts).where(eq(posts.id, id));

    return { message: 'Post deletado com sucesso.' };
  }
}