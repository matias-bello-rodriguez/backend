import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWalletPaymentDto } from './dto/create-payment.dto';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener billetera completa (saldo + transacciones)' })
  @ApiResponse({ status: 200, description: 'Billetera del usuario.' })
  getWallet(@Request() req) {
    return this.walletService.getWallet(req.user.userId);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Obtener saldo de la billetera' })
  @ApiResponse({ status: 200, description: 'Saldo actual.' })
  getBalance(@Request() req) {
    return this.walletService.getBalance(req.user.userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Obtener historial de transacciones' })
  @ApiResponse({ status: 200, description: 'Lista de transacciones.' })
  getTransactions(@Request() req) {
    return this.walletService.getTransactions(req.user.userId);
  }

  @Post('deposit/transbank/init')
  @ApiOperation({ summary: 'Iniciar depósito con Transbank' })
  @ApiResponse({ status: 201, description: 'Depósito iniciado, retorna URL de pago.' })
  initDeposit(@Request() req, @Body() createDepositDto: CreateDepositDto) {
    return this.walletService.initDeposit(req.user.userId, createDepositDto);
  }

  @Post('deposit/transbank/confirm')
  @ApiOperation({ summary: 'Confirmar depósito con Transbank' })
  @ApiQuery({ name: 'paymentId', required: true })
  @ApiQuery({ name: 'token', required: true })
  @ApiResponse({ status: 200, description: 'Depósito confirmado.' })
  confirmDeposit(@Query('paymentId') paymentId: string, @Query('token') token: string) {
    return this.walletService.confirmDeposit(paymentId, token);
  }

  @Post('payment')
  @ApiOperation({ summary: 'Realizar pago con saldo de billetera' })
  @ApiResponse({ status: 201, description: 'Pago realizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Saldo insuficiente.' })
  makePayment(@Request() req, @Body() paymentDto: CreateWalletPaymentDto) {
    return this.walletService.makePayment(req.user.userId, paymentDto);
  }

  @Post('deposit/simulate')
  @ApiOperation({ summary: 'Simular depósito (DEV)' })
  @ApiResponse({ status: 201, description: 'Depósito simulado exitoso.' })
  simulateDeposit(@Request() req, @Body() createDepositDto: CreateDepositDto) {
    return this.walletService.simulateDeposit(req.user.userId, createDepositDto.amount);
  }
}
