export class AppError extends Error {
  constructor(mensaje, statusCode = 500, codigo = 'ERROR_INTERNO') {
    super(mensaje);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.codigo = codigo;
    this.esOperacional = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
