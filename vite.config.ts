import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // 게이트웨이 CORS가 localhost:3000만 허용한다.
    port: 3000,
    strictPort: true,
  },
});
