import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { exit } from 'process';
import { CommonExceptionFilter } from '../helpers/exception-filter';
import { CommonLogger } from '../helpers/logger';

process.on('uncaughtException', (exception) => {
  console.log(exception);
});

export async function bootstrap(module: any): Promise<void> {
  const app = await NestFactory.create(module, {
    logger: new CommonLogger(),
    cors: { origin: '*' },
    bodyParser: false,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new CommonExceptionFilter());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Core')
    .addServer('/api/core', 'Current installation')
    .addBearerAuth() //
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app as any, document);

  if (process.env.GENERATE_SWAGGER) {
    writeFileSync('swagger.json', JSON.stringify(document));
    exit(0);
  } else {
    await app.listen(3000);
  }
}
