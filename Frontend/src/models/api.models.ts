

export interface ApiCategory {
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
  category_name?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type ProductsApiResponse = ApiResponse<ApiProduct[]>;
export type CategoriesApiResponse = ApiResponse<ApiCategory[]>;
export type ProductApiResponse = ApiResponse<ApiProduct>;

export interface AuthResponseData {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: string;
  telefono: string;
  fecha_registro?: string;
  token: string;
}

export type AuthApiResponse = ApiResponse<AuthResponseData>;

export interface UserProfileResponseData {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: string;
  telefono: string;
  fecha_registro: string;
}

export type UserProfileApiResponse = ApiResponse<UserProfileResponseData>;

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
