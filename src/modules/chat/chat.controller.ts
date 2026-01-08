import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @ApiOperation({ summary: 'Enviar mensaje' })
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.chatService.create(createMessageDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Obtener todas las conversaciones del usuario' })
  findUserConversations(@Request() req) {
    return this.chatService.findUserConversations(req.user.id);
  }

  @Get('conversation/:otherUserId')
  @ApiOperation({ summary: 'Obtener conversación con otro usuario' })
  findConversation(@Request() req, @Param('otherUserId') otherUserId: string) {
    return this.chatService.findConversation(req.user.id, otherUserId);
  }

  @Patch('messages/:id/read')
  @ApiOperation({ summary: 'Marcar mensaje como leído' })
  markAsRead(@Param('id') id: string) {
    return this.chatService.markAsRead(id);
  }

  @Patch('conversation/:otherUserId/read')
  @ApiOperation({ summary: 'Marcar toda la conversación como leída' })
  markConversationAsRead(@Request() req, @Param('otherUserId') otherUserId: string) {
    return this.chatService.markConversationAsRead(req.user.id, otherUserId);
  }
}
