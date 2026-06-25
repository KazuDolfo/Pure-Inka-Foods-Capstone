Manual de Sistema para Pure Inka Foods

1. Instalación y Ejecución

Prerrequisitos
- Node.js instalado en el equipo.
- Servidor MySQL activo.

Configuración de la Base de Datos
1. Dirígete a la ruta: `Backend/src/config`.
2. Abre el archivo `bd.js` (o `.env` según corresponda) y actualiza las credenciales de conexión a MySQL (usuario, contraseña, nombre de la base de datos).
3. Ejecuta los siguientes scripts SQL en tu gestor de base de datos MySQL en orden:
   - DDL-bd_pureinka.sql
   - DML-Pure inka.sql

Instalación de Dependencias
Abre una terminal independiente para las carpetas **Backend** y **Frontend**:
1. Navega a cada carpeta correspondiente.
2. Ejecuta el comando:
   npm install

Inicialización del Sistema
Backend:
En la terminal de la carpeta Backend.
Ejecuta:
  npm run dev

Frontend:
En la terminal de la carpeta Frontend.
Ejecuta:
  npm start

Validación de Estado
Para comprobar que el sistema funciona correctamente, puedes ejecutar `npm test` en el backend y `ng test` en el frontend.
Verifica el estado general del backend ingresando a la ruta `http://localhost:5000/api/health` en tu navegador.



2. Accesos de Prueba

- Rol de Cliente (Login Normal)
  - Correo: berna@gmail.com
  - Contraseña: sasasa

- Rol de Administrador (Acceso Administrativo)
  - Correo: admin@pureinka.com
  - Contraseña: Admin123


3. Funcionalidades y Experiencia del Cliente

Registro de Usuario
Al registrar una nueva cuenta y rellenar el formulario, el sistema enviará un código de seis dígitos requerido para validar tu identidad de forma segura. *Nota para pruebas: Este código puede revisarse en la consola del backend.*

Tienda
La exploración de la tienda ha sido optimizada. Al ingresar a un producto, visualizarás la descripción detallada y el sistema te sugerirá automáticamente artículos similares de interés.

Carrito
Podrás seleccionar y añadir productos al carrito desde la tienda. Se incluirá un indicador visual que detalla el número de productos agregados antes de proceder a la finalización de compra.

Pago
Al hacer clic en "Finalizar Compra", serás redirido al proceso de pago:
1. Dirección: Selecciona una dirección existente o añade una nueva mediante el formulario.
2. Tipo de Envío: Escoge entre las tres opciones disponibles; el costo de envío variará y se reflejará en el detalle del pedido.
3. Métodos de Pago: El sistema ofrece integración con tarjetas y billeteras digitales.
4. Comprobante: Podrás elegir la emisión de *Boleta* o *Factura* antes de confirmar el pedido.

Mi Perfil
Gestiona todas tus compras desde esta sección. Contarás con un historial de pedidos desde donde podrás:
- Descargar comprobantes de compra en formato PDF.
- Cancelar pedidos que aún no han iniciado el proceso de envío.


4. Gestión del Administrador

Dashboard
El centro de mando principal permite el monitoreo dinámico de:
- Ingresos reales.
- Ventas promedio.
- Nuevos clientes registrados.
- Alertas de Inventario: Notificaciones visuales inmediatas sobre productos con stock crítico para su reabastecimiento.

Productos
Mayor control operativo sobre el catálogo completo. Permite gestionar y actualizar stock, imágenes y precios.

Pedidos
Facilita la actualización de los diferentes estados de un pedido (ej. Procesando, Enviado, Entregado) para mantener al cliente notificado sobre los avances.

Métodos de Pago
Configura, activa o desactiva métodos de pago frente a cualquier eventualidad, además de permitir actualizar códigos QR y capturas asociados a las billeteras digitales.


5. Auditoría y Seguridad del Sistema

- Bloqueo de Intentos: El sistema ha sido reforzado bloqueando automáticamente las cuentas que fallen el inicio de sesión cinco veces consecutivas.
- Logs: Los registros detallados y errores del sistema se pueden auditar directamente inspeccionando la carpeta `logs` generada en el backend.
