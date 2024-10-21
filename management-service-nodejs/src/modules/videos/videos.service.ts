import { Inject, Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { VideoInfoDto } from './dto/video-info.dto';
import { omit } from 'lodash';
import { ConfigurationService } from 'src/lib/configuration/configuration.service';

@Injectable()
export class VideosService {
  @Inject('DOWNLOAD_QUEUE')
  private readonly downloadClient: ClientProxy;

  @Inject()
  private readonly configurationService: ConfigurationService;

  download(createDto: CreateVideoDto) {
    const message = new RmqRecordBuilder(omit(createDto, ['folderID']))
      .setOptions({ persistent: true })
      .build();

    this.downloadClient.emit(
      this.configurationService.env.TO_DOWNLOAD_QUEUE,
      message,
    );
  }
  saveNewVideo(data: VideoInfoDto) {
    console.log(data);
    // save to db
  }
}
