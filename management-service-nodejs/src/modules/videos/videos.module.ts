import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigurationService } from 'src/lib/configuration/configuration.service';
import { ConfigurationModule } from 'src/lib/configuration/configuration.module';

@Module({
  imports: [
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
  ],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
