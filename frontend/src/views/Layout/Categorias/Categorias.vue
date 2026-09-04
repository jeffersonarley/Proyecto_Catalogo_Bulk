<script setup>
import { computed, onMounted, ref } from "vue";

import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tables/TablaDatos.vue";
import { get, put } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { requerido } from "@/utils/reglas";

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();

const columnas = [
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "slug", label: "Slug", field: "slug", align: "left", sortable: true },
  { name: "descripcion", label: "Descripción", field: "descripcion", align: "left" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

const categorias = ref([]);
const cargando = ref(false);
const error = ref(null);

async function cargar() {
  cargando.value = true;
  error.value = null;
  try {
    const res = await get("/categorias");
    categorias.value = res.data || [];
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
const categoriaEditando = ref(null);
const formularioRef = ref(null);

const formulario = ref({ nombre: "", descripcion: "", imagenUrl: "" });

const esEdicion = computed(() => categoriaEditando.value !== null);

const abrirEdicion = (c) => {
  categoriaEditando.value = c;
  formulario.value = {
    nombre: c.nombre,
    descripcion: c.descripcion || "",
    imagenUrl: c.imagenUrl || "",
  };
  dialogo.value = true;
};

const guardar = async () => {
  guardando.value = true;
  try {
    await put(`/categorias/${categoriaEditando.value._id}`, {
      nombre: formulario.value.nombre.trim(),
      descripcion: formulario.value.descripcion
        ? formulario.value.descripcion.trim()
        : null,
      imagenUrl: formulario.value.imagenUrl
        ? formulario.value.imagenUrl.trim()
        : null,
    });
    notificarOk("Categoría actualizada");
    dialogo.value = false;
    await cargar();
  } catch (e) {
    notificarError(e);
  } finally {
    guardando.value = false;
  }
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina
        titulo="Categorías"
        subtitulo="Se crean solas al importar un catálogo; aquí se enriquecen"
        icono="category"
      />

      <q-banner
        dense
        class="bg-blue-grey-1 text-grey-8 q-mb-md rounded-borders"
      >
        <template #avatar>
          <q-icon name="info" />
        </template>
        Las categorías no se crean ni se borran manualmente: se generan automáticamente
        al importar un catálogo. Aquí solo se editan sus metadatos.
      </q-banner>

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
        :filas="categorias"
        :columnas="columnas"
        :cargando="cargando"
        mensaje-vacio="Aún no hay categorías (se crearán al importar un catálogo)"
      >
        <template #body-cell-descripcion="celda">
          <q-td :props="celda" class="texto-suave">
            {{ celda.row.descripcion || "—" }}
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
          </q-td>
        </template>
      </TablaDatos>
    </div>

    <q-dialog v-model="dialogo" persistent @show="formularioRef?.resetValidation()">
      <q-card class="dialog-card">
        <q-card-section class="bg-primary text-white row items-center no-wrap q-px-lg q-py-md">
          <q-icon name="edit" size="28px" class="q-mr-md" />
          <div>
            <div class="dialog-title">Editar categoría</div>
            <div class="text-caption text-green-2">slug: {{ categoriaEditando?.slug }}</div>
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
              v-model="formulario.descripcion"
              outlined
              type="textarea"
              autogrow
              label="Descripción (opcional)"
            />

            <q-input
              v-model="formulario.imagenUrl"
              outlined
              dense
              type="url"
              label="URL de imagen (opcional)"
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
              label="Guardar cambios"
              :loading="guardando"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>
