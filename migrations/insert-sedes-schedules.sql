-- Insert Sedes
INSERT INTO sede (nombre) VALUES 
('AutoBox Centro'),
('AutoBox Providencia'),
('AutoBox Las Condes'),
('AutoBox Maipú'),
('AutoBox San Miguel')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insert Schedules for all Sedes (Mon-Fri 09:00-18:00)
INSERT INTO horario_sede (sedeId, dia_semana, horaInicio, horaFin, activo)
SELECT s.id, d.dia, '09:00:00', '18:00:00', 1
FROM sede s
CROSS JOIN (
    SELECT 1 as dia UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
) d
WHERE s.nombre IN ('AutoBox Centro', 'AutoBox Providencia', 'AutoBox Las Condes', 'AutoBox Maipú', 'AutoBox San Miguel')
AND NOT EXISTS (
    SELECT 1 FROM horario_sede hs WHERE hs.sedeId = s.id AND hs.dia_semana = d.dia
);
