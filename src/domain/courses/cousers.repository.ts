import { Injectable } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { courses, posts, coursePosts, NewCourse } from "../../database/schemas";
import { db } from "../../database";


@Injectable()
export class CoursesRepository {

  async findAll() {
    return db.select().from(courses).orderBy(asc(courses.createdAt));
  }

  async findBySlug(slug: string) {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1);
    return course ?? null;
  }

  async findById(id: string) {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    return course ?? null;
  }

  async findPostsByCourseId(courseId: string) {
    return db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        excerpt: posts.excerpt,
        readTime: posts.readTime,
        coverImage: posts.coverImage,
        status: posts.status,
        position: coursePosts.position,
      })
      .from(coursePosts)
      .innerJoin(posts, eq(posts.id, coursePosts.postId))
      .where(eq(coursePosts.courseId, courseId))
      .orderBy(asc(coursePosts.position));
  }

  async create(data: NewCourse) {
    const [course] = await db
      .insert(courses)
      .values(data)
      .returning();
    return course;
  }

  async update(id: string, data: Partial<NewCourse>) {
    const [course] = await db
      .update(courses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return course ?? null;
  }

  async delete(id: string) {
    await db.delete(courses).where(eq(courses.id, id));
  }
}