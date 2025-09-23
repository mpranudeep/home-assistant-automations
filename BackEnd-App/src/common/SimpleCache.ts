// file-cache.ts
import fs from "fs";
import path from "path";

type CacheEntry<T> = {
  value: T;
  expiry: number;
};

export class SimpleCache<T> {
  private cacheDir: string;

  constructor(
    private ttlMs: number = 1000 * 60 * 20, // default: 20 minutes
    cacheDir: string = ".cache"
  ) {
    this.cacheDir = cacheDir;
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private getFilePath(key: string): string {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_"); // sanitize filename
    return path.join(this.cacheDir, `${safeKey}.json`);
  }

  set(key: string, value: T): void {
    const entry: CacheEntry<T> = {
      value,
      expiry: Date.now() + this.ttlMs,
    };
    fs.writeFileSync(this.getFilePath(key), JSON.stringify(entry,null,2), "utf-8");
  }

  get(key: string): T | null {
    const filePath = this.getFilePath(key);
    if (!fs.existsSync(filePath)) return null;

    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const entry: CacheEntry<T> = JSON.parse(raw);

      if (Date.now() > entry.expiry) {
        fs.unlinkSync(filePath); // expired → delete
        return null;
      }

      return entry.value;
    } catch {
      return null;
    }
  }

  delete(key: string): void {
    const filePath = this.getFilePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  clear(): void {
    for (const file of fs.readdirSync(this.cacheDir)) {
      fs.unlinkSync(path.join(this.cacheDir, file));
    }
  }
}
