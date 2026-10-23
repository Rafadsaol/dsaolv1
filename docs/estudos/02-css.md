# 2 — CSS: aparência, layout e responsividade

[Índice](README.md) · [Anterior: HTML](01-html.md) · [Próximo: JavaScript](03-javascript.md)

## Como ler uma regra

```css
.card {
  padding: 30px;
  border-radius: 12px;
}
```

`.card` é o **seletor**. Entre chaves estão as declarações. Cada declaração possui uma propriedade e um valor, separados por `:` e terminados por `;`.

O CSS atual contém várias regras compactadas em uma linha. Quebras de linha e indentação facilitam a leitura, mas geralmente não mudam o comportamento. Na sua cópia, você pode expandir uma regra sem alterar seus valores.

## Quem cuida de cada parte

| Arquivo | Partes principais |
|---|---|
| `style.css` | Variáveis do tema, elementos básicos, cabeçalho, hero, serviços, portfólio, sobre, contato, rodapé, animações, orçamento e WhatsApp |
| `servicos/servicos.css` | Apresentação do serviço, painéis, etapas e CTA das três páginas de serviço |
| `projetos/demo.css` | Base das demos, métricas e gráfico, fluxo e log, catálogo e carrinho |

As páginas internas carregam primeiro `style.css` e depois seu arquivo específico. Elas reaproveitam variáveis, botões e fontes. A ordem pode decidir qual declaração vence quando a prioridade das regras é equivalente.

## Variáveis do tema

Do projeto, com o bloco reduzido para estudo:

```css
:root {
  --bg: #0B1120;
  --blue: #2563EB;
  --text: #f4f7ff;
  --ease-soft: cubic-bezier(.22, 1, .36, 1);
}

.primary {
  background: var(--blue);
}
```

`--blue` é uma propriedade personalizada. `var(--blue)` consulta esse valor. `:root` seleciona o elemento raiz; em HTML, é o `html`. As variáveis evitam repetir cores em todos os componentes.

`#2563eb26` possui oito dígitos: os seis primeiros são a cor, e os dois últimos representam a transparência. `rgba(...)` também expressa uma cor com transparência.

## Seletores usados

| Seletor | O que seleciona |
|---|---|
| `*` | Todos os elementos |
| `.card` | Elementos com a classe `card` |
| `.card h3` | Títulos `h3` dentro de um card |
| `.quote-copy > p` | Parágrafos filhos diretos |
| `input[type="checkbox"]` | Inputs desse tipo |
| `[aria-invalid="true"]` | Campos marcados como inválidos |
| `.button:hover` | Estado do ponteiro sobre o botão |
| `a:focus-visible` | Foco que o navegador considera necessário evidenciar, normalmente por teclado |
| `.field-error:empty` | Elemento de erro sem conteúdo |
| `.card::before` | Pseudo-elemento decorativo, quando definido |
| `.preview-bars i:nth-child(2)` | Segundo filho do grupo, se ele for um `i` |
| `.quote-form input:not([type="checkbox"])` | Inputs do formulário, exceto checkbox |
| `.service-panel li::marker` | Marcador dos itens da lista |

`:hover` é uma pseudoclasse: descreve um estado. `::before` é um pseudo-elemento: permite estilizar uma parte gerada. Um `::before` usado como decoração costuma precisar de `content: ""`.

## Cascata, especificidade e herança

Cascata é o conjunto de regras que decide qual declaração será aplicada. Dentro do mesmo contexto de origem/camada/importância, a especificidade compara seletores. Se houver empate, a ordem de declaração importa.

Exemplo do dashboard:

```css
.panel p { font-size: 14px; }
.metric .metric-value { font-size: 32px; }
```

A segunda regra tem duas classes e vence a primeira, que tem uma classe e um elemento. Não basta escrever uma regra depois se ela tem prioridade menor.

`!important` modifica a prioridade de uma declaração; não deve ser a primeira ferramenta para resolver todos os conflitos. O projeto o usa em situações específicas, como desabilitar animações na preferência de movimento reduzido.

Herança é diferente de especificidade. Propriedades como `color` e `font-family` geralmente passam de pai para filho quando não há um valor que as substitua. `margin` não é herdada por padrão.

## Box model e espaçamento

