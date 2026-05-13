export interface DetallePedido {
  id_detalle: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  descuento_item?: number;
}
