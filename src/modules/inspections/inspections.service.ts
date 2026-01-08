import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inspection, InspectionStatus, PaymentStatus } from '../../entities/Inspection.entity';
import { InspectionPaymentDetail } from '../../entities/InspectionPaymentDetail.entity';
import { SolicitudInspeccion, SolicitudEstado } from '../../entities/SolicitudInspeccion.entity';
import { Valor } from '../../entities/Valor.entity';
import { InspectionSection } from '../../entities/InspectionSection.entity';
import { InspectionAnswer } from '../../entities/InspectionAnswer.entity';
import { Question } from '../../entities/Question.entity';
import { NotificationType } from '../../entities/Notification.entity';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { UpdateInspectionDto } from './dto/update-inspection.dto';
import { NotificationsService } from '../notifications/notifications.service';

import { User } from '../../entities/User.entity';
import { Publication, PublicationStatus } from '../../entities/Publication.entity';

@Injectable()
export class InspectionsService {
  constructor(
    @InjectRepository(Inspection)
    private inspectionsRepository: Repository<Inspection>,
    @InjectRepository(Publication)
    private publicationRepository: Repository<Publication>,
    @InjectRepository(InspectionPaymentDetail)
    private paymentDetailRepository: Repository<InspectionPaymentDetail>,
    @InjectRepository(SolicitudInspeccion)
    private solicitudRepository: Repository<SolicitudInspeccion>,
    @InjectRepository(Valor)
    private valoresRepository: Repository<Valor>,
    @InjectRepository(InspectionSection)
    private sectionRepository: Repository<InspectionSection>,
    @InjectRepository(InspectionAnswer)
    private answerRepository: Repository<InspectionAnswer>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createInspectionDto: CreateInspectionDto) {
    const { paymentId, solicitanteId, ...inspectionData } = createInspectionDto;
    console.log('🛠 [InspectionsService] Creating inspection. SolicitanteID:', solicitanteId);
    console.log('🛠 [InspectionsService] Inspection Data:', JSON.stringify(inspectionData));
    
    const inspection = this.inspectionsRepository.create(inspectionData);
    
    if (solicitanteId) {
        inspection.solicitanteId = solicitanteId;
        const user = await this.inspectionsRepository.manager.getRepository(User).findOne({ where: { id: solicitanteId } });
        if (user) {
            inspection.solicitante = user;
            console.log('🛠 [InspectionsService] Assigned User entity to inspection:', user.id);
        } else {
            console.error('❌ [InspectionsService] User not found for ID:', solicitanteId);
        }
    }
    
    const savedInspection = await this.inspectionsRepository.save(inspection);
    
    console.log('✅ [InspectionsService] Inspection saved with ID:', savedInspection.id);
    console.log('✅ [InspectionsService] Saved Solicitante:', savedInspection.solicitante);

    if (paymentId) {
      // Fetch inspection price from DB to ensure accuracy
      const inspectionPrice = await this.valoresRepository.findOne({ where: { nombre: 'inspeccion' } });
      const monto = inspectionPrice ? inspectionPrice.precio : (inspectionData.valor || 0);

      const paymentDetail = this.paymentDetailRepository.create({
        inspeccionId: savedInspection.id,
        pagoId: paymentId,
        monto: monto,
      });
      await this.paymentDetailRepository.save(paymentDetail);
    }

    // Notify Admins
    // Check if it comes from schedule
    if (inspectionData.horarioId || inspectionData.fechaProgramada) {
      await this.notificationsService.notifyAdmins(
        'Inspección Agendada',
        `Se ha agendado una inspección.`,
        { 
          type: 'crear_insp', 
          inspectionId: savedInspection.id, 
          id: savedInspection.id,
          actionUrl: `/(admin)/inspections?highlightId=${savedInspection.id}`
        },
        [NotificationType.CREAR_INSP]
      );
    } 
    // Check if this inspection is part of a publication (combo)
    else if (savedInspection.publicacionId) {
      // Fetch full inspection with relations to get vehicle info
      const fullInspection = await this.inspectionsRepository.findOne({
        where: { id: savedInspection.id },
        relations: ['publicacion', 'publicacion.vehiculo']
      });
      
      const patente = fullInspection?.publicacion?.vehiculo?.patente || 'Sin patente';
      
      await this.notificationsService.notifyAdmins(
        'Nueva Inspección con Publicación',
        `Se ha creado una publicación solicitando una inspección para el vehículo ${patente}.`,
        { type: 'crear_pub_insp', inspectionId: savedInspection.id, id: savedInspection.id },
        [NotificationType.CREAR_PUB_INSP]
      );
    } else {
      await this.notificationsService.notifyAdmins(
        'Nueva Inspección',
        `Se ha solicitado una nueva inspección.`,
        { type: 'inspection', id: savedInspection.id }
      );
    }

    return savedInspection;
  }

