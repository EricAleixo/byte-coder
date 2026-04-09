import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UploadImageService } from '../upload-image/upload-image.service';
import { PostImagesService } from '../post-images/post-images.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly uploadImageService: UploadImageService,
    private readonly postImagesService: PostImagesService,
  ) { }
  private viewsCache = new Map<string, number>();

  async create(dto: CreatePostDto, authorId: string) {
    const post = await this.postsRepository.create(dto, authorId);
    console.log("HTML completo:", dto.content);
    await this.postImagesService.sync(post.id, dto.content);
    return post;
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


  async findBySlug(slug: string, ip: string) {
    const post = await this.postsRepository.findBySlug(slug);

    const key = `${ip}:${post.id}`;
    const now = Date.now();
    const ttl = 2 * 60 * 1000;

    const lastView = this.viewsCache.get(key);

    if (!lastView || now - lastView > ttl) {
      this.viewsCache.set(key, now);
      this.postsRepository.incrementViews(post.id);
    }

    return post;
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

    const updated = await this.postsRepository.update(id, dto);
    await this.postImagesService.sync(id, dto.content ?? post.content);
    return updated;
  }

  async remove(id: string) {
    const post = await this.findOne(id);

    if (post.coverImagePublicId) {
      await this.uploadImageService.delete(post.coverImagePublicId);
    }

    await this.postImagesService.deleteAll(id); // limpa conteúdo antes do cascade
    return this.postsRepository.delete(id);
  }
}