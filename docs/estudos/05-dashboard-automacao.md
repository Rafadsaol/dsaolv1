# 5 — Dashboard e automação: dados, tempo e estados

[Índice](README.md) · [Anterior: orçamento](04-orcamento-whatsapp.md) · [Próximo: loja](06-loja.md)

## Os arquivos compartilhados

As duas demos carregam `../../style.css` e `../demo.css`. O primeiro fornece o tema e os botões; o segundo fornece os componentes das demonstrações.

Em `projetos/demo.css`:

- `.panel` forma as caixas de conteúdo.
- `.metrics` organiza os quatro indicadores.
- `.dashboard-grid` separa gráfico e servidores.
- `.chart-line` define o traçado do gráfico.
- `.workflow` organiza as etapas da automação.
- `.workflow-step[data-state="active"]` destaca a etapa atual.
- `.execution-log` apresenta os registros.

Os dados são fictícios e produzidos no navegador. CPU e RAM não medem seu computador, e os nomes de servidores não correspondem a máquinas monitoradas.

## Dashboard: o HTML

Arquivo: `projetos/infraestrutura/index.html`.

Cada indicador é um `article` com título, texto e `meter`. `meter` representa uma medida dentro de limites, como 32 em um máximo de 100. Não é um botão e não faz uma medição por conta própria.

Exemplo reduzido do projeto:

```html
<span id="cpu-value">32</span>
<meter id="cpu-meter" min="0" max="100" value="32" aria-label="Uso de CPU">32%</meter>
```

O JS atualiza o texto do `span`, a propriedade `.value` do medidor e seu conteúdo textual. Os IDs fazem a conexão entre dados e elementos.

O gráfico é SVG e tem `title`/`desc` ligados por `aria-labelledby`. Esses textos ajudam a interpretar o gráfico sem depender apenas do desenho.

## Dashboard: estado em memória

Arquivo: `projetos/infraestrutura/script.js`.

```js
const metrics = { cpu: 32, ram: 48, storage: 61, network: 120 };
const history = Array(20).fill(metrics.cpu);
let timer = null;
```

`metrics` agrupa os valores atuais. `history` é uma lista de 20 amostras, inicialmente iguais. Aqui `fill` repete um número; preencher com um objeto teria o detalhe adicional de repetir referências ao mesmo objeto.

`timer` guarda o identificador do intervalo. `null` significa que não há uma simulação ativa controlada por esse identificador.

## A função fluctuate

```js
function fluctuate(value, range, max = 100) {
  return Math.max(0, Math.min(max,
    value + Math.round((Math.random() - 0.5) * range)
  ));
}
```

- `Math.random()` produz um número pseudoaleatório de 0, inclusive, até 1, exclusive.
- Subtrair `0.5` permite variação positiva e negativa.
- Multiplicar por `range` controla a amplitude total aproximada da variação.
- `Math.round` arredonda para um inteiro.
- `Math.min(max, ...)` limita o teto.
- `Math.max(0, ...)` impede números negativos.
- `max = 100` é um parâmetro padrão, usado quando não é passado outro máximo.

A rede passa `500` como máximo. Os indicadores percentuais usam 100. Esse tipo de geração serve para simulação; não é um gerador de números para segurança ou criptografia.

## Atualização dos elementos

```js
Object.entries(metrics).forEach(([name, value]) => {
  document.querySelector(`#${name}-value`).textContent = value;
});
```

`Object.entries` transforma as propriedades em pares, como `['cpu', 32]`. `[name, value]` usa desestruturação para separar cada par. O template literal monta um seletor como `#cpu-value`.

A mesma convenção conecta CPU, RAM, armazenamento e rede. Alterar a chave `cpu` sem mudar os IDs quebraria a correspondência.

## Histórico e coordenadas do SVG

```js
history.push(metrics.cpu);
history.shift();
```

Uma amostra entra no final e a mais antiga sai do início. Assim, a quantidade permanece em 20.

O SVG tem `viewBox="0 0 600 220"`. O JS monta os pontos:

```js
`${10 + index * (580 / (history.length - 1))},${210 - value * 2}`
```

- X começa em 10 e termina em 590: são 580 unidades úteis.
- Vinte pontos possuem 19 intervalos entre si; por isso a divisão por `history.length - 1`.
- Y cresce para baixo em SVG. Para um valor maior subir visualmente, fazemos uma subtração.
- `value = 0` resulta em Y = 210; `value = 100`, em Y = 10.

`map` produz os pares X,Y; `join(' ')` cria a string do atributo `points` de `polyline`. Não é preciso redesenhar todos os elementos da página.

