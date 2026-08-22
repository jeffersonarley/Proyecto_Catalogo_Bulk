const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'CatálogoBulk API',
    description: 'Sistema de importación masiva de productos con procesamiento asíncrono.',
    version: '1.0.0'
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Desarrollo local' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '665f1234abcd' },
          email: { type: 'string', format: 'email', example: 'admin@demo.com' },
          rol: { type: 'string', enum: ['admin', 'user'], example: 'admin' }
        }
      },
      Producto: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          sku: { type: 'string', example: 'SKU-001' },
          nombre: { type: 'string', example: 'Camiseta azul' },
          precio: { type: 'number', example: 29.99 },
          stock: { type: 'integer', example: 100 },
          categoria: { type: 'string', example: 'ropa' },
          descripcion: { type: 'string', nullable: true },
          imagenUrl: { type: 'string', nullable: true },
          proveedorId: { type: 'string', example: '660a1234abcd' },
          disponible: { type: 'boolean', example: true }
        }
      },
      Proveedor: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          nombre: { type: 'string', example: 'Acme Corp' },
          slug: { type: 'string', example: 'acme-corp' },
          contactoEmail: { type: 'string', nullable: true },
          logoUrl: { type: 'string', nullable: true },
          activo: { type: 'boolean', example: true }
        }
      },
      Categoria: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          slug: { type: 'string', example: 'electronica' },
          nombre: { type: 'string', example: 'Electrónica' },
          descripcion: { type: 'string', nullable: true },
          imagenUrl: { type: 'string', nullable: true }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              codigo: { type: 'string', example: 'SKU_DUPLICADO' },
              mensaje: { type: 'string', example: 'sku duplicado' }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  paths: {
    '/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Estado de salud del servicio',
        security: [],
        responses: {
          200: { description: 'Mongo y Redis responden' },
          503: { description: 'Mongo o Redis caídos' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar un usuario',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                  rol: { type: 'string', enum: ['admin', 'user'], default: 'user' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Usuario creado' },
          409: { description: 'email ya registrado' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión (rate limit estricto)',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: '{ token }' },
          401: { description: 'Credenciales inválidas' }
        }
      }
    },
    '/api/productos': {
      get: {
        tags: ['Productos'],
        summary: 'Listar productos (filtros combinables)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'categoria', in: 'query', schema: { type: 'string' } },
          { name: 'proveedor', in: 'query', description: 'slug o id', schema: { type: 'string' } },
          { name: 'disponible', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: {
          200: { description: 'Lista paginada' },
          401: { description: 'No autenticado' }
        }
      },
      post: {
        tags: ['Productos'],
        summary: 'Crear producto (solo admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sku', 'nombre', 'precio', 'stock', 'categoria', 'proveedorId'],
                properties: {
                  sku: { type: 'string' },
                  nombre: { type: 'string' },
                  precio: { type: 'number' },
                  stock: { type: 'integer' },
                  categoria: { type: 'string' },
                  proveedorId: { type: 'string' },
                  descripcion: { type: 'string' },
                  imagenUrl: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Producto creado' },
          400: { description: 'Validación fallida' },
          403: { description: 'Rol insuficiente' },
          404: { description: 'proveedorId no existe' },
          409: { description: 'sku duplicado' }
        }
      }
    },
    '/api/productos/stats': {
      get: {
        tags: ['Productos'],
        summary: 'Estadísticas del catálogo',
        responses: {
          200: { description: 'Estadísticas' }
        }
      }
    },
    '/api/productos/{id}': {
      get: {
        tags: ['Productos'],
        summary: 'Obtener producto por id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Producto' },
          404: { description: 'No existe' }
        }
      },
      put: {
        tags: ['Productos'],
        summary: 'Actualizar producto (solo admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Actualizado' },
          403: { description: 'Rol insuficiente' },
          404: { description: 'No existe' },
          409: { description: 'sku duplicado' }
        }
      },
      delete: {
        tags: ['Productos'],
        summary: 'Eliminar producto (solo admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Eliminado' },
          403: { description: 'Rol insuficiente' },
          404: { description: 'No existe' }
        }
      }
    },
    '/api/proveedores': {
      get: {
        tags: ['Proveedores'],
        summary: 'Listar proveedores',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'activo', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: {
          200: { description: 'Lista paginada' }
        }
      },
      post: {
        tags: ['Proveedores'],
        summary: 'Crear proveedor (solo admin)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'slug'],
                properties: {
                  nombre: { type: 'string' },
                  slug: { type: 'string' },
                  contactoEmail: { type: 'string' },
                  logoUrl: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Creado' },
          400: { description: 'Validación fallida' },
          403: { description: 'Rol insuficiente' },
          409: { description: 'nombre o slug duplicado' }
        }
      }
    },
    '/api/proveedores/{id}': {
      get: {
        tags: ['Proveedores'],
        summary: 'Obtener proveedor por id',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Proveedor' },
          404: { description: 'No existe' }
        }
      },
      put: {
        tags: ['Proveedores'],
        summary: 'Actualizar proveedor (solo admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Actualizado' },
          403: { description: 'Rol insuficiente' },
          404: { description: 'No existe' }
        }
      },
      delete: {
        tags: ['Proveedores'],
        summary: 'Eliminar proveedor (solo admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Eliminado' },
          403: { description: 'Rol insuficiente' },
          404: { description: 'No existe' },
          409: { description: 'Tiene productos asociados' }
        }
      }
    },
    '/api/categorias': {
      get: {
        tags: ['Categorías'],
        summary: 'Listar categorías (sin paginar)',
        responses: {
          200: { description: 'Lista de categorías' }
        }
      }
    },
    '/api/categorias/{slug}': {
      get: {
        tags: ['Categorías'],
        summary: 'Obtener categoría por slug',
        parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Categoría' },
          404: { description: 'No existe' }
        }
      }
    },
    '/api/categorias/{id}': {
      put: {
        tags: ['Categorías'],
        summary: 'Enriquecer categoría (solo admin); el slug no se edita',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  descripcion: { type: 'string' },
                  imagenUrl: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Actualizada' },
          403: { description: 'Rol insuficiente' },
          404: { description: 'No existe' }
        }
      }
    }
  }
};

export { swaggerSpec };
export default swaggerSpec;
