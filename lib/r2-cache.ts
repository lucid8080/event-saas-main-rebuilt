import { generateSignedUrl } from '@/lib/r2';

// In-memory cache for signed URLs
interface CacheEntry {
  url: string;
  expiresAt: number;
}

class R2Cache {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 50 * 60 * 1000; // 50 minutes (10 minutes less than signed URL expiry)

  // Get cached signed URL or generate new one
  async getSignedUrl(r2Key: string, expiresIn: number = 3600): Promise<string> {
    const cacheKey = `${r2Key}_${expiresIn}`;
    const now = Date.now();

    // Check if we have a valid cached URL
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.url;
    }

    // Generate new signed URL
    const signedUrl = await generateSignedUrl(r2Key, expiresIn);
    
    // Cache the URL
    this.cache.set(cacheKey, {
      url: signedUrl,
      expiresAt: now + this.CACHE_DURATION
    });

    return signedUrl;
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (entry.expiresAt <= now) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats(): { size: number; entries: Array<{ key: string; expiresAt: number }> } {
    const entries: Array<{ key: string; expiresAt: number }> = [];
    
    this.cache.forEach((entry, key) => {
      entries.push({
        key,
        expiresAt: entry.expiresAt
      });
    });

    return {
      size: this.cache.size,
      entries
    };
  }
}

// Global cache instance
export const r2Cache = new R2Cache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  r2Cache.cleanup();
}, 5 * 60 * 1000);

// Enhanced signed URL generation with caching
export async function getCachedSignedUrl(r2Key: string, expiresIn: number = 3600): Promise<string> {
  try {
    return await r2Cache.getSignedUrl(r2Key, expiresIn);
  } catch (error) {
    console.error('Error getting cached signed URL:', error);
    // Fallback to direct generation
    return generateSignedUrl(r2Key, expiresIn);
  }
}

// Batch signed URL generation with caching
export async function getCachedSignedUrls(r2Keys: string[], expiresIn: number = 3600): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  
  // Process in parallel for better performance
  const promises = r2Keys.map(async (key) => {
    try {
      const url = await getCachedSignedUrl(key, expiresIn);
      results[key] = url;
    } catch (error) {
      console.error(`Error getting cached signed URL for key ${key}:`, error);
      // Skip failed keys
    }
  });

  await Promise.all(promises);
  return results;
} 