// src/models/direccion.model.ts

export interface Direccion {
  id_direccion: number;
  id_usuario: number;
  id_pais: number;
  nombre_direccion: string;
  estado_region: string;
  ciudad: string;
  codigo_postal?: string;
  direccion_exacta: string;
  referencia?: string;
  pais_nombre?: string;
}

export interface Pais {
  id_pais: number;
  nombre: string;
  iso_code?: string;
}
