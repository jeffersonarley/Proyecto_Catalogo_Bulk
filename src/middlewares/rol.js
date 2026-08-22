import AppError from '../errors/AppError.js';

export const rol = (requiredRole) => {
  return (req, _res, next) => {
    const usuario = req.usuario;

    if (!usuario) {
      return next(new AppError('No autorizado', 401, 'NO_AUTORIZADO'));
    }

    if (usuario.rol !== requiredRole) {
      return next(new AppError('No tienes permisos para realizar esta acción', 403, 'ROL_INSUFICIENTE'));
    }

    return next();
  };
};

export default rol;
