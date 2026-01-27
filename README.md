# Digital RSVP App

Aplicação Ionic 8 + Angular 18 para gestão de convites digitais e RSVPs.

## 🚀 Quick Start

```bash
npm install
npm start
```

Abre [http://localhost:4200](http://localhost:4200)

## 📱 Navegação

| Rota                     | Descrição                   |
| ------------------------ | --------------------------- |
| `/events`                | Lista de eventos            |
| `/events/new`            | Criar novo evento           |
| `/events/:id`            | Dashboard do evento         |
| `/events/:id/edit`       | Editar evento               |
| `/events/:id/guests`     | Gestão de convidados        |
| `/events/:id/guests/new` | Adicionar convidado         |
| `/events/:id/invitation` | Pré-visualização do convite |
| `/events/:id/stats`      | Estatísticas de RSVPs       |
| `/rsvp/:code`            | Formulário público de RSVP  |
| `/settings`              | Definições da app           |

## ✨ Funcionalidades

### Gestão de Eventos
- ✅ Criar eventos (casamentos, aniversários, eventos corporativos, etc.)
- ✅ Personalizar detalhes do evento (data, local, horário)
- ✅ Escolher temas de convite (elegante, minimalista, floral, etc.)
- ✅ Definir anfitriões e programa do evento

### Gestão de Convidados
- ✅ Adicionar convidados individualmente ou em lote
- ✅ Acompanhar estado do RSVP (pendente, confirmado, recusado, talvez)
- ✅ Gerir acompanhantes (plus-ones)
- ✅ Registar restrições alimentares
- ✅ Solicitar pedidos de música
- ✅ Exportar lista de convidados para CSV

### Convites Digitais
- ✅ Pré-visualização do convite digital
- ✅ Partilhar via link único
- ✅ Formulário de RSVP público para convidados
- ✅ QR code para partilha fácil

### Estatísticas
- ✅ Dashboard com métricas de confirmação
- ✅ Contagem de convidados por estado
- ✅ Total de pessoas a comparecer (incluindo acompanhantes)
- ✅ Resumo de restrições alimentares

## 🛠️ Tech Stack

- **Ionic 8** - UI Framework
- **Angular 18** - Standalone Components
- **Angular Signals** - State Management
- **SCSS** - Styling com CSS custom properties
- **Capacitor 6** - Native mobile support
- **LocalStorage** - Persistência de dados

## 📂 Estrutura

```
src/app/
├── models/                  # Interfaces TypeScript
│   ├── event.model.ts       # Modelo de evento
│   └── guest.model.ts       # Modelo de convidado
├── services/                # Lógica de negócio
│   ├── event.service.ts     # Gestão de eventos
│   └── guest.service.ts     # Gestão de convidados
├── pages/
│   ├── events/              # Lista de eventos
│   ├── event-detail/        # Dashboard do evento
│   ├── event-form/          # Criar/editar evento
│   ├── event-stats/         # Estatísticas
│   ├── guests/              # Lista de convidados
│   ├── guest-form/          # Criar/editar convidado
│   ├── invitation-preview/  # Pré-visualização
│   ├── rsvp/                # Formulário RSVP público
│   └── settings/            # Definições
└── app.routes.ts            # Rotas da aplicação
```

## 🎨 Design System

| Cor           | Hex       | Uso                  |
| ------------- | --------- | -------------------- |
| Rose/Burgundy | `#8b5a5a` | Primária, botões     |
| Soft Gold     | `#c9a962` | Acentos, destaques   |
| Sage Green    | `#7d9a7d` | Elementos terciários |
| Success       | `#5a8b5a` | RSVP confirmado      |
| Warning       | `#d4a84b` | RSVP pendente        |
| Danger        | `#c25050` | RSVP recusado        |
| Cream         | `#faf5f0` | Fundo                |
| Dark          | `#2d2d2d` | Texto                |

## 📝 Scripts

```bash
npm start           # Servidor de desenvolvimento
npm run build       # Build de produção
npm run lint        # Verificação de código
npm run test        # Testes unitários
```

## 🚀 Deployment

Este projeto **já está ligado ao Vercel** e tem deploys ativos.

### Como publicar novas versões

1. Fazer push para o branch configurado no Vercel (por defeito: `development`)
2. O Vercel faz build e publica automaticamente

### Configuração

O ficheiro `vercel.json` está configurado com:
- Build command: `npm run build`
- Output directory: `www/browser`
- SPA rewrites para Angular routing

### Domínio Personalizado

1. Project Settings → Domains
2. Adicionar domínio (ex: `rsvp.seudominio.com`)
3. Atualizar registos DNS conforme instruções
4. Certificado SSL é automático e gratuito

## 🔐 Variáveis de Ambiente

Para funcionalidades futuras (APIs, autenticação):

```bash
# .env (não incluir no git)
FIREBASE_API_KEY=xxx
FIREBASE_PROJECT_ID=xxx
```

## 📱 Mobile Apps

### iOS & Android com Capacitor

```bash
# Adicionar plataformas
npx cap add ios
npx cap add android

# Build e sincronizar
npm run build
npx cap sync

# Abrir no IDE nativo
npx cap open ios
npx cap open android
```

## 🔮 Roadmap

- [ ] Integração com backend (Firebase/Supabase)
- [ ] Geração de QR code para convites
- [ ] Envio de convites por email/SMS
- [ ] Upload de imagens para eventos
- [ ] Autenticação de utilizadores
- [ ] Suporte multi-idioma (i18n)
- [ ] Modo escuro
- [ ] Exportação PDF da lista de convidados
- [ ] Gestão de mesas/lugares
- [ ] Builder de website de casamento

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

Desenvolvido com ❤️ usando Ionic + Angular
