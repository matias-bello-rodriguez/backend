import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/modules/users/users.service';
import { UserRole } from '../src/entities/User.entity';

async function checkAdmins() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  console.log('Checking for admins...');
  const admins = await usersService.findByRole(UserRole.ADMINISTRADOR);
  
  console.log(`Found ${admins.length} admins.`);
  admins.forEach(admin => {
    console.log(`- ${admin.email} (ID: ${admin.id}) - PushToken: ${admin.pushToken ? 'YES' : 'NO'}`);
  });

  const allUsers = await usersService.findAll();
  console.log('\nAll users roles:');
  allUsers.forEach(u => console.log(`- ${u.email}: ${u.rol}`));

  await app.close();
}

checkAdmins();
