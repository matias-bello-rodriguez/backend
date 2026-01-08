CREATE TABLE usuario_horario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuarioId VARCHAR(36) NOT NULL,
  dia_semana TINYINT NOT NULL, -- 1=Lunes ... 7=Domingo
  horaInicio TIME NOT NULL,
  horaFin TIME NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (usuarioId) REFERENCES usuario(id),
  UNIQUE (usuarioId, dia_semana)
);
