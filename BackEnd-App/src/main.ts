import { NestFactory } from '@nestjs/core';
import { AppModule } from './server/AppModule';
import Constants from './common/Constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Constants.WEB_PORT);
}
bootstrap();