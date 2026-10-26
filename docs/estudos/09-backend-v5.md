# 9. Backend V5 — comandos, arquivos e funcionamento

Este capítulo reúne a explicação do backend da V5 do dSaOl IT. A aplicação mantém o site público e acrescenta validação no servidor, autenticação real, painel administrativo e armazenamento em PostgreSQL.

Os comandos de terminal abaixo são referências para estudo. Não é necessário executar todos em sequência. Para instalar a aplicação, siga o [README do backend](../../backend/README.md), que informa os pré-requisitos e a ordem de configuração.

## 1. Frontend, backend e banco de dados

O **frontend** executa no navegador: páginas, botões, campos, cores e animações. Continua usando HTML, CSS e JavaScript.

O **backend** recebe os pedidos do navegador e decide o que pode acontecer. Ele verifica credenciais e permissões, valida entradas, consulta ou altera o banco e retorna respostas.

O **PostgreSQL** guarda os dados. O **Prisma** permite ao backend acessar esses dados usando JavaScript.

```mermaid
flowchart LR
    A["Navegador: HTML, CSS e JavaScript"] -->|Requisição HTTP| B["Backend: Node.js e Express"]
    B --> C["Prisma / driver PostgreSQL"]
    C --> D[(PostgreSQL no Docker)]
    D --> C
    C --> B
    B -->|Resposta JSON ou página| A
```

Na configuração local documentada, **Node.js executa o backend diretamente no computador e Docker executa PostgreSQL**. O backend não está dentro de um container.

## 2. Comandos de terminal e caminhos

Esses comandos preparam ou iniciam programas; não são todos código do site.

| Comando | O que faz |
|---|---|
| `node -v` | Mostra a versão do Node.js. |
| `npm.cmd -v` | Mostra a versão do gerenciador de pacotes npm. |
| `docker --version` | Mostra a versão do comando Docker. |
| `docker info` | Verifica a comunicação com o motor do Docker. |
| `cd backend` | Entra na pasta `backend`, a partir da pasta atual. |
| `cd ..` | Volta uma pasta. |
| `Test-Path backend\.env` | No PowerShell, verifica se o arquivo existe; retorna `True` ou `False`. |
| `npm.cmd ci` | Instala as versões de dependências registradas no arquivo de lock. |
| `npm.cmd run prisma:generate` | Gera o cliente JavaScript do Prisma. |

No Windows, `npm.cmd` evita o bloqueio do arquivo `npm.ps1` pelo PowerShell, sem precisar mudar a política de execução de scripts.

**Caminhos relativos dependem da pasta atual.** Se você estiver em `Documents`, o caminho `backend\.env` aponta para `Documents\backend\.env`. Se o projeto estiver em `Documents\Rafael\testeport`, entre primeiro nessa pasta:

```powershell
cd "$env:USERPROFILE\Documents\Rafael\testeport"
Test-Path backend\.env
```

Esse caminho é um exemplo baseado na organização usada durante a configuração. Ajuste se sua cópia estiver em outro lugar. Não crie outro `.env` apenas para contornar um erro de pasta.

## 3. Docker e PostgreSQL

Na raiz do projeto, este comando inicia o banco:

```powershell
docker compose --env-file backend/.env up -d postgres
```

| Parte | Significado |
|---|---|
| `docker compose` | Gerencia os serviços descritos em `compose.yaml`. |
| `--env-file backend/.env` | Lê as variáveis desse arquivo. |
| `up` | Cria ou inicia os serviços necessários. |
| `-d` | Deixa o serviço executando em segundo plano. |
| `postgres` | Seleciona o serviço chamado `postgres`. |

Para consultar o estado:

```powershell
docker compose --env-file backend/.env ps
```

O arquivo [compose.yaml](../../compose.yaml) usa:

```yaml
image: postgres:17-alpine
```

Uma **imagem** é o pacote usado para criar o ambiente. Um **container** é uma instância desse ambiente. Na primeira inicialização, Docker baixa a imagem se ela não estiver disponível.

