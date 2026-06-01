

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  inventario: number;
  urlImagen: string;
  activo: boolean;
  categoriaId: string;
  proveedorId: string;
}

export interface ProductoDTO {
  nombre: string;
  descripcion: string;
  precio: number;
  inventario: number;
  urlImagen: string;
  activo: boolean;
  categoriaId: string;
  proveedorId: string;
}

export interface InventarioUpdateDTO {
  inventario: number;
}