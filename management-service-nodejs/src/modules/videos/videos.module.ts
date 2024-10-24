import { forwardRef, Logger, Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigurationService } from 'src/lib/configuration/configuration.service';
import { ConfigurationModule } from 'src/lib/configuration/configuration.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './schemas/video.schema';
import { FoldersModule } from '../folders/folders.module';

@Module({
  imports: [
    forwardRef(() => FoldersModule),
    ConfigurationModule,
    ClientsModule.registerAsync([
      {
        name: 'DOWNLOAD_QUEUE',
        imports: [ConfigurationModule],
        inject: [ConfigurationService],
        useFactory: (configurationService: ConfigurationService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configurationService.env.RABBITMQ_HOST}:${configurationService.env.RABBITMQ_PORT}`,
            ],
            queue: configurationService.env.TO_DOWNLOAD_QUEUE,
            noAck: true,
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
  ],
  controllers: [VideosController],
  providers: [
    VideosService,
    { provide: Logger, useValue: new Logger('VideosModule') },
  ],
  exports: [VideosService],
})
export class VideosModule {}
