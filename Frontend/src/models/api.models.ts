// src/models/api.models.ts

export interface Category {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

export interface ApiProduct {
  id_producto: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  id_categoria?: number;
  precio: number | string;
  stock_actual: number;
  imagen_url: string;
  activo: boolean;
  fecha_creacion?: string;
}

export interface ApiCategory {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

export interface ProductsApiResponse {
  success: boolean;
  message?: string;
  data: ApiProduct[];
}

export interface CategoriesApiResponse {
  success: boolean;
  message?: string;
  data: ApiCategory[];
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  stock_actual: number;
  isActive: boolean;
  id_categoria?: number;
  category_name?: string;
  isNew?: boolean;
  rating?: number;
}

export interface CartItem extends Product {
  quantity: number;
}
