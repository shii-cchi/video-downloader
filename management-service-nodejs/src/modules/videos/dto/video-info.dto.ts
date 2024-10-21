import { IsNotEmpty } from 'class-validator';

export class VideoInfoDto {
  @IsNotEmpty()
  videoName: string;

  @IsNotEmpty()
  realPath: string;

  @IsNotEmpty()
  previewPath: string;
}
