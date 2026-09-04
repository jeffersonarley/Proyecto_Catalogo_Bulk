<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { useGeneralStore } from "@/store/General";
import logo from "@/assets/logo.svg";

const general = useGeneralStore();
const router = useRouter();

const busqueda = ref("");

const irInicio = () => router.push({ name: "inicio" });

const buscar = () => {
  const q = busqueda.value.trim();
  router.push({ name: "inicio", query: q ? { q } : {} });
};
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="header-publico">
      <div class="barra-promo text-center">
        Envíos a todo el país · Catálogo mayorista
      </div>

      <q-toolbar class="bg-white text-dark q-px-sm q-py-xs">
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
  background-color: #2e7d32;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  letter-spacing: 0.3px;
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
