import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/Payment.entity';
import { Valor } from '../../entities/Valor.entity';
import { User } from '../../entities/User.entity';
import { PublicationPaymentDetail } from '../../entities/PublicationPaymentDetail.entity';
import { InspectionPaymentDetail } from '../../entities/InspectionPaymentDetail.entity';
import { PagoMecanico } from '../../entities/PagoMecanico.entity';
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
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PublicationPaymentDetail)
    private pubPaymentRepo: Repository<PublicationPaymentDetail>,
    @InjectRepository(InspectionPaymentDetail)
    private inspPaymentRepo: Repository<InspectionPaymentDetail>,
    @InjectRepository(PagoMecanico)
    private pagoMecanicoRepo: Repository<PagoMecanico>,
    private notificationsService: NotificationsService,
  ) {}

  async getFinancialSummary() {
    // 1. Total Pagos Confirmados en Detalle Publicacion
    const pubTotal = await this.pubPaymentRepo
      .createQueryBuilder('p')
      .leftJoin('p.pago', 'pago') 
      .where('pago.estado = :status', { status: 'Completado' })
      .select('SUM(pago.monto)', 'total')
      .getRawOne();

    // 2. Total Pagos Confirmados en Detalle Inspeccion  
    const inspTotal = await this.inspPaymentRepo
      .createQueryBuilder('i')
      .leftJoin('i.pago', 'pago')
      .where('pago.estado = :status', { status: 'Completado' })
      .select('SUM(pago.monto)', 'total')
      .getRawOne();

    // 3. Saldo Total Usuarios
    const userBalanceTotal = await this.userRepository
      .createQueryBuilder('u')
      .select('SUM(u.saldo)', 'total')
      .getRawOne();

    // 4. Total Retiros Mecanicos
    const mechanicPayouts = await this.pagoMecanicoRepo
      .createQueryBuilder('pm')
      .select('SUM(pm.monto)', 'total')
      .getRawOne();

    const totalIn = (Number(pubTotal?.total) || 0) + (Number(inspTotal?.total) || 0);
    const totalOut = Number(mechanicPayouts?.total) || 0;

    return {
      totalConfirmed: totalIn - totalOut, // Net confirmed
      totalUserBalance: Number(userBalanceTotal?.total) || 0,
      totalMechanicWithdrawals: totalOut
    };
  }

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

  async findAll() {
    const payments = await this.paymentsRepository.find({ relations: ['usuario'] });
    const mechanicPayouts = await this.pagoMecanicoRepo.find({ relations: ['mecanico'] });

    const formattedPayouts = mechanicPayouts.map(p => ({
      id: `PAYOUT-${p.id}`,
      monto: Number(p.monto),
      usuario: p.mecanico,
      fechaCreacion: p.fecha_pago,
      estado: 'Completado',
      metodo: 'Retiro',
      detalles: p.nota || 'Retiro de fondos',
      tipo: 'RETIRO'
    }));

    const all = [...payments, ...formattedPayouts].sort((a, b) => {
      const dateA = new Date(a.fechaCreacion).getTime();
      const dateB = new Date(b.fechaCreacion).getTime();
      return dateB - dateA;
    });

    return all;
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
