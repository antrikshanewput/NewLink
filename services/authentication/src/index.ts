// Export the main AuthModule
export * from './auth.module';

export * from './entities/user.entity';

export * from './services/auth.service';

export * from './controllers/auth.controller';

export * from './guards/jwt-auth.guard';

export * from './strategies/jwt.strategy';

export * from './decorators/auth.decorator';


// Export the User entity for use in other modules or to extend the model
