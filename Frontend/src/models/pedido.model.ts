export type EstadoPago = 'PENDIENTE' | 'PAGADO' | 'RECHAZADO';
export type EstadoEnvio = 'PROCESANDO' | 'ENVIADO' | 'ENTREGADO' | 'ADUANAS';

export interface Pedido {
  id_pedido: number;
  id_usuario: number;
  id_direccion: number;
  fecha: string;
  total: number;
  estado_pago: EstadoPago;
  estado_envio: EstadoEnvio;
  transaccion_id: string;
  nombre?: string;
  email?: string;
  tipo_comprobante?: 'BOLETA' | 'FACTURA';
  ruc?: string;
  razon_social?: string;
  comprobante_url?: string;
  comprobante_pdf_url?: string;
  metodo_pago?: string;
  items?: any[];
}
