import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class FeatureGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authorizationService: AuthorizationService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredFeatures = this.reflector.getAllAndOverride<string[]>('features', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredFeatures || requiredFeatures.length === 0) {
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

        for (const feature of requiredFeatures) {
            const hasFeature = await this.authorizationService.validateFeature(userId, tenantId, feature);
            if (hasFeature) {
                return true;
            }
        }

        throw new ForbiddenException(`Access denied. Required feature(s): ${requiredFeatures.join(', ')}`);
    }
}