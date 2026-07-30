import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { Request } from 'express';

const logger = new Logger('FileLogger');

interface LogDetails {
  error: any;
  context?: string;
  request?: Request;
  status?: number;
}

/**
 * Reusable utility to log error messages and request details to a date-stamped file in the logs/ directory.
 */
export function logErrorToFile({ error, context, request, status }: LogDetails): void {
  try {
    const logDir = path.resolve(__dirname, '..', '..', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const today = new Date().toISOString().split('T')[0];
    const logFilePath = path.join(logDir, `error-${today}.log`);

    let requestInfo = '';
    if (request) {
      requestInfo = `
Method: ${request.method}
URL: ${request.url}
Status: ${status !== undefined ? status : 'N/A'}
Headers: ${JSON.stringify(request.headers, null, 2)}
Body: ${JSON.stringify(request.body, null, 2)}`;
    }

    const contextPrefix = context ? ` [${context}]` : '';
    const logMessage = `
[${new Date().toISOString()}]${contextPrefix}${requestInfo}
Message: ${error instanceof Error ? error.message : JSON.stringify(error)}
Stack: ${error instanceof Error ? error.stack : 'N/A'}
--------------------------------------------------------------------------------
`;

    fs.appendFileSync(logFilePath, logMessage, 'utf8');
  } catch (err) {
    logger.error('Failed to write error log to file', err);
  }
}
