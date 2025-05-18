import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';
import { writeFileSync } from 'fs';
import { exit } from 'process';
import { CommonExceptionFilter } from '../helpers/exception-filter';
import { CommonLogger } from '../helpers/logger';

process.on('uncaughtException', (exception) => {
  console.log(exception);
});

function getOpenAPIObject(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Core')
    .addServer('/api/core', 'Current installation')
    .addBearerAuth() //
    .build();

  return SwaggerModule.createDocument(app, config);
}

export function findControllers(module: any): any[] {
  const reflector = new Reflector();
  const controllers = reflector.get<any[]>('controllers', module) || [];
  const imports = reflector.get<any[]>('imports', module) || [];
  return [...imports.reduce((acc: any[], mod: any) => [...acc, ...findControllers(mod)], []), ...controllers];
}

export async function bootstrap(module: any, bodyParser = true): Promise<void> {
  if (process.env.GENERATE_SWAGGER) {
    const moduleRef: TestingModule = await Test.createTestingModule({ controllers: findControllers(module) })
      .useMocker(() => ({}))
      .compile();
    const app = moduleRef.createNestApplication();

    writeFileSync('swagger.json', JSON.stringify(getOpenAPIObject(app), null, 2));
    exit(0);
  } else {
    const app = await NestFactory.create(module, {
      logger: new CommonLogger(),
      cors: { origin: '*' },
      bodyParser,
    });
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new CommonExceptionFilter());
    app.enableCors();
    SwaggerModule.setup('api', app, getOpenAPIObject(app));
    await app.listen(3000);
  }
}
