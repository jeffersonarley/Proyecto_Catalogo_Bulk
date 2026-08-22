import mongoose from 'mongoose';
import { proveedorRepository } from './proveedor.repository.js';
import { productoRepository } from '../productos/producto.repository.js';
import AppError from '../../errors/AppError.js';

const slugify = (value = '') => {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || null;
};

export const createProveedor = async (data = {}) => {
  const nombre = String(data.nombre || '').trim();
  if (!nombre) {
    throw new AppError('El nombre del proveedor es obligatorio', 400, 'VALIDACION_FALLIDA');
  }

  const slug = String(data.slug || '').trim().toLowerCase() || slugify(nombre);

  const [porNombre, porSlug] = await Promise.all([
    proveedorRepository.porNombre(nombre),
    proveedorRepository.porSlug(slug)
  ]);

  if (porNombre) {
    throw new AppError('nombre duplicado', 409, 'NOMBRE_DUPLICADO');
  }
  if (porSlug) {
    throw new AppError('slug duplicado', 409, 'SLUG_DUPLICADO');
  }

  return proveedorRepository.crear({
    ...data,
    nombre,
    slug
  });
};

export const getProveedorById = async (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Identificador inválido', 400, 'ID_INVALIDO');
  }

  const proveedor = await proveedorRepository.porId(id);
  if (!proveedor) {
    throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NO_ENCONTRADO');
  }

  return proveedor;
};

export const listProveedores = async (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Number(query.limit) || 20);

  const filtros = {};
  if (query.activo !== undefined) {
    filtros.activo = query.activo === 'true' || query.activo === true;
  }

  const { items, total } = await proveedorRepository.listar(filtros, { page, limit });

  return {
    data: items,
    page,
    limit,
    total
  };
};

export const updateProveedor = async (id, data = {}) => {
  const proveedor = await proveedorRepository.porIdEditable(id);
  if (!proveedor) {
    throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NO_ENCONTRADO');
  }

  if (data.nombre !== undefined && data.nombre !== null) {
    const nombre = String(data.nombre).trim();
    const existente = await proveedorRepository.porNombre(nombre);
    if (existente && existente._id.toString() !== proveedor._id.toString()) {
      throw new AppError('nombre duplicado', 409, 'NOMBRE_DUPLICADO');
    }
    proveedor.nombre = nombre;
  }

  if (data.slug !== undefined && data.slug !== null) {
    const slug = String(data.slug).trim().toLowerCase();
    const existente = await proveedorRepository.porSlug(slug);
    if (existente && existente._id.toString() !== proveedor._id.toString()) {
      throw new AppError('slug duplicado', 409, 'SLUG_DUPLICADO');
    }
    proveedor.slug = slug;
  }

  if (data.contactoEmail !== undefined) {
    proveedor.contactoEmail = data.contactoEmail;
  }

  if (data.logoUrl !== undefined) {
    proveedor.logoUrl = data.logoUrl;
  }

  if (data.activo !== undefined) {
    proveedor.activo = Boolean(data.activo);
  }

  return proveedorRepository.guardar(proveedor);
};

export const deleteProveedor = async (id) => {
  const proveedor = await proveedorRepository.porIdEditable(id);
  if (!proveedor) {
    throw new AppError('Proveedor no encontrado', 404, 'PROVEEDOR_NO_ENCONTRADO');
  }

  const productosCount = await productoRepository.contarPorProveedor(proveedor._id);
  if (productosCount > 0) {
    throw new AppError(
      'No se puede eliminar el proveedor porque tiene productos asociados',
      409,
      'PROVEEDOR_CON_PRODUCTOS'
    );
  }

  await proveedorRepository.eliminar(proveedor);
  return null;
};

export default {
  createProveedor,
  getProveedorById,
  listProveedores,
  updateProveedor,
  deleteProveedor
};
