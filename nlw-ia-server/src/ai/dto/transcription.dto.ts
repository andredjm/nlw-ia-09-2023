import { IsString } from 'class-validator';

export class TranscriptionDto {
  @IsString()
  language: string;

  @IsString()
  prompt?: string;
}
