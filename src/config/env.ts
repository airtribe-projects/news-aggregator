import 'dotenv/config';

const cacheTtlSeconds = Number(process.env.CACHE_TTL_SECONDS) || 600;

export const env = Object.freeze({
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET || 'dev-only-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    newsApiKey: process.env.NEWS_API_KEY ?? '',
    cacheTtlSeconds,
    cacheRefreshSeconds: process.env.CACHE_REFRESH_SECONDS === undefined
        ? cacheTtlSeconds
        : Number(process.env.CACHE_REFRESH_SECONDS) || 0,
});
