import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { JwtService } from '@nestjs/jwt';
import { ROLE_KEY } from '../decorators/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles?.length) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        const tenantId = request.headers['tenant'];

        if (!tenantId) {
            throw new ForbiddenException('Tenant not provided in header');
        }

        if (!authHeader) {
            throw new ForbiddenException('Authorization header not provided');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new ForbiddenException('Token not provided in authorization header');
        }

        try {
            const payload: any = this.jwtService.verify(token);

            const roles = payload.roles?.[tenantId] || [];
            const hasRequiredRole = requiredRoles.some(role => roles.includes(role));

            if (!hasRequiredRole) {
                throw new ForbiddenException(`Access denied. Required role(s): ${requiredRoles.join(', ')}`);
            }

            return true;
        } catch (error) {
            throw new ForbiddenException('Invalid or expired token');
        }
    }
}