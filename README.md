# Pure Inka Foods - E-Commerce de Superalimentos

Este proyecto es una plataforma de comercio electrónico diseñada para la venta de superalimentos andinos y amazónicos peruanos. Permite a los usuarios descubrir productos naturales, realizar compras seguras con diversos métodos de pago y gestionar sus pedidos.

## Características Principales

### Para Clientes
- Catálogo de productos con filtros por categoría y búsqueda.
- Carrito de compras persistente.
- Proceso de pago con soporte para Yape, Plin, Transferencia Bancaria y Tarjeta de Crédito (Stripe).
- Gestión de perfil: actualización de datos, direcciones y cambio de contraseña.
- Recuperación de cuenta mediante código enviado a correo o teléfono.
- Generación y descarga de boletas o facturas en PDF para pedidos pagados.
- Chat de soporte directo desde el perfil de usuario.

### Para Administradores
- Panel de control (Dashboard) con métricas de ventas, registros de usuarios y alertas de stock.
- Gestión integral de productos y categorías.
- Control de pedidos: validación de comprobantes de pago y actualización de estados de envío.
- Centro de mensajes para atención al cliente en tiempo real.

## Estructura del Proyecto

El sistema se divide en dos partes principales:

- **Backend**: API construida con Node.js, Express y MySQL. Maneja la lógica de negocio, autenticación JWT, generación de archivos PDF y comunicaciones en tiempo real vía Sockets.
- **Frontend**: Aplicación SPA desarrollada con Angular. Implementa un diseño responsivo "Premium & Natural" enfocado en la experiencia del usuario.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- Node.js (versión 18 o superior)
- MySQL Server
- Un gestor de paquetes como npm

## Configuración Rápida

1. Clona el repositorio.
2. Configura la base de datos utilizando los archivos SQL incluidos (`DDL-3.sql` y `DML-v1-InkaFood.sql`).
3. Instala las dependencias en las carpetas `Backend` y `Frontend` mediante `npm install`.
4. Define las variables de entorno necesarias en un archivo `bd.js` (o `.env`) dentro de la carpeta `Backend/src/config`.
5. Inicia el servidor de backend con `npm run dev` y el frontend con `npm start` (o `ng serve`).

Para más detalles sobre la instalación, perfiles de prueba, funcionalidades y uso del sistema, consulta el **[Manual de Sistema](MANUAL_SISTEMA.md)** incluido en este repositorio.
