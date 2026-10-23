# 4 — Configuração, formulário e WhatsApp

[Índice](README.md) · [Anterior: JavaScript](03-javascript.md) · [Próximo: dashboard e automação](05-dashboard-automacao.md)

## Arquivos envolvidos

- `index.html`: controles, rótulos, erros, botão de envio e botão flutuante.
- `style.css`: componentes `.quote-*`, `.form-*`, `.field-*` e `.whatsapp-*`.
- `config.js`: número comercial e flag de placeholder.
- `orcamento.js`: regras e eventos.
- Páginas de `servicos/`: links que pré-selecionam o serviço.

O `script.js` principal continua responsável por menu, e-mail e ano; a lógica de orçamento foi separada para não misturar responsabilidades.

## Configuração pública e Object.freeze

Estrutura de `config.js`, com o número substituído por um placeholder didático:

```js
window.DSAOL_CONFIG = Object.freeze({
  whatsapp: Object.freeze({
    number: '5500000000000',
    isPlaceholder: true
  })
});
```

Este bloco é para sua cópia de estudo. O projeto publicado possui o número comercial configurado.

`window` é o objeto global da janela. A propriedade `DSAOL_CONFIG` permite que outro script clássico leia a configuração. `Object.freeze()` impede alterações diretas nas propriedades do objeto congelado. Ele é superficial: por isso o objeto interno `whatsapp` também é congelado.

Congelar não criptografa nada nem torna a configuração secreta. Também não torna a própria propriedade `window.DSAOL_CONFIG` impossível de reatribuir. Tudo que é entregue ao navegador deve ser tratado como público.

`isPlaceholder` é uma flag, isto é, um indicador booleano. O código exige `false` explicitamente e um número válido antes de navegar. Alterar só essa flag não torna o número fictício válido.

## Map e Set no orçamento

```js
const serviceNames = new Map([
  ['sites', 'Criação de Sites'],
  ['automacao', 'Automação'],
  ['infraestrutura', 'Infraestrutura de TI'],
  ['outro', 'Outro']
]);
```

`Map` armazena pares de chave e valor. `.has('sites')` verifica a chave; `.get('sites')` recupera o nome. Isso mantém a mensagem e a validação alinhadas às mesmas opções.

`validDDDs` é um `Set`, um conjunto de valores únicos. `.has('41')` verifica se o DDD pertence ao conjunto. O Set não faz uma consulta à operadora ou a um servidor.

## Fluxo completo do envio

1. O visitante aciona o botão ou envia o formulário pelo teclado.
2. O evento `submit` é recebido e `preventDefault()` cancela o envio HTML nativo.
3. Todos os controles são validados.
4. Havendo erro, o DOM recebe mensagens e o primeiro campo inválido recebe foco.
5. O número comercial é conferido.
6. Valores são lidos e uma mensagem é montada em memória.
7. A mensagem é codificada para a URL.
8. O código solicita a abertura de `wa.me` em uma nova aba ou janela, mantendo o site aberto.
9. A pessoa ainda precisa confirmar o envio no WhatsApp.

O botão flutuante compartilha a validação do número, mas usa somente uma saudação genérica. Ele não lê os campos para montar essa saudação.

## Funções de orcamento.js

| Função | Recebe | Resultado / responsabilidade |
|---|---|---|
| `brazilianPhone(value)` | Texto de telefone | Dígitos nacionais normalizados ou `null` |
| `businessNumber()` | Lê a configuração | Número internacional configurado ou `null` |
| `validationMessage(field)` | Um controle | Mensagem de erro ou string vazia |
| `validateField(field)` | Um controle | Atualiza erro/ARIA e devolve um booleano |
| `configurationError()` | Nenhum argumento | Mostra aviso amigável e posiciona o foco |
| `openWhatsApp(number, message)` | Número e mensagem | Codifica a mensagem e inicia navegação |

A separação entre “calcular o erro” e “mostrar o erro” facilita entender a diferença entre lógica e interface.

## Validação: obrigatório, limites e formatos

```js
const value = field.value.trim();
if (field.required && !value) return 'Preencha este campo.';
```

`trim()` retira espaços das extremidades. Um texto formado só por espaços deixa de ser considerado preenchimento válido.

A validação também verifica limites, nome/sobrenome, formato de e-mail, DDD, número e descrição. O checkbox é tratado antes dos campos de texto, pois sua informação relevante é `.checked`.

`switch (field.id)` seleciona uma regra pelo campo. Os `return` encerram a função para cada caso. `field.validity.typeMismatch` consulta parte da validação nativa do navegador, combinada com a checagem do código.

Essas verificações conferem formato. Não provam que o e-mail existe, que alguém é dono do telefone, que há uma conta WhatsApp ativa ou que a pessoa informou um nome real.

A validação frontend também não serviria como proteção suficiente para um backend futuro. Um servidor que venha a receber dados precisaria validar novamente.

## Como ler as expressões regulares

Uma expressão regular descreve um padrão. `/padrão/` cria esse padrão; `.test(texto)` retorna se ele corresponde.

