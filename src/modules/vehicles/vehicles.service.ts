import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Vehicle } from '../../entities/Vehicle.entity';
import { PublicationLike } from '../../entities/PublicationLike.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  private readonly GETAPI_URL: string;
  private readonly GETAPI_KEY: string;

  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(PublicationLike)
    private likesRepository: Repository<PublicationLike>,
    private configService: ConfigService,
  ) {
    this.GETAPI_URL = this.configService.get<string>('GETAPI_URL') || 'https://chile.getapi.cl/v1/vehicles/plate';
    this.GETAPI_KEY = this.configService.get<string>('GETAPI_KEY') || '';
  }

  create(createVehicleDto: CreateVehicleDto) {
    const vehicle = this.vehiclesRepository.create(createVehicleDto);
    return this.vehiclesRepository.save(vehicle);
  }

  async findAll() {
    const vehicles = await this.vehiclesRepository.find({ 
      relations: ['user', 'publications', 'publications.fotos'] 
    });

    return vehicles.map(v => {
      const activePub = v.publications?.find(p => p.estado === 'Publicada' || p.estado === 'Pendiente');
      
      const images = activePub?.fotos?.map(f => f.url) || [];
      return { 
        ...v, 
        images,
        valor: activePub?.valor,
        estado: activePub?.estado,
        descripcion: activePub?.descripcion,
        publicationId: activePub?.id
      };
    });
  }

  async findOne(id: string) {
    console.log(`Finding vehicle ${id}...`);
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id },
      relations: ['user', 'publications', 'publications.fotos'],
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    const activePub = vehicle.publications?.find(p => p.estado === 'Publicada' || p.estado === 'Pendiente');
    console.log(`Vehicle ${id} activePub:`, activePub ? activePub.id : 'None');
    if (activePub) console.log(`Vehicle ${id} photos:`, activePub.fotos);

    const images = activePub?.fotos?.map(f => f.url) || [];

    return { 
      ...vehicle, 
      images,
      valor: activePub?.valor,
      estado: activePub?.estado,
      descripcion: activePub?.descripcion,
      publicationId: activePub?.id
    };
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    const vehicle = await this.findOne(id);
    Object.assign(vehicle, updateVehicleDto);
    return this.vehiclesRepository.save(vehicle);
  }

  async remove(id: string) {
    const vehicle = await this.findOne(id);
    return this.vehiclesRepository.remove(vehicle);
  }

  async search(query: string, sortBy?: string, sortOrder?: 'ASC' | 'DESC') {
    const qb = this.vehiclesRepository
      .createQueryBuilder('vehicle')
      .leftJoinAndSelect('vehicle.user', 'user')
      .leftJoinAndSelect('vehicle.publications', 'publication')
      .leftJoinAndSelect('publication.fotos', 'fotos')
      .where('vehicle.marca LIKE :query', { query: `%${query}%` })
      .orWhere('vehicle.modelo LIKE :query', { query: `%${query}%` })
      .orWhere('vehicle.patente LIKE :query', { query: `%${query}%` });

    if (sortBy) {
      qb.orderBy(`vehicle.${sortBy}`, sortOrder || 'DESC');
    } else {
      qb.orderBy('vehicle.fechaCreacion', 'DESC');
    }

    const vehicles = await qb.getMany();
    
    // Map photos to vehicle object for frontend compatibility
    return vehicles.map(v => {
      const activePub = v.publications?.find(p => p.estado === 'Publicada' || p.estado === 'Pendiente');
      const images = activePub?.fotos?.map(f => f.url) || [];
      return { ...v, images };
    });
  }

  async findByOwner(ownerId: string) {
    const vehicles = await this.vehiclesRepository.find({
      where: { userId: ownerId },
      relations: ['user', 'publications', 'publications.fotos'],
    });

    return vehicles.map(v => {
      const activePub = v.publications?.find(p => p.estado === 'Publicada' || p.estado === 'Pendiente');
      
      const images = activePub?.fotos?.map(f => f.url) || [];
      return { 
        ...v, 
        images,
        valor: activePub?.valor,
        estado: activePub?.estado,
        descripcion: activePub?.descripcion
      };
    });
  }

  async getLikedVehicles(userId: string) {
    const likes = await this.likesRepository.find({
      where: { usuarioId: userId },
      relations: ['publicacion', 'publicacion.vehiculo', 'publicacion.vehiculo.user', 'publicacion.fotos'],
      order: { fechaCreacion: 'DESC' },
    });

    return likes.map(like => {
      const pub = like.publicacion;
      const vehicle = pub.vehiculo;
      
      if (!vehicle) return null;

      // Map publication data to vehicle
      const images = pub.fotos?.map(f => f.url) || [];
      
      return {
        ...vehicle,
        images,
        valor: pub.valor,
        estado: pub.estado,
        descripcion: pub.descripcion,
      };
    }).filter(v => v !== null);
  }

  async validatePlate(patente: string): Promise<{ exists: boolean; vehicle?: any; apiData?: any }> {
    // Primero verificar si existe en nuestra BD
    const localVehicle = await this.vehiclesRepository.findOne({
      where: { patente: patente.toUpperCase() },
      relations: ['user'],
    });

    if (localVehicle) {
      return {
        exists: true,
        vehicle: {
          id: localVehicle.id,
          patente: localVehicle.patente,
          marca: localVehicle.marca,
          modelo: localVehicle.modelo,
          anio: localVehicle.anio,
        },
      };
    }

    // Si no existe localmente, consultar GetAPI Chile
    try {
      console.log('🔍 Consultando GetAPI para patente:', patente);
      const response = await fetch(`${this.GETAPI_URL}/${patente.toUpperCase()}`, {
        headers: {
          'Authorization': `Bearer ${this.GETAPI_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('⚠️ GetAPI response not OK:', response.status);
        return { exists: false };
      }

      const data = await response.json();
      console.log('✅ Datos obtenidos de GetAPI:', data);

      // GetAPI retorna información del vehículo
      return {
        exists: false, // No existe en nuestra BD
        apiData: {
          patente: data.plate || patente.toUpperCase(),
          marca: data.brand || data.make,
          modelo: data.model,
          anio: data.year,
          color: data.color,
          tipo: data.type || data.vehicle_type,
          combustible: data.fuel_type,
          // Otros campos que GetAPI pueda retornar
          vin: data.vin,
          numeroMotor: data.engine_number,
          numeroChasis: data.chassis_number,
        },
      };
    } catch (error) {
      console.error('❌ Error consultando GetAPI:', error);
      // Si falla la API, solo retornar que no existe localmente
      return { exists: false };
    }
  }

  async getVehicleDataByPlate(
    plate: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(
        `🚗 [BACKEND] Consultando API externa para patente: ${plate}`,
      );

      const response = await fetch(`${this.GETAPI_URL}/${plate.toUpperCase()}`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-api-key': this.GETAPI_KEY,
        },
      });

      console.log(`📡 [BACKEND] Response status: ${response.status}`);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`❌ [BACKEND] Error HTTP ${response.status}`);
        console.error(`📄 [BACKEND] Error body:`, errorBody);
        return {
          success: false,
          error: 'No se encontraron datos para esta patente',
        };
      }

      const apiResponse = await response.json();
      console.log(
        '📦 [BACKEND] Respuesta completa:',
        JSON.stringify(apiResponse, null, 2),
      );

      // Verificar estructura de la respuesta
      if (!apiResponse.success || !apiResponse.data) {
        console.error('❌ [BACKEND] API retornó success=false o sin data');
        return {
          success: false,
          error: 'No se encontraron datos para esta patente',
        };
      }

      const vehicleData = apiResponse.data;

      const result = {
        success: true,
        data: {
          plate: plate.toUpperCase(),
          brand: vehicleData.model?.brand?.name || '',
          model: vehicleData.model?.name || '',
          year: vehicleData.year || null,
          version: vehicleData.version || '',
          color: vehicleData.color || '',
          fuelType: vehicleData.fuelType || '',
          transmission: vehicleData.transmission || '',
          doors: vehicleData.doors || null,
          vehicleType: vehicleData.type || '',
          vin: vehicleData.vinNumber || vehicleData.vin || '',
          engineNumber: vehicleData.engineNumber || '',
          engine: vehicleData.engine || '',
          monthRT: vehicleData.monthRT || '',
          kilometers: vehicleData.mileage ? String(vehicleData.mileage) : '',
        },
      };

      console.log('✅ [BACKEND] Datos procesados:', result);
      return result;
    } catch (error) {
      console.error('❌ [BACKEND] Error consultando API externa:', error);
      return {
        success: false,
        error: 'Error al consultar datos del vehículo',
      };
    }
  }

  async getModels(marca?: string): Promise<string[]> {
    const qb = this.vehiclesRepository
      .createQueryBuilder('vehicle')
      .select('DISTINCT vehicle.modelo', 'modelo');

    if (marca) {
      qb.where('vehicle.marca = :marca', { marca });
    }

    const results = await qb.getRawMany();
    return results.map((r) => r.modelo).filter(Boolean);
  }

  async getYears(): Promise<number[]> {
    const results = await this.vehiclesRepository
      .createQueryBuilder('vehicle')
      .select('DISTINCT vehicle.anio', 'anio')
      .orderBy('vehicle.anio', 'DESC')
      .getRawMany();

    return results.map((r) => r.anio).filter(Boolean);
  }
}
