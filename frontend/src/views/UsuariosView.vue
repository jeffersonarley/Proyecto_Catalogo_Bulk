<script setup>
import { computed, onMounted, ref } from "vue";

import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tables/TablaDatos.vue";
import { get, post, put, del } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { formatDate } from "@/utils/formatDate";
import { requerido, esEmail, minimo, seleccionRequerida } from "@/utils/reglas";

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

const columnas = [
  { name: "nombre", label: "Nombre", field: "nombre", align: "left" },
  { name: "email", label: "Email", field: "email", align: "left", sortable: true },
  { name: "rol", label: "Rol", field: "rol", align: "center" },
  { name: "activo", label: "Activo", field: "activo", align: "center" },
  { name: "createdAt", label: "Creado", field: "createdAt", align: "left", format: (v) => formatDate(v) },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

const usuarios = ref([]);
const cargando = ref(false);
const error = ref(null);

async function cargar() {
  cargando.value = true;
  error.value = null;
  try {
    const res = await get("/usuarios");
    usuarios.value = res.data || [];
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
const usuarioEditando = ref(null);
const formularioRef = ref(null);
const verPassword = ref(false);

const formulario = ref({
  nombre: "",
  email: "",
  password: "",
  rol: "user",
  activo: true,
});

const esEdicion = computed(() => usuarioEditando.value !== null);

const opcionesRol = [
  { label: "user", value: "user" },
  { label: "admin", value: "admin" },
];

const formularioVacio = () => ({
  nombre: "",
  email: "",
  password: "",
  rol: "user",
  activo: true,
});

const abrirCreacion = () => {
  usuarioEditando.value = null;
  formulario.value = formularioVacio();
  dialogo.value = true;
};

const abrirEdicion = (u) => {
  usuarioEditando.value = u;
  formulario.value = {
    nombre: u.nombre || "",
    email: u.email,
    password: "",
    rol: u.rol,
    activo: u.activo,
  };
  dialogo.value = true;
};

const guardar = async () => {
  guardando.value = true;
  try {
    if (esEdicion.value) {
      await put(`/usuarios/${usuarioEditando.value.id}`, {
        nombre: formulario.value.nombre.trim() || null,
        rol: formulario.value.rol,
        activo: formulario.value.activo,
      });
      notificarOk("Usuario actualizado");
    } else {
      await post("/auth/register", {
        nombre: formulario.value.nombre.trim() || null,
        email: formulario.value.email.trim(),
        password: formulario.value.password,
        rol: formulario.value.rol,
      });
      notificarOk("Usuario creado");
    }
    dialogo.value = false;
    await cargar();
  } catch (e) {
    notificarError(e);
  } finally {
    guardando.value = false;
  }
};

const eliminar = async (u) => {
  const aceptado = await confirmar({
    titulo: "Eliminar usuario",
    mensaje: `¿Confirmas eliminar el usuario ${u.email}?`,
    textoOk: "Eliminar",
    color: "negative",
  });
  if (!aceptado) return;

  try {
    await del(`/usuarios/${u.id}`);
    notificarOk("Usuario eliminado");
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
        titulo="Usuarios"
        subtitulo="Cuentas que pueden entrar a la aplicación"
        icono="group"
      >
        <template #acciones>
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="add"
            label="Nuevo usuario"
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
        :filas="usuarios"
        :columnas="columnas"
        :cargando="cargando"
        mensaje-vacio="No hay usuarios registrados"
      >
        <template #body-cell-nombre="celda">
          <q-td :props="celda">
            {{ celda.row.nombre || "—" }}
          </q-td>
        </template>

        <template #body-cell-rol="celda">
          <q-td :props="celda" class="text-center">
            <q-badge
              :color="celda.row.rol === 'admin' ? 'warning' : 'blue-3'"
              text-color="black"
              :label="celda.row.rol"
            />
          </q-td>
        </template>

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
            <div class="dialog-title">{{ esEdicion ? "Editar usuario" : "Nuevo usuario" }}</div>
            <div class="text-caption text-green-2">Datos de la cuenta</div>
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
              label="Nombre (opcional)"
            />

            <q-input
              v-model="formulario.email"
              outlined
              dense
              type="email"
              label="Email *"
              :disable="esEdicion"
              :rules="[requerido('El email'), esEmail()]"
              lazy-rules
            />

            <q-input
              v-if="!esEdicion"
              v-model="formulario.password"
              outlined
              dense
              label="Contraseña *"
              autocomplete="new-password"
              :type="verPassword ? 'text' : 'password'"
              :rules="[requerido('La contraseña'), minimo(6, 'La contraseña')]"
              lazy-rules
            >
              <template #append>
                <q-icon
                  :name="verPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="verPassword = !verPassword"
                />
              </template>
            </q-input>

            <q-select
              v-model="formulario.rol"
              outlined
              dense
              emit-value
              map-options
              :options="opcionesRol"
              label="Rol *"
              :rules="[seleccionRequerida('el rol')]"
            />

            <q-toggle
              v-if="esEdicion"
              v-model="formulario.activo"
              label="Cuenta activa"
              color="primary"
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
              :label="esEdicion ? 'Guardar cambios' : 'Crear usuario'"
              :loading="guardando"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>
