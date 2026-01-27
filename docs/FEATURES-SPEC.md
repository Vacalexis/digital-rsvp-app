# Digital RSVP App - Especificação de Features

> **Propósito**: Documento de referência para revisão completa da aplicação.
> **Última atualização**: 26 Janeiro 2026

---

## 📋 Visão Geral

Aplicação para gestão de convites digitais e RSVPs para eventos (casamentos, batizados, festas).

### Stack Técnico
- **Frontend**: Ionic 8 + Angular 18 (standalone components)
- **State**: Angular Signals
- **Backend**: Vercel Serverless Functions
- **Database**: MongoDB Atlas
- **Deploy**: Vercel (branch: development)

---

## 🎯 Features Principais

### 1. Gestão de Eventos

| Feature               | Estado         | Notas                                                        |
| --------------------- | -------------- | ------------------------------------------------------------ |
| Criar evento          | ✅ Implementado | Com spinner no botão                                         |
| Editar evento         | ✅ Implementado |                                                              |
| Eliminar evento       | ✅ Implementado |                                                              |
| Definir data/hora     | ✅ Implementado |                                                              |
| Definir local (venue) | ✅ Implementado |                                                              |
| Definir deadline RSVP | ✅ Implementado | Visibilidade corrigida                                       |
| Temas de convite      | ✅ Implementado | elegant, floral, romantic, rustic, modern, tropical, classic |

---

### 2. Sistema de Convites (Invitations)

#### 2.1 Tipos de Convite

| Tipo       | Descrição                      | Estado       |
| ---------- | ------------------------------ | ------------ |
| Individual | 1 pessoa                       | ✅            |
| Casal      | 2 pessoas com tratamento IGUAL | 🔄 Em revisão |
| Família    | Casal + filhos                 | 🔄 Em revisão |

#### 2.2 Configuração de Convites (Host)

| Campo                 | Descrição                         | Estado       |
| --------------------- | --------------------------------- | ------------ |
| Nome Convidado 1      | Nome da primeira pessoa           | ✅            |
| Nome Convidado 2      | Nome da segunda pessoa (se casal) | ✅            |
| Permitir Acompanhante | Toggle sempre visível             | 🔄 Confirmar  |
| Filhos                | Lista individual com nome + idade | 🔄 Em revisão |
| Email                 | Para notificações                 | ✅            |
| Telefone              | Para notificações                 | ✅            |

#### 2.3 Especificação: Casal
```
PRETENDIDO:
- Dois cartões IGUAIS lado a lado
- Labels: "Convidado 1" e "Convidado 2" (não "Principal" e "Acompanhante")
- Cada um tem as mesmas opções de resposta
- Visualmente equivalentes (mesmo tamanho, mesma importância)
```

#### 2.4 Especificação: Filhos
```
PRETENDIDO:
- Cada filho é um item individual (não lista separada por vírgulas)
- Campos por filho:
  - Nome (obrigatório)
  - Idade (opcional - se não preenchido, perguntado no RSVP)
- Botão "Adicionar Filho" para adicionar mais
- Botão X para remover cada filho
```

**Modelo de dados (InvitedChild):**
```typescript
interface InvitedChild {
  name: string;
  age?: number;  // Opcional - preenchido pelo Host ou pelo convidado no RSVP
}
```

---

### 3. Página de Preview / RSVP Público

#### 3.1 Visual

| Elemento        | Especificação                             | Estado       |
| --------------- | ----------------------------------------- | ------------ |
| Envelope        | Aba por cima, carta a sair por baixo      | 🔄 Verificar  |
| Monograma/Crest | Círculo com iniciais + decoração por tema | 🔄 Em revisão |
| Cores           | Seguir tema selecionado                   | ✅            |
| Responsivo      | Mobile-first                              | ✅            |

#### 3.2 Decorações do Crest por Tema

| Tema     | Decoração               |
| -------- | ----------------------- |
| elegant  | Ornamentos dourados (★) |
| floral   | Flores (✿)              |
| romantic | Corações (♥)            |
| rustic   | Folhas (❧)              |
| modern   | Diamantes (◇)           |
| tropical | Sóis/Palmas (☀)         |
| classic  | Coroas (♛)              |

#### 3.3 Formulário RSVP

