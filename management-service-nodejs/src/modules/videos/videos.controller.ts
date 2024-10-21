import {
  Body,
  Controller,
  Inject,
  Logger,
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
  private readonly logger: Logger;

  @Inject()
  private readonly videosService: VideosService;

  @Post('/download-to-server')
  download(@Body() createVideoDto: CreateVideoDto): { message: string } {
    this.logger.debug(
      `Download request has been received with body: ${JSON.stringify(createVideoDto)}`,
    );

    this.videosService.download(createVideoDto);
    return { message: 'Starting video download' };
  }

  @MessagePattern('downloaded_video_queue')
  async processVideoInfo(
    @Payload() data: VideoInfoDto,
    @Ctx() context: RmqContext,
  ) {
    const channel: ChannelWrapper = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.debug(
      `Message with video info has been received: ${JSON.stringify(data)}`,
    );

    await this.videosService.saveNewVideo(data);
    this.logger.log(
      `Video "${data.videoName}" has been successfully downloaded`,
    );
    channel.ack(originalMsg);
  }

  @MessagePattern('error_queue')
  processError(@Payload() err: { error: string }, @Ctx() context: RmqContext) {
    const channel: ChannelWrapper = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.debug(
      `Message with error has been received: ${JSON.stringify(err)}`,
    );
    this.logger.error(`Error downloading video: ${JSON.stringify(err)}`);

    channel.ack(originalMsg);
  }
}
