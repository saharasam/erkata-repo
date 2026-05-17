import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      port: 5173,
      host: "0.0.0.0",
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
        "@components": path.resolve(__dirname, "./components"),
        "@utils": path.resolve(__dirname, "./utils"),
        "@contexts": path.resolve(__dirname, "./contexts"),
        "@pages": path.resolve(__dirname, "./pages"),
      },
    },
  };
});
