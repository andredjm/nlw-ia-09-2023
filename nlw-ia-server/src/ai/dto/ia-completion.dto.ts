import { IsString, IsNumber, Min, Max } from 'class-validator';

export class IACompletionDto {
  @IsString()
  prompt: string;

  @IsString()
  videoId: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  temperature: number;
}
