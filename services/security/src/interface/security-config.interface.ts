export interface RateLimiter {
    windowMs: number; // Time frame for rate limiting
    maxRequests: number; // Maximum allowed requests in the time frame
}
export interface CSRF {
    secret: string; // Secret key for CSRF token
    cookie: boolean; // Enable/Disable CSRF cookie
}
export interface RSAConfig {
  privateKey: string;
  publicKey: string;
}
export interface SecurityOptions {
    sqlInjectionProtection?: boolean; // Enable/Disable SQL Injection Protection
    xssProtection?: boolean; // En
    enableRateLimiter: boolean; // Enable/Disable Rate Limiter
    enableCsrfProtection: boolean; // Enable/Disable CSRF Protection
    csrfProtection?: CSRF; // Enable/Disable CSRF Protection
    rateLimiter?: RateLimiter; // Maximum allowed requests in a given time frame
    useEncryption?: boolean; // use encryption for incoming and outgoing data
    rsaConfig: RSAConfig;
  }
  
  export interface SecurityConfig {
    security: SecurityOptions;
  }
