# Plano de Implementação: Animação de Abertura do Envelope

> **Data**: 27 Janeiro 2026  
> **Objetivo**: Implementar uma animação de envelope realista e polida  
> **Ficheiros principais**:
> - `src/app/components/envelope-opener/envelope-opener.component.html`
> - `src/app/components/envelope-opener/envelope-opener.component.scss`
> - `src/app/components/envelope-opener/envelope-opener.component.ts`

---

## 📋 Análise da Prompt Original vs Estado Atual

A prompt identificou **3 problemas**. Aqui está o estado atual:

| # | Problema | Estado Atual | O que falta |
|---|----------|--------------|-------------|
| 1 | **Aba pouco distinta** | ✅ Já temos `.env-flap` real, com cor diferente e `drop-shadow` | ⚠️ Verificar se o contraste é suficiente |
| 2 | **Sem ilusão de abertura** | ✅ Já temos 3D transforms, `rotateX(180deg)`, `::after` para interior | ⚠️ Verificar se `backface-visibility` está correto |
| 3 | **Carta não emerge** | ❌ Carta está FORA do envelope-container, dentro de `.letter-clip` separado | ⚠️ A carta precisa estar DENTRO do envelope-container para o efeito funcionar |

### Diagnóstico do Problema Principal

O problema é **estrutural no HTML**:

```html
<!-- ATUAL (problema) -->
<div class="envelope-container">
  <div class="envelope">...</div>  <!-- envelope aqui -->
</div>

<!-- FORA do envelope-container! -->
<div class="letter-clip">
  <div class="env-letter">...</div>  <!-- carta aqui, separada -->
</div>
```

A carta está fora do contexto do envelope, por isso não consegue "emergir" dele visualmente.

---

## 🔧 Correções Necessárias

### Correção 1: Mover `.letter-clip` para DENTRO de `.envelope-container`

**HTML atual:**
```html
<div class="envelope-container">
  <div class="envelope">...</div>
</div>
<div class="letter-clip">...</div>  <!-- FORA! -->
```

**HTML corrigido:**
```html
<div class="envelope-container">
  <div class="envelope">...</div>
  <div class="letter-clip">...</div>  <!-- DENTRO! -->
</div>
```

### Correção 2: Ajustar z-index e posicionamento da carta

A carta precisa:
- **Fechada**: `z-index: 0` (atrás do envelope), posição inicial mais baixa
- **Opening**: `z-index: 10` (à frente), sobe gradualmente
- **Overflow**: O `.envelope-container` precisa de `overflow: visible` ou a carta fica cortada

### Correção 3: Verificar backface-visibility na aba

O `::after` da aba (face interna) precisa:
- `backface-visibility: visible` (para ser visto quando roda)
- O próprio `.env-flap` precisa de `backface-visibility: hidden` na face frontal

---

## ✅ Checklist de Implementação

### Fase 1: Estrutura HTML
- [x] Mover `.env-letter` para dentro de `.envelope-container`

### Fase 2: CSS - Posicionamento
- [x] `.envelope-container` com `position: relative` e `overflow: visible`
- [x] `.env-letter` posicionada absolutamente relativa ao container
- [x] Carta começa escondida atrás do envelope (`opacity: 0`, `z-index: 0`)

### Fase 3: CSS - Animação Coordenada
- [x] Carta com `opacity: 0` quando fechada
- [x] Carta sobe com delay (~200ms) após aba começar a abrir
- [x] z-index muda de 0 para 10 quando abre
- [x] `backface-visibility: hidden` na aba frontal
- [x] Face interna (::after) roda com a aba

### Fase 4: Validação
- [ ] Testar fase `closed` - carta invisível
- [ ] Testar fase `opening` - aba roda, carta começa a subir
- [ ] Testar fase `expanding` - carta totalmente visível
- [ ] Testar em mobile e desktop

---

## 📝 Alterações Realizadas

### HTML (`envelope-opener.component.html`)
- Movido `.env-letter` para dentro de `.envelope-container`
- Removido wrapper `.letter-clip` (já não necessário)

