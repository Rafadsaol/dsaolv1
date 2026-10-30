# Preparação para colocar a dSaOl no ar

Estado em 30/10/2026: preparação iniciada, sem publicação e sem alteração de banco/autenticação. A página pública usa HTML/CSS/JavaScript; a V5 acrescenta Express, Prisma e PostgreSQL. O site completo precisa de hospedagem que execute Node.js, além do banco.

## Decisões pendentes

1. Publicar primeiro o portfólio com WhatsApp ou também disponibilizar cadastro, painel e registro de solicitações?
2. Qual será o domínio e qual será a hospedagem? Ainda não foi informado um destino para esta publicação.
3. O e-mail `contato@dsaol.it` já recebe mensagens? O comentário em `script.js` ainda o identifica como provisório; ele foi preservado até confirmação.

As respostas definem a configuração de publicação. Nenhum domínio, preço, provedor contratado ou credencial foi presumido.

## Dois caminhos possíveis

| Caminho | O que funciona | O que configurar |
|---|---|---|
| Portfólio público estático | Landing page, serviços, imagens, clipes, demonstrações locais e preparação do contato por WhatsApp | Hospedagem estática com HTTPS; enviar somente arquivos públicos; definir domínio e e-mail |
| Aplicação completa | Tudo acima, mais autenticação, painel e registro opcional de solicitações no PostgreSQL | Serviço Node 24, PostgreSQL, HTTPS, SMTP, variáveis privadas, proxy, backups e verificação da aplicação |

GitHub Pages não executa Express, Prisma ou PostgreSQL. Um túnel temporário pelo computador continua sendo útil para testes, mas depende do computador ligado e não substitui a hospedagem permanente.

Publicar uma cópia estática não exige apagar o backend do repositório. A montagem de um pacote estático deve usar uma lista explícita de arquivos públicos; não enviar a pasta inteira do projeto para um diretório servido por HTTP. O frontend consulta a disponibilidade da API e mantém o contato pelo WhatsApp quando ela não está disponível.

## O que foi preparado e conferido

- As duas capturas móveis de Cidade do Sabor agora usam uma moldura reutilizável de celular, com rolagem interna, foco visível e ampliação em nova aba. As imagens originais foram preservadas.
- Criado `scripts/verificar-publicacao.mjs`: verificação local, sem dependências novas, sem rede e sem leitura de `.env`. Confere títulos/descrições, H1, IDs, textos alternativos, referências e âncoras das nove páginas públicas, além da configuração pública do WhatsApp.
- A revisão mantém o WhatsApp comercial configurado e seu fluxo de confirmação manual. Abrir a conversa não significa que a mensagem foi enviada. A regressão no Chromium em 360, 768 e 1440 px passou, incluindo menu, estudos, imagens, clipes e montagem da mensagem interceptada sem envio real.
- Metadados básicos e fontes locais já existem. Não foram criados canonical, sitemap ou URLs Open Graph com domínio inventado.
- A V5 já protege o painel no backend, usa sessões persistentes, CSRF, Argon2id e cookies Secure quando a origem usa HTTPS. Isso não substitui a revisão do ambiente de produção.

Para executar a conferência, na raiz do projeto:

```powershell
node scripts/verificar-publicacao.mjs
```

O código de saída é 1 quando há erro de referência ou conteúdo obrigatório. As pendências de publicação aparecem separadamente. Para exigir também a resolução das pendências registradas no script:

```powershell
node scripts/verificar-publicacao.mjs --estrito
```

O modo estrito falha nesta etapa, pois hospedagem/domínio e e-mail ainda precisam de confirmação. Após as decisões, atualizar tanto os arquivos de configuração quanto os avisos correspondentes do script. Este verificador é uma conferência estática dos padrões HTML atuais; não substitui navegador, auditoria completa de acessibilidade ou teste da hospedagem.

## Sequência para a aplicação completa, se esse for o caminho escolhido

