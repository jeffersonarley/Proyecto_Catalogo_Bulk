<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import { get } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { formatPrecio } from "@/utils/formatDate";

const general = useGeneralStore();
const { notificarError } = useNotificar();

const productos = ref([]);
const total = ref(0);
const page = ref(1);
const limit = 24;
const cargando = ref(false);

const categorias = ref([]);

const filtros = reactive({
  busqueda: "",
  categoria: "",
  orden: "recientes",
});

const opcionesOrden = [
  { label: "Relevancia", value: "recientes" },
  { label: "Precio: menor a mayor", value: "precio_asc" },
  { label: "Precio: mayor a menor", value: "precio_desc" },
  { label: "Alfabético (A-Z)", value: "nombre_asc" },
];

const totalPaginas = computed(() => Math.ceil(total.value / limit) || 1);

const hayFiltros = computed(
  () =>
    filtros.busqueda.trim() !== "" ||
    filtros.categoria !== "" ||
    filtros.orden !== "recientes"
);

const chipsCategoria = computed(() => [
  { label: "Todo", value: "" },
  ...categorias.value.map((c) => ({ label: c.nombre || c.slug, value: c.slug })),
]);

async function cargarCategorias() {
  try {
    const res = await get("/categorias");
    categorias.value = res.data || [];
  } catch (e) {
    notificarError(e);
  }
}

async function cargarProductos() {
  cargando.value = true;
  try {
    const params = new URLSearchParams();
    params.set("page", String(page.value));
    params.set("limit", String(limit));
    params.set("activo", "true");

    const busqueda = filtros.busqueda.trim();
    if (busqueda) params.set("q", busqueda);
    if (filtros.categoria) params.set("categoria", filtros.categoria);
    if (filtros.orden) params.set("sort", filtros.orden);

    const res = await get(`/productos?${params.toString()}`);
    productos.value = res.data || [];
    total.value = res.total || 0;
    general.marcarSincronizacion();
  } catch (e) {
    notificarError(e);
  } finally {
    cargando.value = false;
  }
}

function cambiarPagina(p) {
  page.value = p;
  cargarProductos();
}

function limpiarFiltros() {
  filtros.busqueda = "";
  filtros.categoria = "";
  filtros.orden = "recientes";
}

// Debounce: recarga cuando cambia cualquier filtro (búsqueda, categoría u orden).
let temporizador = null;
watch(filtros, () => {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    page.value = 1;
    cargarProductos();
  }, 300);
});

onMounted(() => {
  cargarCategorias();
  cargarProductos();
});

onBeforeUnmount(() => clearTimeout(temporizador));
</script>

