import {
  Body,
  Controller,
  Inject,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { EventPattern, Payload } from '@nestjs/microservices';
import { VideoInfoDto } from './dto/video-info.dto';

@Controller('videos')
@UsePipes(new ValidationPipe())
export class VideosController {
  @Inject()
  private readonly videosService: VideosService;

  @Post('/download-to-server')
  download(@Body() createVideoDto: CreateVideoDto): { message: string } {
    this.videosService.download(createVideoDto);

    return { message: 'Starting video download' };
  }

  @EventPattern('downloaded_video_queue')
  processVideoInfo(@Payload() data: VideoInfoDto) {
    this.videosService.saveNewVideo(data);
  }

  @EventPattern('error_queue')
  processError(@Payload() err: { data: string }) {
    console.log(err);
  }
}
