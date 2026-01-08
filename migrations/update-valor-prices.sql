CREATE TABLE IF NOT EXISTS valor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  precio INT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT NOW(),
  updated_at DATETIME DEFAULT NOW() ON UPDATE NOW()
);

INSERT INTO valor (id, nombre, precio, activo, created_at, updated_at) VALUES
(1, 'Inspección', 40000, 1, '2025-12-20 13:06:22', '2025-12-20 13:06:22'),
(2, 'Publicación', 25000, 1, '2025-12-20 13:06:22', '2025-12-20 13:06:22')
ON DUPLICATE KEY UPDATE
precio = VALUES(precio),
nombre = VALUES(nombre),
updated_at = NOW();
