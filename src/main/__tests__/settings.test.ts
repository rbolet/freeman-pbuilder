import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { SettingsManager, InvalidSettingsError, settingsSchema, SETTINGS_FILE_NAME } from "../init";

describe("SettingsManager", () => {
  let tempDir: string;
  let manager: SettingsManager;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "settings-test-"));
    manager = new SettingsManager(tempDir);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe("getSettingsPath", () => {
    it("returns path to settings.json in base path", () => {
      expect(manager.getSettingsPath()).toBe(path.join(tempDir, SETTINGS_FILE_NAME));
    });
  });

  describe("exists", () => {
    it("returns false when settings file does not exist", () => {
      expect(manager.exists()).toBe(false);
    });

    it("returns true when settings file exists", () => {
      fs.writeFileSync(path.join(tempDir, SETTINGS_FILE_NAME), '{"userName":"Test"}');

      expect(manager.exists()).toBe(true);
    });
  });

  describe("getSettings", () => {
    it("returns undefined when file does not exist", () => {
      expect(manager.getSettings()).toBeUndefined();
    });

    it("returns parsed settings when file is valid", () => {
      const settings = { userName: "John Doe" };
      fs.writeFileSync(path.join(tempDir, SETTINGS_FILE_NAME), JSON.stringify(settings));

      const result = manager.getSettings();

      expect(result).toEqual(settings);
    });

    it("throws InvalidSettingsError when JSON is invalid", () => {
      fs.writeFileSync(path.join(tempDir, SETTINGS_FILE_NAME), "{ invalid json }");

      expect(() => manager.getSettings()).toThrow(InvalidSettingsError);
      expect(() => manager.getSettings()).toThrow(/invalid JSON/);
    });

    it("throws InvalidSettingsError when schema validation fails", () => {
      fs.writeFileSync(path.join(tempDir, SETTINGS_FILE_NAME), JSON.stringify({ userName: "" }));

      expect(() => manager.getSettings()).toThrow(InvalidSettingsError);
      expect(() => manager.getSettings()).toThrow(/invalid structure/);
    });

    it("throws InvalidSettingsError when required field is missing", () => {
      fs.writeFileSync(path.join(tempDir, SETTINGS_FILE_NAME), JSON.stringify({}));

      expect(() => manager.getSettings()).toThrow(InvalidSettingsError);
    });
  });

  describe("validate", () => {
    it("returns false when settings file does not exist", () => {
      expect(manager.validate()).toBe(false);
    });

    it("returns true when settings file is valid", () => {
      fs.writeFileSync(
        path.join(tempDir, SETTINGS_FILE_NAME),
        JSON.stringify({ userName: "John Doe" })
      );

      expect(manager.validate()).toBe(true);
    });

    it("throws InvalidSettingsError when file is invalid", () => {
      fs.writeFileSync(path.join(tempDir, SETTINGS_FILE_NAME), "not json");

      expect(() => manager.validate()).toThrow(InvalidSettingsError);
    });
  });

  describe("backup", () => {
    it("returns undefined when no settings file exists", () => {
      expect(manager.backup()).toBeUndefined();
    });

    it("creates a timestamped backup file with original contents", () => {
      const originalSettings = { userName: "Original User" };
      fs.writeFileSync(
        path.join(tempDir, SETTINGS_FILE_NAME),
        JSON.stringify(originalSettings, null, 2)
      );

      const backupPath = manager.backup();

      expect(backupPath).toBeDefined();
      expect(backupPath).toMatch(/settings\.backup\.\d{4}-\d{2}-\d{2}T.*\.json$/);
      expect(fs.existsSync(backupPath!)).toBe(true);

      const backupContents = JSON.parse(fs.readFileSync(backupPath!, "utf-8"));
      expect(backupContents).toEqual(originalSettings);
    });

    it("preserves original file after backup", () => {
      const settings = { userName: "Keep Me" };
      fs.writeFileSync(path.join(tempDir, SETTINGS_FILE_NAME), JSON.stringify(settings));

      manager.backup();

      expect(manager.exists()).toBe(true);
      expect(manager.getSettings()).toEqual(settings);
    });
  });

  describe("createSettings", () => {
    it("creates settings file with provided data", () => {
      const result = manager.createSettings({ userName: "New User" });

      expect(result).toEqual({ userName: "New User" });
      expect(manager.exists()).toBe(true);

      const fileContents = JSON.parse(fs.readFileSync(manager.getSettingsPath(), "utf-8"));
      expect(fileContents).toEqual({ userName: "New User" });
    });

    it("creates nested directories if they don't exist", () => {
      const nestedPath = path.join(tempDir, "nested", "deep", "path");
      const nestedManager = new SettingsManager(nestedPath);

      nestedManager.createSettings({ userName: "Nested User" });

      expect(nestedManager.exists()).toBe(true);
      expect(nestedManager.getSettings()).toEqual({ userName: "Nested User" });
    });

    it("backs up existing settings before overwriting", () => {
      const original = { userName: "Original" };
      fs.writeFileSync(path.join(tempDir, SETTINGS_FILE_NAME), JSON.stringify(original));

      manager.createSettings({ userName: "Updated" });

      // New settings should be in place
      expect(manager.getSettings()).toEqual({ userName: "Updated" });

      // Backup should exist with original contents
      const files = fs.readdirSync(tempDir);
      const backupFile = files.find((f) => f.startsWith("settings.backup."));
      expect(backupFile).toBeDefined();

      const backupContents = JSON.parse(fs.readFileSync(path.join(tempDir, backupFile!), "utf-8"));
      expect(backupContents).toEqual(original);
    });

    it("throws InvalidSettingsError for empty userName", () => {
      expect(() => manager.createSettings({ userName: "" })).toThrow(InvalidSettingsError);
      expect(manager.exists()).toBe(false);
    });

    it("formats JSON with indentation", () => {
      manager.createSettings({ userName: "Formatted" });

      const raw = fs.readFileSync(manager.getSettingsPath(), "utf-8");
      expect(raw).toBe('{\n  "userName": "Formatted"\n}');
    });
  });

  describe("settingsSchema", () => {
    it("validates correct settings", () => {
      const result = settingsSchema.safeParse({ userName: "John Doe" });
      expect(result.success).toBe(true);
    });

    it("rejects empty userName", () => {
      const result = settingsSchema.safeParse({ userName: "" });
      expect(result.success).toBe(false);
    });

    it("rejects missing userName", () => {
      const result = settingsSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects non-string userName", () => {
      const result = settingsSchema.safeParse({ userName: 123 });
      expect(result.success).toBe(false);
    });
  });
});
