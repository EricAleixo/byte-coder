import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { Role } from '../auth/enums/role';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreatePostDto, @Request() req: any) {
    return this.postsService.create(dto, req.user.sub);
  }

  @Get()
  findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.postsService.findAll(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('category/:categorySlug')
  findByCategory(
    @Param('categorySlug') categorySlug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.findByCategory(
      categorySlug,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('slug/:slug')
  findBySlug(
    @Param('slug') slug: string
  ) {
    return this.postsService.findBySlug(slug);
  }

  @Get('search')
  search(@Query('q') q: string) {
    if (!q?.trim()) return [];
    return this.postsService.search(q);
  }

  @Get('slug/:slug/related')
  findRelated(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.findRelated(slug, limit ? parseInt(limit) : 4);
  }

  @Get('published')
  findAllPublished(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.findAllPublished(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 12, // ← 10 para 12
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('/upload-image')
  @UseInterceptors(FileInterceptor("image"))
  uploadImage(
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.postsService.uploadImage(file);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('/delete-image')
  @UseInterceptors(FileInterceptor("image"))
  deleteImage(
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.postsService.uploadImage(file);
  }
}