import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../../entities/User.entity';
import { Vehicle } from '../../entities/Vehicle.entity';
import { Publication } from '../../entities/Publication.entity';
import { Inspection } from '../../entities/Inspection.entity';
import { Payment } from '../../entities/Payment.entity';
import { PagoMecanico } from '../../entities/PagoMecanico.entity';
import { UserSchedule } from '../../entities/UserSchedule.entity';
import { SedeSchedule } from '../../entities/SedeSchedule.entity';
import { SystemSetting } from '../../entities/SystemSetting.entity';
import { Valor } from '../../entities/Valor.entity';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vehicle, Publication, Inspection, PagoMecanico, Payment, UserSchedule, SedeSchedule, SystemSetting, Valor]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
