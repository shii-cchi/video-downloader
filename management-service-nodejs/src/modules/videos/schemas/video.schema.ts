import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VideoDocument = HydratedDocument<Video>;

@Schema()
export class Video {
  @Prop()
  videoName: string;

  @Prop()
  folderID: Types.ObjectId;

  @Prop()
  realPath: string;

  @Prop()
  previewPath: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
