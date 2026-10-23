# TechSolutions / dSaOl IT — V5 de laboratório

Esta versão acrescenta API Express, PostgreSQL, Prisma e interfaces administrativas ao frontend HTML/CSS/JS existente. **Não há publicação automática.** As demonstrações V3 continuam fictícias; o dashboard administrativo consulta as tabelas do banco, sem indicadores simulados.

## Estado de validação deste ambiente

- Node 24.19.0 e npm 11.9.0 disponíveis; dependências instaladas e fixadas em `package-lock.json`.
- PostgreSQL 17 iniciado em Docker e conexão real verificada.
- Sete testes unitários aprovados: Argon2id, entradas, CSRF, origens e configuração.
- SQL da migration validado em PostgreSQL real, dentro de um schema temporário e transação desfeita. Foram verificados hash obrigatório, unicidade, enum, índices e integridade referencial.
- Download oficial liberado após configurar `binaries.prisma.sh`; cliente Prisma 7.10.1 gerado sem desativar TLS ou checksum. Migration aplicada pela CLI aos bancos separados `dsaol_dev` e `dsaol_test`.
- `npm test`: **17 testes aprovados, nenhum falhou ou foi ignorado** (incluindo o agrupador da integração). Os cenários reais cobrem cadastro, login/logout, senha incorreta, CSRF, permissões, bootstrap, CRUD, integridade referencial, idempotência, persistência após recriar a aplicação e recuperação de senha local com expiração e uso único.
- Interfaces verificadas no Chromium em 360, 768 e 1440 px com respostas isoladas de teste: layout, consentimento separado, montagem da solicitação e indisponibilidade da API. Esses testes não substituem autenticação nem persistência reais.
- Depois da liberação, Chromium também executou cadastro, login USER/ADMIN, logout e criação/exclusão de cliente e projeto com API, Prisma e PostgreSQL reais, usando contas fictícias descartadas ao final. Sem rolagem horizontal nas páginas verificadas em 360/768/1440 px e sem erros JavaScript/CSP observados. Não foram enviadas mensagens ao WhatsApp.
- `npm start` e `GET /api/v1/health` verificados com banco de desenvolvimento real. Nenhum administrador permanente foi criado; inicialize o seu pelo CLI interativo.
- Auditoria npm das dependências de produção: nenhuma vulnerabilidade conhecida reportada na consulta executada. Isso não equivale a uma auditoria de segurança completa.

## Requisitos e versões

| Componente | Versão utilizada |
|---|---|
| Node.js | 24 LTS, >=24.11 e <25 |
| PostgreSQL | 17.11 verificado, imagem `postgres:17-alpine` |
| Express | 5.3.0 |
| Prisma, Prisma Client e adapter-pg | 7.10.1, sem pré-release |
| express-session / connect-pg-simple | 1.19.0 / 10.0.0 |
| Argon2 | 0.45.1, algoritmo Argon2id |
| Helmet / express-rate-limit | 8.3.0 / 8.7.1 |
| Zod / pg / Nodemailer | 4.6.7 / 8.23.1 / 10.2.1 |
| Supertest | 7.3.1, desenvolvimento |

As versões e engines foram consultadas no registro npm. A documentação web de Prisma/Express não estava acessível pela rede do ambiente. O canal `latest` de Prisma apontava um pré-release; foi fixada a linha estável compatível do cliente e adapter.

## Estrutura

```text
backend/
  .env.example             # nomes e placeholders; sem segredos reais
  package.json / package-lock.json
  prisma.config.js         # configuração da CLI Prisma (JavaScript, com parser .env nativo do Node)
  prisma/
    schema.prisma
    migrations/            # SQL versionado; nenhuma migration destrutiva automática
    seed.js                # somente cliente/projeto fictícios; não cria usuários
  src/
    app.js                 # aplicação testável, sessões e lista explícita de estáticos
    server.js              # início e encerramento do processo
    config/env.js
    controllers/
    routes/
    services/              # autenticação, mensagens, bootstrap e regras administrativas
    repositories/          # Prisma, seletores públicos e acesso a registros
    middlewares/           # autenticação, ADMIN, CSRF e origem
    lib/                   # erros e validação
  public/auth/             # login, cadastro, recuperação e cliente HTTP
  public/admin/            # painel protegido e componentes vanilla JS
  scripts/                # bootstrap interativo e migrations do banco de teste
  tests/                  # unidade, SQL real e integração real
compose.yaml               # na raiz; banco local com volume Docker próprio
```

O frontend público permanece na raiz e nas pastas `servicos/` e `projetos/`. Express não expõe a raiz do checkout como diretório estático. `.env`, arquivos internos, node_modules e migrations não são servidos.

