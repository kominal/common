import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';
import { json } from 'body-parser';
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

function findControllers(module: any): any[] {
  const reflector = new Reflector();
  let controllers = reflector.get<any[]>('controllers', module) || [];
  if (module && module.controllers) {
    controllers = [...controllers, ...module.controllers];
  }
  return controllers;
}

function findProviders(module: any): any[] {
  const reflector = new Reflector();
  let providers = reflector.get<any[]>('providers', module) || [];
  if (module && module.providers) {
    providers = [...providers, ...module.providers];
  }
  return providers;
}

export async function bootstrap(module: any, swaggerModules: any[] = [], bodyParser = true, whitelist = true): Promise<void> {
  if (process.env.GENERATE_SWAGGER) {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: swaggerModules.flatMap((m) => findControllers(m)),
      providers: swaggerModules.flatMap((m) => findProviders(m)).map((provide) => ({ provide, useValue: undefined })),
    })
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
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist }));
    app.useGlobalFilters(new CommonExceptionFilter());
    app.enableCors();
    if (bodyParser) {
      app.use(json({ limit: '8mb' }));
    }
    SwaggerModule.setup('docs', app, getOpenAPIObject(app));
    await app.listen(3000);
  }
}
