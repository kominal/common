import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  public use(req: Request, res: Response, next: NextFunction): void {
    const time = new Date().getTime();
    const requestText = `${req.method} ${req.originalUrl}`;
    this.logger.log(requestText);
    res.on('close', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      this.logger.log(`${requestText} ${statusCode} ${contentLength} ${new Date().getTime() - time}ms`);
    });
    next();
  }
}
