export interface IMailService {
  sendActivationEmail(
    email: string,
    activationToken: string,
  ): Promise<void>;

  sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void>;
}
