<script setup>
import { computed, onMounted, ref } from "vue";

import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tables/TablaDatos.vue";
import { get, post, put, del } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { requerido, esEmail } from "@/utils/reglas";

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

const columnas = [
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "slug", label: "Slug", field: "slug", align: "left", sortable: true },
  { name: "contactoEmail", label: "Contacto", field: "contactoEmail", align: "left" },
  { name: "activo", label: "Activo", field: "activo", align: "center" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

const proveedores = ref([]);
const cargando = ref(false);
const error = ref(null);

async function cargar() {
  cargando.value = true;
  error.value = null;
  try {
    const res = await get("/proveedores?page=1&limit=100");
    proveedores.value = res.data || [];
    general.marcarSincronizacion();
  } catch (e) {
    error.value = e.mensaje;
    notificarError(e);
  } finally {
    cargando.value = false;
  }
}

onMounted(cargar);

const dialogo = ref(false);
const guardando = ref(false);
const proveedorEditando = ref(null);
const formularioRef = ref(null);

const formulario = ref({ nombre: "", slug: "", contactoEmail: "", logoUrl: "" });

const esEdicion = computed(() => proveedorEditando.value !== null);

const formularioVacio = () => ({ nombre: "", slug: "", contactoEmail: "", logoUrl: "" });

const abrirCreacion = () => {
  proveedorEditando.value = null;
  formulario.value = formularioVacio();
  dialogo.value = true;
};

const abrirEdicion = (p) => {
  proveedorEditando.value = p;
  formulario.value = {
    nombre: p.nombre,
    slug: p.slug,
    contactoEmail: p.contactoEmail || "",
    logoUrl: p.logoUrl || "",
  };
  dialogo.value = true;
};

const construirDatos = () => ({
  nombre: formulario.value.nombre.trim(),
  slug: formulario.value.slug.trim(),
  contactoEmail: formulario.value.contactoEmail
    ? formulario.value.contactoEmail.trim()
    : null,
  logoUrl: formulario.value.logoUrl ? formulario.value.logoUrl.trim() : null,
});

const guardar = async () => {
  guardando.value = true;
  try {
    const datos = construirDatos();
    if (esEdicion.value) {
      await put(`/proveedores/${proveedorEditando.value._id}`, datos);
      notificarOk("Proveedor actualizado");
    } else {
      await post("/proveedores", datos);
      notificarOk("Proveedor creado");
    }
    dialogo.value = false;
    await cargar();
  } catch (e) {
    notificarError(e);
  } finally {
    guardando.value = false;
  }
};

const cambiarEstado = async (p) => {
  const activo = p.activo;
  const aceptado = await confirmar({
    titulo: activo ? "Desactivar proveedor" : "Activar proveedor",
    mensaje: `¿Confirmas ${activo ? "desactivar" : "activar"} el proveedor ${p.nombre}?`,
    textoOk: activo ? "Desactivar" : "Activar",
    color: activo ? "negative" : "primary",
  });
  if (!aceptado) return;

  try {
    await put(`/proveedores/${p._id}`, { activo: !activo });
    notificarOk(activo ? "Proveedor desactivado" : "Proveedor activado");
    await cargar();
  } catch (e) {
    notificarError(e);
  }
};

const eliminar = async (p) => {
  const aceptado = await confirmar({
    titulo: "Eliminar proveedor",
    mensaje: `¿Confirmas eliminar el proveedor ${p.nombre}?`,
    textoOk: "Eliminar",
    color: "negative",
  });
  if (!aceptado) return;

  try {
    await del(`/proveedores/${p._id}`);
    notificarOk("Proveedor eliminado");
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
        titulo="Proveedores"
        subtitulo="Marcas y distribuidores que envían catálogos"
        icono="local_shipping"
      >
        <template #acciones>
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="add"
            label="Nuevo proveedor"
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
        :filas="proveedores"
        :columnas="columnas"
        :cargando="cargando"
        mensaje-vacio="Aún no hay proveedores registrados"
      >
        <template #body-cell-activo="celda">
          <q-td :props="celda" class="text-center">
            <q-badge
              :color="celda.row.activo ? 'positive' : 'grey-6'"
              :label="celda.row.activo ? 'Sí' : 'No'"
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
              class="action-secondary"
              :icon="celda.row.activo ? 'toggle_on' : 'toggle_off'"
              :color="celda.row.activo ? 'negative' : 'positive'"
              @click="cambiarEstado(celda.row)"
            >
              <q-tooltip>{{ celda.row.activo ? "Desactivar" : "Activar" }}</q-tooltip>
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
      <q-card class="dialog-card">
        <q-card-section class="bg-primary text-white row items-center no-wrap q-px-lg q-py-md">
          <q-icon :name="esEdicion ? 'edit' : 'add'" size="28px" class="q-mr-md" />
          <div>
            <div class="dialog-title">
              {{ esEdicion ? "Editar proveedor" : "Nuevo proveedor" }}
            </div>
            <div class="text-caption text-green-2">Datos del proveedor</div>
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" color="white" />
        </q-card-section>

        <q-form ref="formularioRef" greedy @submit="guardar">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="formulario.nombre"
              outlined
              dense
              label="Nombre *"
              :rules="[requerido('El nombre')]"
              lazy-rules
            />

            <q-input
              v-model="formulario.slug"
              outlined
              dense
              label="Slug *"
              hint="Minúsculas, números y guiones. Ej: acme-corp"
              :rules="[requerido('El slug')]"
              lazy-rules
            />

            <q-input
              v-model="formulario.contactoEmail"
              outlined
              dense
              type="email"
              label="Email de contacto (opcional)"
              :rules="[(v) => !v || esEmail()(v)]"
              lazy-rules
            />

            <q-input
              v-model="formulario.logoUrl"
              outlined
              dense
              type="url"
              label="URL del logo (opcional)"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn v-close-popup flat no-caps label="Cancelar" color="dark" class="btn-cancel" />
            <q-btn
              unelevated
              no-caps
              type="submit"
              color="primary"
              class="btn-ok"
              :label="esEdicion ? 'Guardar cambios' : 'Crear proveedor'"
              :loading="guardando"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>
