import { Module } from '@nestjs/common';

import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import CoursesRepository from './cousers.repository';
import { CoursePostsRepository } from './course-post.repository';
import { AuthModule } from '../auth/auth.module';
import { CourseResourcesRepository } from './course-resources.repository';
import { CourseEnrollmentsRepository } from './course-enrollments.repository';
import { EnrollmentGuard } from './guards/enrollment.guard';

@Module({
  imports: [AuthModule],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    CoursesRepository,
    CoursePostsRepository,
    CourseResourcesRepository,
    CourseEnrollmentsRepository,
    EnrollmentGuard,
  ],
  exports: [
    CoursesRepository,
    CourseEnrollmentsRepository,
    EnrollmentGuard,
  ],
})
export class CoursesModule {}