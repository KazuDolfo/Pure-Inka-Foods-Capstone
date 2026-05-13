CREATE DATABASE IF NOT EXISTS BD_pureinka;
USE BD_pureinka;


CREATE TABLE Pais (
    id_pais INT AUTO_INCREMENT PRIMARY KEY,
    codigo_iso CHAR(2) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL
);


CREATE TABLE Categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);


CREATE TABLE Usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('ADMIN', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE',
    telefono VARCHAR(20),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Direccion (
    id_direccion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_pais INT NOT NULL,
    nombre_direccion VARCHAR(50), 
    estado_region VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(20),
    direccion_exacta VARCHAR(255) NOT NULL,
    referencia VARCHAR(255),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_pais) REFERENCES Pais(id_pais)
);


CREATE TABLE Producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL, -- Relación con la nueva tabla
    sku VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    imagen_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
);


CREATE TABLE MovimientoStock (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    tipo ENUM('ENTRADA', 'SALIDA') NOT NULL,
    motivo VARCHAR(100),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto) ON DELETE CASCADE
);


CREATE TABLE Pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_direccion INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    estado_pago ENUM('PENDIENTE', 'PAGADO', 'RECHAZADO') DEFAULT 'PENDIENTE',
    estado_envio ENUM('PROCESANDO', 'ENVIADO', 'ENTREGADO', 'ADUANAS') DEFAULT 'PROCESANDO',
    transaccion_id VARCHAR(100) UNIQUE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_direccion) REFERENCES Direccion(id_direccion)
);

CREATE TABLE DetallePedido (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_fijo DECIMAL(10,2) NOT NULL, 
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

CREATE TABLE Carrito (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL UNIQUE,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE CarritoItem (
    id_carrito_item INT AUTO_INCREMENT PRIMARY KEY,
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_carrito) REFERENCES Carrito(id_carrito) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto) ON DELETE CASCADE,
    UNIQUE KEY uq_carrito_producto (id_carrito, id_producto) 
);


CREATE TABLE Conversacion (
    id_conversacion INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_admin INT,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_admin) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE Mensaje (
    id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
    id_conversacion INT NOT NULL,
    id_emisor INT NOT NULL,
    contenido TEXT,
    tipo_mensaje ENUM('TEXTO', 'IMAGEN') DEFAULT 'TEXTO',
    url_adjunto VARCHAR(255),
    fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    leido BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_conversacion) REFERENCES Conversacion(id_conversacion) ON DELETE CASCADE,
    FOREIGN KEY (id_emisor) REFERENCES Usuario(id_usuario)
);
