import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../../entities/User.entity';
import { Inspection } from '../../entities/Inspection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Inspection])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
