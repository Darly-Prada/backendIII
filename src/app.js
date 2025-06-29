import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mocksRouter from './routes/mocks.router.js';   
import { getLogger } from './utils/logger.js';
import loggerMiddleware from './middlewares/logger.middleware.js';

import setupSwagger from './swagger.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const logger = getLogger();

mongoose.connect(process.env.MONGO_URL)
  .then(() => logger.info('Base de Datos Conectada'))
  .catch(err => logger.error('Error de conexión a Base de Datos:', err));

app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);
setupSwagger(app);

app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/mocks', mocksRouter);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Adopciones',
      version: '1.0.0',
      description: 'Documentación de la API con Swagger',
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/loggerTest', (req, res) => {
  req.logger.debug('Este es un debug');
  req.logger.http('Este es un http');
  req.logger.info('Este es un info');
  req.logger.warning('Este es un warning');
  req.logger.error('Este es un error');
  req.logger.fatal('Este es un fatal');
  res.send('Logs generados. Ver consola y archivo "errors.log".');
});

// Exportar la app para poder usarla en tests
export default app;

// Solo si el archivo es ejecutado directamente, levantar el servidor
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3500;
  app.listen(PORT, () => logger.info(`Listening on ${PORT}`));
}
