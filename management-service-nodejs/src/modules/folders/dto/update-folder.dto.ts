import { IsNotEmpty, MaxLength } from 'class-validator';
import { IsObjectId } from '../../../lib/decorators/isObjectID.decorator';
import { Types } from 'mongoose';
import { AnyOf } from '../../../lib/decorators/anyOf.decorator';

@AnyOf(['folderName', 'parentDirID'])
export class UpdateFolderDto {
  @IsNotEmpty()
  @MaxLength(20)
  folderName: string;

  @IsNotEmpty()
  @IsObjectId({ message: 'parentDirID should be objectID' })
  parentDirID: Types.ObjectId;
}
