import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';

import { AppModule } from '@/app.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '@/common/interceptors/transform-response.interceptor';
import { PrismaService } from '@/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Behind nginx: trust exactly one proxy hop so request.ip is the real client
  // IP (from X-Forwarded-For) rather than nginx's address. Use the numeric hop
  // count, NOT `true` — `true` would trust the client-controlled leftmost XFF
  // entry and make IP-keyed rate limiting spoofable.
  app.set('trust proxy', 1);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);
  const uploadRoot = configService.get<string>('uploadRoot') ?? 'uploads';
  const allowedOrigins = [
    ...String(configService.get<string>('allowedOrigins') ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    configService.get<string>('frontendUrl'),
    configService.get<string>('adminUrl'),
  ].filter(Boolean);

  app.setGlobalPrefix('api');
  app.useStaticAssets(join(process.cwd(), uploadRoot), {
    prefix: `/${uploadRoot}/`,
    setHeaders: (res, filePath) => {
      // Never render svg/pdf inline (stored-XSS vector); force download.
      // Raster images stay inline so <img> rendering is unaffected.
      if (/\.(svg|pdf)$/i.test(filePath)) {
        res.setHeader('Content-Disposition', 'attachment');
        res.setHeader('X-Content-Type-Options', 'nosniff');
      }
    },
  });
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'), false);
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidUnknownValues: false,
    }),
  );
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new TransformResponseInterceptor(),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger is a development aid only. Never expose it (nor pay for the
  // controller scan in createDocument) in production.
  if (configService.get<string>('nodeEnv') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Corporate Site API')
      .setDescription('Manufacturing corporate website API base modules and admin endpoints.')
      .setVersion('0.1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'bearer',
      )
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
      },
    });
  }

  const port = configService.get<number>('port') ?? 3001;
  await app.get(PrismaService).enableShutdownHooks(app);
  await app.listen(port);
}

bootstrap();
