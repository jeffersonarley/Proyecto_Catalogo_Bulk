<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { useGeneralStore } from "@/store/General";
import { useAuthStore } from "@/store/Auth";
import { useNotificar } from "@/composables/useNotificar";
import logo from "@/assets/logo.svg";

const general = useGeneralStore();
const auth = useAuthStore();
const router = useRouter();
const { notificarInfo } = useNotificar();

const busqueda = ref("");

const irInicio = () => router.push({ name: "inicio" });

const buscar = () => {
  const q = busqueda.value.trim();
  router.push({ name: "inicio", query: q ? { q } : {} });
};

const salir = () => {
  auth.cerrarSesion();
  notificarInfo("Sesión cerrada");
  router.push({ name: "inicio" });
};
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="header-publico">
      <div class="barra-promo text-center">
        Envíos a todo el país · Catálogo mayorista
      </div>

      <q-toolbar class="bg-white text-dark q-px-sm q-py-xs">
        <!-- Esquina superior izquierda: acceso discreto al administrador -->
        <div class="toolbar-izquierda row items-center no-wrap">
          <template v-if="!auth.estaAutenticado">
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              class="btn-admin"
              icon="admin_panel_settings"
              label="Admin"
              :to="{ name: 'login' }"
            >
              <q-tooltip>Ingreso de administrador</q-tooltip>
            </q-btn>
          </template>
          <template v-else>
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              class="btn-admin"
              icon="dashboard"
              label="Panel"
              :to="{ name: 'catalogo' }"
            />
            <q-btn
              flat
              dense
              round
              size="sm"
              icon="logout"
              color="grey-7"
              @click="salir"
            >
              <q-tooltip>Cerrar sesión</q-tooltip>
            </q-btn>
          </template>
        </div>

        <div class="marca row items-center no-wrap cursor-pointer" @click="irInicio">
          <img :src="logo" alt="Logo" width="28" height="28" class="q-mr-xs" />
          <span class="marca-nombre">{{ general.titulo }}</span>
        </div>

        <q-space />

        <q-input
          v-model="busqueda"
          outlined
          dense
          rounded
          clearable
          class="buscador"
          placeholder="Buscar productos..."
          @keyup.enter="buscar"
          @clear="buscar"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-space />

        <div class="toolbar-acciones">
          <q-btn flat dense round icon="shopping_cart" color="grey-8">
            <q-badge floating color="orange-8" label="0" />
            <q-tooltip>Carrito</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="footer-publico bg-white text-grey-7">
      <div class="text-center q-py-sm text-caption">
        {{ general.titulo }} · {{ new Date().getFullYear() }}
      </div>
    </q-footer>
  </q-layout>
</template>

<style scoped lang="scss">
.header-publico {
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
}

.barra-promo {
  background-color: #fb7701;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  letter-spacing: 0.3px;
}

.toolbar-izquierda {
  min-width: 88px;
}

.btn-admin {
  color: #9e9e9e;
  font-size: 12px;
  letter-spacing: 0.4px;

  &:hover {
    color: #424242;
  }
}

.marca-nombre {
  font-weight: 700;
  font-size: 16px;
  color: var(--q-primary, #2e7d32);
  white-space: nowrap;
}

.buscador {
  width: 100%;
  max-width: 460px;

  :deep(.q-field__control) {
    background: #f5f5f5;
    border-radius: 24px;
  }
}

.footer-publico {
  border-top: 1px solid #e0e0e0;
}
</style>
