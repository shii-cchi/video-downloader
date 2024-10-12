import { Inject, Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { ClientProxy } from '@nestjs/microservices';
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
    const fields = omit(createDto, ['folderID']);
    this.downloadClient.emit(
      this.configurationService.env.TO_DOWNLOAD_QUEUE,
      fields,
    );
  }

  saveNewVideo(data: VideoInfoDto) {
    console.log(data);
    // save to db
  }
}
