# 8 — Glossário dos termos do projeto

[Índice](README.md) · [Anterior: laboratório](07-pratica-testes-publicacao.md)

Use esta página como consulta; os capítulos anteriores mostram cada termo em funcionamento.

## Estrutura e navegação

| Termo | Definição e onde aparece |
|---|---|
| HTML | Linguagem que marca a estrutura e o conteúdo das páginas |
| Tag | Marcação como `section`, `a` ou `input` |
| Elemento | Unidade do documento representada por uma tag e seus atributos/conteúdo, quando aplicáveis |
| Atributo | Informação na tag, como `href`, `id`, `class` ou `required` |
| Semântica | Significado estrutural do elemento, como navegação ou conteúdo principal |
| Hero | Região principal de apresentação no topo da landing page |
| Landing page | Página de apresentação orientada a um objetivo, como iniciar contato |
| Card | Unidade visual que reúne informações de um serviço, produto ou projeto |
| CTA | *Call to action*: chamada para uma ação, como “Solicitar orçamento” |
| Âncora / fragmento | Referência como `#projetos` que identifica uma parte da página |
| Caminho relativo | Localização resolvida em relação à página atual |
| URL | Endereço de um recurso ou destino de navegação |
| Query string | Parte após `?`, contendo parâmetros como `servico=sites` |
| UTF-8 | Codificação de caracteres usada pelos HTMLs |
| SEO | Práticas que ajudam mecanismos de busca a interpretar conteúdo |
| Open Graph | Metadados `og:*` para interpretação de compartilhamentos |
| SVG | Formato vetorial usado nos ícones e no gráfico |
| viewBox | Sistema de coordenadas e região de referência de um SVG |

## Estilo e layout

| Termo | Definição e onde aparece |
|---|---|
| CSS | Linguagem de estilos das páginas |
| Seletor | Expressão que escolhe quais elementos uma regra estiliza |
| Classe | Identificador reutilizável do atributo `class` |
| ID | Identificador que deve ser único no documento |
| Cascata | Processo de decisão sobre quais declarações de estilo vencem |
| Especificidade | Peso de seletores comparado dentro do contexto aplicável da cascata |
| Herança | Transmissão de certas propriedades do elemento pai para filhos |
| Box model | Conteúdo, padding, borda e margem da caixa |
| Padding / margin | Espaço interno / espaço externo da caixa |
| Flexbox | Layout centrado na organização em um eixo |
| Grid | Layout com linhas e colunas |
| Gap | Espaço entre itens do layout |
| Viewport | Área de visualização usada pelo navegador |
| Breakpoint | Limite em que uma media query muda a composição |
| Responsividade | Adaptação do conteúdo e da interface a diferentes condições de tela |
| Overflow | Conteúdo que ultrapassa os limites previstos |
| Pseudoclasse | Estado/condição como `:hover` ou `:focus-visible` |
| Pseudo-elemento | Parte gerada/selecionada como `::before` ou `::marker` |
| Gradiente | Transição visual entre cores |
| Transition | Interpolação ao mudar um estado/propriedade |
| Keyframes | Estados de uma animação definida em CSS |
| Easing | Curva que controla o ritmo da transição/animação |
| Transform | Alteração visual, como translação ou rotação |
| Stacking context | Contexto em que o empilhamento dos elementos é calculado |

## Lógica e dados

| Termo | Definição e onde aparece |
|---|---|
| JavaScript | Linguagem usada para interação e atualização dos dados na interface |
| DOM | Representação dos elementos do documento em objetos |
| API | Interface de programação; o projeto usa APIs nativas do navegador |
| Variável | Nome associado a um valor ou referência |
| Estado | Dados que descrevem a situação atual, como menu aberto ou carrinho |
| Função | Bloco de instruções que pode receber dados e devolver um resultado |
| Parâmetro / argumento | Nome declarado na função / valor passado na chamada |
| Callback | Função passada para ser executada em determinado momento |
| Evento | Ocorrência observável, como clique, alteração de campo ou rolagem |
| Listener | Função registrada para atender um evento |
| Bubbling | Propagação de certos eventos dos elementos internos para ancestrais |
| Delegação de eventos | Listener no contêiner que atende ações originadas nos filhos |
| Array | Lista ordenada de valores |
| Objeto | Agrupamento de propriedades |
| Map | Coleção de pares chave/valor |
| Set | Conjunto de valores únicos |
| Desestruturação | Separação de partes de objetos/arrays em variáveis |
| Spread | Operador `...` que espalha itens/propriedades no contexto em que é usado |
| Template literal | String com crases e interpolações `${...}` |
| IIFE | Função criada e chamada imediatamente para delimitar escopo |
| Escopo | Região em que um nome pode ser acessado |
| Guard clause | Condição que encerra cedo uma função, como rejeitar nova execução em andamento |
| Renderizar | Produzir/atualizar a apresentação a partir dos dados |
| Regex | Expressão regular: padrão para conferir ou transformar texto |
| Normalização | Transformação para um formato de comparação ou processamento consistente |
| Flag | Indicador, normalmente booleano, como `isPlaceholder` |
| Placeholder de configuração | Valor de exemplo que deve permanecer inativo até a configuração real |
| Placeholder de campo | Dica visual dentro de um input; não substitui o rótulo |
| Timer | Agendamento com `setTimeout` ou `setInterval` |
| requestAnimationFrame | Agendamento alinhado a uma próxima atualização visual do navegador |
| JSON | Formato textual de dados usado para serializar o carrinho |
| Serializar | Converter dados para uma representação armazenável/transmissível |
| Persistência | Manter informação além do estado atual em memória |
| localStorage | Armazenamento textual do navegador vinculado à origem |
| Origem | Combinação de protocolo, host e porta |
| Exceção | Falha que interrompe o fluxo normal e pode ser tratada por `try/catch` |

