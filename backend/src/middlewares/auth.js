import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import AppError from '../errors/AppError.js';

export const auth = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !String(header).startsWith('Bearer ')) {
    return next(new AppError('No autorizado: token ausente', 401, 'TOKEN_AUSENTE'));
  }

  const token = String(header).split(' ')[1];

  try {
    const payload = jwt.verify(token, ENV.jwtSecret);
    req.usuario = { id: payload.sub, rol: payload.rol };
    return next();
  } catch {
    return next(new AppError('No autorizado: token inválido', 401, 'TOKEN_INVALIDO'));
  }
};

export default auth;
