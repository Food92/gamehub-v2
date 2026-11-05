import { solicitar } from "./api.js";

export const categoriasService = {
  listar: (opciones = {}) => solicitar("/categories", opciones),
};