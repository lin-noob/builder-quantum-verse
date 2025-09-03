import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
    },
    proxy: {
      "/api": {
        target: "http://192.168.1.128:8099",
        changeOrigin: true,
        secure: false,
        timeout: 10000, // 减少到10秒，快速失败
        proxyTimeout: 10000, // 代理超时
        rewrite: (path) => {
          const newPath = path.replace(/^\/api/, "");
          // 🚀 仅在调试模式下打印代理日志
          if (process.env.DEBUG_PROXY === "true") {
            console.log(`Proxy rewrite: ${path} -> ${newPath}`);
          }
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
          
          // 🚀 仅在调试模式下打印请求/响应日志
          if (process.env.DEBUG_PROXY === "true") {
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
          }
        },
      },
      "/quote/api": {
        target: "http://192.168.1.128:8099",
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        configure: (proxy, _options) => {
          proxy.on("error", (err, req, res) => {
            console.error(`❌ Backend server unreachable: ${err.message}`);

            // Send a proper error response
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
        },
      },
    },
    allowedHosts: ["lt.eecart.com"],
  },
  // 🚀 优化构建配置
  build: {
    outDir: "dist/spa",
    sourcemap: mode !== "production",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // 🎯 代码分割 - 将第三方库拆分为独立chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 图表库单独chunk
            if (id.includes('recharts') || id.includes('chart.js')) {
              return 'charts-vendor';
            }
            // 3D库单独chunk
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            // React生态相关
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // UI库
            if (id.includes('lucide') || id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // 其他第三方库
            return 'vendor';
          }
        },
      },
    },
  },
  // 🚀 开发时预构建优化 - 提升冷启动速度
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      'chart.js',
      '@tanstack/react-query',
      'lucide-react',
    ],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));
