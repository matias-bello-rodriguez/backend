
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

    console.log('--- Describe Vehiculo ---');
    const vehiculoCols = await AppDataSource.query('DESCRIBE vehiculo');
    console.table(vehiculoCols);

    console.log('--- Describe Publicacion ---');
    const publicacionCols = await AppDataSource.query('DESCRIBE publicacion');
    console.table(publicacionCols);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
