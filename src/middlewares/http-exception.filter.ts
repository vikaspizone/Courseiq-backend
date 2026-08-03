import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { mailConfig } from '../config/mail.config';
import { sendEmail } from '../utils/send-email';
import { logErrorToFile } from '../utils/logger';
import { trans } from '../utils/trans';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errors: any[] = [];

    if (exception instanceof HttpException) {
      const resContent: any = exception.getResponse();
      if (typeof resContent === 'object' && resContent !== null) {
        message = resContent.message || exception.message;
        errors = resContent.errors || [];
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      message: trans(message),
      errors,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log the error details using the common file logger utility
    logErrorToFile({ error: exception, request, status, context: 'GlobalExceptionFilter' });

    // If it's a 500 / internal error or unexpected error, trigger email alert
    if (status >= 500) {
      this.sendEmailAlert(exception, request, status);
    }

    response.status(status).json(errorResponse);
  }

  private async sendEmailAlert(exception: any, request: Request, status: number) {
    const to = mailConfig.alertEmail;

    if (!to) {
      this.logger.warn('ERROR_ALERT_EMAIL is not configured. Skipping email alert trigger.');
      return;
    }

    const subject = `[CRITICAL ALERT] Courseiq Backend Error - Status ${status}`;
    const html = `
      <h2>An unexpected error occurred in Courseiq Backend</h2>
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      <p><strong>Method:</strong> ${request.method}</p>
      <p><strong>URL:</strong> ${request.url}</p>
      <p><strong>Status Code:</strong> ${status}</p>
      <p><strong>Message:</strong> ${exception instanceof Error ? exception.message : JSON.stringify(exception)}</p>
      <h3>Stack Trace</h3>
      <pre style="background: #f4f4f4; padding: 10px; border: 1px solid #ddd; overflow-x: auto;">
${exception instanceof Error ? exception.stack : 'N/A'}
      </pre>
    `;

    const result = await sendEmail({ to, subject, html });
    if (result.success) {
      this.logger.log(`Error email alert successfully triggered and sent to ${to}`);
    } else {
      this.logger.error('Failed to send error email alert');
      // Log the SMTP failure using the common file logger utility
      logErrorToFile({ error: result.error, context: 'EMAIL SEND FAILURE' });
    }
  }
}
