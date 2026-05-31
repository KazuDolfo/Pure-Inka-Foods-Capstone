USE BD_pureinka;
Select * from Usuario;

INSERT INTO Pais (codigo_iso, nombre) VALUES
('PE', 'Perú'), ('US', 'Estados Unidos'), ('ES', 'España'), ('MX', 'México'),
('CO', 'Colombia'), ('AR', 'Argentina'), ('CL', 'Chile'), ('BR', 'Brasil'),
('EC', 'Ecuador'), ('BO', 'Bolivia'), ('PA', 'Panamá'), ('CA', 'Canadá'),
('CN', 'China'), ('JP', 'Japón'), ('DE', 'Alemania'), ('FR', 'Francia'),
('IT', 'Italia'), ('GB', 'Reino Unido'), ('KR', 'Corea del Sur'), ('UY', 'Uruguay');

INSERT INTO Categoria (nombre, descripcion) VALUES 
('Superalimentos en Polvo', 'Productos deshidratados y pulverizados de alto valor nutricional.'),
('Granos y Semillas', 'Semillas integrales y granos andinos orgánicos.'),
('Aceites Naturales', 'Aceites extraídos en frío de superalimentos.'),
('Cápsulas y Suplementos', 'Concentrados de superalimentos en formato de cápsulas.'),
('Infusiones y Tés', 'Selección de hierbas y hojas deshidratadas.'),
('Endulzantes Naturales', 'Alternativas saludables al azúcar refinada.'),
('Snacks Saludables', 'Alimentos listos para consumir a base de superfoods.'),
('Cuidado Personal', 'Productos de cosmética natural elaborados con insumos peruanos.');

INSERT INTO Usuario (nombre, email, contrasena, rol, telefono, fecha_registro) VALUES 
('Bernardo Adolfo', 'berna@gmail.com', '$2b$12$aG2Q32bKrysmubvJc9LKqOftMa3oYnY.q.D53TNOZ00.1Oowxa/Y6', 'CLIENTE', NULL, '2026-04-16 17:58:34'),
('Administrador', 'admin@pureinka.com', '$2b$12$bPkYWAzKZ6C3bzEPpIxZA.MhZJFRR/ovccrMiBFtCNXxBvdlP9rJq', 'ADMIN', NULL, '2026-04-16 18:01:42'),
('Carlos Mendoza', 'carlos.mendoza@gmail.com', '$2b$12$TJJRnk.7ucvP5nv73W4zeu1rNVgPUpsSONcW9NFLe0rceMymyEgui', 'CLIENTE', '955443322', NOW()),
('Jorge Luis Sotelo', 'jorge.sotelo@pureinka.com', '$2b$12$W5Kqof.7.JFtkxw4HDcJBeX/8XjF0m651V1Idmephrt6a9i0N0CPm', 'ADMIN', '944887766', NOW()),
('Lucía Villarán', 'lucia.v@gmail.com', '$2b$12$Shh6aB2Au3HIcgmDEjj3L.UTp4Ed8paeY5LiaTPzT.R15OawGYK2S', 'CLIENTE', '922112233', NOW()),
('Ricardo Palma', 'rpalma.ventas@gmail.com', '$2b$12$wrcJHlVIqIvoprMJVYPVYORBhTQYpRWDaBL2XIRd9AXifVMFc0RJK', 'CLIENTE', '966778899', NOW()),
('Andrea Castro', 'acastro@yahoo.com', '$2b$12$X/D/8l7WPWlTyENUVjcBZ.svhY99kqFyHUGyxY2WHbfArD.FuhNwW', 'CLIENTE', '999000111', NOW()),
('Pedro Castillo Romero', 'pcastillo.suporte@pureinka.com', '$2b$12$Tw81tfeZGljpMPjLV51gQelaOK.Y5H9yJIWq/yNV246fUi.IkXOmS', 'ADMIN', '933445566', NOW()),
('Sofía Luján', 'slujan@gmail.com', '$2b$12$cAyoN5VKww1g6Ayy6FV85u4s3/NPVjYDH5s8d/9vgZdyXxclXC7Uu', 'CLIENTE', '911556677', NOW()),
('Diego Armando Quispe', 'diego.quispe@gmail.com', '$2b$12$/9E1mhuDkFMr.ui/qHd7ruRSSAce1Lhj.NP2jbaH0afVqqOOK.OAu', 'CLIENTE', '977889900', NOW()),
('Jimena Barnechea', 'jbarnechea@hotmail.com', '$2b$12$JUATmZEpUhFNzWpvrNOIeuk5OUPka2ycswzPhZ83qB8rqngq5vJ7q', 'CLIENTE', '944332211', NOW());

