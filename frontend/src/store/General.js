import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useGeneralStore = defineStore("general", () => {
  const titulo = ref(import.meta.env.VITE_APP_TITULO || "CatálogoBulk");

  const menuAbierto = ref(false);

  const ultimaSincronizacion = ref(null);

  const urlApi = computed(() => import.meta.env.VITE_API_URL || "http://localhost:3000/api");

  function alternarMenu() {
    menuAbierto.value = !menuAbierto.value;
  }

  function marcarSincronizacion() {
    ultimaSincronizacion.value = new Date();
  }

  return {
    titulo,
    menuAbierto,
    ultimaSincronizacion,
    urlApi,
    alternarMenu,
    marcarSincronizacion,
  };
});
