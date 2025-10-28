/**
 * Configuration manager with concurrent access support
 */

import { AtomicStorage } from './atomic-storage.js';

export interface ConfigManagerOptions {
  serviceName: string;
  baseDir?: string;
}

export class ConfigManager<TConfig = Record<string, any>> {
  private storage: AtomicStorage;
  private configFile = 'config.json';

  constructor(options: ConfigManagerOptions) {
    this.storage = new AtomicStorage({
      serviceName: options.serviceName,
      baseDir: options.baseDir,
    });
  }

  /**
   * Load configuration
   */
  async load(): Promise<TConfig | null> {
    return this.storage.read<TConfig>(this.configFile);
  }

  /**
   * Save configuration
   */
  async save(config: TConfig): Promise<void> {
    await this.storage.write(this.configFile, config);
  }

  /**
   * Update configuration (read-modify-write)
   */
  async update(updateFn: (current: TConfig | null) => TConfig): Promise<TConfig> {
    return this.storage.update(this.configFile, updateFn);
  }

  /**
   * Get a specific config value
   */
  async get<K extends keyof TConfig>(key: K): Promise<TConfig[K] | undefined> {
    const config = await this.load();
    return config?.[key];
  }

  /**
   * Set a specific config value
   */
  async set<K extends keyof TConfig>(key: K, value: TConfig[K]): Promise<void> {
    await this.update((current) => ({
      ...(current || ({} as TConfig)),
      [key]: value,
    }));
  }

  /**
   * Delete configuration
   */
  async delete(): Promise<void> {
    await this.storage.delete(this.configFile);
  }

  /**
   * Get config file path
   */
  getPath(): string {
    return this.storage.getBaseDir();
  }

  /**
   * Check if config file exists
   */
  async fileExists(): Promise<boolean> {
    return this.storage.fileExists(this.configFile);
  }
}

