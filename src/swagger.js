import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Adopción de Mascotas',
      version: '1.0.0',
      description: 'Documentación API para el módulo de Users',
    },
    servers: [
      {
        url: 'http://localhost:3500/api',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/dao/models/*.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;