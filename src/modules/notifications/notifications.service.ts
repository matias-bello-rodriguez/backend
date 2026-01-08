import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../entities/Notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../entities/User.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private usersService: UsersService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create(createNotificationDto);
    return this.notificationsRepository.save(notification);
  }

  async notifyAdmins(title: string, body: string, metadata?: any, types?: NotificationType[]) {
    console.log('🔔 [NotificationsService] notifyAdmins called with:', { title, body, types });
    try {
      // 1. Get all admins
      const admins = await this.usersService.findByRole(UserRole.ADMINISTRADOR);
      console.log(`👥 [NotificationsService] Found ${admins.length} admins`);
      
      if (!admins.length) {
        console.log('⚠️ [NotificationsService] No admins found to notify');
        return;
      }

      console.log(`📢 [NotificationsService] Notifying ${admins.length} admins: ${title}`);

      // 2. Create notifications in DB and send Push
      const notificationsPromises = admins.map(async (admin) => {
        console.log(`📝 [NotificationsService] Creating notification for admin: ${admin.email}`);
        
        // Save to DB (Create multiple if types provided)
        if (types && types.length > 0) {
          for (const type of types) {
            const notification = await this.create({
              userId: admin.id,
              title,
              message: body,
              type: type,
              relatedId: metadata?.id || null,
            });
            console.log(`✅ [NotificationsService] Notification created in DB (${type}): ${notification.id}`);
          }
        } else {
          // Default to AGENDAR_ADMIN if no types provided
          const notification = await this.create({
            userId: admin.id,
            title,
            message: body,
            type: NotificationType.AGENDAR_ADMIN,
            relatedId: metadata?.id || null,
          });
          console.log(`✅ [NotificationsService] Notification created in DB (AGENDAR_ADMIN): ${notification.id}`);
        }

        // Send Push if token exists
        if (admin.pushToken) {
          console.log(`🚀 [NotificationsService] Sending push to token: ${admin.pushToken}`);
          await this.sendPushNotification(admin.pushToken, title, body, metadata);
        } else {
          console.log(`⚠️ [NotificationsService] No push token for admin: ${admin.email}`);
        }
      });

      await Promise.all(notificationsPromises);
    } catch (error) {
      console.error('❌ [NotificationsService] Error notifying admins:', error);
    }
  }

  async sendPushNotification(token: string, title: string, body: string, data?: any) {
    if (!token) return;

    try {
      const message = {
        to: token,
        sound: 'default',
        title,
        body,
        data,
      };

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      
      console.log(`🚀 [NotificationsService] Push sent to ${token.substring(0, 10)}...`);
    } catch (error) {
      console.error('❌ [NotificationsService] Error sending push:', error);
    }
  }

  async findAll(userId: string, limit: number = 50): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findUnread(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId, read: false },
      order: { createdAt: 'DESC' },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { userId, read: false },
    });
  }

  async findOne(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.findOne(id, userId);
    notification.read = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, read: false },
      { read: true },
    );
  }

  async update(id: string, userId: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const notification = await this.findOne(id, userId);
    Object.assign(notification, updateNotificationDto);
    return this.notificationsRepository.save(notification);
  }

  async findByRelatedIdAndType(relatedId: string, type: NotificationType): Promise<Notification | null> {
    return this.notificationsRepository.findOne({
      where: { relatedId, type },
    });
  }

  async updateMessage(id: string, message: string): Promise<void> {
    await this.notificationsRepository.update(id, { message });
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.findOne(id, userId);
    await this.notificationsRepository.remove(notification);
  }
}
