import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../entities/Message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create(createMessageDto);
    return this.messageRepository.save(message);
  }

  async findConversation(userId1: string, userId2: string): Promise<Message[]> {
    try {
      console.log(`Finding conversation between ${userId1} and ${userId2}`);
      return await this.messageRepository.find({
        where: [
          { remitenteId: userId1, destinatarioId: userId2 },
          { remitenteId: userId2, destinatarioId: userId1 },
        ],
        relations: ['remitente', 'destinatario', 'vehiculo'],
        order: { fechaCreacion: 'ASC' },
      });
    } catch (error) {
      console.error('Error in findConversation:', error);
      throw error;
    }
  }

  async findUserConversations(userId: string): Promise<any[]> {
    const messages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.remitente', 'remitente')
      .leftJoinAndSelect('message.destinatario', 'destinatario')
      .leftJoinAndSelect('message.vehiculo', 'vehiculo')
      .where('message.remitenteId = :userId OR message.destinatarioId = :userId', {
        userId,
      })
      .orderBy('message.fechaCreacion', 'DESC')
      .getMany();

    // Agrupar mensajes por conversación
    const conversationsMap = new Map<string, any>();

    messages.forEach((msg) => {
      const otherUserId =
        msg.remitenteId === userId ? msg.destinatarioId : msg.remitenteId;
      const otherUser =
        msg.remitenteId === userId ? msg.destinatario : msg.remitente;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          user: {
            id: otherUser.id,
            primerNombre: otherUser.primerNombre,
            primerApellido: otherUser.primerApellido,
            foto_url: otherUser.foto_url,
          },
          lastMessage: msg.mensaje,
          lastMessageDate: msg.fechaCreacion,
          vehicleId: msg.vehiculoId,
          unreadCount: msg.destinatarioId === userId && !msg.leido ? 1 : 0,
        });
      } else {
        const conv = conversationsMap.get(otherUserId);
        if (msg.destinatarioId === userId && !msg.leido) {
          conv.unreadCount += 1;
        }
      }
    });

    return Array.from(conversationsMap.values());
  }

  async markAsRead(messageId: string): Promise<Message | null> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });
    if (message) {
      message.leido = true;
      return this.messageRepository.save(message);
    }
    return null;
  }

  async markConversationAsRead(userId: string, otherUserId: string): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ leido: true })
      .where('remitenteId = :otherUserId AND destinatarioId = :userId AND leido = false', {
        userId,
        otherUserId,
      })
      .execute();
  }
}
