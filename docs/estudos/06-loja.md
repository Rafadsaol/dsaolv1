# 6 — Loja: catálogo, busca e carrinho

[Índice](README.md) · [Anterior: simulações](05-dashboard-automacao.md) · [Próximo: laboratório](07-pratica-testes-publicacao.md)

## Responsabilidade dos arquivos

`projetos/loja/index.html` contém busca, categorias, contêiner de produtos, carrinho, mensagens e totais. O catálogo é preenchido pelo JS, não copiado seis vezes no HTML.

`projetos/loja/script.js` contém os dados e os comportamentos. `projetos/demo.css` contém `.shop-layout`, `.shop-filters`, `.product-grid`, `.product-card`, `.cart-panel`, `.quantity-controls` e os ajustes de tamanho.

O carrinho é um exercício de estado e interface. Não há estoque real, pedido, frete calculado, pagamento ou coleta de dados pessoais.

## Catálogo fixo e índice por ID

Exemplo do projeto:

```js
{ id: 'teclado', name: 'Teclado Orbit', category: 'perifericos', price: 24990,
  art: 'keyboard', symbol: '▤', detail: 'Teclado compacto · produto fictício' }
```

Cada propriedade tem uma função: ID estável, nome visível, chave de categoria, preço em centavos, classe da ilustração, símbolo e descrição.

```js
const catalog = new Map(products.map((product) => [product.id, product]));
```

O array mantém a lista para renderizar. O Map oferece consulta pelo identificador: `catalog.get('teclado')`. O carrinho não precisa duplicar preço ou descrição; ele mantém somente ID e quantidade.

## Dinheiro em centavos

JavaScript usa números de ponto flutuante para os cálculos comuns. Certas frações decimais não possuem representação exata nesse formato. Usar centavos inteiros mantém exatas as somas e multiplicações deste catálogo, dentro dos limites seguros de inteiros.

```js
subtotal += product.price * quantity;
```

Exemplo: duas unidades do teclado e uma do mouse:

```text
24990 × 2 + 12990 × 1 = 62970 centavos
62970 ÷ 100 = 629,70 reais
```

```js
const formatMoney = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL'
});
```

`Intl.NumberFormat` formata a apresentação; não calcula o total. `.format(subtotal / 100)` converte para reais apenas na apresentação. Não some strings como `'R$ 249,90'`.

O total atual é igual ao subtotal porque a demo não cobra frete nem aplica impostos/descontos adicionais.

## O carrinho é um Map

Um estado ilustrativo em memória:

```js
new Map([['teclado', 2], ['mouse', 1]])
```

| Operação | Papel |
|---|---|
| `cart.get(id)` | Ler a quantidade |
| `cart.set(id, quantidade)` | Adicionar/atualizar |
| `cart.delete(id)` | Remover um produto |
| `cart.size` | Quantidade de produtos distintos |
| `[...cart]` | Transformar os pares em um array |

`cart.size` não é a quantidade total de unidades. Por isso `renderCart()` soma separadamente `count += quantity`.

## Persistência e serialização

Persistir significa manter uma informação além do estado atual em memória. O navegador oferece `localStorage`, uma API de chave e valor textual, vinculada à origem do site.

O código converte o Map para um array de objetos e depois para JSON:

```js
JSON.stringify([...cart].map(([id, quantity]) => ({ id, quantity })))
```

Exemplo didático de conteúdo salvo:

```json
[{"id":"teclado","quantity":2},{"id":"mouse","quantity":1}]
```

`JSON.stringify` transforma valores compatíveis em texto JSON. `JSON.parse` faz o caminho inverso; não usa `eval` e não executa o texto como JavaScript. Parsear não valida se o resultado tem a estrutura esperada.

A chave usada é `dsaol-demo-cart-v1`. Ela não representa um banco de dados de vendas e não é compartilhada automaticamente entre dispositivos.

`http://localhost:8000` e `http://127.0.0.1:8000` são origens diferentes, assim como portas ou protocolos diferentes. Um carrinho parecer vazio após trocar o endereço não significa necessariamente que a leitura falhou.

## readCart: nunca presumir que dados salvos são válidos

O código confere:

1. Se existe valor salvo.
2. Se o JSON pode ser interpretado.
3. Se o resultado é um array com tamanho compatível com o catálogo.
4. Se cada ID pertence ao catálogo atual.
5. Se a quantidade é inteira e está entre 1 e 99.
6. Se não há ID duplicado entre os itens já aceitos.

