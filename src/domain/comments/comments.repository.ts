import { Injectable } from "@nestjs/common";
import { and, eq, isNull, desc } from "drizzle-orm";
import { comments, NewComment } from "../../database/schemas";
import { db } from "../../database";

@Injectable()
export class CommentsRepository {

  async create(data: NewComment) {
    const [comment] = await db
      .insert(comments)
      .values(data)
      .returning();

    return comment;
  }

  async findByPost(postId: string) {
    return db.query.comments.findMany({
      where: and(
        eq(comments.postId, postId),
        isNull(comments.parentId)
      ),
      orderBy: desc(comments.createdAt),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        replies: {
          orderBy: desc(comments.createdAt),
          with: {
            author: {
              columns: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return db.query.comments.findFirst({
      where: eq(comments.id, id),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async update(id: string, data: Partial<NewComment>) {
    if (!Object.keys(data).length) return null;
    
    const [updated] = await db
      .update(comments)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning();

    return updated;
  }

  async delete(id: string) {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async findReplies(parentId: string) {
    return db.query.comments.findMany({
      where: eq(comments.parentId, parentId),
      orderBy: desc(comments.createdAt),
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}