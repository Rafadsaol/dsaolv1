# 3 — JavaScript: linguagem, DOM e navegação

[Índice](README.md) · [Anterior: CSS](02-css.md) · [Próximo: orçamento](04-orcamento-whatsapp.md)

## Começando pela sintaxe

JavaScript executa instruções. No navegador, ele também acessa APIs para alterar a página, escutar eventos, medir elementos e navegar.

```js
const emailContact = document.querySelector('#email-contact');
emailContact.href = `mailto:${CONTACT_EMAIL}`;
```

A primeira linha guarda uma referência a um elemento. A segunda altera seu destino.

| Termo/símbolo | Exemplo e função |
|---|---|
| `const` | Declara uma variável que não pode ser reatribuída |
| `let` | Declara uma variável que pode receber outro valor |
| String | Texto: `'sites'` |
| Number | Número: `32`, `0.5` |
| Boolean | Valor lógico: `true` ou `false` |
| `null` | Ausência de valor representada intencionalmente |
| `undefined` | Valor ausente, como uma propriedade não definida |
| Array | Lista: `['sites', 'outro']` |
| Objeto | Agrupamento de propriedades: `{ cpu: 32, ram: 48 }` |
| `=` | Atribuição |
| `===` / `!==` | Igualdade / diferença estrita, sem conversão implícita de tipo |
| `!` | Negação lógica |
| `&&` / `||` | E / OU com avaliação em curto-circuito; podem retornar operandos, não apenas booleanos |
| `+=` | Soma ao valor atual e atribui o resultado |
| `condição ? a : b` | Operador ternário: escolhe uma de duas expressões |
| `objeto?.campo` | Optional chaining: retorna `undefined` se a base for `null` ou `undefined` |
| `` `Olá, ${nome}` `` | Template literal: permite inserir valores em um texto |
| `//` | Comentário até o fim da linha |

Uma variável `const` que aponta para objeto ou array não congela seu conteúdo. `const items = []; items.push('a')` é permitido; reatribuir `items = []` não é.

`'use strict'` ativa o modo estrito naquele script, ajudando a identificar alguns erros, como atribuições a variáveis não declaradas.

## Funções, parâmetros, argumentos e retorno

```js
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menu.classList.remove('is-open');
}
```

Uma função reúne instruções que podem ser executadas por uma chamada, como `closeMenu()`.

Parâmetros são os nomes declarados na função; argumentos são os valores passados ao chamá-la. `return` devolve um valor e encerra a execução daquela chamada. Sem `return` explícito, o resultado normalmente é `undefined`.

O projeto também usa arrow functions:

```js
(link) => document.querySelector(link.hash)
```

Com uma única expressão, há retorno implícito. Com corpo entre `{ }`, use `return` se precisar devolver um resultado. Uma arrow function também possui regras próprias para `this`; neste projeto os exemplos não dependem de um `this` dinâmico.

## IIFE e escopo

Nos scripts das demos e do orçamento:

```js
(() => {
  // Variáveis e funções internas.
})();
```

Essa é uma **IIFE**, uma função executada imediatamente. As variáveis declaradas dentro dela não ficam disponíveis globalmente. Isso evita colisões entre nomes como `state`, `timer` e `feedback`.

É uma forma simples de organização por escopo. Não é a mesma coisa que um módulo ES com `import`/`export`; o projeto atual usa scripts clássicos, sem bundler.

## O DOM

DOM significa *Document Object Model*. O navegador representa os elementos HTML como objetos ligados em uma árvore.

| API | Uso |
|---|---|
| `document.querySelector(seletor)` | Primeiro elemento correspondente, ou `null` |
| `querySelectorAll(seletor)` | Coleção dos elementos correspondentes |
| `element.textContent` | Lê/escreve texto |
| `element.innerHTML` | Lê/escreve HTML, que será interpretado |
| `element.value` | Valor atual de um controle de formulário |
| `element.checked` | Estado do checkbox |
| `element.disabled` | Habilita/desabilita um controle |
| `setAttribute()` / `removeAttribute()` | Define/remove atributos |
| `classList.add/remove/toggle()` | Manipula classes |
| `element.dataset.state` | Acessa `data-state` |
| `element.closest(seletor)` | Procura o próprio elemento e depois seus ancestrais |
| `element.focus()` | Solicita foco |

Se `querySelector()` retornar `null`, acessar uma propriedade dele provoca erro. Os scripts dependem de IDs/classes específicos nas páginas correspondentes: não inclua o JS da loja em uma página sem a estrutura da loja.

## Eventos e callbacks

```js
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menu.classList.toggle('is-open', !isOpen);
});
```

`addEventListener` registra uma função para executar quando um evento ocorrer. Essa função é um callback. Ela é passada como argumento; não é executada imediatamente como seria `closeMenu()`.

Passo a passo do clique:

1. O atributo é lido como texto, não como booleano.
2. A comparação produz o booleano `isOpen`.
3. `!isOpen` inverte o estado.
4. `String(...)` transforma o booleano em texto para o atributo.
5. `toggle(classe, condição)` adiciona a classe se a condição for verdadeira e a remove caso contrário.

O CSS mobile mostra `.nav-links.is-open`. O JS não precisa calcular alturas para esse menu.

## O que cada parte do script.js principal faz

### E-mail e ano

`CONTACT_EMAIL` centraliza o endereço, e um template literal prepara `mailto:`. `new Date().getFullYear()` lê o ano do relógio do dispositivo e atualiza `#year`.