A configuração de portas é:

```yaml
ports:
  - "127.0.0.1:5433:5432"
```

O backend conecta à porta **5433 do computador**, encaminhada à porta **5432 do container**. O endereço `127.0.0.1` representa o próprio computador e limita essa exposição ao acesso local.

A persistência usa:

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

O **volume** guarda os arquivos do banco separadamente do container. Parar o container não apaga os registros. Excluir o volume pode apagar esses dados; não use `down -v` para resolver problemas de conexão.

O `healthcheck` executa `pg_isready` periodicamente. O status **healthy** indica que essa verificação passou; não significa que todas as tabelas da aplicação já foram criadas.

## 4. O arquivo .env

O `.env` guarda configurações que variam entre computadores e ambientes.

| Variável | Função |
|---|---|
| `PORT` | Porta do backend, normalmente `3000`. |
| `APP_ORIGIN` | Origem permitida para o site: protocolo, endereço e porta. |
| `POSTGRES_USER` | Usuário usado para inicializar o banco pelo Docker. |
| `POSTGRES_PASSWORD` | Senha desse usuário. |
| `DATABASE_URL` | Conexão com o banco de desenvolvimento. |
| `TEST_DATABASE_URL` | Conexão com outro banco, exclusivo para testes. |
| `SESSION_SECRET` | Segredo usado para assinar o identificador de sessão no cookie. |
| `EMAIL_TRANSPORT` | Define mensagens locais de desenvolvimento ou entrega SMTP. |
| `CONTACT_REQUESTS_ENABLED` | Ativa ou desativa o registro opcional de orçamentos. |

Uma URL de banco segue este formato ilustrativo:

```text
postgresql://USUARIO:SENHA@ENDERECO:PORTA/BANCO
```

O [.env.example](../../backend/.env.example) documenta os campos usando placeholders. O `.env` contém os valores locais e fica excluído pelo `.gitignore`.

Os comandos de geração usados durante a configuração foram:

