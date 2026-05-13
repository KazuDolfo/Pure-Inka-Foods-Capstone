export type RolUsuario = 'administrador' | 'cliente';
export type TipoCliente = 'minorista' | 'mayorista' | null;

export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  contrasena?: string; // nunca se envía al frontend, pero se mantiene opcional
  rol: RolUsuario;
  telefono?: string;
  fecha_registro: string; // ISO date

  // Campos específicos
  tipo_cliente?: TipoCliente;
  email_verificado?: boolean;
}