### Fechamento do menu

`closeMenu()` atualiza tanto o atributo de acessibilidade quanto a classe visual. É chamada ao selecionar um link, pressionar Escape, clicar fora da navegação e cruzar o breakpoint.

```js
if (!event.target.closest('.nav')) closeMenu();
```

`event.target` é o elemento que originou o evento. Se ele não está dentro de `.nav`, a expressão devolve um valor nulo e a negação autoriza o fechamento.

`event.currentTarget`, usado como conceito em eventos, seria o elemento que recebeu aquele listener. Ele pode ser diferente de `target`, por exemplo ao clicar no SVG de um botão.

### Foco ao navegar

No menu mobile, o destino ganha `tabindex="-1"` e recebe `focus({ preventScroll: true })`. O foco sai do menu que será escondido; a rolagem fica por conta da navegação da âncora.

Escape fecha o menu e devolve o foco ao botão. Apenas esconder visualmente o menu sem cuidar do foco pode deixar a navegação por teclado confusa.

### Breakpoint no JavaScript

```js
window.matchMedia('(min-width: 821px)').addEventListener('change', closeMenu);
```

`matchMedia` cria um objeto que acompanha uma condição de mídia. O evento `change` ocorre quando o resultado dessa condição muda, não a cada pixel de redimensionamento. O limite corresponde ao CSS mobile de até 820 px.

### Seção ativa

```js
const sectionLinks = [...menu.querySelectorAll('a[href^="#"]')];
const sections = sectionLinks.map((link) => document.querySelector(link.hash));
```

`[href^="#"]` significa “atributo href que começa com #”. `...` espalha os itens da coleção em um array. `map` transforma cada link em seu elemento de destino. `link.hash` contém seu fragmento.

`updateActiveSection()` compara as posições das seções com a região do cabeçalho. `getBoundingClientRect().top` e `.bottom` são medidas em relação à viewport. `getComputedStyle()` consulta estilos calculados; `parseFloat()` extrai o número de um valor como `'100px'`.

O cálculo considera o espaço de `scroll-padding` e `scroll-margin`, evitando que a seção correta deixe de ser marcada após um clique em âncora. Perto do fim da página, há uma condição para marcar a última seção mesmo se ela não conseguir alcançar o topo.

Somente o link correspondente recebe `aria-current="location"`. O estilo é aplicado pelo CSS desse atributo.

### requestAnimationFrame

```js
function scheduleNavigationUpdate() {
  if (navigationFrame === null) {
    navigationFrame = window.requestAnimationFrame(updateActiveSection);
  }
}
```

A função agenda uma atualização antes de uma próxima pintura. Enquanto há uma atualização pendente, outra não é agendada. Ao terminar, `navigationFrame` volta a `null`.

Isso evita trabalho duplicado entre eventos de rolagem próximos. Não impõe uma taxa universal de 60 FPS e não é um temporizador para aguardar exatamente 16 ms.

O listener de rolagem usa `{ passive: true }`, informando que esse callback não pretende cancelar o comportamento padrão do evento. O ganho depende do evento e do navegador; o agendamento e a pequena quantidade de medições também são importantes.

## Métodos de arrays que aparecem nas outras partes

| Método | O que retorna / faz |
|---|---|
| `forEach` | Executa uma função para cada item; não cria um array de resultados |
| `map` | Cria um array com os resultados das transformações |
| `filter` | Cria um array com os itens aprovados pela condição |
| `find` | Retorna o primeiro item aprovado, ou `undefined` |
| `join` | Junta os itens em um texto usando um separador |
| `push` | Acrescenta ao final, alterando o array |
| `shift` | Remove do começo, alterando o array |

Nos callbacks de `forEach`/`map`, o segundo argumento costuma ser o índice. Arrays começam no índice zero.

## Métodos de texto e conversões

| Expressão | Função |
|---|---|
| `texto.trim()` | Remove espaços das extremidades |
| `texto.toLowerCase()` | Produz uma versão em minúsculas |
| `texto.includes(parte)` | Verifica se uma parte existe no texto |
| `texto.startsWith(prefixo)` | Verifica o começo do texto |
| `texto.slice(2)` | Retorna a parte a partir do índice 2 |
| `texto.split(separador)` | Transforma o texto em um array de partes |
| `texto.replace(padrao, novo)` | Produz texto com a substituição indicada |
| `String(valor)` | Converte para texto |
| `Number(valor)` | Converte para número; pode produzir `NaN` quando a conversão falha |
| `Number.isInteger(valor)` | Verifica se já é um número inteiro |
| `parseFloat(texto)` | Lê uma parte numérica inicial, útil em valores calculados como `100px` |

Esses métodos de strings não alteram a string original: retornam outro valor. O código precisa usar esse retorno. É diferente de métodos como `push`, que modificam o array ao qual pertencem.

## Exercícios

1. Recrie um botão que adiciona/remove uma classe de um parágrafo.
2. Acrescente `aria-expanded` ao exercício e explique por que ele precisa acompanhar a classe.
3. Escreva um array de serviços e use `map` para obter somente os nomes; use `filter` para selecionar dois.
4. No DevTools da sua cópia, inspecione `document.querySelector('#menu').classList` antes e depois do clique.
5. Crie uma função com parâmetro `valor` que retorne o dobro. Compare retornar o valor com apenas atribuí-lo a uma variável interna.
6. Desenhe em papel a sequência clique → callback → estado → DOM → CSS para o menu.
