# Preferências de tratamento (tu/você, género)

## Contexto
Neste momento, a UI começou a usar tratamento informal ("tu"/"tua"/"contigo").
No futuro queremos dar a hipótese de escolher como tratar o convidado: "tu" vs "você" e variações por género (masculino/feminino/neutro), idealmente por evento e/ou por convidado.

## Problema
- Não existe um sítio central para definir o "tom" de linguagem.
- Algumas frases precisam de concordância (ex.: convidado/convidada) e pronomes (te/si/contigo/consigo).

## Proposta
- Introduzir uma configuração de linguagem:
  - Default global (app)
  - Override por evento
  - Override por convidado (opcional)
- Suportar opções iniciais:
  - Registo: `tu` | `você`
  - Género: `masc` | `fem` | `neutral`
- Criar um helper (ex.: `addressing.service.ts` ou util) para gerar strings consistentes.

## Onde aplicar (mínimo)
- Pré-visualização do convite (Invitation Preview)
- RSVP (títulos, mensagens de confirmação, prazos)
- Share text (Web Share API)

## Critérios de aceitação
- Escolher `tu/você` altera a copy visível sem duplicação de templates.
- Frases com género ficam corretas (ex.: "convidado" vs "convidada"; opção neutra suportada).
- Mudança não afeta lógica de negócio nem APIs.
