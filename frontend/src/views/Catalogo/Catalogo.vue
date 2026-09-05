<script setup>
import { computed, onMounted, ref } from "vue";

import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import { get } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { formatPrecio } from "@/utils/formatDate";

const general = useGeneralStore();
const { notificarError } = useNotificar();

const productos = ref([]);
const total = ref(0);
const page = ref(1);
const limit = 100;
const cargando = ref(false);

const categorias = ref([]);
const proveedores = ref([]);

const filtros = ref({ categoria: "", proveedor: "", disponible: "" });
const busqueda = ref("");

const totalPaginas = computed(() => Math.ceil(total.value / limit) || 1);

const opcionesCategoria = computed(() =>
  categorias.value.map((c) => ({ label: c.nombre || c.slug, value: c.slug }))
);

const opcionesProveedor = computed(() =>
  proveedores.value.map((p) => ({ label: p.nombre, value: p.slug }))
);

const opcionesDisponible = [
  { label: "Disponible", value: "true" },
  { label: "Agotado", value: "false" },
];

const productosFiltrados = computed(() => {
  const q = busqueda.value.trim().toLowerCase();
  if (!q) return productos.value;
  return productos.value.filter((p) =>
    (p.nombre || "").toLowerCase().includes(q)
  );
});

async function cargarOpciones() {
  try {
    const [cats, provs] = await Promise.all([
      get("/categorias"),
      get("/proveedores?page=1&limit=100"),
    ]);
    categorias.value = cats.data || [];
    proveedores.value = provs.data || [];
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
    if (filtros.value.categoria) params.set("categoria", filtros.value.categoria);
    if (filtros.value.proveedor) params.set("proveedor", filtros.value.proveedor);
    if (filtros.value.disponible !== "") params.set("disponible", filtros.value.disponible);

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

function aplicarFiltros() {
  page.value = 1;
  cargarProductos();
}

function limpiarFiltros() {
  filtros.value = { categoria: "", proveedor: "", disponible: "" };
  busqueda.value = "";
  aplicarFiltros();
}

function cambiarPagina(p) {
  page.value = p;
  cargarProductos();
}

onMounted(() => {
  cargarOpciones();
  cargarProductos();
});
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina
        titulo="Catálogo"
        subtitulo="Explora los productos disponibles"
        icono="storefront"
      />

      <div class="row q-col-gutter-md">
        <!-- Filtros laterales -->
        <div class="col-12 col-md-3">
          <q-card flat class="tarjeta q-pa-md">
            <div class="text-subtitle1 text-weight-bold q-mb-md">Filtros</div>

            <q-input
              v-model="busqueda"
              outlined
              dense
              clearable
              label="Buscar por nombre"
              class="q-mb-md"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-select
              v-model="filtros.categoria"
              outlined
              dense
              clearable
              emit-value
              map-options
              :options="opcionesCategoria"
              label="Categoría"
              class="q-mb-md"
            />

            <q-select
              v-model="filtros.proveedor"
              outlined
              dense
              clearable
              emit-value
              map-options
              :options="opcionesProveedor"
              label="Proveedor"
              class="q-mb-md"
            />

            <q-select
              v-model="filtros.disponible"
              outlined
              dense
              clearable
              emit-value
              map-options
              :options="opcionesDisponible"
              label="Disponibilidad"
              class="q-mb-md"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-btn
                  unelevated
                  no-caps
                  color="primary"
                  icon="filter_list"
                  label="Aplicar"
                  class="full-width"
                  @click="aplicarFiltros"
                />
              </div>
              <div class="col-6">
                <q-btn
                  flat
                  no-caps
                  color="grey-8"
                  icon="filter_alt_off"
                  label="Limpiar"
                  class="full-width"
                  @click="limpiarFiltros"
                />
              </div>
            </div>
          </q-card>
        </div>

        <!-- Grid de productos -->
        <div class="col-12 col-md-9">
          <div v-if="cargando" class="row justify-center q-py-xl">
            <q-spinner-dots color="primary" size="40px" />
          </div>

          <div v-else-if="productosFiltrados.length === 0" class="column items-center q-py-xl">
            <q-icon name="inbox" size="64px" color="grey-4" class="q-mb-sm" />
            <span class="empty-title">No hay productos que coincidan</span>
          </div>

          <div v-else class="row q-col-gutter-md">
            <div
              v-for="p in productosFiltrados"
              :key="p._id"
              class="col-6 col-sm-4 col-lg-3"
            >
              <q-card flat class="tarjeta tarjeta-hover result-card full-height">
                <div class="producto-imagen">
                  <q-img
                    v-if="p.imagenUrl"
                    :src="p.imagenUrl"
                    :ratio="4 / 3"
                    loading="lazy"
                    alt="Imagen del producto"
                  />
                  <div v-else class="producto-imagen__vacio full-width">
                    <q-icon name="image" size="48px" color="grey-4" />
                  </div>
                  <q-badge
                    floating
                    class="q-ma-sm"
                    :color="p.disponible ? 'positive' : 'negative'"
                    :label="p.disponible ? 'Disponible' : 'Agotado'"
                  />
                </div>

                <q-card-section>
                  <div class="text-caption texto-suave">{{ p.categoria }}</div>
                  <div class="text-subtitle1 text-weight-bold product-nombre">
                    {{ p.nombre }}
                  </div>
                  <div class="text-h6 text-weight-bold" style="color: var(--color_button)">
                    {{ formatPrecio(p.precio) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div v-if="totalPaginas > 1" class="row items-center justify-center q-mt-md q-gutter-sm">
            <q-btn
              flat
              dense
              no-caps
              label="Anterior"
              :disable="page <= 1"
              @click="cambiarPagina(page - 1)"
            />
            <span class="texto-suave">Página {{ page }} de {{ totalPaginas }}</span>
            <q-btn
              flat
              dense
              no-caps
              label="Siguiente"
              :disable="page >= totalPaginas"
              @click="cambiarPagina(page + 1)"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.producto-imagen {
  position: relative;

  &__vacio {
    aspect-ratio: 4 / 3;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f2f3;
  }
}

.product-nombre {
  min-height: 48px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
