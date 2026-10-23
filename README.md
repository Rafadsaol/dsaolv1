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
