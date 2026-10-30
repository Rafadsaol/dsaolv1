# Guia de estudos — dSaOl IT

Este material explica o frontend das versões V3/V4 e o backend da V5, do HTML inicial ao carrinho da loja, formulário de orçamento, autenticação e banco de dados. Ele foi pensado para você ler uma parte, abrir o arquivo correspondente e reconstruir o comportamento em uma cópia de estudo.

Não é preciso decorar todos os comandos. O objetivo é conseguir responder: **qual elemento estou alterando, qual dado está mudando e qual ação provoca essa mudança?**

Os trechos identificados como “do projeto” correspondem ao código existente. Exemplos identificados como “didáticos” simplificam uma ideia e não devem substituir arquivos inteiros do site.

## Ordem sugerida

| Leitura | O que você vai aprender |
|---|---|
| [1. HTML e páginas](01-html.md) | Tags, atributos, semântica, caminhos, formulários e SEO |
| [2. CSS e identidade visual](02-css.md) | Seletores, cascata, cores, espaçamento, Grid, Flexbox, responsividade e animações |
| [3. JavaScript e navegação](03-javascript.md) | Variáveis, funções, DOM, eventos, menu mobile e seção ativa |
| [4. Orçamento e WhatsApp](04-orcamento-whatsapp.md) | Configuração, validação, expressões regulares, URL e privacidade |
| [5. Dashboard e automação](05-dashboard-automacao.md) | Simulação, timers, SVG, estados e cancelamento |
| [6. Loja e carrinho](06-loja.md) | Catálogo, busca, eventos delegados, dinheiro e localStorage |
| [7. Laboratório e publicação](07-pratica-testes-publicacao.md) | Preparar outro ambiente, exercícios graduais, depuração e GitHub Pages |
| [8. Glossário](08-glossario.md) | Consulta rápida de termos e símbolos usados no código |
| [9. Backend V5](09-backend-v5.md) | Terminal, Docker, Node.js, Express, Prisma, PostgreSQL, API, autenticação e segurança |
| [10. Testes manuais V5](10-testes-manuais-v5.md) | Resultados confirmados no Windows, roteiros para repetir os testes, evidências e pendências |
| [11. Link temporário](11-link-temporario.md) | Compartilhar o laboratório pelo cloudflared, configurar origem HTTPS e encerrar o acesso |
| [12. Identidade e clipes](12-identidade-e-clipes.md) | Aplicar a logo, entender o favicon O e apresentar projetos com imagens e clipes curtos |
| [13. Preparação da publicação](13-preparacao-publicacao.md) | Molduras de celular, conferência das páginas e decisões para hospedagem estática ou Full Stack |
| [14. Cloudflare, domínio e contato](14-cloudflare-dominio-contato.md) | Preparar o site público para hospedagem gratuita, configurar dsaol.com.br e entender o empacotador seguro |

## As três camadas do site

- **HTML:** diz o que existe na página e a função de cada parte.
- **CSS:** determina apresentação, posicionamento e adaptação à tela.
- **JavaScript:** reage às ações e atualiza dados ou elementos.

Exemplo do fluxo do menu: o HTML fornece um botão e uma lista; o JavaScript altera `aria-expanded` e uma classe; o CSS usa essa classe para exibir a lista.

## Mapa de todos os arquivos da aplicação

Os caminhos abaixo são relativos à raiz do projeto. Embora existam vários arquivos chamados `script.js`, cada um atende a uma página diferente.

