import mongoose from 'mongoose';
import { productoRepository } from './producto.repository.js';
import { proveedorRepository } from '../proveedores/proveedor.repository.js';
import AppError from '../../errors/AppError.js';

const normalizarSku = (sku) => String(sku).trim().toUpperCase();

export const createProducto = async (data = {}) => {
  if (!data.proveedorId) {
    throw new AppError('El proveedorId es obligatorio', 400, 'VALIDACION_FALLIDA');
  }

  const proveedor = await proveedorRepository.porId(data.proveedorId);
  if (!proveedor) {
    throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NO_ENCONTRADO');
  }

  if (data.sku) {
    const skuNormalizado = normalizarSku(data.sku);
    const existente = await productoRepository.porSku(skuNormalizado);
    if (existente) {
      throw new AppError('sku duplicado', 409, 'SKU_DUPLICADO');
    }
  }

  return productoRepository.crear(data);
};

export const getProductoById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Identificador inválido', 400, 'ID_INVALIDO');
  }

  const producto = await productoRepository.porId(id);
  if (!producto) {
    throw new AppError('Producto no encontrado', 404, 'PRODUCTO_NO_ENCONTRADO');
  }

  return producto;
};

const resolverProveedor = async (valor) => {
  if (mongoose.isValidObjectId(valor)) {
    return proveedorRepository.porId(valor);
  }
  return proveedorRepository.porSlug(String(valor).trim().toLowerCase());
};

export const listProductos = async (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

  const filtros = {};

  if (query.categoria) {
    filtros.categoria = String(query.categoria).trim().toLowerCase();
  }

  if (query.disponible !== undefined) {
    filtros.disponible = query.disponible === 'true' || query.disponible === true;
  }

  if (query.activo !== undefined) {
    filtros.activo = query.activo === 'true' || query.activo === true;
  }

  if (query.proveedor) {
    const proveedor = await resolverProveedor(query.proveedor);
    if (!proveedor) {
      return { data: [], page, limit, total: 0 };
    }
    filtros.proveedorId = proveedor._id;
  }

  const { items, total } = await productoRepository.listar(filtros, { page, limit });

  return {
    data: items,
    page,
    limit,
    total
  };
};

export const getProductoStats = async () => {
  return productoRepository.estadisticas();
};

export const updateProducto = async (id, data = {}) => {
  const producto = await productoRepository.porIdEditable(id);
  if (!producto) {
    throw new AppError('Producto no encontrado', 404, 'PRODUCTO_NO_ENCONTRADO');
  }

  if (data.sku !== undefined && data.sku !== null) {
    const skuNormalizado = normalizarSku(data.sku);
    const existente = await productoRepository.porSku(skuNormalizado);
    if (existente && existente._id.toString() !== producto._id.toString()) {
      throw new AppError('sku duplicado', 409, 'SKU_DUPLICADO');
    }
    data.sku = skuNormalizado;
  }

  if (data.proveedorId !== undefined) {
    const proveedor = await proveedorRepository.porId(data.proveedorId);
    if (!proveedor) {
      throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NO_ENCONTRADO');
    }
  }

  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      producto[key] = data[key];
    }
  });

  return productoRepository.guardar(producto);
};

export const cambiarEstadoProducto = async (id, activo) => {
  const producto = await productoRepository.porIdEditable(id);
  if (!producto) {
    throw new AppError('Producto no encontrado', 404, 'PRODUCTO_NO_ENCONTRADO');
  }

  producto.activo = Boolean(activo);
  return productoRepository.guardar(producto);
};

export default {
  createProducto,
  getProductoById,
  listProductos,
  getProductoStats,
  updateProducto,
  cambiarEstadoProducto
};
