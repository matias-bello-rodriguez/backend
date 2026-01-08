import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InspectionsService } from './inspections.service';
import { InspectionsController } from './inspections.controller';
import { Inspection } from '../../entities/Inspection.entity';
import { InspectionPaymentDetail } from '../../entities/InspectionPaymentDetail.entity';
import { SolicitudInspeccion } from '../../entities/SolicitudInspeccion.entity';
import { Valor } from '../../entities/Valor.entity';
import { InspectionSection } from '../../entities/InspectionSection.entity';
import { InspectionSubsection } from '../../entities/InspectionSubsection.entity';
import { Question } from '../../entities/Question.entity';
import { AnswerOption } from '../../entities/AnswerOption.entity';
import { InspectionAnswer } from '../../entities/InspectionAnswer.entity';
import { Publication } from '../../entities/Publication.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inspection, 
      Publication,
      InspectionPaymentDetail, 
      SolicitudInspeccion, 
      Valor,
      InspectionSection,
      InspectionSubsection,
      Question,
      AnswerOption,
      InspectionAnswer
    ]),
    NotificationsModule,
  ],
  controllers: [InspectionsController],
  providers: [InspectionsService],
  exports: [InspectionsService],
})
export class InspectionsModule {}