<template>
  <q-page class="bg-grey-1">
    <div class="contenedor-catalogo">
      <!-- Barra de filtros -->
      <div class="barra-filtros row items-center q-col-gutter-sm q-mb-md">
        <div class="col-12 col-sm-6 col-md-5">
          <q-input
            v-model="filtros.busqueda"
            outlined
            dense
            rounded
            clearable
            class="buscador"
            placeholder="Buscar por nombre..."
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="col-12 col-sm-4 col-md-4">
          <q-select
            v-model="filtros.orden"
            outlined
            dense
            emit-value
            map-options
            :options="opcionesOrden"
            label="Ordenar por"
          >
            <template #prepend>
              <q-icon name="sort" />
            </template>
          </q-select>
        </div>

        <div class="col-12 col-sm-auto col-md-3">
          <q-btn
            flat
            no-caps
            color="grey-8"
            icon="filter_alt_off"
            label="Limpiar filtros"
            :disable="!hayFiltros"
            class="full-width"
            @click="limpiarFiltros"
          />
        </div>
      </div>

      <!-- Chips de categoría -->
      <div class="chips-categoria q-mb-md">
        <q-chip
          v-for="c in chipsCategoria"
          :key="c.value"
          clickable
          class="chip-cat"
          :class="{ 'chip-cat--activo': filtros.categoria === c.value }"
          @click="filtros.categoria = c.value"
        >
          {{ c.label }}
        </q-chip>
      </div>

      <!-- Contador de resultados -->
      <div v-if="!cargando" class="contador texto-suave q-mb-sm">
        <q-icon name="inventory_2" size="16px" class="q-mr-xs" />
        {{ total }} {{ total === 1 ? "resultado" : "resultados" }}
      </div>

      <!-- Estado: cargando -->
      <div v-if="cargando" class="row justify-center q-py-xl">
        <q-spinner-dots color="orange-8" size="40px" />
      </div>

      <!-- Estado: sin resultados -->
      <div v-else-if="productos.length === 0" class="column items-center q-py-xl">
        <q-icon name="search_off" size="72px" color="grey-4" class="q-mb-sm" />
        <span class="empty-title">No se encontraron productos con estos filtros</span>
        <p class="texto-suave q-mb-md">Prueba con otra búsqueda o categoría.</p>
        <q-btn
          v-if="hayFiltros"
          unelevated
          no-caps
          color="primary"
          icon="filter_alt_off"
          label="Limpiar filtros"
          @click="limpiarFiltros"
        />
      </div>

      <!-- Grid de productos -->
      <div v-else class="row q-col-gutter-md">
        <div
          v-for="p in productos"
          :key="p._id"
          class="col-6 col-sm-4 col-md-3"
        >
          <q-card flat class="producto-tarjeta full-height">
            <div class="producto-media">
              <q-img
                v-if="p.imagenUrl"
                :src="p.imagenUrl"
                :ratio="1"
                fit="cover"
                loading="lazy"
                alt="Imagen del producto"
              />
              <div v-else class="media-vacia full-width">
                <q-icon name="image" size="52px" color="grey-4" />
              </div>

              <div v-if="!p.disponible" class="agotado-overlay">
                <span>Agotado</span>
              </div>

              <q-badge
                v-else
                floating
                class="q-ma-sm"
                color="green-7"
                label="Envío gratis"
              />
            </div>

            <q-card-section class="producto-info">
              <div class="producto-categoria text-caption texto-suave">
                {{ p.categoria }}
              </div>
              <div class="producto-nombre">{{ p.nombre }}</div>
              <div class="producto-precio">{{ formatPrecio(p.precio) }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="totalPaginas > 1" class="row items-center justify-center q-mt-lg q-gutter-sm">
        <q-btn
          flat
          dense
          no-caps
          color="grey-8"
          label="Anterior"
          :disable="page <= 1"
          @click="cambiarPagina(page - 1)"
        />
        <span class="texto-suave">Página {{ page }} de {{ totalPaginas }}</span>
        <q-btn
          flat
          dense
          no-caps
          color="grey-8"
          label="Siguiente"
          :disable="page >= totalPaginas"
          @click="cambiarPagina(page + 1)"
        />
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.contenedor-catalogo {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 16px 16px 40px;
}

.buscador {
  :deep(.q-field__control) {
    background: #fff;
    border-radius: 24px;
  }
}

.contador {
  font-size: 13px;
  display: flex;
  align-items: center;
}

.chips-categoria {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  flex-wrap: nowrap;

  &::-webkit-scrollbar {
    height: 0;
  }
}

.chip-cat {
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #424242;
  border-radius: 20px;
  flex-shrink: 0;

  &--activo {
    background: #2e7d32;
    border-color: #2e7d32;
    color: #fff;
  }
}

.producto-tarjeta {
  border-radius: 10px;
  border: 1px solid #ececec;
  overflow: hidden;
  background: #fff;
  transition: box-shadow 0.15s ease, transform 0.15s ease;

  &:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

.producto-media {
  position: relative;
}

.media-vacia {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f2f3;
}

.agotado-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);

  span {
    background: #424242;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 14px;
    letter-spacing: 0.3px;
  }
}

.producto-info {
  padding: 10px 12px 14px;
}

.producto-categoria {
  text-transform: capitalize;
  margin-bottom: 2px;
}

.producto-nombre {
  font-size: 14px;
  font-weight: 500;
  color: #212121;
  min-height: 40px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}

.producto-precio {
  font-size: 18px;
  font-weight: 800;
  color: #2e7d32;
}
</style>
