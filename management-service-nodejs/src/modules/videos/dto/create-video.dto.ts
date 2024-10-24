import { IsEnum, IsNotEmpty, IsUrl } from 'class-validator';
import { VideoQuality, VideoType } from '../types';
import { IsObjectId } from '../../../lib/decorators/isObjectID.decorator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateVideoDto {
  @IsUrl()
  @IsNotEmpty()
  videoURL: string;

  @IsEnum(VideoType)
  type: VideoType;

  @IsEnum(VideoQuality)
  quality: VideoQuality;

  @IsNotEmpty()
  @IsObjectId({ message: 'folderID should be objectID' })
  @Transform(({ value }) =>
    value && Types.ObjectId.isValid(value as string)
      ? new Types.ObjectId(value as string)
      : value,
  )
  folderID: Types.ObjectId;
}