## Acessibilidade, execução e publicação

| Termo | Definição e onde aparece |
|---|---|
| Acessibilidade | Condições para pessoas com diferentes formas de interação usarem o site |
| Foco | Elemento que recebe a interação do teclado naquele momento |
| ARIA | Atributos e papéis que comunicam semântica/estado a tecnologias assistivas |
| Leitor de tela | Tecnologia que apresenta conteúdo e controles de forma não visual |
| prefers-reduced-motion | Preferência de sistema consultada para reduzir movimento |
| Frontend | Interface e código executados no navegador neste projeto |
| Backend | Lógica de aplicação em servidor; não foi implementada aqui |
| Servidor estático | Programa que entrega HTML, CSS, JS e outros arquivos |
| localhost / loopback | Endereço para acessar serviços no próprio computador |
| HTTP | Protocolo usado na entrega dos arquivos pelo servidor de estudo |
| 404 | Resposta indicando recurso não encontrado |
| Cache | Cópia de um recurso mantida para reutilização |
| DevTools | Ferramentas de inspeção e depuração do navegador |
| Breakpoint de depuração | Ponto de pausa do JavaScript para examinar a execução |
| Git | Sistema de controle de versões |
| Repositório | Arquivos e histórico versionado de um projeto |
| Commit | Registro de uma versão no histórico Git |
| Branch | Linha de desenvolvimento representada por uma referência Git |
| Remoto | Referência a outro repositório, como `origin` |
| Push | Envio de commits ao repositório remoto |
| Deploy | Processo de disponibilizar uma versão em um ambiente de publicação |
| GitHub Pages | Hospedagem estática usada para servir o site |
| Dependência | Código/ferramenta externa necessária a um projeto; não há bibliotecas de aplicação instaladas neste site |

## Perguntas para verificar sua compreensão

1. Qual a diferença entre classe CSS, estado JavaScript e atributo ARIA no menu?
2. Por que um serviço possui uma chave como `sites` e um nome visível diferente?
3. Por que `encodeURIComponent` não é criptografia?
4. Qual a diferença entre Map em memória e o JSON salvo no localStorage?
5. Por que um push concluído não prova que o deploy do Pages terminou?
6. Qual a diferença entre o breakpoint de uma media query e o breakpoint do depurador?
7. Quais ações do projeto alteram apenas a página e qual ação pode iniciar uma navegação externa?

## Respostas comentadas

1. A classe como `is-open` escolhe o visual no CSS; o estado representa a situação lógica atual; `aria-expanded` comunica essa situação a tecnologias assistivas. No menu atual, o atributo também é lido para saber o estado antes de invertê-lo.
2. A chave é um identificador estável para links e lógica; o nome visível é o texto apresentado ao usuário. O Map conecta os dois.
3. A codificação permite transportar o texto dentro de um componente da URL. Ela é reversível e não depende de uma chave secreta.
4. O Map é uma coleção em memória usada durante a execução. JSON é um formato textual que permite salvar uma representação dessa coleção. Ao ler, o código valida os dados e reconstrói o Map.
5. Push atualiza o repositório remoto; o deploy é outro processo e pode estar pendente, falhar ou usar outra origem de publicação.
6. O breakpoint CSS é uma condição de layout. O breakpoint do depurador é uma pausa na execução de JavaScript para examinar o estado.
7. Menu, simulações, busca, carrinho e prévia de laboratório atualizam a interface local. No orçamento e no botão flutuante, uma ação explícita pode navegar para o WhatsApp; o link de e-mail também solicita um aplicativo/destino externo. Os links entre páginas e âncoras navegam dentro do próprio site.
