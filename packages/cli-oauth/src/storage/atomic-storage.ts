/**
 * Atomic file storage
 * 
 * Uses atomic write operations (write-to-temp + rename) to prevent
 * file corruption. Simple, dependency-free, and async-first.
 */

import { readFile, writeFile, mkdir, rename, unlink, access } from 'fs/promises';
import { join } from 'path';
import { homedir, tmpdir } from 'os';
import { constants } from 'fs';

export interface StorageOptions {
  /**
   * Service name (e.g., 'atlassian-tools', 'gitlab-cli')
   */
  serviceName: string;

  /**
   * Base directory (default: ~/.{serviceName})
   */
  baseDir?: string;
}

export class AtomicStorage {
  private baseDir: string;

  constructor(options: StorageOptions) {
    this.baseDir = options.baseDir || join(homedir(), `.${options.serviceName}`);
    this.ensureDir();
  }

  /**
   * Get the base directory path
   */
  getBaseDir(): string {
    return this.baseDir;
  }

  /**
   * Ensure base directory exists
   */
  private async ensureDir(): Promise<void> {
    try {
      await access(this.baseDir, constants.R_OK | constants.W_OK);
    } catch {
      await mkdir(this.baseDir, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Check if file exists
   */
  private async exists(filePath: string): Promise<boolean> {
    try {
      await access(filePath, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read a file
   */
  async read<T>(filename: string, defaultValue?: T): Promise<T | null> {
    const filePath = join(this.baseDir, filename);
    
    if (!(await this.exists(filePath))) {
      return defaultValue || null;
    }

    try {
      const content = await readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return defaultValue || null;
      }
      throw new Error(`Failed to read ${filename}: ${error.message}`);
    }
  }

  /**
   * Write a file atomically
   * Uses write-to-temp + atomic-rename pattern to prevent corruption
   */
  async write<T>(filename: string, data: T): Promise<void> {
    const filePath = join(this.baseDir, filename);
    const tempPath = join(tmpdir(), `${filename}.${Date.now()}.${process.pid}.tmp`);

    // Ensure directory exists
    await this.ensureDir();

    try {
      // Write to temp file
      const content = JSON.stringify(data, null, 2);
      await writeFile(tempPath, content, { mode: 0o600, encoding: 'utf-8' });

      // Atomic rename (atomic on POSIX, mostly atomic on Windows)
      await rename(tempPath, filePath);
    } catch (error: any) {
      // Clean up temp file on error
      try {
        if (await this.exists(tempPath)) {
          await unlink(tempPath);
        }
      } catch {}
      throw new Error(`Failed to write ${filename}: ${error.message}`);
    }
  }

  /**
   * Update a file atomically (read-modify-write)
   * Note: Not safe for concurrent access, but prevents corruption
   */
  async update<T>(
    filename: string,
    updateFn: (current: T | null) => T,
    defaultValue?: T
  ): Promise<T> {
    const filePath = join(this.baseDir, filename);

    try {
      // Read current value
      let current: T | null = defaultValue || null;
      if (await this.exists(filePath)) {
        const content = await readFile(filePath, 'utf-8');
        current = JSON.parse(content);
      }

      // Apply update function
      const updated = updateFn(current);

      // Write atomically
      const tempPath = join(tmpdir(), `${filename}.${Date.now()}.${process.pid}.tmp`);
      const content = JSON.stringify(updated, null, 2);
      await writeFile(tempPath, content, { mode: 0o600, encoding: 'utf-8' });
      await rename(tempPath, filePath);

      return updated;
    } catch (error: any) {
      throw new Error(`Failed to update ${filename}: ${error.message}`);
    }
  }

  /**
   * Delete a file
   */
  async delete(filename: string): Promise<void> {
    const filePath = join(this.baseDir, filename);
    
    if (!(await this.exists(filePath))) {
      return;
    }

    try {
      await unlink(filePath);
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw new Error(`Failed to delete ${filename}: ${error.message}`);
      }
    }
  }

  /**
   * Check if a file exists (by filename)
   */
  async fileExists(filename: string): Promise<boolean> {
    return this.exists(join(this.baseDir, filename));
  }
}

