# Feature: Save the Date

## 📋 Resumo

Implementar funcionalidade de "Save the Date" - um pré-convite digital que os hosts podem enviar aos convidados antes do convite formal. O Save the Date tem como objetivo reservar a data na agenda dos convidados com antecedência, especialmente útil para casamentos e eventos que requerem planeamento (viagens, alojamento, etc.).

---

## 🎯 Objetivos

1. Permitir criar e partilhar Save the Date digitais com o mesmo estilo visual dos convites
2. Incluir apenas informação essencial (data, local geral, nomes dos anfitriões)
3. Manter consistência visual com o tema do convite escolhido
4. Rastrear visualizações do Save the Date
5. Transição suave para o convite formal quando disponível

---

## 📐 Especificação Funcional

### Conteúdo do Save the Date

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| Título | ✅ | Ex: "Save the Date" ou personalizado |
| Nomes dos anfitriões | ✅ | Ex: "Maria & João" |
| Data do evento | ✅ | Apenas a data (sem hora específica) |
| Local (cidade/região) | ✅ | Apenas cidade/região, não morada completa |
| Mensagem personalizada | ❌ | Texto curto opcional |
| Imagem de capa | ❌ | Foto dos noivos/anfitriões |
| Nota "Convite a seguir" | ✅ | Indicação de que o convite formal virá depois |

### O que NÃO incluir no Save the Date

- ❌ Hora exata do evento
- ❌ Morada completa do venue
- ❌ Formulário de RSVP (ainda não é altura)
- ❌ Programa/Schedule do evento
- ❌ Restrições alimentares
- ❌ Informações detalhadas

### Fluxo do Utilizador (Host)

1. **Criar Evento** → Pode ativar opção "Save the Date"
2. **Configurar Save the Date** → Preencher campos específicos
3. **Pré-visualizar** → Ver como os convidados vão ver
4. **Publicar/Partilhar** → Gerar link único para Save the Date
5. **Monitorizar** → Ver quantas pessoas visualizaram
6. **Transição** → Quando convite estiver pronto, notificar/redirecionar

### Fluxo do Utilizador (Convidado)

1. Recebe link do Save the Date (WhatsApp, email, etc.)
2. Abre página com design elegante matching o tema
3. Vê informação essencial (data, local, anfitriões)
4. Opção de "Adicionar ao Calendário" (Google Calendar, Apple Calendar, ICS)
5. Quando convite formal disponível, pode ser redirecionado ou ver notificação

---

## 🎨 Design & UX

### Requisitos Visuais

- **Usar mesmo tema** (`InvitationTheme`) selecionado para o evento
- **Componentes reutilizáveis** do `InvitationCardComponent` adaptados
- **Animações subtis** (fade-in, parallax leve)
- **Mobile-first** com adaptação para desktop
- **Modo escuro** opcional (se implementado no futuro)

### Layout Sugerido

```
┌─────────────────────────────────────┐
│                                     │
│        [Imagem de Capa]             │
│                                     │
├─────────────────────────────────────┤
│                                     │
│         SAVE THE DATE               │
│                                     │
│         Maria & João                │
│                                     │
│     ━━━━━━━━━━━━━━━━━━━━━           │
│                                     │
│      15 de Agosto de 2026           │
│                                     │
│         Lisboa, Portugal            │
│                                     │
│     ━━━━━━━━━━━━━━━━━━━━━           │
│                                     │
│   "Convite formal a seguir..."      │
│                                     │
│   [📅 Adicionar ao Calendário]      │
│                                     │
└─────────────────────────────────────┘
```

### Cores & Tipografia

- Manter paleta de cores do tema selecionado
- Tipografia elegante (serif para títulos, sans-serif para corpo)
- Usar CSS custom properties existentes (`--ion-color-primary`, etc.)

---

## 🗂️ Modelo de Dados

### Alterações ao Event Model

```typescript
// Adicionar a Event interface
interface Event {
  // ... campos existentes ...
  
  // Save the Date
  saveTheDate?: SaveTheDateConfig;
}

interface SaveTheDateConfig {
  enabled: boolean;
  published: boolean;
  shareCode: string;          // Código único (diferente do convite)
  
  // Conteúdo
  title?: string;             // Default: "Save the Date"
  customMessage?: string;     // Mensagem personalizada
  showCity: boolean;          // Mostrar cidade em vez de venue completo
  cityOverride?: string;      // Ex: "Lisboa, Portugal" em vez do venue
  coverImage?: string;        // Imagem específica para Save the Date
  
  // Datas
  publishedAt?: string;       // Quando foi publicado
  invitationAvailableDate?: string; // Quando o convite estará disponível
  
  // Tracking
  viewCount: number;          // Número de visualizações
  uniqueViews: string[];      // IDs/fingerprints únicos (privacy-friendly)
  
  createdAt: string;
  updatedAt: string;
}
```

### Nova Collection MongoDB (Opcional)

Alternativamente, pode ser uma collection separada para maior flexibilidade:

