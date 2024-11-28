import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationService } from '../services/authorization.service';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authorizationService: AuthorizationService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        const tenantId = request.headers['tenant'];

        if (!userId) {
            throw new ForbiddenException('User not authenticated');
        }

        if (!tenantId) {
            throw new ForbiddenException('Tenant not provided in header');
        }

        for (const role of requiredRoles) {
            const hasRole = await this.authorizationService.validateRole(userId, tenantId, role);
            if (hasRole) {
                return true;
            }
        }

        throw new ForbiddenException(`Access denied. Required role(s): ${requiredRoles.join(', ')}`);
    }
}