import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { AddCoursePostDto } from "./dto/add-course-post.dto";
import { Roles } from "../auth/decorators/roles.decorators";
import { Role } from "../auth/enums/role";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UpdatePositionDto } from "./dto/update-position-post.dto";


@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // ── Cursos ────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.coursesService.findBySlug(slug);
  }

  @Get(":slug/posts")
  findWithPosts(@Param("slug") slug: string) {
    return this.coursesService.findWithPosts(slug);
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(
    @Body() dto: CreateCourseDto,
    @Req() req
  ) {
    return this.coursesService.create(dto, req.user.sub);
  }

  @Patch(":id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param("id") id: string) {
    return this.coursesService.remove(id);
  }

  // ── Posts do curso ────────────────────────────────────────

  @Post(":courseId/posts")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  addPost(
    @Param("courseId") courseId: string,
    @Body() dto: AddCoursePostDto
  ) {
    return this.coursesService.addPost(courseId, dto);
  }

  @Patch(":courseId/posts/:postId/position")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updatePosition(
    @Param("courseId") courseId: string,
    @Param("postId") postId: string,
    @Body() dto: UpdatePositionDto
  ) {
    return this.coursesService.updatePostPosition(courseId, postId, dto);
  }

  @Delete(":courseId/posts/:postId")
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removePost(
    @Param("courseId") courseId: string,
    @Param("postId") postId: string
  ) {
    return this.coursesService.removePost(courseId, postId);
  }
}