import { getLogger } from '../utils/logger.js';

const loggerMiddleware = (req, res, next) => {
  req.logger = getLogger();
  req.logger.http(`${req.method} ${req.url}`);
  next();
};

export default loggerMiddleware;