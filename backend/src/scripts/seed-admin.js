import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import Usuario from '../modules/auth/usuario.model.js';

const EMAIL = 'Bulkadmin@gmail.com';
const PASSWORD = 'Admin1234';

const seedAdmin = async () => {
  await mongoose.connect(ENV.mongoUri, {
    serverSelectionTimeoutMS: 5000
  });
  console.log('✅ Conexión a MongoDB establecida');

  const email = EMAIL.toLowerCase();
  let admin = await Usuario.findOne({ email });

  if (admin) {
    admin.rol = 'admin';
    admin.activo = true;
    admin.password = PASSWORD;
    await admin.save();
    console.log(`✅ Admin existente actualizado: ${admin.email}`);
  } else {
    admin = await Usuario.create({
      email,
      password: PASSWORD,
      rol: 'admin',
      activo: true,
      nombre: 'Administrador Bulk'
    });
    console.log(`✅ Admin creado: ${admin.email}`);
  }

  await mongoose.disconnect();
};

seedAdmin().catch((error) => {
  console.error('❌ Error en el seed de admin:', error.message);
  process.exit(1);
});
