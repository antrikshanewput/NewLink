import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../guards/role.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export const ROLE_KEY = 'roles';

export function Role(...rolesOrArray: (string | string[])[]) {
    const roles = rolesOrArray.flat();
    return applyDecorators(
        SetMetadata(ROLE_KEY, roles),
        UseGuards(JwtAuthGuard, RoleGuard),
    );
}