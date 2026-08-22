import { computed, ref } from "vue";
import { defineStore } from "pinia";

function decodificarToken(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref(null);

    // { id, email, rol }. Nuestro login devuelve solo { token }; el email
    // lo aporta el formulario y el rol sale del payload del JWT.
    const usuario = ref(null);

    const estaAutenticado = computed(() => !!token.value);

    const esAdmin = computed(() => usuario.value?.rol === "admin");

    const nombreUsuario = computed(() => usuario.value?.email || "Invitado");

    function guardarSesion({ token: nuevoToken, email = null }) {
      token.value = nuevoToken;
      const payload = decodificarToken(nuevoToken);
      usuario.value = {
        id: payload.sub || null,
        email,
        rol: payload.rol || "user",
      };
    }

    function cerrarSesion() {
      token.value = null;
      usuario.value = null;
    }

    return {
      token,
      usuario,
      estaAutenticado,
      esAdmin,
      nombreUsuario,
      guardarSesion,
      cerrarSesion,
    };
  },
  {
    persist: true,
  }
);
