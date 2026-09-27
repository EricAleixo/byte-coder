import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import CoursesRepository from '../cousers.repository';
import { CourseEnrollmentsRepository } from '../course-enrollments.repository';
import { Role } from '../../auth/enums/role';

export const NOT_ENROLLED_MESSAGE =
  'Este conteúdo é exclusivo para alunos inscritos. Inscreva-se gratuitamente no curso para liberar as aulas.';

/**
 * Libera a rota só pra quem está inscrito no curso (admins passam direto).
 * Deve rodar depois do JwtGuard. Resolve o curso por `:courseId` ou `:slug`.
 */
@Injectable()
export class EnrollmentGuard implements CanActivate {
  constructor(
    private readonly coursesRepo: CoursesRepository,
    private readonly enrollmentsRepo: CourseEnrollmentsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException(NOT_ENROLLED_MESSAGE);
    if (user.role === Role.ADMIN) return true;

    const { courseId, slug } = request.params;
    let resolvedCourseId: string | undefined = courseId;

    if (!resolvedCourseId && slug) {
      const course = await this.coursesRepo.findBySlug(slug);
      if (!course) throw new NotFoundException('Curso não encontrado');
      resolvedCourseId = course.id;
    }
    if (!resolvedCourseId) throw new ForbiddenException(NOT_ENROLLED_MESSAGE);

    const enrollment = await this.enrollmentsRepo.findByUserAndCourse(user.sub, resolvedCourseId);
    if (!enrollment) throw new ForbiddenException(NOT_ENROLLED_MESSAGE);

    return true;
  }
}