## Configurar sem sobrescrever arquivos privados

1. Se ainda não existir `backend/.env`, copie `backend/.env.example` para esse caminho. Nunca sobrescreva uma configuração existente sem guardá-la.
2. Escolha `POSTGRES_USER`, `POSTGRES_DB` e uma senha **local aleatória**. Atualize `DATABASE_URL` com os mesmos valores e `TEST_DATABASE_URL` com outro banco terminado em `_test`.
3. Gere outro segredo independente para a sessão. Este comando apenas imprime um novo segredo para você copiar no `.env` local:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

4. Mantenha `APP_ORIGIN=http://127.0.0.1:3000` e acesse esse mesmo host/porta durante os testes. O uso de `localhost` com origem configurada como `127.0.0.1` pode rejeitar operações de escrita.
5. Mantenha `EMAIL_TRANSPORT=file` para estudos e `CONTACT_REQUESTS_ENABLED=false` até querer testar o registro opcional.

O `.env` gerado neste ambiente contém apenas credenciais aleatórias locais e está ignorado pelo Git. Não é um arquivo de distribuição e não contém administrador pré-criado. Senhas de PostgreSQL com caracteres especiais precisam de codificação adequada na URL; um valor hexadecimal aleatório facilita o laboratório.

## Instalar e iniciar PostgreSQL

Na raiz do projeto:

```bash
docker compose --env-file backend/.env up -d postgres
```

A porta 5433 fica vinculada somente a `127.0.0.1`. Os dados ficam no volume `dsaol-v5-lab_postgres_data`. Não execute `down -v` para preservar os dados. Para interromper sem apagar:

```bash
docker compose --env-file backend/.env stop postgres
```

Para criar o banco separado de teste, somente se ele ainda não existir:

```bash
docker compose --env-file backend/.env exec postgres sh -c 'createdb -U "$POSTGRES_USER" dsaol_test'
```

Se você usa PostgreSQL instalado diretamente, crie um banco dedicado e ajuste as duas URLs; Docker não é obrigatório. Não use banco com informações pessoais ou de produção para testes.

Alterar `POSTGRES_PASSWORD` depois de inicializar um volume não altera automaticamente a senha já cadastrada no PostgreSQL. Ajuste a configuração existente de forma consciente; não apague o volume para contornar um erro de acesso.

## Dependências, Prisma e migrations

Na pasta `backend`:

```bash
npm ci
npm run prisma:generate
npm run db:migrate
npm run db:migrate:test
```

Prisma 7 usa `prisma.config.js` para a URL da CLI, e a aplicação usa o adapter PostgreSQL. `prisma migrate deploy` aplica migrations existentes; não usa reset nem apaga tabelas. O SQL inicial foi escrito e revisado no repositório, incluindo restrições adicionais de normalização de e-mail e formato Argon2id.

A rede precisa permitir `registry.npmjs.org` e `binaries.prisma.sh`. Um HTTP 403 no download do engine/checksum bloqueia a CLI. Não use `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING` nem desative verificação TLS como solução. Depois de corrigir a rede, execute novamente geração e migrations.

O seed é opcional, exclusivamente para desenvolvimento:

```bash
npm run db:seed
```

Ele cria um cliente/projeto claramente fictício se ainda não existir. Não cria senhas ou contas administrativas. Esses dados contam como registros efetivamente gravados no dashboard do laboratório, não como números fixos de interface.

## Primeiro administrador

Após gerar o cliente e aplicar migrations:

```bash
npm run admin:bootstrap
```

Execute em um terminal interativo. Informe nome, e-mail, senha de pelo menos 12 caracteres e confirmação. A entrada da senha é ocultada; não use argumentos de shell nem variáveis de ambiente para a senha administrativa.

O comando adquire um lock transacional e recusa criar outro administrador quando já existe um. Cadastro público sempre gera `USER` e rejeita o campo `role`; não há endpoint de promoção de privilégios.

## Iniciar a aplicação

Dentro de `backend`:

```bash
npm run dev
```

Ou, sem watch:

```bash
npm start
```

O mesmo servidor entrega frontend e API. Acesse a raiz na origem configurada. Login: `/auth/login.html`; cadastro: `/auth/register.html`; recuperação: `/auth/forgot.html`; painel: `/admin/`. Usuários USER podem autenticar, consultar a própria sessão e sair, mas não acessar dados administrativos.

A navegação do painel usa `/admin/#dashboard`, `#customers`, `#projects`, `#requests` e `#users`. A página HTML e seus recursos passam pelos middlewares de sessão e ADMIN; as APIs repetem essas verificações.

