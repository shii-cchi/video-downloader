import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type VideoDocument = HydratedDocument<Video>;

@Schema()
export class Video {
  @Prop()
  videoName: string;

  @Prop()
  folderID: mongoose.Schema.Types.ObjectId;

  @Prop()
  realPath: string;

  @Prop()
  previewPath: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
