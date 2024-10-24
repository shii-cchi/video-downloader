import { forwardRef, Logger, Module } from '@nestjs/common';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Folder, FolderSchema } from './schemas/folder.schema';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [
    forwardRef(() => VideosModule),
    MongooseModule.forFeature([{ name: Folder.name, schema: FolderSchema }]),
  ],
  controllers: [FoldersController],
  providers: [
    FoldersService,
    { provide: Logger, useValue: new Logger('FoldersModule') },
  ],
  exports: [FoldersService],
})
export class FoldersModule {}
