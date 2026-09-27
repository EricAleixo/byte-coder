import { Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
import { courseLessonProgress } from '../../database/schemas';
import { db } from '../../database';

@Injectable()
export class CourseLessonProgressRepository {
  async findCompletedLessonIds(userId: string, courseId: string): Promise<string[]> {
    const rows = await db
      .select({ lessonId: courseLessonProgress.lessonId })
      .from(courseLessonProgress)
      .where(and(eq(courseLessonProgress.userId, userId), eq(courseLessonProgress.courseId, courseId)));
    return rows.map((r) => r.lessonId);
  }

  async markComplete(userId: string, courseId: string, lessonId: string) {
    const [row] = await db
      .insert(courseLessonProgress)
      .values({ userId, courseId, lessonId })
      .onConflictDoNothing({ target: [courseLessonProgress.userId, courseLessonProgress.lessonId] })
      .returning();
    return row ?? null;
  }

  async markIncomplete(userId: string, lessonId: string) {
    await db
      .delete(courseLessonProgress)
      .where(and(eq(courseLessonProgress.userId, userId), eq(courseLessonProgress.lessonId, lessonId)));
  }

  async countCompletedPerCourse(userId: string, courseIds: string[]): Promise<Record<string, number>> {
    if (courseIds.length === 0) return {};
    const rows = await db
      .select({ courseId: courseLessonProgress.courseId })
      .from(courseLessonProgress)
      .where(and(eq(courseLessonProgress.userId, userId), inArray(courseLessonProgress.courseId, courseIds)));
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.courseId] = (counts[r.courseId] ?? 0) + 1;
    return counts;
  }
}