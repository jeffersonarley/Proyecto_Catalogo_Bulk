<script setup>
import { computed, onMounted, ref } from "vue";

import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tables/TablaDatos.vue";
import { get, post, put, del } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { formatPrecio } from "@/utils/formatDate";
import {
  requerido,
  numeroMayorOIgualA,
  enteroMayorOIgualA,
  seleccionRequerida,
} from "@/utils/reglas";

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

const columnas = [
  { name: "sku", label: "SKU", field: "sku", align: "left", sortable: true },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  {
    name: "precio",
    label: "Precio",
    field: "precio",
    align: "right",
    sortable: true,
    format: (v) => formatPrecio(v),
  },
  { name: "stock", label: "Stock", field: "stock", align: "right", sortable: true },
  { name: "categoria", label: "Categoría", field: "categoria", align: "left", sortable: true },
  { name: "disponible", label: "Disponible", field: "disponible", align: "center" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

const productos = ref([]);
const proveedores = ref([]);
const cargando = ref(false);
const error = ref(null);

async function cargar() {
  cargando.value = true;
  error.value = null;
  try {
    const res = await get("/productos?page=1&limit=100");
    productos.value = res.data || [];
    general.marcarSincronizacion();
  } catch (e) {
    error.value = e.mensaje;
    notificarError(e);
  } finally {
    cargando.value = false;
  }
}

async function cargarProveedores() {
  try {
    const res = await get("/proveedores?page=1&limit=100");
    proveedores.value = res.data || [];
  } catch (e) {
    notificarError(e);
  }
}

onMounted(() => {
  cargar();
  cargarProveedores();
});

const dialogo = ref(false);
const guardando = ref(false);
const productoEditando = ref(null);
const formularioRef = ref(null);

const formulario = ref({
  sku: "",
  nombre: "",
  precio: null,
  stock: null,
  categoria: "",
  proveedorId: null,
  descripcion: "",
  imagenUrl: "",
});

const esEdicion = computed(() => productoEditando.value !== null);

const opcionesProveedor = computed(() =>
  proveedores.value.map((p) => ({ label: `${p.nombre} (${p.slug})`, value: p._id }))
);

const formularioVacio = () => ({
  sku: "",
  nombre: "",
  precio: null,
  stock: null,
  categoria: "",
  proveedorId: null,
  descripcion: "",
  imagenUrl: "",
});

const abrirCreacion = () => {
  productoEditando.value = null;
  formulario.value = formularioVacio();
  dialogo.value = true;
};

const abrirEdicion = (p) => {
  productoEditando.value = p;
  formulario.value = {
    sku: p.sku,
    nombre: p.nombre,
    precio: p.precio,
    stock: p.stock,
    categoria: p.categoria,
    proveedorId: p.proveedorId,
    descripcion: p.descripcion || "",
    imagenUrl: p.imagenUrl || "",
  };
  dialogo.value = true;
};

const construirDatos = () => {
  const datos = {
    sku: formulario.value.sku.trim(),
    nombre: formulario.value.nombre.trim(),
    precio: Number(formulario.value.precio),
    stock: Math.trunc(Number(formulario.value.stock) || 0),
    categoria: formulario.value.categoria.trim(),
    proveedorId: formulario.value.proveedorId,
  };
  if (formulario.value.descripcion) datos.descripcion = formulario.value.descripcion.trim();
  if (formulario.value.imagenUrl) datos.imagenUrl = formulario.value.imagenUrl.trim();
  return datos;
};

const guardar = async () => {
  guardando.value = true;
  try {
    const datos = construirDatos();
    if (esEdicion.value) {
      await put(`/productos/${productoEditando.value._id}`, datos);
      notificarOk("Producto actualizado");
    } else {
      await post("/productos", datos);
      notificarOk("Producto creado");
    }
    dialogo.value = false;
    await cargar();
  } catch (e) {
    notificarError(e);
  } finally {
    guardando.value = false;
  }
};

const eliminar = async (p) => {
  const aceptado = await confirmar({
    titulo: "Eliminar producto",
    mensaje: `¿Confirmas eliminar el producto ${p.sku}?`,
    textoOk: "Eliminar",
    color: "negative",
  });
  if (!aceptado) return;

  try {
    await del(`/productos/${p._id}`);
    notificarOk("Producto eliminado");
    await cargar();
  } catch (e) {
    notificarError(e);
  }
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina
        titulo="Productos"
        subtitulo="Gestión de los productos del catálogo"
        icono="inventory_2"
      >
        <template #acciones>
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="add"
            label="Nuevo producto"
            @click="abrirCreacion"
          />
        </template>
      </EncabezadoPagina>

      <q-banner v-if="error" dense class="bg-red-1 text-negative q-mb-md rounded-borders">
        <template #avatar>
          <q-icon name="error_outline" />
        </template>
        {{ error }}
        <template #action>
          <q-btn flat dense no-caps label="Reintentar" @click="cargar" />
        </template>
      </q-banner>

      <TablaDatos
        :filas="productos"
        :columnas="columnas"
        :cargando="cargando"
        mensaje-vacio="Aún no hay productos registrados"
      >
        <template #body-cell-disponible="celda">
          <q-td :props="celda" class="text-center">
            <q-badge
              :color="celda.row.disponible ? 'positive' : 'negative'"
              :label="celda.row.disponible ? 'Sí' : 'No'"
            />
          </q-td>
        </template>

        <template #body-cell-acciones="celda">
          <q-td :props="celda" class="text-right">
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="edit"
              color="primary"
              class="action-secondary"
              @click="abrirEdicion(celda.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn
              flat
              dense
              round
              size="sm"
              icon="delete"
              color="negative"
              class="action-secondary"
              @click="eliminar(celda.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </TablaDatos>
    </div>

    <q-dialog v-model="dialogo" persistent @show="formularioRef?.resetValidation()">
      <q-card class="dialog-card dialog-card--mediano">
        <q-card-section class="bg-primary text-white row items-center no-wrap q-px-lg q-py-md">
          <q-icon :name="esEdicion ? 'edit' : 'add'" size="28px" class="q-mr-md" />
          <div>
            <div class="dialog-title">{{ esEdicion ? "Editar producto" : "Nuevo producto" }}</div>
            <div class="text-caption text-green-2">Datos del producto</div>
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" color="white" />
        </q-card-section>

        <q-form ref="formularioRef" greedy @submit="guardar">
          <q-card-section class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formulario.sku"
                  outlined
                  dense
                  label="SKU *"
                  :rules="[requerido('El SKU')]"
                  lazy-rules
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formulario.nombre"
                  outlined
                  dense
                  label="Nombre *"
                  :rules="[requerido('El nombre')]"
                  lazy-rules
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="formulario.precio"
                  outlined
                  dense
                  type="number"
                  step="0.01"
                  label="Precio *"
                  :rules="[requerido('El precio'), numeroMayorOIgualA(0, 'El precio')]"
                  lazy-rules
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model.number="formulario.stock"
                  outlined
                  dense
                  type="number"
                  step="1"
                  label="Stock *"
                  :rules="[requerido('El stock'), enteroMayorOIgualA(0, 'El stock')]"
                  lazy-rules
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="formulario.categoria"
                  outlined
                  dense
                  label="Categoría (slug) *"
                  hint="Ej: ropa, hogar, electronica"
                  :rules="[requerido('La categoría')]"
                  lazy-rules
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="formulario.proveedorId"
                  outlined
                  dense
                  emit-value
                  map-options
                  :options="opcionesProveedor"
                  label="Proveedor *"
                  :rules="[seleccionRequerida('el proveedor')]"
                  lazy-rules
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="formulario.descripcion"
                  outlined
                  type="textarea"
                  autogrow
                  label="Descripción (opcional)"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="formulario.imagenUrl"
                  outlined
                  dense
                  type="url"
                  label="URL de imagen (opcional)"
                  hint="Debe ser una URL http(s) válida"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn v-close-popup flat no-caps label="Cancelar" color="dark" class="btn-cancel" />
            <q-btn
              unelevated
              no-caps
              type="submit"
              color="primary"
              class="btn-ok"
              :label="esEdicion ? 'Guardar cambios' : 'Crear producto'"
              :loading="guardando"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>
