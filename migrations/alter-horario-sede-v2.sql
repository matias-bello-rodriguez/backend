-- Add dia_semana column
ALTER TABLE horario_sede ADD COLUMN dia_semana TINYINT NOT NULL DEFAULT 1;

-- Add activo column (mapping from disponible if possible, or default true)
ALTER TABLE horario_sede ADD COLUMN activo BOOLEAN DEFAULT TRUE;

-- Update activo based on disponible (assuming 1 is true)
UPDATE horario_sede SET activo = (disponible = 1);

-- Make fecha nullable since we are moving to weekly schedule
ALTER TABLE horario_sede MODIFY COLUMN fecha DATE NULL;

-- Rename disponible to avoid confusion or drop it later
-- ALTER TABLE horario_sede DROP COLUMN disponible;
