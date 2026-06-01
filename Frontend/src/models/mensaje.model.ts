export interface Mensaje {
  id_mensaje?: number;
  id_conversacion: number;
  id_emisor: number;
  emisor_nombre?: string;
  contenido: string;
  tipo_mensaje: 'TEXTO' | 'IMAGEN';
  url_adjunto?: string;
  fecha_envio?: string;
  fecha?: string; 
  leido: boolean;
}

export interface Conversacion {
  id_conversacion: number;
  id_cliente: number;
  nombre_cliente: string;
  email_cliente: string;
  id_admin: number;
  ultimo_mensaje?: string;
  fecha_ultimo?: string;
  no_leidos: number;
  ultima_actualizacion: string;
  foto_url?: string;
}

