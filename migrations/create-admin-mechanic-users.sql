-- Crear usuario Admin
-- Password: admin123 (hashed con bcrypt)
INSERT INTO usuario (
  id,
  rut,
  `primerNombre`,
  `segundoNombre`,
  `primerApellido`,
  `segundoApellido`,
  email,
  telefono,
  rol,
  `fechaCreacion`,
  `fechaNacimiento`,
  saldo,
  foto_url,
  `pushToken`,
  password
) VALUES (
  UUID(),
  '11111111-1',
  'Admin',
  NULL,
  'Sistema',
  NULL,
  'admin@autobox.cl',
  '+56912345678',
  'Administrador',
  NOW(),
  '1990-01-01',
  0,
  NULL,
  NULL,
  '$2b$10$XG.rni/X3UYy0lganMOv9eNvGPchO3ZQH9Yfiuttw0qXCwzZQVqGK'
) ON DUPLICATE KEY UPDATE password=VALUES(password), rol=VALUES(rol);

-- Crear usuario Mecánico
-- Password: Mecanico123! (hashed con bcrypt)
INSERT INTO usuario (
  id,
  rut,
  `primerNombre`,
  `segundoNombre`,
  `primerApellido`,
  `segundoApellido`,
  email,
  telefono,
  rol,
  `fechaCreacion`,
  `fechaNacimiento`,
  saldo,
  foto_url,
  `pushToken`,
  password
) VALUES (
  UUID(),
  '22222222-2',
  'Juan',
  'Carlos',
  'Pérez',
  'González',
  'mecanico@autobox.cl',
  '+56987654321',
  'Mecánico',
  NOW(),
  '1985-05-15',
  0,
  NULL,
  NULL,
  '$2b$10$Xkjb9/Se4LMLEsAR1wDjluKT277nz6E944txlWcdnFJd6TTaG/6V6'
) ON DUPLICATE KEY UPDATE password=VALUES(password), rol=VALUES(rol);

-- Verificar usuarios creados
SELECT id, email, rol, `primerNombre`, `primerApellido` 
FROM usuario 
WHERE email IN ('admin@autobox.cl', 'mecanico@autobox.cl');
