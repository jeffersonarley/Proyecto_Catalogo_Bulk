import { listUsuarios, updateUsuario } from './usuario.service.js';

export const listUsuariosController = async (_req, res, next) => {
  try {
    const resultado = await listUsuarios();
    return res.status(200).json(resultado);
  } catch (error) {
    return next(error);
  }
};

export const updateUsuarioController = async (req, res, next) => {
  try {
    const usuario = await updateUsuario(req.params.id, req.body || {});
    return res.status(200).json(usuario);
  } catch (error) {
    return next(error);
  }
};

export default {
  listUsuariosController,
  updateUsuarioController
};
