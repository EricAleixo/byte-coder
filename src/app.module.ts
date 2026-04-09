import { Module } from '@nestjs/common';
import { UsersModule } from './domain/users/users.module';
import { AuthModule } from './domain/auth/auth.module';
import { PostsModule } from './domain/posts/posts.module';
import { TagsModule } from './domain/tags/tags.module';
import { CategoriesModule } from './domain/categories/categories.module';
import { UploadImageService } from './domain/upload-image/upload-image.service';
import { CommentsModule } from './domain/comments/comments.module';

@Module({
  imports: [UsersModule, AuthModule, PostsModule, TagsModule, CategoriesModule, CommentsModule],
  providers: [UploadImageService],
})
export class AppModule { }