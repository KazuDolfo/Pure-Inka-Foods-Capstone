USE BD_pureinka;

-- Limpiar pedidos previos para generar un historial coherente
DELETE FROM DetallePedido;
DELETE FROM Pedido;

-- Función de ayuda conceptual:
-- Cada usuario tiene 3 pedidos en meses distintos (Marzo, Abril, Mayo)
-- Los estados se distribuyen para pruebas (PAGADO, PENDIENTE)

-- USUARIO 1: Bernardo Adolfo
INSERT INTO Pedido (id_pedido, id_usuario, id_direccion, total, estado_pago, estado_envio, transaccion_id, metodo_pago, fecha) VALUES 
(1, 1, 1, 114.00, 'PAGADO', 'ENTREGADO', 'TRX-B-001', 'yape', '2026-03-10 10:30:00'),
(2, 1, 1, 70.50, 'PAGADO', 'ENVIADO', 'TRX-B-002', 'card', '2026-04-15 14:20:00'),
(3, 1, 1, 38.00, 'PENDIENTE', 'PROCESANDO', 'TRX-B-003', 'transferencia', '2026-05-20 09:00:00');

INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES 
(1, 1, 3, 38.00), (2, 4, 1, 32.50), (2, 3, 1, 22.00), (2, 8, 1, 18.00), (3, 1, 1, 38.00);

-- USUARIO 2: Administrador (también puede comprar)
INSERT INTO Pedido (id_pedido, id_usuario, id_direccion, total, estado_pago, estado_envio, transaccion_id, metodo_pago, fecha) VALUES 
(4, 2, 2, 95.00, 'PAGADO', 'ENTREGADO', 'TRX-A-001', 'card', '2026-03-12 11:00:00'),
(5, 2, 2, 116.00, 'PAGADO', 'ENVIADO', 'TRX-A-002', 'transferencia', '2026-04-20 16:45:00'),
(6, 2, 2, 45.00, 'PENDIENTE', 'PROCESANDO', 'TRX-A-003', 'plin', '2026-05-22 10:15:00');

INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES 
(4, 9, 1, 95.00), (5, 10, 2, 58.00), (6, 2, 1, 45.00);

-- USUARIO 3: Carlos Mendoza
INSERT INTO Pedido (id_pedido, id_usuario, id_direccion, total, estado_pago, estado_envio, transaccion_id, metodo_pago, fecha) VALUES 
(7, 3, 3, 120.00, 'PAGADO', 'ENTREGADO', 'TRX-C-001', 'yape', '2026-03-05 08:30:00'),
(8, 3, 3, 44.00, 'PAGADO', 'ENTREGADO', 'TRX-C-002', 'card', '2026-04-10 12:00:00'),
(9, 3, 3, 58.00, 'PENDIENTE', 'PROCESANDO', 'TRX-C-003', 'yape', '2026-05-25 15:30:00');

INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES 
(7, 2, 2, 45.00), (7, 4, 1, 32.50), (8, 3, 2, 22.00), (9, 10, 1, 58.00);

-- USUARIO 4: Jorge Luis Sotelo
INSERT INTO Pedido (id_pedido, id_usuario, id_direccion, total, estado_pago, estado_envio, transaccion_id, metodo_pago, fecha) VALUES 
(10, 4, 4, 190.00, 'PAGADO', 'ENTREGADO', 'TRX-J-001', 'transferencia', '2026-03-18 10:00:00'),
(11, 4, 4, 38.00, 'PAGADO', 'ENVIADO', 'TRX-J-002', 'plin', '2026-04-22 14:00:00'),
(12, 4, 4, 25.90, 'PENDIENTE', 'PROCESANDO', 'TRX-J-003', 'yape', '2026-05-26 11:00:00');

INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES 
(10, 9, 2, 95.00), (11, 1, 1, 38.00), (12, 5, 1, 25.90);

-- USUARIO 5: Lucía Villarán
INSERT INTO Pedido (id_pedido, id_usuario, id_direccion, total, estado_pago, estado_envio, transaccion_id, metodo_pago, fecha) VALUES 
(13, 5, 5, 59.80, 'PAGADO', 'ENTREGADO', 'TRX-L-001', 'card', '2026-03-25 15:00:00'),
(14, 5, 5, 48.00, 'PAGADO', 'ENTREGADO', 'TRX-L-002', 'yape', '2026-04-28 09:00:00'),
(15, 5, 5, 76.00, 'PAGADO', 'PROCESANDO', 'TRX-L-003', 'transferencia', '2026-05-20 17:00:00');

INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES 
(13, 6, 2, 29.90), (14, 12, 1, 48.00), (15, 1, 2, 38.00);

