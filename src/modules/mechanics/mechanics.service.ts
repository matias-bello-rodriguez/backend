import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/User.entity';
import { Inspection, InspectionStatus } from '../../entities/Inspection.entity';
import { UserSchedule } from '../../entities/UserSchedule.entity';
import { SedeSchedule } from '../../entities/SedeSchedule.entity';
import { Sede } from '../../entities/Sede.entity';
import { PagoMecanico } from '../../entities/PagoMecanico.entity';

@Injectable()
export class MechanicsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Inspection)
    private readonly inspectionRepository: Repository<Inspection>,
    @InjectRepository(UserSchedule)
    private readonly scheduleRepository: Repository<UserSchedule>,
    @InjectRepository(SedeSchedule)
    private readonly sedeScheduleRepository: Repository<SedeSchedule>,
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    @InjectRepository(PagoMecanico)
    private readonly pagoMecanicoRepository: Repository<PagoMecanico>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { rol: UserRole.MECANICO },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findActive(): Promise<User[]> {
    return this.userRepository.find({
      where: { rol: UserRole.MECANICO },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const mechanic = await this.userRepository.findOne({
      where: { id, rol: UserRole.MECANICO },
    });

    if (!mechanic) {
      throw new NotFoundException(`Mecánico con ID ${id} no encontrado`);
    }

    return mechanic;
  }

  async getPayouts(mechanicId: string): Promise<PagoMecanico[]> {
    return this.pagoMecanicoRepository.find({
      where: { mecanico_id: mechanicId },
      order: { fecha_pago: 'DESC' },
    });
  }

  async findByRut(rut: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { rut, rol: UserRole.MECANICO },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, rol: UserRole.MECANICO },
    });
  }

  async getStatistics(id: string): Promise<{
    totalInspections: number;
    completedInspections: number;
    pendingInspections: number;
    inProgressInspections: number;
  }> {
    await this.findOne(id); // Verify mechanic exists

    const [
      totalInspections,
      completedInspections,
      pendingInspections,
      inProgressInspections,
    ] = await Promise.all([
      this.inspectionRepository.count({
        where: { mecanicoId: id },
      }),
      this.inspectionRepository.count({
        where: { mecanicoId: id, estado_insp: InspectionStatus.FINALIZADA },
      }),
      this.inspectionRepository.count({
        where: { mecanicoId: id, estado_insp: InspectionStatus.PENDIENTE },
      }),
      this.inspectionRepository.count({
        where: { mecanicoId: id, estado_insp: InspectionStatus.EN_SUCURSAL },
      }),
    ]);

    return {
      totalInspections,
      completedInspections,
      pendingInspections,
      inProgressInspections,
    };
  }

  async getInspections(mechanicId: string): Promise<Inspection[]> {
    await this.findOne(mechanicId); // Verify mechanic exists

    return this.inspectionRepository.find({
      where: { mecanicoId: mechanicId },
      relations: ['solicitante', 'publicacion', 'horario'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<User> {
    const mechanic = await this.userRepository.findOne({
      where: { id: userId, rol: UserRole.MECANICO },
    });

    if (!mechanic) {
      throw new NotFoundException(`Usuario no es un mecánico o no existe`);
    }

    return mechanic;
  }

  async getAvailableSlots(dateStr: string, location?: string): Promise<{ id: number; time: string }[]> {
    // Parse date manually to avoid timezone issues (YYYY-MM-DD)
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    // getDay() returns 0 for Sunday, we want 7 for Sunday to match our DB (1=Monday...7=Sunday)
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();

    let schedules: any[] = [];

    console.log(`[getAvailableSlots] Request for date: ${dateStr}, location: '${location}', dayOfWeek: ${dayOfWeek}`);

    if (location) {
      // Fallback logic: Calculate from SedeSchedule
      const sede = await this.sedeRepository.findOne({ where: { nombre: location } });
      if (sede) {
        schedules = await this.sedeScheduleRepository.find({
          where: { sedeId: sede.id, dia_semana: dayOfWeek, activo: true },
        });
        console.log(`[getAvailableSlots] Found ${schedules.length} schedules for sede ${sede.nombre}`);
      } else {
        console.warn(`[getAvailableSlots] Sede not found for location: ${location}`);
        return [];
      }
    } else {
      // If no location, get all mechanic schedules (Home service?)
      schedules = await this.scheduleRepository.find({
        where: { dia_semana: dayOfWeek, activo: true },
      });
      console.log(`[getAvailableSlots] Found ${schedules.length} mechanic schedules`);
      
      if (schedules.length === 0) {
        return [];
      }
    }

      // 2. Get all inspections for this date
      const inspections = await this.inspectionRepository.createQueryBuilder('inspection')
        .where('DATE(inspection.fechaProgramada) = :date', { date: dateStr })
        .andWhere('inspection.estado_insp NOT IN (:...statuses)', { 
          statuses: [InspectionStatus.RECHAZADA] 
        })
        .getMany();

      // 3. Calculate capacity per slot
      const slotCapacity: Record<string, number> = {};
      const slotIds: Record<string, number[]> = {};
      
      for (const schedule of schedules) {
        if (schedule.horaInicio && schedule.horaFin) {
          let current = schedule.horaInicio.substring(0, 5);
          const end = schedule.horaFin.substring(0, 5);
          
          while (current < end) {
            slotCapacity[current] = (slotCapacity[current] || 0) + 1;
            if (!slotIds[current]) slotIds[current] = [];
            slotIds[current].push(schedule.id);

            const [h, m] = current.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m + 30);
            current = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          }
        }
      }

      // 4. Calculate usage per slot
      const slotUsage: Record<string, number> = {};
      for (const inspection of inspections) {
        if (inspection.fechaProgramada) {
          const d = new Date(inspection.fechaProgramada);
          const slot = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          slotUsage[slot] = (slotUsage[slot] || 0) + 1;
        }
      }

      // 5. Filter available slots
      return Object.keys(slotCapacity).filter(slot => {
        const capacity = slotCapacity[slot];
        const used = slotUsage[slot] || 0;
        return used < capacity;
      }).sort().map(slot => ({
        id: slotIds[slot][0], // Pick the first schedule ID available for this slot
        time: slot
      }));
  }

  async getSchedule(mechanicId: string) {
    const schedules = await this.scheduleRepository.find({
      where: { usuarioId: mechanicId },
      order: { dia_semana: 'ASC' },
    });

    // Convert DB format (start/end) to Mobile format (slots)
    // This is an approximation because we lost the exact slots
    // We will generate slots every 30 mins between start and end
    return schedules.map(s => {
      const timeSlots = [];
      if (s.activo && s.horaInicio && s.horaFin) {
        let current = s.horaInicio.substring(0, 5); // "09:00:00" -> "09:00"
        const end = s.horaFin.substring(0, 5);
        
        // Simple loop to generate slots
        // Warning: This assumes 30 min intervals and clean data
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

  async updateSchedule(mechanicId: string, schedules: any[]) {
    // Delete existing schedules
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
}
