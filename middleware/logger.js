import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  const userAgent = req.headers['user-agent'];
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${path} - ${ip}`);

  res.on('finish', () => {
    const statusCode = res.statusCode;
    const logMessage = `[${timestamp}] ${method} ${path} ${statusCode} - ${ip}\n`;
    
    const logFilePath = path.join(logsDir, 'app.log');
    fs.appendFileSync(logFilePath, logMessage, 'utf8');
  });

  next();
};
