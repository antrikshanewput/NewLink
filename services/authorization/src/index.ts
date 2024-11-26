export * from './authorization.module';

export { Role as RoleEntity } from './entities/role.entity';
export { Feature as FeatuerEntity } from './entities/feature.entity';
export { UserRole as UserRoleEntity } from './entities/user-role.entity';
export { UserFeature as UserFeatureEntity } from './entities/user-feature.entity';
export * from './services/authorization.service';

export * from './authorization.types';

export * from './decorators/feature.decorator';
export * from './decorators/role.decorator';

export * from './guards/feature.guard';
export * from './guards/role.guard';
