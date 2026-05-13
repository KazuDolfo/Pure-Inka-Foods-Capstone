// src/models/index.ts

// Reexportar todas las interfaces del archivo API/Productos
export * from './api.models';

// Modelos del Sistema (Base)
export * from './carrito-item.model';
export * from './carrito.model';
export * from './categoria.model';
export * from './detalle-pedido.model';
export * from './devolucion.model';
export * from './inventario.model';
export * from './pedido.model';
export * from './producto.model';
export * from './proveedor.model';
export * from './usuario.model';

// NUEVOS MODELOS DE CHEKOUT Y ADMINISTRACIÓN
export * from './direccion.model';
export * from './mensaje.model';