`Math.min(...history)` e `Math.max(...history)` espalham as amostras como argumentos para calcular os extremos, usados na descrição textual.

## Iniciar, pausar e sair da página

`setInterval(updateMetrics, 1600)` solicita chamadas repetidas a cada 1.600 ms. O código faz uma atualização imediata antes de registrar o intervalo.

`clearInterval(timer)` cancela as próximas chamadas daquele intervalo. `pause()` também redefine o texto do botão, `aria-pressed` e a mensagem de estado.

Se o timer já existe, o clique pausa; caso contrário, inicia. Assim não são criados intervalos paralelos a cada clique. O evento `pagehide` pausa ao sair da página, inclusive em cenários relacionados ao cache de navegação.

Temporizadores não garantem um relógio exato: outras tarefas e limitações de abas em segundo plano podem atrasar as chamadas.

## Automação: o HTML

Arquivo: `projetos/automacao/index.html`.

O fluxo é uma lista ordenada com quatro etapas. Cada `li` usa um atributo `data-state` com `pending`, `active` ou `complete`. O CSS lê esse atributo para definir o destaque, e o texto “Aguardando”, “Em execução” ou “Concluída” comunica o estado sem depender só da cor.

`aria-current="step"` marca temporariamente a etapa atual. A área `role="log"` recebe os registros, enquanto `role="status"` descreve o andamento geral.

## Automação: estado e máquina de estados

Arquivo: `projetos/automacao/script.js`.

```js
let timer = null;
let running = false;
let currentStep = 0;
```

Uma máquina de estados é uma forma de representar situações possíveis e suas transições. Aqui não há uma biblioteca; há variáveis e condições.

| Situação | `running` | Interface |
|---|---|---|
| Antes de iniciar | `false` | Etapas aguardando; botão habilitado |
| Durante execução | `true` | Uma etapa ativa; botão de executar desabilitado |
| Após concluir | `false` | Quatro etapas concluídas; executar novamente habilitado |
| Após reiniciar | `false` | Timer cancelado, índice zero, etapas e log limpos |

`currentStep` é um índice: começa em 0, mas a interface exibe `currentStep + 1` para numerar de 1 a 4.

## O papel de cada função

| Função | Explicação |
|---|---|
| `appendLog(message)` | Cria um `li`, um `time` e um `span`; inclui um registro no log |
| `clearExecution()` | Cancela timeout, reinicia variáveis, limpa log e restaura estados visuais |
| `advance()` | Ativa uma etapa e agenda sua conclusão; prossegue até o fim |

No log, `new Date().toISOString()` cria a data/hora padronizada para o atributo `datetime`; `toLocaleTimeString('pt-BR')` cria o horário visível. O valor de data vem do relógio do dispositivo.

`document.createElement`, `textContent` e `append` constroem os elementos sem interpretar a mensagem como HTML. `replaceChildren()` sem argumentos remove os filhos da área de log.

## setTimeout e sequência

```js
timer = window.setTimeout(() => {
  // Conclui a etapa atual e, se necessário, chama advance().
}, 1000);
```

Diferentemente de `setInterval`, `setTimeout` agenda uma única chamada. Cada etapa agenda a próxima somente quando termina. Há uma nova chamada de `advance`, mas não uma recursão síncrona profunda: a passagem acontece por callbacks em tarefas posteriores.

Ao iniciar, `if (running) return` rejeita uma nova execução. Desabilitar o botão melhora a interface, mas o guard na lógica mantém a regra explícita.

Ao reiniciar, `clearTimeout(timer)` cancela a etapa pendente. Só limpar o HTML deixaria um callback antigo capaz de voltar a preencher o log. O identificador precisa representar o timeout atualmente pendente.

## Exercícios

1. Troque o intervalo do dashboard, na cópia, de 1.600 para 3.000 ms. Ele deve atualizar mais devagar e continuar pausando.
2. Calcule no papel as coordenadas Y de CPU em 0%, 25%, 50% e 100%.
3. Aumente o histórico para 30 amostras e explique o papel do número de intervalos na fórmula de X.
4. Reinicie a automação durante a segunda etapa. Espere mais que um segundo: nenhum log antigo deve reaparecer.
5. Mude o texto de uma etapa sem mudar seu seletor. O andamento deve usar o novo título do `h3`.
6. Antes de tentar adicionar uma quinta etapa, identifique todos os dados relacionados: HTML, mensagens, duração e contagem. Essa prática ajuda a evitar listas fora de sincronia.