INSERT INTO Direccion (id_usuario, id_pais, nombre_direccion, estado_region, ciudad, codigo_postal, direccion_exacta, referencia) VALUES 
(1, 1, 'Casa', 'Lima', 'San Borja', '15037', 'Av. Las Artes Norte 123', 'Cerca al Parque de la Felicidad'),
(2, 1, 'Oficina Principal', 'Lima', 'Miraflores', '15047', 'Calle Shell 456', 'Piso 5, Oficina 501'),
(3, 1, 'Hogar', 'Lima', 'Santiago de Surco', '15033', 'Jr. Batalla de Junín 789', 'Frente al Centro Comercial Jockey Plaza'),
(4, 1, 'Trabajo', 'Lima', 'San Isidro', '15027', 'Av. Javier Prado Este 2550', 'Torre Orquídeas'),
(5, 1, 'Casa Mamá', 'Arequipa', 'Arequipa', '04001', 'Calle Mercaderes 210', 'A media cuadra de la Plaza de Armas'),
(6, 1, 'Departamento', 'Lima', 'Barranco', '15063', 'Av. Grau 882', 'Edificio con vista al mar'),
(7, 2, 'Warehouse US', 'Florida', 'Miami', '33101', '123 NW 23rd St', 'Wynwood Art District'),
(8, 1, 'Sede Norte', 'La Libertad', 'Trujillo', '13001', 'Jr. Pizarro 550', 'Cerca a la Plazuela El Recreo'),
(9, 1, 'Casa Playa', 'Lima', 'Asia', '15601', 'Condominio Las Palmas Lote 15', 'Km 97 Panamericana Sur'),
(10, 3, 'Residencia ES', 'Madrid', 'Madrid', '28001', 'Calle de Serrano 45', 'Barrio de Salamanca'),
(11, 1, 'Hogar Cusco', 'Cusco', 'Cusco', '08002', 'Calle Hatun Rumiyoc 480', 'Cerca a la piedra de los 12 ángulos');

INSERT INTO Producto (id_categoria, sku, nombre, descripcion, precio, stock_actual, imagen_url, activo) VALUES
(1, 'MOR-001', 'Moringa Powder', '100% Pure Andes Superfood. Alto contenido de antioxidantes.', 38.00, 50, 'image-1776783148277.png', TRUE),
(1, 'CAM-002', 'Camu Camu Powder', 'Súper alimento amazónico con la mayor concentración de Vitamina C.', 45.00, 40, 'image-1776783206507.png', TRUE),
(1, 'GIN-003', 'Ginger Powder', 'Jengibre premium deshidratado, ideal para el sistema inmunológico.', 22.00, 60, 'image-1776783259142.png', TRUE),
(1, 'MAC-004', 'Maca Powder', 'Energizante natural andino para vitalidad y equilibrio.', 32.50, 100, 'image-1776783312455.png', TRUE),
(1, 'PUR-005', 'Purple Corn Powder', 'Maíz morado orgánico rico en antocianinas.', 25.90, 85, 'image-1776783389112.png', TRUE),
(2, 'CAC-006', 'Cacao Nibs', 'Nibs de cacao puro sin azúcar. Energía natural.', 29.90, 55, 'image-1776783445671.png', TRUE),
(2, 'CHI-007', 'Chia Seeds', 'Semillas de chía ricas en Omega-3 y fibra.', 19.50, 75, 'image-1776783510223.png', TRUE),
(2, 'QUI-008', 'Quinoa Grain', 'Quinua real en grano, fuente completa de proteínas.', 18.00, 120, 'image-1776783567890.png', TRUE),
(3, 'CAY-009', 'Cacay Oil', 'Aceite de Cacay 100% puro para el cuidado de la piel.', 95.00, 20, 'image-1776783621456.png', TRUE),
(3, 'SAC-010', 'Sacha Inchi Oil', 'Aceite de Sacha Inchi extra virgen, el Omega vegetal más potente.', 58.00, 30, 'image-1776783689123.png', TRUE),
(6, 'STE-011', 'Stevia Powder', 'Extracto de estevia pura en polvo sin calorías.', 24.50, 60, 'image-1776783745122.png', TRUE),
(6, 'YAC-012', 'Yacon Syrup', 'Jarabe de Yacón orgánico. Endulzante prebiótico natural.', 48.00, 35, 'image-1776783812455.png', TRUE);

