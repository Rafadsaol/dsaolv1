# 10. Testes manuais da V5 — registro e roteiro de repetição

Este capítulo documenta os testes da V5 confirmados pela pessoa responsável pelo projeto no Windows, durante a configuração acompanhada na conversa. O registro foi consolidado em **26/10/2026**.

O objetivo é registrar o que foi observado e permitir repetir os testes em outra cópia de estudo. Os resultados manuais abaixo foram relatados pela pessoa usuária; não representam acesso remoto do assistente ao computador nem uma nova execução dos testes ao escrever este documento.

## 1. Ambiente e limites da validação

| Componente | Ambiente informado ou observado na conversa |
|---|---|
| Sistema | Windows, terminal PowerShell do VS Code |
| Repositório | `Rafadsaol/testeport`, branch `v5-fullstack` |
| Node.js | 24.22.1 |
| npm | 11.19.1, executado como `npm.cmd` |
| Docker | 29.9.2, Docker Desktop com motor Linux/WSL2 |
| Banco | PostgreSQL, imagem `postgres:17-alpine`, porta local 5433 |
| Backend e site | Node.js/Express, origem configurada `http://127.0.0.1:3000` |
| Recuperação de senha | `EMAIL_TRANSPORT=file`, mensagem em arquivo local |
| Solicitações | `CONTACT_REQUESTS_ENABLED=true` durante o teste |

O banco de desenvolvimento é `dsaol_dev`. Os testes automatizados usam outro banco, `dsaol_test`. Não utilize um banco de produção para os exercícios.

**Este registro confirma funcionamento local.** Entrega real de e-mail, hospedagem pública, HTTPS de produção e backup/restauração não foram validados por essas etapas.

## 2. Como interpretar os resultados

- **Confirmado manualmente:** a pessoa usuária informou que o roteiro funcionou em seu computador.
- **Automatizado:** há execução anterior da suíte, distinguida na seção 5.
- **Pendente manualmente:** o comportamento não foi confirmado separadamente na conversa, mesmo que exista cobertura automatizada.

Um resultado esperado descreve o que a aplicação deve fazer. Ele não comprova, sozinho, que o teste foi executado. Uma confirmação geral de um fluxo também não comprova todos os casos de erro possíveis desse fluxo.

## 3. Preparação para repetir os testes

Use uma cópia conectada ao Git na branch `v5-fullstack`, com dependências instaladas, `.env` configurado, cliente Prisma gerado e migrations aplicadas. A instalação está no [README do backend](../../backend/README.md); os conceitos estão no [capítulo 9](09-backend-v5.md).

Para iniciar o PostgreSQL, deixe Docker Desktop aberto e execute **na raiz do projeto**:

```powershell
docker compose --env-file backend/.env up -d postgres
docker compose --env-file backend/.env ps
```

Resultado esperado: serviço `postgres` com status `healthy`. Isso confirma a verificação de disponibilidade do PostgreSQL, sem comprovar que as tabelas da aplicação já existem.

Para iniciar a aplicação, execute **dentro de `backend`**:

```powershell
cd backend
npm.cmd start
```

Se já estiver em `backend`, não execute `cd backend` novamente. Mantenha esse terminal aberto. Para parar, pressione **Ctrl+C**. Uma mudança no `.env` exige reiniciar o backend.

Endereços usados no laboratório:

| Tela | Endereço |
|---|---|
| Site público | `http://127.0.0.1:3000/` |
| Login | `http://127.0.0.1:3000/auth/login.html` |
| Painel | `http://127.0.0.1:3000/admin/` |
| Recuperação | `http://127.0.0.1:3000/auth/forgot.html` |

Use a origem exata configurada no `.env`. Trocar `127.0.0.1` por `localhost` pode causar rejeição por origem diferente.

### Dados fictícios para novas execuções

Os exemplos abaixo são dados sugeridos para repetir os testes; não são uma transcrição dos dados usados anteriormente.

