# Hospedagem gratuita, domínio e contato

Registro de 30/10/2026. O domínio `dsaol.com.br` foi informado como comprado no Registro.br. O e-mail escolhido é `rafadsaol@outlook.com` e o WhatsApp é `+55 (41) 99661-7319`. Foi preparada uma versão pública estática para Cloudflare Pages, mantendo a V5 no projeto. Nenhuma publicação ou alteração de DNS foi executada.

## Onde ficam os contatos

- `config.js`: número `5541996617319`, formado por país 55 + DDD 41 + celular 996617319. A flag `isPlaceholder` continua falsa.
- `script.js`: constante `CONTACT_EMAIL`. O JavaScript atualiza o link da seção Contato para `mailto:rafadsaol@outlook.com`.
- `index.html`: o mesmo mailto está presente no HTML, e a versão dos scripts foi atualizada para evitar uso do contato anterior em cache.

`mailto:` pede ao sistema para abrir um aplicativo de e-mail. Não envia uma mensagem sozinho. O WhatsApp também abre uma conversa com texto preparado; é preciso confirmar o envio lá. Os testes interceptaram essa abertura e usaram dados fictícios no formulário. Não foi enviado e-mail, WhatsApp ou dado de visitante real.

## Domínio, DNS e hospedagem são coisas diferentes

O Registro.br mantém o registro do nome. DNS informa a qual serviço um nome aponta. A hospedagem entrega os arquivos do site. HTTPS protege a conexão e precisa ser verificado no domínio final.

A recomendação é Cloudflare Pages Free para esta primeira cópia pública, com orçamento pelo WhatsApp. A documentação oficial confirma suporte a sites HTML e domínio próprio; os limites consultados foram 500 builds/mês, 20.000 arquivos e 25 MiB por arquivo. O pacote atual está dentro deles. A renovação do domínio continua sendo do Registro.br.

Para usar o domínio raiz no Pages, a documentação exige DNS pela Cloudflare. Use os dois servidores específicos fornecidos pela sua conta; não existem servidores genéricos que possamos adivinhar. O roteiro completo está em [Publicação](../publicacao.md). Não altere registros de e-mail por causa da hospedagem do site.

## O pacote estático

Na raiz do projeto, com Node 24:

```powershell
node scripts/verificar-publicacao.mjs
node scripts/preparar-site-publico.mjs
```

O empacotador usa módulos nativos do Node e não instala dependências. `Map` mantém os caminhos e conteúdos dos arquivos permitidos. `readdir` percorre apenas as pastas públicas; `lstat` identifica links simbólicos; `readFile`, `mkdir` e `writeFile` montam a saída em `dist/site`.

A lista de origem é explícita: arquivos públicos da raiz e extensões permitidas em `assets`, `servicos` e `projetos`. Backend, banco, `.env`, documentação, scripts de manutenção e Git não são copiados. Licenças das fontes são preservadas. Os limites de tamanho e quantidade são conferidos antes da escrita.

A cópia gerada do `index.html` não carrega `solicitacoes.js` nem oferece a área de conta e o registro no banco. O original continua com a integração V5 completa, e o backend continua funcionando localmente. Essa separação evita publicar uma tela de login que não teria servidor para autenticar e evita consultas a uma API que o Pages estático não executa.

O marcador `dist/.site-public-build` identifica a saída do próprio script. Reexecutar atualiza o pacote gerado, mas arquivos/pastas inesperados e links simbólicos provocam erro antes da escrita. Nada é apagado automaticamente. Se um arquivo inesperado aparecer, revise e mova-o para fora do pacote antes de continuar. A pasta `dist` está no `.gitignore`; o GitHub recebe os fontes, e a hospedagem executa o build ou recebe a pasta gerada.

## Configuração e SEO

`publicacao.config.json` informa a origem HTTPS real, a hospedagem preparada e o modo estático. `deploymentVerified: false` registra que o domínio ainda não foi validado. Não é uma consulta automática de disponibilidade.

As nove páginas públicas usam canonical e og:url. O canonical identifica a URL preferida para busca, e og:url identifica a URL usada no compartilhamento. `sitemap.xml` relaciona as quatro páginas principais; `robots.txt` aponta para o sitemap e orienta rastreadores. Robots não protege arquivos: o pacote não exporta as áreas privadas, e o backend mantém seus middlewares.

`404.html` oferece uma página de erro com retorno ao início. `deploy/cloudflare/_headers` é copiado como `_headers` para o Pages aplicar os headers. A política CSP limita recursos à própria origem; `frame-ancestors` e X-Frame-Options impedem incorporação em outros sites. O teste local simulou esses headers, sem certificar a infraestrutura real da Cloudflare.

O Express recebeu somente duas entradas na lista pública: `robots.txt` e `sitemap.xml`. Schema, migrations, autenticação, conta de administrador e configuração privada não foram alterados.

## Resultados e limites

- Backend: 19 testes com PostgreSQL real aprovados, sem falhas ou ignorados.
- Verificador: dez HTMLs e 168 referências locais dos fontes aprovados, com e-mail/número, metadados e sitemap conferidos. O modo estrito ainda reprova publicação não verificada e os testes externos pendentes.
- Pacote: 57 arquivos, 6,95 MiB no total; maior arquivo de 1,27 MiB. Dez HTMLs e 166 referências locais da cópia exportada foram conferidos, com XML válido.
- Chromium em 360/768/1440: fonte e pacote sem overflow nas páginas verificadas; menu, imagens, retorno, logo, clipes e movimento reduzido preservados.
- Formulário vazio, e-mail e telefone inválidos, consentimento, serviço pré-selecionado, mensagem fictícia e abertura em nova aba para o novo número verificados. Novo mailto conferido, sem enviar e-mail.
- Pacote sem consultas à API, sem interface administrativa e sem armazenamento dos dados pessoais do formulário ou criação de cookies observados. Servidor local respondeu 404 aos caminhos privados e 206 aos vídeos com Range.
- Empacotador reexecutado com sucesso e testado contra arquivo inesperado/link simbólico, recusados antes de modificar a saída. Fixtures de teste removidos. Uma árvore Git limpa, sem `.env`, dependências instaladas ou banco, reproduziu os mesmos 57 arquivos com hashes idênticos. Sintaxe de 38 arquivos JS/MJS e `git diff --check` aprovados; nenhuma dependência nova.

DNS no Registro.br, conta Cloudflare, certificado HTTPS público, Safari, Firefox e celular físico continuam pendentes. O envio real de WhatsApp/e-mail não foi testado. Entrega SMTP e operação pública do backend são outra etapa.

O [guia de publicação](../publicacao.md) lista os arquivos criados e modificados e as configurações do Pages. A integração Git publica automaticamente por padrão; veja ali como desativar os deploys automáticos se quiser continuar revisando cada publicação antes de colocá-la no ar.
