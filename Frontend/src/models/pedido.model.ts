export type EstadoPago = 'PENDIENTE' | 'PAGADO' | 'RECHAZADO';
export type EstadoEnvio = 'PROCESANDO' | 'ENVIADO' | 'ENTREGADO' | 'ADUANAS';

export interface Pedido {
  id_pedido: number;
  id_usuario: number;
  id_direccion: number; // Coincide con tu BD
  fecha: string;        // Coincide con tu BD
  total: number;
  estado_pago: EstadoPago;
  estado_envio: EstadoEnvio;
  transaccion_id: string;
  nombre_usuario?: string; // Para la vista de admin
  items?: any[];
}