```typescript
// Collection: save-the-dates
interface SaveTheDate {
  id: string;
  eventId: string;
  shareCode: string;
  
  // ... campos acima ...
}
```

---

## 🔌 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/events/:id/save-the-date` | Obter config do Save the Date |
| PUT | `/api/events/:id/save-the-date` | Criar/atualizar Save the Date |
| GET | `/api/save-the-date/:code` | Página pública do Save the Date |
| POST | `/api/save-the-date/:code/view` | Registar visualização |
| GET | `/api/save-the-date/:code/calendar` | Download ficheiro .ics |

---

## 📱 Páginas & Componentes

### Novas Páginas

1. **`/save-the-date/:code`** - Página pública (convidados)
   - Reutilizar estilos do `InvitationCardComponent`
   - Sem RSVP form
   - Botão "Adicionar ao Calendário"

2. **`/events/:id/save-the-date`** - Gestão (host)
   - Formulário de configuração
   - Preview
   - Partilha (link, copiar, QR code futuro)
   - Estatísticas de visualização

### Componentes

1. **`SaveTheDateCardComponent`** - Card visual do Save the Date
   - Baseado em `InvitationCardComponent`
   - Layout simplificado
   - Suporta todos os temas

2. **`AddToCalendarComponent`** - Botão multi-calendário
   - Google Calendar (link)
   - Apple Calendar (link)
   - Download .ics (ficheiro)
   - Outlook (link)

---

## 📅 Funcionalidade "Adicionar ao Calendário"

### Implementação

```typescript
interface CalendarEvent {
  title: string;        // Ex: "Casamento Maria & João"
  date: string;         // Data do evento
  location: string;     // Cidade/Local
  description: string;  // Descrição breve
  url?: string;         // Link para o convite (quando disponível)
}

// Google Calendar URL
const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&location=${location}&details=${description}`;

// Ficheiro ICS
const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${date}
DTEND:${date}
SUMMARY:${title}
LOCATION:${location}
DESCRIPTION:${description}
END:VEVENT
END:VCALENDAR
`;
```

---

## ✅ Critérios de Aceitação

### MVP (Mínimo Viável)

- [ ] Host pode ativar Save the Date para um evento
- [ ] Host pode configurar título, mensagem e cidade
- [ ] Save the Date usa o mesmo tema visual do convite
- [ ] Gera link único partilhável (`/save-the-date/:code`)
- [ ] Convidados podem ver o Save the Date (página pública)
- [ ] Botão "Adicionar ao Calendário" funcional (Google + ICS)
- [ ] Contador básico de visualizações

### Nice to Have (Futuro)

- [ ] Preview em tempo real durante configuração
- [ ] Imagem de capa personalizada
- [ ] Animações de entrada (fade, slide)
- [ ] QR Code para partilha
- [ ] Notificação quando convite disponível
- [ ] A/B testing de mensagens
- [ ] Analytics detalhados (tempo na página, dispositivo, etc.)
- [ ] Integração com redes sociais (Instagram story, Facebook)
- [ ] Countdown animado para a data

---

## 🔗 Dependências

- Modelo de dados `Event` existente
- Sistema de temas (`InvitationTheme`) existente
- `InvitationCardComponent` para reutilização de estilos
- API endpoints de eventos existentes
- Sistema de `shareCode` existente

---

## ⚠️ Considerações

### Privacidade

- Não recolher dados pessoais dos visualizadores
- Usar fingerprinting básico apenas para contagem única (localStorage ID)
- Cumprir RGPD (não guardar IPs, apenas contadores)

### Performance

- Página pública deve carregar rapidamente
- Lazy loading de imagens
- Caching agressivo para assets estáticos

### SEO (Opcional)

- Meta tags Open Graph para preview em redes sociais
- Título e descrição dinâmicos
- Imagem de preview (og:image)

### Transição para Convite

- Quando convite publicado, mostrar banner no Save the Date
- Opção de redirecionar automaticamente para convite
- Manter Save the Date acessível (memória/nostalgia)

---

## 📝 Notas de Implementação

1. **Reutilizar ao máximo** os componentes e estilos do convite
2. **Código partilhável diferente** do convite (para tracking separado)
3. **Mobile-first** - maioria dos acessos será por telemóvel
4. **Testar com todos os temas** existentes
5. **Texto em Português** (PT-PT) conforme padrão da app

---

## 🎯 Prioridade

**Média-Alta** - Feature complementar importante para o fluxo completo de gestão de eventos, especialmente casamentos.

---

## 📊 Estimativa

- **Backend (API + Model)**: 4-6 horas
- **Frontend (Páginas + Componentes)**: 8-12 horas
- **Testes & Refinamentos**: 2-4 horas
- **Total estimado**: 14-22 horas

---

## 🔮 Evolução Futura

Esta feature pode evoluir para:
- **Email/SMS automático** quando convite disponível
- **Série de comunicações** (Save the Date → Convite → Lembretes)
- **Website do evento** completo (página única com tudo)
- **Integração com WhatsApp Business** para envio em massa
