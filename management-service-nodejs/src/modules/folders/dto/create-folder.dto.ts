import { Types } from 'mongoose';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { IsObjectId } from '../../../lib/decorators/isObjectID.decorator';

export class CreateFolderDto {
  @IsNotEmpty()
  @MaxLength(20)
  folderName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsObjectId({ message: 'parentDirID should be objectID' })
  parentDirID: Types.ObjectId;
}
