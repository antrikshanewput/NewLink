import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../guards/role.guard';

export const ROLE_KEY = 'roles';

export function Role(...roles: string[]) {
    return applyDecorators(
        SetMetadata(ROLE_KEY, roles), 
        UseGuards(RoleGuard)
    );
}