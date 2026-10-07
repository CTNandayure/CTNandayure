/**
 * Template for business application rejection email
 */
export function rejectionEmailTemplate(
  businessName: string,
  reason: string,
): { subject: string; html: string } {
  return {
    subject: 'Solicitud de afiliación rechazada - Cámara de Turismo Nandayure',
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
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Actualización de Solicitud de Afiliación</h1>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>Gracias por tu interés en formar parte de la Cámara de Turismo Nandayure.</p>
            <p>Hemos revisado cuidadosamente la solicitud de afiliación para el negocio <strong>${businessName}</strong>. Lamentablemente, no hemos podido aprobarla en este momento.</p>
            
            <div class="warning">
              <strong>Motivo de la decisión:</strong><br><br>
              ${reason}
            </div>
            
            <p>Puedes contactarnos directamente para obtener más información o aclarar cualquier duda. Una vez resueltos los inconvenientes, te invitamos a enviar una nueva solicitud de afiliación.</p>
            <p>Agradecemos tu comprensión.</p>
            <p>Saludos cordiales,<br>El equipo de la Cámara de Turismo Nandayure</p>
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
