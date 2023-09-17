import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VideoService } from './video/upload-video.service';
import { PromptsService } from './prompts/prompts.service';
import { OpenAIService } from 'src/ai/open-ai.service';
import { VideoController } from './video/upload.video.controller';
import { PromptsController } from './prompts/prompts.controller';
import { OpenAIController } from 'src/ai/open-ai.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
  controllers: [VideoController, PromptsController, OpenAIController],
  providers: [
    VideoService,
    PromptsService,
    OpenAIService,

    //Controllers
  ],
})
export class HttpModule {}
