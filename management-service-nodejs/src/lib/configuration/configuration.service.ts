import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentConfig } from './env.config';

@Injectable()
export class ConfigurationService {
  @Inject()
  private readonly configService: ConfigService;

  private getKey<T>(key: string) {
    const value = this.configService.get<T>(key);
    if (value === undefined)
      throw new Error(`Missing property ${key} in configuration object.`);
    return value;
  }

  get env(): EnvironmentConfig {
    return this.getKey<EnvironmentConfig>('video-downloader-env');
  }
}
