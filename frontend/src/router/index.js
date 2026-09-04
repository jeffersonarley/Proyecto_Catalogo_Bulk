import { createRouter, createWebHashHistory } from "vue-router";
import { Notify } from "quasar";

import { useAuthStore } from "@/store/Auth";

import Layout from "@/views/Layout/Layout.vue";

import PublicLayout from "@/views/Public/PublicLayout.vue";
import CatalogoPublico from "@/views/Public/CatalogoPublico.vue";

import Login from "@/views/Login/Login.vue";
import Catalogo from "@/views/Catalogo/Catalogo.vue";
import Productos from "@/views/Layout/Productos/Productos.vue";
import Proveedores from "@/views/Layout/Proveedores/Proveedores.vue";
import Categorias from "@/views/Layout/Categorias/Categorias.vue";
import Usuarios from "@/views/Layout/Usuarios/Usuarios.vue";
import NotFound from "@/views/NotFound/NotFound.vue";

const routes = [
  {
    path: "/",
    component: PublicLayout,
    children: [
      {
        path: "",
        name: "inicio",
        component: CatalogoPublico,
        meta: { titulo: "Catálogo" },
      },
    ],
  },
  {
    path: "/loginadmin",
    name: "login",
    component: Login,
    meta: { titulo: "Acceso de administrador", soloInvitados: true },
  },
  {
    path: "/admin",
    component: Layout,
    meta: { requiereAuth: true },
    children: [
      {
        path: "",
        redirect: { name: "catalogo" },
      },
      {
        path: "catalogo",
        name: "catalogo",
        component: Catalogo,
        meta: { titulo: "Catálogo" },
      },
      {
        path: "productos",
        name: "productos",
        component: Productos,
        meta: { titulo: "Productos", requiereAdmin: true },
      },
      {
        path: "proveedores",
        name: "proveedores",
        component: Proveedores,
        meta: { titulo: "Proveedores", requiereAdmin: true },
      },
      {
        path: "categorias",
        name: "categorias",
        component: Categorias,
        meta: { titulo: "Categorías", requiereAdmin: true },
      },
      {
        path: "usuarios",
        name: "usuarios",
        component: Usuarios,
        meta: { titulo: "Usuarios", requiereAdmin: true },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "no-encontrado",
    component: NotFound,
    meta: { titulo: "Página no encontrada" },
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
