import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';

let mongo;

const register = (email, password, rol) =>
  request(app).post('/api/auth/register').send({ email, password, rol });

const login = (email, password) =>
  request(app).post('/api/auth/login').send({ email, password });

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Auth', () => {
  test('registro: 201 con { id, email, rol } y sin password', async () => {
    const res = await register('admin@test.com', 'secreta123', 'admin');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('admin@test.com');
    expect(res.body.rol).toBe('admin');
    expect(res.body).not.toHaveProperty('password');
    expect(JSON.stringify(res.body)).not.toContain('secreta123');
  });

  test('registro: rol por defecto es "user"', async () => {
    const res = await register('user@test.com', 'secreta123');
    expect(res.status).toBe(201);
    expect(res.body.rol).toBe('user');
  });

  test('registro: 409 email ya registrado', async () => {
    const res = await register('admin@test.com', 'otra123');
    expect(res.status).toBe(409);
  });

  test('login: 200 con token', async () => {
    const res = await login('admin@test.com', 'secreta123');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body).not.toHaveProperty('password');
  });

  test('login: 401 credenciales inválidas', async () => {
    const res = await login('admin@test.com', 'clave-mala');
    expect(res.status).toBe(401);
  });

  test('login: 401 email inexistente', async () => {
    const res = await login('nadie@test.com', 'secreta123');
    expect(res.status).toBe(401);
  });
});

describe('Roles y autorización', () => {
  let userToken;
  let adminToken;

  beforeAll(async () => {
    const userLogin = await login('user@test.com', 'secreta123');
    userToken = userLogin.body.token;

    const adminLogin = await login('admin@test.com', 'secreta123');
    adminToken = adminLogin.body.token;
  });

  test('user recibe 403 en POST /api/productos', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ sku: 'X', nombre: 'X', precio: 1, stock: 1, categoria: 'x', proveedorId: new mongoose.Types.ObjectId() });
    expect(res.status).toBe(403);
  });

  test('user recibe 403 en PUT /api/productos/:id', async () => {
    const res = await request(app)
      .put(`/api/productos/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nombre: 'X' });
    expect(res.status).toBe(403);
  });

  test('user recibe 403 en DELETE /api/productos/:id', async () => {
    const res = await request(app)
      .delete(`/api/productos/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test('user recibe 403 en POST /api/proveedores', async () => {
    const res = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nombre: 'Proveedor', slug: 'proveedor' });
    expect(res.status).toBe(403);
  });

  test('user recibe 403 en PUT /api/proveedores/:id', async () => {
    const res = await request(app)
      .put(`/api/proveedores/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ activo: false });
    expect(res.status).toBe(403);
  });

  test('user recibe 403 en DELETE /api/proveedores/:id', async () => {
    const res = await request(app)
      .delete(`/api/proveedores/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test('ruta sin token devuelve 401', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.status).toBe(401);
  });

  test('admin puede crear proveedor', async () => {
    const res = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Acme Corp', slug: 'acme-corp' });
    expect(res.status).toBe(201);
  });
});

describe('Proveedores', () => {
  let adminToken;

  beforeAll(async () => {
    const adminLogin = await login('admin@test.com', 'secreta123');
    adminToken = adminLogin.body.token;
  });

  test('proveedor se crea con activo: true por defecto', async () => {
    const res = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Nuevo Prov', slug: 'nuevo-prov' });
    expect(res.status).toBe(201);
    expect(res.body.activo).toBe(true);
  });

  test('slug de proveedor duplicado → 409', async () => {
    const res = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Otro Nombre', slug: 'acme-corp' });
    expect(res.status).toBe(409);
  });

  test('nombre de proveedor duplicado → 409', async () => {
    const res = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Acme Corp', slug: 'acme-corp-2' });
    expect(res.status).toBe(409);
  });

  test('eliminar proveedor con productos asociados → 409', async () => {
    const proveedor = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Proveedor Con Productos', slug: 'prov-con-productos' });

    await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: 'SKU-ASOCIADO',
        nombre: 'Producto asociado',
        precio: 10,
        stock: 5,
        categoria: 'hogar',
        proveedorId: proveedor.body._id
      });

    const res = await request(app)
      .delete(`/api/proveedores/${proveedor.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });

  test('eliminar proveedor sin productos → 204', async () => {
    const proveedor = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Proveedor Vacio', slug: 'prov-vacio' });

    const res = await request(app)
      .delete(`/api/proveedores/${proveedor.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});

describe('Productos', () => {
  let adminToken;
  let proveedorId;

  beforeAll(async () => {
    const adminLogin = await login('admin@test.com', 'secreta123');
    adminToken = adminLogin.body.token;

    const proveedor = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Prov Productos', slug: 'prov-productos' });
    proveedorId = proveedor.body._id;
  });

  test('crear producto → 201', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: 'sku-100',
        nombre: 'Camiseta azul',
        precio: 29.99,
        stock: 100,
        categoria: 'ropa',
        proveedorId
      });
    expect(res.status).toBe(201);
    expect(res.body.sku).toBe('SKU-100');
    expect(res.body.categoria).toBe('ropa');
    expect(res.body.disponible).toBe(true);
  });

  test('sku duplicado → 409', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: 'SKU-100',
        nombre: 'Otro producto',
        precio: 10,
        stock: 1,
        categoria: 'ropa',
        proveedorId
      });
    expect(res.status).toBe(409);
  });

  test('crear producto con proveedor inexistente → 404', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: 'SKU-404',
        nombre: 'Producto sin proveedor',
        precio: 10,
        stock: 1,
        categoria: 'ropa',
        proveedorId: new mongoose.Types.ObjectId()
      });
    expect(res.status).toBe(404);
  });

  test('listar productos → 200 con data/page/limit/total', async () => {
    const res = await request(app)
      .get('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('stats → 200 con totalProductos y porCategoria', async () => {
    const res = await request(app)
      .get('/api/productos/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalProductos');
    expect(res.body).toHaveProperty('precioPromedio');
    expect(res.body).toHaveProperty('porCategoria');
  });

  test('eliminar producto → 204', async () => {
    const creado = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: 'SKU-BORRAR',
        nombre: 'Para borrar',
        precio: 1,
        stock: 1,
        categoria: 'hogar',
        proveedorId
      });

    const res = await request(app)
      .delete(`/api/productos/${creado.body._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  test('producto inexistente → 404', async () => {
    const res = await request(app)
      .get(`/api/productos/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
