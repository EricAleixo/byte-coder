import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { courseEnrollments, courses } from '../../database/schemas';
import { db } from '../../database';

@Injectable()
export class CourseEnrollmentsRepository {
  async findByUserAndCourse(userId: string, courseId: string) {
    const [row] = await db
      .select()
      .from(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)))
      .limit(1);
    return row ?? null;
  }

  async create(userId: string, courseId: string) {
    const [row] = await db.insert(courseEnrollments).values({ userId, courseId }).returning();
    return row;
  }

  async remove(userId: string, courseId: string) {
    await db
      .delete(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)));
  }

  async findCoursesByUser(userId: string) {
    return db
      .select({
        enrolledAt: courseEnrollments.createdAt,
        course: courses,
      })
      .from(courseEnrollments)
      .innerJoin(courses, eq(courses.id, courseEnrollments.courseId))
      .where(eq(courseEnrollments.userId, userId));
  }
}