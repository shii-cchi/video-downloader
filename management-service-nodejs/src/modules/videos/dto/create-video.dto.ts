import { IsEnum, IsNotEmpty, IsUrl } from 'class-validator';
import { VideoQuality, VideoType } from '../types';

export class CreateVideoDto {
  @IsUrl()
  @IsNotEmpty()
  videoURL: string;

  @IsEnum(VideoType)
  type: VideoType;

  @IsEnum(VideoQuality)
  quality: VideoQuality;

  @IsNotEmpty()
  folderID: string;
}
