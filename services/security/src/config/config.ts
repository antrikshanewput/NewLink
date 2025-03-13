export default () => ({
    "SECURITY_ENABLE_XSS": process.env.SECURITY_ENABLE_XSS || true,
    "SECURITY_ENABLE_SQL_INJECTION": process.env.SECURITY_ENABLE_SQL_INJECTION || true,
    "SECURITY_ENABLE_RATE_LIMITER": process.env.SECURITY_ENABLE_RATE_LIMITER || true,
    "SECURITY_ENABLE_CSRF": process.env.SECURITY_ENABLE_CSRF || true,
    "RATE_LIMITER_WINDOW_MS": process.env.RATE_LIMITER_WINDOW_MS || 15 * 60 * 1000,
    "RATE_LIMITER_MAX_REQUESTS": process.env.RATE_LIMITER_MAX_REQUESTS || 100,
    "CSRF_SECRET": process.env.CSRF || 'default-secret',
    "CSRF_COOKIE": process.env.CSRF_COOKIE || true,
});
