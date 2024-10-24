import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseFilters,
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
import { HttpExceptionFilter } from '../../lib/filters/http-exception.filter';

@Controller('videos')
@UsePipes(new ValidationPipe({ transform: true }))
@UseFilters(new HttpExceptionFilter())
export class VideosController {
  @Inject()
  private readonly logger: Logger;

  @Inject()
  private readonly videosService: VideosService;

  @Post('/download-to-server')
  async download(
    @Body() createVideoDto: CreateVideoDto,
  ): Promise<{ message: string }> {
    this.logger.debug(
      `Download request has been received with body: ${JSON.stringify(createVideoDto)}`,
    );

    await this.videosService.download(createVideoDto);
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