O servidor Python/Live Server continua adequado ao frontend estático anterior, porém **não executa a API nem o painel protegido**. GitHub Pages também não hospeda Node/PostgreSQL. A branch `v5-fullstack` permite distribuir o código para estudos; isso não publica a aplicação. Não houve deploy da V5.

## Recuperação de senha para desenvolvimento

`POST /api/v1/auth/forgot-password` sempre responde com a mesma mensagem genérica para e-mail existente ou ausente. Para contas existentes, cria token criptograficamente aleatório, guarda somente SHA-256 do token no banco e prepara mensagem.

Com `EMAIL_TRANSPORT=file`, a mensagem fica em `backend/.mail/`, com diretório 0700 e arquivo 0600. Leia o arquivo **localmente no editor** e abra o link para testar. O token não é exposto em endpoints, logs ou respostas. Essa pasta é privada, ignorada pelo Git e não servida por HTTP. Use somente contas fictícias no laboratório e remova mensagens antigas quando não forem mais necessárias.

O link leva o token no fragmento `#token=...`, que não é enviado no GET da página. O frontend lê e retira esse fragmento do endereço, enviando-o apenas no POST protegido de redefinição. Validade de 15 minutos, consumo transacional de uso único e revogação das sessões após troca.

Para entrega real, configure `EMAIL_TRANSPORT=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` e `MAIL_FROM`. Em produção, o transporte local é recusado. Configurar SMTP ainda requer testar a entrega efetiva: **a recuperação não está validada para produção sem isso**.

## API REST e CSRF

Prefixo: `/api/v1`. Sucesso usa `{ "data": ... }`; listagens incluem `pagination`; falhas usam `{ "error": { "code", "message", "fields"? } }`. Nenhuma resposta de usuário inclui `passwordHash`.

Obtenha um token em `GET /auth/csrf`. O cookie de sessão e o header `X-CSRF-Token` são necessários nas operações de escrita, incluindo login/cadastro. O token é renovado após regenerar a sessão no login. O cliente HTTP da interface faz isso automaticamente, em memória, sem localStorage.

| Método e rota | Acesso / efeito |
|---|---|
| `GET /health` | Conectividade do banco |
| `GET /public-config` | Disponibilidade de login/registro opcional, sem segredos |
| `GET /auth/csrf` | Token CSRF vinculado à sessão |
| `POST /auth/register` | Cadastro USER: `name`, `email`, `password` |
| `POST /auth/login` | Login: `email`, `password`; regenera sessão |
| `GET /auth/me` | Usuário autenticado |
| `POST /auth/logout` | Destrói sessão e limpa cookie |
| `POST /auth/forgot-password` | Solicitar recuperação por `email` |
| `POST /auth/reset-password` | `token`, `password` |
| `GET /admin/users` | ADMIN, lista paginada |
| `GET/POST /admin/customers` | ADMIN, listar/criar |
| `GET/PUT/DELETE /admin/customers/:id` | ADMIN, consultar/substituir/excluir |
| `GET/POST /admin/projects` | ADMIN, listar/criar |
| `GET/PUT/DELETE /admin/projects/:id` | ADMIN, consultar/substituir/excluir |
| `GET /admin/contact-requests` | ADMIN, solicitações paginadas |
| `PATCH /admin/contact-requests/:id` | ADMIN, atualizar somente `status` |
| `GET /admin/dashboard` | ADMIN, contagens reais do banco |
| `POST /contact-requests` | Público com CSRF, autorização explícita e chave idempotente |

Listas: `page`, `pageSize` de 1 a 100 e `search` até 100 caracteres. Projetos e solicitações aceitam `status`. PUT de cliente/projeto exige os mesmos campos obrigatórios da criação. Campos opcionais podem ser omitidos ou enviados como texto vazio.

Cliente: `name`, `email`, `phone?`, `company?`. Projeto: `title`, `description`, `customerId`, `status`. Status de projeto: `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`. Status de solicitação: `NEW`, `IN_REVIEW`, `CONTACTED`, `CLOSED`.

Excluir cliente vinculado a projeto retorna 409; edite/remova os relacionamentos conscientemente antes de tentar outra vez. Não há exclusão em cascata dos projetos.

## Registro opcional do orçamento

Ative `CONTACT_REQUESTS_ENABLED=true` no `.env` e reinicie. A consulta inicial só lê disponibilidade, sem transmitir dados do formulário. A área adicional permanece escondida quando a API não existe ou está indisponível.

O visitante precisa marcar uma **autorização separada** e clicar em **Registrar solicitação no site**. A ação envia nome, e-mail, telefone, serviço, descrição e `consent: true`; não envia a empresa, senha ou dados extras. O consentimento recebe data no banco.

