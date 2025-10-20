-- Script para crear tablas históricas en Neon
-- Datos anteriores a Octubre 2025 para analytics

-- Tabla de ventas históricas
CREATE TABLE IF NOT EXISTS historical_sales (
  id SERIAL PRIMARY KEY,
  codCom INTEGER NOT NULL,
  codArt INTEGER,
  codCli INTEGER NOT NULL,
  nombreCli VARCHAR(30) NOT NULL,
  apellidosCli VARCHAR(30) NOT NULL,
  nombreArt VARCHAR(50) NOT NULL,
  precio DOUBLE PRECISION NOT NULL,
  cantidad INTEGER NOT NULL,
  subtotal DOUBLE PRECISION NOT NULL,
  total DOUBLE PRECISION NOT NULL,
  fechaCom DATE NOT NULL,
  vista INTEGER DEFAULT 1,
  cod_user INTEGER,
  period_label VARCHAR(100) DEFAULT 'Anteriores a Octubre 2025' NOT NULL
);

-- Tabla de pagos históricos
CREATE TABLE IF NOT EXISTS historical_payments (
  id SERIAL PRIMARY KEY,
  cod_cliente_p INTEGER,
  nombre_c_p VARCHAR(40),
  apellidos_c_p VARCHAR(40),
  fecha_pago DATE,
  tipo_de_pago VARCHAR(15),
  cantidad_pago DECIMAL(6,2),
  cod_pago INTEGER NOT NULL,
  vista INTEGER DEFAULT 1,
  cod_user INTEGER,
  period_label VARCHAR(100) DEFAULT 'Anteriores a Octubre 2025' NOT NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_historical_sales_fecha ON historical_sales(fechaCom);
CREATE INDEX IF NOT EXISTS idx_historical_sales_cliente ON historical_sales(codCli);
CREATE INDEX IF NOT EXISTS idx_historical_sales_user ON historical_sales(cod_user);

CREATE INDEX IF NOT EXISTS idx_historical_payments_fecha ON historical_payments(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_historical_payments_cliente ON historical_payments(cod_cliente_p);
CREATE INDEX IF NOT EXISTS idx_historical_payments_user ON historical_payments(cod_user);

-- Insertar datos de ventas históricas
INSERT INTO historical_sales (codCom, codArt, codCli, nombreCli, apellidosCli, nombreArt, precio, cantidad, subtotal, total, fechaCom, vista, cod_user) VALUES
(1, 1, 12115, 'FRANCISCA', 'MORENO', 'VARIOS', -12.5, 1, -12.5, -12.5, '2021-01-23', 3, 1),
(2, 1, 2006, 'MABEL', 'PACHECO', 'VARIOS', 97.15, 1, 97.15, 97.15, '2021-01-23', 3, 1),
(3, 1, 4, 'MARISA', '', 'VARIOS', 75.45, 1, 75.45, 75.45, '2021-01-23', 3, 1),
(4, 1, 12020, 'Marta', '', 'VARIOS', 212.4, 1, 212.4, 212.4, '2021-01-23', 3, 1),
(5, 1, 12023, 'ANGELA HIJO', '', 'ESTORES', 225.32, 1, 225.32, 225.32, '2021-01-23', 3, 1),
(6, 1, 12025, 'Angela', '', 'VARIOS', -61.5, 1, -61.5, -61.5, '2021-02-17', 3, 1),
(7, 1, 1011, 'Rosa', '', 'CORTINAS HABITACION', 283.85, 1, 283.85, 283.85, '2021-03-22', 3, 1),
(8, 1, 12120, 'Maite', 'Melian Gonzalez', 'VARIOS', 159.4, 1, 159.4, 159.4, '2021-03-22', 3, 1),
(9, 1, 1, 'CONTADO', '', 'cortinas tina', 820, 1, 820, 820, '2021-03-29', 3, 1),
(10, 1, 4624, 'CARMITA PLACIOS', '', 'VARIOS', 21, 1, 21, 21, '2021-04-11', 3, 1),
(11, 1, 12051, 'Amalia', 'Zamora Gamez', 'VARIOS', 138.9, 1, 138.9, 138.9, '2021-04-11', 3, 1),
(12, 1, 12110, 'ROSI', '', 'VARIOS', 40.65, 1, 40.65, 40.65, '2021-04-11', 3, 1),
(13, 1, 12220, 'ANDREA', '', 'VARIOS', 21.2, 1, 21.2, 21.2, '2021-04-11', 3, 1),
(14, 1, 12155, 'LOLI', '(COSTURERA)', 'VARIOS', 14.85, 1, 14.85, 14.85, '2021-04-11', 3, 1),
(15, 1, 12165, 'ROSI', '', 'VARIOS', -61.45, 1, -61.45, -61.45, '2021-04-11', 3, 1),
(16, 1, 12165, 'ROSI', '', 'VARIOS', 69, 1, 69, 69, '2021-04-11', 3, 1),
(17, 1, 12110, 'ROSI', '', 'VARIOS', 90.1, 1, 90.1, 90.1, '2021-04-11', 3, 1),
(18, 1, 12135, 'MUJER', 'DE ROQUE', 'VARIOS', 9.5, 1, 9.5, 9.5, '2021-04-11', 3, 1),
(19, 1, 12080, 'JULIA', 'MELIAN TIA', 'VARIOS', 169.3, 1, 169.3, 169.3, '2021-04-11', 3, 1),
(20, 1, 13025, 'YAYI', '', 'COLCHON', 672.5, 1, 672.5, 672.5, '2021-04-19', 3, 1),
(21, 1, 12025, 'Angela', '', 'VARIOS', 186.02, 1, 186.02, 186.02, '2021-04-19', 3, 1),
(22, 1, 12025, 'Angela', '', 'VARIOS', 48.95, 1, 48.95, 234.97, '2021-04-19', 3, 1),
(23, 1, 12115, 'FRANCISCA', 'MORENO', 'VARIOS', 94.35, 1, 94.35, 94.35, '2021-04-19', 3, 1),
(24, 1, 12025, 'Angela', '', 'VARIOS', -68.8, 1, -68.8, -68.8, '2021-04-29', 3, 1),
(25, 1, 5532, 'SARI', 'ARMAS', 'RELLENO', 6.5, 1, 6.5, 6.5, '2021-05-24', 3, 1),
(26, 1, 12160, 'MERCEDES', 'MARTIN', 'VARIOS', 170.15, 1, 170.15, 170.15, '2021-05-24', 3, 1),
(27, 1, 12005, 'Maria Rosa ', 'Ferrera', 'VARIOS', 415.6, 1, 415.6, 415.6, '2021-05-27', 3, 1),
(28, 1, 12023, 'ANGELA HIJO', '', 'VARIOS', 206.4, 1, 206.4, 206.4, '2021-05-27', 3, 1),
(29, 1, 4624, 'CARMITA PLACIOS', '', 'VARIOS', 75, 1, 75, 75, '2021-06-21', 3, 1);

-- Insertar datos de pagos históricos
INSERT INTO historical_payments (cod_cliente_p, nombre_c_p, apellidos_c_p, fecha_pago, tipo_de_pago, cantidad_pago, cod_pago, vista, cod_user) VALUES
(15151, 'prueba', 'otra prueba', '2021-01-16', 'EFECTIVO', 20.00, 1, 3, 1),
(2006, 'MABEL', 'PACHECO', '2021-01-23', 'EFECTIVO', 50.00, 2, 3, 1),
(4, 'MARISA', '', '2021-01-23', 'EFECTIVO', 75.45, 3, 3, 1),
(12050, 'Maria Pepa', 'Gamez Montesinos', '2021-01-27', 'EFECTIVO', 20.00, 4, 3, 1),
(12051, 'Amalia', 'Zamora Gamez', '2021-01-27', 'EFECTIVO', 20.00, 5, 3, 1),
(12130, 'PURA ', 'TRUJILLO', '2021-01-27', 'EFECTIVO', 20.00, 6, 3, 1),
(4624, 'CARMITA PLACIOS', '', '2021-02-06', 'EFECTIVO', 20.00, 7, 3, 1),
(12100, 'KELLY', 'DE ARMAS', '2021-02-06', 'EFECTIVO', 50.00, 8, 3, 1),
(12010, 'Ana', 'Perez', '2021-02-06', 'EFECTIVO', 20.00, 9, 3, 1),
(12135, 'MUJER', 'DE ROQUE', '2021-02-06', 'EFECTIVO', 30.00, 10, 3, 1),
(12080, 'JULIA', 'MELIAN TIA', '2021-02-06', 'EFECTIVO', 50.00, 11, 3, 1),
(12155, 'LOLI', '(COSTURERA)', '2021-02-06', 'EFECTIVO', 90.00, 12, 3, 1),
(12015, 'Candelaria', 'Coello', '2021-02-06', 'EFECTIVO', 30.00, 13, 3, 1),
(1012, 'ERNESTINA', '', '2021-02-06', 'EFECTIVO', 20.00, 14, 3, 1),
(1013, 'ELISABETH CORREA', '', '2021-02-06', 'EFECTIVO', 40.00, 15, 3, 1),
(1014, 'JUANJO CORREA', '', '2021-02-06', 'EFECTIVO', 50.00, 16, 3, 1),
(12220, 'ANDREA', '', '2021-02-06', 'EFECTIVO', 20.00, 17, 3, 1),
(12165, 'ROSI', '', '2021-02-06', 'EFECTIVO', 20.00, 18, 3, 1),
(12250, 'VALENTINA', '', '2021-02-06', 'EFECTIVO', 20.00, 19, 3, 1),
(12230, 'CATALINA', '', '2021-02-06', 'EFECTIVO', 20.00, 20, 3, 1),
(12120, 'Maite', 'Melian Gonzalez', '2021-02-06', 'EFECTIVO', 20.00, 21, 3, 1),
(12120, 'Maite', 'Melian Gonzalez', '2021-02-06', 'EFECTIVO', 7.00, 22, 3, 1),
(12180, 'Celo', '', '2021-02-06', 'EFECTIVO', 100.00, 23, 3, 1),
(12105, 'ISABEL ', '(TORINO)', '2021-02-17', 'EFECTIVO', 20.00, 24, 3, 1),
(12035, 'Mabi', 'Mejias', '2021-02-17', 'EFECTIVO', 30.00, 25, 3, 1),
(12110, 'ROSI', '', '2021-02-17', 'EFECTIVO', 20.00, 26, 3, 1),
(12095, 'ROSARIO MARGARITA', '', '2021-02-17', 'EFECTIVO', 20.00, 27, 3, 1),
(12030, 'Teresa', 'Medina', '2021-02-17', 'EFECTIVO', 30.00, 28, 3, 1),
(12020, 'Marta', '', '2021-02-17', 'EFECTIVO', 20.00, 29, 3, 1),
(12025, 'Angela', '', '2021-02-17', 'EFECTIVO', 50.00, 30, 3, 1),
(12023, 'ANGELA HIJO', '', '2021-02-17', 'EFECTIVO', 25.00, 31, 3, 1),
(12023, 'ANGELA HIJO', '', '2021-02-17', 'EFECTIVO', 2.00, 32, 3, 1),
(12023, 'ANGELA HIJO', '', '2021-02-17', 'EFECTIVO', 100.00, 33, 3, 1);

-- Comentarios sobre las tablas
COMMENT ON TABLE historical_sales IS 'Tabla de ventas históricas anteriores a Octubre 2025 para analytics';
COMMENT ON TABLE historical_payments IS 'Tabla de pagos históricos anteriores a Octubre 2025 para analytics';

-- Verificar que se insertaron los datos
SELECT 'Ventas históricas insertadas:' as info, COUNT(*) as total FROM historical_sales;
SELECT 'Pagos históricos insertados:' as info, COUNT(*) as total FROM historical_payments;
