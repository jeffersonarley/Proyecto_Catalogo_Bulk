import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import Categoria from '../modules/categorias/categoria.model.js';
import Proveedor from '../modules/proveedores/proveedor.model.js';
import Producto from '../modules/productos/producto.model.js';

const categorias = [
  { slug: 'electronica', nombre: 'Electrónica', descripcion: 'Tecnología y dispositivos' },
  { slug: 'hogar', nombre: 'Hogar', descripcion: 'Artículos para el hogar' },
  { slug: 'ropa', nombre: 'Ropa', descripcion: 'Vestuario y accesorios' },
  { slug: 'deportes', nombre: 'Deportes', descripcion: 'Equipamiento deportivo' },
  { slug: 'belleza', nombre: 'Belleza', descripcion: 'Cuidado personal' },
  { slug: 'alimentos', nombre: 'Alimentos', descripcion: 'Productos gourmet' }
];

const proveedores = [
  { nombre: 'TechNorte S.A.', slug: 'technorte', contactoEmail: 'ventas@technorte.co' },
  { nombre: 'Hogar Colombia', slug: 'hogar-colombia', contactoEmail: 'info@hogarcolombia.co' },
  { nombre: 'Moda y Estilo', slug: 'moda-estilo', contactoEmail: 'contacto@modaestilo.co' },
  { nombre: 'Distribuidora Andina', slug: 'distribuidora-andina', contactoEmail: 'pedidos@distandina.co' }
];

