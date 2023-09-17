import { Injectable, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises'; // Import fs promises API
import * as fsSync from 'fs'; // Import fs sync API

import { Multer } from 'multer';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class VideoService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadVideo(file: Multer.File): Promise<any> {
    const extension = path.extname(file.originalname);

    if (extension !== '.mp3') {
      throw new BadRequestException('Invalid input type, please upload a MP3.');
    }

    const uploadDir = path.resolve(__dirname, '../../tmp');
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true });
    }
    const fileBaseName = path.basename(file.originalname, extension);
    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;
    const uploadDestination = path.join(uploadDir, fileUploadName);

    // Use fs.promises API to write the buffer to file
    await fs.writeFile(uploadDestination, file.buffer);

    const video = await this.prisma.video.create({
      data: {
        name: file.originalname,
        path: uploadDestination,
      },
    });

    return video;
  }
}
