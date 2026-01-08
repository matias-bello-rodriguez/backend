import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MechanicsService } from './mechanics.service';
import { MechanicsController } from './mechanics.controller';
import { User } from '../../entities/User.entity';
import { Inspection } from '../../entities/Inspection.entity';
import { UserSchedule } from '../../entities/UserSchedule.entity';
import { SedeSchedule } from '../../entities/SedeSchedule.entity';
import { Sede } from '../../entities/Sede.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Inspection, UserSchedule, SedeSchedule, Sede])],
  controllers: [MechanicsController],
  providers: [MechanicsService],
  exports: [MechanicsService],
})
export class MechanicsModule {}
