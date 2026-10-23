# testeport
Testando codex portifolio para pagina minha

## V3 — Portfólio e demonstrações locais

O site usa somente HTML, CSS e JavaScript, sem dependências, build, backend ou APIs externas. Todos os projetos do portfólio são demonstrações fictícias.

### Executar localmente

Na pasta do projeto, execute:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra no navegador o endereço local informado pelo servidor e entre em **Projetos**. Servir por HTTP é recomendado para testar a persistência do carrinho de forma consistente. Para encerrar o servidor, pressione Ctrl+C.

### Testar as demonstrações

- **Infraestrutura** (`projetos/infraestrutura/index.html`): clique em **Iniciar simulação**. Confira os indicadores, o histórico de CPU e os status fictícios. Clique em **Pausar simulação** e confirme que os dados param de mudar.
- **Automação** (`projetos/automacao/index.html`): clique em **Executar automação** e acompanhe as quatro etapas e os logs com horário. Reinicie durante a execução: as etapas e os logs devem ser limpos e não devem receber atualizações antigas. Não é permitido executar dois fluxos simultaneamente.
- **Loja** (`projetos/loja/index.html`): teste a busca, as categorias, a adição, remoção e alteração de quantidades. Duas unidades do Teclado Orbit e uma do Mouse Vector devem totalizar **R$ 629,70**. Recarregue a página para verificar a persistência. **Finalizar compra** apenas mostra um aviso; não cria pedidos, não cobra e não coleta dados pessoais.
- Em todas as páginas, teste Tab, Shift+Tab, foco visível e o link **Voltar ao portfólio**. Na landing page, teste o menu mobile, Escape e as âncoras. Confira larguras de 360, 768 e 1440 px e a preferência de movimento reduzido do sistema.

### Organização

- `index.html`, `style.css`, `script.js`: landing page, menu e seção de projetos.
- `projetos/demo.css`: componentes e layouts compartilhados pelas demonstrações, reutilizando as cores e os botões de `style.css`.
- `projetos/infraestrutura/`: dashboard e simulação local.
- `projetos/automacao/`: fluxo e logs simulados, com cancelamento de timers.
- `projetos/loja/`: catálogo e carrinho. O armazenamento local usa a chave `dsaol-demo-cart-v1`; dados inválidos são ignorados e, se o armazenamento estiver bloqueado, o carrinho continua em memória.

O e-mail de contato permanece configurável em `CONTACT_EMAIL`, no `script.js` da raiz.

## V4 — Solicitações de orçamento pelo WhatsApp

### Configurar o WhatsApp comercial

Edite **`config.js`**, na raiz:

1. Substitua `whatsapp.number` pelo **número comercial real**, com `55`, DDD e telefone, somente dígitos.
2. Confira o destino e altere `whatsapp.isPlaceholder` para `false`.
3. O valor original `5500000000000` é um **placeholder fictício e inválido**. Ele nunca abre o WhatsApp, mesmo se a flag for alterada por engano. Não ative números fictícios para testar.

A configuração é pública e não deve conter senhas ou credenciais. Sem um número válido e a confirmação `isPlaceholder: false`, o formulário e o botão flutuante mostram uma orientação de contato por e-mail.

### Funcionamento e dados pessoais

- O formulário valida nome completo, e-mail, telefone brasileiro com DDD, serviço, descrição e ciência sobre o uso dos dados. Empresa é opcional. Os limites são 100 caracteres para nome/empresa, 254 para e-mail, 22 para telefone e de 20 a 2.000 para descrição.
- Após validação e uma ação explícita, a mensagem é codificada com `encodeURIComponent` e o WhatsApp é aberto na mesma aba. O visitante deve revisar e confirmar o envio no próprio WhatsApp. Use o botão Voltar do navegador para retornar ao site.
- Não há backend, formulário HTTP ativo, `fetch`, analytics ou armazenamento dos dados pessoais em cookies, localStorage, sessionStorage ou logs. Os controles não têm atributos `name`, e o botão de envio permanece desabilitado sem JavaScript, evitando envio nativo acidental.
- Os dados são incluídos na URL do WhatsApp somente após a ação explícita. O navegador e o WhatsApp passam a tratar essa navegação; o site não controla os registros ou o histórico desses serviços.
- O botão flutuante prepara apenas uma saudação genérica, sem copiar os dados preenchidos no formulário.
- A loja demonstrativa da V3 continua persistindo somente identificadores e quantidades de produtos fictícios; isso é independente do formulário.

### Testar a V4

Use o servidor local descrito na seção V3 e acesse **Orçamento**:

1. Envie o formulário vazio e confira os erros associados aos campos e o foco no primeiro campo inválido.
2. Teste e-mail inválido, DDD inexistente, descrição curta e checkbox desmarcado. Corrija os campos e confirme que os erros são removidos.
3. Com o placeholder original, preencha os dados corretamente: deve aparecer o aviso de WhatsApp não configurado, sem navegação externa.
4. Entre em **Serviços → Conhecer serviço → Solicitar orçamento**. O formulário deve abrir com a opção correspondente selecionada. As páginas são `servicos/criacao-de-sites/`, `servicos/automacao/` e `servicos/infraestrutura/`.
5. Depois de configurar o número comercial real, revise a mensagem preparada. Nome, empresa (ou “Não informada”), serviço, descrição, e-mail e telefone devem aparecer. Não confirme o envio se estiver apenas testando. Em testes automatizados, intercepte a navegação para `https://wa.me/` para conferir a URL sem acessar o WhatsApp.
6. Teste o botão flutuante, o menu mobile, Tab/Shift+Tab, foco visível e preferência por movimento reduzido. Verifique 360, 768 e 1440 px.
7. Confira no painel de armazenamento do navegador que o formulário não cria cookies nem chaves de armazenamento. Não inclua dados pessoais nos parâmetros da URL; somente a chave pública `servico` é usada na pré-seleção.

### Arquivos da V4

- `config.js`: número comercial e bloqueio do placeholder.
- `orcamento.js`: validação, pré-seleção e preparação da mensagem.
- `servicos/servicos.css`: apresentação compartilhada das páginas de serviços.
- `servicos/criacao-de-sites/index.html`, `servicos/automacao/index.html`, `servicos/infraestrutura/index.html`: conteúdo e CTAs dos três serviços.
- `index.html` e `style.css`: formulário, navegação, links de serviços e botão flutuante.
- Os três HTMLs de demonstração receberam apenas metadados Open Graph. Nenhum domínio, canonical ou URL pública foi presumido.

### Antes da publicação comercial

Configure e confira o número real no `config.js`, revise o e-mail provisório `CONTACT_EMAIL` no `script.js` e teste o destino no WhatsApp. Confira o fluxo em um celular real, incluindo a abertura do aplicativo e o retorno ao site. A criação da URL e a interface foram testadas localmente; a entrega de mensagens e a configuração da hospedagem são verificações separadas.


### Atualizações no GitHub Pages

A landing page carrega `config.js` e `orcamento.js` com um identificador de versão na URL. Ao modificar esses arquivos, atualize esse identificador no `index.html` para evitar que visitantes usem versões antigas do cache. Depois de um push, aguarde a conclusão do deploy no GitHub Actions. Se a página ainda mostrar conteúdo antigo, faça uma atualização forçada ou teste em uma janela privativa. A conversa do WhatsApp usa navegação na mesma aba, sem depender de pop-ups.
