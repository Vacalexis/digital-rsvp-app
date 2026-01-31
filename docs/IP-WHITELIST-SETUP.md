# 🔒 IP Whitelist - Proteção de Staging

## Como Funciona

O middleware `middleware.ts` protege automaticamente o site verificando o IP de cada visitante contra uma lista de IPs autorizados configurados nas variáveis de ambiente do Vercel.

## Configuração no Vercel

### 1. Aceder às Environment Variables
1. Ir para o projeto no Vercel Dashboard
2. Clicar em **Settings** → **Environment Variables**

### 2. Adicionar a variável `ALLOWED_IPS`

**Nome da variável:**
```
ALLOWED_IPS
```

**Valor (exemplo):**
```
123.45.67.89,98.76.54.32,192.168.1.1
```

**Formato:**
- IPs separados por vírgula (sem espaços ou com espaços, o código trata ambos)
- Exemplo com espaços: `123.45.67.89, 98.76.54.32, 192.168.1.1`

**Scope (importante):**
- ✅ **Preview** - Para proteger apenas deployments de preview (branches)
- ✅ **Production** - Para proteger produção
- ✅ **Development** - Para proteger desenvolvimento local (opcional)

### 3. Descobrir o Seu IP

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
