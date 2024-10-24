import { Types } from 'mongoose';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { IsObjectId } from '../../../lib/decorators/isObjectID.decorator';
import { Transform } from 'class-transformer';

export class CreateFolderDto {
  @IsNotEmpty()
  @MaxLength(20)
  folderName: string;

  @IsNotEmpty()
  @IsOptional()
  @IsObjectId({ message: 'parentDirID should be objectID' })
  @Transform(({ value }) =>
    value && Types.ObjectId.isValid(value as string)
      ? new Types.ObjectId(value as string)
      : value,
  )
  parentDirID: Types.ObjectId;
}
