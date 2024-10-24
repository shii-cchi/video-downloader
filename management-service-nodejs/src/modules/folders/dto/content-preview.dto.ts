import { FolderPreviewDto } from './folder-preview.dto';
import { Expose } from 'class-transformer';
import { VideoPreviewDto } from '../../videos/dto/video-preview.dto';

export class ContentPreviewDto {
  @Expose()
  folders: FolderPreviewDto[];

  @Expose()
  videos: VideoPreviewDto[];
}
