import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@db";
import passport from "passport";
import { setupGoogleAuth } from "./auth";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Extend the session interface to include walletAddress
declare module 'express-session' {
  interface SessionData {
    walletAddress?: string;
  }
}

// Export the express app for serverless use
export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up session middleware
const PgSession = connectPgSimple(session);
app.use(session({
  store: new PgSession({
    pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'lithochain_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax'
  }
}));

// Initialize passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Setup Google authentication
setupGoogleAuth();

// Add CORS headers for Vercel deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Register routes and setup static serving
(async () => {
  // Register API routes and get the server instance
  const server = await registerRoutes(app);
  
  // Setup client serving based on environment
  if (process.env.NODE_ENV === 'development') {
    // In development, use Vite middleware
    await setupVite(app, server);
  } else {
    // In production, serve static files
    const distPath = path.resolve(__dirname, "public");
    if (!fs.existsSync(distPath)) {
      throw new Error(
        `Could not find the build directory: ${distPath}, make sure to build the client first`,
      );
    }
    serveStatic(app);
  }
})();

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }
});

// Export the handler for Vercel
export default app;
