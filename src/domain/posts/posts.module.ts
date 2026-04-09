import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload-image/upload-image.module';
import { PostImagesModule } from '../post-images/post-images.module';

@Module({
  imports: [AuthModule, UploadModule, PostImagesModule],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository],
  exports: [PostsService],
})
export class PostsModule {}