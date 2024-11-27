// Export the main AuthModule
export * from './authentication.module';

export * from './entities/user.entity';
export { Role as RoleEntity } from './entities/role.entity';
export { Feature as FeatuerEntity } from './entities/feature.entity';

export * from './services/authentication.service';
export * from './services/authorization.service';

export * from './controllers/auth.controller';

export * from './guards/jwt-auth.guard';
export * from './guards/role.guard';
export * from './guards/feature.guard';

export * from './strategies/jwt.strategy';

export * from './decorators/auth.decorator';
export * from './decorators/feature.decorator';
export * from './decorators/role.decorator';


