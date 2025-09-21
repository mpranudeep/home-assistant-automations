// simple-cache.ts
type CacheEntry<T> = {
  value: T;
  expiry: number;
};

export class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  constructor(private ttlMs: number = 1000 * 60 * 20) {} 

  set(key: string, value: T) {
    this.cache.set(key, { value, expiry: Date.now() + this.ttlMs });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }
}