```powershell
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`node -e` executa um pequeno trecho JavaScript. `crypto.randomBytes` gera bytes aleatórios apropriados para segredos, e `toString('hex')` converte cada byte em dois caracteres hexadecimais. O primeiro comando gera 48 caracteres, e o segundo, 96. São valores independentes: um foi usado como senha local do banco e outro como segredo de sessão. **Não compartilhe as saídas nem o conteúdo do `.env`.**

O `config.js` do frontend é público e não deve conter segredos. Express não serve o `.env` aos visitantes.

## 5. Organização dos arquivos

| Arquivo ou pasta, relativo à raiz | Responsabilidade |
|---|---|
| `backend/package.json` | Dependências, versão do projeto e comandos. |
| `backend/package-lock.json` | Versões exatas das dependências e informações de integridade. |
| `backend/src/server.js` | Carrega a configuração, verifica o banco e inicia o servidor. |
| `backend/src/app.js` | Monta Express, sessões, proteções, rotas e arquivos públicos. |
| `backend/src/config/env.js` | Lê e valida a configuração do ambiente. |
| `backend/src/routes/api.js` | Associa endereços HTTP às funções que os atendem. |
| `backend/src/controllers/` | Recebe dados da requisição e prepara a resposta. |
| `backend/src/services/` | Implementa regras de autenticação, recuperação, administração e mensagens. |
| `backend/src/repositories/` | Centraliza operações de acesso aos registros. |
| `backend/src/middlewares/security.js` | Verifica sessão, permissão, origem e CSRF. |
| `backend/src/lib/validation.js` | Define formatos, campos obrigatórios e limites. |
| `backend/src/lib/errors.js` | Padroniza os erros retornados. |
| `backend/prisma/schema.prisma` | Descreve modelos e relacionamentos. |
| `backend/prisma/migrations/` | SQL versionado que cria ou altera a estrutura. |
| `backend/public/auth/` | Telas de login, cadastro e recuperação. |
| `backend/public/admin/` | Interface do painel administrativo. |
| `backend/scripts/` | Comandos auxiliares, incluindo bootstrap administrativo. |
| `backend/tests/` | Testes automatizados. |

Essa divisão separa responsabilidades. Em algumas operações simples, o controller acessa diretamente o repository. Nas que exigem regras adicionais, passa por um service.

O `package.json` define `"type": "module"`, permitindo `import` e `export`. Seus scripts incluem:

| Comando no backend, usando PowerShell | Efeito |
|---|---|
| `npm.cmd start` | Carrega `.env` e inicia `src/server.js`. |
| `npm.cmd run dev` | Inicia com observação de mudanças para desenvolvimento. |
| `npm.cmd run db:migrate` | Aplica as migrations versionadas no banco configurado. |
| `npm.cmd run db:migrate:test` | Aplica migrations no banco separado de testes. |
| `npm.cmd run admin:bootstrap` | Cria o primeiro ADMIN interativamente. |
| `npm.cmd test` | Executa os testes; requer configuração e bancos preparados. |

## 6. API, HTTP e rotas

A **API** é o conjunto de endereços que o frontend usa para solicitar operações. No projeto, `/api/v1` é o prefixo das rotas. `v1` identifica a versão da API, independentemente de o projeto estar na V5.

| Método e endereço | Operação |
|---|---|
| `POST /api/v1/auth/register` | Criar conta comum. |
| `POST /api/v1/auth/login` | Entrar na conta. |
| `GET /api/v1/auth/me` | Consultar o usuário autenticado. |
| `POST /api/v1/auth/logout` | Encerrar sessão. |
| `GET /api/v1/admin/customers` | Listar clientes como ADMIN. |
| `POST /api/v1/admin/customers` | Criar cliente. |
| `PUT /api/v1/admin/customers/:id` | Atualizar cliente. |
| `DELETE /api/v1/admin/customers/:id` | Excluir cliente. |

`GET`, `POST`, `PUT`, `PATCH` e `DELETE` são métodos HTTP. Ajudam a indicar consulta, criação, substituição, alteração parcial ou exclusão. `:id` é um parâmetro variável que identifica o registro escolhido.

Trecho do projeto em `src/routes/api.js`:

```javascript
router.post('/admin/customers', records.createCustomer);
```

Ele conecta uma requisição POST para esse caminho à função `createCustomer`. O prefixo `/api/v1` é aplicado em `app.js`.

O controller contém:

```javascript
createCustomer: async (req, res) =>
  res.status(201).json({
    data: await repo.createCustomer(
      parse(schemas.customer, req.body)
    )
  }),
