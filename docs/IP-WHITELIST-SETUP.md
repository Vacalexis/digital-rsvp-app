# 🔒 Proteção de Staging - Autenticação Angular

## ✅ Solução Implementada

Este projeto usa **Angular Auth Guard** para proteger todo o site em staging com autenticação username/password.

**Vantagens:**
- ✅ Funciona no plano **gratuito** do Vercel
- ✅ Proteção nativa do Angular (sem dependências externas)
- ✅ Rate limiting (5 tentativas → bloqueio de 5 minutos)
- ✅ Credenciais hasheadas (SHA-256)
- ✅ Controlo via environment variable

---

## 🔐 Como Funciona

### Rotas Protegidas (requer login)
- `/` - Landing page
- `/themes` - Galeria de temas
- `/preview/:theme` - Preview de temas
- `/customize` - Personalização
- `/payment` - Pagamento
- `/events/*` - BackOffice completo

### Rotas Públicas (sem login)
- `/login` - Página de login
- `/rsvp/:code` - Formulário RSVP (convidados)

---

## 🚀 Configuração

### 1. Credenciais Padrão

**Username:** `admin`  
**Password:** `rsvp2024`

⚠️ **IMPORTANTE**: Mudar as credenciais antes de fazer deploy!

### 2. Mudar Password

#### Opção A: Via Browser Console

1. Abrir DevTools (F12)
2. Ir ao Console
3. Executar:
```javascript
const service = window.ng.getInjector(document.querySelector('app-root')).get('AuthService');
await service.generateHash('admin', 'nova-password-aqui');
```

4. Copiar o hash gerado
5. Atualizar em `src/app/services/auth.service.ts`:
```typescript
private readonly VALID_HASH = 'hash-gerado-aqui';
```

#### Opção B: Via Script Node

1. Executar:
```bash
node generate-hash.js admin nova-password-aqui
```

2. Copiar o hash
3. Atualizar `auth.service.ts` conforme acima

### 3. Desativar Proteção (Desenvolvimento Local)

Em `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: '/api',
  requireAuth: false, // ← Desativar
};
```

### 4. Ativar Proteção (Staging/Produção)

Em `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: '/api',
  requireAuth: true, // ← Ativar
};
```

O Vercel usa automaticamente `environment.prod.ts` no deploy!

---

## 📖 Fluxo de Utilizador

### Acesso ao Site

1. Utilizador tenta aceder `https://seu-site.vercel.app`
2. Auth Guard verifica `environment.requireAuth`
3. Se `true` e não autenticado → redireciona para `/login`
4. Utilizador faz login com credenciais
5. Sessão guardada em `sessionStorage` (expira ao fechar tab)
6. Acesso completo ao site

### Rate Limiting

- **5 tentativas** máximo
- Após 5 falhas → **bloqueio de 5 minutos**
- Contador guardado em `localStorage` (persiste entre sessões)
- Mensagem mostra tentativas restantes

### Segurança

- ✅ Passwords **nunca** guardadas em plain text
- ✅ Hash SHA-256 comparado server-side
- ✅ Sessão apenas em `sessionStorage` (limpa ao fechar tab)
- ✅ Rate limiting contra brute force
- ✅ Timeout automático de lockout

---

## 🔧 Troubleshooting

### Problema: Esqueci a password
**Solução:** 
1. Gerar novo hash (ver secção "Mudar Password")
2. Fazer commit + deploy

### Problema: Bloqueado após 5 tentativas
**Solução:**
1. Aguardar 5 minutos
2. Ou limpar `localStorage`:
```javascript
localStorage.removeItem('rsvp_rate_limit');
```

### Problema: Site pede login em desenvolvimento local
**Solução:**
Verificar `environment.ts`:
```typescript
requireAuth: false // ← Deve estar false
```

### Problema: Site não pede login em staging
**Solução:**
1. Verificar se build usa `environment.prod.ts`
2. Confirmar `requireAuth: true` em `environment.prod.ts`
3. Re-deploy no Vercel

---

## 🌐 Deploy no Vercel

### Staging (Branch `development`)

1. Garantir `environment.prod.ts` tem `requireAuth: true`
2. Mudar password padrão (gerar novo hash)
3. Commit + push:
```bash
git add -A
git commit -m "feat: enable staging authentication"
git push origin development
```

4. Vercel faz deploy automático
5. Site protegido! Aceder via `/login`

### Produção (Branch `main`)

Quando lançar em produção:

**Opção 1: Manter proteção**
- Deixar `requireAuth: true`
- Apenas utilizadores com password têm acesso

**Opção 2: Remover proteção**
- Alterar `requireAuth: false` em `environment.prod.ts`
- Site completamente público

---

## 📝 Partilhar Acesso

Para dar acesso a outras pessoas ao staging:

