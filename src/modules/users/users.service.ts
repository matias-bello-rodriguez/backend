import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/User.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Inspection } from '../../entities/Inspection.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Inspection)
    private inspectionRepository: Repository<Inspection>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    // Incluir el password para la validación de login
    const user = await this.usersRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido', 'rut', 'telefono', 'rol', 'fechaCreacion', 'fechaNacimiento', 'saldo', 'foto_url', 'reset_token', 'reset_token_expires']
    });
    
    if (user) {
      console.log(`🔍 [USERS SERVICE] Usuario encontrado: ${email}, Rol: ${user.rol}`);
    } else {
      console.log(`❌ [USERS SERVICE] Usuario no encontrado: ${email}`);
    }
    
    return user;
  }

  async update(id: string, changes: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    if (changes.password) {
      const salt = await bcrypt.genSalt();
      changes.password = await bcrypt.hash(changes.password, salt);
    }

    this.usersRepository.merge(user, changes);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async updatePushToken(id: string, pushToken: string): Promise<User> {
    const user = await this.findOne(id);
    user.pushToken = pushToken;
    return this.usersRepository.save(user);
  }

  async findByRole(role: string): Promise<User[]> {
    return this.usersRepository.find({ where: { rol: role as any } });
  }

  async findActiveMechanics(): Promise<User[]> {
    return this.usersRepository.find({
      where: { rol: 'Mecánico' as any },
    });
  }

  async updateRole(id: string, role: string): Promise<User> {
    const user = await this.findOne(id);
    user.rol = role as any;
    return this.usersRepository.save(user);
  }

  async getRoleStats() {
    const [usuarios, mecanicos, administradores] = await Promise.all([
      this.usersRepository.count({ where: { rol: 'Usuario' as any } }),
      this.usersRepository.count({ where: { rol: 'Mecánico' as any } }),
      this.usersRepository.count({ where: { rol: 'Administrador' as any } }),
    ]);

    return {
      usuarios,
      mecanicos,
      administradores,
      total: usuarios + mecanicos + administradores,
    };
  }

  async validateRutExistence(rut: string): Promise<{ exists: boolean; message?: string }> {
    // 1. Validación Algorítmica (Modulo 11)
    const cleanRut = rut.replace(/[^0-9kK]/g, '');
    if (cleanRut.length < 2) return { exists: false, message: 'RUT inválido (formato)' };
    
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();
    
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = body.length - 1; i >= 0; i--) {
      suma += parseInt(body.charAt(i)) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString();
    
    if (dvCalculado !== dv) {
        return { exists: false, message: 'RUT inválido (dígito verificador)' };
    }

    // 2. Validación de Existencia (API Externa)
    try {
        // Usamos libreapi.cl para verificar existencia
        const response = await fetch(`https://api.libreapi.cl/rut/activities?rut=${cleanRut}`);
        
        if (response.ok) {
            return { exists: true };
        } else {
            // Si no se encuentra, devolvemos false según requerimiento
            return { exists: false, message: 'RUT no encontrado en registros públicos' };
        }
    } catch (error) {
        console.error('Error consultando API RUT:', error);
        // Si la API falla, permitimos pasar si el formato es válido para no bloquear
        return { exists: true };
    }
  }

  async getInspections(userId: string) {
    // Inspections where user is the requester
    const requested = await this.inspectionRepository.find({
      where: { solicitanteId: userId },
      relations: ['publicacion', 'publicacion.vehiculo', 'mecanico', 'horario'],
      order: { fechaCreacion: 'DESC' }
    });

    // Inspections where user owns the vehicle/publication
    const asOwner = await this.inspectionRepository
      .createQueryBuilder('insp')
      .leftJoinAndSelect('insp.publicacion', 'pub')
      .leftJoinAndSelect('pub.vehiculo', 'vehicle')
      .leftJoinAndSelect('insp.mecanico', 'mech')
      .leftJoinAndSelect('insp.horario', 'sch')
      // If user is the vendor of the publication OR the owner of the vehicle
      .where('pub.vendedorId = :userId OR vehicle.userId = :userId', { userId })
      .orderBy('insp.fechaCreacion', 'DESC')
      .getMany();

    // Tag and Combine
    // Use a Map to deduplicate by ID, prioritizing 'SOLICITANTE' if both match (unlikely but safe)
    const unique = new Map();
    
    asOwner.forEach(i => unique.set(i.id, { ...i, relationRole: 'DUENO' }));
    requested.forEach(i => unique.set(i.id, { ...i, relationRole: 'SOLICITANTE' }));
    
    return Array.from(unique.values()).sort((a: any,b: any) => 
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );
  }
}


