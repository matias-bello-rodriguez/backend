import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { NotificationsService } from '../src/modules/notifications/notifications.service';
import { UsersService } from '../src/modules/users/users.service';
import { UserRole } from '../src/entities/User.entity';

async function checkNotifications() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const notificationsService = app.get(NotificationsService);
  const usersService = app.get(UsersService);

  console.log('Checking notifications for admins...');
  const admins = await usersService.findByRole(UserRole.ADMINISTRADOR);
  
  for (const admin of admins) {
    console.log(`\nAdmin: ${admin.email} (${admin.id})`);
    const notifications = await notificationsService.findAll(admin.id);
    console.log(`Found ${notifications.length} notifications.`);
    notifications.forEach(n => {
      console.log(`- [${n.type}] ${n.title}: ${n.message} (Read: ${n.read})`);
    });
  }

  await app.close();
}

checkNotifications();
