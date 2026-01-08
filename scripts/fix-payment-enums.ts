
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'rayen123%',
  database: process.env.DB_DATABASE || 'auto_box',
  entities: [],
  synchronize: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    console.log('Altering pago table to update ENUMs...');
    
    // Update metodoPago enum
    await AppDataSource.query("ALTER TABLE pago MODIFY COLUMN metodoPago ENUM('WEBPAY','TRANSFER','CASH','SALDO_AUTOBOX') DEFAULT 'WEBPAY'");
    console.log('Updated metodoPago enum.');

    // Update estado enum (just to be safe, though it seemed correct in DB)
    await AppDataSource.query("ALTER TABLE pago MODIFY COLUMN estado ENUM('PENDING','COMPLETED','FAILED','REFUNDED') DEFAULT 'PENDING'");
    console.log('Updated estado enum.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
