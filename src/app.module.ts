import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/User.entity';
import { Vehicle } from './entities/Vehicle.entity';
import { Publication } from './entities/Publication.entity';
import { PublicationPhoto } from './entities/PublicationPhoto.entity';
import { Sede } from './entities/Sede.entity';
import { SedeSchedule } from './entities/SedeSchedule.entity';
import { UserSchedule } from './entities/UserSchedule.entity';
import { Inspection } from './entities/Inspection.entity';
import { InspectionSection } from './entities/InspectionSection.entity';
import { InspectionSubsection } from './entities/InspectionSubsection.entity';
import { Question } from './entities/Question.entity';
import { AnswerOption } from './entities/AnswerOption.entity';
import { InspectionAnswer } from './entities/InspectionAnswer.entity';
import { Payment } from './entities/Payment.entity';
import { InspectionPaymentDetail } from './entities/InspectionPaymentDetail.entity';
import { PublicationPaymentDetail } from './entities/PublicationPaymentDetail.entity';
import { WebpayTransaction } from './entities/WebpayTransaction.entity';
import { PaymentAudit } from './entities/PaymentAudit.entity';
import { PublicationLike } from './entities/PublicationLike.entity';
import { Notification } from './entities/Notification.entity';
import { Message } from './entities/Message.entity';
import { SearchHistory } from './entities/SearchHistory.entity';
import { SystemSetting } from './entities/SystemSetting.entity';
import { Valor } from './entities/Valor.entity';
import { WalletTransaction } from './entities/WalletTransaction.entity';
import { SolicitudInspeccion } from './entities/SolicitudInspeccion.entity';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { InspectionsModule } from './modules/inspections/inspections.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PublicationsModule } from './modules/publications/publications.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { ChatModule } from './modules/chat/chat.module';
import { MechanicsModule } from './modules/mechanics/mechanics.module';
import { SearchModule } from './modules/search/search.module';
import { SearchHistoryModule } from './modules/search/search-history.module';
import { AdminModule } from './modules/admin/admin.module';
import { SedesModule } from './modules/sedes/sedes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'rayen123%',
      database: process.env.DB_DATABASE || 'auto_box',
      entities: [
        User,
        Vehicle,
        Publication,
        PublicationPhoto,
        Sede,
        SedeSchedule,
        UserSchedule,
        Inspection,
        InspectionSection,
        InspectionSubsection,
        Question,
        AnswerOption,
        InspectionAnswer,
        Payment,
        InspectionPaymentDetail,
        PublicationPaymentDetail,
        WebpayTransaction,
        PaymentAudit,
        PublicationLike,
        Notification,
        Message,
        SearchHistory,
        SystemSetting,
        Valor,
        WalletTransaction,
        SolicitudInspeccion,
      ],
      synchronize: false, // Cambiado a false para usar las tablas existentes en la BD
    }),
    AuthModule,
    UsersModule,
    VehiclesModule,
    InspectionsModule,
    PaymentsModule,
    PublicationsModule,
    NotificationsModule,
    WalletModule,
    UploadsModule,
    ChatModule,
    MechanicsModule,
    SearchModule,
    SearchHistoryModule,
    AdminModule,
    SedesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
