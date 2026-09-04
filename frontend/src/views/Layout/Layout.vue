<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useGeneralStore } from "@/store/General";
import { useAuthStore } from "@/store/Auth";
import { useNotificar } from "@/composables/useNotificar";
import { formatDateTime } from "@/utils/formatDate";
import logo from "@/assets/logo.svg";

const general = useGeneralStore();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const { notificarInfo } = useNotificar();

const drawerRef = ref(null);

const cerrarMenuAlClicFuera = (event) => {
  if (!general.menuAbierto) return;
  const drawer = drawerRef.value?.$el || drawerRef.value;
  if (drawer && !drawer.contains(event.target)) {
    general.menuAbierto = false;
  }
};

onMounted(() => document.addEventListener("click", cerrarMenuAlClicFuera));
onBeforeUnmount(() => document.removeEventListener("click", cerrarMenuAlClicFuera));

const salir = () => {
  auth.cerrarSesion();
  notificarInfo("Sesión cerrada");
  router.push({ name: "login" });
};

const opcionesMenu = [
  { name: "catalogo", titulo: "Catálogo", icono: "storefront" },
  { name: "productos", titulo: "Productos", icono: "inventory_2", soloAdmin: true },
  { name: "proveedores", titulo: "Proveedores", icono: "local_shipping", soloAdmin: true },
  { name: "categorias", titulo: "Categorías", icono: "category", soloAdmin: true },
  { name: "usuarios", titulo: "Usuarios", icono: "group", soloAdmin: true },
];

const opcionesVisibles = computed(() =>
  opcionesMenu.filter((o) => !o.soloAdmin || auth.esAdmin)
);

const tituloSeccion = computed(() => route.meta?.titulo || "Panel");
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Abrir menú"
          @click.stop="general.alternarMenu()"
        />

        <q-toolbar-title class="text-weight-bold text-subtitle1">
          {{ tituloSeccion }}
        </q-toolbar-title>

        <template v-if="auth.estaAutenticado">
          <div class="text-caption q-mr-sm gt-xs">
            {{ auth.nombreUsuario }}
            <q-badge
              class="q-ml-xs"
              :color="auth.esAdmin ? 'warning' : 'blue-3'"
              text-color="black"
            >
              {{ auth.esAdmin ? "admin" : "user" }}
            </q-badge>
          </div>

          <q-btn flat dense round icon="logout" aria-label="Cerrar sesión" @click="salir">
            <q-tooltip>Cerrar sesión</q-tooltip>
          </q-btn>
        </template>

        <q-btn
          v-else
          flat
          dense
          no-caps
          icon="login"
          label="Entrar"
          :to="{ name: 'login' }"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      ref="drawerRef"
      v-model="general.menuAbierto"
      show-if-above
      bordered
      :width="248"
      class="bg-white"
    >
      <div class="q-pa-md row items-center no-wrap">
        <img :src="logo" alt="Logo" width="34" height="34" class="q-mr-sm" />
        <div class="text-weight-bold">{{ general.titulo }}</div>
      </div>

      <q-separator />

      <q-list padding>
        <q-item-label header class="text-uppercase text-caption text-weight-bold">
          Menú
        </q-item-label>

        <q-item
          v-for="opcion in opcionesVisibles"
          :key="opcion.name"
          v-ripple
          clickable
          class="enlace-menu"
          :to="{ name: opcion.name }"
        >
          <q-item-section avatar>
            <q-icon :name="opcion.icono" />
          </q-item-section>
          <q-item-section>{{ opcion.titulo }}</q-item-section>
        </q-item>
      </q-list>

      <div class="absolute-bottom q-pa-md text-caption texto-suave">
        <div>
          <q-icon name="dns" size="14px" class="q-mr-xs" />
          {{ general.urlApi }}
        </div>
        <div v-if="general.ultimaSincronizacion" class="q-mt-xs">
          <q-icon name="schedule" size="14px" class="q-mr-xs" />
          {{ formatDateTime(general.ultimaSincronizacion) }}
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
