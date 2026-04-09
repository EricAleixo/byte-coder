import { Module } from '@nestjs/common';
import { PostImagesService } from './post-images.service';
import { UploadModule } from '../upload-image/upload-image.module';
import { PostImagesRepository } from './post-images.repository';

@Module({
  imports: [UploadModule],
  controllers: [],
  providers: [PostImagesService, PostImagesRepository],
  exports: [PostImagesService]
})
export class PostImagesModule {}