1. Criar um ambiente de produção separado do laboratório, com PostgreSQL próprio. Não usar o banco de testes para receber dados reais.
2. Configurar variáveis no painel privado da hospedagem, usando `backend/.env.example` como referência. Não enviar `.env` ao GitHub.
3. Definir `NODE_ENV=production`, a `APP_ORIGIN` HTTPS real, `DATABASE_URL`, um `SESSION_SECRET` novo e a entrega SMTP. `HOST=0.0.0.0` costuma ser necessário em containers/plataformas; em servidor local atrás de proxy, a interface depende da arquitetura escolhida.
4. Definir `TRUST_PROXY=1` somente se houver exatamente um proxy confiável e o Node não puder ser acessado diretamente pela internet. Outras topologias precisam de configuração específica; não confiar indiscriminadamente em headers encaminhados.
5. Na pasta `backend`, instalar com `npm ci`, gerar o cliente com `npm run prisma:generate` e aplicar migrations existentes com `npm run db:migrate`. Esses comandos são uma sequência futura; não foram executados em produção. Não usar reset nem seed de demonstração no banco real.
6. Criar o primeiro administrador pelo CLI interativo `npm run admin:bootstrap`, em terminal privado da hospedagem. Não usar uma senha fixa em código ou argumentos do shell.
7. Iniciar o serviço com `node src/server.js`, usando as variáveis já configuradas pela hospedagem. `npm start` atual exige um arquivo `.env` local; não assumir que ele existe em uma plataforma que injeta variáveis. Depois de escolher o provedor, ajustar/documentar o comando adequado.
8. Testar recuperação de senha com entrega SMTP efetiva, HTTPS, sessões Secure, origem, logout, proteção USER/ADMIN e indisponibilidade do banco. O transporte `file` de desenvolvimento é recusado em produção.
9. Manter inicialmente uma única instância e revisar limites de requisições e proxy. O rate limiter atual fica em memória e reinicia com o processo; múltiplas instâncias exigem uma solução compartilhada.
10. Configurar backups, retenção dos dados de solicitações, restauração testada, monitoramento de disponibilidade e registros que não exponham senhas, tokens ou conteúdo pessoal.

Não foram criadas contas em hospedagens, contratado domínio, configurado SMTP real ou feito deploy. A imagem PostgreSQL do `compose.yaml` atual é do laboratório, vinculada ao loopback; não a expor diretamente na internet.

## Revisão final de conteúdo e experiência

- Confirmar e-mail, número e atendimento comercial. Testar abertura do WhatsApp em celular real, sem confundir abertura com envio.
- Revisar texto de privacidade e os dados realmente coletados. Se o registro no banco for público, definir finalidade, acesso, retenção e canal de contato antes de receber dados reais. A autorização separada existente continua obrigatória.
- Confirmar como apresentar os projetos conceituais e as imagens utilizadas. Linha Tênue e Cidade do Sabor continuam identificados como fictícios, sem cliente ou aplicação interativa publicada.
- Definir a origem pública para canonical, sitemap e compartilhamento social. Preparar as regras de indexação conforme o host escolhido; páginas de conta e administração não devem ser indexadas.
- Testar os links e o formulário no endereço público final. Na hospedagem estática, validar também o caminho quando o site estiver em uma subpasta.
- Conferir 360, 768 e 1440 px, navegação por teclado, movimento reduzido e pelo menos um celular físico; revisar também Safari e Firefox.
- Configurar cache e compressão na hospedagem. Os PNGs da marca e o favicon raster incorporado podem ser otimizados quando houver os vetores originais; não são impeditivos funcionais, mas merecem revisão de tamanho.

## Arquivos desta etapa

Modificados: `index.html`, `projetos/linha-tenue/index.html` (versão do CSS compartilhado), `projetos/cidade-do-sabor/index.html`, `projetos/cases.css`, `README.md`, `docs/estudos/README.md`.

Criados: `scripts/verificar-publicacao.mjs`, `docs/publicacao.md`, `docs/estudos/13-preparacao-publicacao.md`.
