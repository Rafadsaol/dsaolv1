# Publicação da dSaOl Web Studio

Estado em 30/10/2026: arquivos preparados e testados localmente. **Ainda não houve deploy, alteração de DNS ou validação do domínio público.**

## Configuração atual

| Item | Valor |
|---|---|
| Domínio comprado | `dsaol.com.br`, no Registro.br |
| Origem preparada | `https://dsaol.com.br` |
| E-mail de contato | `rafadsaol@outlook.com` |
| WhatsApp | `+55 (41) 99661-7319` |
| Formato usado pelo WhatsApp | `5541996617319` |
| Hospedagem gratuita recomendada | Cloudflare Pages, plano Free |
| Pacote preparado | Site público estático em `dist/site` |

O backend, a autenticação, o painel e o PostgreSQL continuam preservados no projeto para execução local. O pacote gratuito preparado nesta etapa contém o portfólio, serviços, imagens, clipes, demonstrações e o orçamento pelo WhatsApp. Ele **não hospeda a API, contas ou painel**. Para colocar esses recursos no ar, será necessário preparar também um serviço Node/PostgreSQL.

O e-mail informado configura o link `mailto:`. Isso não configura envio de e-mails pelo servidor nem recuperação de senha via SMTP. O WhatsApp abre uma conversa em outra aba; o visitante ainda precisa confirmar o envio.

## Por que Cloudflare Pages

A documentação oficial consultada em 30/10/2026 confirma um plano gratuito para sites estáticos com domínio próprio. Os limites publicados incluem 500 builds por mês, 20.000 arquivos e 25 MiB por arquivo. O pacote atual tem **57 arquivos, cerca de 6,95 MiB no total e maior arquivo de 1,27 MiB**. Não utiliza Functions, banco ou serviços pagos da Cloudflare.

A renovação do domínio continua sendo feita no Registro.br; hospedagem gratuita não elimina essa cobrança do domínio. O domínio pode continuar registrado lá mesmo usando DNS da Cloudflare.

Fontes oficiais:

