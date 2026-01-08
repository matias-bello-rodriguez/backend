
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

    console.log('Checking if descripcion column exists in publicacion table...');
    const columns = await AppDataSource.query("SHOW COLUMNS FROM publicacion LIKE 'descripcion'");
    
    if (columns.length === 0) {
        console.log('Adding descripcion column to publicacion table...');
        await AppDataSource.query('ALTER TABLE publicacion ADD COLUMN descripcion TEXT NULL');
        console.log('Column added successfully.');
    } else {
        console.log('Column descripcion already exists.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
