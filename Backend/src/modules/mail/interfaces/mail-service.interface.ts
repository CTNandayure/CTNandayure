export interface IMailService {
  sendActivationEmail(email: string, activationToken: string): Promise<void>;

  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;

  sendRejectionEmail(
    email: string,
    businessName: string,
    reason: string,
  ): Promise<void>;
}
