import { z } from "zod";
import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Settings file schema
 */
export const settingsSchema = z.object({
  userName: z.string().min(1),
});

export type Settings = z.infer<typeof settingsSchema>;

/**
 * Custom error for invalid settings file content.
 * Thrown when a settings file exists but contains invalid JSON or doesn't match the schema.
 * Node.js file system errors (read/write) are not wrapped - they bubble up as-is.
 */
export class InvalidSettingsError extends Error {
  name = "InvalidSettingsError";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

/**
 * Options for creating new settings
 */
export interface CreateSettingsOptions {
  userName: string;
}

/**
 * Settings file name
 */
export const SETTINGS_FILE_NAME = "settings.json";

/**
 * Manages user settings file operations.
 */
export class SettingsManager {
  private readonly settingsPath: string;

  constructor(private readonly basePath: string) {
    this.settingsPath = path.join(basePath, SETTINGS_FILE_NAME);
  }

  /**
   * Check if settings file exists
   */
  exists(): boolean {
    return fs.existsSync(this.settingsPath);
  }

  /**
   * Get the full path to the settings file
   */
  getSettingsPath(): string {
    return this.settingsPath;
  }

  /**
   * Read and return settings, or undefined if file doesn't exist.
   * @returns Settings object or undefined if file doesn't exist
   * @throws InvalidSettingsError if file exists but contains invalid JSON or schema
   * @throws Error (from fs) if file exists but cannot be read
   */
  getSettings(): Settings | undefined {
    if (!this.exists()) {
      return undefined;
    }

    const fileContents = fs.readFileSync(this.settingsPath, "utf-8");

    let parsed: unknown;
    try {
      parsed = JSON.parse(fileContents);
    } catch (error) {
      throw new InvalidSettingsError(`Settings file contains invalid JSON: ${this.settingsPath}`, {
        cause: error,
      });
    }

    const result = settingsSchema.safeParse(parsed);
    if (!result.success) {
      throw new InvalidSettingsError(
        `Settings file has invalid structure: ${result.error.message}`,
        { cause: result.error }
      );
    }

    return result.data;
  }

  /**
   * Validate that the current settings file is valid
   * @returns true if valid, false if file doesn't exist
   * @throws SettingsError if file exists but is invalid
   */
  validate(): boolean {
    if (!this.exists()) {
      return false;
    }

    // getSettings will throw if invalid
    this.getSettings();
    return true;
  }

  /**
   * Create a backup of the current settings file
   * @returns the backup file path, or undefined if no file to backup
   * @throws Error (from fs) if backup cannot be created
   */
  backup(): string | undefined {
    if (!this.exists()) {
      return undefined;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(this.basePath, `settings.backup.${timestamp}.json`);

    const contents = fs.readFileSync(this.settingsPath, "utf-8");
    fs.writeFileSync(backupPath, contents, "utf-8");

    return backupPath;
  }

  /**
   * Create a new settings file.
   * If a settings file already exists, it will be backed up first.
   * @param options - Settings data to write
   * @returns The created settings object
   * @throws InvalidSettingsError if options contain invalid data
   * @throws Error (from fs) if file cannot be written
   */
  createSettings(options: CreateSettingsOptions): Settings {
    // Backup existing file if present
    if (this.exists()) {
      this.backup();
    }

    const settings: Settings = {
      userName: options.userName,
    };

    // Validate before writing
    const result = settingsSchema.safeParse(settings);
    if (!result.success) {
      throw new InvalidSettingsError(`Invalid settings data: ${result.error.message}`, {
        cause: result.error,
      });
    }

    // Ensure directory exists
    try {
      fs.mkdirSync(this.basePath, { recursive: true });
    } catch {
      // Directory might already exist, that's fine
    }

    // Write settings file
    fs.writeFileSync(this.settingsPath, JSON.stringify(settings, null, 2), "utf-8");

    return result.data;
  }
}
