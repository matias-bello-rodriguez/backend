import { Controller, Request, Post, UseGuards, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Login exitoso, retorna token JWT.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(@Request() req) {
    console.log('🔵 [AUTH CONTROLLER] Login request recibido:', {
      email: req.user?.email,
      userId: req.user?.id
    });
    
    try {
      const result = await this.authService.login(req.user);
      console.log('✅ [AUTH CONTROLLER] Login exitoso');
      return result;
    } catch (error) {
      console.error('❌ [AUTH CONTROLLER] Error en login:', error.message);
      throw error;
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  async register(@Body() createUserDto: CreateUserDto) {
    console.log('🔷 [AUTH CONTROLLER] Register request recibido:', {
      email: createUserDto.email,
      body: Object.keys(createUserDto),
    });
    
    try {
      const result = await this.authService.register(createUserDto);
      console.log('✅ [AUTH CONTROLLER] Register exitoso');
      return result;
    } catch (error) {
      console.error('❌ [AUTH CONTROLLER] Error en register:', error.message);
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user.userId);
  }

  @Post('social-login')
  @ApiOperation({ summary: 'Login con proveedor social' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        provider: { type: 'string' },
        providerId: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        avatarUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login social exitoso.' })
  async socialLogin(@Body() data: any) {
    return this.authService.socialLogin(data);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Email de recuperación enviado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('verify-token')
  @ApiOperation({ summary: 'Verificar token de recuperación' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        token: { type: 'string' },
      },
    },
  })
  async verifyToken(@Body() body: { email: string; token: string }) {
    return this.authService.verifyResetToken(body.email, body.token);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        token: { type: 'string' },
        newPassword: { type: 'string' },
      },
    },
  })
  async resetPassword(@Body() body: { email: string; token: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.token, body.newPassword);
  }
}