| Campo                     | Quando aparece           | Estado            |
| ------------------------- | ------------------------ | ----------------- |
| Resposta (Sim/Não/Talvez) | Sempre                   | ✅                 |
| Restrições alimentares    | Se evento tem essa opção | ✅                 |
| Pedido de música          | Se evento tem essa opção | ✅                 |
| Idade dos filhos          | Se Host não preencheu    | ❌ Por implementar |

---

### 4. Sistema de Autenticação

| Feature          | Estado         | Notas                      |
| ---------------- | -------------- | -------------------------- |
| Login admin      | ✅ Implementado | sessionStorage             |
| Rate limiting    | ✅ Implementado | 5 tentativas, 5min lockout |
| Hash credentials | ✅ Implementado | SHA-256                    |

---

### 5. API Endpoints

| Método | Endpoint                  | Descrição                 | Estado |
| ------ | ------------------------- | ------------------------- | ------ |
| GET    | `/api/events`             | Listar eventos            | ✅      |
| POST   | `/api/events`             | Criar evento              | ✅      |
| GET    | `/api/events/:id`         | Obter evento              | ✅      |
| PUT    | `/api/events/:id`         | Atualizar evento          | ✅      |
| DELETE | `/api/events/:id`         | Eliminar evento           | ✅      |
| GET    | `/api/events/share/:code` | Obter por código partilha | ✅      |
| GET    | `/api/guests`             | Listar convidados         | ✅      |
| POST   | `/api/guests`             | Criar convidado           | ✅      |
| PUT    | `/api/guests/:id`         | Atualizar convidado       | ✅      |
| DELETE | `/api/guests/:id`         | Eliminar convidado        | ✅      |

---

## 🔴 Problemas Conhecidos / Inconsistências

### Alta Prioridade

1. **Modelo de dados inconsistente**
   - `childrenNames: string[]` vs `children: InvitedChild[]`
   - Precisamos migrar para um formato único

2. **RSVP não pede idade dos filhos**
   - Se Host não preencher idade, o formulário RSVP deve pedir

3. **Envelope visual**
   - Reportado como "avariado" - precisa verificação

4. **Tratamento de casais**
   - Código pode ainda ter referências a "principal/acompanhante"

### Média Prioridade

5. **Tamanho CSS do preview**
   - Budget warning: 17.16 kB vs 15.36 kB

6. **Verificar API para novo modelo**
   - Endpoints podem não aceitar `children: InvitedChild[]`

### Baixa Prioridade

7. **Temas podem ter CSS incompleto**
   - Verificar que todos os 7 temas têm estilos consistentes

---

## 📁 Ficheiros Chave

### Modelos
- `src/app/models/event.model.ts` - Interfaces principais
- `src/app/models/index.ts` - Exports

### Páginas
- `src/app/pages/events/` - Lista de eventos
- `src/app/pages/event-form/` - Criar/editar evento
- `src/app/pages/invitations/` - Gestão de convites
- `src/app/pages/invitation-preview/` - Preview público + RSVP
- `src/app/pages/rsvp/` - Formulário RSVP público

### Serviços
- `src/app/services/event.service.ts` - CRUD eventos
- `src/app/services/guest.service.ts` - CRUD convidados
- `src/app/services/invitation.service.ts` - Gestão convites

### API
- `api/events/` - Endpoints de eventos
- `api/guests/` - Endpoints de convidados
- `api/lib/mongodb.ts` - Conexão MongoDB

---

## ✅ Próximos Passos (Revisão Completa)

1. [ ] Abrir projeto diretamente (não no multi-workspace)
2. [ ] Verificar modelo de dados atual em todos os ficheiros
3. [ ] Definir modelo único para `Invitation` e `InvitedChild`
4. [ ] Atualizar API para aceitar novo modelo
5. [ ] Testar fluxo completo: criar evento → criar convite → RSVP
6. [ ] Verificar visual do envelope e crest em todos os temas
7. [ ] Implementar idade dos filhos no RSVP
8. [ ] Otimizar CSS se necessário

---

## 📝 Notas de Sessão

### 26 Jan 2026
- Identificadas múltiplas inconsistências
- Criada documentação de features
- Sugerido trabalhar diretamente no projeto para melhor indexação
- Planeada revisão completa
