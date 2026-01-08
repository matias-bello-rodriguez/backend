
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../.env') });

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

    console.log('--- Vehicles ---');
    const vehicles = await AppDataSource.query('SELECT id, marca, modelo FROM vehiculo LIMIT 5');
    console.table(vehicles);

    if (vehicles.length > 0) {
        const vehicleId = vehicles[0].id;
        console.log(`--- Publications for Vehicle ${vehicleId} ---`);
        const publications = await AppDataSource.query('SELECT id, estado, vehiculoId FROM publicacion WHERE vehiculoId = ?', [vehicleId]);
        console.table(publications);

        if (publications.length > 0) {
            const pubId = publications[0].id;
            console.log(`--- Photos for Publication ${pubId} ---`);
            const photos = await AppDataSource.query('SELECT * FROM publicacion_fotos WHERE publicacionId = ?', [pubId]);
            console.table(photos);
        } else {
            console.log('No publications found for this vehicle.');
        }
    }

    console.log('--- All Photos Sample ---');
    const allPhotos = await AppDataSource.query('SELECT * FROM publicacion_fotos LIMIT 5');
    console.table(allPhotos);


  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

run();
