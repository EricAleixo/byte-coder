import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload-image/upload-image.module';

@Module({
  imports: [forwardRef(() => AuthModule), UploadModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}