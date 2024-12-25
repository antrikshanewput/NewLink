import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { FeatureGuard } from '../guards/feature.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export const FEATURE_KEY = 'features';

export function Feature(...featuresOrArray: (string | string[])[]) {
    const features = featuresOrArray.flat();
    return applyDecorators(
        SetMetadata(FEATURE_KEY, features),
        UseGuards(JwtAuthGuard, FeatureGuard),
    );
}