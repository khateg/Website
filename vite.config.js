import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import financialsHandler from "./api/financials.js";

const financialsApi = () => ({
  name: "financials-api",
  configureServer(server) {
    server.middlewares.use("/api/financials", async (req, res, next) => {
      if (!["GET", "POST"].includes(req.method)) return next();

      try {
        if (req.method === "POST") {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          req.body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
        }

        const response = {
          status(code) {
            res.statusCode = code;
            return response;
          },
          json(data) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          },
          setHeader(name, value) {
            res.setHeader(name, value);
          },
        };

        await financialsHandler(req, response);
      } catch (error) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: error.message || "Invalid request" }));
      }
    });
  },
});

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [react(), financialsApi()],
    server: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
