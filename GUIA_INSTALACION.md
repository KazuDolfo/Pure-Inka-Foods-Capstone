# Guía de Instalación del Proyecto

Sigue estos pasos para configurar y ejecutar la plataforma Pure Inka Foods en tu entorno local.

## 1. Requisitos del Sistema

Asegúrate de contar con las siguientes herramientas instaladas:
- Node.js (v18+) y npm.
- MySQL Server (v8.0+).
- Git.
- Angular CLI (opcional, instalado vía `npm install -g @angular/cli`).

## 2. Preparación de la Base de Datos

1. Inicia tu servidor MySQL.
2. Abre tu herramienta de gestión (ej. MySQL Workbench o terminal).
3. Ejecuta el archivo `DDL-bd_pureinka.sql` para crear la estructura de tablas.
4. (Opcional) Ejecuta `DML-Pure inka.sql` si deseas cargar datos de prueba iniciales (productos, categorías y usuarios).

## 3. Configuración del Backend

1. Abre una terminal en la carpeta `Backend`.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` basado en el siguiente ejemplo:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASS=tu_contrasena
   DB_NAME=BD_pureinka
   JWT_SECRET=tu_secreto_seguro
   BCRYPT_SALT_ROUNDS=12
   STRIPE_SECRET_KEY=tu_llave_de_stripe
   ```
4. Inicia el servidor:
   ```bash
   npm start
   ```

## 4. Configuración del Frontend

1. Abre una terminal en la carpeta `Frontend`.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Verifica la configuración en `src/environments/environment.ts` para asegurar que apunta a la URL correcta del backend.
4. Inicia la aplicación:
   ```bash
   npm start
   ```
5. Accede a `http://localhost:4200` en tu navegador.

## 5. Cuentas de Prueba

Si utilizaste el archivo DML, puedes usar estas credenciales:
- **Cliente**: berna@gmail.com / 123456
- **Administrador**: admin@pureinka.com / 123456
