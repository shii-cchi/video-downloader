import { Inject, Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { ClientProxy } from '@nestjs/microservices';
import { VideoInfoDto } from './dto/video-info.dto';

@Injectable()
export class VideosService {
  @Inject('DOWNLOAD_QUEUE') private readonly downloadClient: ClientProxy;

  download(createDto: CreateVideoDto) {
    this.downloadClient.emit('video_to_download_queue', createDto);
  }

  saveNewVideo(data: VideoInfoDto) {
    console.log(data);
    // save to db
  }
}
