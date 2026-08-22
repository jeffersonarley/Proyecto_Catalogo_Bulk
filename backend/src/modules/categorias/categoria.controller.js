import {
  getCategoriaBySlug,
  listCategorias,
  updateCategoria
} from './categoria.service.js';

export const getCategoriaController = async (req, res, next) => {
  try {
    const categoria = await getCategoriaBySlug(req.params.slug);
    return res.status(200).json(categoria);
  } catch (error) {
    return next(error);
  }
};

export const getCategoriasController = async (req, res, next) => {
  try {
    const resultado = await listCategorias();
    return res.status(200).json(resultado);
  } catch (error) {
    return next(error);
  }
};

export const updateCategoriaController = async (req, res, next) => {
  try {
    const categoria = await updateCategoria(req.params.id, req.body || {});
    return res.status(200).json(categoria);
  } catch (error) {
    return next(error);
  }
};

export default {
  getCategoriaController,
  getCategoriasController,
  updateCategoriaController
};
