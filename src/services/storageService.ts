import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  private memoryCache: Map<string, string> = new Map();

  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        this.memoryCache.set(key, value);
        return JSON.parse(value) as T;
      }
    } catch (e) {
      console.warn(`[StorageService] Failed to read ${key}, using memory cache`, e);
      const memVal = this.memoryCache.get(key);
      if (memVal) {
        return JSON.parse(memVal) as T;
      }
    }
    return defaultValue;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    const stringified = JSON.stringify(value);
    this.memoryCache.set(key, stringified);
    try {
      await AsyncStorage.setItem(key, stringified);
    } catch (e) {
      console.warn(`[StorageService] Failed to persist ${key}`, e);
    }
  }

  async removeItem(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn(`[StorageService] Failed to remove ${key}`, e);
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.warn(`[StorageService] Failed to clear storage`, e);
    }
  }
}

export const storageService = new StorageService();
