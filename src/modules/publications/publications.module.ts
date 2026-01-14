import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationsService } from './publications.service';
import { PublicationsController } from './publications.controller';
import { Publication } from '../../entities/Publication.entity';
import { PublicationLike } from '../../entities/PublicationLike.entity';
import { PublicationPhoto } from '../../entities/PublicationPhoto.entity';
import { PublicationPaymentDetail } from '../../entities/PublicationPaymentDetail.entity';
import { Inspection } from '../../entities/Inspection.entity';
import { SolicitudInspeccion } from '../../entities/SolicitudInspeccion.entity';
import { Valor } from '../../entities/Valor.entity';
import { User } from '../../entities/User.entity';
import { PublicationModeration } from '../../entities/PublicationModeration.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
        Publication, 
        PublicationLike, 
        PublicationPhoto, 
        PublicationPaymentDetail, 
        Inspection, 
        SolicitudInspeccion, 
        Valor, 
        User,
        PublicationModeration
    ]),
    NotificationsModule,
  ],
  controllers: [PublicationsController],
  providers: [PublicationsService],
  exports: [PublicationsService],
})
export class PublicationsModule {}
