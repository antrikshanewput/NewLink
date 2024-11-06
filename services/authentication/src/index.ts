// Export the main AuthModule
export * from './auth/auth.module';

// Export controllers, services, guards, and strategies if users want to access them directly
export * from './auth/auth.controller';
export * from './auth/auth.service';
export * from './auth/jwt-auth.guard';
export * from './auth/jwt.strategy';


// Export the User entity for use in other modules or to extend the model
export * from './auth/user.entity';
