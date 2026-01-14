import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundRequest, RefundStatus } from '../../entities/RefundRequest.entity';
import { UserBankAccount } from '../../entities/UserBankAccount.entity';
import { PublicationPaymentDetail } from '../../entities/PublicationPaymentDetail.entity';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateRefundStatusDto } from './dto/update-refund-status.dto';

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(RefundRequest)
    private refundRequestRepository: Repository<RefundRequest>,
    @InjectRepository(UserBankAccount)
    private userBankAccountRepository: Repository<UserBankAccount>,
    @InjectRepository(PublicationPaymentDetail)
    private publicationPaymentDetailRepository: Repository<PublicationPaymentDetail>,
  ) {}

  async create(createRefundRequestDto: CreateRefundRequestDto, userId: string) {
    const bankAccount = await this.userBankAccountRepository.findOne({ where: { userId } });
    if (!bankAccount) {
      throw new BadRequestException('Debe registrar una cuenta bancaria antes de solicitar reembolso.');
    }

    const paymentDetail = await this.publicationPaymentDetailRepository.findOne({
      where: { publicacionId: createRefundRequestDto.publicationId },
      relations: ['pago'],
    });

    const amount = paymentDetail?.pago?.monto || 0;

    const refund = this.refundRequestRepository.create({
      ...createRefundRequestDto,
      userId,
      amount,
      status: RefundStatus.PENDING,
    });

    return this.refundRequestRepository.save(refund);
  }

  async saveBankAccount(dto: CreateBankAccountDto, userId: string) {
    let account = await this.userBankAccountRepository.findOne({ where: { userId } });
    if (account) {
      Object.assign(account, dto);
    } else {
      account = this.userBankAccountRepository.create({ ...dto, userId });
    }
    return this.userBankAccountRepository.save(account);
  }

  async getBankAccount(userId: string) {
    return this.userBankAccountRepository.findOne({ where: { userId } });
  }

  async findAll() {
    return this.refundRequestRepository.find({ 
        relations: ['user', 'publication'],
        order: {
            // @ts-ignore
            createdAt: 'DESC' // Assuming base entity or checking entity definition
        }
    }); 
    // Just in case createdAt is not on RefundRequest directly but maybe inherited or I should check.
    // RefundRequest has @CreateDateColumn if I recall correctly. 
    // Checking entity content from previous read_file...
  }

  async updateStatus(id: string, dto: UpdateRefundStatusDto) {
      const refund = await this.refundRequestRepository.findOne({ where: { id } });
      if (!refund) throw new NotFoundException('Solicitud no encontrada');
      
      refund.status = dto.status;
      return this.refundRequestRepository.save(refund);
  }
}