  findAll() {
    return this.inspectionsRepository.find({
      relations: ['solicitante', 'publicacion', 'publicacion.vehiculo', 'horario', 'mecanico'],
    });
  }

  async findOne(id: string) {
    const inspection = await this.inspectionsRepository.findOne({
      where: { id },
      relations: [
        'solicitante', 
        'publicacion', 
        'publicacion.vehiculo', 
        'publicacion.vendedor',
        'publicacion.fotos',
        'publicacion.paymentDetails',
        'publicacion.paymentDetails.pago',
        'horario',  
        'mecanico',
        'paymentDetails',
        'paymentDetails.pago',
        'inspectionAnswers',
        'inspectionAnswers.pregunta',
        'inspectionAnswers.respuestaOpcion'
      ],
    });
    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }

    // Calculate score efficiently
    const scoreResult = await this.answerRepository.createQueryBuilder('ia')
      .select('SUM(ao.calificacion)', 'totalScore')
      .addSelect('SUM(q.escala)', 'maxScore')
      .leftJoin('ia.respuestaOpcion', 'ao')
      .leftJoin('ia.pregunta', 'q')
      .where('ia.inspeccionId = :id', { id })
      .getRawOne();

    return {
      ...inspection,
      score: scoreResult?.totalScore ? parseInt(scoreResult.totalScore) : 0,
      maxScore: scoreResult?.maxScore ? parseInt(scoreResult.maxScore) : 0
    };
  }

  async update(id: string, updateInspectionDto: UpdateInspectionDto) {
    const inspection = await this.findOne(id);
    Object.assign(inspection, updateInspectionDto);
    return this.inspectionsRepository.save(inspection);
  }

  async remove(id: string) {
    const inspection = await this.findOne(id);
    return this.inspectionsRepository.remove(inspection);
  }

  async findByUser(userId: string) {
    return this.inspectionsRepository.find({
      where: { solicitante: { id: userId } },
      relations: ['publicacion', 'horario'],
    });
  }

  async findByPublication(publicationId: string) {
    return this.inspectionsRepository.find({
      where: { publicacionId: publicationId },
      relations: ['solicitante', 'horario'],
    });
  }

  async findByMechanic(mechanicId: string) {
    return this.inspectionsRepository.find({
      where: { mecanicoId: mechanicId },
      relations: ['publicacion', 'publicacion.vehiculo', 'horario', 'solicitante'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async getMyInspections(userId: string, order: 'ASC' | 'DESC' = 'DESC', sortBy: string = 'fechaCreacion') {
    const orderDirection = order || 'DESC';
    const sortField = sortBy || 'fechaCreacion';
    
    console.log(`🔍 [InspectionsService] getMyInspections - Searching for userId: ${userId}`);
    
    const results = await this.inspectionsRepository.find({
      where: { solicitante: { id: userId } },
      relations: ['publicacion', 'publicacion.vehiculo', 'horario', 'horario.sede', 'mecanico'],
      order: { [sortField]: orderDirection },
    });

    console.log(`✅ [InspectionsService] Found ${results.length} inspections`);
    return results;
  }

  async getMyPublicationsInspections(userId: string, order: 'ASC' | 'DESC' = 'DESC', sortBy: string = 'fechaCreacion') {
    const orderDirection = order || 'DESC';
    const sortField = sortBy || 'fechaCreacion';
    
    return this.inspectionsRepository
      .createQueryBuilder('inspection')
      .leftJoinAndSelect('inspection.publicacion', 'publicacion')
      .leftJoinAndSelect('publicacion.vehiculo', 'vehiculo')
      .leftJoinAndSelect('inspection.solicitante', 'solicitante')
      .leftJoinAndSelect('inspection.horario', 'horario')
      .leftJoinAndSelect('horario.sede', 'sede')
      .leftJoinAndSelect('inspection.mecanico', 'mecanico')
      .where('publicacion.vendedorId = :userId', { userId })
      .orderBy(`inspection.${sortField}`, orderDirection)
      .getMany();
  }

  async assignMechanic(inspectionId: string, mechanicId: string) {
    return this.createSolicitud(mechanicId, inspectionId);
  }

  async createSolicitud(mecanicoId: string, inspeccionId: string, mensaje?: string) {
    const inspection = await this.findOne(inspeccionId);
    
    const solicitud = this.solicitudRepository.create({
      mecanicoId,
      inspeccionId,
      publicacionId: inspection.publicacionId,
      mensaje,
      estado: SolicitudEstado.PENDIENTE
    });

    const savedSolicitud = await this.solicitudRepository.save(solicitud);

    // Notify Mechanic
    await this.notificationsService.create({
      userId: mecanicoId,
      title: 'Nueva Solicitud de Inspección',
      message: `Se te ha asignado una nueva inspección para el vehículo ${inspection.publicacion?.vehiculo?.patente || ''}.`,
      type: NotificationType.SOLICITAR_MEC,
      relatedId: savedSolicitud.id
    });

    return savedSolicitud;
  }

  async respondSolicitud(id: string, estado: SolicitudEstado) {
    const solicitud = await this.solicitudRepository.findOne({ 
      where: { id },
      relations: ['inspeccion'] 
    });
    
    if (!solicitud) throw new NotFoundException('Solicitud not found');

    solicitud.estado = estado;
    solicitud.fechaRespuesta = new Date();
    await this.solicitudRepository.save(solicitud);

    // Update original notification message
    const originalNotification = await this.notificationsService.findByRelatedIdAndType(id, NotificationType.SOLICITAR_MEC);
    if (originalNotification) {
      // Need to get patente. We can get it from the inspection which we load below anyway.
      // But we need it now or later. Let's load inspection now.
      const inspection = await this.findOne(solicitud.inspeccionId);
      const patente = inspection.publicacion?.vehiculo?.patente || '';
      
      const newMessage = estado === SolicitudEstado.ACEPTADA 
          ? `Has aceptado la solicitud de inspección para el vehículo ${patente}`
          : `Has rechazado la solicitud de inspección para el vehículo ${patente}`;
      
      await this.notificationsService.updateMessage(originalNotification.id, newMessage);
    }

    if (estado === SolicitudEstado.ACEPTADA) {
      // Assign mechanic to inspection
      const inspection = await this.findOne(solicitud.inspeccionId);
      inspection.mecanicoId = solicitud.mecanicoId;
      inspection.estado_insp = InspectionStatus.CONFIRMADA;
      await this.inspectionsRepository.save(inspection);
      
      // 1. Notify Admin
      await this.notificationsService.notifyAdmins(
        'Solicitud Aceptada',
        `El mecánico ha aceptado la inspección ${solicitud.inspeccion.id}`,
        { id: solicitud.inspeccionId, type: NotificationType.ACEPTAR_MEC_ADMIN }
      );

      // 2. Notify Owner (Dueño de la publicación)
      if (inspection.publicacion?.vendedorId) {
        const solicitanteName = inspection.solicitante 
          ? `${inspection.solicitante.primerNombre} ${inspection.solicitante.primerApellido}` 
          : 'Un usuario';
        
        let fechaStr = 'fecha por definir';
        let horaStr = 'hora por definir';

        if (inspection.fechaProgramada) {
            const date = new Date(inspection.fechaProgramada);
            const optionsDate: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Santiago' };
            const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' };
            
            fechaStr = new Intl.DateTimeFormat('es-CL', optionsDate).format(date);
            horaStr = new Intl.DateTimeFormat('es-CL', optionsTime).format(date);
        }

        await this.notificationsService.create({
          userId: inspection.publicacion.vendedorId,
          title: 'Inspección Agendada',
          message: `El usuario ${solicitanteName}, agendó una inspección técnica el día ${fechaStr} a las ${horaStr} para tu vehículo ${inspection.publicacion.vehiculo?.patente || ''}. Haz click para ver detalles o cancelar.`,
          type: NotificationType.ACEPTAR_MEC_DUENO,
          relatedId: inspection.id
        });
      }

      // 3. Notify Solicitant (if different from owner)
      // If solicitanteId exists and is different from vendedorId
      if (inspection.solicitanteId && inspection.solicitanteId !== inspection.publicacion?.vendedorId) {
         await this.notificationsService.create({
          userId: inspection.solicitanteId,
          title: 'Mecánico Asignado',
          message: `Un mecánico ha aceptado tu solicitud de inspección para el vehículo ${inspection.publicacion?.vehiculo?.patente || ''}.`,
          type: NotificationType.ACEPTAR_MEC_VEND,
          relatedId: inspection.id
        });
      }

    } else {
       // Notify Admin
       await this.notificationsService.notifyAdmins(
        'Solicitud Rechazada',
        `El mecánico ha rechazado la inspección ${solicitud.inspeccion.id}`,
        { id: solicitud.inspeccionId, type: NotificationType.RECHAZO_MEC }
      );
    }

    return solicitud;
  }

  async getSolicitudesByMechanic(mecanicoId: string) {
    return this.solicitudRepository.find({
      where: { mecanicoId },
      relations: ['inspeccion', 'inspeccion.publicacion', 'inspeccion.publicacion.vehiculo', 'inspeccion.horario'],
      order: { fechaSolicitud: 'DESC' }
    });
  }

  async getSolicitudesByInspection(inspeccionId: string) {
    return this.solicitudRepository.find({
      where: { inspeccionId },
      relations: ['mecanico'],
      order: { fechaSolicitud: 'DESC' }
    });
  }

  async getSolicitudById(id: string) {
    return this.solicitudRepository.findOne({
      where: { id },
      relations: ['inspeccion', 'inspeccion.publicacion', 'inspeccion.publicacion.vehiculo', 'inspeccion.horario']
    });
  }

  async getInspectionForm() {
    return this.sectionRepository.find({
      relations: ['subsections', 'subsections.questions', 'subsections.questions.answers'],
      order: {
        posicion: 'ASC',
        subsections: {
          posicion: 'ASC',
          questions: {
            posicion: 'ASC'
          }
        }
      }
    });
  }

  async startInspection(inspectionId: string) {
    const inspection = await this.findOne(inspectionId);
    inspection.estado_insp = InspectionStatus.EN_SUCURSAL;
    return this.inspectionsRepository.save(inspection);
  }

  async completeInspection(inspectionId: string, updateDto: UpdateInspectionDto) {
    const inspection = await this.findOne(inspectionId);
    
    // Save JSON backup
    Object.assign(inspection, updateDto);
    inspection.estado_insp = InspectionStatus.FINALIZADA;
    inspection.fechaCompletada = new Date();
    const savedInspection = await this.inspectionsRepository.save(inspection);

    // --- Update Publication Status ---
    if (inspection.publicacion && inspection.publicacion.estado === PublicationStatus.PENDIENTE) {
      inspection.publicacion.estado = PublicationStatus.PUBLICADA;
      await this.publicationRepository.save(inspection.publicacion);
      console.log(`✅ [InspectionsService] Publication ${inspection.publicacion.id} updated to PUBLICADA`);
    }

    // --- Notifications ---
    const patente = inspection.publicacion?.vehiculo?.patente || 'Sin patente';

    // 1. Notify Admin
    await this.notificationsService.notifyAdmins(
      'Inspección Finalizada',
      `El mecánico ha finalizado la inspección del vehículo ${patente}.`,
      { id: inspection.id, type: NotificationType.FINALIZADO_ADMIN }
    );

    // 2. Notify Mechanic
    if (inspection.mecanicoId) {
      await this.notificationsService.create({
        userId: inspection.mecanicoId,
        title: 'Inspección Finalizada',
        message: `Has finalizado exitosamente la inspección del vehículo ${patente}.`,
        type: NotificationType.FINALIZADO_MEC,
        relatedId: inspection.id
      });
    }

    // 3. Notify Owner (Dueño de la publicación)
    if (inspection.publicacion?.vendedorId) {
      await this.notificationsService.create({
        userId: inspection.publicacion.vendedorId,
        title: 'Inspección Completada',
        message: `La inspección de tu vehículo ${patente} ha sido completada. Ya puedes ver los resultados.`,
        type: NotificationType.FINALIZADO_DUENO,
        relatedId: inspection.id
      });
    }

    // 4. Notify Solicitant (if different from owner)
    if (inspection.solicitanteId && inspection.solicitanteId !== inspection.publicacion?.vendedorId) {
      await this.notificationsService.create({
        userId: inspection.solicitanteId,
        title: 'Inspección Completada',
        message: `La inspección solicitada para el vehículo ${patente} ha sido completada.`,
        type: NotificationType.FINALIZADO_VEND,
        relatedId: inspection.id
      });
    }

    // Save relational answers if provided
    if (updateDto.answers) {
      console.log('Processing relational answers...');
      
      // We need to map the incoming answers to the DB structure.
      // Incoming format: { "1.1": "a", "1.2": "b" } (Question ID from static file -> Option Value)
      // We need to find the Question entity where the ID matches the static ID logic or text.
      // Since we don't have a direct map, we will try to match by Question Text if possible, 
      // OR we assume the frontend will eventually send DB IDs.
      
      // For now, let's try to find the question by matching the "id" from the static file 
      // to the "posicion" or some other logic if we can.
      // But wait, the static file IDs "1.1", "1.2" are not in the DB as such.
      // In the DB we have Section 1, Subsection 1.1, Question 1 (pos 1).
      
      // Let's iterate and try to save what we can.
      // Ideally, we should fetch all questions and build a map.
      
      try {
        const allQuestions = await this.sectionRepository.manager.getRepository(Question).find({
            relations: ['subseccion', 'subseccion.seccion', 'answers']
        });

        const answersToSave = [];

        for (const [key, value] of Object.entries(updateDto.answers)) {
            // Key is like "1.1", "2.3"
            // Value is like "a", "b"
            
            // Find question that matches this "1.1" logic
            // "1.1" -> Section 1, Question 1? Or Subsection 1.1?
            // In static file: 1.1 is the first question of section 1.
            // In DB: Section 1 -> Subsection 1.1 -> Question (pos 1)
            
            // Let's try to match by the question text start? "1.1. Revisar..."
            const question = allQuestions.find(q => q.pregunta.startsWith(key + '. '));
            
            if (question) {
                // Find the option
                const option = question.answers.find(a => a.respuestaTexto.startsWith(value + ')'));
                
                if (option) {
                    const answer = this.answerRepository.create({
                        inspeccion: { id: inspectionId } as any,
                        pregunta: { id: question.id } as any,
                        respuestaOpcion: { id: option.id } as any,
                        respuestaTextoManual: updateDto.textAnswers?.[key] || null,
                        imagen_url: updateDto.mediaUrls?.[key] || null,
                    });
                    answersToSave.push(answer);
                }
            }
        }
        
        if (answersToSave.length > 0) {
            await this.answerRepository.save(answersToSave);
            console.log(`Saved ${answersToSave.length} relational answers.`);
        }
      } catch (e) {
        console.error('Error saving relational answers:', e);
      }
    }

    return savedInspection;
  }

  async confirmPayment(inspectionId: string) {
    const inspection = await this.findOne(inspectionId);
    inspection.estado_pago = PaymentStatus.CONFIRMADO;
    return this.inspectionsRepository.save(inspection);
  }

  async cancel(id: string, userId: string, reason?: string) {
    const inspection = await this.findOne(id);
    
    const isSeller = inspection.publicacion?.vendedorId === userId;
    const isMechanic = inspection.mecanicoId === userId;

    if (!isSeller && !isMechanic) {
        throw new ForbiddenException('Solo el vendedor o el mecánico asignado pueden cancelar esta inspección');
    }

    inspection.estado_insp = InspectionStatus.RECHAZADA;
    if (reason) {
        inspection.cancellationReason = reason;
    }
    await this.inspectionsRepository.save(inspection);

    const patente = inspection.publicacion?.vehiculo?.patente || 'Sin patente';
    const actor = isSeller ? 'vendedor' : 'mecánico';
    const reasonText = reason ? ` Motivo: ${reason}` : '';

    // 1. Notify Admin
    await this.notificationsService.notifyAdmins(
      'Inspección Cancelada',
      `El ${actor} ha cancelado la inspección del vehículo ${patente}.${reasonText}`,
      { id: inspection.id, type: NotificationType.CANCELADO_ADMIN }
    );

    // 2. Notify Mechanic (if cancelled by seller)
    if (isSeller && inspection.mecanicoId) {
      await this.notificationsService.create({
        userId: inspection.mecanicoId,
        title: 'Inspección Cancelada',
        message: `El vendedor ha cancelado la inspección del vehículo ${patente}.${reasonText}`,
        type: NotificationType.CANCELADO_MEC,
        relatedId: inspection.id
      });
    }

    // 3. Notify Owner (if cancelled by mechanic)
    if (isMechanic && inspection.publicacion?.vendedorId) {
      await this.notificationsService.create({
        userId: inspection.publicacion.vendedorId,
        title: 'Inspección Cancelada',
        message: `El mecánico ha cancelado la inspección del vehículo ${patente}.${reasonText}`,
        type: NotificationType.CANCELADO_DUENO,
        relatedId: inspection.id
      });
    }

    // 4. Notify Solicitant (Buyer/Interesado)
    // If solicitanteId exists and is different from vendedorId
    if (inspection.solicitanteId && inspection.solicitanteId !== inspection.publicacion?.vendedorId) {
      await this.notificationsService.create({
        userId: inspection.solicitanteId,
        title: 'Inspección Cancelada',
        message: `El ${actor} ha cancelado la inspección del vehículo ${patente}.${reasonText}`,
        type: NotificationType.CANCELADO_VEND,
        relatedId: inspection.id
      });
    }

    return inspection;
  }

  async rateMechanic(id: string, userId: string, rating: number) {
    const inspection = await this.findOne(id);
    
    if (inspection.solicitanteId !== userId) {
        throw new ForbiddenException('Solo el solicitante puede calificar al mecánico');
    }

    if (inspection.estado_insp !== InspectionStatus.FINALIZADA) {
        throw new ForbiddenException('Solo se puede calificar una inspección finalizada');
    }

    if (rating < 1 || rating > 5) {
        throw new ForbiddenException('La calificación debe ser entre 1 y 5');
    }

    inspection.rating = rating;
    return this.inspectionsRepository.save(inspection);
  }
}
