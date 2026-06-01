export interface Inventario {
  id_inventario: number;
  id_producto: number;
  cantidad_actual: number;
  cantidad_minima: number;
  fecha_ultima_actualizacion: string;
}
