import { createRouter, createWebHashHistory } from "vue-router";
import { Notify } from "quasar";

import { useAuthStore } from "@/store/Auth";

import AdminLayout from "@/layouts/AdminLayout.vue";

import LoginView from "@/views/LoginView.vue";
import CatalogoView from "@/views/CatalogoView.vue";
import ProductosView from "@/views/ProductosView.vue";
import ProveedoresView from "@/views/ProveedoresView.vue";
import CategoriasView from "@/views/CategoriasView.vue";
import UsuariosView from "@/views/UsuariosView.vue";
import NotFoundView from "@/views/NotFoundView.vue";

const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView,
    meta: { titulo: "Iniciar sesión", soloInvitados: true },
  },
  {
    path: "/",
    component: AdminLayout,
    children: [
      {
        path: "catalogo",
        name: "catalogo",
        component: CatalogoView,
        meta: { titulo: "Catálogo", requiereAuth: true },
      },
      {
        path: "productos",
        name: "productos",
        component: ProductosView,
        meta: { titulo: "Productos", requiereAuth: true, requiereAdmin: true },
      },
      {
        path: "proveedores",
        name: "proveedores",
        component: ProveedoresView,
        meta: { titulo: "Proveedores", requiereAuth: true, requiereAdmin: true },
      },
      {
        path: "categorias",
        name: "categorias",
        component: CategoriasView,
        meta: { titulo: "Categorías", requiereAuth: true, requiereAdmin: true },
      },
      {
        path: "usuarios",
        name: "usuarios",
        component: UsuariosView,
        meta: { titulo: "Usuarios", requiereAuth: true, requiereAdmin: true },
      },
      {
        path: ":pathMatch(.*)*",
        name: "no-encontrado",
        component: NotFoundView,
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
