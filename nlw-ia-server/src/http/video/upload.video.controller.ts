import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './upload-video.service';
import { Multer } from 'multer';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: Multer.File) {
    if (!file) {
      throw new BadRequestException('Missing file input.');
    }

    try {
      const video = await this.videoService.uploadVideo(file);
      return { video };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
