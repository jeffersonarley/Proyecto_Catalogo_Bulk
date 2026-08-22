import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Usuario from './usuario.model.js';
import { ENV } from '../../config/env.js';
import AppError from '../../errors/AppError.js';

const signToken = (usuario) => {
  return jwt.sign(
    { sub: usuario._id.toString(), rol: usuario.rol },
    ENV.jwtSecret,
    { expiresIn: ENV.jwtExpiresIn }
  );
};

export const registerUser = async ({ email, password, rol = 'user' }) => {
  if (!email || !password) {
    throw new AppError('El email y la contraseña son obligatorios', 400, 'DATOS_INCOMPLETOS');
  }

  const emailNormalizado = String(email).trim().toLowerCase();

  const usuarioExistente = await Usuario.findOne({ email: emailNormalizado });
  if (usuarioExistente) {
    throw new AppError('email ya registrado', 409, 'EMAIL_DUPLICADO');
  }

  const usuario = await Usuario.create({
    email: emailNormalizado,
    password,
    rol
  });

  return {
    id: usuario._id.toString(),
    email: usuario.email,
    rol: usuario.rol
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('El email y la contraseña son obligatorios', 400, 'DATOS_INCOMPLETOS');
  }

  const emailNormalizado = String(email).trim().toLowerCase();

  const usuario = await Usuario.findOne({ email: emailNormalizado }).select('+password');
  if (!usuario) {
    throw new AppError('Credenciales inválidas', 401, 'CREDENCIALES_INVALIDAS');
  }

  const passwordValida = await bcrypt.compare(String(password), usuario.password);
  if (!passwordValida) {
    throw new AppError('Credenciales inválidas', 401, 'CREDENCIALES_INVALIDAS');
  }

  return { token: signToken(usuario) };
};

export default {
  registerUser,
  loginUser
};
