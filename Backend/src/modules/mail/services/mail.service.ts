import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IMailService } from '../interfaces';
import {
  activationEmailTemplate,
  passwordResetEmailTemplate,
} from '../templates';

@Injectable()
export class MailService implements IMailService {
  private readonly logger = new Logger(MailService.name);
  private transporter!: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Initialize Nodemailer transporter with Gmail configuration
   */
  private initializeTransporter(): void {
    const user = this.configService.get<string>('EMAIL_USER');
    const password = this.configService.get<string>('EMAIL_PASS');

    if (!user || !password) {
      this.logger.warn(
        'Gmail configuration incomplete (EMAIL_USER or EMAIL_PASS missing). Email sending will not work.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user,
        pass: password,
      },
    });

    this.logger.debug('Gmail transporter initialized');
  }

  /**
   * Send activation email with token
   */
  async sendActivationEmail(
    email: string,
    activationToken: string,
  ): Promise<void> {
    try {
      const frontendUrl = this.configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:5173',
      );

      const activationLink = `${frontendUrl}/activate?token=${activationToken}`;
      const expirationTime = this.configService.get<string>(
        'ACTIVATION_TOKEN_EXPIRES_IN',
        '24h',
      );

      const { subject, html } = activationEmailTemplate(
        activationLink,
        expirationTime,
      );

      await this.sendEmail(email, subject, html);
      this.logger.debug(`Activation email sent to ${email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error sending activation email to ${email}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Send password reset email with token
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    try {
      const frontendUrl = this.configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:5173',
      );

      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
      const expirationTime = this.configService.get<string>(
        'PASSWORD_RESET_TOKEN_EXPIRES_IN',
        '1h',
      );

      const { subject, html } = passwordResetEmailTemplate(
        resetLink,
        expirationTime,
      );

      await this.sendEmail(email, subject, html);
      this.logger.debug(`Password reset email sent to ${email}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error sending password reset email to ${email}: ${errorMessage}`,
      );
      throw error;
    }
  }

  /**
   * Generic email sending method
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.error('Nodemailer transporter not configured');
      throw new Error('Email service not configured');
    }

    const mailFrom = this.configService.get<string>(
      'EMAIL_FROM',
      'noreply@ctnandayure.com',
    );

    const mailOptions = {
      from: mailFrom,
      to,
      subject,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.debug(`Email sent: ${info.messageId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email: ${errorMessage}`);
      throw error;
    }
  }
}
