import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV == 'DEV') {
    const config = new DocumentBuilder()
      .setTitle('CorralWars Documentation')
      .setDescription('CorralWars Api Documentation')
      .setVersion('1.0')
      .addTag('CorralWars')
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
