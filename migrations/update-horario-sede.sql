DROP TABLE IF EXISTS horario_sede;

CREATE TABLE horario_sede (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sedeId INT NOT NULL,
  dia_semana TINYINT NOT NULL, -- 1=Lunes ... 7=Domingo
  horaInicio TIME NOT NULL,
  horaFin TIME NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (sedeId) REFERENCES sede(id),
  UNIQUE (sedeId, dia_semana)
);
