# Linha Tênue e Cidade do Sabor no portfólio dSaOl

Integração de materiais dos repositórios fornecidos pela pessoa usuária. Ambos foram confirmados como **projetos conceituais de portfólio, sem clientes reais**. A pessoa usuária também confirmou que ainda não existem URLs públicas para testar as aplicações interativas.

## O que foi integrado

- Cards na página inicial com imagens existentes, descrição, tecnologias e botões **Conhecer projeto** e **Ver código no GitHub**.
- Estudos de caso locais em `projetos/linha-tenue/index.html` e `projetos/cidade-do-sabor/index.html`.
- Galerias com 14 capturas originais, copiadas sem edição dos repositórios. Os dados nas imagens são demonstrativos. As capturas podem ser ampliadas em nova aba.
- Dois vídeos gravados das aplicações originais em execução no Chromium: Linha Tênue com aproximadamente 31 segundos e Cidade do Sabor com aproximadamente 28 segundos. São arquivos MP4/H.264 de 1280 × 800, sem áudio, com menos de 0,5 MiB cada.
- Legendas WebVTT e roteiro textual acessível para acompanhar as etapas.
- Reprodução automática sem som quando pelo menos 25% do vídeo está visível. O vídeo pausa fora da tela ou quando a aba fica oculta. A pausa manual é preservada; quem prefere movimento reduzido recebe reprodução manual.
- Controles nativos, download e poster. `preload="none"` evita antecipar o carregamento; a reprodução automática, quando permitida, inicia o carregamento ao entrar na área visível. Se autoplay for bloqueado, os controles continuam disponíveis.

O site principal continua usando HTML, CSS e JavaScript. Nenhuma dependência React, Vite ou Next foi acrescentada ao seu manifesto. Para gravar, as dependências e os builds dos projetos originais ficaram em cópias isoladas, dentro de `backend/.test-results/portfolio-sources/`, ignoradas pelo Git e não servidas pelo backend. Os repositórios originais não receberam alterações ou push.

## Fontes verificadas

| Projeto | Repositório | Commit analisado |
|---|---|---|
| Linha Tênue | https://github.com/Rafadsaol/linhatenuev1 | `7195ed57368d15d2a1d64293feca4a1c2ba70326` |
| Cidade do Sabor | https://github.com/Rafadsaol/cidadedosaborv1 | `5f1bd0366b59c5f2cce195578a304edfa3a53335` |

O arquivo [portfolio-fontes.json](portfolio-fontes.json) registra as origens e SHA-256 das 14 capturas, além de duração, resolução, etapas e SHA-256 dos vídeos. Os hashes permitem identificar os materiais usados nesta versão; mudanças futuras nos repositórios não atualizam estas cópias automaticamente.

### Linha Tênue

O manifesto, o código e a documentação confirmam React 19, Vite 6, JavaScript, CSS, Lucide React, Fontsource e armazenamento local. O estudo original está em `src/pages/CaseStudy.jsx`; as capturas estão em `public/images/case-study/`.

O vídeo percorre vitrine, busca no catálogo, detalhe do produto, tamanho, sacola, revisão do checkout, entrega fictícia, pagamento demonstrativo, simulação de pedido e painel LT Axis. Não há cobrança nem dados financeiros; o perfil administrativo é fictício, sem autenticação real. O catálogo e os pedidos pertencem ao navegador. A API de campanha do servidor de desenvolvimento/preview é demonstrativa, não um backend comercial.

### Cidade do Sabor

O manifesto, o código e a documentação confirmam Next.js App Router, React, TypeScript, Tailwind CSS 4, CSS Modules, Lucide React, Fontsource e armazenamento local. O estudo original está em `app/case-study/page.tsx`; as capturas estão em `public/images/case-study/`.

O vídeo percorre vitrine, busca, personalização de produto, carrinho, checkout com dados fictícios e retirada, escolha visual de pagamento, simulação do pedido e perfil Administrador Demo. Nenhum pedido é enviado a restaurante, nenhuma reserva real é feita e nenhum pagamento é processado. As imagens gastronômicas são descritas no repositório como geradas por IA.

## Como os vídeos foram produzidos

