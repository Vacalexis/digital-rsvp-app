# Prompt Inicial - Digital RSVP App

> Usa esta prompt quando abrires o projeto diretamente para dar contexto ao AI.

---

## 🚀 Prompt para Copiar

```
Estou a trabalhar no Digital RSVP App - uma aplicação Ionic 8 + Angular 18 para gestão de convites digitais e RSVPs.

## Stack
- Ionic 8 + Angular 18 (standalone components, SEM NgModules)
- State: Angular Signals
- Backend: Vercel Serverless Functions + MongoDB Atlas
- Deploy: Vercel (branch development)
- Styling: SCSS com CSS custom properties

## Convenções Obrigatórias
- Componentes standalone com imports explícitos
- Ionic imports de `@ionic/angular/standalone`
- Signals para estado (não BehaviorSubject)
- SCSS com variáveis (não hardcode de cores)
- UI em Português (PT-PT)

## Sessão Atual
Estamos em revisão completa da app. Há inconsistências identificadas.

Por favor lê o ficheiro `docs/FEATURES-SPEC.md` para entender:
- Features pretendidas
- Problemas conhecidos
- Próximos passos

Antes de fazer qualquer alteração, confirma:
1. Qual ficheiro vais alterar
2. Que mudança específica
3. Se está alinhado com a especificação
```

---

## 📋 Versão Curta (para tarefas rápidas)

```
Digital RSVP App - Ionic 8 + Angular 18 standalone.
Lê `docs/FEATURES-SPEC.md` para contexto.
Convenções: standalone components, Signals, @ionic/angular/standalone, SCSS vars, PT-PT.
```

---

## 🔄 Quando Precisares de Contexto Extra

Se precisares de padrões do ai-context (convenções gerais, arquitetura), podes dizer:

```
Preciso de aplicar as convenções gerais do meu workspace.
As regras estão em: C:\Users\alex_\Documents\Alexandre\ai-context\stack\
- tech-stack.md
- conventions.md
- architecture.md

Por favor lê esses ficheiros para contexto.
```

O Copilot consegue ler ficheiros fora do workspace se deres o caminho absoluto.
