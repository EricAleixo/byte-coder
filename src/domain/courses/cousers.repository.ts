import { Injectable } from '@nestjs/common';
import { and, asc, eq, inArray } from 'drizzle-orm';
import {
  courses,
  posts,
  coursePosts,
  courseResources,
  courseOutcomes,
  courseLessons,
  NewCourse,
  NewCourseResource,
  NewCourseOutcome,
  NewCourseLesson,
  CourseOutcome,
  CourseResource,
  NewCourseLessonResource,
  courseLessonResources,
} from '../../database/schemas';
import { db } from '../../database';
import { CourseResourceDto } from './dto/create-course-resource.dto';

@Injectable()
class CoursesRepository {
  async findAll() {
    return db.select().from(courses).orderBy(asc(courses.createdAt));
  }

  async findLessonResources(lessonId: string) {
    return db
      .select()
      .from(courseLessonResources)
      .where(eq(courseLessonResources.lessonId, lessonId));
  }

  async countLessonsByCourseIds(courseIds: string[]): Promise<Record<string, number>> {
    if (courseIds.length === 0) return {};
    const rows = await db
      .select({ courseId: courseLessons.courseId })
      .from(courseLessons)
      .where(inArray(courseLessons.courseId, courseIds));
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.courseId] = (counts[r.courseId] ?? 0) + 1;
    return counts;
  }

  async addLessonResource(
    lessonId: string,
    data: Omit<NewCourseLessonResource, 'lessonId'>,
  ) {
    const [resource] = await db
      .insert(courseLessonResources)
      .values({ ...data, lessonId })
      .returning();
    return resource;
  }

  async removeLessonResource(lessonId: string, resourceId: string) {
    await db
      .delete(courseLessonResources)
      .where(
        and(
          eq(courseLessonResources.id, resourceId),
          eq(courseLessonResources.lessonId, lessonId),
        ),
      );
  }

  async findBySlug(slug: string) {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1);
    if (!course) return null;

    const [resources, outcomes, lessons] = await Promise.all([
      db
        .select()
        .from(courseResources)
        .where(eq(courseResources.courseId, course.id)),
      db
        .select()
        .from(courseOutcomes)
        .where(eq(courseOutcomes.courseId, course.id))
        .orderBy(asc(courseOutcomes.order)),
      db
        .select()
        .from(courseLessons)
        .where(eq(courseLessons.courseId, course.id))
        .orderBy(asc(courseLessons.order)),
    ]);

    return { ...course, resources, outcomes, lessons };
  }

  async findById(id: string) {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);
    if (!course) return null;

    const [resources, outcomes, lessons] = await Promise.all([
      db
        .select()
        .from(courseResources)
        .where(eq(courseResources.courseId, course.id)),
      db
        .select()
        .from(courseOutcomes)
        .where(eq(courseOutcomes.courseId, course.id))
        .orderBy(asc(courseOutcomes.order)),
      db
        .select()
        .from(courseLessons)
        .where(eq(courseLessons.courseId, course.id))
        .orderBy(asc(courseLessons.order)),
    ]);

    return { ...course, resources, outcomes, lessons };
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

  async findLessonsByCourseId(courseId: string) {
    const lessons = await db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.courseId, courseId))
      .orderBy(asc(courseLessons.order));

    const lessonIds = lessons.map((l) => l.id);
    if (lessonIds.length === 0) return lessons.map((l) => ({ ...l, resources: [] }));

    const allResources = await db
      .select()
      .from(courseLessonResources)
      .where(inArray(courseLessonResources.lessonId, lessonIds));

    return lessons.map((lesson) => ({
      ...lesson,
      resources: allResources.filter((r) => r.lessonId === lesson.id),
    }));
  }

  async create(
    data: NewCourse,
    resources: Omit<NewCourseResource, 'courseId'>[] = [],
    outcomes: Omit<NewCourseOutcome, 'courseId'>[] = [],
    lessons: Omit<NewCourseLesson, 'courseId'>[] = [],
  ) {
    return db.transaction(async (tx) => {
      const [course] = await tx.insert(courses).values(data).returning();

      const [insertedResources, insertedOutcomes, insertedLessons] =
        await Promise.all([
          resources.length > 0
            ? tx
              .insert(courseResources)
              .values(resources.map((r) => ({ ...r, courseId: course.id })))
              .returning()
            : Promise.resolve([]),
          outcomes.length > 0
            ? tx
              .insert(courseOutcomes)
              .values(outcomes.map((o) => ({ ...o, courseId: course.id })))
              .returning()
            : Promise.resolve([]),
          lessons.length > 0
            ? tx
              .insert(courseLessons)
              .values(lessons.map((l) => ({ ...l, courseId: course.id })))
              .returning()
            : Promise.resolve([]),
        ]);

      return {
        ...course,
        resources: insertedResources,
        outcomes: insertedOutcomes,
        lessons: insertedLessons,
      };
    });
  }

  async update(
    id: string,
    data: Partial<NewCourse>,
    resources?: Omit<NewCourseResource, 'courseId'>[],
    outcomes?: Omit<NewCourseOutcome, 'courseId'>[],
  ) {
    return db.transaction(async (tx) => {
      const [course] = await tx
        .update(courses)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(courses.id, id))
        .returning();
      if (!course) return null;

      // resources/outcomes: substitui tudo (delete + re-insert) quando o array vier,
      // mantém o que já existe quando o parâmetro não é passado.
      // OBS: lessons NÃO segue esse padrão de propósito — vídeo/aula é conteúdo
      // "pesado" e delete+reinsert perderia o id a cada edição. Use addLesson/
      // updateLesson/removeLesson/reorderLessons abaixo.
      let finalResources: CourseResource[] | undefined = undefined;
      if (resources) {
        await tx
          .delete(courseResources)
          .where(eq(courseResources.courseId, id));
        finalResources =
          resources.length > 0
            ? await tx
              .insert(courseResources)
              .values(resources.map((r) => ({ ...r, courseId: id })))
              .returning()
            : [];
      }

      let finalOutcomes: CourseOutcome[] | undefined = undefined;
      if (outcomes) {
        await tx.delete(courseOutcomes).where(eq(courseOutcomes.courseId, id));
        finalOutcomes =
          outcomes.length > 0
            ? await tx
              .insert(courseOutcomes)
              .values(outcomes.map((o) => ({ ...o, courseId: id })))
              .returning()
            : [];
      }

      return {
        ...course,
        ...(finalResources !== undefined && { resources: finalResources }),
        ...(finalOutcomes !== undefined && { outcomes: finalOutcomes }),
      };
    });
  }

  async delete(id: string) {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // ── Lessons (CRUD dedicado) ──────────────────────────────────────

  async addLesson(courseId: string, data: Omit<NewCourseLesson, 'courseId'>) {
    const [lesson] = await db
      .insert(courseLessons)
      .values({ ...data, courseId })
      .returning();
    return lesson;
  }

  async updateLesson(
    courseId: string,
    lessonId: string,
    data: Partial<Omit<NewCourseLesson, 'courseId'>>,
  ) {
    const [lesson] = await db
      .update(courseLessons)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(courseLessons.id, lessonId),
          eq(courseLessons.courseId, courseId),
        ),
      )
      .returning();
    return lesson ?? null;
  }

  async removeLesson(courseId: string, lessonId: string) {
    await db
      .delete(courseLessons)
      .where(
        and(
          eq(courseLessons.id, lessonId),
          eq(courseLessons.courseId, courseId),
        ),
      );
  }

  /**
   * Reordena todas as lessons de um curso a partir de uma lista ordenada de ids.
   * Usa um passo intermediário com "order" negativo pra nunca colidir com a
   * constraint UNIQUE(course_id, order) durante a troca — mesmo padrão do
   * reorder de coursePosts.
   */
  async reorderLessons(courseId: string, orderedLessonIds: string[]) {
    return db.transaction(async (tx) => {
      for (let i = 0; i < orderedLessonIds.length; i++) {
        await tx
          .update(courseLessons)
          .set({ order: -(i + 1) })
          .where(
            and(
              eq(courseLessons.courseId, courseId),
              eq(courseLessons.id, orderedLessonIds[i]),
            ),
          );
      }

      for (let i = 0; i < orderedLessonIds.length; i++) {
        await tx
          .update(courseLessons)
          .set({ order: i + 1 })
          .where(
            and(
              eq(courseLessons.courseId, courseId),
              eq(courseLessons.id, orderedLessonIds[i]),
            ),
          );
      }

      return tx
        .select()
        .from(courseLessons)
        .where(eq(courseLessons.courseId, courseId))
        .orderBy(asc(courseLessons.order));
    });
  }

  async syncCourseResources(
    courseId: string,
    resources: CourseResourceDto[],
  ) {
    return db.transaction(async (tx) => {
      const currentResources = await tx
        .select()
        .from(courseResources)
        .where(eq(courseResources.courseId, courseId));

      const currentIds = new Set(
        currentResources.map((resource) => resource.id),
      );

      const incomingIds = new Set(
        resources
          .filter((resource) => resource.id)
          .map((resource) => resource.id!),
      );

      // DELETE
      const idsToDelete = currentResources
        .filter((resource) => !incomingIds.has(resource.id))
        .map((resource) => resource.id);

      if (idsToDelete.length > 0) {
        await tx
          .delete(courseResources)
          .where(
            inArray(courseResources.id, idsToDelete),
          );
      }

      // INSERT / UPDATE
      for (const resource of resources) {
        // Novo
        if (!resource.id) {
          await tx.insert(courseResources).values({
            courseId,
            label: resource.label,
            url: resource.url,
            type: resource.type,
          });

          continue;
        }

        // Não pertence aos recursos atuais
        if (!currentIds.has(resource.id)) {
          continue;
        }

        // Existente → UPDATE
        await tx
          .update(courseResources)
          .set({
            label: resource.label,
            url: resource.url,
            type: resource.type,
          })
          .where(
            eq(courseResources.id, resource.id),
          );
      }

      // Estado final
      return tx
        .select()
        .from(courseResources)
        .where(eq(courseResources.courseId, courseId));
    });
  }
}

export default CoursesRepository;