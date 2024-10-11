import { Inject, Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class VideosService {
  @Inject('DOWNLOAD_QUEUE') private readonly downloadClient: ClientProxy;

  download(createDto: CreateVideoDto) {
    this.downloadClient.emit('video_to_download_queue', createDto);
  }

  saveToDb(data: string) {
    console.log(data);
  }
}
