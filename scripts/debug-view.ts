
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'auto_box',
  entities: [],
  synchronize: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    console.log('Querying vista_horarios_disponibles...');
    try {
      const result = await AppDataSource.query('SELECT * FROM auto_box.vista_horarios_disponibles LIMIT 5');
      console.log('Result:', result);
    } catch (e) {
      console.error('Error querying view:', e);
    }

    console.log('Checking table structure...');
    try {
      const structure = await AppDataSource.query('DESCRIBE auto_box.vista_horarios_disponibles');
      console.log('Structure:', structure);
    } catch (e) {
      console.error('Error describing view:', e);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
