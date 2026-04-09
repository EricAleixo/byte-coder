import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UploadImageService } from '../upload-image/upload-image.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly uploadImageService: UploadImageService
  ) { }

  create(dto: CreatePostDto, authorId: string) {
    return this.postsRepository.create(dto, authorId);
  }

  async uploadImage(file: Express.Multer.File) {
    const uploaded = await this.uploadImageService.upload(file, 'posts');

    return {
      imageUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
    };
  }

  findAll(page?: number, limit?: number) {
    return this.postsRepository.findAll({ page, limit });
  }

  findOne(id: string) {
    return this.postsRepository.findById(id);
  }

  findBySlug(slug: string) {
    return this.postsRepository.findBySlug(slug);
  }

  search(query: string) {
    return this.postsRepository.search(query);
  }

  findRelated(slug: string, limit?: number) {
    return this.postsRepository.findRelated(slug, limit);
  }

  findAllPublished(page?: number, limit?: number) {
    return this.postsRepository.findAllPublished(page, limit);
  }

  findByCategory(categorySlug: string, page: number, limit: number) {
    return this.postsRepository.findByCategory(categorySlug, page, limit);
  }

  async update(id: string, dto: UpdatePostDto) {
    const post = await this.findOne(id);

    const imageChanged = dto.coverImage && dto.coverImage !== post.coverImage;

    if (imageChanged && post.coverImagePublicId) {
      await this.uploadImageService.delete(post.coverImagePublicId);
    }

    return this.postsRepository.update(id, dto);
  }

  async remove(id: string) {
    const post = await this.findOne(id);
    if (post.coverImagePublicId) {
      await this.uploadImageService.delete(post.coverImagePublicId);
    }
    return this.postsRepository.delete(id);
  }
}