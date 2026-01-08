import { IsNotEmpty, IsString, IsInt, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'ABCD12', description: 'Patente del vehículo' })
  @IsString()
  @IsNotEmpty()
  patente: string;

  @ApiProperty({ example: '1', description: 'Dígito verificador de la patente', required: false })
  @IsString()
  @IsOptional()
  dvPatente?: string;

  @ApiProperty({ example: 'Toyota', description: 'Marca del vehículo' })
  @IsString()
  @IsNotEmpty()
  marca: string;

  @ApiProperty({ example: 'Corolla', description: 'Modelo del vehículo' })
  @IsString()
  @IsNotEmpty()
  modelo: string;

  @ApiProperty({ example: 2020, description: 'Año del vehículo' })
  @IsInt()
  @IsNotEmpty()
  anio: number;

  @ApiProperty({ example: '1.8 XEI MT', description: 'Versión del vehículo', required: false })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiProperty({ example: 50000, description: 'Kilometraje del vehículo', required: false })
  @IsInt()
  @IsOptional()
  kilometraje?: number;

  @ApiProperty({ example: 'Rojo', description: 'Color del vehículo', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: 'VF1LZBC16EC273765', description: 'Número VIN', required: false })
  @IsString()
  @IsOptional()
  vin?: string;

  @ApiProperty({ example: 'M4RJ714N291083', description: 'Número de motor', required: false })
  @IsString()
  @IsOptional()
  numeroMotor?: string;

  @ApiProperty({ example: '1800', description: 'Cilindrada del motor', required: false })
  @IsString()
  @IsOptional()
  motor?: string;

  @ApiProperty({ example: 'Gasolina', description: 'Tipo de combustible', required: false })
  @IsString()
  @IsOptional()
  combustible?: string;

  @ApiProperty({ example: 'Manual', description: 'Tipo de transmisión', required: false })
  @IsString()
  @IsOptional()
  transmision?: string;

  @ApiProperty({ example: 4, description: 'Número de puertas', required: false })
  @IsInt()
  @IsOptional()
  puertas?: number;

  @ApiProperty({ example: 'Automovil', description: 'Tipo de vehículo', required: false })
  @IsString()
  @IsOptional()
  tipoVehiculo?: string;

  @ApiProperty({ example: 'Noviembre', description: 'Mes de revisión técnica', required: false })
  @IsString()
  @IsOptional()
  mesRevisionTecnica?: string;

  @ApiProperty({ example: 'uuid-del-usuario', description: 'ID del propietario' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
