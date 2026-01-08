import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../entities/User.entity';

export class CreateUserDto {
  @ApiProperty({ example: '12.345.678-9', description: 'RUT del usuario' })
  @IsString()
  @IsNotEmpty()
  rut: string;

  @ApiProperty({ example: 'Juan', description: 'Primer nombre' })
  @IsString()
  @IsNotEmpty()
  primerNombre: string;

  @ApiPropertyOptional({ example: 'Carlos', description: 'Segundo nombre' })
  @IsString()
  @IsOptional()
  segundoNombre?: string;

  @ApiProperty({ example: 'Pérez', description: 'Primer apellido' })
  @IsString()
  @IsNotEmpty()
  primerApellido: string;

  @ApiPropertyOptional({ example: 'González', description: 'Segundo apellido' })
  @IsString()
  @IsOptional()
  segundoApellido?: string;

  @ApiProperty({ example: 'juan@example.com', description: 'Correo electrónico' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '912345678', description: 'Número de teléfono' })
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña (min 8 caracteres, mayúscula, minúscula, número y caracter especial)' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un caracter especial',
  })
  password: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USUARIO, description: 'Rol del usuario' })
  @IsEnum(UserRole)
  @IsOptional()
  rol?: UserRole;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg', description: 'URL de la foto de perfil' })
  @IsString()
  @IsOptional()
  foto_url?: string;
}
