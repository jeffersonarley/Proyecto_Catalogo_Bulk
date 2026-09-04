import Categoria from './categoria.model.js';

const capitalizar = (slug) =>
  String(slug)
    .split('-')
    .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : p))
    .join(' ');

export const categoriaRepository = {
  listar: () => Categoria.find({}).sort({ nombre: 1 }).lean(),

  porId: (id) => Categoria.findById(id).lean(),

  porIdEditable: (id) => Categoria.findById(id),

  porSlug: (slug) => Categoria.findOne({ slug }).lean(),

  upsertPorSlug: async (slug) => {
    return Categoria.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          slug,
          nombre: capitalizar(slug),
          descripcion: null,
          imagenUrl: null
        }
      },
      { upsert: true, new: true, lean: true }
    );
  },

  upsertMuchosSlugs: async (slugs) => {
    if (!slugs.length) return [];
    const operaciones = [...slugs].map((slug) => ({
      updateOne: {
        filter: { slug },
        update: {
          $setOnInsert: {
            slug,
            nombre: capitalizar(slug),
            descripcion: null,
            imagenUrl: null
          }
        },
        upsert: true
      }
    }));
    await Categoria.bulkWrite(operaciones, { ordered: false });
    return Categoria.find({ slug: { $in: [...slugs] } }).lean();
  },

  guardar: (doc) => doc.save()
};

export default categoriaRepository;
