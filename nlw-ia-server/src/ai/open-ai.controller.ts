import {
  Controller,
  Post,
  Body,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { OpenAIService } from './open-ai.service';
import { OpenAIStream, streamToResponse } from 'ai';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { Multer } from 'multer';
import { IACompletionDto } from './dto/ia-completion.dto';
import { TranscriptionDto } from './dto/transcription.dto';

@Controller('ai')
export class OpenAIController {
  constructor(private readonly openai: OpenAIService) {}

  @Post('complete')
  @UsePipes(new ValidationPipe())
  async complete(
    @Body() iaCompletionDto: IACompletionDto,
    @Res() res: Response,
  ) {
    const { videoId, prompt, temperature } = iaCompletionDto;
    const response = await this.openai.generateCompletion(
      videoId,
      prompt,
      temperature,
    );
    const stream = OpenAIStream(response);

    streamToResponse(stream, res, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    });
  }

  @Post('video/:videoId/transcription')
  @UsePipes(new ValidationPipe())
  async transcribe(
    @Body() transcriptionDto: TranscriptionDto,
    @Param('videoId') videoId: string,
  ) {
    const { language, prompt } = transcriptionDto;
    return this.openai.transcribeAudio(videoId, language, prompt);
  }
}
