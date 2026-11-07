import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { api } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || env.corsOrigins.includes(origin)),
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '100kb' }));

app.use('/api', api);

// Production: serve the built client (npm run build) from the same origin.
// "/" → landing page, "/admin/*" → admin app; both are handled client-side by index.html.
const clientDist = fileURLToPath(new URL('../../client/dist', import.meta.url));
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use('/assets', express.static(path.join(clientDist, 'assets'), { immutable: true, maxAge: '1y' }));
  app.use(express.static(clientDist, { index: false, maxAge: '1d' }));
  app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(notFoundHandler);
app.use(errorHandler);
