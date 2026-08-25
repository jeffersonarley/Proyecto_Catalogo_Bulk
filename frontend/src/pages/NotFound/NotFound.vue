<script setup></script>

<template>
  <q-page>
    <div class="contenedor-app">
      <div class="column items-center q-py-xl text-center">
        <q-icon name="search_off" size="96px" color="grey-4" />
        <h2 class="text-h4 q-mt-md">Página no encontrada</h2>
        <p class="texto-suave">La ruta que buscas no existe.</p>
        <q-btn
          unelevated
          no-caps
          color="primary"
          label="Ir al catálogo"
          :to="{ name: 'catalogo' }"
        />
      </div>
    </div>
  </q-page>
</template>
