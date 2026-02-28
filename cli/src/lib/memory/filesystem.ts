/**
 * OpenMemory Plus - FileSystem Abstraction
 * Enables dependency injection for testing
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

// ============ FileSystem Interface ============

export interface FileSystem {
  existsSync(filePath: string): boolean;
  readFileSync(filePath: string, encoding: 'utf-8'): string;
  writeFileSync(filePath: string, content: string): void;
  mkdirSync(filePath: string, options?: { recursive: boolean }): void;
}

// ============ Node.js FileSystem Implementation ============

export const nodeFs: FileSystem = {
  existsSync: (filePath: string) => fs.existsSync(filePath),
  readFileSync: (filePath: string, encoding: 'utf-8') => fs.readFileSync(filePath, encoding),
  writeFileSync: (filePath: string, content: string) => fs.writeFileSync(filePath, content, 'utf-8'),
  mkdirSync: (filePath: string, options?: { recursive: boolean }) => {
    fs.mkdirSync(filePath, options);
  },
};

// ============ Mock FileSystem for Testing ============

export interface MockFileSystemOptions {
  initialFiles?: Record<string, string>;
}

export function createMockFs(options: MockFileSystemOptions = {}): FileSystem & {
  getWrittenFiles(): Record<string, string>;
  reset(): void;
} {
  const files: Map<string, string> = new Map();
  const directories: Set<string> = new Set();

  // Initialize with any provided files
  if (options.initialFiles) {
    for (const [filePath, content] of Object.entries(options.initialFiles)) {
      files.set(filePath, content);
      // Also register parent directories
      let dir = path.dirname(filePath);
      while (dir && dir !== '.' && dir !== '/') {
        directories.add(dir);
        dir = path.dirname(dir);
      }
    }
  }

  return {
    existsSync: (filePath: string) => {
      return files.has(filePath) || directories.has(filePath);
    },
    readFileSync: (filePath: string, _encoding: 'utf-8') => {
      const content = files.get(filePath);
      if (content === undefined) {
        throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
      }
      return content;
    },
    writeFileSync: (filePath: string, content: string) => {
      files.set(filePath, content);
      // Also register parent directories
      let dir = path.dirname(filePath);
      while (dir && dir !== '.' && dir !== '/') {
        directories.add(dir);
        dir = path.dirname(dir);
      }
    },
    mkdirSync: (filePath: string, _options?: { recursive: boolean }) => {
      directories.add(filePath);
      // Also register parent directories
      let dir = path.dirname(filePath);
      while (dir && dir !== '.' && dir !== '/') {
        directories.add(dir);
        dir = path.dirname(dir);
      }
    },
    getWrittenFiles: () => {
      return Object.fromEntries(files);
    },
    reset: () => {
      files.clear();
      directories.clear();
    },
  };
}

// ============ Path Utilities ============

export function ensureDir(fs: FileSystem, dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function safeReadJson<T>(fs: FileSystem, filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return defaultValue;
  }
}

export function safeWriteJson<T>(fs: FileSystem, filePath: string, data: T): void {
  ensureDir(fs, path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

