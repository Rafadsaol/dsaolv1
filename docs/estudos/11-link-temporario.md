# 11. Compartilhar a V5 por um link temporário

Este roteiro usa **Cloudflare Quick Tunnel** no Windows. O endereço HTTPS encaminha requisições para o Node.js no seu computador. PostgreSQL permanece no Docker local e não precisa ser exposto à internet. Não é uma hospedagem permanente: computador, Docker, backend e túnel precisam permanecer ligados.

**Registro de 26/10/2026:** o cloudflared foi identificado no Windows, o túnel registrou conexão e a pessoa usuária confirmou o funcionamento pelo link temporário. O relato e seus limites estão na seção [Resultado da sessão](#resultado-da-sessão--26102026).

O link é público para quem o conhecer, sem uma lista de convidados configurada por este roteiro. Login e autorização ADMIN continuam sendo exigidos para o painel. Compartilhe apenas com as pessoas escolhidas, por uma janela curta, e use dados fictícios. Tráfego passa pelo serviço Cloudflare.

## Antes de abrir o túnel

- Atualize a branch `v5-fullstack` com `git pull --ff-only`. O ajuste de cookies é necessário: uma origem HTTPS usa cookie Secure mesmo no laboratório.
- Confirme que o site funciona localmente com PostgreSQL disponível e migrations aplicadas.
- Não use dados de clientes reais. Cadastro público cria USER, sem acesso administrativo.
- Se o painel fizer parte do teste, use uma conta administrativa exclusiva deste laboratório, com senha não reutilizada. Não compartilhe uma conta pessoal ou credenciais do banco. O projeto não oferece promoção de permissões no navegador nem criação de um segundo ADMIN pelo bootstrap.
- Os segredos do `.env` apareceram em uma captura durante o acompanhamento. Substitua-os antes de compartilhar, conforme a seção a seguir. Não envie o `.env` a ninguém.

## 1. Substituir os segredos locais expostos

Pare o backend com **Ctrl+C**. Gere uma nova senha aleatória para o PostgreSQL usando o comando abaixo. A saída é privada; guarde-a localmente, sem publicá-la:

```powershell
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))" | Set-Clipboard
```

Com Docker Desktop e o serviço PostgreSQL funcionando, na raiz do projeto, entre no console do banco:

```powershell
docker compose --env-file backend/.env exec postgres psql -U dsaol_local -d dsaol_dev
```

O comando de geração copia a senha para a área de transferência do Windows, sem imprimi-la. Os nomes acima são os padrões do projeto; ajuste se mudou usuário ou banco. Dentro do console `psql`, execute:

```text
\password dsaol_local
```

Cole a nova senha com Ctrl+V e confirme quando solicitado. A entrada fica oculta. Depois execute `\q` para sair. O comando interativo evita colocar a senha em argumentos de shell ou SQL escrito no terminal.

Atualize **localmente** `POSTGRES_PASSWORD`, `DATABASE_URL` e `TEST_DATABASE_URL` no `.env` com a mesma nova senha. Não altere os nomes ou portas dos bancos. Se as URLs usam o mesmo usuário, ambas precisam da atualização.

Gere outro segredo independente:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))" | Set-Clipboard
```

Use-o em `SESSION_SECRET`. Isso invalida o uso dos cookies assinados com o segredo anterior; será necessário entrar novamente. Salve e confirme que o backend conecta ao banco.

Alterar somente o `.env` não troca a senha já cadastrada no PostgreSQL. Não apague o volume Docker para realizar a troca.

## 2. Instalar cloudflared no Windows

Em um terminal PowerShell:

```powershell
winget install --id Cloudflare.cloudflared --exact
```

Revise a instalação apresentada pelo Windows. Depois abra um novo terminal ou reinicie o VS Code caso o programa não seja encontrado e confira:

```powershell
cloudflared --version
```

Se `winget` não estiver disponível, use a [documentação oficial de downloads](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/). Consulte também o [guia oficial de Quick Tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/). A instalação no computador da pessoa usuária não foi executada pelo assistente.

## 3. Manter dois terminais abertos

No **terminal A**, dentro de `backend`, inicie a aplicação:

```powershell
npm.cmd start
```

No **terminal B**, execute:

```powershell
cloudflared tunnel --url http://127.0.0.1:3000
```

O comando mostra uma URL HTTPS temporária sob o domínio `trycloudflare.com`. Copie a URL real gerada; não existe um endereço fixo incluído neste documento. Não compartilhe ainda: configure a origem primeiro.

Não é necessário abrir a porta 5433 no roteador nem criar um túnel para PostgreSQL. O destino deste túnel é apenas o servidor web na porta 3000.

## 4. Configurar a origem pública

Mantenha o terminal B aberto. Pare somente o backend no terminal A com **Ctrl+C**. No `backend/.env`, configure:

```dotenv
NODE_ENV=development
HOST=127.0.0.1
PORT=3000
TRUST_PROXY=1
EMAIL_TRANSPORT=file
```

Em `APP_ORIGIN`, substitua o endereço local pela URL HTTPS real gerada pelo cloudflared, sem barra final e sem caminhos adicionais. Não substitua `DATABASE_URL` pelo endereço público: o banco continua local.

`TRUST_PROXY=1` permite reconhecer o protocolo HTTPS encaminhado pelo proxy imediatamente à frente do Express. Neste roteiro, Node continua vinculado a `127.0.0.1`, e o cloudflared local encaminha as requisições. Essa configuração não é uma recomendação para qualquer cadeia de proxies ou servidor exposto diretamente.

Este é um teste temporário de desenvolvimento, com mensagens de recuperação em arquivo privado local. Não desative a exigência de SMTP do modo de produção para simular uma publicação pronta. Na hospedagem permanente, serão necessários HTTPS e entrega real de e-mail configurados e testados.

Salve o `.env` e reinicie no terminal A:

```powershell
npm.cmd start
```

Agora acesse o site pela URL pública. Enquanto ela estiver em `APP_ORIGIN`, faça login, cadastro e outras operações por essa URL: usar simultaneamente a origem local pode produzir **Origem não permitida**. O cookie Secure da origem HTTPS não é usado para login pelo endereço HTTP local.

## 5. Conferir e enviar o link

Antes de convidar alguém, confira pela URL pública:

1. Landing page e demonstrações abrem.
2. Login funciona e mantém a sessão ao navegar.
3. Sem autenticação, `/admin/` solicita login; USER não ganha acesso administrativo.
4. Se `CONTACT_REQUESTS_ENABLED=true`, dados fictícios podem ser registrados com consentimento explícito e aparecem no painel.
5. Em outro dispositivo, de preferência em outra rede, o site abre pelo mesmo endereço HTTPS.

Depois compartilhe a URL real e diga quais partes testar. Para acessar login, acrescente `/auth/login.html` ao endereço. A sessão do seu navegador não é compartilhada automaticamente com a pessoa que recebe o link.

Use o [roteiro de testes manuais](10-testes-manuais-v5.md). Não envie mensagens reais de WhatsApp nos exercícios. Com `EMAIL_TRANSPORT=file`, e-mails de recuperação continuam apenas no seu computador; não prometa entrega aos testadores nem publique tokens para contornar isso.

## 6. Encerrar e voltar ao acesso local

1. No terminal B, pressione **Ctrl+C** para encerrar o túnel.
2. Pare o backend no terminal A.
3. Restaure no `.env`:

```dotenv
APP_ORIGIN=http://127.0.0.1:3000
TRUST_PROXY=0
```

4. Para continuar localmente, execute `npm.cmd start` dentro de `backend`.

Os dados permanecem no PostgreSQL. Ao criar outro Quick Tunnel, use a nova URL em `APP_ORIGIN` e reinicie o backend. Não espere que o endereço anterior continue válido.

## Diagnóstico

| Sintoma | Verificação |
|---|---|
| `cloudflared` não encontrado | Reabrir terminal/VS Code após instalar e conferir `cloudflared --version`. |
| Túnel não conecta | Conferir saída do cloudflared, conexão e políticas de rede/firewall. Não desativar verificações TLS. |
| Erro de conexão com o serviço local | Confirmar Node na porta 3000 e Docker/PostgreSQL funcionando. |
| Origem não permitida | Usar a URL pública exata em `APP_ORIGIN`, sem barra final, e reiniciar Node. |
| Login perde sessão | Conferir atualização do código, acesso por HTTPS e `TRUST_PROXY=1`; não remover Secure para contornar. |
| Túnel não cria URL temporária por configuração existente | Consultar Quick Tunnels e configuração existente do cloudflared. Não apagar arquivos de outros túneis. |
| Backend exibe apenas “Não foi possível iniciar” | Separar diagnóstico de configuração e conexão com o banco, conforme abaixo; a mensagem genérica não identifica a causa. |

### Diagnóstico local sem imprimir credenciais

Execute dentro de `backend`, um comando por vez. O primeiro valida as configurações. As mensagens de `loadConfig` indicam campos ou regras inválidos, sem imprimir seus valores:

```powershell
node --env-file=.env --input-type=module -e "import {loadConfig} from './src/config/env.js'; try { loadConfig(); console.log('Configuração válida.'); } catch(e) { console.log(e.message); }"
```

O segundo apenas consulta PostgreSQL e mostra o código de erro, sem exibir a URL de conexão:

```powershell
node --env-file=.env --input-type=module -e "import pg from 'pg'; const db=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:5000}); try { await db.connect(); await db.query('SELECT 1'); console.log('Banco conectado.'); } catch(e) { console.log('Falha no banco. Código:',e.code); } finally { await db.end(); }"
```

Se aparecer `28P01`, a autenticação no PostgreSQL foi recusada; confira se o usuário e a senha das URLs correspondem ao banco. Esse código não foi informado como resultado da sessão acompanhada e não deve ser tratado como a causa confirmada daquele erro.

## Resultado da sessão — 26/10/2026

| Etapa | Evidência registrada |
|---|---|
| Instalação no Windows | A captura de `cloudflared --version` mostrou **2026.10.4**. O winget informou que o pacote já estava instalado e sem atualização disponível. |
| Configuração privada | Após as orientações de troca dos segredos, a pessoa usuária informou “Salvo”. Os valores não são registrados aqui; o assistente não verificou diretamente o `.env` local. |
| Conexão do túnel | A saída apresentada mostrou verificações de conectividade aprovadas e `Registered tunnel connection`, usando QUIC. |
| Endereço público | Foi obtida uma URL HTTPS em `trycloudflare.com`. O endereço não é mantido como link de acesso na documentação porque é temporário e pode deixar de funcionar. |
| Origem e proxy | Foram orientados `APP_ORIGIN` com a URL HTTPS exata, sem barra final, `TRUST_PROXY=1` e reinício somente do backend, mantendo o túnel aberto. |
| Falha intermediária | O backend mostrou a mensagem genérica de inicialização. Foram fornecidos os comandos de diagnóstico acima. A pessoa usuária informou ter resolvido; a causa e a alteração exata não foram relatadas. |
| Resultado final | A pessoa usuária confirmou que funcionou e encerrou a sessão de testes por hoje. |

Essa confirmação registra funcionamento do acesso temporário relatado pela pessoa usuária. Não houve inspeção remota do computador pelo assistente, nem relato detalhado de cada fluxo pela URL pública. Teste em outro dispositivo/rede e resultados de terceiros permanecem sem confirmação específica.

Na preparação do suporte HTTPS, a suíte automatizada na nuvem terminou com **19 testes aprovados, 0 falhas e 0 ignorados**. Isso inclui o teste de proxy simulado descrito abaixo. Nenhum teste da aplicação foi reexecutado para esta atualização de documentação.

## Alcance da verificação

O teste automatizado acrescentado à integração usa PostgreSQL real e simula headers do proxy via Supertest. Ele verifica cookie Secure, login, sessão, logout e rejeição de outra origem. **Não abre um túnel público nem testa Cloudflare ou Windows.**

A geração da URL e o funcionamento pelo link foram confirmados pela pessoa usuária na sessão descrita acima. Teste em outro dispositivo/rede e execução por convidados continuam dependendo de confirmação. Um link temporário não comprova disponibilidade permanente nem validação de produção.

### Retomar no próximo dia

1. Abra Docker Desktop e confirme que PostgreSQL está disponível.
2. No terminal da cópia Git, execute `git pull --ff-only` antes de iniciar, preservando quaisquer alterações locais.
3. Se estiver voltando ao acesso local, use `APP_ORIGIN=http://127.0.0.1:3000` e `TRUST_PROXY=0`.
4. Inicie o backend dentro de `backend` com `npm.cmd start`.
5. Para um novo teste externo, abra outro Quick Tunnel, configure sua nova URL em `APP_ORIGIN`, use `TRUST_PROXY=1` e reinicie o backend.

Não recrie bancos, migrations ou administrador a cada retomada: os registros permanecem no volume PostgreSQL. Não é necessário gerar novos segredos a cada túnel; a troca descrita neste capítulo foi necessária devido à exposição em capturas.

[Voltar ao índice](README.md) · [Backend V5](09-backend-v5.md) · [Testes manuais](10-testes-manuais-v5.md)
