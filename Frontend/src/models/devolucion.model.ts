export type EstadoDevolucion = 'pendiente' | 'procesando' | 'aprobada' | 'rechazada' | 'completada';

export interface Devolucion {
  id_devolucion: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  motivo: string;
  fecha_solicitud: string;
  estado: EstadoDevolucion;
  fecha_resolucion?: string | null;
  monto_reembolsado?: number;
  tipo?: string;
}
