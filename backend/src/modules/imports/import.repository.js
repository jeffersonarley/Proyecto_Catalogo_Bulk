import ImportJob from './importJob.model.js';

export const importRepository = {
  crear: (data) => ImportJob.create(data),

  porId: (id) => ImportJob.findById(id).lean(),

  porBullJobId: (bullJobId) => ImportJob.findOne({ bullJobId }).lean(),

  listar: async (filtros = {}, { page = 1, limit = 20 } = {}) => {
    const [items, total] = await Promise.all([
      ImportJob.find(filtros)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ImportJob.countDocuments(filtros)
    ]);
    return { items, total };
  },

  setBullJobId: (id, bullJobId) =>
    ImportJob.findByIdAndUpdate(
      id,
      { $set: { bullJobId: String(bullJobId) } },
      { new: true }
    ),

  marcarProcesando: (id) =>
    ImportJob.findByIdAndUpdate(
      id,
      {
        $set: { estado: 'processing', startedAt: new Date() },
        $inc: {}
      },
      { new: true }
    ),

  setTotal: (id, total) =>
    ImportJob.findByIdAndUpdate(id, { $set: { total } }, { new: true }),

  incrementar: (id, { exitososDelta = 0, fallidosDelta = 0 }) =>
    ImportJob.findByIdAndUpdate(
      id,
      {
        $inc: {
          procesados: exitososDelta + fallidosDelta,
          exitosos: exitososDelta,
          fallidos: fallidosDelta
        }
      },
      { new: true }
    ),

  agregarErrores: (id, nuevos, cap) =>
    ImportJob.findByIdAndUpdate(
      id,
      {
        $push: {
          errores: {
            $each: nuevos,
            $slice: -cap
          }
        }
      },
      { new: true }
    ),

  completar: (id, statsFinales = {}) =>
    ImportJob.findByIdAndUpdate(
      id,
      {
        $set: {
          estado: 'completed',
          finishedAt: new Date(),
          ...statsFinales
        }
      },
      { new: true }
    ),

  fallar: (id, motivoFallo, statsFinales = {}) =>
    ImportJob.findByIdAndUpdate(
      id,
      {
        $set: {
          estado: 'failed',
          motivoFallo,
          finishedAt: new Date(),
          ...statsFinales
        }
      },
      { new: true }
    )
};

export default importRepository;
