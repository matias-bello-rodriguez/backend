import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SedesService } from './sedes.service';

@ApiTags('Sedes')
@Controller('sedes')
export class SedesController {
  constructor(private readonly sedesService: SedesService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las sedes activas' })
  findAll() {
    return this.sedesService.findAll();
  }
}
