import { Controller, Post, BadRequestException, Get } from '@nestjs/common';
import { PromptsService } from './prompts.service';

@Controller('prompts')
export class PromptsController {
  constructor(private readonly prompts: PromptsService) {}

  @Get('/')
  async getPrompts() {
    try {
      const prompts = await this.prompts.getPrompts();
      return { prompts };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
