import mongoose from 'mongoose';
import Usuario from './usuario.model.js';
import AppError from '../../errors/AppError.js';

const aPublico = (u) => ({
  id: u._id.toString(),
  nombre: u.nombre ?? null,
  email: u.email,
  rol: u.rol,
  activo: u.activo,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt
});

export const listUsuarios = async () => {
  const usuarios = await Usuario.find({}).sort({ createdAt: -1 }).lean();
  return { data: usuarios.map(aPublico) };
};

export const updateUsuario = async (id, data = {}) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Identificador inválido', 400, 'ID_INVALIDO');
  }

  const usuario = await Usuario.findById(id);
  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404, 'USUARIO_NO_ENCONTRADO');
  }

  if (data.nombre !== undefined) {
    usuario.nombre = data.nombre ? String(data.nombre).trim() : null;
  }

  if (data.rol !== undefined) {
    if (!['admin', 'user'].includes(data.rol)) {
      throw new AppError('Rol inválido', 400, 'VALIDACION_FALLIDA');
    }
    usuario.rol = data.rol;
  }

  if (data.activo !== undefined) {
    usuario.activo = Boolean(data.activo);
  }

  await usuario.save();
  return aPublico(usuario);
};

export const deleteUsuario = async (id, usuarioActualId) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Identificador inválido', 400, 'ID_INVALIDO');
  }

  const usuario = await Usuario.findById(id);
  if (!usuario) {
    throw new AppError('Usuario no encontrado', 404, 'USUARIO_NO_ENCONTRADO');
  }

  if (usuarioActualId && usuario._id.toString() === String(usuarioActualId)) {
    throw new AppError('No puedes eliminar tu propia cuenta', 409, 'ACCION_NO_PERMITIDA');
  }

  await usuario.deleteOne();
  return null;
};

export default {
  listUsuarios,
  updateUsuario,
  deleteUsuario
};
