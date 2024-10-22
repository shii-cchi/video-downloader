import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type FolderDocument = HydratedDocument<Folder>;

@Schema()
export class Folder {
  @Prop()
  folderName: string;

  @Prop()
  parentDirID: Types.ObjectId;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
