// Export the main AuthModule
export * from './auth.module';

// Export controllers, services, guards, and strategies if users want to access them directly
export * from './controllers/auth.controller';
export * from './services/auth.service';
export * from './guards/jwt-auth.guard';
export * from './strategies/jwt.strategy';
export * from './decorator/auth.decorator';


// Export the User entity for use in other modules or to extend the model
export * from './entity/user.entity';
