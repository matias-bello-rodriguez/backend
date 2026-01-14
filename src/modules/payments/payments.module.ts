import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from '../../entities/Payment.entity';
import { Valor } from '../../entities/Valor.entity';
import { WebpayTransaction } from '../../entities/WebpayTransaction.entity';
import { User } from '../../entities/User.entity';
import { PublicationPaymentDetail } from '../../entities/PublicationPaymentDetail.entity';
import { InspectionPaymentDetail } from '../../entities/InspectionPaymentDetail.entity';
import { PagoMecanico } from '../../entities/PagoMecanico.entity';
import { WebPayService } from './webpay.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { InspectionsModule } from '../inspections/inspections.module';
import { PublicationsModule } from '../publications/publications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment, 
      Valor, 
      WebpayTransaction,
      User,
      PublicationPaymentDetail,
      InspectionPaymentDetail,
      PagoMecanico
    ]),
    NotificationsModule,
    InspectionsModule,
    PublicationsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, WebPayService],
  exports: [PaymentsService, WebPayService],
})
export class PaymentsModule {}
