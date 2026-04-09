import {
  Body, Controller, Delete, Get, Param,
  Patch, Post, UseGuards, Request
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { JwtGuard } from "../auth/guards/jwt.guard";

@Controller("comments")
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtGuard)
  create(
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.commentsService.create(dto, req.user.sub);
  }

  @Get("post/:slug")
  findByPost(@Param("slug") slug: string) {
    return this.commentsService.findByPost(slug);
  }

  @Patch(":id")
  @UseGuards(JwtGuard)
  update(
    @Param("id") id: string,
    @Body() dto: UpdateCommentDto,
    @Request() req: any
  ) {
    return this.commentsService.update(id, dto, req.user.sub);
  }

  @Delete(":id")
  @UseGuards(JwtGuard)
  delete(
    @Param("id") id: string,
    @Request() req: any,
  ) {
    return this.commentsService.delete(id, req.user.sub, req.user.role);
  }
}