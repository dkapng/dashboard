# BRIEF DE MOTION DESIGN — SER PONTE FORTALEZA
## Transição de Formas / Bumper Identidade Visual
**Formato:** 1080 x 1920 px (vertical 9:16)
**Duração total estimada:** 18–22 segundos
**Fundo:** Branco puro (#FFFFFF)
**Uso:** Bumper de abertura/fechamento para adaptação em outros trabalhos
**Arquivo final:** MP4 com fundo branco, sem texto, resolução 1080x1920 @30fps (ou 60fps se a ferramenta permitir)

---

## SISTEMA DE FORMAS

O projeto tem 25 elementos organizados em **5 shapes distintos × 5 cores**. Cada shape é um polígono irregular baseado nos contornos dos bairros de Fortaleza-CE.

### As 5 formas (shapes)
Todos os shapes têm leve inclinação — não são ortogonais, ficam levemente rotacionados (~10–15° no sentido anti-horário). Descrevo cada um por sua silhueta:

- **Shape A** — Pentágono assimétrico inclinado. Lado esquerdo é uma diagonal descendente (ângulo ~45°), topo tem dois planos formando um "V" aberto, lado direito é quase vertical, base é horizontal. Lembra um bloco que foi cortado na diagonal superior esquerda. Tamanho: ocupa ~55% da largura do canvas.
  *Arquivo de referência: ELEMENTOS DE APOIO 1, 6, 11, 16, 21*

- **Shape B** — Quadrilátero alto e vertical. Lado esquerdo tem um corte diagonal acentuado saindo do canto superior esquerdo para baixo, criando uma quina pontiaguda na esquerda. O restante (topo, direita, base) é quase retangular com leve inclinação. Lembra um trapézio irregular e alto. Tamanho: ocupa ~45% da largura, ~70% da altura do canvas.
  *Arquivo de referência: ELEMENTOS DE APOIO 2, 7, 12, 17, 22*

- **Shape C** — Pentágono pequeno/médio. Quase um retângulo, mas com o canto superior direito cortado em diagonal (corte de ~45°) e o canto inferior direito também cortado (corte menor, ~30°). Resultado: parece um documento ou folha com dois cantos chanfrados na direita. Tamanho: ocupa ~30% da largura do canvas (é o menor dos 5).
  *Arquivo de referência: ELEMENTOS DE APOIO 3, 8, 13, 18, 23*

- **Shape D** — Hexágono largo e irregular. Tem 6 lados: base horizontal, lado direito com dois segmentos formando uma ponta arredondada (ângulos suaves), topo com dois planos em "V" aberto, lado esquerdo longo e quase vertical. É o shape mais largo — lembra o contorno de um bairro expandido. Tamanho: ocupa ~65% da largura do canvas (é o maior dos 5).
  *Arquivo de referência: ELEMENTOS DE APOIO 4, 9, 14, 19, 24*

- **Shape E** — Forma em "L" deitado ou cotovelo. Tem um bloco vertical à esquerda e um bloco horizontal à direita em nível mais baixo, unidos por um recuo interno (canto côncavo no topo direito). A quina interna cria uma silhueta de "degrau" ou "encaixe". Tamanho: ocupa ~60% da largura, ~55% da altura do canvas.
  *Arquivo de referência: ELEMENTOS DE APOIO 5, 10, 15, 20, 25*

### As 5 cores
- **Off-white / cinza claro:** #D6D3C8 (shapes 1–5)
- **Lilás:** #C8A0D2 (shapes 6–10)
- **Roxo escuro:** #5A1A6E (shapes 11–15)
- **Laranja:** #E05010 (shapes 16–20)
- **Magenta:** #C8006E (shapes 21–25)

---

## LÓGICA DA ANIMAÇÃO

A animação é uma **sequência contínua** onde cada shape entra, fica em tela por um instante e transiciona para o próximo. A transição entre shapes usa **morphing de polígono** (deformação dos pontos de vértice de uma forma para outra). A troca de cor acontece **junto com o morph**, num crossfade de cor que dura o mesmo tempo da transição.

A ordem de aparição segue a progressão de cor e shape:
1. Off-white Shape A → 2. Lilás Shape A → 3. Roxo Shape A → 4. Laranja Shape A → 5. Magenta Shape A
6. Magenta Shape B → 7. Laranja Shape B → 8. Roxo Shape B → 9. Lilás Shape B → 10. Off-white Shape B
*(alternando a direção da cor a cada ciclo de shape)*
...e assim por diante até cobrir todos os 25 elementos.

> **Alternativa mais simples para a IA de motion:** Se morphing não for possível, usar **dissolve com escala** — a forma atual faz scale-down até 0 enquanto a próxima faz scale-up de 0, com leve rotação de 5–8° durante a saída/entrada. Isso cria fluidez mesmo sem morphing real.

---

## DESCRIÇÃO CENA A CENA

**Duração por shape: ~0.6s em tela + 0.3s de transição = ~0.9s por shape**
**25 shapes × 0.9s ≈ 22.5s + 2s de logo final ≈ 24s total**
*(pode reduzir para 0.5s + 0.2s por shape se quiser ~18s)*

---

### ABERTURA — 0:00 a 0:00.5
Tela branca. Fade in rápido (0.3s) da primeira forma.

---

### BLOCO 1 — Shapes em off-white/cinza claro (#D6D3C8)

**Cena 1 — Shape A off-white** *(0:00.5 – 0:01.1)*
O pentágono assimétrico aparece centralizado na tela, levemente deslocado para o centro-direita (posição X: 55–60% do canvas, Y: 45–50%). Inclinado ~12° anti-horário. Entra com scale de 0.85 → 1.0 em 0.2s com ease-out. Fica parado por 0.4s.

**Cena 2 — Shape B off-white** *(0:01.1 – 0:01.7)*
Transição: Shape A faz morph suave para Shape B enquanto se move levemente para esquerda (deslocamento de ~80px). O shape B é mais alto e estreito — os vértices migram para essa nova posição em 0.3s com ease-in-out. Fica parado 0.3s.

**Cena 3 — Shape C off-white** *(0:01.7 – 0:02.3)*
Shape C é menor. O morph acontece com leve scale-down (~15% menor que B). Reposiciona para centro do canvas. Duração do morph: 0.3s. Hold: 0.3s.

**Cena 4 — Shape D off-white** *(0:02.3 – 0:03.0)*
Shape D é o maior. Scale-up durante o morph. Ocupa mais espaço horizontal, move levemente para o centro-esquerda. Hold: 0.4s.

**Cena 5 — Shape E off-white** *(0:03.0 – 0:03.6)*
Shape E tem a forma de "degrau/cotovelo". O morph reconstrói o contorno pela forma côncava. Posicionado levemente abaixo do centro (Y: 52%). Hold: 0.3s.

---

### BLOCO 2 — Lilás (#C8A0D2)
*A troca de cor acontece junto com a primeira transição deste bloco — Shape E off-white faz morph para Shape A lilás com crossfade de cor simultâneo.*

**Cena 6 — Shape A lilás** *(0:03.6 – 0:04.2)*
Morph + troca de cor off-white → lilás. O mesmo pentágono assimétrico agora em lilás. O morph de forma + cor acontece em 0.3s. Posição: centro-direita. Hold: 0.3s.

**Cena 7 — Shape B lilás** *(0:04.2 – 0:04.8)*
Shape alto e vertical em lilás. Morph 0.3s. Hold: 0.3s.

**Cena 8 — Shape C lilás** *(0:04.8 – 0:05.4)*
Shape menor com cantos chanfrados. Lilás. Morph 0.3s. Hold: 0.3s.

**Cena 9 — Shape D lilás** *(0:05.4 – 0:06.1)*
Hexágono largo em lilás. Morph 0.3s. Hold: 0.4s.

**Cena 10 — Shape E lilás** *(0:06.1 – 0:06.7)*
"Cotovelo" em lilás. Morph 0.3s. Hold: 0.3s.

---

### BLOCO 3 — Roxo escuro (#5A1A6E)
*Transição de lilás → roxo acontece junto com o morph do Shape E lilás para Shape A roxo.*

**Cena 11 — Shape A roxo** *(0:06.7 – 0:07.3)*
Pentágono assimétrico em roxo escuro. Leve rotação adicional na entrada: o shape entra com 18° e estabiliza em 12° durante 0.3s. Hold: 0.3s. O roxo escuro é mais pesado visualmente — o shape pode entrar com escala 1.05 e normalizar para 1.0 para dar uma sensação de "peso".

**Cena 12 — Shape B roxo** *(0:07.3 – 0:07.9)*
Morph 0.3s. Hold: 0.3s.

**Cena 13 — Shape C roxo** *(0:07.9 – 0:08.5)*
Morph 0.3s. Hold: 0.3s.

**Cena 14 — Shape D roxo** *(0:08.5 – 0:09.2)*
O hexágono em roxo escuro fica mais presente/dominante por ser o maior shape + cor mais pesada. Hold: 0.4s.

**Cena 15 — Shape E roxo** *(0:09.2 – 0:09.8)*
Morph 0.3s. Hold: 0.3s.

---

### BLOCO 4 — Laranja (#E05010)
*Transição de roxo → laranja. A mudança de cor aqui é a mais contrastante do vídeo — de escuro para quente. O crossfade pode ter 0.05s a mais (0.35s) para não parecer flash.*

**Cena 16 — Shape A laranja** *(0:09.8 – 0:10.4)*
Pentágono em laranja. Morph + crossfade de cor 0.35s. Hold: 0.3s.

**Cena 17 — Shape B laranja** *(0:10.4 – 0:11.0)*
Shape alto em laranja. Morph 0.3s. Hold: 0.3s.

**Cena 18 — Shape C laranja** *(0:11.0 – 0:11.6)*
Menor shape em laranja. Morph 0.3s. Hold: 0.3s.

**Cena 19 — Shape D laranja** *(0:11.6 – 0:12.3)*
Hexágono largo em laranja. Maior destaque deste bloco. Hold: 0.4s.

**Cena 20 — Shape E laranja** *(0:12.3 – 0:12.9)*
"Cotovelo" em laranja. Morph 0.3s. Hold: 0.3s.

---

### BLOCO 5 — Magenta (#C8006E)
*Transição de laranja → magenta. Cores quentes para quente, transição fluida.*

**Cena 21 — Shape A magenta** *(0:12.9 – 0:13.5)*
Pentágono em magenta. Morph + crossfade 0.3s. Hold: 0.3s.

**Cena 22 — Shape B magenta** *(0:13.5 – 0:14.1)*
Shape alto em magenta. Morph 0.3s. Hold: 0.3s.

**Cena 23 — Shape C magenta** *(0:14.1 – 0:14.7)*
Menor shape em magenta. Morph 0.3s. Hold: 0.3s.

**Cena 24 — Shape D magenta** *(0:14.7 – 0:15.4)*
Hexágono largo em magenta. É o penúltimo shape antes do fechamento — pode ter hold ligeiramente maior (0.5s) para respirar antes da logo.

**Cena 25 — Shape E magenta** *(0:15.4 – 0:16.2)*
"Cotovelo" em magenta. Morph 0.3s. Hold: 0.5s. **Este é o último shape antes da logo.**

---

### FECHAMENTO — LOGO SER PONTE *(0:16.2 – 0:18.5)*

**Transição Shape E magenta → Logo:**
O Shape E magenta faz scale-down de 1.0 → 0 com ease-in em 0.4s, enquanto simultaneously a logo da Ser Ponte aparece com fade-in (opacity 0 → 1) em 0.5s. As duas animações se sobrepõem por 0.2s.

**Logo estática:**
A logo da Ser Ponte (ícone da ponte + logotipo em branco ou na cor primária da marca) fica centralizada na tela, em branco puro sobre fundo branco. Usar a versão em cor escura da logo (roxo #5A1A6E ou magenta #C8006E) para ter contraste sobre o fundo branco.

**Hold da logo:** 1.5–2.0s

**Fade out:** Fade out geral da logo em 0.3s. Tela branca.

---

## PARÂMETROS TÉCNICOS DE EASING

Para toda a animação, usar:
- **Entrada de shapes:** ease-out cubic (começa rápido, desacelera ao chegar)
- **Saída de shapes:** ease-in cubic (começa devagar, acelera ao sair)
- **Morph de polígono:** ease-in-out cubic
- **Crossfade de cor:** linear (sem curva — troca de cor linear fica mais limpa)
- **Logo entrada:** ease-out quadratic

Curva sugerida para morph: `cubic-bezier(0.42, 0, 0.58, 1.0)`

---

## POSICIONAMENTO DAS FORMAS NA TELA

Os shapes não ficam sempre no mesmo lugar. Eles se movem levemente entre cenas para criar dinamismo. Sugestão de posicionamento por shape:

| Shape | Posição X (% do canvas) | Posição Y (% do canvas) |
|-------|--------------------------|--------------------------|
| A     | 50–58%                   | 42–50%                   |
| B     | 45–55%                   | 38–55%                   |
| C     | 48–56%                   | 44–52%                   |
| D     | 42–52%                   | 46–54%                   |
| E     | 44–54%                   | 48–56%                   |

Dentro de cada bloco de cor, os shapes se deslocam sutilmente — ~40–80px de diferença entre uma cena e a próxima. Isso cria um ritmo visual de "deriva" da forma pelo espaço, como se o território fosse se movendo.

---

## ROTAÇÃO

Todos os shapes mantêm inclinação constante de ~12° anti-horário ao longo de toda a animação. Não rotacionar durante os morphs — a rotação fixa é parte da identidade visual do sistema.

**Exceção:** Na entrada do primeiro shape (Cena 1), pode começar em 18° e chegar a 12° durante os primeiros 0.3s, para criar uma sensação de "pouso" da forma.

---

## ARQUIVOS DE REFERÊNCIA

Os 25 PNGs estão na pasta `imagens/` com fundo transparente. Usá-los diretamente como assets de shape — as coordenadas dos polígonos podem ser extraídas dos contornos de cada PNG.

Nomenclatura:
- 01–05 = off-white (Shape A ao E)
- 06–10 = lilás (Shape A ao E)
- 11–15 = roxo escuro (Shape A ao E)
- 16–20 = laranja (Shape A ao E)
- 21–25 = magenta (Shape A ao E)

---

## NOTAS PARA A IA DE MOTION

1. Os PNGs têm fundo branco, não transparente. Usar blend mode "multiply" ou extrair o contorno do polígono via detecção de bordas antes de animar.
2. A ordem dos shapes dentro de cada bloco de cor pode ser invertida ou reordenada para favorecer a fluidez do morph — priorize transições onde os vértices migrem distâncias menores.
3. Se a IA suportar morphing de SVG, converter os PNGs para SVG path antes de animar é o caminho mais limpo.
4. O ritmo geral é calmo, não frenético. Não acelerar as transições tentando "dinamizar" — a lentidão é intencional e faz parte da linguagem da marca.
5. Fundo sempre branco puro (#FFFFFF). Sem gradiente, sem textura.