const catalogo = [
  { sku: 'ELEC-001', nombre: 'Audífonos Inalámbricos Pro', precio: 189900, stock: 45, categoria: 'electronica', proveedor: 'technorte', descripcion: 'Audífonos bluetooth con cancelación de ruido.' },
  { sku: 'ELEC-002', nombre: 'Teclado Mecánico RGB', precio: 259900, stock: 30, categoria: 'electronica', proveedor: 'technorte', descripcion: 'Teclado mecánico con retroiluminación RGB.' },
  { sku: 'ELEC-003', nombre: 'Monitor LED 24"', precio: 689900, stock: 18, categoria: 'electronica', proveedor: 'technorte', descripcion: 'Monitor full HD de 24 pulgadas.', activo: false },
  { sku: 'ELEC-004', nombre: 'Mouse Ergonómico', precio: 89900, stock: 60, categoria: 'electronica', proveedor: 'technorte', descripcion: 'Mouse inalámbrico ergonómico.' },
  { sku: 'ELEC-005', nombre: 'Parlante Bluetooth Portátil', precio: 159900, stock: 40, categoria: 'electronica', proveedor: 'technorte', descripcion: 'Parlante portátil resistente al agua.' },
  { sku: 'ELEC-006', nombre: 'Cámara Web Full HD', precio: 219900, stock: 22, categoria: 'electronica', proveedor: 'technorte', descripcion: 'Cámara web 1080p con micrófono.' },
  { sku: 'HOGAR-001', nombre: 'Juego de Sábanas Queen', precio: 129900, stock: 35, categoria: 'hogar', proveedor: 'hogar-colombia', descripcion: 'Juego de sábanas de algodón.' },
  { sku: 'HOGAR-002', nombre: 'Olla a Presión 6L', precio: 179900, stock: 25, categoria: 'hogar', proveedor: 'hogar-colombia', descripcion: 'Olla a presión en acero inoxidable.', activo: false },
  { sku: 'HOGAR-003', nombre: 'Juego de Cubiertos 24pz', precio: 99900, stock: 50, categoria: 'hogar', proveedor: 'hogar-colombia', descripcion: 'Cubiertos de acero inoxidable.' },
  { sku: 'HOGAR-004', nombre: 'Lámpara de Escritorio LED', precio: 74900, stock: 40, categoria: 'hogar', proveedor: 'hogar-colombia', descripcion: 'Lámpara LED con brazo ajustable.' },
  { sku: 'HOGAR-005', nombre: 'Organizador de Cocina', precio: 54900, stock: 70, categoria: 'hogar', proveedor: 'hogar-colombia', descripcion: 'Organizador apilable para cocina.' },
  { sku: 'HOGAR-006', nombre: 'Ventilador de Torre', precio: 199900, stock: 20, categoria: 'hogar', proveedor: 'hogar-colombia', descripcion: 'Ventilador de torre silencioso.' },
  { sku: 'ROPA-001', nombre: 'Camiseta Básica Algodón', precio: 39900, stock: 120, categoria: 'ropa', proveedor: 'moda-estilo', descripcion: 'Camiseta de algodón 100%.' },
  { sku: 'ROPA-002', nombre: 'Jean Clásico Azul', precio: 119900, stock: 60, categoria: 'ropa', proveedor: 'moda-estilo', descripcion: 'Jean de corte clásico.' },
  { sku: 'ROPA-003', nombre: 'Chaqueta Impermeable', precio: 179900, stock: 30, categoria: 'ropa', proveedor: 'moda-estilo', descripcion: 'Chaqueta impermeable para lluvia.' },
  { sku: 'ROPA-004', nombre: 'Tenis Urbanos', precio: 149900, stock: 45, categoria: 'ropa', proveedor: 'moda-estilo', descripcion: 'Tenis urbanos de uso diario.' },
  { sku: 'ROPA-005', nombre: 'Bufanda de Lana', precio: 49900, stock: 80, categoria: 'ropa', proveedor: 'moda-estilo', descripcion: 'Bufanda tejida en lana.', activo: false },
  { sku: 'ROPA-006', nombre: 'Gorra Deportiva', precio: 29900, stock: 100, categoria: 'ropa', proveedor: 'moda-estilo', descripcion: 'Gorra deportiva ajustable.' },
  { sku: 'DEP-001', nombre: 'Balón de Fútbol Profesional', precio: 89900, stock: 55, categoria: 'deportes', proveedor: 'distribuidora-andina', descripcion: 'Balón de fútbol talla oficial.' },
  { sku: 'DEP-002', nombre: 'Mancuernas 5kg Par', precio: 69900, stock: 40, categoria: 'deportes', proveedor: 'distribuidora-andina', descripcion: 'Par de mancuernas de 5 kg.' },
  { sku: 'DEP-003', nombre: 'Colchoneta de Yoga', precio: 45900, stock: 65, categoria: 'deportes', proveedor: 'distribuidora-andina', descripcion: 'Colchoneta antideslizante.' },
  { sku: 'DEP-004', nombre: 'Bicicleta MTB 29"', precio: 899900, stock: 12, categoria: 'deportes', proveedor: 'distribuidora-andina', descripcion: 'Bicicleta de montaña aro 29.', activo: false },
  { sku: 'DEP-005', nombre: 'Termo Deportivo 1L', precio: 54900, stock: 75, categoria: 'deportes', proveedor: 'distribuidora-andina', descripcion: 'Termo de acero de 1 litro.' },
  { sku: 'DEP-006', nombre: 'Cuerda de Saltar', precio: 19900, stock: 90, categoria: 'deportes', proveedor: 'distribuidora-andina', descripcion: 'Cuerda de saltar ajustable.' },
  { sku: 'BEL-001', nombre: 'Secador de Cabello', precio: 139900, stock: 28, categoria: 'belleza', proveedor: 'moda-estilo', descripcion: 'Secador de cabello profesional.' },
  { sku: 'BEL-002', nombre: 'Kit de Maquillaje 12pz', precio: 99900, stock: 35, categoria: 'belleza', proveedor: 'moda-estilo', descripcion: 'Kit completo de maquillaje.' },
  { sku: 'BEL-003', nombre: 'Perfume Floral 50ml', precio: 169900, stock: 22, categoria: 'belleza', proveedor: 'moda-estilo', descripcion: 'Perfume de esencia floral.', activo: false },
  { sku: 'BEL-004', nombre: 'Plancha de Cabello', precio: 119900, stock: 30, categoria: 'belleza', proveedor: 'moda-estilo', descripcion: 'Plancha de cerámica.' },
  { sku: 'BEL-005', nombre: 'Crema Hidratante', precio: 49900, stock: 60, categoria: 'belleza', proveedor: 'moda-estilo', descripcion: 'Crema hidratante facial.' },
  { sku: 'BEL-006', nombre: 'Set de Brochas', precio: 59900, stock: 45, categoria: 'belleza', proveedor: 'moda-estilo', descripcion: 'Set de brochas de maquillaje.' },
  { sku: 'ALIM-001', nombre: 'Café Gourmet 500g', precio: 29900, stock: 150, categoria: 'alimentos', proveedor: 'distribuidora-andina', descripcion: 'Café gourmet de origen.' },
  { sku: 'ALIM-002', nombre: 'Chocolate Artesanal 200g', precio: 24900, stock: 120, categoria: 'alimentos', proveedor: 'distribuidora-andina', descripcion: 'Chocolate artesanal 70% cacao.' },
  { sku: 'ALIM-003', nombre: 'Miel de Abejas 350g', precio: 27900, stock: 90, categoria: 'alimentos', proveedor: 'distribuidora-andina', descripcion: 'Miel de abejas pura.' },
  { sku: 'ALIM-004', nombre: 'Granola Integral 500g', precio: 21900, stock: 100, categoria: 'alimentos', proveedor: 'distribuidora-andina', descripcion: 'Granola integral con frutos secos.' },
  { sku: 'ALIM-005', nombre: 'Té Verde Orgánico', precio: 18900, stock: 130, categoria: 'alimentos', proveedor: 'distribuidora-andina', descripcion: 'Té verde orgánico en hojas.', activo: false },
  { sku: 'ALIM-006', nombre: 'Aceite de Oliva 500ml', precio: 39900, stock: 80, categoria: 'alimentos', proveedor: 'distribuidora-andina', descripcion: 'Aceite de oliva extra virgen.' }
];