1. **Partilhar credenciais de forma segura:**
   - Usar password manager (1Password, Bitwarden)
   - Enviar via canal encriptado (Signal, WhatsApp)
   - **Nunca** por email/SMS plain text

2. **Criar múltiplas passwords (futuro):**
   - Modificar `auth.service.ts` para aceitar array de hashes
   - Gerar hash para cada utilizador
   - Cada pessoa tem credenciais únicas

---

## 🔮 Melhorias Futuras

- [ ] Backend API com JWT tokens
- [ ] Múltiplos utilizadores (tabela users no MongoDB)
- [ ] Roles e permissões (admin, editor, viewer)
- [ ] OAuth (Google, GitHub login)
- [ ] 2FA (Two-Factor Authentication)
- [ ] Logs de acesso
- [ ] Password reset via email

---

## 📊 Comparação com Outras Soluções

| Solução | Custo | Complexidade | Segurança |
|---------|-------|--------------|-----------|
| **Auth Guard (atual)** | ✅ Grátis | 🟢 Baixa | 🟡 Média |
| Vercel Password Protection | ⚠️ €20/mês | 🟢 Muito baixa | 🟢 Alta |
| Vercel Firewall IP | ❌ Enterprise | 🟢 Baixa | 🟢 Alta |
| Backend JWT Auth | ✅ Grátis | 🔴 Alta | 🟢 Alta |

---

## Scripts Úteis

### Obter IP Atual (para referência)
```bash
npm run get-my-ip
```

### Testar Login Localmente
```bash
npm start
# Abrir http://localhost:4200/login
```

### Testar Build de Produção
```bash
npm run build
vercel dev
# Abrir http://localhost:3000/login
```

---

## Opção 1: Vercel Password Protection (Recomendado) ✅

**Vantagens:**
- ✅ Nativo do Vercel
- ✅ Funciona com qualquer framework (Angular, React, Vue, etc.)
- ✅ Fácil de configurar
- ✅ Suporta múltiplos utilizadores

**Limitação:**
- ⚠️ Requer plano **Pro** do Vercel (€20/mês)

### Como Configurar

1. **Upgrade para Pro (se necessário):**
   - Dashboard → Settings → General → Upgrade to Pro

2. **Ativar Password Protection:**
   - Dashboard → Settings → **Deployment Protection**
   - Ativar **Password Protection**
   - Escolher scope: `All Deployments` ou `Non-Production Deployments`

3. **Criar Password:**
   - Clicar em **Create Password**
   - Definir password forte
   - Nome (opcional): "Admin Access"

4. **Partilhar credenciais:**
   - Vercel gera um link único
   - Partilhar com pessoas autorizadas

### Utilizadores Autorizados

- ✅ Qualquer pessoa com a password
- ✅ Membros da equipa Vercel (acesso automático)
- ✅ Pode criar múltiplas passwords para diferentes equipas

---

## Opção 2: Basic Authentication via Vercel Edge Config 🔐

**Vantagens:**
- ✅ Funciona no plano gratuito
- ✅ Proteção por username + password
- ✅ Configurável via variáveis de ambiente

**Desvantagem:**
- ⚠️ Requer criar função serverless adicional

### Implementação

Criar ficheiro `api/auth-check.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Staging Area"');
    return res.status(401).send('Authentication required');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');

  const validUsername = process.env.STAGING_USERNAME || 'admin';
  const validPassword = process.env.STAGING_PASSWORD || 'changeme';

  if (username === validUsername && password === validPassword) {
    return res.status(200).json({ authenticated: true });
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Staging Area"');
  return res.status(401).send('Invalid credentials');
}
```

**Variáveis de Ambiente:**
```
STAGING_USERNAME=admin
STAGING_PASSWORD=sua-password-aqui
```

**Limitação:** Requer modificar o Angular para verificar autenticação em cada rota (complexo).

---

## Opção 3: IP Whitelist via Vercel Firewall 🛡️

**Vantagens:**
- ✅ Bloqueio automático por IP
- ✅ Sem impacto na aplicação

**Desvantagens:**
- ⚠️ Requer plano **Enterprise** do Vercel
- ⚠️ IPs residenciais podem mudar

### Como Configurar (Enterprise)

1. Dashboard → Settings → **Firewall**
2. Adicionar **IP Allowlist Rule**
3. Inserir IPs permitidos (formato CIDR):
   ```
   123.45.67.89/32
   98.76.54.32/32
   ```
4. Aplicar regra ao ambiente: `Preview` ou `Production`

---

## Opção 4: Proteção via .htaccess (Se usar Apache)

Se o Vercel não for opção, use `.htaccess` em hosting tradicional:

```apache
AuthType Basic
AuthName "Staging Area"
AuthUserFile /path/to/.htpasswd
Require valid-user
```

Gerar password:
```bash
htpasswd -c .htpasswd admin
```

---

## Recomendação Final

