import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'guards/jwt.guard';

export function Authenticate() {
    return UseGuards(JwtAuthGuard);
}