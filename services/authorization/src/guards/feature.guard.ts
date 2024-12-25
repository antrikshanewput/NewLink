import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../decorators/feature.decorator';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class FeatureGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredFeatures = this.reflector.getAllAndOverride<string[]>(FEATURE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredFeatures?.length) {
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

            const features = payload.permissions?.[tenantId] || [];
            const hasRequiredFeature = requiredFeatures.some(feature => features.includes(feature));

            if (!hasRequiredFeature) {
                throw new ForbiddenException(`Access denied. Required feature(s): ${requiredFeatures.join(', ')}`);
            }

            return true;
        } catch (error) {
            throw new ForbiddenException('Invalid or expired token');
        }
    }
}