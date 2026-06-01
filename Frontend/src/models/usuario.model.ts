export type RolUsuario = 'administrador' | 'cliente';
export type TipoCliente = 'minorista' | 'mayorista' | null;

export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  contrasena?: string; 
  rol: RolUsuario;
  telefono?: string;
  fecha_registro: string; 

  
  tipo_cliente?: TipoCliente;
  email_verificado?: boolean;
}