| Campo | Exemplo |
|---|---|
| Nome de cliente | `Cliente de Estudos` |
| E-mail do cliente | `cliente@example.test` |
| Título de projeto | `Site demonstrativo` |
| Descrição do projeto | `Projeto fictício para verificar o cadastro e o relacionamento com clientes.` |
| Nome de visitante | `Visitante de Estudos` |
| E-mail do visitante | `visitante@example.test` |
| Telefone ilustrativo para validação de formato | `(41) 91234-5678` |
| Descrição de orçamento | `Solicitação fictícia para testar o registro de orçamento no laboratório.` |

Use o telefone ilustrativo apenas no formulário local, sem iniciar contato ou enviar mensagens. Use uma senha exclusiva escolhida localmente, com 12 a 128 caracteres. Não registre senhas, tokens, cookies de sessão ou conteúdo do `.env` neste documento, em commits ou capturas.

## 4. Casos manuais confirmados

### M01 — Acesso administrativo

**Pré-condição:** conta ADMIN criada pelo CLI. As credenciais do PostgreSQL não são as credenciais do login da aplicação.

1. Se ainda não houver administrador, execute `npm.cmd run admin:bootstrap` em um terminal interativo dentro de `backend`.
2. Informe nome, e-mail e senha; confirme a senha. A entrada fica oculta, sem asteriscos.
3. Aguarde a confirmação de criação. Se já houver ADMIN, não recrie a conta; use o login ou a recuperação.
4. Inicie o servidor e abra a página de login.
5. Entre com as credenciais da conta administrativa.

**Resultado esperado:** login aceito e acesso ao painel.

**Resultado registrado:** confirmado manualmente. Após dificuldades iniciais no bootstrap, a pessoa usuária informou que realizou o login. A mensagem genérica do CLI foi posteriormente refinada para distinguir causas sem expor segredos.

Isso confirma acesso com credenciais válidas. Senha incorreta, logout e bloqueio de USER são casos separados na seção 6.

### M02 — Clientes e projetos

**Pré-condição:** ADMIN autenticado no painel.

1. Em **Clientes**, cadastre um cliente fictício.
2. Em **Projetos**, cadastre um projeto com descrição válida e selecione o cliente criado.
3. Defina o status como **Em andamento** e salve.
4. Consulte as listagens para conferir os registros e o vínculo entre projeto e cliente.

**Resultado esperado:** registros criados, projeto associado ao cliente e status correto.

**Resultado registrado:** confirmado manualmente como parte do roteiro do painel que a pessoa usuária informou ter ocorrido perfeitamente.

### M03 — Indicadores e persistência após atualizar a página

1. Após criar os registros de M02, abra **Dashboard**.
2. Confira os indicadores de clientes, projetos e projetos em andamento.
3. Atualize a página com **F5**.
4. Volte às listagens e confira se os registros continuam disponíveis.

**Resultado esperado:** indicadores refletem os registros reais e os dados continuam disponíveis após F5. Considere outros registros existentes; não espere obrigatoriamente totais iguais a um.

**Resultado registrado:** confirmado manualmente no mesmo roteiro do painel.

F5 recarrega a página. Esse teste não equivale a reiniciar Windows ou Docker, nem a restaurar um backup.

### M04 — Integridade referencial e exclusão

1. Com o projeto de M02 ainda vinculado, tente excluir seu cliente e confirme a tentativa no diálogo.
2. Observe a mensagem de bloqueio e confira que cliente e projeto continuam presentes.
3. Para limpar os dados de teste, exclua primeiro o projeto, confirmando a exclusão.
4. Depois exclua o cliente, também com confirmação.

**Resultado esperado:** a primeira exclusão é impedida por relacionamento existente. Após remover o projeto, a exclusão do cliente pode ocorrer. Nenhum projeto deve desaparecer automaticamente ao tentar excluir o cliente.

**Resultado registrado:** confirmado manualmente no roteiro do painel, incluindo a proteção dos relacionamentos.

Execute apenas com registros fictícios criados para esse exercício. Não apague registros de outras pessoas para preparar o teste.

### M05 — Registro opcional de orçamento

**Pré-condição:** `CONTACT_REQUESTS_ENABLED=true` no `.env`, backend reiniciado e página atualizada.

