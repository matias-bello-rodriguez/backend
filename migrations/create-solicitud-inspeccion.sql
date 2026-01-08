CREATE TABLE solicitud_inspeccion (
  id VARCHAR(36) PRIMARY KEY,
  mecanicoId VARCHAR(36) NOT NULL,
  publicacionId VARCHAR(36),
  vehiculoId VARCHAR(36),
  inspeccionId VARCHAR(36),
  estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
  fechaSolicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
  fechaRespuesta DATETIME,
  fechaProgramada DATETIME,
  mensaje VARCHAR(500),
  FOREIGN KEY (mecanicoId) REFERENCES usuario(id),
  FOREIGN KEY (publicacionId) REFERENCES publicacion(id),
  FOREIGN KEY (vehiculoId) REFERENCES vehiculo(id),
  FOREIGN KEY (inspeccionId) REFERENCES inspeccion(id)
);
