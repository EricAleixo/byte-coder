import { Controller, Post, Delete, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EnrollmentsService } from './enrollment.service';
import { EnrollmentGuard } from '../courses/guards/enrollment.guard';

@Controller()
@UseGuards(JwtGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('courses/:courseId/enroll')
  enroll(@Param('courseId') courseId: string, @Req() req) {
    return this.enrollmentsService.enroll(req.user.sub, courseId);
  }

  @Delete('courses/:courseId/enroll')
  unenroll(@Param('courseId') courseId: string, @Req() req) {
    return this.enrollmentsService.unenroll(req.user.sub, courseId);
  }

  @Get('courses/:courseId/enrollment')
  getEnrollmentStatus(@Param('courseId') courseId: string, @Req() req) {
    return this.enrollmentsService.getEnrollmentStatus(req.user.sub, courseId);
  }

  @Get('me/courses')
  findMyCourses(@Req() req) {
    return this.enrollmentsService.findMyCourses(req.user.sub);
  }

  @Get('courses/:courseId/progress')
  @UseGuards(EnrollmentGuard)
  getCourseProgress(@Param('courseId') courseId: string, @Req() req) {
    return this.enrollmentsService.getCourseProgress(req.user.sub, courseId);
  }

  @Post('courses/:courseId/lessons/:lessonId/complete')
  @UseGuards(EnrollmentGuard)
  completeLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Req() req,
  ) {
    return this.enrollmentsService.completeLesson(req.user.sub, courseId, lessonId);
  }

  @Delete('courses/:courseId/lessons/:lessonId/complete')
  @UseGuards(EnrollmentGuard)
  uncompleteLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Req() req,
  ) {
    return this.enrollmentsService.uncompleteLesson(req.user.sub, courseId, lessonId);
  }
}