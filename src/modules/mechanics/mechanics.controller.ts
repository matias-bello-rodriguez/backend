import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MechanicsService } from './mechanics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../../entities/User.entity';

@ApiTags('Mechanics')
@Controller('mechanics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los mecánicos' })
  findAll(@Query('active') active?: string) {
    if (active === 'true') {
      return this.mechanicsService.findActive();
    }
    return this.mechanicsService.findAll();
  }

  @Get('available-slots')
  @ApiOperation({ summary: 'Obtener horarios disponibles para una fecha' })
  getAvailableSlots(
    @Query('date') date: string,
    @Query('location') location?: string,
  ) {
    return this.mechanicsService.getAvailableSlots(date, location);
  }

  @Get('rut/:rut')
  @ApiOperation({ summary: 'Buscar mecánico por RUT' })
  findByRut(@Param('rut') rut: string) {
    return this.mechanicsService.findByRut(rut);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Buscar mecánico por email' })
  findByEmail(@Param('email') email: string) {
    return this.mechanicsService.findByEmail(email);
  }

  @Get('sede-schedule/:id')
  @ApiOperation({ summary: 'Obtener horario de sede' })
  getSedeSchedule(@Param('id') id: string) {
    return this.mechanicsService.getSedeSchedule(parseInt(id, 10));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener mecánico por ID' })
  findOne(@Param('id') id: string) {
    return this.mechanicsService.findOne(id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Obtener estadísticas del mecánico' })
  getStatistics(@Request() req, @Param('id') id: string) {
    if (req.user.rol !== UserRole.ADMINISTRADOR && req.user.id !== id) {
      throw new ForbiddenException('No tienes permiso para ver las estadísticas de otro mecánico');
    }
    return this.mechanicsService.getStatistics(id);
  }

  @Get(':id/payouts')
  @ApiOperation({ summary: 'Obtener pagos (sueldos) del mecánico' })
  getPayouts(@Request() req, @Param('id') id: string) {
    if (req.user.rol !== UserRole.ADMINISTRADOR && req.user.id !== id) {
      throw new ForbiddenException('No tienes permiso para ver los pagos de otro mecánico');
    }
    return this.mechanicsService.getPayouts(id);
  }

  @Get(':id/inspections')
  @ApiOperation({ summary: 'Obtener inspecciones del mecánico' })
  getInspections(@Request() req, @Param('id') id: string) {
    if (req.user.rol !== UserRole.ADMINISTRADOR && req.user.id !== id) {
      throw new ForbiddenException('No tienes permiso para ver las inspecciones de otro mecánico');
    }
    return this.mechanicsService.getInspections(id);
  }

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Obtener perfil de mecánico por ID de usuario' })
  findByUser(@Param('userId') userId: string) {
    return this.mechanicsService.findByUser(userId);
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Obtener horario del mecánico' })
  getSchedule(@Param('id') id: string) {
    return this.mechanicsService.getSchedule(id);
  }

  @Put(':id/schedule')
  @ApiOperation({ summary: 'Actualizar horario del mecánico' })
  updateSchedule(@Request() req, @Param('id') id: string, @Body() body: any) {
    if (req.user.rol !== UserRole.ADMINISTRADOR && req.user.id !== id) {
      throw new ForbiddenException('No tienes permiso para actualizar el horario de otro mecánico');
    }
    return this.mechanicsService.updateSchedule(id, body.schedules);
  }
}
