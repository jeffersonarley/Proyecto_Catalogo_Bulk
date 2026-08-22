import Proveedor from './proveedor.model.js';

export const proveedorRepository = {
  crear: (data) => Proveedor.create(data),

  porId: (id) => Proveedor.findById(id).lean(),

  porIdEditable: (id) => Proveedor.findById(id),

  porSlug: (slug) => Proveedor.findOne({ slug }).lean(),

  porNombre: (nombre) => Proveedor.findOne({ nombre }).lean(),

  listar: async (filtros = {}, { page = 1, limit = 20 } = {}) => {
    const [items, total] = await Promise.all([
      Proveedor.find(filtros)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Proveedor.countDocuments(filtros)
    ]);
    return { items, total };
  },

  guardar: (doc) => doc.save(),

  eliminar: (doc) => doc.deleteOne()
};

export default proveedorRepository;
