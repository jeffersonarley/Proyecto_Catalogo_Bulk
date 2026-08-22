import AppError from '../errors/AppError.js';

const mapearDuplicado = (err) => {
  const keyValue = err.keyValue || {};
  if (keyValue.sku !== undefined) return 'sku duplicado';
  if (keyValue.slug !== undefined) return 'slug duplicado';
  if (keyValue.nombre !== undefined) return 'nombre duplicado';
  if (keyValue.email !== undefined) return 'email ya registrado';
  const campo = Object.keys(keyValue)[0];
  return campo ? `${campo} duplicado` : 'recurso duplicado';
};

export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let codigo = err.codigo || 'ERROR_INTERNO';
  let mensaje = err.message || 'Error interno del servidor';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    codigo = err.codigo;
    mensaje = err.message;
  } else if (err.name === 'MongoServerError' && err.code === 11000) {
    statusCode = 409;
    codigo = 'RECURSO_DUPLICADO';
    mensaje = mapearDuplicado(err);
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    codigo = 'VALIDACION_FALLIDA';
    mensaje = Object.values(err.errors)[0]?.message || 'Datos inválidos';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    codigo = 'ID_INVALIDO';
    mensaje = `Identificador inválido: ${err.value}`;
  } else if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      statusCode = 413;
      codigo = 'ARCHIVO_MUY_GRANDE';
      mensaje = 'El archivo supera el tamaño máximo permitido';
    } else {
      statusCode = 400;
      codigo = 'ERROR_UPLOAD';
      mensaje = `Error al subir el archivo: ${err.message}`;
    }
  } else if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    statusCode = 400;
    codigo = 'JSON_INVALIDO';
    mensaje = 'Cuerpo JSON inválido';
  }

  if (statusCode >= 500) {
    console.error('💥', err.stack || err);
  }

  return res.status(statusCode).json({
    error: {
      codigo,
      mensaje
    }
  });
};

export default errorHandler;
