INSERT INTO horario_sede (sedeId, dia_semana, horaInicio, horaFin, activo)
SELECT s.id, 6, '09:00:00', '18:00:00', 1
FROM sede s
WHERE s.nombre IN ('AutoBox Centro', 'AutoBox Providencia', 'AutoBox Las Condes', 'AutoBox Maipú', 'AutoBox San Miguel')
AND NOT EXISTS (
    SELECT 1 FROM horario_sede hs WHERE hs.sedeId = s.id AND hs.dia_semana = 6
);
