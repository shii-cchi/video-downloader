import { Inject, Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { ClientProxy } from '@nestjs/microservices';
import { VideoInfoDto } from './dto/video-info.dto';
import { omit } from 'lodash';

@Injectable()
export class VideosService {
  @Inject('DOWNLOAD_QUEUE') private readonly downloadClient: ClientProxy;

  download(createDto: CreateVideoDto) {
    const fields = omit(createDto, ['folderID']);
    this.downloadClient.emit('video_to_download_queue', fields);
  }

  saveNewVideo(data: VideoInfoDto) {
    console.log(data);
    // save to db
  }
}
