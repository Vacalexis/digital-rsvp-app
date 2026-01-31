import { NextRequest, NextResponse } from 'next/server';

/**
 * IP Whitelist Middleware
 * Protege o site em staging permitindo apenas IPs configurados
 * 
 * Configuração no Vercel:
 * 1. Settings → Environment Variables
 * 2. Adicionar variável: ALLOWED_IPS
 * 3. Valor: lista de IPs separados por vírgula (ex: "123.45.67.89,98.76.54.32")
 * 4. Scope: Preview (para staging) ou Production
 */

export function middleware(request: NextRequest) {
  // Lista de IPs permitidos (configurada nas variáveis de ambiente)
  const allowedIPs = process.env.ALLOWED_IPS || '';
  
  // Se não houver IPs configurados, permitir acesso (comportamento padrão)
  if (!allowedIPs || allowedIPs.trim() === '') {
    return NextResponse.next();
  }

  // Obter IP do visitante
  const clientIP = 
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.ip ||
    'unknown';

  // Converter lista de IPs permitidos em array
  const allowedIPList = allowedIPs.split(',').map(ip => ip.trim());

  // Verificar se o IP está na lista permitida
  if (allowedIPList.includes(clientIP)) {
    return NextResponse.next();
  }

  // IP não autorizado - retornar erro 403
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Acesso Restrito</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          background: linear-gradient(135deg, #8b5a5a 0%, #c9a962 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: #fff;
          padding: 20px;
        }
        .container {
          max-width: 500px;
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .icon {
          font-size: 80px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 2rem;
          margin-bottom: 16px;
          font-weight: 700;
        }
        p {
          font-size: 1.1rem;
          margin-bottom: 12px;
          opacity: 0.9;
          line-height: 1.6;
        }
        .ip-info {
          background: rgba(0, 0, 0, 0.2);
          padding: 12px 20px;
          border-radius: 8px;
          margin-top: 20px;
          font-family: 'Courier New', monospace;
          font-size: 0.95rem;
        }
        .footer {
          margin-top: 30px;
          font-size: 0.9rem;
          opacity: 0.7;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🔒</div>
        <h1>Acesso Restrito</h1>
        <p>Este site está em modo de staging e apenas está acessível a IPs autorizados.</p>
        <p>Se precisa de acesso, contacte o administrador do sistema.</p>
        <div class="ip-info">
          Seu IP: ${clientIP}
        </div>
        <div class="footer">
          Digital RSVP App © 2026
        </div>
      </div>
    </body>
    </html>
    `,
    {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
}

/**
 * Configuração do matcher
 * Define quais rotas o middleware deve proteger
 * 
 * Protege todas as rotas exceto:
 * - Arquivos estáticos (_next/static)
 * - Imagens (_next/image)
 * - Favicon
 * - Assets públicos
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
