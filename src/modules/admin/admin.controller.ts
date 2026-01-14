import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/User.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMINISTRADOR)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
  ) {}

  @Post('mechanics')
  @ApiOperation({ summary: 'Crear nuevo mecánico' })
  createMechanic(@Body() body: any) {
    const createUserDto: CreateUserDto = {
      rut: body.rut,
      primerNombre: body.firstName,
      primerApellido: body.lastName,
      email: body.email,
      telefono: body.phone,
      password: body.password,
      rol: UserRole.MECANICO,
      foto_url: body.profilePhoto,
    };
    return this.usersService.create(createUserDto);
  }

  @Get('mechanics')
  @ApiOperation({ summary: 'Obtener lista de mecánicos' })
  getMechanics(
    @Query('search') search?: string,
    @Query('date') date?: string,
    @Query('time') time?: string,
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getMechanics(
      search,
      date,
      time,
      status,
      sortBy,
      order,
      limit,
      offset,
    );
  }

  @Get('mechanics/:id')
  @ApiOperation({ summary: 'Obtener mecánico por ID' })
  getMechanicById(@Param('id') id: string) {
    return this.adminService.getMechanicById(id);
  }

  @Patch('mechanics/:id')
  @ApiOperation({ summary: 'Actualizar mecánico' })
  updateMechanic(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateMechanic(id, body);
  }

  @Get('mechanics/:id/schedule')
  @ApiOperation({ summary: 'Obtener horario de mecánico' })
  getMechanicSchedule(@Param('id') id: string) {
    return this.adminService.getMechanicSchedule(id);
  }

  @Put('mechanics/:id/schedule')
  @ApiOperation({ summary: 'Actualizar horario de mecánico' })
  updateMechanicSchedule(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateMechanicSchedule(id, body.schedules);
  }

  @Get('sedes/:id/schedule')
  @ApiOperation({ summary: 'Obtener horario de sede' })
  getSedeSchedule(@Param('id') id: string) {
    return this.adminService.getSedeSchedule(parseInt(id, 10));
  }

  @Put('sedes/:id/schedule')
  @ApiOperation({ summary: 'Actualizar horario de sede' })
  updateSedeSchedule(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateSedeSchedule(parseInt(id, 10), body.schedules);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Obtener configuración global' })
  getGlobalSettings() {
    return this.adminService.getGlobalSettings();
  }

  @Put('settings')
  @ApiOperation({ summary: 'Actualizar configuración global' })
  updateGlobalSettings(@Body() body: any) {
    return this.adminService.updateGlobalSettings(body);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('activity')
  @ApiOperation({ summary: 'Obtener actividad reciente' })
  getActivity(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getRecentActivity(limitNum);
  }

  @Get('stats/users')
  @ApiOperation({ summary: 'Estadísticas de usuarios' })
  getUsersStats() {
    return this.adminService.getUsersStats();
  }

  @Get('stats/inspections')
  @ApiOperation({ summary: 'Estadísticas de inspecciones' })
  getInspectionsStats() {
    return this.adminService.getInspectionsStats();
  }

  @Get('stats/payments')
  @ApiOperation({ summary: 'Estadísticas de pagos' })
  getPaymentsStats() {
    return this.adminService.getPaymentsStats();
  }

  @Get('publications')
  @ApiOperation({ summary: 'Obtener lista de publicaciones' })
  getPublications(
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getAllPublications(status, limit, offset);
  }

  @Put('publications/:id/status')
  @ApiOperation({ summary: 'Actualizar estado de publicación' })
  updatePublicationStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.adminService.updatePublicationStatus(id, body.status);
  }

  @Delete('publications/:id')
  @ApiOperation({ summary: 'Eliminar publicación' })
  deletePublication(@Param('id') id: string) {
    return this.adminService.deletePublication(id);
  }

  @Get('mechanics/:id/debt')
  @ApiOperation({ summary: 'Obtener deuda del mecánico' })
  async getMechanicDebt(@Param('id') id: string) {
    return this.adminService.getMechanicDebt(id);
  }

  @Post('mechanics/:id/pay')
  @ApiOperation({ summary: 'Registrar pago a mecánico' })
  async registerPayment(
    @Param('id') id: string,
    @Body() body: { amount: number; receiptUrl: string; inspectionIds: string[] }
  ) {
    return this.adminService.registerMechanicPayment(id, body.amount, body.receiptUrl, body.inspectionIds);
  }
}
