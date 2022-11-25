import { NestFactory } from '@nestjs/core';
import { PostsApiModule } from './posts-api.module';
import * as fs from 'fs';
import { cwd } from 'process';
import { certificateFor } from 'devcert';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { OgmaService } from '@ogma/nestjs-module';
import { Logger } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import helmet from 'helmet';

const generateCerts = async () => {
  // we create certs for dev local env so we can use https
  await certificateFor('localhost')
    .then(({ key, cert }) => {
      fs.writeFileSync(`${cwd()}/apps/pandas-api/cert/tls.key`, key);
      fs.writeFileSync(`${cwd()}/apps/pandas-api/cert/tls.cert`, cert);
    })
    .catch(console.error);
  return {
    key: fs.readFileSync(`${cwd()}/apps/pandas-api/cert/tls.key`),
    cert: fs.readFileSync(`${cwd()}/apps/pandas-api/cert/tls.cert`),
  };
};

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(
      PostsApiModule,
      process.env.NODE_ENV === 'production'
        ? { logger: false }
        : process.env.USE_HTTPS === '1'
        ? {
            httpsOptions: await generateCerts(),
          }
        : undefined,
    );

    const logger = app.get<OgmaService>(OgmaService);
    app.useLogger(logger);
    const configService = app.get(ConfigService);

    // Add helmet for some well-known web vulnerabilities which will set HTTP headers appropriately.
    app.use(
      helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy:
          process.env.NODE_ENV === 'production' ? undefined : false,
      }),
    );
    // Enable CORS
    app.enableCors(configService.get<CorsOptions>('cors'));

    const PORT = configService.get<number>('port');

    await app.listen(PORT).then(() => {
      Logger.log(`🚀 Users server ready at port ${PORT}`);
    });
  } catch (e) {
    Logger.error(`[ERROR] [server]: ${e.message}`);
  }
}

bootstrap();
