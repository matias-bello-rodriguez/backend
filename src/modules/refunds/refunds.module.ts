import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { RefundRequest } from '../../entities/RefundRequest.entity';
import { UserBankAccount } from '../../entities/UserBankAccount.entity';
import { PublicationPaymentDetail } from '../../entities/PublicationPaymentDetail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RefundRequest, UserBankAccount, PublicationPaymentDetail])],
  controllers: [RefundsController],
  providers: [RefundsService],
  exports: [RefundsService],
})
export class RefundsModule {}
