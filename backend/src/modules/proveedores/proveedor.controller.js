import {
  cambiarEstadoProveedor,
  createProveedor,
  getProveedorById,
  listProveedores,
  updateProveedor
} from './proveedor.service.js';

export const createProveedorController = async (req, res, next) => {
  try {
    const proveedor = await createProveedor(req.body || {});
    return res.status(201).json(proveedor);
  } catch (error) {
    return next(error);
  }
};

export const getProveedorController = async (req, res, next) => {
  try {
    const proveedor = await getProveedorById(req.params.id);
    return res.status(200).json(proveedor);
  } catch (error) {
    return next(error);
  }
};

export const getProveedoresController = async (req, res, next) => {
  try {
    const resultado = await listProveedores(req.query || {});
    return res.status(200).json(resultado);
  } catch (error) {
    return next(error);
  }
};

export const updateProveedorController = async (req, res, next) => {
  try {
    const proveedor = await updateProveedor(req.params.id, req.body || {});
    return res.status(200).json(proveedor);
  } catch (error) {
    return next(error);
  }
};

export const cambiarEstadoProveedorController = async (req, res, next) => {
  try {
    const proveedor = await cambiarEstadoProveedor(req.params.id, req.body?.activo);
    return res.status(200).json(proveedor);
  } catch (error) {
    return next(error);
  }
};

export default {
  createProveedorController,
  getProveedorController,
  getProveedoresController,
  updateProveedorController,
  cambiarEstadoProveedorController
};
