import { useQuasar } from "quasar";

const opcionesBase = {
  position: "top-right",
  classes: "notificacion-bulk",
  timeout: 3500,
  actions: [{ icon: "close", color: "white", round: true, size: "sm" }],
};

export function useNotificar() {
  const $q = useQuasar();

  const notificarOk = (mensaje, caption) => {
    $q.notify({
      ...opcionesBase,
      type: "positive",
      icon: "check_circle",
      message: mensaje,
      caption,
    });
  };

  const notificarError = (error, caption) => {
    if (typeof error === "string") {
      $q.notify({
        ...opcionesBase,
        type: "negative",
        icon: "error",
        message: error,
        caption,
      });
      return;
    }

    const detalle = error?.errores?.length ? error.errores.join(" · ") : "";

    $q.notify({
      ...opcionesBase,
      type: "negative",
      icon: "error",
      message: error?.mensaje || "Ocurrió un error inesperado",
      caption: caption || detalle,
      timeout: detalle ? 5000 : 3500,
    });
  };

  const notificarInfo = (mensaje, caption) => {
    $q.notify({
      ...opcionesBase,
      type: "info",
      icon: "info",
      message: mensaje,
      caption,
    });
  };

  const notificarAdvertencia = (mensaje, caption) => {
    $q.notify({
      ...opcionesBase,
      type: "warning",
      icon: "warning",
      message: mensaje,
      caption,
    });
  };

  return { notificarOk, notificarError, notificarInfo, notificarAdvertencia };
}