Cada caixa pode ter conteúdo, `padding`, `border` e `margin`.

- `padding`: espaço interno, entre conteúdo e borda.
- `border`: contorno da caixa.
- `margin`: espaço externo.
- `gap`: espaço entre itens de um layout Grid/Flex.

```css
* { box-sizing: border-box; }
```

Com `border-box`, a largura declarada inclui conteúdo, padding e borda. Isso simplifica dimensionamento. A margem continua externa.

`padding: 12px 20px` significa 12 px em cima/baixo e 20 px nas laterais. Com quatro valores, a ordem é topo, direita, baixo, esquerda.

`padding-block` usa o eixo de bloco da escrita; em português horizontal, corresponde a topo e base. `min-width: 0` permite que itens de Grid/Flex encolham em vez de forçar overflow por seu conteúdo mínimo.

## Container, unidades e funções

Do projeto:

```css
.container {
  width: min(1180px, calc(100% - 64px));
  margin: auto;
}
```

A largura é o menor valor entre 1.180 px e a largura disponível menos 64 px. Isso limita o conteúdo em telas grandes e cria margens em telas menores.

| Recurso | Significado |
|---|---|
| `px` | Pixel CSS; não equivale necessariamente a um pixel físico da tela |
| `%` | Percentual calculado em relação ao contexto da propriedade |
| `vw` | 1% da largura da viewport |
| `vh` | 1% da altura da viewport |
| `fr` | Fração do espaço disponível em uma grade |
| `calc()` | Combina valores em um cálculo |
| `min()` / `max()` | Escolhe o menor / maior valor |
| `clamp(mínimo, ideal, máximo)` | Limita um valor fluido entre dois extremos |

Exemplo: `font-size: clamp(36px, 4.5vw, 56px)` permite crescimento com a tela, respeitando os limites.

## Flexbox e Grid no site

Flexbox organiza itens principalmente em um eixo:

```css
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

`align-items` alinha no eixo transversal; `justify-content` distribui no eixo principal. `flex-direction: column` muda esse eixo para vertical. `flex-wrap` permite quebrar a linha.

Grid organiza linhas e colunas:

```css
.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
```

Isso cria três colunas iguais. `minmax(0, 1fr)` permite que cada coluna encolha sem ficar presa ao tamanho mínimo de um texto longo. No formulário, `grid-column: 1 / -1` faz um campo ocupar todas as colunas.

O projeto também usa `margin-top: auto` dentro de cards flexíveis: a margem absorve o espaço disponível e ajuda a alinhar conteúdos inferiores.

## Posicionamento

| Valor de `position` | Exemplo |
|---|---|
| `relative` | Cria uma referência para decoração posicionada dentro do hero |
| `absolute` | Posiciona órbitas e etiquetas em relação ao ancestral apropriado |
| `fixed` | Cabeçalho e botão flutuante em relação à viewport, no contexto usual do site |
| `sticky` | Carrinho acompanha a rolagem dentro das restrições de seu contêiner |

`z-index` ordena elementos dentro dos contextos de empilhamento aplicáveis. `isolation: isolate` cria um contexto de empilhamento; por isso uma camada decorativa com `z-index: -1` pode ficar atrás do conteúdo do hero sem cair atrás de toda a página.

`scroll-padding-top` e `scroll-margin-top` reservam espaço na navegação até âncoras. Isso ajuda a evitar que o cabeçalho fixo cubra os títulos.

## Gradientes e decoração

- `linear-gradient`: mudança de cor ao longo de uma direção.
- `radial-gradient`: mudança em torno de uma região central.
- `background-size`: tamanho da repetição da grade de fundo.
- `mask-image`: controla quais regiões de uma camada ficam visíveis.
- `background-clip: text`: faz o fundo aparecer dentro das letras.
- `backdrop-filter: blur(...)`: desfoca o que está atrás do elemento translúcido.
- `pointer-events: none`: impede que uma decoração intercepte cliques.
- `box-shadow`: sombra da caixa; não altera as dimensões do layout.

Há fundos CSS e SVGs locais, sem biblioteca de ícones ou imagens remotas.

## Transição e animação

Transição suaviza uma mudança de estado, como sair de `transform: none` para `translateY(-2px)` no hover.

```css
.button {
  transition: background .35s ease,
              transform .45s var(--ease-soft),
              box-shadow .45s ease;
}
```

A curva `cubic-bezier(.22, 1, .36, 1)` controla a progressão da mudança ao longo do tempo; ela não altera o destino final. `.45s` corresponde a 450 milissegundos.

Animação por `@keyframes` define uma sequência, como a entrada do hero:

```css
@keyframes hero-enter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

