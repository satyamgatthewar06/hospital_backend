import fs from 'fs';
import * as pathModule from 'path';
import { fileURLToPath } from 'url';

const __dirname = pathModule.dirname(fileURLToPath(import.meta.url));
const logsDir = pathModule.join(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const routePath = req.path;
  const userAgent = req.headers['user-agent'];
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${routePath} - ${ip}`);

  res.on('finish', () => {
    const statusCode = res.statusCode;
    const logMessage = `[${timestamp}] ${method} ${routePath} ${statusCode} - ${ip}\n`;
    
    const logFilePath = pathModule.join(logsDir, 'app.log');
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
  });

  next();
};
