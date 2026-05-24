-- SmartDrain — esquema MySQL local
-- Ejecutar: npm run db:setup  (o mysql -u root -p < database/schema.sql)

CREATE DATABASE IF NOT EXISTS smartdrain
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartdrain;

CREATE USER IF NOT EXISTS 'smartdrain'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON smartdrain.* TO 'smartdrain'@'localhost';
FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reportes (
  id VARCHAR(36) PRIMARY KEY,
  descripcion TEXT NOT NULL,
  categoria VARCHAR(50) NULL,
  latitud DECIMAL(10, 7) NOT NULL,
  longitud DECIMAL(10, 7) NOT NULL,
  severidad ENUM('Leve', 'Moderado', 'Grave') NOT NULL,
  estado ENUM('Pendiente', 'Revisado', 'Solucionado') NOT NULL DEFAULT 'Pendiente',
  autor_id VARCHAR(36) NOT NULL,
  autor_nombre VARCHAR(255) NULL,
  foto_url LONGTEXT NULL,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reportes_autor (autor_id),
  INDEX idx_reportes_fecha (fecha),
  CONSTRAINT fk_reportes_autor FOREIGN KEY (autor_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sensores (
  id VARCHAR(10) PRIMARY KEY,
  ubicacion VARCHAR(255) NOT NULL,
  latitud DECIMAL(10, 7) NOT NULL,
  longitud DECIMAL(10, 7) NOT NULL,
  nivel_agua INT NOT NULL DEFAULT 0,
  flujo DECIMAL(5, 2) NOT NULL DEFAULT 0,
  bateria INT NOT NULL DEFAULT 100,
  estado ENUM('Normal', 'Alerta', 'Critico') NOT NULL DEFAULT 'Normal',
  ultima_lectura TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mantenimiento_sensores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sensor_id VARCHAR(10) NOT NULL,
  fecha DATE NOT NULL,
  accion VARCHAR(255) NOT NULL,
  tecnico VARCHAR(100) NOT NULL,
  CONSTRAINT fk_mantenimiento_sensor FOREIGN KEY (sensor_id) REFERENCES sensores(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Usuario para reportes sin sesión
INSERT IGNORE INTO usuarios (id, nombre, correo, password)
VALUES ('anonimo', 'Ciudadano anónimo', 'anonimo@smartdrain.local', '');

INSERT IGNORE INTO sensores (id, ubicacion, latitud, longitud, nivel_agua, flujo, bateria, estado) VALUES
('s1', 'Centro Histórico (Parque Caldas)', 2.4418, -76.6063, 18, 1.85, 98, 'Normal'),
('s2', 'Sector Campanario', 2.4578, -76.5912, 44, 1.35, 76, 'Normal'),
('s3', 'Barrio Bolívar', 2.4461, -76.6015, 31, 1.62, 88, 'Normal'),
('s4', 'Pomona', 2.4485, -76.5891, 11, 1.98, 95, 'Normal'),
('s5', 'Terminal de Transportes', 2.4526, -76.6066, 14, 1.92, 92, 'Normal'),
('s6', 'Hospital Universitario San José', 2.4442, -76.6025, 24, 1.72, 84, 'Normal'),
('s7', 'Comuna 2 (Bello Horizonte)', 2.4632, -76.5821, 33, 1.55, 81, 'Normal'),
('s8', 'El Empedrado', 2.4385, -76.6045, 39, 1.42, 99, 'Normal');

INSERT IGNORE INTO mantenimiento_sensores (sensor_id, fecha, accion, tecnico) VALUES
('s1', '2024-03-10', 'Limpieza de rejilla', 'Juan G.'),
('s2', '2024-04-01', 'Cambio de batería', 'Ana M.');
