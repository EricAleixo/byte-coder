import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import CoursesRepository from '../courses/cousers.repository';
import { CourseEnrollmentsRepository } from '../courses/course-enrollments.repository';
import { CourseLessonProgressRepository } from '../courses/course-lesson-progress.repository';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly coursesRepo: CoursesRepository,
    private readonly enrollmentsRepo: CourseEnrollmentsRepository,
    private readonly progressRepo: CourseLessonProgressRepository,
  ) {}

  async enroll(userId: string, courseId: string) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw new NotFoundException('Curso não encontrado');

    const existing = await this.enrollmentsRepo.findByUserAndCourse(userId, courseId);
    if (existing) throw new ConflictException('Você já está inscrito neste curso');

    return this.enrollmentsRepo.create(userId, courseId);
  }

  async unenroll(userId: string, courseId: string) {
    await this.enrollmentsRepo.remove(userId, courseId);
  }

  async getEnrollmentStatus(userId: string, courseId: string) {
    const enrollment = await this.enrollmentsRepo.findByUserAndCourse(userId, courseId);
    return { enrolled: !!enrollment };
  }

  async findMyCourses(userId: string) {
    const enrollments = await this.enrollmentsRepo.findCoursesByUser(userId);
    const courseIds = enrollments.map((e) => e.course.id);

    const [completedCounts, totalCounts] = await Promise.all([
      this.progressRepo.countCompletedPerCourse(userId, courseIds),
      this.coursesRepo.countLessonsByCourseIds(courseIds),
    ]);

    return enrollments.map((e) => {
      const total = totalCounts[e.course.id] ?? 0;
      const completed = completedCounts[e.course.id] ?? 0;
      return {
        ...e.course,
        enrolledAt: e.enrolledAt,
        progress: {
          completed,
          total,
          percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
      };
    });
  }

  async getCourseProgress(userId: string, courseId: string) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw new NotFoundException('Curso não encontrado');
    const completedLessonIds = await this.progressRepo.findCompletedLessonIds(userId, courseId);
    return { completedLessonIds };
  }

  async completeLesson(userId: string, courseId: string, lessonId: string) {
    await this.ensureLessonBelongsToCourse(courseId, lessonId);
    return this.progressRepo.markComplete(userId, courseId, lessonId);
  }

  async uncompleteLesson(userId: string, courseId: string, lessonId: string) {
    await this.ensureLessonBelongsToCourse(courseId, lessonId);
    await this.progressRepo.markIncomplete(userId, lessonId);
  }

  private async ensureLessonBelongsToCourse(courseId: string, lessonId: string) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw new NotFoundException('Curso não encontrado');
    if (!course.lessons.some((l) => l.id === lessonId)) {
      throw new NotFoundException('Aula não encontrada neste curso');
    }
  }
}