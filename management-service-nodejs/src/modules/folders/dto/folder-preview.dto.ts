import { Types } from 'mongoose';
import { Expose, Transform } from 'class-transformer';

export class FolderPreviewDto {
  @Expose()
  @Transform(({ obj }) => obj._id)
  id: Types.ObjectId;

  @Expose()
  folderName: string;

  @Expose()
  parentDirID: Types.ObjectId;
}
