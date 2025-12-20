import { vi, beforeAll, afterAll, afterEach } from "vitest";
import path from "path";
import fs from "fs";
import os from "os";

// Create a unique temp directory for test databases
export const TEST_DATA_DIR = path.join(
  os.tmpdir(),
  "pbuilder-test-" + process.pid
);

// Test database and migrations paths
export const TEST_DB_PATH = path.join(TEST_DATA_DIR, "test.db");

// Mock Electron's app module for any code that imports it directly
vi.mock("electron", () => ({
  app: {
    isPackaged: false,
    getPath: (name: string) => {
      if (name === "userData") {
        return TEST_DATA_DIR;
      }
      return "";
    },
    on: vi.fn(),
    quit: vi.fn(),
  },
}));

beforeAll(() => {
  // Create test data directory
  if (!fs.existsSync(TEST_DATA_DIR)) {
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
  }
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  // Clean up test data directory
  if (fs.existsSync(TEST_DATA_DIR)) {
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  }
});
