import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { CoursePostsRepository } from "./course-post.repository";
import { CoursesRepository } from "./cousers.repository";
import { AddCoursePostDto } from "./dto/add-course-post.dto";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { UpdatePositionDto } from "./dto/update-position-post.dto";

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepo: CoursesRepository,
    private readonly coursePostsRepo: CoursePostsRepository
  ) {}

  findAll() {
    return this.coursesRepo.findAll();
  }

  async findBySlug(slug: string) {
    const course = await this.coursesRepo.findBySlug(slug);
    if (!course) throw new NotFoundException("Curso não encontrado");
    return course;
  }

  async findWithPosts(slug: string) {
    const course = await this.coursesRepo.findBySlug(slug);
    if (!course) throw new NotFoundException("Curso não encontrado");
    const posts = await this.coursesRepo.findPostsByCourseId(course.id);
    return { ...course, posts };
  }

  async create(dto: CreateCourseDto, authorId: string) {
    const existing = await this.coursesRepo.findBySlug(dto.slug);
    if (existing) throw new ConflictException("Slug já está em uso");
    return this.coursesRepo.create({ ...dto, authorId });
  }

  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.coursesRepo.findById(id);
    if (!course) throw new NotFoundException("Curso não encontrado");
    return this.coursesRepo.update(id, dto);
  }

  async remove(id: string) {
    const course = await this.coursesRepo.findById(id);
    if (!course) throw new NotFoundException("Curso não encontrado");
    await this.coursesRepo.delete(id);
  }

  async addPost(courseId: string, dto: AddCoursePostDto) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw new NotFoundException("Curso não encontrado");
    return this.coursePostsRepo.addPost({ courseId, ...dto });
  }

  async removePost(courseId: string, postId: string) {
    await this.coursePostsRepo.removePost(courseId, postId);
  }

  async updatePostPosition(
    courseId: string,
    postId: string,
    dto: UpdatePositionDto
  ) {
    const entry = await this.coursePostsRepo.updatePosition(
      courseId,
      postId,
      dto.position
    );
    if (!entry) throw new NotFoundException("Post não encontrado neste curso");
    return entry;
  }
}