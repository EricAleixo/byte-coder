import { Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
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

  async findByCourse(courseId: string) {
    return db
      .select()
      .from(coursePosts)
      .where(eq(coursePosts.courseId, courseId));
  }
}