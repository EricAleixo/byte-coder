import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CommentsRepository } from "./comments.repository";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { PostsService } from "../posts/posts.service";

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository, 
    private readonly postsService: PostsService) { }

  async create(dto: CreateCommentDto, userId: string) {
    const isAnonymous = dto.isAnonymous ?? false;

    if (!userId) {
      throw new ForbiddenException("Login necessário para comentar.");
    }

    if (isAnonymous && !dto.anonymousName) {
      throw new BadRequestException("Nome anônimo é obrigatório.");
    }

    const comment = await this.commentsRepository.create({
      content: dto.content,
      postId: dto.postId,
      parentId: dto.parentId ?? null,
      authorId: userId,
      isAnonymous,
      anonymousName: isAnonymous ? dto.anonymousName : null,
    });

    return this.mapComment(comment);
  }

  async findByPost(slug: string) {
    const post = await this.postsService.findBySlug(slug);
    const comments = await this.commentsRepository.findByPost(post.id);
    return this.mapCommentsTree(comments);
  }

  async update(id: string, dto: UpdateCommentDto, userId: string) {
    const comment = await this.commentsRepository.findById(id);

    if (!comment) {
      throw new NotFoundException("Comentário não encontrado.");
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException("Sem permissão.");
    }

    if (dto.isAnonymous === true && !dto.anonymousName) {
      throw new BadRequestException("Nome anônimo é obrigatório.");
    }

    if (dto.isAnonymous === false) {
      dto.anonymousName = undefined;
    }

    if (!Object.keys(dto).length) {
      throw new BadRequestException("Nenhum dado para atualizar.");
    }

    const updated = await this.commentsRepository.update(id, dto);

    return this.mapComment(updated);
  }

  async delete(id: string, userId: string, role: string) {
    const comment = await this.commentsRepository.findById(id);

    if (!comment) {
      throw new NotFoundException("Comentário não encontrado.");
    }

    const isOwner = comment.authorId === userId;
    const isAdmin = role === "admin";

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException("Sem permissão.");
    }

    await this.commentsRepository.delete(id);
  }


  private mapComment(comment: any) {
    if (comment.isAnonymous) {
      return {
        ...comment,
        author: null,
        displayName: comment.anonymousName ?? "Anônimo",
      };
    }

    return {
      ...comment,
      displayName: comment.author?.name,
    };
  }

  private mapCommentsTree(comments: any[]) {
    return comments.map((comment) => ({
      ...this.mapComment(comment),
      replies:
        comment.replies?.map((reply: any) =>
          this.mapComment(reply)
        ) ?? [],
    }));
  }
}