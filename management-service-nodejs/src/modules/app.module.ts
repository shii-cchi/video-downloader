import { Module } from '@nestjs/common';
import { VideosModule } from './videos/videos.module';
import { ConfigModule } from '@nestjs/config';
import EnvironmentConfig from 'src/lib/configuration/env.config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigurationModule } from '../lib/configuration/configuration.module';
import { ConfigurationService } from '../lib/configuration/configuration.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvironmentConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configurationService: ConfigurationService) => ({
        uri: `mongodb+srv://${configurationService.env.DB_USER}:${configurationService.env.DB_PASSWORD}@${configurationService.env.CLUSTER_NAME}`,
      }),
    }),
    VideosModule,
  ],
})
export class AppModule {}
