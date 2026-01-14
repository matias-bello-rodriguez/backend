-- Creating bonificacion value. 
-- Since `precio` is INT, we cannot store "0.15".
-- However, User Requirement: "en la tabla valor, id 3, nombre 'bonificacion', se expresa en 0.00 a 1"
-- If the column is strictly INT, we have a problem.
-- I'll modify the column type to DECIMAL/FLOAT to support 0.00 to 1, OR I have to assume the user implies scaling.
-- But the task implies "en la tabla valor... existe...".
-- Let's ALTER the column or just Insert assuming users know what they are doing, but wait, 0.15 truncates to 0 in INT.
-- Best approach: ALTER 'precio' to allow decimals OR use a scaling factor in the code and store integer (e.g. 15 for 15%). 
-- BUT the user said "se expresa en 0.00 a 1".
-- I will ALTER the table to change `precio` to DECIMAL(10, 2) or FLOAT.
-- However, `precio` for other items (40000) is fine as decimal.

ALTER TABLE valor MODIFY COLUMN precio DECIMAL(10, 2);

INSERT INTO valor (id, nombre, precio, activo) VALUES (3, 'bonificacion', 0.10, true)
ON DUPLICATE KEY UPDATE precio = VALUES(precio);
