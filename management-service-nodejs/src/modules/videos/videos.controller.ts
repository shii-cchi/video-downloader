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
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { VideoInfoDto } from './dto/video-info.dto';
import { ChannelWrapper } from 'amqp-connection-manager';

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

  @MessagePattern('downloaded_video_queue')
  processVideoInfo(@Payload() data: VideoInfoDto, @Ctx() context: RmqContext) {
    const channel: ChannelWrapper = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.videosService.saveNewVideo(data);
    channel.ack(originalMsg);
  }

  @MessagePattern('error_queue')
  processError(@Payload() err: { data: string }, @Ctx() context: RmqContext) {
    const channel: ChannelWrapper = context.getChannelRef();
    const originalMsg = context.getMessage();
    console.log(err);
    channel.ack(originalMsg);
  }
}
