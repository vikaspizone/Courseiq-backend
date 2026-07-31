import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const builder = new DocumentBuilder()
    .setTitle('CourseIQ API')
    .setDescription('CourseIQ Backend API Documentation')
    .setVersion('1.0');

  // Load servers from env dynamically or set default options
  const serversEnv = process.env.SWAGGER_SERVERS;
  if (serversEnv) {
    const servers = serversEnv.split(',');
    for (const server of servers) {
      const [url, description] = server.split('|');
      builder.addServer(url.trim(), description?.trim() || '');
    }
  } else {
    const port = process.env.PORT || '3000';
    builder.addServer(`http://localhost:${port}`, 'Local Server');
    builder.addServer('https://api.courseiq.com', 'Production Server');
  }

  const config = builder
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addGlobalParameters({
      name: 'Accept-Language',
      in: 'header',
      required: false,
      schema: { default: 'en', type: 'string', enum: ['en', 'hi'] },
      description: 'Language code for localized response',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = process.env.SWAGGER_PATH || 'api/docs';
  SwaggerModule.setup(swaggerPath, app, document);
}
