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

  @EventPattern()
  saveToDb(@Payload() data: string) {
    this.videosService.saveToDb(data);
  }
}
