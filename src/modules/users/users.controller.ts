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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../../entities/User.entity';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear usuario (Admin)' })
  @ApiResponse({ status: 201, description: 'Usuario creado.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  findOne(@Request() req, @Param('id') id: string) {
    if (req.user.rol !== UserRole.ADMINISTRADOR && req.user.id !== id) {
      throw new ForbiddenException('No tienes permiso para ver este usuario');
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar usuario' })
  update(@Request() req, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    if (req.user.rol !== UserRole.ADMINISTRADOR && req.user.id !== id) {
      throw new ForbiddenException('No tienes permiso para actualizar este usuario');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar usuario' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/push-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar push token del usuario' })
  @ApiResponse({ status: 200, description: 'Push token actualizado.' })
  async updatePushToken(
    @Param('id') id: string,
    @Body('pushToken') pushToken: string,
  ) {
    return this.usersService.updatePushToken(id, pushToken);
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Obtener usuarios por rol' })
  @ApiResponse({ status: 200, description: 'Usuarios encontrados.' })
  findByRole(@Param('role') role: string) {
    return this.usersService.findByRole(role);
  }

  @Get('mechanics/active')
  @ApiOperation({ summary: 'Obtener mecánicos activos' })
  @ApiResponse({ status: 200, description: 'Lista de mecánicos activos.' })
  findActiveMechanics() {
    return this.usersService.findActiveMechanics();
  }

  @Get('admins/list')
  @ApiOperation({ summary: 'Obtener lista de administradores' })
  @ApiResponse({ status: 200, description: 'Lista de administradores.' })
  findAdmins() {
    return this.usersService.findByRole('Administrador');
  }

  @Post(':userId/promote/mechanic')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Promover usuario a mecánico' })
  @ApiResponse({ status: 200, description: 'Usuario promovido a mecánico.' })
  promoteToMechanic(@Param('userId') userId: string) {
    return this.usersService.updateRole(userId, 'Mecánico');
  }

  @Post(':userId/promote/admin')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Promover usuario a administrador' })
  @ApiResponse({ status: 200, description: 'Usuario promovido a administrador.' })
  promoteToAdmin(@Param('userId') userId: string) {
    return this.usersService.updateRole(userId, 'Administrador');
  }

  @Post(':userId/demote')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Degradar usuario a Usuario normal' })
  @ApiResponse({ status: 200, description: 'Usuario degradado.' })
  demoteUser(@Param('userId') userId: string) {
    return this.usersService.updateRole(userId, 'Usuario');
  }

  @Get('stats/roles')
  @ApiOperation({ summary: 'Obtener estadísticas de roles' })
  @ApiResponse({ status: 200, description: 'Estadísticas de roles.' })
  async getRoleStats() {
    return this.usersService.getRoleStats();
  }

  @Get('validate-rut/:rut')
  @ApiOperation({ summary: 'Validar existencia de RUT (API Externa)' })
  async validateRut(@Param('rut') rut: string) {
    return this.usersService.validateRutExistence(rut);
  }
}
