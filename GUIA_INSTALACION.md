Guía de Ejecución: PUREINKA E-Commerce

Este documento explica cómo poner en marcha el proyecto PUREINKA en su computadora de forma sencilla.

Requisitos Previos

Para que el sistema funcione, debe tener instalado Node.js (versión 18 o superior) y MySQL.

Paso 1: Base de Datos

Primero, debe preparar la base de datos en su servidor MySQL. Utilice los archivos proporcionados en la raíz del proyecto en el siguiente orden:
1. Ejecute DDL-bd_pureinka.sql para crear la estructura.
2. Ejecute DML-Pure inka.sql para cargar los datos iniciales.

Paso 2: Servidor (Backend)

Diríjase a la carpeta Backend desde su terminal. Una vez allí, instale los componentes necesarios con el comando:
npm install

Luego, asegúrese de que el archivo .env tenga sus credenciales de MySQL correctas. Para iniciar el servidor, use:
npm run dev

El servidor se activará en el puerto 5000.

Paso 3: Interfaz (Frontend)

Abra una nueva terminal y entre en la carpeta Frontend. Instale los componentes requeridos:
npm install

Finalmente, inicie la aplicación con el comando:
npm start

Podrá ver la tienda funcionando en su navegador entrando a http://localhost:4200.

Accesos de Prueba

Para probar el sistema, puede usar las siguientes cuentas:

Administrador: admin@pureinka.com / contraseña: admin123
Cliente: berna@gmail.com / contraseña: sasasa
