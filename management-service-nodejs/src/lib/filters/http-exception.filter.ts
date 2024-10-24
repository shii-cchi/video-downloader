import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const status = exception.getStatus();
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    this.logger.error(
      `Path: ${req.url}, HTTP Method: ${req.method}, HTTP Status: ${status}, Error Message: ${exception.message}, Body: ${JSON.stringify(req.body)}, Params: ${JSON.stringify(req.params)}`,
    );

    res.status(status).json(exception.getResponse());
  }
}
