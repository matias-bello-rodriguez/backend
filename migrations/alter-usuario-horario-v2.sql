ALTER TABLE usuario_horario ADD INDEX idx_usuario_horario_usuarioId (usuarioId);
ALTER TABLE usuario_horario DROP INDEX usuarioId;
