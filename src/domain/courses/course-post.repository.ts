import { Injectable } from "@nestjs/common";
import { and, eq, asc } from "drizzle-orm";
import { NewCoursePost, coursePosts } from "../../database/schemas";
import { db } from "../../database";

@Injectable()
export class CoursePostsRepository {

  async addPost(data: NewCoursePost) {
    const [entry] = await db
      .insert(coursePosts)
      .values(data)
      .returning();
    return entry;
  }

  async removePost(courseId: string, postId: string) {
    await db
      .delete(coursePosts)
      .where(
        and(
          eq(coursePosts.courseId, courseId),
          eq(coursePosts.postId, postId)
        )
      );
  }

  async updatePosition(courseId: string, postId: string, position: number) {
    const [entry] = await db
      .update(coursePosts)
      .set({ position })
      .where(
        and(
          eq(coursePosts.courseId, courseId),
          eq(coursePosts.postId, postId)
        )
      )
      .returning();
    return entry ?? null;
  }

  async reorder(courseId: string, orderedPostIds: string[]) {
    return db.transaction(async (tx) => {
      // passo 1: move tudo pra positions temporárias negativas,
      // fora da faixa real (1, 2, 3...) — evita colisão com a constraint
      // enquanto ainda não sabemos a posição final de cada linha
      for (let i = 0; i < orderedPostIds.length; i++) {
        await tx
          .update(coursePosts)
          .set({ position: -(i + 1) })
          .where(
            and(
              eq(coursePosts.courseId, courseId),
              eq(coursePosts.postId, orderedPostIds[i]),
            ),
          );
      }

      // passo 2: agora que nenhuma linha ocupa a faixa positiva,
      // atribui as positions finais sem risco de conflito
      for (let i = 0; i < orderedPostIds.length; i++) {
        await tx
          .update(coursePosts)
          .set({ position: i + 1 })
          .where(
            and(
              eq(coursePosts.courseId, courseId),
              eq(coursePosts.postId, orderedPostIds[i]),
            ),
          );
      }

      return tx
        .select()
        .from(coursePosts)
        .where(eq(coursePosts.courseId, courseId))
        .orderBy(asc(coursePosts.position));
    });
  }

  async findByCourse(courseId: string) {
    return db
      .select()
      .from(coursePosts)
      .where(eq(coursePosts.courseId, courseId));
  }
}