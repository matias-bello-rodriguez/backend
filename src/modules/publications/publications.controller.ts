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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { FilterPublicationDto } from './dto/filter-publication.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/User.entity';

@ApiTags('Publications')
@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Post(':id/block')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Bloquear publicación por inapropiada (Admin)' })
  @ApiResponse({ status: 200, description: 'Publicación bloqueada y notificada.' })
  blockPublication(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.publicationsService.blockPublication(id, reason, req.user.id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear publicación' })
  @ApiResponse({ status: 201, description: 'Publicación creada.' })
  create(@Body() createPublicationDto: CreatePublicationDto) {
    return this.publicationsService.create(createPublicationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las publicaciones con filtros' })
  findAll(@Query() filters: FilterPublicationDto) {
    return this.publicationsService.findAll(filters);
  }

  @Get('favorites')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener vehículos favoritos del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos favoritos.' })
  getUserFavorites(@Request() req) {
    return this.publicationsService.getUserFavoritesVehicles(req.user.id);
  }

  @Get('check-plate/:plate')
  @ApiOperation({ summary: 'Verificar si una patente ya tiene una publicación activa' })
  @ApiResponse({ status: 200, description: 'Retorna si la patente está disponible.' })
  checkPlateAvailability(@Param('plate') plate: string) {
    return this.publicationsService.checkPlateAvailability(plate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener publicación por ID' })
  findOne(@Param('id') id: string) {
    return this.publicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar publicación' })
  update(
    @Param('id') id: string,
    @Body() updatePublicationDto: UpdatePublicationDto,
  ) {
    return this.publicationsService.update(id, updatePublicationDto);
  }

  @Patch(':id/deactivate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Desactivar publicación (solo dueño)' })
  @ApiResponse({ status: 200, description: 'Publicación desactivada.' })
  deactivatePublication(@Param('id') id: string, @Request() req) {
    return this.publicationsService.deactivatePublication(id, req.user.id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar publicación' })
  remove(@Param('id') id: string) {
    return this.publicationsService.remove(id);
  }

  @Post(':id/like')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Dar like a publicación' })
  likePublication(@Param('id') id: string, @Request() req) {
    return this.publicationsService.likePublication(id, req.user.id);
  }

  @Delete(':id/like')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Quitar like a publicación' })
  unlikePublication(@Param('id') id: string, @Request() req) {
    return this.publicationsService.unlikePublication(id, req.user.id);
  }

  @Get(':id/is-liked')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verificar si el usuario dio like' })
  checkLike(@Param('id') id: string, @Request() req) {
    return this.publicationsService.checkLike(id, req.user.id);
  }

  @Get(':id/likes')
  @ApiOperation({ summary: 'Obtener likes de publicación' })
  getLikes(@Param('id') id: string) {
    return this.publicationsService.getLikes(id);
  }

  @Get('user/:userId/liked')
  @ApiOperation({ summary: 'Obtener publicaciones que le gustan al usuario' })
  getUserLikedPublications(@Param('userId') userId: string) {
    return this.publicationsService.getUserLikedPublications(userId);
  }
}
