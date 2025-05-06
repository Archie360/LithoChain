// Serverless API entrypoint for Vercel deployment
import express from 'express';
import { registerRoutes } from '../server/routes.js';
import { serveStatic } from '../server/vite.js';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from '../db/index.js';

// Create Express app for serverless use
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup session middleware with Postgres
const PgSession = connectPgSimple(session);
app.use(session({
  store: new PgSession({
    pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'lithochain_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

// Register API routes
await registerRoutes(app);

// Serve static files
serveStatic(app);

// Create a server handler for Vercel
export default function handler(req, res) {
  // Pass the request to our Express app
  return app(req, res);
}
