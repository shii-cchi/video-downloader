import { Expose, Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class VideoPreviewDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  id: Types.ObjectId;

  @Expose()
  videoName: string;

  @Expose()
  folderID: Types.ObjectId;

  @Expose()
  realPath: string;

  @Expose()
  previewPath: string;
}
