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

/*
berna@gmail.com contraseña = sasasa
admin@pureinka.com contraseña = admin123
carlos.mendoza@gmail.com contraseña = carlos123
jorge.sotelo@pureinka.com contraseña = jorge123
lucia.v@gmail.com contraseña = lucia123
rpalma.ventas@gmail.com contraseña = palma123
acastro@yahoo.com contraseña = castro123
pcastillo.suporte@pureinka.com contraseña = castillo123
slujan@gmail.com contraseña = slujan123
diego.quispe@gmail.com contraseña = diego123
jbarnechea@hotmail.com contraseña = jbarne123
*/

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