- [Sites HTML estáticos](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [Limites do plano](https://developers.cloudflare.com/pages/platform/limits/)
- [Domínios próprios e DNS](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Integração com Git](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Controle de publicações por branch](https://developers.cloudflare.com/pages/configuration/branch-build-controls/)

Os textos foram conferidos no [repositório oficial da documentação](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/pages). A configuração real e a disponibilidade do plano devem ser conferidas no painel ao criar a conta.

## Gerar o pacote no seu computador

Na raiz do repositório atualizado, com Node.js 24 instalado:

```powershell
git pull --ff-only
node scripts/verificar-publicacao.mjs
node scripts/preparar-site-publico.mjs
```

Não é necessário instalar dependências para esses comandos. O resultado está em **`dist/site`**, ignorado pelo Git. O script copia somente arquivos públicos, licenças de fontes e a configuração de headers estáticos. Não copia `.env`, backend, banco, docs, scripts de manutenção, Git, node_modules ou interfaces administrativas.

Na **cópia gerada** do `index.html`, ele retira o carregamento de `solicitacoes.js`, o painel opcional de registro e o link de conta. Assim, o site estático não consulta uma API inexistente nem oferece login sem backend. Os arquivos originais e a integração V5 permanecem intactos no projeto.

O empacotador pode ser executado novamente: atualiza somente seu próprio pacote, exige o marcador em `dist/.site-public-build` e recusa arquivos/pastas inesperados ou links simbólicos. Ele não apaga arquivos. Se houver um arquivo inesperado, revise-o e mova-o para fora do pacote antes de executar novamente; não envie arquivos privados para `dist/site`.

O verificador confere dez HTMLs e 168 referências locais nos arquivos-fonte, títulos/descrições, H1, IDs, imagens, e-mail, WhatsApp, canonical/og:url, sitemap e robots. `--estrito` também reprova as pendências de publicação. Essas verificações são locais; não confirmam DNS, HTTPS, entrega de e-mail ou mensagens.

`publicacao.config.json` registra a origem, o destino preparado e `deploymentVerified: false`. Mantenha esse campo falso até existir uma publicação verificada; ele é um registro manual, não uma sondagem automática do domínio. As pendências de teste em celular/Safari/Firefox continuam sendo informadas separadamente.

## Criar o projeto no Cloudflare Pages

As etapas abaixo são instruções para você executar na sua conta. Nenhum projeto ou conta foi criado pelo assistente.

Para aproveitar o repositório GitHub, no painel Cloudflare procure **Workers & Pages → Create application → Pages → Connect to Git**. A disposição e os nomes podem variar na interface. Autorize somente o repositório necessário e use:

| Configuração | Valor |
|---|---|
| Repositório | `Rafadsaol/dsaolv1` |
| Branch de produção | `v5-fullstack` |
| Framework preset | `None` |
| Diretório raiz do projeto | Raiz do repositório; não selecionar `backend` |
| Build command | `node scripts/preparar-site-publico.mjs` |
| Build output directory | `dist/site` |
| Variável do build | `NODE_VERSION=24` |

Não configure comando de deploy do Workers nem aponte a saída para a raiz do repositório. O projeto é Pages estático. Não informe `DATABASE_URL`, `SESSION_SECRET` ou credenciais do laboratório ao build estático.

**Confirmar o primeiro deploy publica uma URL `pages.dev`.** Faça isso quando estiver pronto para disponibilizar essa cópia. Não inventamos um nome de projeto ou URL `pages.dev`; use a URL efetivamente fornecida pelo painel.

A integração Git faz publicações automáticas por padrão. Se quiser manter atualizações no GitHub sem publicar cada alteração, após criar o projeto vá em **Settings → Builds & deployments → Configure Production deployments**, desative **Enable automatic production branch deployments** e salve. Configure **Preview branches: None** se também não quiser previews automáticos. Para publicar uma revisão nova com automações desativadas, será necessário acionar um mecanismo suportado para a revisão desejada, como um deploy hook ou Wrangler; essa configuração é uma etapa posterior. A ação de tentar novamente um deploy pode reconstruir a revisão anterior, então confira o commit exibido no painel.

Como alternativa inicial sem integração Git, escolha **Direct Upload** e envie somente a pasta `dist/site`. Essa opção exige novos uploads a cada atualização. A documentação informa que um projeto criado por Direct Upload não pode ser convertido em integração Git; para mudar esse modelo, será necessário outro projeto. Não é preciso instalar Wrangler para fazer o upload pela interface.

## Conectar dsaol.com.br no Registro.br

Para usar o domínio raiz no Cloudflare Pages, a documentação exige uma zona Cloudflare para o domínio e seus servidores DNS configurados lá.

1. Na Cloudflare, adicione o domínio `dsaol.com.br` e escolha o plano gratuito. Confira os registros DNS encontrados; preserve registros existentes de e-mail, como MX/TXT, se houver.
2. Copie os **dois servidores DNS exatos fornecidos para a sua conta**. Não existem valores genéricos que devamos inventar neste documento.
3. No Registro.br, entre em sua conta, abra `dsaol.com.br` e procure **DNS → Alterar servidores DNS**. Informe os dois servidores recebidos da Cloudflare e salve. Isso muda o DNS, não transfere o registro do domínio.
4. Aguarde a Cloudflare reconhecer a zona como ativa. A propagação não é instantânea e deve ser acompanhada nos painéis.
5. No projeto Pages, abra **Custom domains → Set up a custom domain** e informe `dsaol.com.br`. Complete o processo no próprio Pages; não crie apenas um CNAME isolado sem associar o domínio ao projeto.
6. Aguarde a ativação do domínio e do certificado. Verifique `https://dsaol.com.br` e confira se o certificado é válido antes de divulgar o endereço.
7. Se quiser atender também `www.dsaol.com.br`, cadastre esse nome no Pages e prepare um redirecionamento para a origem sem `www`. Essa etapa é opcional e ainda não foi configurada.

Não é necessário criar uma caixa de e-mail `@dsaol.com.br` nesta etapa. O link de contato usa a conta Outlook informada. Não altere registros MX para tentar fazer o site funcionar; DNS do site e entrega de e-mail são configurações diferentes.

## Metadados e arquivos publicados

As nove páginas públicas receberam canonical e og:url com a origem real. `sitemap.xml` inclui a página inicial, o serviço de criação de sites e os dois estudos de caso. As demonstrações antigas permanecem acessíveis pelo portfólio; as páginas históricas de serviços conservam `noindex`.

`robots.txt` aponta para o sitemap e orienta rastreadores a não visitar áreas de conta/administração/arquivos internos. Ele **não é controle de acesso**: no pacote estático, essas áreas não são exportadas; no backend, continuam protegidas pelos middlewares existentes.

`404.html` oferece retorno ao início em endereços inexistentes. O arquivo `_headers` gerado configura CSP, proteção contra incorporação em frames, tipo de conteúdo, referrer e permissões do navegador. Esses headers são aplicados pela hospedagem Pages; o teste local os simulou. Não substituem a verificação no domínio publicado.

## Testes desta revisão

- `npm test` em `backend`: **19 testes aprovados com PostgreSQL real**, sem falhas ou ignorados. O backend mudou somente a lista de arquivos públicos para servir `robots.txt` e `sitemap.xml`.
- Fonte e pacote estático verificados no Chromium em **360, 768 e 1440 px**. Página inicial, imagens, menu, retorno, estudos, clipes, movimento reduzido e contato preservados, sem rolagem horizontal observada.
- Testados formulário vazio, e-mail/telefone inválidos, pré-seleção de serviço, mensagem com dados fictícios e destino `5541996617319`, com abertura interceptada em nova aba. Nenhuma mensagem real enviada.
- Link `mailto:rafadsaol@outlook.com` conferido. Não houve teste de envio ou recebimento de e-mail.
- No pacote, nenhuma consulta automática à API, nenhuma interface administrativa exportada, nenhuma persistência dos dados pessoais preenchidos no formulário e nenhuma criação de cookie observada.
- Dez HTMLs do pacote e 166 referências locais válidos; XML do sitemap válido. MP4 com requisições Range HTTP 206; arquivos privados indisponíveis no servidor local do pacote.
- Empacotador executado novamente com sucesso; arquivos inesperados e links simbólicos foram recusados antes de alterar a saída. Build de uma árvore Git limpa, sem `.env`, `node_modules`, instalação ou banco, gerou os mesmos 57 arquivos com hashes idênticos. Sintaxe dos 38 arquivos JavaScript/MJS e `git diff --check` aprovadas.

Ainda não foram testados Cloudflare real, DNS, HTTPS público, Safari, Firefox ou celular físico. A revisão local não significa que o site já está no ar. A publicação não hospeda Linha Tênue e Cidade do Sabor como aplicações completas: apresenta suas imagens e clipes existentes.

## Se quiser publicar o backend depois

Será outra etapa: hospedagem Node 24/PostgreSQL, origem HTTPS real, secrets próprios de produção, SMTP com entrega verificada, revisão de proxy/limites, primeiro ADMIN via CLI e backups/restauração testados. Não reutilizar o banco do laboratório para dados reais. Veja o [README do backend](../backend/README.md). A hospedagem Pages estática não executa Express nem migrations.

## Arquivos desta revisão

Modificados: `.gitignore`, `config.js`, `script.js`, `index.html`, os cinco `projetos/*/index.html`, os três `servicos/*/index.html`, `backend/src/app.js`, `scripts/verificar-publicacao.mjs`, `README.md`, `docs/publicacao.md`, `docs/estudos/README.md`.

Criados: `publicacao.config.json`, `robots.txt`, `sitemap.xml`, `404.html`, `scripts/preparar-site-publico.mjs`, `deploy/cloudflare/_headers`, `docs/estudos/14-cloudflare-dominio-contato.md`.

Gerados e ignorados pelo Git: `dist/site/` e `dist/.site-public-build`. O pacote é reproduzido pelo comando de build; não precisa ser enviado como código-fonte ao GitHub.
