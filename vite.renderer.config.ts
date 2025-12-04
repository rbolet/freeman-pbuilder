import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig(async () => {
  const react = (await import("@vitejs/plugin-react")).default;
  const tailwindcss = (await import("@tailwindcss/vite")).default;

  return {
    root: path.resolve(__dirname, "./src"),
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src/renderer"),
        "@components": path.resolve(__dirname, "./src/renderer/components"),
        "@hooks": path.resolve(__dirname, "./src/renderer/hooks"),
      },
    },
  };
});
