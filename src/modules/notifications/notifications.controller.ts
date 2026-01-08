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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationType } from '../../entities/Notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('notify-admins')
  @ApiOperation({ summary: 'Enviar notificación a todos los administradores' })
  @ApiResponse({ status: 201, description: 'Notificación enviada a los administradores.' })
  async notifyAdmins(@Body() body: { title: string; message: string; metadata?: any; types?: NotificationType[] }) {
    await this.notificationsService.notifyAdmins(body.title, body.message, body.metadata, body.types);
    return { message: 'Admins notified' };
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva notificación' })
  @ApiResponse({ status: 201, description: 'Notificación creada exitosamente.' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las notificaciones del usuario' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de notificaciones' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones.' })
  findAll(@Request() req, @Query('limit') limit?: number) {
    return this.notificationsService.findAll(req.user.userId, limit || 50);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Obtener notificaciones no leídas' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones no leídas.' })
  findUnread(@Request() req) {
    return this.notificationsService.findUnread(req.user.userId);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Obtener cantidad de notificaciones no leídas' })
  @ApiResponse({ status: 200, description: 'Cantidad de notificaciones no leídas.' })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.userId);
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una notificación por ID' })
  @ApiResponse({ status: 200, description: 'Notificación encontrada.' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.notificationsService.findOne(id, req.user.userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída.' })
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Todas las notificaciones marcadas como leídas.' })
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.userId);
    return { message: 'All notifications marked as read' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una notificación' })
  @ApiResponse({ status: 200, description: 'Notificación actualizada.' })
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto, @Request() req) {
    return this.notificationsService.update(id, req.user.userId, updateNotificationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una notificación' })
  @ApiResponse({ status: 200, description: 'Notificación eliminada.' })
  async remove(@Param('id') id: string, @Request() req) {
    await this.notificationsService.remove(id, req.user.userId);
    return { message: 'Notification deleted successfully' };
  }
}
