-- Migration: Create search history table
CREATE TABLE historial_busqueda (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  usuario_id VARCHAR(36) NOT NULL,
  termino_busqueda VARCHAR(255),
  precio_min INTEGER,
  precio_max INTEGER,
  anio_min INTEGER,
  anio_max INTEGER,
  marca VARCHAR(50),
  transmision VARCHAR(50),
  combustible VARCHAR(50),
  fecha_busqueda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resultados_encontrados INTEGER DEFAULT 0,
  FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE INDEX idx_historial_usuario ON historial_busqueda(usuario_id, fecha_busqueda DESC);
CREATE INDEX idx_historial_marca ON historial_busqueda(marca);
