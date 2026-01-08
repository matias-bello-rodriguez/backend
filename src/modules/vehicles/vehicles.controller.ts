import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear vehículo' })
  @ApiResponse({ status: 201, description: 'Vehículo creado.' })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los vehículos' })
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar vehículos' })
  @ApiQuery({ name: 'q', required: true, description: 'Término de búsqueda (patente, marca, modelo)' })
  search(@Query('q') query: string) {
    return this.vehiclesService.search(query);
  }

  @Get('validate-plate/:plate')
  @ApiOperation({ summary: 'Validar si una patente existe y obtener datos desde GetAPI' })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna si existe en BD local y datos de GetAPI si disponible',
  })
  validatePlate(@Param('plate') plate: string) {
    return this.vehiclesService.validatePlate(plate);
  }

  @Get('api-data/:plate')
  @ApiOperation({ summary: 'Obtener datos del vehículo desde GetAPI Chile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Datos del vehículo obtenidos desde la API de GetAPI',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No se encontró información para la patente',
  })
  async getVehicleDataByPlate(@Param('plate') plate: string) {
    console.log('🔍 [VehiclesController] getVehicleDataByPlate - Plate:', plate);
    const result = await this.vehiclesService.getVehicleDataByPlate(plate);
    
    if (!result.success) {
      console.error('❌ [VehiclesController] Failed to get vehicle data');
      throw new NotFoundException(result.error || 'No se encontraron datos para esta patente');
    }
    
    console.log('✅ [VehiclesController] Returning vehicle data:', result.data);
    return result.data;
  }

  @Get('models/:brand')
  @ApiOperation({ summary: 'Obtener lista de modelos por marca' })
  getModelsByBrand(@Param('brand') brand: string) {
    return this.vehiclesService.getModels(brand);
  }

  @Get('models/list')
  @ApiOperation({ summary: 'Obtener lista de modelos' })
  @ApiQuery({ name: 'marca', required: false, description: 'Filtrar por marca' })
  getModels(@Query('marca') marca?: string) {
    return this.vehiclesService.getModels(marca);
  }

  @Get('years/list')
  @ApiOperation({ summary: 'Obtener lista de años' })
  getYears() {
    return this.vehiclesService.getYears();
  }

  @Get('owner/:ownerId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener vehículos por propietario' })
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.vehiclesService.findByOwner(ownerId);
  }

  @Get('liked/user/:userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener vehículos favoritos del usuario' })
  getLikedVehicles(@Param('userId') userId: string) {
    return this.vehiclesService.getLikedVehicles(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener vehículo por ID' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar vehículo' })
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar vehículo' })
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
