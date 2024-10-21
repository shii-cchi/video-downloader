import { Module } from '@nestjs/common';
import { VideosModule } from './videos/videos.module';
import { ConfigModule } from '@nestjs/config';
import EnvironmentConfig from 'src/lib/configuration/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvironmentConfig],
    }),
    VideosModule,
  ],
})
export class AppModule {}
