import { FolderPreviewDto } from './folder-preview.dto';
import { VideoInfoDto } from '../../videos/dto/video-info.dto';
import { Expose } from 'class-transformer';

export class ContentPreviewDto {
  @Expose()
  folders: FolderPreviewDto[];

  @Expose()
  videos: VideoInfoDto[];
}