| Símbolo | Significado neste contexto |
|---|---|
| `^` e `$` | Início e fim do texto |
| `\d` | Dígito |
| `\D` | Caractere que não é dígito |
| `\s` | Caractere de espaço, incluindo alguns além do espaço comum |
| `[2-5]` | Um dígito entre 2 e 5 |
| `{8}` | Exatamente oito ocorrências |
| `{10,11}` | Dez ou onze ocorrências |
| `+` | Uma ou mais ocorrências |
| `|` | Alternativa |
| `(?:...)` | Grupo sem captura |
| `(\d)` e `\1` | Captura um dígito e repete o mesmo dígito |
| `g` | Aplica uma substituição a todas as correspondências |
| `u` | Modo Unicode necessário para as categorias usadas no nome |

No telefone:

```js
value.replace(/\D/g, '')
```

Remove tudo que não é dígito, depois da verificação inicial dos caracteres permitidos. O código aceita número nacional ou prefixado por `55` nas extensões previstas. `slice(2)` corta os dois primeiros caracteres para separar país ou DDD, conforme a etapa.

```js
/^(?:9\d{8}|[2-5]\d{7})$/
```

Aceita um celular começando por 9 com oito dígitos depois, ou um fixo começando de 2 a 5 com sete depois. O DDD é verificado separadamente. Outra expressão rejeita uma sequência com todos os dígitos iguais.

No nome, `\p{L}` representa letras e `\p{M}` marcas Unicode, usadas em combinações de acentos. O código permite alguns sinais comuns e exige mais de uma parte separada por espaço.

## Erros acessíveis e atualização do DOM

```js
document.querySelector(`#${field.id}-error`).textContent = message;
if (message) field.setAttribute('aria-invalid', 'true');
else field.removeAttribute('aria-invalid');
```

A convenção é simples: `quote-email` tem um parágrafo `quote-email-error`. Esse ID precisa continuar igual no HTML e no JS.

`textContent` insere texto, sem interpretar marcação HTML. `aria-invalid` informa a condição; o atributo também aciona a borda de erro no CSS. `aria-describedby` permite associar a explicação ao campo.

```js
const invalid = fields.filter((field) => !validateField(field));
```

`filter` percorre os controles e mantém os que falharam. Aqui seu callback também atualiza a interface por meio de `validateField`; portanto não é apenas uma consulta sem efeitos.

Ao corrigir um campo já inválido, o listener de `input` ou `change` revalida esse campo. O formulário não fica exibindo erros iniciais antes de uma tentativa de envio.

## Mensagem e URL

No código, um array de linhas é unido por `.join('\n')`. `\n` representa quebra de linha dentro da string. Empresa vazia usa o texto “Não informada” por meio de `||`.

```js
const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
window.open(url, '_blank', 'noopener,noreferrer');
```

`encodeURIComponent` codifica espaços, acentos, quebras e caracteres como `&` para que não sejam confundidos com a estrutura da query string. Não é criptografia.

`window.open()` solicita outro contexto de navegação. `_blank` pede uma nova aba/janela; a apresentação final depende do navegador. `noopener` impede acesso ao site de origem por `window.opener`, e `noreferrer` evita o envio do cabeçalho de referência nessa abertura.

O navegador pode bloquear a abertura. O retorno `null` não é prova de bloqueio, pois também pode ocorrer com `noopener/noreferrer`. Por isso a função mantém no feedback um link manual com `target="_blank"` e `rel="noopener noreferrer"`, sem afirmar que a conversa foi aberta ou que a mensagem foi enviada.

O link é criado com `document.createElement('a')`, recebe a URL e é inserido com `replaceChildren()`. Ao alterar um campo, o feedback é limpo e a URL com os dados anteriores sai desse elemento. O `try/catch` mantém essa alternativa disponível mesmo se o ambiente lançar erro ao tentar abrir uma janela. A confirmação do envio continua sendo feita pelo visitante no WhatsApp.

## Pré-seleção do serviço

```js
const preset = new URLSearchParams(window.location.search).get('servico');
if (serviceNames.has(preset)) service.value = preset;
```

Em `index.html?servico=sites#orcamento`, `location.search` contém `?servico=sites`, enquanto `location.hash` contém `#orcamento`.

Só chaves previstas no Map são aceitas. Parâmetros desconhecidos são ignorados. Não há necessidade de incluir nome, e-mail ou telefone nos links de pré-seleção.

## Privacidade e limites do frontend

A aplicação não persiste os dados do formulário em localStorage, cookies, sessionStorage ou logs. Isso é diferente do carrinho fictício, que salva IDs e quantidades.

Depois de uma ação explícita, os dados entram na URL do WhatsApp. O navegador, o histórico e o serviço externo passam a lidar com essa navegação. O site não oferece sigilo sobre uma URL apenas por codificá-la.

`autocomplete="off"` é uma orientação ao navegador, não uma garantia de controle sobre todos os recursos de preenchimento ou recuperação de página do dispositivo.

## Exercícios sem envio real

Faça os exercícios na cópia de estudo, com `isPlaceholder: true`:

1. Envie vazio: todos os obrigatórios devem ser indicados e o foco deve ir ao primeiro.
2. Digite uma descrição com 19 caracteres e depois com 20. Compare os resultados.
3. Informe um DDD inexistente. O campo deve continuar inválido.
4. Abra `index.html?servico=sites#orcamento` e depois troque `sites` por uma chave desconhecida.
5. Monte uma mensagem isolada em uma prévia local, como ensinado no capítulo 7. Use dados fictícios e confira acentos e quebras.
6. Explique por que ter `method="post"` no HTML não significa que há uma aplicação de servidor processando o orçamento.
