<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { get } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { formatPrecio } from "@/utils/formatDate";

const general = useGeneralStore();
const route = useRoute();
const { notificarError } = useNotificar();

const productos = ref([]);
const total = ref(0);
const page = ref(1);
const limit = 24;
const cargando = ref(false);

const categorias = ref([]);
const categoriaActiva = ref("");
const busqueda = ref("");

const totalPaginas = computed(() => Math.ceil(total.value / limit) || 1);

const chipsCategoria = computed(() => [
  { label: "Todo", value: "" },
  ...categorias.value.map((c) => ({ label: c.nombre || c.slug, value: c.slug })),
]);

const productosFiltrados = computed(() => {
  const q = busqueda.value.toLowerCase();
  if (!q) return productos.value;
  return productos.value.filter((p) =>
    (p.nombre || "").toLowerCase().includes(q)
  );
});

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
    if (categoriaActiva.value) params.set("categoria", categoriaActiva.value);

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

function seleccionarCategoria(slug) {
  categoriaActiva.value = slug;
  page.value = 1;
  cargarProductos();
}

function cambiarPagina(p) {
  page.value = p;
  cargarProductos();
}

// La búsqueda llega desde el header vía query ?q=
watch(
  () => route.query.q,
  (q) => {
    busqueda.value = String(q || "").trim();
    page.value = 1;
    cargarProductos();
  }
);

onMounted(() => {
  busqueda.value = String(route.query.q || "").trim();
  cargarCategorias();
  cargarProductos();
});
</script>

<template>
  <q-page class="bg-grey-1">
    <div class="contenedor-catalogo">
      <!-- Chips de categoría -->
      <div class="chips-categoria q-mb-md">
        <q-chip
          v-for="c in chipsCategoria"
          :key="c.value"
          clickable
          class="chip-cat"
          :class="{ 'chip-cat--activo': categoriaActiva === c.value }"
          @click="seleccionarCategoria(c.value)"
        >
          {{ c.label }}
        </q-chip>
      </div>

      <!-- Estado: cargando -->
      <div v-if="cargando" class="row justify-center q-py-xl">
        <q-spinner-dots color="orange-8" size="40px" />
      </div>

      <!-- Estado: vacío -->
      <div v-else-if="productosFiltrados.length === 0" class="column items-center q-py-xl">
        <q-icon name="inbox" size="72px" color="grey-4" class="q-mb-sm" />
        <span class="empty-title">No hay productos disponibles</span>
      </div>

      <!-- Grid de productos -->
      <div v-else class="row q-col-gutter-md">
        <div
          v-for="p in productosFiltrados"
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
