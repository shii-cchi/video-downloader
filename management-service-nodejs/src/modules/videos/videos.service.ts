import { Inject, Injectable } from '@nestjs/common';
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

  @InjectModel(Video.name)
  private readonly videoModel: Model<VideoDocument>;

  download(createDto: CreateVideoDto) {
    const message = new RmqRecordBuilder(omit(createDto, ['folderID']))
      .setOptions({ persistent: true })
      .build();

    this.downloadClient.emit(
      this.configurationService.env.TO_DOWNLOAD_QUEUE,
      message,
    );
  }

  async saveNewVideo(data: VideoInfoDto): Promise<Video> {
    console.log(data);
    return this.videoModel.create(data);
  }
}