| Arquivo | Responsabilidade | Onde estudar |
|---|---|---|
| [index.html](../../index.html) | Landing page, navegação, serviços, projetos, sobre, orçamento, contato e rodapé | Capítulos 1 e 4 |
| [style.css](../../style.css) | Tema principal, componentes compartilhados, layout e formulário | Capítulo 2 |
| [script.js](../../script.js) | E-mail configurável, ano, menu mobile e indicação da seção ativa | Capítulo 3 |
| [config.js](../../config.js) | Número comercial público e flag de placeholder | Capítulo 4 |
| [orcamento.js](../../orcamento.js) | Validação, pré-seleção de serviço e preparação do contato | Capítulo 4 |
| [servicos/servicos.css](../../servicos/servicos.css) | Layout compartilhado das páginas de serviços | Capítulos 1 e 2 |
| [servicos/criacao-de-sites/index.html](../../servicos/criacao-de-sites/index.html) | Conteúdo do serviço e CTA com `servico=sites` | Capítulos 1 e 4 |
| [servicos/automacao/index.html](../../servicos/automacao/index.html) | Conteúdo do serviço e CTA com `servico=automacao` | Capítulos 1 e 4 |
| [servicos/infraestrutura/index.html](../../servicos/infraestrutura/index.html) | Conteúdo do serviço e CTA com `servico=infraestrutura` | Capítulos 1 e 4 |
| [projetos/demo.css](../../projetos/demo.css) | Componentes das três demonstrações: painéis, métricas, fluxo, produtos e carrinho | Capítulos 2, 5 e 6 |
| [projetos/infraestrutura/index.html](../../projetos/infraestrutura/index.html) | Indicadores, gráfico SVG e servidores fictícios | Capítulo 5 |
| [projetos/infraestrutura/script.js](../../projetos/infraestrutura/script.js) | Geração de dados e iniciar/pausar | Capítulo 5 |
| [projetos/automacao/index.html](../../projetos/automacao/index.html) | Lista de etapas, botões e área de log | Capítulo 5 |
| [projetos/automacao/script.js](../../projetos/automacao/script.js) | Sequência das etapas e controle dos timers | Capítulo 5 |
| [projetos/loja/index.html](../../projetos/loja/index.html) | Filtros, contêiner do catálogo e estrutura do carrinho | Capítulo 6 |
| [projetos/loja/script.js](../../projetos/loja/script.js) | Produtos, busca, quantidades, total e persistência | Capítulo 6 |
| [README.md da raiz](../../README.md) | Instruções operacionais: executar, configurar e testar | Capítulo 7 |

Os arquivos dentro de `docs/estudos/` são documentação em Markdown. Não são carregados pelo JavaScript do site.

## Como a aplicação é carregada

1. O navegador lê o HTML solicitado.
2. Os elementos `<link>` pedem os arquivos CSS.
3. Os scripts com `defer` são baixados enquanto o HTML é processado e executados, em ordem, depois que o HTML foi analisado.
4. O JavaScript procura elementos já existentes no DOM e registra os eventos.
5. As ações do visitante executam as funções registradas.

Na landing page, a ordem é `script.js`, `config.js` e `orcamento.js`. O orçamento precisa da configuração antes de atender um clique. Nas demos, o `script.js` carregado é o da própria pasta. As páginas de serviços são estáticas e não precisam carregar esses scripts.

## Escopo do frontend estático V3/V4

As versões estáticas V3/V4 não usam framework, processo de build, instalação por npm, backend, autenticação ou banco de dados. O servidor Python usado nos exemplos apenas entrega arquivos por HTTP; ele não processa os orçamentos. A V5 acrescenta backend e banco conforme o capítulo 9.

As demonstrações são fictícias. O formulário prepara uma navegação para o WhatsApp após uma ação do usuário. O envio final é confirmado no próprio WhatsApp.

## Como usar o material

Leia um capítulo, abra o arquivo indicado e localize os seletores ou funções mencionados. Altere uma coisa por vez na sua cópia: primeiro escreva o resultado esperado, depois teste e compare. Os capítulos terminam com exercícios e resultados observáveis.

Comece pelo [laboratório em outro ambiente](07-pratica-testes-publicacao.md) se ainda não tiver uma cópia local preparada.

Você pode ler os capítulos diretamente no GitHub ou no VS Code. No editor, abra um `.md` e use **Open Preview** (normalmente Ctrl+Shift+V; no macOS, Cmd+Shift+V) para visualizar a formatação.

A evolução Full Stack V5 está explicada no [capítulo 9](09-backend-v5.md). O [README do backend](../../backend/README.md) contém instalação, comandos, painel e estado dos testes. Os capítulos 1 a 8 permanecem como estudo do frontend estático e devem ser lidos nesse contexto.

Os testes confirmados pela pessoa usuária no Windows e os casos ainda pendentes estão registrados no [capítulo 10](10-testes-manuais-v5.md), com passos, resultados esperados e distinção entre validação manual e automatizada.

O [capítulo 11](11-link-temporario.md) inclui o registro de funcionamento do link temporário em 26/10/2026, os problemas encontrados e como encerrar e retomar os testes sem recriar o banco.

O [capítulo 15](15-demonstracoes-online.md) reúne a configuração dos projetos de demonstração na Cloudflare Pages, subdomínios planejados e verificações realizadas.
