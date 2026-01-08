-- Agregar columna activo a tabla usuario
ALTER TABLE usuario 
ADD COLUMN activo BOOLEAN DEFAULT TRUE;

-- Actualizar todos los usuarios existentes a activo = true
UPDATE usuario SET activo = TRUE WHERE activo IS NULL;
