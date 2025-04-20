import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { JsonBodyMiddleware } from '../middlewares/json-body.middleware';
import { RequestLoggingMiddleware } from '../middlewares/request-logging.middleware';

export abstract class CommonAppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggingMiddleware, JsonBodyMiddleware).forRoutes('*');
  }
}
