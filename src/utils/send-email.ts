import * as nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config';
import { Logger } from '@nestjs/common';

const logger = new Logger('EmailUtility');

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Reusable utility function to send emails using nodemailer and SMTP configurations.
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: any }> {
  const { host, port, user, pass, from: defaultFrom } = mailConfig;

  if (!host || !port || !user || !pass) {
    const errorMsg = 'SMTP configuration is incomplete. Skipping sending email.';
    logger.warn(errorMsg);
    return { success: false, error: new Error(errorMsg) };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: options.from || defaultFrom || user,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    logger.log(`Email successfully sent to ${options.to}`);
    return { success: true };
  } catch (err) {
    logger.error(`Failed to send email to ${options.to}`, err);
    return { success: false, error: err };
  }
}
