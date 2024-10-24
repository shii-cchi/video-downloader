import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { VideoInfoDto } from './dto/video-info.dto';
import { ConfigurationService } from 'src/lib/configuration/configuration.service';
import { Video, VideoDocument } from './schemas/video.schema';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { FoldersService } from '../folders/folders.service';
import { VideoPreviewDto } from './dto/video-preview.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class VideosService {
  @Inject(forwardRef(() => FoldersService))
  private readonly foldersService: FoldersService;

  @Inject('DOWNLOAD_QUEUE')
  private readonly downloadClient: ClientProxy;

  @Inject()
  private readonly configurationService: ConfigurationService;

  @Inject()
  private readonly logger: Logger;

  @InjectModel(Video.name)
  private readonly videoModel: Model<VideoDocument>;

  async download(createDto: CreateVideoDto) {
    await this.foldersService.checkExist(createDto.folderID);

    const message = new RmqRecordBuilder(createDto)
      .setOptions({ persistent: true })
      .build();
    this.logger.debug(
      `Sending message for downloading with data: ${JSON.stringify(message)}`,
    );

    this.downloadClient.emit(
      this.configurationService.env.TO_DOWNLOAD_QUEUE,
      message,
    );
  }

  async saveNewVideo(data: VideoInfoDto): Promise<Video> {
    // check video name exist
    return this.videoModel.create(data);
  }

  async get(folderID: Types.ObjectId): Promise<VideoPreviewDto[]> {
    const videos = await this.videoModel.find({ folderID }).lean();
    return plainToInstance(VideoPreviewDto, videos, {
      excludeExtraneousValues: true,
    });
  }

  async deleteVideos(arrNestedFolderID: any[]) {
    await this.videoModel.deleteMany({ folderID: { $in: arrNestedFolderID } });
  }
}
