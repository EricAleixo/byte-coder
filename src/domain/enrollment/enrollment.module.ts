import { Module } from '@nestjs/common';
import { EnrollmentsController } from './enrollment.controller';
import { EnrollmentsService } from './enrollment.service';
import { CoursesModule } from '../courses/courses.module';
import { CourseLessonProgressRepository } from '../courses/course-lesson-progress.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CoursesModule, AuthModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, CourseLessonProgressRepository],
})
export class EnrollmentModule {}
