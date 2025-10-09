import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// const serverurl = "https://www.sellernxt.com/api";
const serverurl = 'http://192.168.1.128:8099';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode),
    __SUPPRESS_RECHARTS_WARNINGS__: true,
    __REACT_DEVTOOLS_SUPPRESS_WARNINGS__: true,
  },
  esbuild: {
    // Drop console statements in production, but keep them in development with filtering
    drop: mode === "production" ? ["console", "debugger"] : [],
    // Suppress specific warnings during build
    logOverride: {
      "this-is-undefined-in-esm": "silent",
      "ignored-bare-import": "silent",
    },
  },
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared", "./node_modules", "./"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
    },
    proxy: {
      "/api": {
        target: serverurl,
        changeOrigin: true,
        secure: false,
        timeout: 10000, // 减少到10秒，快速失败
        proxyTimeout: 10000, // 代理超时
        rewrite: (path) => {
          const newPath = path.replace(/^\/api/, "");
          console.log(`Proxy rewrite: ${path} -> ${newPath}`);
          return newPath;
        },
        configure: (proxy, _options) => {
          proxy.on("error", (err, req, res) => {
            console.error(`❌ Backend server unreachable: ${err.message}`);
            
            // Send a proper error response instead of hanging
            if (!res.headersSent) {
              res.writeHead(503, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  error: "Backend server unavailable",
                  message:
                    "Could not connect to API server at 192.168.1.128:8099",
                  code: "CONNECTION_FAILED",
                }),
              );
            }
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url,
            );
          });
        },
      },
      "/quote/api": serverurl,
      "/admin/api": serverurl,
    },
    allowedHosts: ["lt.eecart.com"],
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));
