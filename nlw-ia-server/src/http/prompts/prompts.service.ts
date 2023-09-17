import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class PromptsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPrompts() {
    const prompts = await this.prisma.prompt.findMany();
    return prompts;
  }
}
