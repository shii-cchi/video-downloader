import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { VideoInfoDto } from './dto/video-info.dto';
import { omit } from 'lodash';
import { ConfigurationService } from 'src/lib/configuration/configuration.service';
import { Video, VideoDocument } from './schemas/video.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class VideosService {
  @Inject('DOWNLOAD_QUEUE')
  private readonly downloadClient: ClientProxy;

  @Inject()
  private readonly configurationService: ConfigurationService;

  @Inject()
  private readonly logger: Logger;

  @InjectModel(Video.name)
  private readonly videoModel: Model<VideoDocument>;

  download(createDto: CreateVideoDto) {
    const message = new RmqRecordBuilder(omit(createDto, ['folderID']))
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
    this.logger.debug(`Saving video info to db: ${JSON.stringify(data)}`);
    return this.videoModel.create(data);
  }
}
