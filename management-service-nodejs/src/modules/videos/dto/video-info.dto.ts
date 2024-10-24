import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';
import { IsObjectId } from '../../../lib/decorators/isObjectID.decorator';
import { Transform } from 'class-transformer';

export class VideoInfoDto {
  @IsNotEmpty()
  videoName: string;

  @IsNotEmpty()
  @IsObjectId({ message: 'folderID should be objectID' })
  @Transform(({ value }) =>
    value && Types.ObjectId.isValid(value as string)
      ? new Types.ObjectId(value as string)
      : value,
  )
  folderID: Types.ObjectId;

  @IsNotEmpty()
  realPath: string;

  @IsNotEmpty()
  previewPath: string;
}
