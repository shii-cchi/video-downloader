import { Types } from 'mongoose';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsObjectId } from '../decorators/isObjectID.decorator';

export class ObjectIdDto {
  @IsOptional()
  @IsNotEmpty()
  @IsObjectId({ message: 'id should be objectID' })
  @Transform(({ value }) => new Types.ObjectId(value as string))
  id: Types.ObjectId;
}
