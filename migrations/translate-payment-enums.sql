SET SQL_SAFE_UPDATES = 0;

-- Temporarily change to VARCHAR to allow value updates
ALTER TABLE pago MODIFY COLUMN estado VARCHAR(50);
ALTER TABLE pago MODIFY COLUMN metodoPago VARCHAR(50);

-- Update values
UPDATE pago SET estado = 'Pendiente' WHERE estado = 'PENDING';
UPDATE pago SET estado = 'Completado' WHERE estado = 'COMPLETED';
UPDATE pago SET estado = 'Fallido' WHERE estado = 'FAILED';
UPDATE pago SET estado = 'Reembolsado' WHERE estado = 'REFUNDED';

UPDATE pago SET metodoPago = 'WebPay' WHERE metodoPago = 'WEBPAY';
UPDATE pago SET metodoPago = 'Transferencia' WHERE metodoPago = 'TRANSFER';
UPDATE pago SET metodoPago = 'Efectivo' WHERE metodoPago = 'CASH';
UPDATE pago SET metodoPago = 'Saldo AutoBox' WHERE metodoPago = 'SALDO_AUTOBOX';

-- Apply new ENUM definitions
ALTER TABLE pago MODIFY COLUMN estado ENUM('Pendiente','Completado','Fallido','Reembolsado') DEFAULT 'Pendiente';
ALTER TABLE pago MODIFY COLUMN metodoPago ENUM('WebPay','Transferencia','Efectivo','Saldo AutoBox') DEFAULT 'WebPay';

SET SQL_SAFE_UPDATES = 1;