-- USUARIO 6: Ricardo Palma
INSERT INTO Pedido (id_pedido, id_usuario, id_direccion, total, estado_pago, estado_envio, transaccion_id, metodo_pago, fecha) VALUES 
(16, 6, 6, 114.00, 'PAGADO', 'ENTREGADO', 'TRX-R-001', 'yape', '2026-03-10 11:30:00'),
(17, 6, 6, 32.50, 'PAGADO', 'ENVIADO', 'TRX-R-002', 'card', '2026-04-12 16:00:00'),
(18, 6, 6, 95.00, 'PENDIENTE', 'PROCESANDO', 'TRX-R-003', 'transferencia', '2026-05-24 13:00:00');

INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES 
(16, 1, 3, 38.00), (17, 4, 1, 32.50), (18, 9, 1, 95.00);

-- USUARIO 7: Andrea Castro
INSERT INTO Pedido (id_pedido, id_usuario, id_direccion, total, estado_pago, estado_envio, transaccion_id, metodo_pago, fecha) VALUES 
(19, 7, 7, 39.00, 'PAGADO', 'ENTREGADO', 'TRX-AN-001', 'card', '2026-03-05 10:00:00'),
(20, 7, 7, 116.00, 'PAGADO', 'ENTREGADO', 'TRX-AN-002', 'transferencia', '2026-04-15 14:00:00'),
(21, 7, 7, 45.00, 'PENDIENTE', 'PROCESANDO', 'TRX-AN-003', 'plin', '2026-05-18 09:00:00');

INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES 
(19, 7, 2, 19.50), (20, 10, 2, 58.00), (21, 2, 1, 45.00);

-- USUARIO 8: Pedro Castillo
INSERT INTO Pedido (id_pedido, id_usuario, id_direccion, total, estado_pago, estado_envio, transaccion_id, metodo_pago, fecha) VALUES 
(22, 8, 8, 54.00, 'PAGADO', 'ENTREGADO', 'TRX-P-001', 'yape', '2026-03-20 12:00:00'),
(23, 8, 8, 25.90, 'PAGADO', 'ENVIADO', 'TRX-P-002', 'card', '2026-04-25 15:00:00'),
(24, 8, 8, 38.00, 'PENDIENTE', 'PROCESANDO', 'TRX-P-003', 'transferencia', '2026-05-21 11:00:00');

INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES 
(22, 3, 1, 22.00), (22, 4, 1, 32.50), (23, 5, 1, 25.90), (24, 1, 1, 38.00);

-- USUARIO 9: Sofía Luján
INSERT INTO Pedido (id_pedido, id_usuario, id_direccion, total, estado_pago, estado_envio, transaccion_id, metodo_pago, fecha) VALUES 
(25, 9, 9, 190.00, 'PAGADO', 'ENTREGADO', 'TRX-S-001', 'card', '2026-03-15 09:00:00'),
(26, 9, 9, 114.00, 'PAGADO', 'ENTREGADO', 'TRX-S-002', 'yape', '2026-04-20 13:00:00'),
(27, 9, 9, 48.00, 'PAGADO', 'PROCESANDO', 'TRX-S-003', 'plin', '2026-05-22 16:00:00');

INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES 
(25, 9, 2, 95.00), (26, 1, 3, 38.00), (27, 12, 1, 48.00);

-- USUARIO 10: Diego Armando
INSERT INTO Pedido (id_pedido, id_usuario, id_direccion, total, estado_pago, estado_envio, transaccion_id, metodo_pago, fecha) VALUES 
(28, 10, 10, 36.00, 'PAGADO', 'ENTREGADO', 'TRX-D-001', 'yape', '2026-03-02 11:00:00'),
(29, 10, 10, 58.00, 'PAGADO', 'ENVIADO', 'TRX-D-002', 'card', '2026-04-05 10:00:00'),
(30, 10, 10, 116.00, 'PENDIENTE', 'PROCESANDO', 'TRX-D-003', 'transferencia', '2026-05-27 14:00:00');

INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES 
(28, 8, 2, 18.00), (29, 10, 1, 58.00), (30, 10, 2, 58.00);

-- USUARIO 11: Jimena Barnechea
INSERT INTO Pedido (id_pedido, id_usuario, id_direccion, total, estado_pago, estado_envio, transaccion_id, metodo_pago, fecha) VALUES 
(31, 11, 11, 24.50, 'PAGADO', 'ENTREGADO', 'TRX-JI-001', 'plin', '2026-03-12 15:30:00'),
(32, 11, 11, 70.50, 'PAGADO', 'ENTREGADO', 'TRX-JI-002', 'card', '2026-04-18 12:00:00'),
(33, 11, 11, 95.00, 'PENDIENTE', 'PROCESANDO', 'TRX-JI-003', 'transferencia', '2026-05-26 10:00:00');

INSERT INTO DetallePedido (id_pedido, id_producto, cantidad, precio_fijo) VALUES 
(31, 11, 1, 24.50), (32, 3, 1, 22.00), (32, 12, 1, 48.00), (33, 9, 1, 95.00);