### Para Plano Gratuito do Vercel:
- **Não proteger** e manter o site privado (não partilhar link)
- Ou usar domínio obscuro (ex: `abc123-staging.vercel.app`)

### Para Plano Pro (€20/mês):
- ✅ **Vercel Password Protection** - Solução perfeita e nativa

### Para Proteção Robusta:
- ✅ Implementar **autenticação própria** no Angular (Firebase Auth, Supabase, etc.)
- Criar guard que protege todas as rotas
- Armazenar sessão no localStorage/sessionStorage

---

## Solução Temporária: Não Partilhar Link

Se o site estiver em `development` branch no Vercel:
- Link é algo como: `digital-rsvp-app-git-development-vacalexis.vercel.app`
- Não é indexado pelo Google
- Apenas pessoas com o link exato conseguem aceder
- **Segurança por obscuridade** (não ideal, mas funciona para staging curto prazo)

---

## Scripts Úteis (Mantidos)

### Obter IP Atual
```bash
npm run get-my-ip
```

Este script continua útil para configurar firewalls ou outras soluções de whitelist.

---

#### Opção 1: Google
Pesquisar "what is my ip" no Google

#### Opção 2: Sites especializados
- https://whatismyipaddress.com/
- https://www.whatismyip.com/

#### Opção 3: Via Terminal
```bash
# Windows PowerShell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content

# Linux/Mac
curl https://api.ipify.org
```

### 4. Adicionar IPs de Outros Utilizadores (Opcional)

Se quiser dar acesso a outras pessoas:
1. Pedir-lhes o IP (usando métodos acima)
2. Adicionar à lista separado por vírgula:
```
SEU_IP,IP_PESSOA_1,IP_PESSOA_2
```

### 5. Re-deploy

Após adicionar/alterar a variável `ALLOWED_IPS`:
- **Preview/Staging**: Fazer push para o branch → Vercel faz re-deploy automaticamente
- **Production**: Ir ao dashboard → Production → Redeploy

## Comportamento

### ✅ IP Autorizado
- Acesso normal ao site
- Nenhuma mensagem exibida

### ❌ IP Não Autorizado
- Página 403 (Acesso Restrito) exibida
- Mostra o IP do visitante para facilitar debug

### 🔓 Sem Proteção (Padrão)
- Se `ALLOWED_IPS` não estiver configurada ou estiver vazia
- Site fica **completamente aberto** (comportamento normal)

## Exemplo de Uso

### Cenário 1: Apenas o dono tem acesso
```env
ALLOWED_IPS=203.0.113.45
```

### Cenário 2: Equipa pequena
```env
ALLOWED_IPS=203.0.113.45,198.51.100.23,192.0.2.100
```

### Cenário 3: Sem proteção (desenvolvimento público)
```env
# Deixar vazio ou remover a variável
ALLOWED_IPS=
```

## Desativar Temporariamente

Para desativar a proteção sem remover os IPs:
1. Ir ao Vercel → Environment Variables
2. Editar `ALLOWED_IPS`
3. Deixar o valor **vazio**
4. Re-deploy

## Testar Localmente

Para testar o middleware localmente com `vercel dev`:

```bash
# .env.local (criar na raiz do projeto)
ALLOWED_IPS=127.0.0.1,::1
```

Nota: IPs locais como `127.0.0.1` e `::1` (IPv6 localhost) devem ser incluídos para testes locais.

## Troubleshooting

### Problema: Bloqueado mesmo com IP correto
**Causa:** IP pode mudar (ISPs dinâmicos)
**Solução:** Verificar IP atual e atualizar variável

### Problema: Arquivos estáticos não carregam
**Causa:** Matcher incorreto no middleware
**Solução:** O matcher já exclui `_next/static`, imagens, etc.

### Problema: APIs bloqueadas
**Causa:** Matcher protege também `/api/*`
**Solução:** Se necessário, ajustar o matcher para excluir `/api`:
```typescript
matcher: [
  '/((?!api|_next/static|_next/image|favicon.ico).*)',
],
```

## Segurança

⚠️ **Importante:**
- **Não commitar** IPs no código (usar sempre variáveis de ambiente)
- **IPs podem mudar** - ISPs residenciais têm IPs dinâmicos
- **VPNs alteram IPs** - Usar IP sem VPN ou adicionar IPs da VPN
- **IPv6 vs IPv4** - Alguns ISPs usam IPv6, o middleware suporta ambos

## Alternativas

Se IP fixo não for viável:
1. **Vercel Password Protection** (built-in, pago)
2. **Basic Auth** via middleware
3. **JWT/OAuth** para autenticação de utilizador

## Verificar se Está Ativo

1. Abrir o site num navegador
2. Se ver página normal → Seu IP está autorizado ✅
3. Se ver página "Acesso Restrito" → IP bloqueado ❌
4. Verificar IP mostrado na página vs lista configurada
