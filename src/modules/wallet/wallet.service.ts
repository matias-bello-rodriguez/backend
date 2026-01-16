import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WebpayPlus, Options, IntegrationCommerceCodes, IntegrationApiKeys, Environment } from 'transbank-sdk';
import { User } from '../../entities/User.entity';
import { Payment, PaymentStatus, PaymentMethod } from '../../entities/Payment.entity';
import { WalletTransaction, TransactionType } from '../../entities/WalletTransaction.entity';
import { WebpayTransaction } from '../../entities/WebpayTransaction.entity';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWalletPaymentDto } from './dto/create-payment.dto';

@Injectable()
export class WalletService {
  private tx: any;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(WalletTransaction)
    private transactionRepository: Repository<WalletTransaction>,
    @InjectRepository(WebpayTransaction)
    private webpayTransactionRepository: Repository<WebpayTransaction>,
    private dataSource: DataSource,
  ) {
    const commerceCode = process.env.WEBPAY_COMMERCE_CODE?.trim();
    const apiKey = process.env.WEBPAY_API_KEY?.trim();
    
    console.log('Initializing Webpay with:');
    console.log('Commerce Code:', commerceCode);
    console.log('API Key (masked):', apiKey ? '******' + apiKey.slice(-4) : 'Not set');

    // Detectar entorno basado en el código de comercio o variable explícita
    const isIntegration = commerceCode === '597055555532' || process.env.WEBPAY_ENVIRONMENT === 'integration';
    console.log('Environment detected:', isIntegration ? 'INTEGRATION' : 'PRODUCTION');

    if (commerceCode && apiKey) {
      this.tx = new WebpayPlus.Transaction(new Options(
        commerceCode, 
        apiKey, 
        isIntegration ? Environment.Integration : Environment.Production
      ));
    } else {
      console.log('Using default Integration credentials');
      this.tx = new WebpayPlus.Transaction(new Options(
        IntegrationCommerceCodes.WEBPAY_PLUS, 
        IntegrationApiKeys.WEBPAY, 
        Environment.Integration
      ));
    }
  }

  async getBalance(userId: string): Promise<{ balance: number }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return { balance: user.saldo || 0 };
  }

  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    return this.transactionRepository.find({
      where: { usuarioId: userId },
      order: { fechaCreacion: 'DESC' },
      take: 50,
    });
  }

  async processTransaction(
    userId: string,
    amount: number,
    type: TransactionType,
    referenceId: string,
    description: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Bloquear el usuario para lectura/escritura (Pessimistic Locking)
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) throw new Error('Usuario no encontrado');

      // Validar saldo suficiente si es un gasto (amount negativo)
      if (amount < 0 && (user.saldo || 0) + amount < 0) {
        throw new Error('Saldo insuficiente');
      }

      // 2. Calcular nuevo saldo
      const newBalance = (user.saldo || 0) + amount;

      // 3. Crear el registro en el historial
      const transaction = queryRunner.manager.create(WalletTransaction, {
        usuarioId: userId,
        monto: amount,
        tipo: type,
        referenciaId: referenceId,
        descripcion: description,
        saldoDespues: newBalance,
      });
      await queryRunner.manager.save(transaction);

      // 4. Actualizar el saldo del usuario
      user.saldo = newBalance;
      await queryRunner.manager.save(user);

      // 5. Confirmar transacción
      await queryRunner.commitTransaction();

      return transaction;
    } catch (err) {
      // Si algo falla, deshacer todo
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async initDeposit(userId: string, createDepositDto: CreateDepositDto) {
    const buyOrder = `DEP-${Date.now()}`;
    const sessionId = `S-${userId}-${Date.now()}`;
    const amount = createDepositDto.amount;
    // URL de retorno a la app (deep link) o página intermedia
    // Para Expo Go en desarrollo, usar IP local o esquema personalizado
    // Aquí usaremos una página de éxito del backend que redirija a la app
    const baseUrl = process.env.API_URL;
    if (!baseUrl) {
        console.warn('⚠️ API_URL no está definida en .env. Asegúrate de configurarla correctamente.');
    }
    const returnUrl = `${baseUrl || 'http://localhost:3000'}/wallet/public/deposit/transbank/return`;
    
    console.log('Creating Webpay Transaction:');
    console.log('BuyOrder:', buyOrder);
    console.log('SessionId:', sessionId);
    console.log('Amount:', amount);
    console.log('ReturnUrl:', returnUrl);

    // Crear registro de pago pendiente
    const payment = this.paymentsRepository.create({
      usuarioId: userId,
      monto: amount,
      metodo: PaymentMethod.WEBPAY,
      estado: PaymentStatus.PENDING,
      detalles: `Orden de compra: ${buyOrder}`,
      idempotencyKey: buyOrder,
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    try {
      const createResponse = await this.tx.create(
        buyOrder,
        sessionId,
        amount,
        returnUrl
      );

      console.log('Webpay Transaction Created:', createResponse);

      // Guardar transacción de Webpay
      const webpayTx = this.webpayTransactionRepository.create({
        pagoId: savedPayment.id,
        token: createResponse.token,
        status: 'INITIALIZED',
        amount: amount,
        buyOrder: buyOrder,
        sessionId: sessionId,
      });
      await this.webpayTransactionRepository.save(webpayTx);

      return {
        paymentId: savedPayment.id,
        url: createResponse.url,
        token: createResponse.token,
      };
    } catch (error) {
      console.error('Error creating Webpay transaction:', error);
      throw new BadRequestException('Error al iniciar transacción con Webpay');
    }
  }

  async confirmDepositByToken(token: string) {
    const webpayTx = await this.webpayTransactionRepository.findOne({
      where: { token },
      relations: ['pago'],
    });

    if (!webpayTx) {
      throw new BadRequestException('Webpay transaction not found');
    }

    const payment = webpayTx.pago;
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.estado === PaymentStatus.COMPLETED) {
      return { success: true, message: 'Payment already processed' };
    }

    try {
      const commitResponse = await this.tx.commit(token);

      // Actualizar estado de WebpayTransaction
      webpayTx.status = commitResponse.status;
      await this.webpayTransactionRepository.save(webpayTx);

      if (commitResponse.status === 'AUTHORIZED' && commitResponse.response_code === 0) {
        // Pago exitoso
        payment.estado = PaymentStatus.COMPLETED;
        await this.paymentsRepository.save(payment);

        // Procesar la transacción de billetera
        await this.processTransaction(
          payment.usuarioId,
          payment.monto,
          TransactionType.CARGA,
          payment.id,
          'Carga de saldo vía Webpay',
        );

        return { success: true, message: 'Payment successful', data: commitResponse };
      } else {
        // Pago rechazado
        payment.estado = PaymentStatus.FAILED;
        await this.paymentsRepository.save(payment);
        return { success: false, message: 'Payment rejected', data: commitResponse };
      }
    } catch (error) {
      console.error('Error confirming Webpay transaction:', error);
      
      // Si el error es 422 (Transaction already locked), intentar consultar estado
      if (error?.response?.status === 422 || error?.message?.includes('422') || error?.message?.includes('already locked')) {
          console.log('🔄 Transacción ya confirmada, consultando estado...');
          try {
             // Consultar estado a Transbank
             const statusResponse = await this.tx.status(token);
             console.log('📄 Estado recuperado de Transbank:', statusResponse);

             // Actualizar DB si es necesario (Race condition recovery)
             if (statusResponse.status === 'AUTHORIZED' && statusResponse.response_code === 0) {
                 if (payment.estado !== PaymentStatus.COMPLETED) {
                    payment.estado = PaymentStatus.COMPLETED;
                    await this.paymentsRepository.save(payment);

                    // Verificar si ya se procesó la transacción de billetera para no duplicar
                    const existingTx = await this.transactionRepository.findOne({
                        where: { referenciaId: payment.id, tipo: TransactionType.CARGA }
                    });

                    if (!existingTx) {
                        await this.processTransaction(
                          payment.usuarioId,
                          payment.monto,
                          TransactionType.CARGA,
                          payment.id,
                          'Carga de saldo vía Webpay (Recuperado)',
                        );
                    }
                 }
                 return { success: true, message: 'Payment successful (Recovered)', data: statusResponse };
             } else {
                 // Si está fallido en Transbank
                  if (payment.estado !== PaymentStatus.FAILED) {
                     payment.estado = PaymentStatus.FAILED;
                     await this.paymentsRepository.save(payment);
                  }
                  return { success: false, message: 'Payment rejected', data: statusResponse };
             }

          } catch (statusError) {
             console.error('Error getting transaction status:', statusError);
          }
      }

      if (payment.estado === PaymentStatus.COMPLETED) {
         return { success: true, message: 'Payment already processed' };
      }
      throw new BadRequestException('Error al confirmar transacción con Webpay');
    }
  }

  async confirmDeposit(paymentId: string, token: string) {
    // Delegar a confirmDepositByToken si tenemos el token
    if (token) {
      return this.confirmDepositByToken(token);
    }
    // ... fallback logic if needed, but we should rely on token
    throw new BadRequestException('Token is required');
  }

  async makePayment(userId: string, paymentDto: CreateWalletPaymentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Payment Record
      const payment = queryRunner.manager.create(Payment, {
        usuarioId: userId,
        monto: paymentDto.amount,
        metodo: PaymentMethod.SALDO_AUTOBOX,
        estado: PaymentStatus.COMPLETED, // Immediate success for wallet
        detalles: paymentDto.description,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        idempotencyKey: `WALLET-${Date.now()}-${Math.random().toString(36).substring(7)}`
      });
      
      const savedPayment = await queryRunner.manager.save(Payment, payment);

      // 2. Process Wallet Transaction (Deduct funds)
      // We use the existing logic but inside this transaction context manually
      // or call processTransaction if it supports queryRunner (it doesn't currently)
      // So we replicate the logic here for atomicity
      
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) throw new Error('Usuario no encontrado');

      if ((user.saldo || 0) < paymentDto.amount) {
        throw new Error('Saldo insuficiente');
      }

      const newBalance = (user.saldo || 0) - paymentDto.amount;
      
      const transaction = queryRunner.manager.create(WalletTransaction, {
        usuarioId: userId,
        monto: -paymentDto.amount,
        tipo: TransactionType.PAGO_SERVICIO,
        saldoAntes: user.saldo || 0,
        saldoDespues: newBalance,
        referenciaId: savedPayment.id, // Link to Payment ID
        descripcion: paymentDto.description || 'Pago de servicio',
        fechaCreacion: new Date(),
      });

      await queryRunner.manager.save(WalletTransaction, transaction);

      // Update User Balance
      user.saldo = newBalance;
      await queryRunner.manager.save(User, user);

      await queryRunner.commitTransaction();

      return {
        success: true,
        paymentId: savedPayment.id,
        balance: newBalance,
        transaction,
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  // Obtener billetera completa (balance + transacciones)
  async getWallet(userId: string) {
    const balance = await this.getBalance(userId);
    const transactions = await this.getTransactions(userId);

    return {
      ...balance,
      transactions,
    };
  }

  async simulateDeposit(userId: string, amount: number) {
    return this.processTransaction(
      userId,
      amount,
      TransactionType.CARGA,
      `SIM-${Date.now()}`,
      'Carga de saldo simulada',
    );
  }
}
