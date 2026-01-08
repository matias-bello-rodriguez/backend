import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Publication } from '../../entities/Publication.entity';
import { PublicationLike } from '../../entities/PublicationLike.entity';
import { PublicationPhoto } from '../../entities/PublicationPhoto.entity';
import { PublicationPaymentDetail } from '../../entities/PublicationPaymentDetail.entity';
import { Inspection, InspectionStatus } from '../../entities/Inspection.entity';
import { SolicitudInspeccion, SolicitudEstado } from '../../entities/SolicitudInspeccion.entity';
import { Valor } from '../../entities/Valor.entity';
import { User, UserRole } from '../../entities/User.entity';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { UpdatePublicationDto } from './dto/update-publication.dto';
import { FilterPublicationDto } from './dto/filter-publication.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../entities/Notification.entity';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectRepository(Publication)
    private publicationsRepository: Repository<Publication>,
    @InjectRepository(PublicationLike)
    private likesRepository: Repository<PublicationLike>,
    @InjectRepository(PublicationPhoto)
    private photosRepository: Repository<PublicationPhoto>,
    @InjectRepository(PublicationPaymentDetail)
    private paymentDetailRepository: Repository<PublicationPaymentDetail>,
    @InjectRepository(Inspection)
    private inspectionRepository: Repository<Inspection>,
    @InjectRepository(SolicitudInspeccion)
    private solicitudInspeccionRepository: Repository<SolicitudInspeccion>,
    @InjectRepository(Valor)
    private valoresRepository: Repository<Valor>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createPublicationDto: CreatePublicationDto) {
    const { fotos, paymentId, ...publicationData } = createPublicationDto;
    const publication =
      this.publicationsRepository.create(publicationData);
    const savedPublication = await this.publicationsRepository.save(publication);

    // 📸 PERMITIR PUBLICACIONES SIN FOTOS (PROVISIONAL)
    // Si no hay fotos, crear una foto placeholder de Cloudinary
    let photosToSave = [];
    if (fotos && fotos.length > 0) {
      photosToSave = fotos.map((url) =>
        this.photosRepository.create({
          publicacionId: savedPublication.id,
          url,
        }),
      );
    } else {
      // Generar URL placeholder provisional de Cloudinary
      const placeholderUrl = `https://res.cloudinary.com/dyoisrbts/image/upload/w_400,h_300,c_fill/v1/autobox/placeholder_${savedPublication.id}`;
      photosToSave = [
        this.photosRepository.create({
          publicacionId: savedPublication.id,
          url: placeholderUrl,
        }),
      ];
    }
    await this.photosRepository.save(photosToSave);

    if (paymentId) {
      // Calculate amount based on service type (inferred from status)
      // If status is 'Publicada', it's a raw publish (only publication fee)
      // If status is 'Pendiente', it's publish + inspection (publication + inspection fee)
      
      const publicationPrice = await this.valoresRepository.findOne({ where: { nombre: 'publicacion' } });
      
      // Always use the publication price for the publication payment detail
      // The inspection payment detail will be handled by the inspection service
      const monto = publicationPrice ? publicationPrice.precio : 0;

      const paymentDetail = this.paymentDetailRepository.create({
        publicacionId: savedPublication.id,
        pagoId: paymentId,
        monto: monto,
      });
      await this.paymentDetailRepository.save(paymentDetail);
    }

    // Notify Admins
    // Fetch vehicle info for better notification
    const fullPublication = await this.publicationsRepository.findOne({
      where: { id: savedPublication.id },
      relations: ['vehiculo']
    });
    
    const patente = fullPublication?.vehiculo?.patente || 'Sin patente';

    await this.notificationsService.notifyAdmins(
      'Nueva Publicación',
      `Se ha creado una nueva publicación para el vehículo ${patente}`,
      { type: 'publication', id: savedPublication.id },
      [NotificationType.CREAR_PUB]
    );

    return savedPublication;
  }

  async findAll(filters: FilterPublicationDto = {}) {
    const qb = this.publicationsRepository.createQueryBuilder('publication');

    // Join relations
    qb.leftJoinAndSelect('publication.vehiculo', 'vehicle');
    qb.leftJoinAndSelect('publication.vendedor', 'user');
    qb.leftJoinAndSelect('publication.fotos', 'fotos');

    // Exclude deactivated publications from public view
    qb.andWhere('publication.estado != :desactivada', { desactivada: 'Desactivada' });

    // 1. General Text Search (Brand or Model)
    if (filters.search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('vehicle.marca LIKE :search', { search: `%${filters.search}%` })
            .orWhere('vehicle.modelo LIKE :search', { search: `%${filters.search}%` });
        }),
      );
    }

    // 2. Specific Filters
    if (filters.marca) {
      qb.andWhere('vehicle.marca = :marca', { marca: filters.marca });
    }

    if (filters.modelo) {
      qb.andWhere('vehicle.modelo = :modelo', { modelo: filters.modelo });
    }

    if (filters.minPrice) {
      qb.andWhere('publication.valor >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice) {
      qb.andWhere('publication.valor <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.minYear) {
      qb.andWhere('vehicle.anio >= :minYear', { minYear: filters.minYear });
    }

    if (filters.maxYear) {
      qb.andWhere('vehicle.anio <= :maxYear', { maxYear: filters.maxYear });
    }

    if (filters.region) {
      qb.andWhere('vehicle.region = :region', { region: filters.region });
    }

    if (filters.comuna) {
      qb.andWhere('vehicle.comuna = :comuna', { comuna: filters.comuna });
    }

    if (filters.transmision) {
      qb.andWhere('vehicle.transmision = :transmision', { transmision: filters.transmision });
    }

    if (filters.combustible) {
      qb.andWhere('vehicle.tipoCombustible = :combustible', { combustible: filters.combustible });
    }

    // Order by creation date descending
    qb.orderBy('publication.fechaCreacion', 'DESC');

    // Pagination
    if (filters.limit) {
      qb.take(filters.limit);
    }
    
    if (filters.offset) {
      qb.skip(filters.offset);
    }

    return await qb.getMany();
  }

  async findOne(id: string) {
    const publication = await this.publicationsRepository.findOne({
      where: { id },
      relations: ['vehiculo', 'vendedor'],
    });
    if (!publication) {
      throw new NotFoundException(`Publication with ID ${id} not found`);
    }
    return publication;
  }

  async update(id: string, updatePublicationDto: UpdatePublicationDto) {
    const publication = await this.findOne(id);
    Object.assign(publication, updatePublicationDto);
    return this.publicationsRepository.save(publication);
  }

  async deactivatePublication(id: string, userId: string) {
    const publication = await this.publicationsRepository.findOne({
      where: { id },
      relations: ['vehiculo', 'vendedor'],
    });

    if (!publication) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Verify ownership: check if the user owns the vehicle
    if (publication.vendedorId !== userId) {
      throw new Error('No tienes permiso para desactivar esta publicación');
    }

    // Check for confirmed inspections
    const confirmedInspections = await this.inspectionRepository.find({
      where: {
        publicacionId: id,
        estado_insp: InspectionStatus.CONFIRMADA,
      },
    });

    if (confirmedInspections.length > 0) {
      const count = confirmedInspections.length;
      const message = `Hay ${count} inspecci${count > 1 ? 'ones' : 'ón'} asociada${count > 1 ? 's' : ''} a la publicación, esta no puede ser eliminada`;
      throw new Error(message);
    }

    // Find pending inspection requests (solicitanteId = null) for this publication
    const pendingRequests = await this.solicitudInspeccionRepository.find({
      where: {
        publicacionId: id,
        estado: SolicitudEstado.PENDIENTE,
      },
      relations: ['mecanico'],
    });

    // Reject pending requests and notify mechanics
    for (const request of pendingRequests) {
      request.estado = SolicitudEstado.RECHAZADA;
      request.fechaRespuesta = new Date();
      await this.solicitudInspeccionRepository.save(request);

      // Notify mechanic that owner deleted the publication
      if (request.mecanico) {
        await this.notificationsService.create({
          userId: request.mecanico.id,
          title: 'Publicación Eliminada',
          message: `El dueño del vehículo ha eliminado la publicación del sistema`,
          type: NotificationType.SOLICITAR_MEC,
          relatedId: request.id,
        });
      }
    }

    // Set status to Desactivada
    publication.estado = 'Desactivada' as any;
    await this.publicationsRepository.save(publication);

    // Get vendor
    const vendor = publication.vendedor || (await this.userRepository.findOne({ where: { id: publication.vendedorId } }));

    // Get all admins
    const admins = await this.userRepository.find({
      where: { rol: UserRole.ADMINISTRADOR },
    });

    // Send notification to admin (not_desactivar_pub_admin)
    for (const admin of admins) {
      await this.notificationsService.create({
        userId: admin.id,
        title: 'Publicación Desactivada',
        message: `La publicación del vehículo ${publication.vehiculo?.patente} ha sido desactivada`,
        type: NotificationType.NOT_DESACTIVAR_PUB_ADMIN,
        relatedId: id,
      });
    }

    // Send notification to vendor (not_desactivar_pub_vend)
    if (vendor) {
      await this.notificationsService.create({
        userId: vendor.id,
        title: 'Publicación Desactivada',
        message: `Tu publicación del vehículo ${publication.vehiculo?.patente} ha sido desactivada`,
        type: NotificationType.NOT_DESACTIVAR_PUB_VEND,
        relatedId: id,
      });
    }

    return { success: true, message: 'Publicación desactivada exitosamente' };
  }

  async remove(id: string) {
    const publication = await this.findOne(id);
    return this.publicationsRepository.remove(publication);
  }

  async likePublication(publicationId: string, userId: string) {
    if (!publicationId || !userId) {
      throw new Error('PublicationId and UserId are required');
    }

    // Check if publication exists
    const publication = await this.publicationsRepository.findOne({ where: { id: publicationId } });
    if (!publication) {
      throw new NotFoundException('Publicación no encontrada');
    }

    // Check if already liked
    const existingLike = await this.likesRepository.findOne({
      where: { publicacionId: publicationId, usuarioId: userId },
    });

    if (existingLike) {
      return { liked: true, message: 'Ya te gusta esta publicación' };
    }

    try {
      // Use raw query to avoid TypeORM entity mapping issues with composite keys
      await this.likesRepository.query(
        `INSERT INTO publicacion_usuario_like (publicacionId, usuarioId, fechaCreacion) VALUES (?, ?, NOW())`,
        [publicationId, userId]
      );
      return { liked: true, message: 'Me gusta añadido' };
    } catch (error) {
      console.error('Error saving like:', error);
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
         return { liked: true, message: 'Ya te gusta esta publicación' };
      }
      throw new InternalServerErrorException(`Error al dar like: ${error.message}`);
    }
  }

  async unlikePublication(publicationId: string, userId: string) {
    try {
      const result = await this.likesRepository.delete({ 
        publicacionId: publicationId, 
        usuarioId: userId 
      });

      if (result.affected === 0) {
        return { liked: false, message: 'No habías dado like a esta publicación' };
      }

      return { liked: false, message: 'Me gusta eliminado' };
    } catch (error) {
      console.error('Error removing like:', error);
      throw new InternalServerErrorException('No se pudo quitar el like');
    }
  }

  async checkLike(publicationId: string, userId: string) {
    const count = await this.likesRepository.count({
      where: { publicacionId: publicationId, usuarioId: userId },
    });
    return { isLiked: count > 0 };
  }

  async getLikes(publicationId: string) {
    const likes = await this.likesRepository.find({
      where: { publicacionId: publicationId },
      relations: ['usuario'],
    });

    return {
      count: likes.length,
      users: likes.map((like) => ({
        id: like.usuario.id,
        primerNombre: like.usuario.primerNombre,
        primerApellido: like.usuario.primerApellido,
        foto_url: like.usuario.foto_url,
      })),
    };
  }

  async getUserLikedPublications(userId: string) {
    const likes = await this.likesRepository.find({
      where: { usuarioId: userId },
      relations: ['publicacion', 'publicacion.vehiculo', 'publicacion.vendedor', 'publicacion.fotos'],
      order: { fechaCreacion: 'DESC' },
    });

    return likes.map((like) => like.publicacion);
  }

  /**
   * Returns the user's favorite publications mapped to the vehicle shape
   * expected by mobile UI (includes images, price/valor, videoUrl, etc.)
   */
  async getUserFavoritesVehicles(userId: string) {
    const likes = await this.likesRepository.find({
      where: { usuarioId: userId },
      relations: ['publicacion', 'publicacion.vehiculo', 'publicacion.vendedor', 'publicacion.fotos'],
      order: { fechaCreacion: 'DESC' },
    });

    return likes.map((like) => {
      const pub = like.publicacion;
      const veh = pub?.vehiculo;
      return {
        ...(veh || {}),
        publicationId: pub?.id,
        images: (pub?.fotos || []).map((f) => f.url),
        valor: pub?.valor ?? (veh as any)?.valor,
        price: pub?.valor ?? (veh as any)?.valor,
        videoUrl: (pub as any)?.videoUrl,
        marca: veh?.marca,
        modelo: veh?.modelo,
        anio: veh?.anio,
        kilometraje: veh?.kilometraje,
        comuna: (veh as any)?.comuna,
        region: (veh as any)?.region,
        transmision: veh?.transmision,
        tipoCombustible: (veh as any)?.tipoCombustible,
        user: pub?.vendedor,
        estado: pub?.estado,
      };
    });
  }

  /**
   * Check if a vehicle plate is available for publication
   * Returns whether the plate can be used for a new publication
   */
  async checkPlateAvailability(plate: string) {
    const existingPublication = await this.publicationsRepository
      .createQueryBuilder('publication')
      .leftJoinAndSelect('publication.vehiculo', 'vehicle')
      .where('vehicle.patente = :plate', { plate: plate.toUpperCase() })
      .andWhere('publication.estado IN (:...estados)', { estados: ['Pendiente', 'Publicada'] })
      .getOne();

    return {
      available: !existingPublication,
      message: existingPublication 
        ? 'Esta patente ya tiene una publicación activa'
        : 'Patente disponible para publicar',
    };
  }
}
