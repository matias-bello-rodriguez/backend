-- Migración para agregar campos de GetAPI a la tabla vehiculo (MySQL)
-- Fecha: 2025-12-20

ALTER TABLE vehiculo 
ADD COLUMN dvPatente VARCHAR(1),
ADD COLUMN version VARCHAR(100),
ADD COLUMN kilometraje INT,
ADD COLUMN color VARCHAR(50),
ADD COLUMN vin VARCHAR(50),
ADD COLUMN numeroMotor VARCHAR(50),
ADD COLUMN motor VARCHAR(20),
ADD COLUMN combustible VARCHAR(30),
ADD COLUMN transmision VARCHAR(30),
ADD COLUMN puertas INT,
ADD COLUMN tipoVehiculo VARCHAR(50),
ADD COLUMN mesRevisionTecnica VARCHAR(20);

-- Actualizar modelo para permitir mayor longitud
ALTER TABLE vehiculo MODIFY COLUMN modelo VARCHAR(100);
