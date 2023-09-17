import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createReadStream } from 'fs';
import { OpenAI } from 'openai';
import { Uploadable } from 'openai/uploads';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Readable } from 'stream';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;

  constructor(private readonly prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_KEY,
    });
    console.log('OpenAI service initialized');
  }

  async transcribeAudio(
    videoId: string,
    language: string,
    prompt?: string,
  ): Promise<string> {
    if (!videoId) {
      throw new HttpException('Missing video id', HttpStatus.BAD_REQUEST);
    }

    const video = await this.prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    });

    const videoPath = video.path;
    const audioReadStream = createReadStream(videoPath);

    try {
      const response = await this.openai.audio.transcriptions.create({
        file: audioReadStream as unknown as Uploadable,
        model: 'whisper-1',
        language,
        response_format: 'json',
        temperature: 0,
        prompt,
      });

      await this.prisma.video.update({
        where: {
          id: videoId,
        },
        data: {
          transcription: response.text,
        },
      });

      return response.text;
    } catch (error) {
      throw new HttpException(
        'Falha na transcrição do áudio',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateCompletion(
    videoId: string,
    promptMessage: string,
    temperature = 0.5,
  ) {
    try {
      const video = await this.prisma.video.findUniqueOrThrow({
        where: {
          id: videoId,
        },
      });

      if (!video.transcription) {
        throw new HttpException(
          'Transcrição do vídeo não encontrada',
          HttpStatus.BAD_REQUEST,
        );
      }

      promptMessage = promptMessage + video.transcription;

      const result = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-16k',
        temperature,
        messages: [{ role: 'user', content: promptMessage }],
        stream: true,
      });

      return result;
    } catch (error) {
      throw new HttpException(
        'Falha na geração da conclusão',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
