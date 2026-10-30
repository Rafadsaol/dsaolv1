# Identidade dSaOl e detalhes em movimento

Atualização de 30/10/2026. O site continua com HTML, CSS e JavaScript puro no frontend público, com o backend V5 existente. O objetivo desta revisão é aplicar a logo fornecida e apresentar os projetos conceituais principalmente por imagens, usando vídeos somente para pequenos detalhes de interação.

## O que mudou

- Logo dSaOl Web Studio no cabeçalho, rodapé e Sobre da página inicial; cabeçalhos das páginas de serviços e estudos de caso; telas de acesso e administração.
- Emblema **O** como favicon das 14 páginas. Os PNG transparentes foram preparados a partir da arte enviada; não são vetorização.
- Imagem principal estática e galeria em Linha Tênue e Cidade do Sabor. As imagens podem ser ampliadas em nova aba.
- Clipe de **8,24 segundos** para alternar entre frente/acabamento de uma camiseta em Linha Tênue. Resolução 342 × 578; aproximadamente 92 KiB.
- Clipe de **7,60 segundos** para mostrar a transição dos três hambúrgueres da vitrine de Cidade do Sabor. Resolução 1360 × 804; aproximadamente 1,27 MiB.
- Vídeos completos anteriores preservados nos arquivos, sem referência nas páginas e sem carregamento durante a visita.

Os clipes registram interações reais das aplicações originais. Os dois projetos são fictícios, sem cliente, vendas ou operação real. O player reproduz uma gravação: clicar em botões dentro da imagem do vídeo não opera a aplicação original.

## Como a logo funciona no HTML e CSS

O elemento `img` aponta para `assets/brand/dsaol-logo.png`. Seu `alt` identifica a marca para tecnologias assistivas. `width` e `height` informam a proporção original, enquanto o CSS define o tamanho exibido e usa `height: auto` para evitar deformação.

A classe `.studio-logo` é compartilhada pelos links da marca. `.brand-logo` dimensiona a imagem; a versão no Sobre recebe um tamanho maior. O logo continua sendo um link para o início. Em páginas duas pastas abaixo da raiz, como os estudos de caso, o caminho começa com `../../assets/`.

O arquivo `favicon.svg` é um SVG autocontido com o PNG do emblema O incorporado em uma URL `data:`. Ele não é uma vetorização do desenho. Isso permite conservar o mesmo endereço de ícone nas páginas sem depender de outro arquivo para compor sua imagem. O PNG independente está em `assets/brand/dsaol-icon.png` para reutilização. Um vetor original poderá reduzir o tamanho e melhorar a nitidez futuramente.

O parâmetro `?v=20261030-o` nos links do favicon e a versão dos estilos ajudam o navegador a buscar os arquivos atualizados após esta mudança.

## Como os clipes funcionam

Os estudos de caso compartilham [cases.css](../../projetos/cases.css) e [case-media.js](../../projetos/case-media.js). Cada um tem uma imagem principal, uma galeria e uma seção secundária **Detalhe em movimento**.

O elemento `video` usa:

- `controls`: controles nativos de reprodução, pausa e volume, acessíveis pelo teclado.
- `muted`: reprodução sem som. Estes arquivos também não possuem faixa de áudio.
- `playsinline`: permite reproduzir no próprio layout em dispositivos compatíveis.
- `loop`: repete o detalhe curto.
- `preload="none"`: evita antecipar a transferência do vídeo. O início da reprodução carrega o arquivo.
- `poster`: imagem estática real da mesma gravação, antes da reprodução.
- `source`: arquivo MP4/H.264 local.
- `track`: legenda WebVTT opcional, ativável pelos controles. A descrição textual ao lado continua disponível sem reproduzir o vídeo.

O JavaScript já existente usa `IntersectionObserver` para tentar reproduzir quando pelo menos 25% do vídeo está na tela. Ele pausa quando o vídeo sai da área visível ou a aba fica oculta. A pausa manual é preservada. `prefers-reduced-motion` desativa a reprodução automática, mantendo os controles manuais. Navegadores que bloqueiam autoplay também permitem iniciar pelos controles.

A grade `.case-motion` posiciona texto e clipe em duas colunas no desktop e uma no celular. `.case-motion-portrait` limita a largura da gravação vertical de Linha Tênue para manter o detalhe legível sem esticar a imagem.

## Integração com o backend

