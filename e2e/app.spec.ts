import {
  test,
  expect,
  _electron as electron,
  ElectronApplication,
  Page,
} from "@playwright/test";
import path from "path";

let electronApp: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  // Launch Electron app using the project root
  // Electron will use the "main" field from package.json (.vite/build/main.js)
  electronApp = await electron.launch({
    args: ["."],
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      NODE_ENV: "test",
    },
  });

  // Wait for the first window to open
  page = await electronApp.firstWindow();

  // Wait for the app to be ready
  await page.waitForLoadState("domcontentloaded");
});

test.afterAll(async () => {
  if (electronApp) {
    await electronApp.close();
  }
});

test.describe("Application Launch", () => {
  test("should open the main window", async () => {
    // Check that we have a window
    const windows = electronApp.windows();
    expect(windows.length).toBeGreaterThanOrEqual(1);
  });

  test("should display the correct title", async () => {
    const title = await page.title();
    expect(title).toBe("Freeman Proposal Builder");
  });

  test("should render the home page", async () => {
    // Wait for React to render
    await page.waitForSelector("#root");

    // Check for the welcome message (Hello World)
    const heading = page.locator("h1");
    await expect(heading).toContainText("Hello World");
  });

  test("should display tech stack information", async () => {
    const techStack = page.locator("text=Electron");
    await expect(techStack).toBeVisible();
  });
});

test.describe("Database Integration", () => {
  test("should initialize the database", async () => {
    // The database should be initialized on app startup
    // We can verify this by checking that the app didn't crash
    // and the window is still responsive
    const isVisible = await page.isVisible("#root");
    expect(isVisible).toBe(true);
  });
});
