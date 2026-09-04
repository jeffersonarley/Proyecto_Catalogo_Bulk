import {
  cambiarEstadoProducto,
  createProducto,
  getProductoById,
  getProductoStats,
  listProductos,
  updateProducto
} from './producto.service.js';

export const createProductoController = async (req, res, next) => {
  try {
    const producto = await createProducto(req.body || {});
    return res.status(201).json(producto);
  } catch (error) {
    return next(error);
  }
};

export const getProductoController = async (req, res, next) => {
  try {
    const producto = await getProductoById(req.params.id);
    return res.status(200).json(producto);
  } catch (error) {
    return next(error);
  }
};

export const getProductosController = async (req, res, next) => {
  try {
    const resultado = await listProductos(req.query || {});
    return res.status(200).json(resultado);
  } catch (error) {
    return next(error);
  }
};

export const getProductoStatsController = async (req, res, next) => {
  try {
    const stats = await getProductoStats();
    return res.status(200).json(stats);
  } catch (error) {
    return next(error);
  }
};

export const updateProductoController = async (req, res, next) => {
  try {
    const producto = await updateProducto(req.params.id, req.body || {});
    return res.status(200).json(producto);
  } catch (error) {
    return next(error);
  }
};

export const cambiarEstadoProductoController = async (req, res, next) => {
  try {
    const producto = await cambiarEstadoProducto(req.params.id, req.body?.activo);
    return res.status(200).json(producto);
  } catch (error) {
    return next(error);
  }
};

export default {
  createProductoController,
  getProductoController,
  getProductosController,
  getProductoStatsController,
  updateProductoController,
  cambiarEstadoProductoController
};