const imagen = (sku) => `https://picsum.photos/seed/${sku.toLowerCase()}/400/400`;

const seedCatalogo = async () => {
  await mongoose.connect(ENV.mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Conexión a MongoDB establecida');

  await Promise.all(categorias.map((c) =>
    Categoria.findOneAndUpdate(
      { slug: c.slug },
      { $setOnInsert: { ...c, imagenUrl: null } },
      { upsert: true }
    )
  ));
  console.log(`✅ ${categorias.length} categorías listas`);

  const proveedoresCreados = {};
  for (const p of proveedores) {
    const doc = await Proveedor.findOneAndUpdate(
      { slug: p.slug },
      { $setOnInsert: { ...p, logoUrl: null, activo: true } },
      { upsert: true, new: true }
    );
    proveedoresCreados[p.slug] = doc._id;
  }
  console.log(`✅ ${proveedores.length} proveedores listos`);

  let creados = 0;
  for (const item of catalogo) {
    const existe = await Producto.exists({ sku: item.sku });
    if (existe) continue;

    await Producto.create({
      sku: item.sku,
      nombre: item.nombre,
      precio: item.precio,
      stock: item.stock,
      categoria: item.categoria,
      descripcion: item.descripcion,
      imagenUrl: imagen(item.sku),
      proveedorId: proveedoresCreados[item.proveedor],
      activo: item.activo ?? true
    });
    creados += 1;
  }
  console.log(`✅ ${catalogo.length} productos listos (${creados} nuevos)`);

  await mongoose.disconnect();
};

seedCatalogo().catch((error) => {
  console.error('❌ Error en el seed del catálogo:', error.message);
  process.exit(1);
});