O `Idempotency-Key` é um UUID mantido somente em memória, e cliques simultâneos são bloqueados. Repetir a mesma chave/payload não cria outro registro. Alterar os campos gera outra chave. Isso evita duplicação da mesma tentativa, mas não impede um visitante de abrir outra página e fazer uma nova solicitação.

O WhatsApp continua independente, em nova aba, com confirmação manual pelo usuário. Registrar no banco não significa enviar uma mensagem de WhatsApp. Um erro da API não desabilita o contato anterior.

## Executar testes

Na pasta `backend`, com cliente gerado e os dois bancos preparados:

```bash
npm run test:unit
npm run test:schema
npm run test:integration
npm test
```

- Unidade: validação, hash Argon2id, tokens, middleware CSRF, origem e requisitos de produção.
- Schema: aplica o SQL em schema temporário dentro de uma transação no banco `_test`, verifica restrições e desfaz somente o que criou.
- Integração: exige Prisma e PostgreSQL reais. Exercita cadastro/login/logout, senha errada, USER bloqueado, CSRF, bootstrap, CRUD, FK, paginação, solicitação idempotente, sessões após reiniciar a aplicação, recuperação/expiração/uso único e rate limiting.
- A suíte integrada exige que não exista administrador anterior no banco dedicado de testes. Ela cria e remove suas próprias contas/registros fictícios e não faz reset/truncate do banco.
- Teste manual: navegue pelas sete páginas públicas e demos, abra login/cadastro/recuperação, entre com ADMIN local, faça CRUD e atualize solicitações. Confira Tab/Shift+Tab, diálogos, erros, carregamento e larguras 360/768/1440 px. Para WhatsApp automatizado, intercepte a abertura e use somente dados fictícios, sem enviar mensagens.

## Limitações e cuidados do laboratório

- A validação local passou, mas não substitui revisão para exposição pública. Permanecem pendentes entrega real de e-mail via SMTP, configuração HTTPS e teste em celular real. O bootstrap foi validado pelo serviço chamado pelo CLI; a digitação interativa do administrador deve ser feita por quem utilizar o laboratório.
- Rate limiting usa memória do processo: reinicia com ele e não coordena múltiplas instâncias. Para exposição pública, um armazenamento compartilhado e revisão do proxy seriam necessários.
- Produção exige HTTPS, `NODE_ENV=production`, segredo forte e SMTP real. Cookies tornam-se Secure; configure `TRUST_PROXY=1` somente atrás de um proxy confiável de um salto. Não confie em headers encaminhados de origens arbitrárias.
- CORS admite somente `APP_ORIGIN`. Não há token de sessão/senha em localStorage. A origem deve ser exata.
- O volume Docker local não é uma estratégia de backup. Planeje permissões, retenção, backups e recuperação antes de qualquer uso com dados reais.
- Respostas de recuperação são genéricas; o laboratório não inclui infraestrutura de e-mail transacional, fila ou operação de múltiplas instâncias.
- Não há MFA, auditoria de mudanças ou interface de administração de permissões; não foram adicionadas por estarem fora do escopo.
- Não existe pipeline de publicação da V5 e nenhum comando de deploy foi executado.

## Arquivos desta entrega

Modificados: `README.md`, `docs/estudos/README.md`, `index.html` e `style.css`.

Criados na raiz: `.gitignore`, `compose.yaml` e `solicitacoes.js`. Criados no backend:

```text
backend/.env.example
backend/README.md
backend/package-lock.json
backend/package.json
backend/prisma.config.js
backend/prisma/migrations/202610230001_initial/migration.sql
backend/prisma/migrations/migration_lock.toml
backend/prisma/schema.prisma
backend/prisma/seed.js
backend/public/admin/admin.css
backend/public/admin/admin.js
backend/public/admin/index.html
backend/public/auth/api.js
backend/public/auth/auth.css
backend/public/auth/auth.js
backend/public/auth/forgot.html
backend/public/auth/login.html
backend/public/auth/register.html
backend/public/auth/reset.html
backend/scripts/bootstrap-admin.js
backend/scripts/migrate-test.js
backend/src/app.js
backend/src/config/env.js
backend/src/controllers/auth.js
backend/src/controllers/records.js
backend/src/lib/errors.js
backend/src/lib/validation.js
backend/src/middlewares/security.js
backend/src/repositories/db.js
backend/src/repositories/records.js
backend/src/repositories/selectors.js
backend/src/routes/api.js
backend/src/server.js
backend/src/services/admin.js
backend/src/services/auth.js
backend/src/services/bootstrap.js
backend/src/services/mail.js
backend/src/services/passwords.js
backend/tests/integration.test.js
backend/tests/schema.test.js
backend/tests/unit.test.js
```

O `.env` local, dependências e saídas temporárias dos testes são ignorados e não integram a distribuição.
