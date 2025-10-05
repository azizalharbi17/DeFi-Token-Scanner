
import { CACHE_TTL } from '../constants';

interface CacheItem<T> {
    data: T;
    expiry: number;
}

const cache = new Map<string, CacheItem<any>>();

export const cacheService = {
    get<T>(key: string): T | null {
        const item = cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            cache.delete(key);
            return null;
        }
        return item.data;
    },
    set<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
        const item: CacheItem<T> = {
            data,
            expiry: Date.now() + ttl,
        };
        cache.set(key, item);
    },
    clear(): void {
        cache.clear();
    }
};