1. Abra o site e vá até **Orçamento**.
2. Preencha os campos obrigatórios com dados fictícios válidos; use descrição de pelo menos 20 caracteres.
3. Marque a ciência exigida pelo formulário e a autorização específica de **Registro opcional no site**.
4. Clique em **Registrar solicitação no site**.
5. Confira o feedback e abra **Solicitações** no painel.
6. Localize o registro e confira os campos enviados.

**Resultado esperado:** solicitação registrada no PostgreSQL e disponível ao administrador. O registro envia nome, e-mail, telefone, serviço e descrição; empresa não integra esse registro do backend.

**Resultado registrado:** confirmado manualmente. A pessoa usuária informou que a solicitação foi registrada.

Durante o acompanhamento, uma captura também mostrou o WhatsApp aberto com uma mensagem preparada. Essa observação confirma a abertura do destino com o texto, mas não confirma envio ou entrega da mensagem. O registro no banco foi confirmado separadamente. Não é necessário abrir ou enviar WhatsApp para repetir M05.

### M06 — Alteração de status da solicitação

1. Em **Solicitações**, localize o registro de M05.
2. Use **Atualizar status** e selecione outro status, como **Em análise**.
3. Salve e atualize a página.
4. Confira o status novamente.

**Resultado esperado:** alteração salva e preservada após recarregar.

**Resultado registrado:** confirmado manualmente após a orientação de alterar o status e atualizar a página.

### M07 — Recuperação e redefinição de senha local

**Pré-condição:** conta existente e `EMAIL_TRANSPORT=file`. Se mudar essa configuração, reinicie o backend.

1. Abra `/auth/forgot.html` e solicite recuperação para uma conta do laboratório.
2. No editor local, abra a mensagem correspondente mais recente em `backend/.mail/`.
3. Copie apenas o endereço completo de recuperação para o navegador, sem aspas ou caracteres extras.
4. Defina uma nova senha válida.
5. Volte ao login e entre com a nova senha.

**Resultado esperado:** arquivo local gerado, link permite redefinição e nova senha permite login. Nenhum e-mail real é enviado nesse modo.

**Resultado registrado:** a pessoa usuária confirmou as etapas desse fluxo como validadas.

O comportamento de expiração em 15 minutos, rejeição de reutilização do link, recusa da senha anterior e invalidação de outras sessões não foi confirmado manualmente de forma individual na conversa. Parte dessas condições possui cobertura automatizada, descrita a seguir. Não compartilhe a mensagem local ou o link: ele contém um token de recuperação.

## 5. Testes automatizados: evidências separadas

Foram observadas execuções distintas:

| Execução anterior | Evidência registrada |
|---|---|
| Windows da pessoa usuária, antes da melhoria das mensagens do bootstrap | Captura do terminal: **17 testes, 17 aprovados, 0 falhas, 0 ignorados**. |
| Ambiente na nuvem, após a melhoria do bootstrap | Saída da suíte: **18 testes, 18 aprovados, 0 falhas, 0 ignorados**. |

O teste adicional verifica mensagens seguras de diagnóstico do bootstrap. Os números incluem o agrupador da integração; não significam 18 testes manuais independentes. Não houve confirmação de nova execução dos 18 testes no Windows após essa atualização.

As execuções automatizadas anteriores cobrem cadastro público, login/logout, senha incorreta, bloqueio de USER, CSRF, validação, bootstrap, CRUD, integridade do banco, idempotência de solicitação, persistência após recriar a aplicação e recuperação com expiração e uso único. A cobertura detalhada está em [tests/integration.test.js](../../backend/tests/integration.test.js), [tests/unit.test.js](../../backend/tests/unit.test.js) e [tests/schema.test.js](../../backend/tests/schema.test.js).

Para repetir, com dependências, cliente Prisma, migrations e banco de testes preparados, execute **dentro de `backend`**:

```powershell
npm.cmd test
```

A suíte exige `TEST_DATABASE_URL` apontando para um banco separado terminado em `_test`, sem administrador anterior. Ela cria e remove seus próprios registros fictícios. Não altere essa URL para o banco de desenvolvimento para contornar falhas e não apague tabelas ou volumes para fazer o teste passar.

Ao escrever este capítulo, apenas a documentação foi alterada. Não houve nova execução da suíte ou do navegador.

## 6. Verificações ainda pendentes

Os casos abaixo são propostas de repetição ou expansão da validação, não resultados aprovados neste registro:

