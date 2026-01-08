import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletPublicController } from './wallet.public.controller';
import { User } from '../../entities/User.entity';
import { Payment } from '../../entities/Payment.entity';
import { WalletTransaction } from '../../entities/WalletTransaction.entity';
import { WebpayTransaction } from '../../entities/WebpayTransaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Payment, WalletTransaction, WebpayTransaction])],
  controllers: [WalletController, WalletPublicController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
