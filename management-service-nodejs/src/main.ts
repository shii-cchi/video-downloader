import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Transport } from '@nestjs/microservices';
import { ConfigurationService } from './lib/configuration/configuration.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configurationService = app.get(ConfigurationService);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configurationService.env.RABBITMQ_HOST}:${configurationService.env.RABBITMQ_PORT}`,
      ],
      queue: configurationService.env.DOWNLOADED_VIDEO_QUEUE,
      noAck: true,
      queueOptions: {
        durable: true,
      },
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${configurationService.env.RABBITMQ_HOST}:${configurationService.env.RABBITMQ_PORT}`,
      ],
      queue: configurationService.env.ERROR_QUEUE,
      noAck: true,
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
