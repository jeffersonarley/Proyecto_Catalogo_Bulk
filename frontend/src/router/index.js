import { createRouter, createWebHashHistory } from "vue-router";
import { Notify } from "quasar";

import { useAuthStore } from "@/store/Auth";

import Layout from "@/pages/Layout/Layout.vue";

import Login from "@/pages/Login/Login.vue";
import Catalogo from "@/pages/Catalogo/Catalogo.vue";
import Productos from "@/pages/Layout/Productos/Productos.vue";
import Proveedores from "@/pages/Layout/Proveedores/Proveedores.vue";
import Categorias from "@/pages/Layout/Categorias/Categorias.vue";
import Usuarios from "@/pages/Layout/Usuarios/Usuarios.vue";
import NotFound from "@/pages/NotFound/NotFound.vue";

const routes = [
  {
    path: "/",
    redirect: { name: "login" },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { titulo: "Iniciar sesión", soloInvitados: true },
  },
  {
    path: "/",
    component: Layout,
    children: [
      {
        path: "catalogo",
        name: "catalogo",
        component: Catalogo,
        meta: { titulo: "Catálogo", requiereAuth: true },
      },
      {
        path: "productos",
        name: "productos",
        component: Productos,
        meta: { titulo: "Productos", requiereAuth: true, requiereAdmin: true },
      },
      {
        path: "proveedores",
        name: "proveedores",
        component: Proveedores,
        meta: { titulo: "Proveedores", requiereAuth: true, requiereAdmin: true },
      },
      {
        path: "categorias",
        name: "categorias",
        component: Categorias,
        meta: { titulo: "Categorías", requiereAuth: true, requiereAdmin: true },
      },
      {
        path: "usuarios",
        name: "usuarios",
        component: Usuarios,
        meta: { titulo: "Usuarios", requiereAuth: true, requiereAdmin: true },
      },
      {
        path: ":pathMatch(.*)*",
        name: "no-encontrado",
        component: NotFound,
        meta: { titulo: "Página no encontrada" },
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

function protegerRutas(to) {
  const auth = useAuthStore();

  if (to.meta.requiereAuth === true && !auth.estaAutenticado) {
    Notify.create({
      type: "negative",
      message: "Debes iniciar sesión para entrar a esa página",
      icon: "lock",
      position: "top-right",
    });
    return { name: "login" };
  }

  if (to.meta.soloInvitados === true && auth.estaAutenticado) {
    return { name: "catalogo" };
  }

  if (to.meta.requiereAdmin === true && !auth.esAdmin) {
    Notify.create({
      type: "negative",
      message: "No tienes permisos para entrar a esa página",
      icon: "block",
      position: "top-right",
    });
    return { name: "catalogo" };
  }

  return true;
}

router.beforeEach(protegerRutas);

router.afterEach((to) => {
  const base = import.meta.env.VITE_APP_TITULO || "CatálogoBulk";
  document.title = to.meta.titulo ? `${to.meta.titulo} | ${base}` : base;
});
