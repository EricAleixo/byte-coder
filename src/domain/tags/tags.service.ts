import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsRepository } from './tags.repository';

@Injectable()
export class TagsService {
  constructor(private readonly tagsRepository: TagsRepository) {}

  create(dto: CreateTagDto) {
    return this.tagsRepository.create(dto);
  }

  findAll() {
    return this.tagsRepository.findAll();
  }

  findOne(id: string) {
    return this.tagsRepository.findById(id);
  }

  findBySlug(slug: string) {
    return this.tagsRepository.findBySlug(slug);
  }

  update(id: string, dto: UpdateTagDto) {
    return this.tagsRepository.update(id, dto);
  }

  remove(id: string) {
    return this.tagsRepository.delete(id);
  }
}