| Caso | Situação manual / próxima verificação |
|---|---|
| Cadastro USER, senha incorreta, logout e USER tentando acessar ADMIN | Sem confirmação manual específica; há cobertura automatizada anterior. |
| Busca, filtros, paginação e edição de clientes/projetos | Sem confirmação manual individual. O roteiro confirmado focou cadastro, relacionamento, indicadores e exclusão. |
| Validação de todos os campos e tentativa de registro sem consentimento | Sem confirmação manual de cada caso inválido. |
| Duplo clique ou repetição da mesma solicitação | Sem confirmação manual específica de idempotência; há cobertura automatizada anterior. |
| Backend indisponível e formulário WhatsApp | Sem confirmação manual nesse Windows; há verificação anterior de interface na nuvem com respostas isoladas de teste. |
| Link expirado, reutilização, senha antiga e outras sessões após redefinição | Sem confirmação manual individual. Consulte a suíte para os casos automatizados efetivamente cobertos. |
| Teclado, foco, contraste, telas pequenas e celular físico | Sem confirmação manual detalhada nesse ambiente. Verificações anteriores no Chromium estão descritas no README do backend. |
| Reinício do computador/Docker e retomada dos dados | Não confirmado manualmente. O teste automatizado de recriação da aplicação tem alcance diferente. |
| Entrega real de e-mail via SMTP | Pendente; o fluxo local em arquivo não comprova entrega. |
| Backup e restauração em outro banco | Pendente; ainda não foi executado como exercício. |
| HTTPS, cookies Secure e configuração de hospedagem | Pendentes para produção; não houve deploy da V5. |

O `.env` apareceu em uma captura durante a configuração. A substituição desses segredos permanece uma pendência antes de uso público. Trocar apenas `POSTGRES_PASSWORD` no arquivo não altera a senha já cadastrada no PostgreSQL. Não registre os valores antigos ou novos na documentação.

## 7. Problemas encontrados e como foram resolvidos

| Sintoma observado | Causa identificada / ação |
|---|---|
| PowerShell bloqueou `npm.ps1` | Usar `npm.cmd`, sem alterar a política de scripts. |
| `docker info` mostrou falha no motor Linux | Abrir Docker Desktop e aguardar inicialização; depois a seção Server ficou disponível. |
| Docker não encontrou `backend/.env` | Comando executado em `Documents`; entrar na raiz correta do projeto. |
| `git` não reconhecido | Instalar Git e reabrir VS Code. |
| `not a git repository` | A pasta não tinha metadados Git; clonar `v5-fullstack` em outra pasta, preservando a anterior. |
| npm não encontrou `package.json` | `npm.cmd start` deve ser executado dentro de `backend`. |
| Nome do administrador preenchido com um comando | Responder às perguntas do CLI com os dados solicitados; executar `npm.cmd start` somente depois de concluir o bootstrap. |
| Senha não apareceu ao digitar no CLI | Comportamento esperado da entrada oculta. |
| Bootstrap exibiu erro genérico | A causa daquela tentativa não foi determinada pela captura; mensagens de diagnóstico foram melhoradas e enviadas ao GitHub. O acesso administrativo foi confirmado posteriormente. |
| WhatsApp abriu durante o teste do orçamento | Distinguir o botão de WhatsApp do botão separado de registro no site. |

## 8. Modelo para registrar a próxima execução

Copie o modelo abaixo para suas anotações e preencha somente o que observar. Para obter o identificador da versão, use `git rev-parse --short HEAD`; ele não contém credenciais.

```text
Data:
Ambiente / navegador:
Branch e commit:
Caso de teste (ex.: M05):
Pré-condições:
Passos executados:
Resultado esperado:
Resultado observado:
Status: aprovado / falhou / não executado
Evidência sem dados privados:
Pendência ou correção necessária:
```

Se um teste falhar, registre a mensagem e as etapas que a reproduzem. Preserve os dados antes de investigar; não use reset, truncate ou exclusão de volumes como primeira tentativa de correção.

[Voltar ao índice](README.md) · [Como funciona o backend](09-backend-v5.md) · [Instalação e limitações da V5](../../backend/README.md)
