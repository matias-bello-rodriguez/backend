import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/User.entity';
import { Vehicle } from '../../entities/Vehicle.entity';
import { Publication, PublicationStatus } from '../../entities/Publication.entity';
import { Inspection, InspectionStatus } from '../../entities/Inspection.entity';
import { Payment, PaymentStatus } from '../../entities/Payment.entity';
import { UserSchedule } from '../../entities/UserSchedule.entity';
import { SedeSchedule } from '../../entities/SedeSchedule.entity';
import { SystemSetting } from '../../entities/SystemSetting.entity';
import { Valor } from '../../entities/Valor.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Publication)
    private publicationRepository: Repository<Publication>,
    @InjectRepository(Inspection)
    private inspectionRepository: Repository<Inspection>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(UserSchedule)
    private scheduleRepository: Repository<UserSchedule>,
    @InjectRepository(SedeSchedule)
    private sedeScheduleRepository: Repository<SedeSchedule>,
    @InjectRepository(SystemSetting)
    private systemSettingRepository: Repository<SystemSetting>,
    @InjectRepository(Valor)
    private valorRepository: Repository<Valor>,
  ) {}

  async getGlobalSettings() {
    const valores = await this.valorRepository.find();
    
    const inspectionPrice = valores.find(v => v.nombre === 'Inspección')?.precio || 40000;
    const publicationPrice = valores.find(v => v.nombre === 'Publicación')?.precio || 25000;

    return {
      pricing: {
        inspectionPrice,
        publicationPrice,
      },
    };
  }

  async updateGlobalSettings(settings: any) {
    console.log('Updating global settings:', JSON.stringify(settings, null, 2));
    try {
      // Update prices in Valor table
      if (settings.pricing) {
        const inspection = await this.valorRepository.findOne({ where: { nombre: 'Inspección' } });
        if (inspection) {
          console.log('Updating inspection price to:', settings.pricing.inspectionPrice);
          inspection.precio = settings.pricing.inspectionPrice;
          await this.valorRepository.save(inspection);
        } else {
          console.warn('Inspection valor not found');
        }

        const publication = await this.valorRepository.findOne({ where: { nombre: 'Publicación' } });
        if (publication) {
          console.log('Updating publication price to:', settings.pricing.publicationPrice);
          publication.precio = settings.pricing.publicationPrice;
          await this.valorRepository.save(publication);
        } else {
          console.warn('Publication valor not found');
        }
      }

      return settings;
    } catch (error) {
      console.error('Error updating global settings:', error);
      throw error;
    }
  }

  async getDashboardStats() {
    const [
      totalUsers,
      totalMechanics,
      totalVehicles,
      totalPublications,
      totalInspections,
      pendingInspections,
      completedInspections,
      totalRevenue,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { rol: UserRole.MECANICO } }),
      this.vehicleRepository.count(),
      this.publicationRepository.count(),
      this.inspectionRepository.count(),
      this.inspectionRepository.count({ where: { estado_insp: InspectionStatus.PENDIENTE } }),
      this.inspectionRepository.count({ where: { estado_insp: InspectionStatus.FINALIZADA } }),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.monto)', 'total')
        .where('payment.estado = :estado', { estado: PaymentStatus.COMPLETED })
        .getRawOne()
        .then((result) => result?.total || 0),
    ]);

    return {
      users: {
        total: totalUsers,
        mechanics: totalMechanics,
        regular: totalUsers - totalMechanics,
      },
      vehicles: totalVehicles,
      publications: totalPublications,
      inspections: {
        total: totalInspections,
        pending: pendingInspections,
        completed: completedInspections,
      },
      revenue: {
        total: totalRevenue,
      },
    };
  }

  async getRecentActivity(limit: number = 10) {
    const [recentUsers, recentInspections, recentPublications] = await Promise.all([
      this.userRepository.find({
        order: { fechaCreacion: 'DESC' },
        take: limit,
        select: ['id', 'primerNombre', 'primerApellido', 'email', 'rol', 'fechaCreacion'],
      }),
      this.inspectionRepository.find({
        order: { fechaCreacion: 'DESC' },
        take: limit,
        relations: ['solicitante', 'mecanico'],
      }),
      this.publicationRepository.find({
        order: { fechaCreacion: 'DESC' },
        take: limit,
        relations: ['vendedor', 'vehiculo'],
      }),
    ]);

    return {
      users: recentUsers,
      inspections: recentInspections,
      publications: recentPublications,
    };
  }

  async getUsersStats() {
    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.rol', 'rol')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.rol')
      .getRawMany();

    return {
      byRole: usersByRole,
    };
  }

  async getInspectionsStats() {
    const byStatus = await this.inspectionRepository
      .createQueryBuilder('inspection')
      .select('inspection.estado_insp', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('inspection.estado_insp')
      .getRawMany();

    return {
      byStatus,
    };
  }

  async getPaymentsStats() {
    const byStatus = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.estado', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.monto)', 'total')
      .groupBy('payment.estado')
      .getRawMany();

    const byMethod = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.metodoPago', 'method')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.monto)', 'total')
      .groupBy('payment.metodoPago')
      .getRawMany();

    return {
      byStatus,
      byMethod,
    };
  }

  async getMechanics(
    search?: string,
    date?: string,
    time?: string,
    status?: string,
    sortBy: string = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC',
    limit?: number,
    offset?: number,
  ) {
    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect(
        (subQuery) =>
          subQuery
            .select('inspection.mecanicoId', 'mecanicoId')
            .addSelect('COUNT(*)', 'completedCount')
            .from(Inspection, 'inspection')
            .where('inspection.estado_insp = :status', { status: InspectionStatus.FINALIZADA })
            .groupBy('inspection.mecanicoId'),
        'stats',
        'stats.mecanicoId = user.id',
      )
      .where('user.rol = :role', { role: UserRole.MECANICO });

    // Filtro de búsqueda
    if (search) {
      query.andWhere(
        '(user.primerNombre LIKE :search OR user.primerApellido LIKE :search OR user.email LIKE :search OR user.rut LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filtro de estado
    if (status) {
      if (status === 'active') {
        query.andWhere('user.activo = :active', { active: true });
      } else if (status === 'inactive') {
        query.andWhere('user.activo = :active', { active: false });
      }
    }

    // Filtro de fecha y hora (disponibilidad)
    if (date && time) {
      const dateObj = new Date(date);
      let dayOfWeek = dateObj.getUTCDay();
      if (dayOfWeek === 0) dayOfWeek = 7;

      const timeWithSeconds = time.length === 5 ? `${time}:00` : time;

      const availableMechanics = await this.scheduleRepository
        .createQueryBuilder('schedule')
        .select('schedule.usuarioId')
        .where('schedule.dia_semana = :dayOfWeek', { dayOfWeek })
        .andWhere('schedule.horaInicio <= :time', { time: timeWithSeconds })
        .andWhere('schedule.horaFin > :time', { time: timeWithSeconds })
        .andWhere('schedule.activo = :active', { active: true })
        .getMany();

      const mechanicIds = availableMechanics.map((s) => s.usuarioId);

      if (mechanicIds.length > 0) {
        query.andWhere('user.id IN (:...ids)', { ids: mechanicIds });
      } else {
        return { mechanics: [], total: 0 };
      }
    }

    // Ordenamiento
    const orderDirection = order === 'ASC' ? 'ASC' : 'DESC';
    switch (sortBy) {
      case 'name':
        query.orderBy('user.primerNombre', orderDirection)
          .addOrderBy('user.primerApellido', orderDirection);
        break;
      case 'email':
        query.orderBy('user.email', orderDirection);
        break;
      case 'completedInspections':
        query.orderBy('stats.completedCount', orderDirection, 'NULLS LAST');
        break;
      case 'createdAt':
      default:
        query.orderBy('user.fechaCreacion', orderDirection);
        break;
    }

    // Paginación
    const total = await query.getCount();
    
    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }

    const mechanics = await query.getRawAndEntities();

    const mechanicsWithStats = mechanics.entities.map((m, index) => {
      const raw = mechanics.raw[index];
      return {
        id: m.id,
        firstName: m.primerNombre,
        lastName: m.primerApellido,
        email: m.email,
        phone: m.telefono,
        rut: m.rut,
        status: m.activo ? 'active' : 'inactive',
        createdAt: m.fechaCreacion,
        profilePhoto: m.foto_url,
        completedInspections: parseInt(raw.stats_completedCount || '0', 10),
        rating: 5.0,
      };
    });

    return {
      mechanics: mechanicsWithStats,
      total,
    };
  }

  async getMechanicSchedule(mechanicId: string) {
    const schedules = await this.scheduleRepository.find({
      where: { usuarioId: mechanicId },
      order: { dia_semana: 'ASC', horaInicio: 'ASC' },
    });

    const grouped = new Map<number, { id: string, dayOfWeek: number, timeSlots: string[], isActive: boolean }>();

    for (const s of schedules) {
      const timeSlots = [];
      if (s.activo && s.horaInicio && s.horaFin) {
        let current = s.horaInicio.substring(0, 5);
        const end = s.horaFin.substring(0, 5);
        
        while (current < end) {
          timeSlots.push(current);
          const [h, m] = current.split(':').map(Number);
          const date = new Date();
          date.setHours(h, m + 30);
          current = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
      }

      if (grouped.has(s.dia_semana)) {
        const existing = grouped.get(s.dia_semana);
        existing.timeSlots.push(...timeSlots);
        existing.isActive = true;
      } else {
        grouped.set(s.dia_semana, {
          id: s.id.toString(),
          dayOfWeek: s.dia_semana,
          timeSlots,
          isActive: s.activo,
        });
      }
    }

    return Array.from(grouped.values());
  }

  async updateMechanicSchedule(mechanicId: string, schedules: any[]) {
    // Delete existing schedules for this mechanic
    await this.scheduleRepository.delete({ usuarioId: mechanicId });

    const newSchedules = [];

    for (const s of schedules) {
      if (s.isActive && s.timeSlots && s.timeSlots.length > 0) {
        // Save each slot as a separate row (30 min duration)
        for (const slot of s.timeSlots) {
          const [h, m] = slot.split(':').map(Number);
          const d = new Date();
          d.setHours(h, m + 30);
          const endTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

          newSchedules.push({
            usuarioId: mechanicId,
            dia_semana: s.dayOfWeek,
            horaInicio: slot,
            horaFin: endTime,
            activo: true,
          });
        }
      }
    }

    if (newSchedules.length > 0) {
      await this.scheduleRepository.save(newSchedules);
    }

    return { success: true };
  }

  async getSedeSchedule(sedeId: number) {
    const schedules = await this.sedeScheduleRepository.find({
      where: { sedeId },
      order: { dia_semana: 'ASC' },
    });

    return schedules.map(s => {
      const timeSlots = [];
      if (s.activo && s.horaInicio && s.horaFin) {
        let current = s.horaInicio.substring(0, 5);
        const end = s.horaFin.substring(0, 5);
        
        while (current < end) {
          timeSlots.push(current);
          const [h, m] = current.split(':').map(Number);
          const date = new Date();
          date.setHours(h, m + 30);
          current = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
      }

      return {
        id: s.id,
        dayOfWeek: s.dia_semana,
        timeSlots,
        isActive: s.activo,
      };
    });
  }

  async updateSedeSchedule(sedeId: number, schedules: any[]) {
    await this.sedeScheduleRepository.delete({ sedeId });

    const newSchedules = [];

    for (const s of schedules) {
      if (s.isActive && s.timeSlots && s.timeSlots.length > 0) {
        // Save each slot as a separate row (30 min duration)
        for (const slot of s.timeSlots) {
          const [h, m] = slot.split(':').map(Number);
          const d = new Date();
          d.setHours(h, m + 30);
          const endTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

          newSchedules.push({
            sedeId,
            dia_semana: s.dayOfWeek,
            horaInicio: slot,
            horaFin: endTime,
            activo: true,
          });
        }
      }
    }

    if (newSchedules.length > 0) {
      await this.sedeScheduleRepository.save(newSchedules);
    }

    return { success: true };
  }

  // Publicaciones
  async getAllPublications(
    status?: string,
    limit?: number,
    offset?: number,
  ): Promise<{ publications: any[], total: number }> {
    const query = this.publicationRepository.createQueryBuilder('publication')
      .leftJoinAndSelect('publication.vehiculo', 'vehicle')
      .leftJoinAndSelect('publication.vendedor', 'seller')
      .leftJoinAndSelect('publication.fotos', 'photos')
      .select([
        'publication.id',
        'publication.estado',
        'publication.fechaCreacion',
        'publication.valor',
        'vehicle.id',
        'vehicle.patente',
        'vehicle.marca',
        'vehicle.modelo',
        'vehicle.anio',
        'seller.id',
        'seller.primerNombre',
        'seller.primerApellido',
        'seller.email',
        'photos.id',
        'photos.url',
      ]);

    // Filtro de estado (mapeado a PublicationStatus)
    if (status) {
      if (status === 'active') {
        query.andWhere('publication.estado = :estado', { estado: PublicationStatus.PUBLICADA });
      } else if (status === 'inactive') {
        query.andWhere('publication.estado = :estado', { estado: PublicationStatus.DESACTIVADA });
      } else if (status === 'blocked' || status === 'bloqueada') {
        query.andWhere('publication.estado = :estado', { estado: PublicationStatus.BLOQUEADA });
      } else if (status === 'pending' || status === 'pendiente') {
        query.andWhere('publication.estado = :estado', { estado: PublicationStatus.PENDIENTE });
      } else if (status === 'sold') {
        // No hay columna de vendido; tratamos "sold" como desactivada
        query.andWhere('publication.estado = :estado', { estado: PublicationStatus.DESACTIVADA });
      }
    }

    // Ordenar por fecha de creación (más recientes primero)
    query.orderBy('publication.fechaCreacion', 'DESC');

    // Obtener total antes de paginar
    const total = await query.getCount();

    // Aplicar paginación
    if (limit !== undefined) {
      query.limit(limit);
    }
    if (offset !== undefined) {
      query.offset(offset);
    }

    const publications = await query.getMany();

    // Mapear a formato esperado por el frontend
    const mappedPublications = publications.map(pub => {
      let statusMapped: 'active' | 'inactive' | 'sold' | 'pending' | 'blocked';
      if (pub.estado === PublicationStatus.PUBLICADA) {
        statusMapped = 'active';
      } else if (pub.estado === PublicationStatus.DESACTIVADA) {
        statusMapped = 'inactive';
      } else if (pub.estado === PublicationStatus.BLOQUEADA) {
        statusMapped = 'blocked';
      } else {
        statusMapped = 'pending';
      }

      return {
        id: pub.id,
        vehicleId: pub.vehiculo?.id,
        vehiclePatent: pub.vehiculo?.patente,
        vehicleBrand: pub.vehiculo?.marca,
        vehicleModel: pub.vehiculo?.modelo,
        vehicleYear: pub.vehiculo?.anio,
        price: pub.valor,
        ownerName: `${pub.vendedor?.primerNombre || ''} ${pub.vendedor?.primerApellido || ''}`.trim(),
        ownerEmail: pub.vendedor?.email,
        status: statusMapped,
        createdAt: pub.fechaCreacion,
        expiresAt: null,
        images: pub.fotos?.map((p) => p.url) || [],
        views: 0, // TODO: Implementar contador de vistas si existe
      };
    });

    return {
      publications: mappedPublications,
      total,
    };
  }

  async updatePublicationStatus(publicationId: string, status: string): Promise<any> {
    const publication = await this.publicationRepository.findOne({
      where: { id: publicationId },
    });

    if (!publication) {
      throw new Error('Publicación no encontrada');
    }

    if (status === 'active') {
      publication.estado = PublicationStatus.PUBLICADA;
    } else if (status === 'inactive') {
      publication.estado = PublicationStatus.DESACTIVADA;
    } else if (status === 'blocked' || status === 'bloqueada') {
      publication.estado = PublicationStatus.BLOQUEADA;
    } else if (status === 'pending' || status === 'pendiente') {
      publication.estado = PublicationStatus.PENDIENTE;
    } else if (status === 'sold') {
      // No hay columna de vendido; tratamos sold como desactivada
      publication.estado = PublicationStatus.DESACTIVADA;
    }

    await this.publicationRepository.save(publication);

    return { success: true, publication };
  }

  async deletePublication(publicationId: string): Promise<any> {
    const publication = await this.publicationRepository.findOne({
      where: { id: publicationId },
    });

    if (!publication) {
      throw new Error('Publicación no encontrada');
    }

    // Instead of removing the publication, mark it as blocked
    publication.estado = PublicationStatus.BLOQUEADA;
    await this.publicationRepository.save(publication);

    return { success: true, publication };
  }
}
