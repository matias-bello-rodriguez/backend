import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/User.entity';

import { SolicitudEstado } from '../../entities/SolicitudInspeccion.entity';

@ApiTags('Inspections')
@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post('requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear solicitud de asignación' })
  createRequest(@Body() body: { mechanicId: string; inspectionId: string; message?: string }) {
    return this.inspectionsService.createSolicitud(body.mechanicId, body.inspectionId, body.message);
  }

  @Get('requests/mechanic')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.MECANICO)
  @ApiOperation({ summary: 'Obtener solicitudes del mecánico' })
  getMechanicRequests(@Request() req) {
    return this.inspectionsService.getSolicitudesByMechanic(req.user.id);
  }

  @Get('requests/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  getRequestById(@Param('id') id: string) {
    return this.inspectionsService.getSolicitudById(id);
  }

  @Patch('requests/:id/respond')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.MECANICO)
  @ApiOperation({ summary: 'Responder a solicitud' })
  respondRequest(
    @Param('id') id: string,
    @Body('estado') estado: SolicitudEstado,
  ) {
    return this.inspectionsService.respondSolicitud(id, estado);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear inspección' })
  @ApiResponse({ status: 201, description: 'Inspección creada.' })
  create(@Request() req, @Body() createInspectionDto: CreateInspectionDto) {
    // Ensure solicitanteId is the authenticated user
    console.log('📝 [InspectionsController] Creating inspection for user:', req.user.id);
    console.log('📝 [InspectionsController] Body received:', JSON.stringify(createInspectionDto));
    
    // If solicitanteId is provided in body (including null), use it.
    // Only default to req.user.id if it is strictly undefined (missing from payload).
    if (createInspectionDto.solicitanteId === undefined) {
        createInspectionDto.solicitanteId = req.user.id;
    } else {
        console.log('📝 [InspectionsController] Using provided solicitanteId:', createInspectionDto.solicitanteId);
    }
    
    return this.inspectionsService.create(createInspectionDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar todas las inspecciones (Solo Admin)' })
  findAll() {
    return this.inspectionsService.findAll();
  }

  @Get('my-inspections')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener mis inspecciones solicitadas' })
  getMyInspections(
    @Request() req,
    @Query('order') order?: 'ASC' | 'DESC',
    @Query('sortBy') sortBy?: string,
  ) {
    console.log('🔍 [InspectionsController] getMyInspections - User:', req.user);
    return this.inspectionsService.getMyInspections(req.user.id, order, sortBy);
  }

  @Get('my-publications')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener inspecciones de mis publicaciones' })
  getMyPublicationsInspections(
    @Request() req,
    @Query('order') order?: 'ASC' | 'DESC',
    @Query('sortBy') sortBy?: string,
  ) {
    console.log('🔍 [InspectionsController] getMyPublicationsInspections - User:', req.user);
    return this.inspectionsService.getMyPublicationsInspections(req.user.id, order, sortBy);
  }

  @Get('mechanic/:mechanicId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener inspecciones por mecánico' })
  findByMechanic(@Request() req, @Param('mechanicId') mechanicId: string) {
    // Allow if user is Admin OR user is the mechanic
    if (req.user.rol !== UserRole.ADMINISTRADOR && req.user.id !== mechanicId) {
      throw new ForbiddenException('No tienes permiso para ver las inspecciones de otro mecánico');
    }
    return this.inspectionsService.findByMechanic(mechanicId);
  }

  @Get(':id/requests')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener solicitudes de una inspección' })
  getInspectionRequests(@Param('id') id: string) {
    return this.inspectionsService.getSolicitudesByInspection(id);
  }

  @Get('form/structure')
  @ApiOperation({ summary: 'Obtener estructura del formulario de inspección' })
  getFormStructure() {
    return this.inspectionsService.getInspectionForm();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener inspección por ID' })
  async findOne(@Request() req, @Param('id') id: string) {
    const inspection = await this.inspectionsService.findOne(id);
    if (!inspection) {
      return null;
    }
    
    // Check ownership or role
    // Admin can see all
    if (req.user.rol === UserRole.ADMINISTRADOR) {
      return inspection;
    }

    // Requester can see
    if (inspection.solicitanteId === req.user.id) {
      return inspection;
    }

    // Assigned Mechanic can see
    if (inspection.mecanicoId === req.user.id) {
      return inspection;
    }

    // Vehicle Owner (Seller) can see?
    // If inspection.publicacion.vendedorId === req.user.id
    // We need to ensure publicacion is loaded. findOne usually loads relations.
    if (inspection.publicacion && inspection.publicacion.vendedorId === req.user.id) {
      return inspection;
    }

    throw new ForbiddenException('No tienes permiso para ver esta inspección');
  }

  @Get('user/:userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener inspecciones por usuario' })
  findByUser(@Request() req, @Param('userId') userId: string) {
    // Allow if user is Admin OR user is the target user
    if (req.user.rol !== UserRole.ADMINISTRADOR && req.user.id !== userId) {
      throw new ForbiddenException('No tienes permiso para ver las inspecciones de otro usuario');
    }
    return this.inspectionsService.findByUser(userId);
  }

  @Get('publication/:publicationId')
  @ApiOperation({ summary: 'Obtener inspecciones por publicación' })
  findByPublication(@Param('publicationId') publicationId: string) {
    return this.inspectionsService.findByPublication(publicationId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar inspección' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateInspectionDto: UpdateInspectionDto,
  ) {
    // Check permissions
    const inspection = await this.inspectionsService.findOne(id);
    if (
      req.user.rol !== UserRole.ADMINISTRADOR && 
      inspection.solicitanteId !== req.user.id &&
      inspection.mecanicoId !== req.user.id
    ) {
       throw new ForbiddenException('No tienes permiso para actualizar esta inspección');
    }
    return this.inspectionsService.update(id, updateInspectionDto);
  }

  @Patch(':id/assign-mechanic')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Asignar mecánico a inspección' })
  assignMechanic(
    @Param('id') id: string,
    @Body('mechanicId') mechanicId: string,
  ) {
    return this.inspectionsService.assignMechanic(id, mechanicId);
  }

  @Post(':id/start')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Iniciar inspección' })
  async startInspection(@Request() req, @Param('id') id: string) {
    const inspection = await this.inspectionsService.findOne(id);
    if (req.user.rol !== UserRole.ADMINISTRADOR && inspection.mecanicoId !== req.user.id) {
      throw new ForbiddenException('Solo el mecánico asignado puede iniciar la inspección');
    }
    return this.inspectionsService.startInspection(id);
  }

  @Post(':id/complete')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Completar inspección' })
  async completeInspection(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateInspectionDto,
  ) {
    const inspection = await this.inspectionsService.findOne(id);
    if (req.user.rol !== UserRole.ADMINISTRADOR && inspection.mecanicoId !== req.user.id) {
      throw new ForbiddenException('Solo el mecánico asignado puede completar la inspección');
    }
    return this.inspectionsService.completeInspection(id, updateDto);
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancelar inspección (Vendedor o Mecánico)' })
  async cancelInspection(
    @Request() req, 
    @Param('id') id: string,
    @Body('reason') reason?: string
  ) {
    return this.inspectionsService.cancel(id, req.user.id, reason);
  }

  @Patch(':id/confirm-payment')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Confirmar pago de inspección' })
  confirmPayment(@Param('id') id: string) {
    return this.inspectionsService.confirmPayment(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar inspección' })
  async remove(@Request() req, @Param('id') id: string) {
    const inspection = await this.inspectionsService.findOne(id);
    if (req.user.rol !== UserRole.ADMINISTRADOR && inspection.solicitanteId !== req.user.id) {
      throw new ForbiddenException('No tienes permiso para eliminar esta inspección');
    }
    return this.inspectionsService.remove(id);
  }

  @Post(':id/rate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Calificar mecánico' })
  rateMechanic(
    @Request() req,
    @Param('id') id: string,
    @Body('rating') rating: number,
  ) {
    return this.inspectionsService.rateMechanic(id, req.user.id, rating);
  }
}
