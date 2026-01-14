import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    console.log('🔵 [AUTH SERVICE] Login para usuario:', user.email);
    console.log('👤 [AUTH SERVICE] Datos de usuario recibidos:', JSON.stringify(user));
    
    const payload = { email: user.email, sub: user.id, rol: user.rol };
    const access_token = this.jwtService.sign(payload);
    
    console.log('✅ [AUTH SERVICE] Token generado exitosamente');
    
    return {
      access_token,
      usuario: user,
    };
  }

  async register(createUserDto: CreateUserDto) {
    console.log('🔵 [AUTH SERVICE] Register iniciado con:', {
      email: createUserDto.email,
      primerNombre: createUserDto.primerNombre,
    });
    
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    
    if (existingUser) {
      console.log('❌ [AUTH SERVICE] Email ya existe:', createUserDto.email);
      throw new UnauthorizedException('Email already exists');
    }
    
    console.log('✅ [AUTH SERVICE] Creando usuario...');
    const user = await this.usersService.create(createUserDto);
    console.log('✅ [AUTH SERVICE] Usuario creado exitosamente:', user.id);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    
    // Generar token JWT para el nuevo usuario
    const payload = { email: user.email, sub: user.id, rol: user.rol };
    const access_token = this.jwtService.sign(payload);
    
    console.log('✅ [AUTH SERVICE] Token generado, registro completado');
    
    return {
      access_token,
      usuario: result,
    };
  }

  async socialLogin(data: {
    email: string;
    provider: string;
    providerId: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }) {
    let user = await this.usersService.findByEmail(data.email);

    if (!user) {
      // Crear nuevo usuario desde login social
      const createUserDto: CreateUserDto = {
        email: data.email,
        primerNombre: data.firstName || '',
        primerApellido: data.lastName || '',
        password: Math.random().toString(36).slice(-8), // Password temporal
        rut: '',
        telefono: '',
      };
      
      user = await this.usersService.create(createUserDto);
      
      if (data.avatarUrl) {
        await this.usersService.update(user.id, { foto_url: data.avatarUrl } as any);
      }
    }

    const payload = { email: user.email, sub: user.id, rol: user.rol };
    return {
      access_token: this.jwtService.sign(payload),
      usuario: user,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email not found');
    }

    // Generar token numérico de 6 dígitos
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Expira en 1 hora

    await this.usersService.update(user.id, {
      reset_token: token,
      reset_token_expires: expires,
    });

    // TODO: Implementar envío de email real con el token
    console.log(`📧 [AUTH] Recovery Token for ${email}: ${token}`);
    
    return {
      message: 'Token enviado al correo',
      email: user.email,
      // DEV ONLY: devolver token para pruebas
      debug_token: token 
    };
  }

  async verifyResetToken(email: string, token: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.reset_token !== token) {
      throw new UnauthorizedException('Token inválido');
    }

    if (new Date() > user.reset_token_expires) {
      throw new UnauthorizedException('El token ha expirado');
    }

    return { valid: true, message: 'Token válido' };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    await this.verifyResetToken(email, token);
    const user = await this.usersService.findByEmail(email);
    
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.usersService.update(user.id, {
      password: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async getUserProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
