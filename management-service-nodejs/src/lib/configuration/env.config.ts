import { registerAs } from '@nestjs/config';
import { plainToClass, Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

type TTransformerValue = { value: string | number };

export class EnvironmentConfig {
  @IsString()
  @IsNotEmpty()
  RABBITMQ_HOST: string;

  @Transform(({ value }: TTransformerValue) =>
    Number(value) ? Number(value) : null,
  )
  @IsNumber()
  RABBITMQ_PORT: number;

  @IsString()
  @IsNotEmpty()
  TO_DOWNLOAD_QUEUE: string;

  @IsString()
  @IsNotEmpty()
  DOWNLOADED_VIDEO_QUEUE: string;

  //   DB_USER: string;

  //   DB_PASSWORD: string;
}

export default registerAs(
  'video-downloader-env',
  function (): EnvironmentConfig {
    const validatedConfig = plainToClass(EnvironmentConfig, process.env);
    const errors = validateSync(validatedConfig, {
      skipMissingProperties: false,
    });
    if (errors.length > 0) {
      throw new Error(errors.toString());
    }
    return validatedConfig;
  },
);
