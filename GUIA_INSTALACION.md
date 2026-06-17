GUIA DE INSTALACION DEL PROYECTO

Sigue estos pasos para configurar y ejecutar la plataforma Pure Inka Foods en tu entorno local.

1. REQUISITOS DEL SISTEMA

Asegúrate de contar con las siguientes herramientas instaladas:
- Node.js (v18+) y npm.
- MySQL Server (v8.0+).
- Git.
- Angular CLI.

2. PREPARACION DE LA BASE DE DATOS

1. Inicia tu servidor MySQL.
2. Abre tu herramienta de gestión (ej. MySQL Workbench o terminal).
3. Ejecuta el archivo DDL-bd_pureinka.sql para crear la estructura de tablas.
4. Ejecuta DML-Pure inka.sql para cargar datos de prueba iniciales.

3. CONFIGURACION DEL BACKEND

1. Abre una terminal en la carpeta Backend.
2. Instala las dependencias (se han configurado overrides para evitar conflictos):
   npm install
   Nota: Si encuentras errores de dependencias de pares, usa npm install --legacy-peer-deps.
3. Crea un archivo .env basado en el siguiente ejemplo:
   PORT=5000
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASS=tu_contrasena
   DB_NAME=BD_pureinka
   JWT_SECRET=tu_secreto_seguro
   BCRYPT_SALT_ROUNDS=12
   STRIPE_SECRET_KEY=tu_llave_de_stripe
4. Inicia el servidor:
   npm start

4. CONFIGURACION DEL FRONTEND

1. Abre una terminal en la carpeta Frontend.
2. Instala las dependencias:
   npm install
3. Verifica la configuración en src/environments/environment.ts para asegurar que apunta a la URL correcta del backend.
4. Inicia la aplicación:
   npm start
5. Accede a http://localhost:4200 en tu navegador.

5. CUENTAS DE PRUEBA (ACCESO RAPIDO)

Utiliza estas credenciales para probar las funcionalidades de inmediato:

ADMINISTRADOR:
- Correo: admin@pureinka.com
- Contraseña: admin123

CLIENTE / USUARIO:
- Correo: cliente@pureinka.com
- Contraseña: cliente123

Nota: Asegúrate de que estos usuarios existan en tu base de datos o regístralos manualmente desde la interfaz.