1. Cópias dos repositórios foram obtidas nos commits indicados.
2. Foi executado `npm ci` em cada cópia isolada, usando os lockfiles originais. Os manifestos e lockfiles da dSaOl permaneceram intactos.
3. Ambos os builds originais terminaram com sucesso. Foram iniciados servidores locais de preview/produção, vinculados a `127.0.0.1`.
4. Playwright/Chromium navegou por fluxos reais das aplicações, em contextos de navegador novos e com dados fictícios. Os passos tiveram verificações de estado; não foram inseridas telas inventadas.
5. A captura nativa do Chromium foi codificada pelo FFmpeg já disponível no ambiente, em MP4/H.264, sem áudio. Foram inspecionados quadros das gravações e os metadados dos arquivos.
6. Os vídeos, legendas e roteiros foram incluídos nas apresentações. Esses arquivos não tornam a loja ou o painel original interativos dentro da dSaOl: são registros do funcionamento.

Os scripts auxiliares, gravações intermediárias, dependências e builds ficaram em `backend/.test-results/`, ignorados pelo Git. Nenhum túnel ou hospedagem pública foi iniciado.

## Validação

- Referências locais, IDs e H1 das 14 páginas públicas/autenticação/administração foram conferidos, com tratamento das rotas hash administrativas. Arquivos de imagens foram comparados aos hashes das fontes.
- Builds de Linha Tênue e Cidade do Sabor aprovados. Os roteiros de gravação concluíram os passos e não observaram erros JavaScript. Não foi executada a suíte completa de testes de cada aplicação original.
- `npm test` no backend da dSaOl: **19 testes aprovados**, sem falhas ou ignorados, após permitir servir MP4 e VTT na lista de arquivos públicos de projetos. Schema, migrations, autenticação e permissões não foram alterados.
- Validação de interface e mídia aprovada no Chromium em 360, 768 e 1440 px: sem rolagem horizontal; capturas carregadas; retorno e ampliação em nova aba; cards, menu e demonstrações anteriores acessíveis; formulário WhatsApp interceptado; autoplay mudo, pausa manual, pausa fora da tela, legendas, roteiro textual e reprodução manual com movimento reduzido. MP4 e requisições parciais Range responderam corretamente, incluindo HTTP 206. Não foram observados erros JavaScript, CSP ou HTTP nessa execução.

## Limites e próximos passos

- As apresentações distinguem **Ver código**, **Ver demonstração em vídeo** e uma futura demonstração interativa. Nenhum link de aplicação publicada foi inventado.
- Publicar as aplicações originais é uma etapa separada. Quando houver URLs reais e verificadas, elas poderão ser acrescentadas aos estudos de caso. O repositório GitHub não deve ser apresentado como se fosse uma loja executável.
- Os painéis demonstrativos dos dois conceitos são independentes da administração real da dSaOl e não alteram seu PostgreSQL.
- Os vídeos não incluem narração ou música. Não foram testados em Safari, Firefox ou celular físico. Preferências de autoplay do navegador podem exigir reprodução manual.
- As fontes, capturas e vídeos mostram uma versão específica. Não representam clientes, receita, resultados comerciais, certificações ou operações reais.

## Arquivos desta integração

Modificados: `index.html`, `style.css`, `backend/src/app.js` e `docs/rebranding-dsaol-web-studio.md`.

Criados:

```text
projetos/cases.css
projetos/case-media.js
projetos/linha-tenue/index.html
projetos/linha-tenue/imagens/home.jpg
projetos/linha-tenue/imagens/catalog.jpg
projetos/linha-tenue/imagens/product.jpg
projetos/linha-tenue/imagens/cart.jpg
projetos/linha-tenue/imagens/checkout.jpg
projetos/linha-tenue/imagens/admin.jpg
projetos/linha-tenue/media/demonstracao.mp4
projetos/linha-tenue/media/roteiro.vtt
projetos/cidade-do-sabor/index.html
projetos/cidade-do-sabor/imagens/inicio-desktop.webp
projetos/cidade-do-sabor/imagens/cardapio-desktop.webp
projetos/cidade-do-sabor/imagens/personalizacao-desktop.webp
projetos/cidade-do-sabor/imagens/checkout-desktop.webp
projetos/cidade-do-sabor/imagens/painel-desktop.webp
projetos/cidade-do-sabor/imagens/pedidos-desktop.webp
projetos/cidade-do-sabor/imagens/inicio-mobile.webp
projetos/cidade-do-sabor/imagens/favoritos-mobile.webp
projetos/cidade-do-sabor/media/demonstracao.mp4
projetos/cidade-do-sabor/media/roteiro.vtt
docs/portfolio-fontes.json
docs/portfolio-projetos-conceituais.md
```

Para visualizar na cópia de trabalho atualizada, execute `npm.cmd start` dentro de `backend`, usando o PostgreSQL e `.env` já configurados. Abra a seção **Projetos** e escolha **Conhecer projeto**. Não é necessário instalar React ou Next no projeto da dSaOl.
