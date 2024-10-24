import { IsNotEmpty, MaxLength } from 'class-validator';
import { IsObjectId } from '../../../lib/decorators/isObjectID.decorator';
import { Types } from 'mongoose';
import { AnyOf } from '../../../lib/decorators/anyOf.decorator';
import { Transform } from 'class-transformer';

@AnyOf(['folderName', 'parentDirID'])
export class UpdateFolderDto {
  @IsNotEmpty()
  @MaxLength(20)
  folderName: string;

  @IsNotEmpty()
  @IsObjectId({ message: 'parentDirID should be objectID' })
  @Transform(({ value }) =>
    value && Types.ObjectId.isValid(value as string)
      ? new Types.ObjectId(value as string)
      : value,
  )
  parentDirID: Types.ObjectId;
}
