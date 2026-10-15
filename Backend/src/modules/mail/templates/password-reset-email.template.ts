/**
 * Template for password reset email
 */
export function passwordResetEmailTemplate(
  resetLink: string,
  expirationTime: string,
): { subject: string; html: string } {
  return {
    subject: 'Restablecer tu contraseña - Cámara de Turismo Nandayure',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background-color: #2c3e50;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 30px;
          }
          .button {
            display: inline-block;
            background-color: #e74c3c;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
            font-weight: bold;
          }
          .footer {
            background-color: #ecf0f1;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
          }
          .warning {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
            padding: 10px 15px;
            margin: 15px 0;
            border-radius: 4px;
            color: #721c24;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Restablecer Contraseña</h1>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>Hemos recibido una solicitud para restablecer tu contraseña. Si no fuiste tú quien la solicitó, puedes ignorar este correo de manera segura.</p>
            <p>Para establecer una nueva contraseña, haz clic en el siguiente enlace:</p>
            <center>
              <a href="${resetLink}" class="button">Restablecer Contraseña</a>
            </center>
            <div class="warning">
              <strong>Seguridad:</strong> Este enlace expira en <strong>${expirationTime}</strong>. 
              Por motivos de seguridad, los enlaces de restablecimiento tienen una duración limitada.
            </div>
            <p>Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
              <code>${resetLink}</code>
            </p>
            <p><strong>Si no solicitaste restablecer tu contraseña:</strong></p>
            <ul>
              <li>Verifica la seguridad de tu cuenta</li>
              <li>Cambia tu contraseña de inmediato</li>
              <li>Contacta con soporte si tienes dudas</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 Cámara de Turismo Nandayure. Todos los derechos reservados.</p>
            <p>Este es un correo automático, por favor no responder a esta dirección.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}