-- DATA DE PRUEBA: PEDIDOS POR USUARIO (33 REGISTROS)
INSERT INTO Pedido (id_pedido, id_usuario, id_direccion, total, estado_pago, estado_envio, transaccion_id, metodo_pago, fecha) VALUES 
(1, 1, 1, 114.00, 'PAGADO', 'ENTREGADO', 'TRX-B-001', 'yape', '2026-03-10 10:30:00'),
(2, 1, 1, 70.50, 'PAGADO', 'ENVIADO', 'TRX-B-002', 'card', '2026-04-15 14:20:00'),
(3, 1, 1, 38.00, 'PENDIENTE', 'PROCESANDO', 'TRX-B-003', 'transferencia', '2026-05-20 09:00:00'),
(4, 2, 2, 95.00, 'PAGADO', 'ENTREGADO', 'TRX-A-001', 'card', '2026-03-12 11:00:00'),
(5, 2, 2, 116.00, 'PAGADO', 'ENVIADO', 'TRX-A-002', 'transferencia', '2026-04-20 16:45:00'),
(6, 2, 2, 45.00, 'PENDIENTE', 'PROCESANDO', 'TRX-A-003', 'plin', '2026-05-22 10:15:00'),
(7, 3, 3, 120.00, 'PAGADO', 'ENTREGADO', 'TRX-C-001', 'yape', '2026-03-05 08:30:00'),
(8, 3, 3, 44.00, 'PAGADO', 'ENTREGADO', 'TRX-C-002', 'card', '2026-04-10 12:00:00'),
(9, 3, 3, 58.00, 'PENDIENTE', 'PROCESANDO', 'TRX-C-003', 'yape', '2026-05-25 15:30:00'),
(10, 4, 4, 190.00, 'PAGADO', 'ENTREGADO', 'TRX-J-001', 'transferencia', '2026-03-18 10:00:00'),
(11, 4, 4, 38.00, 'PAGADO', 'ENVIADO', 'TRX-J-002', 'plin', '2026-04-22 14:00:00'),
(12, 4, 4, 25.90, 'PENDIENTE', 'PROCESANDO', 'TRX-J-003', 'yape', '2026-05-26 11:00:00'),
(13, 5, 5, 59.80, 'PAGADO', 'ENTREGADO', 'TRX-L-001', 'card', '2026-03-25 15:00:00'),
(14, 5, 5, 48.00, 'PAGADO', 'ENTREGADO', 'TRX-L-002', 'yape', '2026-04-28 09:00:00'),
(15, 5, 5, 76.00, 'PAGADO', 'PROCESANDO', 'TRX-L-003', 'transferencia', '2026-05-20 17:00:00'),
(16, 6, 6, 114.00, 'PAGADO', 'ENTREGADO', 'TRX-R-001', 'yape', '2026-03-10 11:30:00'),
(17, 6, 6, 32.50, 'PAGADO', 'ENVIADO', 'TRX-R-002', 'card', '2026-04-12 16:00:00'),
(18, 6, 6, 95.00, 'PENDIENTE', 'PROCESANDO', 'TRX-R-003', 'transferencia', '2026-05-24 13:00:00'),
(19, 7, 7, 39.00, 'PAGADO', 'ENTREGADO', 'TRX-AN-001', 'card', '2026-03-05 10:00:00'),
(20, 7, 7, 116.00, 'PAGADO', 'ENTREGADO', 'TRX-AN-002', 'transferencia', '2026-04-15 14:00:00'),
(21, 7, 7, 45.00, 'PENDIENTE', 'PROCESANDO', 'TRX-AN-003', 'plin', '2026-05-18 09:00:00'),
(22, 8, 8, 54.00, 'PAGADO', 'ENTREGADO', 'TRX-P-001', 'yape', '2026-03-20 12:00:00'),
(23, 8, 8, 25.90, 'PAGADO', 'ENVIADO', 'TRX-P-002', 'card', '2026-04-25 15:00:00'),
(24, 8, 8, 38.00, 'PENDIENTE', 'PROCESANDO', 'TRX-P-003', 'transferencia', '2026-05-21 11:00:00'),
(25, 9, 9, 190.00, 'PAGADO', 'ENTREGADO', 'TRX-S-001', 'card', '2026-03-15 09:00:00'),
(26, 9, 9, 114.00, 'PAGADO', 'ENTREGADO', 'TRX-S-002', 'yape', '2026-04-20 13:00:00'),
(27, 9, 9, 48.00, 'PAGADO', 'PROCESANDO', 'TRX-S-003', 'plin', '2026-05-22 16:00:00'),
(28, 10, 10, 36.00, 'PAGADO', 'ENTREGADO', 'TRX-D-001', 'yape', '2026-03-02 11:00:00'),
(29, 10, 10, 58.00, 'PAGADO', 'ENVIADO', 'TRX-D-002', 'card', '2026-04-05 10:00:00'),
(30, 10, 10, 116.00, 'PENDIENTE', 'PROCESANDO', 'TRX-D-003', 'transferencia', '2026-05-27 14:00:00'),
(31, 11, 11, 24.50, 'PAGADO', 'ENTREGADO', 'TRX-JI-001', 'plin', '2026-03-12 15:30:00'),
(32, 11, 11, 70.50, 'PAGADO', 'ENTREGADO', 'TRX-JI-002', 'card', '2026-04-18 12:00:00'),
(33, 11, 11, 95.00, 'PENDIENTE', 'PROCESANDO', 'TRX-JI-003', 'transferencia', '2026-05-26 10:00:00');

INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES 
(1, 1, 3, 38.00), (2, 4, 1, 32.50), (2, 3, 1, 22.00), (2, 8, 1, 18.00), (3, 1, 1, 38.00),
(4, 9, 1, 95.00), (5, 10, 2, 58.00), (6, 2, 1, 45.00), (7, 2, 2, 45.00), (7, 4, 1, 32.50),
(8, 3, 2, 22.00), (9, 10, 1, 58.00), (10, 9, 2, 95.00), (11, 1, 1, 38.00), (12, 5, 1, 25.90),
(13, 6, 2, 29.90), (14, 12, 1, 48.00), (15, 1, 2, 38.00), (16, 1, 3, 38.00), (17, 4, 1, 32.50),
(18, 9, 1, 95.00), (19, 7, 2, 19.50), (20, 10, 2, 58.00), (21, 2, 1, 45.00), (22, 3, 1, 22.00),
(22, 4, 1, 32.50), (23, 5, 1, 25.90), (24, 1, 1, 38.00), (25, 9, 2, 95.00), (26, 1, 3, 38.00),
(27, 12, 1, 48.00), (28, 8, 2, 18.00), (29, 10, 1, 58.00), (30, 10, 2, 58.00), (31, 11, 1, 24.50),
(32, 3, 1, 22.00), (32, 12, 1, 48.00), (33, 9, 1, 95.00);