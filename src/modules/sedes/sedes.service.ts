import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sede } from '../../entities/Sede.entity';

@Injectable()
export class SedesService {
  constructor(
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
  ) {}

  async findAll() {
    return this.sedeRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }
}
