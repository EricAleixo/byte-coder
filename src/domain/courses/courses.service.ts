import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { CoursePostsRepository } from "./course-post.repository";
import CoursesRepository from "./cousers.repository";
import { AddCoursePostDto } from "./dto/add-course-post.dto";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { UpdatePositionDto } from "./dto/update-position-post.dto";
import { CourseResourceDto } from "./dto/create-course-resource.dto";
import { CreateCourseLessonDto } from "./dto/create-course-lesson.dto";
import { CreateCourseLessonResourceDto } from "./dto/create-course-lesson-resource.dto";

/** Mesma lógica do front (utils/video.ts): watch?v=ID, youtu.be/ID, embed/ID. */
function getYoutubeThumbnail(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const id = u.searchParams.get("v") ?? u.pathname.split("/").pop();
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
  } catch {
    return null;
  }
}

@Injectable()
export class CoursesService {
  constructor(
    private readonly coursesRepo: CoursesRepository,
    private readonly coursePostsRepo: CoursePostsRepository
  ) { }

  findAll() {
    return this.coursesRepo.findAll();
  }

  /**
   * Versão pública do curso: ementa (títulos, duração, descrição) sem o conteúdo em si.
   * URL dos vídeos e materiais só saem por findContent, que exige inscrição.
   */
  private toPublic<
    T extends { resources: unknown[]; lessons: { videoUrl: string | null; videoProvider: string | null }[] },
  >(course: T) {
    return {
      ...course,
      resources: [],
      // sem videoUrl, mas com a thumbnail pra vitrine bloqueada do curso
      lessons: course.lessons.map(({ videoUrl, ...lesson }) => ({
        ...lesson,
        thumbnailUrl: lesson.videoProvider === "YOUTUBE" ? getYoutubeThumbnail(videoUrl) : null,
      })),
    };
  }

  async findBySlug(slug: string) {
    const course = await this.coursesRepo.findBySlug(slug);
    if (!course) throw new NotFoundException("Curso não encontrado");
    return this.toPublic(course);
  }

  async findWithPosts(slug: string) {
    const course = await this.coursesRepo.findBySlug(slug);
    if (!course) throw new NotFoundException("Curso não encontrado");
    const posts = await this.coursesRepo.findPostsByCourseId(course.id);
    return { ...this.toPublic(course), posts };
  }

  /** Curso completo (vídeos, materiais, recursos por aula). Protegido por EnrollmentGuard. */
  async findContent(slug: string) {
    const course = await this.coursesRepo.findBySlug(slug);
    if (!course) throw new NotFoundException("Curso não encontrado");
    const [posts, lessons] = await Promise.all([
      this.coursesRepo.findPostsByCourseId(course.id),
      this.coursesRepo.findLessonsByCourseId(course.id),
    ]);
    return { ...course, lessons, posts };
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

  async reorderPosts(courseId: string, orderedPostIds: string[]) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw new NotFoundException("Curso não encontrado");
    return this.coursePostsRepo.reorder(courseId, orderedPostIds);
  }

  async saveCourseResources(
    courseId: string,
    resources: CourseResourceDto[],
  ) {
    return this.coursesRepo.syncCourseResources(
      courseId,
      resources,
    );
  }

  // ──── Lições do curso ────────────────────────────────────────────────────────

  async addLesson(courseId: string, dto: CreateCourseLessonDto) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw new NotFoundException("Curso não encontrado");
    return this.coursesRepo.addLesson(courseId, dto);
  }

  async removeLesson(courseId: string, lessonId: string) {
    await this.coursesRepo.removeLesson(courseId, lessonId);
  }

  async addLessonResource(courseId: string, lessonId: string, dto: CreateCourseLessonResourceDto) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw new NotFoundException("Curso não encontrado");
    return this.coursesRepo.addLessonResource(lessonId, dto);
  }

  async removeLessonResource(lessonId: string, resourceId: string) {
    await this.coursesRepo.removeLessonResource(lessonId, resourceId);
  }

}