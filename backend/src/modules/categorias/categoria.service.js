import mongoose from 'mongoose';
import { categoriaRepository } from './categoria.repository.js';
import AppError from '../../errors/AppError.js';

export const getCategoriaBySlug = async (slug) => {
  if (!slug) {
    throw new AppError('El slug es obligatorio', 400, 'VALIDACION_FALLIDA');
  }

  const categoria = await categoriaRepository.porSlug(String(slug).trim().toLowerCase());
  if (!categoria) {
    throw new AppError('Categoría no encontrada', 404, 'CATEGORIA_NO_ENCONTRADA');
  }

  return categoria;
};

export const listCategorias = async () => {
  const items = await categoriaRepository.listar();
  return { data: items };
};

export const updateCategoria = async (id, data = {}) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Identificador inválido', 400, 'ID_INVALIDO');
  }

  const categoria = await categoriaRepository.porIdEditable(id);
  if (!categoria) {
    throw new AppError('Categoría no encontrada', 404, 'CATEGORIA_NO_ENCONTRADA');
  }

  if (data.nombre !== undefined && data.nombre !== null) {
    categoria.nombre = String(data.nombre).trim();
  }
  if (data.descripcion !== undefined) {
    categoria.descripcion = data.descripcion;
  }
  if (data.imagenUrl !== undefined) {
    categoria.imagenUrl = data.imagenUrl;
  }

  return categoriaRepository.guardar(categoria);
};

export default {
  getCategoriaBySlug,
  listCategorias,
  updateCategoria
};