`animation-delay` escalona título, descrição e botões. O modo `both` aplica o estado inicial durante o atraso e retém o estado final após a animação. Isso também significa que um `transform` animado pode criar contexto de empilhamento.

No projeto, essa animação inicia com o carregamento da página. Não há IntersectionObserver para revelar todos os cards ao rolar.

## Responsividade e acessibilidade visual

```css
@media (max-width: 820px) {
  .cards { grid-template-columns: 1fr; }
}
```

Uma media query aplica regras sob uma condição. `820px` é um breakpoint: um ponto em que a composição muda. Os arquivos também usam 600, 1.000 e 1.400 px em ajustes específicos; nem toda mudança ocorre no mesmo tamanho.

No formulário, os controles usam 16 px em telas pequenas para reduzir a tendência de zoom automático ao focar campos em navegadores móveis. `env(safe-area-inset-bottom)` reserva espaço para áreas de segurança de alguns dispositivos.

`prefers-reduced-motion: reduce` desativa animações/transições e rolagem suave. `forced-colors: active` ajusta elementos para modos de cores forçadas. O foco visível não é removido dos controles interativos.

## Dicionário de propriedades frequentes

| Propriedade | O que você está controlando |
|---|---|
| `color` | Cor do texto e valor de referência de `currentColor` nos SVGs |
| `background` | Fundo, incluindo cores e gradientes |
| `font-family` | Lista de famílias de fonte em ordem de preferência |
| `font-size` | Tamanho da fonte |
| `font-weight` | Peso visual, como 400 ou 600, conforme as fontes disponíveis |
| `line-height` | Altura de linha; um número sem unidade multiplica o tamanho da fonte |
| `letter-spacing` | Espaço adicional entre caracteres |
| `text-align` | Alinhamento do texto dentro da caixa |
| `text-decoration` | Decoração como o sublinhado da seção ativa |
| `width` / `height` | Dimensões da caixa, considerando o modelo de dimensionamento |
| `min-height` / `max-width` | Limites mínimo de altura e máximo de largura |
| `border` | Espessura, estilo e cor da borda |
| `border-radius` | Arredondamento dos cantos |
| `outline` / `outline-offset` | Contorno de foco e seu afastamento, sem reservar espaço no layout |
| `opacity` | Opacidade do elemento como um todo, incluindo seu conteúdo |
| `overflow` | Como tratar conteúdo que ultrapassa uma caixa |
| `overflow-wrap` | Possibilidade de quebrar textos longos para caber na linha |
| `white-space` | Tratamento de espaços e quebras de linha; `pre-wrap` conserva quebras e permite ajuste |
| `cursor` | Indicação visual do ponteiro, como ação clicável ou indisponível |
| `resize` | Permissão de redimensionamento do textarea |
| `accent-color` | Cor de destaque de controles nativos, quando suportado |
| `color-scheme` | Indicação de tema claro/escuro para elementos nativos do navegador |
| `touch-action` | Quais interações de toque o navegador pode tratar naquele elemento |

O nome `Inter` aparece na lista de fontes, mas o site não baixa essa família. Se ela não estiver disponível, o navegador tenta as próximas opções, como as fontes de sistema. Isso é chamado de fallback de fonte.

## Exercícios

1. Altere apenas `--blue` na cópia. Identifique quais componentes dependem dela e quais possuem um valor de cor específico.
2. Faça a grade de cards passar de três para duas colunas em um laboratório. O conteúdo deve continuar sem rolagem horizontal.
3. Compare `width: 100%` com e sem `border-box` em uma caixa com padding.
4. No DevTools, abra Computed e descubra qual regra define o tamanho do número da CPU.
5. Compare uma transição de 100 ms com 450 ms e com movimento reduzido ativo.
6. Troque `fixed` por `static` no cabeçalho, somente na cópia, e observe por que o espaço superior do hero existia.