A única alteração do servidor nesta revisão está na lista de extensões públicas de `/assets`: agora ela aceita PNG, além de WOFF2 e SVG. A raiz do projeto não é exposta como pasta estática. `.env`, banco, migrations e arquivos internos continuam protegidos.

A configuração comercial do WhatsApp, o formulário, autenticação, permissões e banco não foram alterados. Os clipes são arquivos estáticos; as dependências das aplicações React/Next originais não foram adicionadas à dSaOl. As cópias usadas para gravar ficaram em `backend/.test-results/`, ignoradas pelo Git e não servidas pelo backend.

## Arquivos desta revisão

Modificados:

```text
index.html
style.css
favicon.svg
backend/src/app.js
backend/public/admin/index.html
backend/public/auth/login.html
backend/public/auth/register.html
backend/public/auth/forgot.html
backend/public/auth/reset.html
servicos/criacao-de-sites/index.html
servicos/automacao/index.html
servicos/infraestrutura/index.html
projetos/loja/index.html
projetos/automacao/index.html
projetos/infraestrutura/index.html
projetos/linha-tenue/index.html
projetos/cidade-do-sabor/index.html
projetos/cases.css
docs/portfolio-fontes.json
docs/portfolio-projetos-conceituais.md
docs/rebranding-dsaol-web-studio.md
docs/estudos/README.md
```

Criados:

```text
assets/brand/dsaol-logo.png
assets/brand/dsaol-icon.png
assets/brand/README.md
projetos/linha-tenue/media/acabamento.mp4
projetos/linha-tenue/media/acabamento.vtt
projetos/linha-tenue/imagens/acabamento-poster.png
projetos/cidade-do-sabor/media/troca-hamburguer.mp4
projetos/cidade-do-sabor/media/troca-hamburguer.vtt
projetos/cidade-do-sabor/imagens/troca-hamburguer-poster.png
docs/estudos/12-identidade-e-clipes.md
```

## Validação e como repetir

Nesta revisão, `npm test` no backend concluiu **19 testes com PostgreSQL real**, sem falhas ou testes ignorados. O Chromium verificou a página inicial e estudos em 360, 768 e 1440 px: imagens, ausência de rolagem horizontal, menu, retorno, ampliação, demos anteriores, WhatsApp interceptado, autoplay mudo, pausa manual, pausa fora da tela e movimento reduzido. As páginas de serviços e acesso também foram verificadas nessas larguras com a logo carregada. O favicon foi servido com sucesso. Foram conferidos referências/âncoras das 14 páginas, IDs, H1, XML do favicon e os 18 hashes de imagens/vídeos atuais e arquivados. O servidor respondeu a requisições parciais dos novos MP4 com HTTP 206.

O formulário foi preenchido com dados fictícios, e a abertura do WhatsApp foi interceptada no teste. Nenhuma mensagem real foi enviada. Não foram observados erros JavaScript, CSP ou HTTP nessa execução. Não houve publicação da aplicação nem mudança de dados comerciais.

Para conferir na sua cópia local:

1. Na raiz do repositório, atualize com `git pull --ff-only` após esta revisão estar no GitHub.
2. Mantenha o PostgreSQL do laboratório ativo. Dentro de `backend`, execute `npm.cmd start`. Se o servidor já estiver aberto, encerre-o com Ctrl+C e inicie novamente para carregar a regra de PNG.
3. Abra `http://127.0.0.1:3000` no navegador, ou a origem configurada no seu `.env`. Confira a logo no cabeçalho, Sobre e rodapé, e o O na aba. Se necessário, use Ctrl+F5.
4. Em Projetos, escolha Conhecer projeto. Confira a imagem principal, amplie uma imagem e role até Detalhe em movimento. Pause e retome o clipe pelos controles.
5. Em Linha Tênue, confira a alternância da fotografia da peça. Em Cidade do Sabor, confira os três hambúrgueres e suas transições.
6. Teste o menu em uma tela estreita, retorne ao portfólio e confira o formulário. Não conclua o envio no WhatsApp se estiver apenas estudando.
7. Ative a preferência por movimento reduzido no sistema ou nas ferramentas do navegador e recarregue o estudo: o clipe deve aguardar reprodução manual.

Não foram testados Safari, Firefox, dispositivos físicos ou o cache da instalação local da pessoa usuária. A tela administrativa recebeu apenas a troca visual de marca; seus testes funcionais existentes passaram, mas não houve nova inspeção visual autenticada do painel nesta revisão. As aplicações conceituais continuam sem link público interativo; o link do GitHub leva ao código.
