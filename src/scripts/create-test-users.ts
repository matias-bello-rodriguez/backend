import { DataSource } from 'typeorm';
import { User } from '../entities/User.entity';

async function createTestUsers() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'auto_box',
    entities: [User],
    synchronize: false,
  });

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);

  // Admin user
  const adminExists = await userRepository.findOne({ where: { email: 'admin@autobox.cl' } });
  if (!adminExists) {
    const admin = userRepository.create({
      rut: '11111111-1',
      primerNombre: 'Administrador',
      primerApellido: 'Sistema',
      email: 'admin@autobox.cl',
      telefono: '+56912345678',
      password: '$2b$10$OneAHcJMnBx7FTsIxoa5.OPsVD/Dj5XfajUXY5G0zY9Xo73KuRlFW', // admin123
      rol: 'Administrador' as any,
    });
    await userRepository.save(admin);
    console.log('✅ Admin user created');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Mechanic user
  const mechanicExists = await userRepository.findOne({ where: { email: 'mecanico@autobox.cl' } });
  if (!mechanicExists) {
    const mechanic = userRepository.create({
      rut: '22222222-2',
      primerNombre: 'Juan',
      primerApellido: 'Mecánico',
      email: 'mecanico@autobox.cl',
      telefono: '+56987654321',
      password: '$2b$10$FyE3Zpg9waVXMfXKkIYrKOtOKYDXahWEP5UCML6hSdp2mMYFAdk2y', // mecanico123
      rol: 'Mecánico' as any,
    });
    await userRepository.save(mechanic);
    console.log('✅ Mechanic user created');
  } else {
    console.log('ℹ️  Mechanic user already exists');
  }

  await dataSource.destroy();
  console.log('\n✅ Test users setup completed!');
}

createTestUsers().catch((error) => {
  console.error('❌ Error creating test users:', error);
  process.exit(1);
});