### SCSS (`envelope-opener.component.scss`)
- Removido `.letter-clip` (já não existe)
- `.envelope-container`: adicionado `overflow: visible`
- `.env-flap`: 
  - `backface-visibility: hidden` na face frontal
  - `::after` com `transform: rotateX(180deg)` e `backface-visibility: hidden`
- `.env-letter`:
  - Posição inicial: `z-index: 0`, `opacity: 0`, `transform: translate(-50%, -30%)`
  - Opening: `z-index: 10`, `opacity: 1`, sobe para `-120%`
  - Transitions com delays coordenados (200ms, 300ms)

---

## 🔄 Fases da Animação

| Fase | Duração | Aba | Carta | Selo |
|------|---------|-----|-------|------|
| **closed** | - | rotateX(0) | escondida, opacity 0 | visível, centro da aba |
| **opening** | 600ms | rotateX(-180deg) | começa a subir (delay 300ms) | voa para fora |
| **expanding** | 600ms | mantém | continua a subir, expande | invisível |
| **completed** | - | mantém | posição final | invisível |

---

## 📁 Estrutura HTML Proposta

```html
<div class="envelope-opener" [class]="phase()">
  <div class="backdrop">
    <div class="pattern"></div>
  </div>
  
  <div class="tap-hint" [class.hidden]="phase() !== 'closed'">
    <span>Toca no selo para abrir</span>
  </div>
  
  <div class="envelope-container">
    <!-- Envelope com perspetiva -->
    <div class="envelope">
      <!-- Corpo do envelope -->
      <div class="env-body"></div>
      
      <!-- Bolsos laterais e inferior -->
      <div class="env-pocket env-pocket--left"></div>
      <div class="env-pocket env-pocket--right"></div>
      <div class="env-pocket env-pocket--bottom"></div>
      
      <!-- Liner interior (visível quando abre) -->
      <div class="env-liner"></div>
      
      <!-- Aba triangular (roda em 3D) -->
      <div class="env-flap"></div>
      
      <!-- Selo clicável -->
      <button class="env-seal" (click)="openEnvelope()">
        <ion-icon name="flower-outline" class="flower-icon"></ion-icon>
      </button>
    </div>
    
    <!-- Carta (emerge do envelope) -->
    <div class="letter-clip">
      <div class="env-letter">
        <div class="env-letter-content">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## ✅ Checklist de Implementação

### Fase 1: Estrutura Base
- [ ] Verificar que HTML tem todos os elementos necessários
- [ ] Verificar que `.envelope-container` tem `perspective: 800px`
- [ ] Verificar que `.envelope` tem `transform-style: preserve-3d`

### Fase 2: Aba Distinta (Fechada)
- [ ] Aumentar contraste da cor da aba
- [ ] Adicionar `drop-shadow` na base da aba
- [ ] Posicionar selo no centro da base da aba

### Fase 3: Abertura 3D
- [ ] `transform-origin: top center` na aba
- [ ] Transição `rotateX(-180deg)` quando `.opening`
- [ ] Face interna da aba com `::after` e cor diferente
- [ ] Liner interior visível quando abre

### Fase 4: Carta Emerge
- [ ] Carta começa escondida (opacity 0, translateY alto)
- [ ] Carta sobe e aparece coordenado com aba
- [ ] Delay de ~300ms para carta começar depois da aba
- [ ] z-index correto (atrás → frente)

### Fase 5: Polimento
- [ ] Timings suaves (cubic-bezier)
- [ ] Selo voa para fora com rotate
- [ ] Sombras realistas
- [ ] Testar em mobile e desktop

---

## 🧪 Validação

Depois de implementar, verificar:

1. **Fechado**: Aba é claramente visível, selo no centro
2. **Ao clicar**: Selo voa, aba começa a rodar
3. **Durante abertura**: Vê-se a face interna da aba (cor diferente)
4. **Carta emerge**: Aparece a subir do envelope, não instantânea
5. **Final**: Carta totalmente visível, envelope pode desaparecer

---

## 📝 Notas

- A implementação atual já tem alguns destes elementos, mas estão mal coordenados
- O principal problema é o timing e a coordenação entre aba/carta
- A face interna da aba precisa de ser mais distinta
- O `letter-clip` pode estar a interferir com o efeito de emergência

