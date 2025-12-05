import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import fs from "fs";
import path from "path";

// Copy native dependencies to the .vite/build directory before packaging
function copyNativeDeps(buildPath: string) {
  const nodeModulesSrc = path.join(__dirname, "node_modules", "better-sqlite3");
  const nodeModulesDest = path.join(
    buildPath,
    "node_modules",
    "better-sqlite3"
  );

  if (fs.existsSync(nodeModulesSrc)) {
    fs.cpSync(nodeModulesSrc, nodeModulesDest, { recursive: true });
    console.log("[Forge] Copied better-sqlite3 to build output");

    // Also copy bindings dependency
    const bindingsSrc = path.join(__dirname, "node_modules", "bindings");
    const bindingsDest = path.join(buildPath, "node_modules", "bindings");
    if (fs.existsSync(bindingsSrc)) {
      fs.cpSync(bindingsSrc, bindingsDest, { recursive: true });
      console.log("[Forge] Copied bindings to build output");
    }

    // Copy file-uri-to-path dependency
    const fileUriSrc = path.join(__dirname, "node_modules", "file-uri-to-path");
    const fileUriDest = path.join(
      buildPath,
      "node_modules",
      "file-uri-to-path"
    );
    if (fs.existsSync(fileUriSrc)) {
      fs.cpSync(fileUriSrc, fileUriDest, { recursive: true });
      console.log("[Forge] Copied file-uri-to-path to build output");
    }
  }
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: {
      // Unpack native modules - they can't run from inside asar
      unpack: "**/node_modules/{better-sqlite3,bindings,file-uri-to-path}/**/*",
    },
  },
  hooks: {
    packageAfterCopy: async (_config, buildPath) => {
      copyNativeDeps(buildPath);
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Automatically unpack native modules from asar
    new AutoUnpackNativesPlugin({}),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
