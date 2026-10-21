import { env } from '../config/env';

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

const entries = new Map<string, CacheEntry<unknown>>();

export const getCached = <T>(key: string): T | undefined => {
    const entry = entries.get(key);
    if (!entry) {
        return undefined;
    }
    if (entry.expiresAt <= Date.now()) {
        entries.delete(key);
        return undefined;
    }
    return structuredClone(entry.value) as T;
};

export const setCached = <T>(key: string, value: T, ttlSeconds: number = env.cacheTtlSeconds): void => {
    entries.set(key, { value: structuredClone(value), expiresAt: Date.now() + ttlSeconds * 1000 });
};

export const clearCache = (): void => {
    entries.clear();
};
