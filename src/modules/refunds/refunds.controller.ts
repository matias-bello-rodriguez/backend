import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RefundsService } from './refunds.service';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateRefundStatusDto } from './dto/update-refund-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/User.entity';

@ApiTags('Refunds')
@Controller('refunds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post('request')
  @ApiOperation({ summary: 'Solicitar reembolso (Usuario)' })
  createRequest(@Body() createRefundRequestDto: CreateRefundRequestDto, @Request() req) {
    return this.refundsService.create(createRefundRequestDto, req.user.id);
  }

  @Post('bank-account')
  @ApiOperation({ summary: 'Guardar datos bancarios (Usuario)' })
  saveBankAccount(@Body() createBankAccountDto: CreateBankAccountDto, @Request() req) {
    return this.refundsService.saveBankAccount(createBankAccountDto, req.user.id);
  }

  @Get('bank-account')
  @ApiOperation({ summary: 'Obtener mis datos bancarios' })
  getMyBankAccount(@Request() req) {
    return this.refundsService.getBankAccount(req.user.id);
  }

  @Get('requests')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar solicitudes de reembolso (Admin)' })
  findAll() {
    return this.refundsService.findAll();
  }

  @Patch('requests/:id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar estado de solicitud (Admin)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateRefundStatusDto) {
    return this.refundsService.updateStatus(id, dto);
  }
}
