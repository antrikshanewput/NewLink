import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { FeatureGuard } from '../guards/feature.guard';

export const FEATURE_KEY = 'features';

export function Feature(...features: string[]) {
    return applyDecorators(
        SetMetadata(FEATURE_KEY, features),
        UseGuards(FeatureGuard)
    );
}