Entradas inválidas são ignoradas com aviso. Um formato geral inválido ou uma falha na leitura faz a demo usar um carrinho vazio. O resultado aceito fica em um novo Map.

`try/catch` captura uma exceção e permite uma alternativa. O armazenamento pode estar bloqueado ou sem espaço. Em `saveCart()`, uma falha gera aviso, mas o Map continua funcionando em memória.

O preço não é recuperado do armazenamento: vem do catálogo fixo. Isso evita confiar em um valor de preço adulterado, mas não equivale à segurança de um comércio eletrônico real, que precisaria de servidor e regras adicionais.

## Busca e categoria

```js
value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
```

`normalize('NFD')` decompõe certos caracteres em letra e marca combinante. A substituição remove marcas naquela faixa Unicode e `toLowerCase` ignora diferença entre maiúsculas e minúsculas. Isso torna a busca mais tolerante a acentos nos termos tratados; não é uma normalização linguística universal.

A lista visível deve satisfazer duas condições:

```js
(category.value === 'all' || product.category === category.value)
  && normalize(product.name).includes(query)
```

`includes` verifica se o texto contém o termo. Uma busca vazia corresponde a todos os nomes; a categoria ainda pode restringir o resultado. O filtro procura no nome, não em todos os campos do produto.

`renderProducts()` substitui a grade pelos produtos visíveis e atualiza a contagem e o aviso de lista vazia.

## innerHTML e a origem dos dados

A loja usa `innerHTML` para gerar cards e linhas. Esse método interpreta a string como marcação HTML. Neste código, os nomes, descrições e IDs vêm do catálogo fixo; o armazenamento só pode recuperar IDs conhecidos e quantidades verificadas.

O texto digitado na busca não é inserido como HTML. Essa diferença é essencial. Se no futuro nomes de produtos vierem de um usuário ou serviço externo, não copie esse padrão sem tratar essa nova origem. Para texto arbitrário, prefira criar elementos e preencher `textContent`.

## Delegação de eventos

```js
productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  // Identifica o produto por button.dataset.add.
});
```

Em vez de um listener em cada botão, um listener no contêiner recebe os cliques que propagam a partir dos filhos. Isso se chama delegação de eventos e funciona mesmo depois de `innerHTML` recriar os botões.

`closest` também permite clicar em um ícone dentro do botão. `data-add="teclado"` vira `button.dataset.add === 'teclado'`.

## Renderização do carrinho

`renderCart()` percorre os pares, acumula subtotal/unidades e gera os elementos. Depois atualiza vazio, contagem, total e disponibilidade do checkout.

`updateCart(message)` padroniza a sequência:

```text
salvar tentativa → renderizar estado atual → mostrar feedback
```

O `input` de quantidade tem `type="number"`, `min`, `max` e `step`. Mesmo assim o evento `change` verifica `Number.isInteger` e o intervalo. Campo vazio, fração ou zero não devem atualizar o Map.

Os botões de mais/menos usam `Math.max` e `Math.min` para limitar de 1 a 99. Remover é uma ação separada, então diminuir 1 não apaga silenciosamente o produto.

## Preservar o foco ao renderizar

Substituir `innerHTML` remove os controles antigos, inclusive o que estava com foco. Antes de renderizar, o código guarda `document.activeElement?.dataset.focus`. Depois procura o controle novo com a mesma chave.

Se o controle foi removido ou ficou desabilitado, o foco vai para o título do carrinho. Esse título possui `tabindex="-1"`. Assim o usuário de teclado não fica perdido após remover um produto.

## Checkout demonstrativo

O botão fica desabilitado quando não há produtos. Quando acionado, apenas atualiza a mensagem na própria página. Nenhum pedido é criado e nenhum pagamento é processado.

## Exercícios

1. Acrescente um produto fictício na cópia com ID único e categoria existente. Ele deve aparecer sem duplicar manualmente o HTML.
2. Calcule no papel um carrinho e compare o total na página.
3. Aplique busca e categoria ao mesmo tempo. Explique por que as condições usam `&&`.
4. Aumente a quantidade até 99. Verifique o botão de mais e a tentativa de adicionar pelo catálogo.
5. No painel Application/Storage da sua cópia, altere **somente a chave da demo** para um JSON inválido. Recarregue e confira o aviso. Não limpe dados de outros sites.
6. Remova um produto usando apenas teclado e observe para onde o foco vai.
7. Recarregue em `localhost` e depois em `127.0.0.1`. Explique por que os carrinhos podem ser diferentes.
