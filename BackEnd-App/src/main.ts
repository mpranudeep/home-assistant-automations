import { NestFactory } from '@nestjs/core';
import { AppModule } from './server/AppModule';
import Constants from './common/Constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log(`Web Port : ${Constants.WEB_PORT}`);
  await app.listen(Constants.WEB_PORT,'0.0.0.0');
}
bootstrap();