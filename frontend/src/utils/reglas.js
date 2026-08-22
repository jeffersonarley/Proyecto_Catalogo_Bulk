import { validateEmail } from "./validateEmail";

export const requerido =
  (campo = "Este campo") =>
  (v) =>
    (v !== null && v !== undefined && String(v).trim() !== "") ||
    `${campo} es obligatorio`;

export const esEmail =
  () =>
  (v) =>
    validateEmail(v) || "El email no es válido";

export const minimo =
  (min, campo = "Este campo") =>
  (v) =>
    String(v ?? "").trim().length >= min ||
    `${campo} debe tener al menos ${min} caracteres`;

export const maximo =
  (max, campo = "Este campo") =>
  (v) =>
    String(v ?? "").trim().length <= max ||
    `${campo} no puede superar los ${max} caracteres`;

export const soloNumeros =
  () =>
  (v) =>
    /^\d+$/.test(String(v ?? "").trim()) || "Solo se permiten números";

export const enteroMayorA =
  (min, campo = "El valor") =>
  (v) => {
    const n = Number(v);
    return (
      (Number.isInteger(n) && n > min) ||
      `${campo} debe ser un número entero mayor a ${min}`
    );
  };

export const enteroMayorOIgualA =
  (min, campo = "El valor") =>
  (v) => {
    const n = Number(v);
    return (
      (Number.isInteger(n) && n >= min) ||
      `${campo} debe ser un número entero mayor o igual a ${min}`
    );
  };

export const numeroMayorOIgualA =
  (min, campo = "El valor") =>
  (v) => {
    const n = Number(v);
    return (
      !Number.isNaN(n) && n >= min
    ) || `${campo} debe ser un número mayor o igual a ${min}`;
  };

export const seleccionRequerida =
  (campo = "Este campo") =>
  (v) =>
    (v !== null && v !== undefined && v !== "") || `Debe seleccionar ${campo}`;

export const igualA =
  (obtenerEsperado, mensaje = "Los valores no coinciden") =>
  (v) =>
    v === obtenerEsperado() || mensaje;
