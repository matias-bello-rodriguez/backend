import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/Payment.entity';
import { Valor } from '../../entities/Valor.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/Notification.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Valor)
    private valorRepository: Repository<Valor>,
    private notificationsService: NotificationsService,
  ) {}

  async getPrices() {
    return this.valorRepository.find();
  }

  async create(createPaymentDto: CreatePaymentDto) {
    // If idempotencyKey provided, return existing payment to avoid duplicates
    if (createPaymentDto.idempotencyKey) {
      const existing = await this.paymentsRepository.findOne({ where: { idempotencyKey: createPaymentDto.idempotencyKey } });
      if (existing) return existing;
    }

    const payment = this.paymentsRepository.create(createPaymentDto as any) as any;
    // 🚀 AUTO-APROBAR TODAS LAS TRANSACCIONES WEBPAY (PROVISIONAL)
    if (payment?.metodo === 'WebPay') {
      payment.estado = 'Completado'; // Auto-approve WebPay transactions
    }
    const savedPayment = await this.paymentsRepository.save(payment);

    return savedPayment;
  }

  findAll() {
    return this.paymentsRepository.find({ relations: ['usuario'] });
  }

  async findOne(id: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.findOne(id);
    Object.assign(payment, updatePaymentDto);
    return this.paymentsRepository.save(payment);
  }

  async findByUser(userId: string) {
    return this.paymentsRepository.find({
      where: { usuarioId: userId },
      relations: ['usuario'],
    });
  }
}