```

Lendo de dentro para fora:

1. `req.body` contém os dados recebidos.
2. `parse(schemas.customer, ...)` valida os campos.
3. `repo.createCustomer(...)` solicita a gravação.
4. `await` aguarda essa operação.
5. `res.status(201)` indica registro criado.
6. `.json(...)` envia a resposta em JSON.

**JSON** é um formato textual de dados usado na comunicação. Exemplo didático:

```json
{
  "data": {
    "name": "Cliente Fictício",
    "email": "cliente@example.test"
  }
}
```

O registro real retornado também inclui identificador e datas. Na interface, `fetch` faz requisições, e `JSON.stringify` converte objetos JavaScript em JSON para envio.

## 7. Prisma e estrutura do banco

O repository usa:

```javascript
createCustomer: data => db.customer.create({ data }),
```

Prisma transforma essa operação em uma consulta para PostgreSQL. Não é necessário montar manualmente uma string SQL para esse cadastro.

No modelo `User`, este campo aparece no schema:

```prisma
email String @unique @db.VarChar(254)
```

- `email`: nome do campo.
- `String`: valor textual.
- `@unique`: impede repetição nessa tabela.
- `@db.VarChar(254)`: limita o campo no PostgreSQL.

Outros termos do schema:

| Termo | Significado |
|---|---|
| `@id` | Chave primária do registro. |
| `@default(uuid())` | Prisma gera um identificador UUID por padrão. |
| `String?` | Campo textual opcional. |
| `@default(now())` | Data/hora atual como valor padrão. |
| `@updatedAt` | Prisma atualiza essa data nas alterações. |
| `@@index(...)` | Índice para ajudar determinadas consultas. |

Os modelos são:

| Modelo | O que guarda |
|---|---|
| `User` | Contas, hash da senha e perfil de acesso. |
| `Customer` | Clientes. |
| `Project` | Projetos vinculados a clientes. |
| `ContactRequest` | Solicitações registradas com consentimento. |
| `Session` | Sessões de acesso. |
| `PasswordResetToken` | Hash de tokens temporários de recuperação. |

Uma conta `User` e um cliente `Customer` são registros distintos. Criar uma conta não cria automaticamente um cliente.

Um projeto aponta para um cliente por `customerId`. A restrição `onDelete: Restrict` impede excluir um cliente enquanto houver projetos vinculados.

**Gerar o cliente Prisma não cria as tabelas.** `prisma:generate` gera código para acesso aos modelos; `db:migrate` aplica as migrations no banco. Uma migration é um conjunto versionado de mudanças de estrutura, como criar tabelas, índices e chaves estrangeiras.

## 8. Login, senha e sessão

O fluxo de login é:

1. O navegador envia e-mail e senha.
2. O backend valida o formato dos dados.
3. Consulta a conta pelo e-mail.
4. Argon2id verifica a senha contra o hash armazenado.
5. Se estiver correto, o servidor regenera a sessão.
6. Salva o identificador do usuário nessa sessão.
7. Retorna um cookie que identifica a sessão.

O backend guarda um **hash**, não a senha original. No login, verifica a correspondência da senha com esse hash. Um hash de senha não é um texto que a aplicação descriptografa para recuperar a senha original.

A sessão fica no PostgreSQL. O cookie contém seu identificador, sem guardar a senha ou um token de autenticação no `localStorage`.

| Configuração | Efeito |
|---|---|
| `HttpOnly` | Impede leitura do cookie pelo JavaScript da página. |
| `SameSite=Lax` | Restringe seu envio em determinados contextos entre sites. |
| `Secure` em produção | Exige HTTPS para enviar o cookie. |
| Validade de oito horas | Limite configurado para o cookie. |

No logout, o servidor destrói a sessão e limpa o cookie. O cadastro público cria somente `USER`. O primeiro `ADMIN` é criado pelo comando interativo de bootstrap, sem credenciais administrativas fixas.

## 9. Validação, permissões e segurança

A validação no navegador melhora a experiência, mas pode ser contornada. O backend valida tudo novamente.

| Proteção | Finalidade |
|---|---|
| Zod | Verificar formatos, campos obrigatórios e limites. |
| `requireAuth` | Exigir sessão válida. |
| `requireAdmin` | Exigir perfil ADMIN. |
| CSRF | Exigir token vinculado à sessão nas operações que alteram dados. |
| Verificação de origem | Recusar requisições com origem diferente da configurada. |
| Rate limiting | Limitar tentativas repetidas, como login e cadastro. |
| Helmet | Configurar cabeçalhos de proteção do navegador. |
| Seleção de campos públicos | Evitar retornar `passwordHash` nas respostas. |

**Autenticação** responde quem é a pessoa. **Autorização** determina o que ela pode fazer. Um usuário pode estar autenticado e receber 403 ao tentar acessar o painel.

Um **middleware** é uma função executada no caminho da requisição. Pode validar algo, acrescentar informações ou interromper o atendimento. `next()` encaminha para a próxima etapa.

O helper `public/auth/api.js` consulta o token CSRF quando necessário, mantém esse token em memória e inclui o header `X-CSRF-Token` nas operações de escrita. O token CSRF é renovado no login, junto com a regeneração da sessão.

| Código HTTP | Significado no contexto da aplicação |
|---|---|
| `200` | Operação concluída. |
| `201` | Registro criado. |
| `204` | Operação concluída sem conteúdo de resposta. |
| `400` | Dados inválidos. |
| `401` | Autenticação necessária ou credenciais inválidas. |
| `403` | Acesso ou operação recusada. |
| `404` | Recurso não encontrado. |
| `409` | Conflito, como relacionamento que impede exclusão. |
| `429` | Limite de requisições atingido. |

Essas proteções fazem parte do laboratório; não representam uma garantia de segurança para qualquer publicação. Limitações e requisitos de produção estão no README do backend.

## 10. WhatsApp, solicitações e recuperação de senha

O WhatsApp continua independente: o frontend prepara a mensagem e abre o aplicativo ou site para confirmação manual.

Registrar uma solicitação no banco exige outra ação: o visitante autoriza o armazenamento e clica em **Registrar solicitação no site**, quando essa integração está habilitada. Abrir o WhatsApp não comprova envio; registrar no banco também não envia a mensagem.

O frontend envia uma `Idempotency-Key`. Repetir a mesma chave com os mesmos dados reutiliza o registro existente. Isso evita duplicações da mesma tentativa; não impede uma nova solicitação feita com outra chave.

Na recuperação de senha, o backend gera um token aleatório, guarda somente seu hash e define validade de 15 minutos. O token tem uso único. Após trocar a senha, as sessões anteriores são invalidadas.

Com `EMAIL_TRANSPORT=file`, a mensagem fica na pasta privada `backend/.mail/` para estudos. Isso não entrega um e-mail real. Entrega real depende de SMTP configurado e testado. Não compartilhe os arquivos dessa pasta nem os tokens.

## 11. Termos de JavaScript

| Termo | Uso no projeto |
|---|---|
| `import` / `export` | Compartilhar funções entre arquivos. |
| `const` | Declarar variável que não será reatribuída; um objeto declarado com `const` ainda pode ter propriedades alteradas. |
| `async` | Declarar função que retorna uma Promise e permite usar `await`. |
| `await` | Aguardar uma operação assíncrona sem bloquear toda a execução do servidor. |
| `=>` | Sintaxe de função chamada arrow function. |
| `req` | Requisição recebida pelo Express. |
| `res` | Resposta enviada pelo Express. |
| `next()` | Encaminhar ao próximo middleware. |
| `throw` | Sinalizar um erro. |
| `try` / `catch` | Executar código e tratar falhas. |
| `process.env` | Acessar variáveis de ambiente do processo. |
| `fetch` | Fazer requisição HTTP no frontend. |
| `JSON.stringify` | Converter dados JavaScript em texto JSON. |

## 12. Como estudar o fluxo completo

Comece pelo login:

```text
Tela de login
→ backend/public/auth/auth.js
→ backend/public/auth/api.js
→ backend/src/routes/api.js
→ backend/src/controllers/auth.js
→ backend/src/services/auth.js
→ PostgreSQL, por meio do Prisma
```

Depois acompanhe o cadastro de clientes. Identifique o clique, a requisição, a validação, a autorização, a gravação e a resposta na tela.

Exercícios para uma cópia local de estudo, usando somente dados fictícios:

1. Localize a regra que exige pelo menos 12 caracteres na senha.
2. Identifique onde o cadastro fixa `role: 'USER'`.
3. Encontre o middleware que exige ADMIN nas rotas administrativas.
4. Após preparar os bancos, crie um cliente e um projeto vinculado. Tente excluir o cliente e observe o conflito de integridade referencial.
5. Reinicie o backend e confirme que os registros continuam no banco.

Esses exercícios exigem banco inicializado, migrations aplicadas e, quando necessário, uma conta administrativa criada pelo CLI. Live Server e GitHub Pages não executam a API.

[Voltar ao índice](README.md) · [Instalação, testes e limitações da V5](../../backend/README.md)
