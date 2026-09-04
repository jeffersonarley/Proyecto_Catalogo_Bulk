import Producto from './producto.model.js';

export const productoRepository = {
  crear: (data) => Producto.create(data),

  insertarMuchos: (docs) => Producto.insertMany(docs, { ordered: false }),

  porId: (id) => Producto.findById(id).lean(),

  porIdEditable: (id) => Producto.findById(id),

  porSku: (sku) => Producto.findOne({ sku }).lean(),

  listar: async (filtros = {}, { page = 1, limit = 20 } = {}) => {
    const [items, total] = await Promise.all([
      Producto.find(filtros)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Producto.countDocuments(filtros)
    ]);
    return { items, total };
  },

  guardar: (doc) => doc.save(),

  buscarPorSkus: (skus) =>
    Producto.find({ sku: { $in: skus } }, 'sku').lean(),

  estadisticas: async () => {
    const [resumen] = await Producto.aggregate([
      {
        $group: {
          _id: null,
          totalProductos: { $sum: 1 },
          precioPromedio: { $avg: '$precio' }
        }
      }
    ]);

    const porCategoria = await Producto.aggregate([
      {
        $group: {
          _id: '$categoria',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1, _id: 1 } },
      { $project: { _id: 0, categoria: '$_id', count: 1 } }
    ]);

    return {
      totalProductos: resumen?.totalProductos ?? 0,
      precioPromedio:
        resumen?.precioPromedio != null
          ? Math.round(resumen.precioPromedio * 100) / 100
          : 0,
      porCategoria
    };
  }
};

export default productoRepository;
