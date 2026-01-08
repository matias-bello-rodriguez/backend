import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../../entities/User.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.rol) {
        throw new ForbiddenException('Usuario no tiene rol asignado');
    }

    // Normalizar roles para comparación segura (manejo de tildes y mayúsculas)
    // El rol del usuario viene de la BD/Token
    const userRoleRaw = String(user.rol); 
    
    // Normalizamos el rol del usuario: "Mecánico" -> "mecanico"
    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    
    const userRoleNormalized = normalize(userRoleRaw);

    // Verificamos si alguno de los roles requeridos coincide con el rol del usuario
    const hasRole = requiredRoles.some((role) => {
        const requiredRoleNormalized = normalize(role);
        return requiredRoleNormalized === userRoleNormalized;
    });
    
    if (!hasRole) {
      throw new ForbiddenException(`No tienes permisos de ${requiredRoles.join(' o ')}`);
    }
    
    return true;
  }
}
