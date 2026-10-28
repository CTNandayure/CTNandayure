/**
 * Template for account activation email
 */
export function activationEmailTemplate(
  activationLink: string,
  expirationTime: string,
): { subject: string; html: string } {
  return {
    subject: 'Activa tu cuenta - Cámara de Turismo Nandayure',
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
            background-color: #27ae60;
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
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px 15px;
            margin: 15px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a Cámara de Turismo Nandayure!</h1>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>Tu cuenta ha sido creada exitosamente. Para activarla y crear tu contraseña, haz clic en el siguiente enlace:</p>
            <center>
              <a href="${activationLink}" class="button">Activar Cuenta</a>
            </center>
            <div class="warning">
              <strong>Importante:</strong> Este enlace expira en <strong>${expirationTime}</strong>. 
              Luego de ese tiempo, deberás solicitar un nuevo enlace de activación.
            </div>
            <p>Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
              <code>${activationLink}</code>
            </p>
            <p>Si no solicitaste esta cuenta, por favor ignora este correo.</p>
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
