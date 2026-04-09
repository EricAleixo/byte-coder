import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  create(dto: CreateCategoryDto) {
    return this.categoriesRepository.create(dto);
  }

  findAll() {
    return this.categoriesRepository.findAll();
  }

  findOne(id: string) {
    return this.categoriesRepository.findById(id);
  }

  findBySlug(slug: string) {
    return this.categoriesRepository.findBySlug(slug);
  }

  findWithPosts(limit = 5){
    return this.categoriesRepository.findWithPosts(limit);
  }

  update(id: string, dto: UpdateCategoryDto) {
    return this.categoriesRepository.update(id, dto);
  }

  remove(id: string) {
    return this.categoriesRepository.delete(id);
  }
}