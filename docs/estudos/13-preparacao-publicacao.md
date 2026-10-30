# Celular no portfólio e preparação para publicação

Registro de 30/10/2026. Esta etapa ajusta a apresentação das capturas móveis e inicia a preparação da publicação permanente. Não houve deploy, mudança de autenticação, alteração de banco ou instalação de dependências.

## A captura dentro de um celular

As duas capturas móveis de Cidade do Sabor compartilham quatro componentes em `projetos/cases.css`:

- `.case-phone-stage`: organiza o fundo e centraliza o aparelho no card.
- `.case-phone`: desenha a moldura por bordas, cantos arredondados e sombras. Os pseudo-elementos `::before` e `::after` representam a câmera e a barra inferior. São elementos decorativos e não interceptam cliques.
- `.case-phone-screen`: define a proporção da tela com `aspect-ratio` e mantém a rolagem vertical interna com `overflow-y: auto`.
- `.mobile-capture`: conserva o link da imagem original. A imagem usa largura de 100% e altura automática; não foi editada.

A tela rolável tem `tabindex="0"`, `role="region"` e um nome acessível. Isso permite alcançar a captura pelo teclado, rolar com as teclas e identificar o que está sendo explorado. Há foco visível, e o link interno continua abrindo a imagem em nova aba. A moldura é uma apresentação de uma captura; não transforma a imagem em uma aplicação interativa.

## Conferência para publicar

Na raiz do projeto:

```powershell
node scripts/verificar-publicacao.mjs
```

O script usa apenas módulos nativos do Node: `fs/promises` para ler arquivos, `url` para encontrar a raiz e `path` para resolver referências. `new URL()` permite tratar caminhos relativos, fragmentos e parâmetros sem confundir a versão do CSS com o nome do arquivo.

Ele lê somente arquivos de código públicos e os destinos das referências. Não lê `.env`, não imprime segredos, não consulta o banco e não testa URLs externas. Confere:

1. Título e meta description presentes e únicos nas nove páginas públicas.
2. Um H1 por página e IDs sem duplicação.
3. Texto alternativo nas imagens.
4. Existência de arquivos locais e âncoras de navegação.
5. Número comercial e flag pública de placeholder do WhatsApp.

Erros fazem o comando terminar com código 1. Pendências de publicação são exibidas como avisos. O modo abaixo também termina com código 1 se houver pendências:

```powershell
node scripts/verificar-publicacao.mjs --estrito
```

Neste estágio o modo estrito deve reprovar: domínio, hospedagem e e-mail comercial ainda não foram confirmados. Depois das decisões e da configuração real, atualizar os avisos correspondentes do verificador. A conferência estática não certifica que a hospedagem funciona, que um e-mail foi entregue ou que o WhatsApp enviou uma mensagem.

## Resultados desta etapa

- Chromium em 360, 768 e 1440 px: duas molduras sem rolagem horizontal; imagens carregadas; rolagem interna por End/Home; ampliação por Enter em nova aba; nenhum erro JavaScript observado.
- Capturas das molduras inspecionadas no Chromium. Os arquivos originais de imagem foram preservados.
- Regressão do site no Chromium em 360, 768 e 1440 px: página inicial, estudos, logo e telas de acesso; menu, ampliação de imagens, retorno, demos anteriores, clipes/Range HTTP 206, movimento reduzido e formulário WhatsApp com abertura interceptada. Sem erros JavaScript, CSP ou HTTP observados; nenhuma mensagem real enviada.
- Verificador: nove páginas públicas e 162 referências locais aprovadas; pendências exibidas separadamente.
- `node --check scripts/verificar-publicacao.mjs` e `git diff --check` aprovados.

O banco e a autenticação não foram modificados; os 19 testes completos do backend aprovados na revisão anterior continuam como evidência daquela revisão, não como uma nova execução nesta etapa. Testes em Safari, Firefox, celular físico, domínio público, SMTP e hospedagem continuam pendentes.

## Como repetir no navegador

Atualize a cópia do Git pelo procedimento habitual. Com o backend local já configurado, execute `npm.cmd start` dentro de `backend`, abra o site e vá a Projetos → Cidade do Sabor. Role até Vitrine no celular e Exploração mobile. Confira a moldura, a rolagem dentro da tela e a ampliação da imagem. Tab deve alcançar a tela rolável e depois o link da imagem; Enter no link abre a captura original. Ctrl+F5 ajuda caso a versão antiga do CSS esteja no cache.

## Próxima decisão

O [roteiro de publicação](../publicacao.md) separa dois caminhos: portfólio estático com WhatsApp ou aplicação completa com backend e painel. É preciso confirmar o caminho, o domínio/hospedagem e o e-mail real antes de configurar a publicação. Nada foi contratado, exposto publicamente ou removido.

## Refinamento posterior da moldura

A versão atual usa `.case-phone-display` com uma grade de três linhas: câmera, área rolável e indicador inferior. `minmax(0, 1fr)` permite que a área central ocupe o espaço restante sem aumentar o aparelho até a altura completa da imagem. `.case-phone-screen` mantém `min-height: 0` e rolagem nativa.

A moldura possui uma borda fina e máximo de 326 px. Os pseudo-elementos do corpo agora representam os botões laterais; câmera e barra inferior pertencem a elementos decorativos próprios, com `aria-hidden="true"`. Eles não sobrepõem a captura. O seletor `:has(:focus-visible)` indica o foco de teclado no contorno externo; a regra de foco da região permanece como alternativa para navegadores sem suporte.

A captura anterior do cardápio havia sido recortada sem as margens da página. Uma nova captura real no Chromium, `favoritos-mobile-contexto.png`, inclui essas margens e conserva o arquivo anterior. Isso melhora o espaçamento sem precisar reduzir artificialmente a imagem dentro de uma borda larga. A origem e o hash estão em `docs/portfolio-fontes.json`.

A apresentação e o pacote estático foram novamente conferidos no Chromium em 360, 768 e 1440 px. Veja os detalhes atualizados no [guia de publicação](../publicacao.md).
