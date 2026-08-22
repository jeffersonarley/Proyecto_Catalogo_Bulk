import { useQuasar } from "quasar";

export function useNotificar() {
  const $q = useQuasar();

  const notificarOk = (mensaje) => {
    $q.notify({ type: "positive", message: mensaje, icon: "check_circle" });
  };

  const notificarError = (error) => {
    if (typeof error === "string") {
      $q.notify({ type: "negative", message: error, icon: "error" });
      return;
    }

    const detalle = error?.errores?.length ? error.errores.join(" · ") : "";

    $q.notify({
      type: "negative",
      icon: "error",
      message: error?.mensaje || "Ocurrió un error inesperado",
      caption: detalle,
      timeout: detalle ? 5000 : 3000,
    });
  };

  const notificarInfo = (mensaje) => {
    $q.notify({ type: "info", message: mensaje, icon: "info" });
  };

  return { notificarOk, notificarError, notificarInfo };
}
