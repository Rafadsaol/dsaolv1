# 7 — Praticar em outro ambiente, depurar e publicar

[Índice](README.md) · [Anterior: loja](06-loja.md) · [Próximo: glossário](08-glossario.md)

## Preparar uma cópia para estudar

Você precisa de um navegador moderno e de um editor de texto, como o VS Code. Python pode servir os arquivos; Git facilita copiar o repositório e registrar o progresso. Não é necessário instalar Node, npm ou dependências para executar o site.

Opção com Git, **no seu computador e em uma pasta nova**:

```bash
git clone https://github.com/Rafadsaol/testeport.git dsaol-estudos
cd dsaol-estudos
```

Essa cópia terá seu próprio diretório de trabalho, mas inicialmente mantém o remoto do projeto original. Se quiser evitar um push acidental a ele, execute **somente nessa nova cópia**:

```bash
git remote remove origin
```

Isso remove a referência ao remoto na cópia local; não apaga os arquivos, o histórico nem o repositório no GitHub. Não execute esse comando na cópia que você usa para manter o site publicado.

Como alternativa, use **Code → Download ZIP** no GitHub e extraia em uma pasta própria para estudo. Um ZIP normalmente não inclui o histórico Git.

Antes de testar o formulário da cópia, configure o modo de placeholder:

```js
// Dentro do objeto whatsapp, em config.js da cópia de estudo:
number: '5500000000000',
isPlaceholder: true
```

Isso mantém o contato comercial bloqueado enquanto você pratica validação. Não configure um telefone fictício válido como destino ativo. Para estudar mensagens sem abrir um serviço externo, use a prévia local do laboratório abaixo.

## Servir a pasta por HTTP

Dentro da pasta de estudo:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

No Windows, se estiver usando o launcher `py`:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8000/` no navegador do mesmo computador. Encerre com Ctrl+C no terminal. Se já houver outro programa usando a porta, escolha outra, como 8003, e use a mesma porta no navegador.

O servidor apenas entrega arquivos. Ele não implementa pagamento, envio de formulário ou automação real. `127.0.0.1` é o próprio computador; esse endereço não serve como link público para outra pessoa.

Se você já usa Live Server no VS Code, pode continuar usando. Mantenha a raiz do projeto como pasta servida para preservar os caminhos relativos.

## Laboratório independente de três arquivos

Crie uma pasta nova chamada `laboratorio`, separada da cópia principal. Os exemplos desta seção são completos e didáticos; não são substitutos dos arquivos da landing page.

O laboratório combina menu, quantidade, formatação monetária e prévia de mensagem. Não há links de WhatsApp, gravações em armazenamento ou envio de dados.

### index.html

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu laboratório</title>
  <link rel="stylesheet" href="style.css">
  <script src="script.js" defer></script>
</head>
<body>
  <main>
    <h1>Prática de frontend</h1>
    <button id="menu-toggle" type="button"
            aria-controls="menu" aria-expanded="false">Abrir menu</button>
    <nav id="menu" aria-label="Menu do laboratório" hidden>
      <a href="#produto">Ir ao produto</a>
    </nav>

    <section id="produto" aria-labelledby="produto-title">
      <h2 id="produto-title">Produto fictício</h2>
      <p>Preço unitário: R$ 249,90</p>
      <button id="adicionar" type="button">Adicionar unidade</button>
      <button id="limpar" type="button">Zerar quantidade</button>
      <p id="resumo" role="status"></p>
    </section>

    <section aria-labelledby="mensagem-title">
      <h2 id="mensagem-title">Prévia local de mensagem</h2>
      <label for="descricao">Descrição fictícia do projeto</label>
      <textarea id="descricao" maxlength="300" rows="4"></textarea>
      <button id="preparar" type="button">Preparar prévia</button>
      <pre id="previa" aria-live="polite"></pre>
    </section>
  </main>
</body>
</html>
```

### style.css

```css
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #0b1120;
  color: #f4f7ff;
  font-family: system-ui, sans-serif;
  line-height: 1.7;
}
main { width: min(760px, calc(100% - 40px)); margin: 40px auto; }
section { margin-top: 32px; padding: 20px; border: 1px solid #405477; }
button, textarea { font: inherit; }
button {
  min-height: 44px;
  margin: 8px 4px 8px 0;
  padding: 8px 14px;
  border: 0;
  border-radius: 6px;
  background: #2563eb;
  color: white;
  cursor: pointer;
  transition: transform .4s ease;
}
button:hover { transform: translateY(-2px); }
a { color: #a8c8ff; }
label { display: block; }
textarea { display: block; width: 100%; padding: 10px; }
:focus-visible { outline: 3px solid #a8c8ff; outline-offset: 4px; }
pre { white-space: pre-wrap; overflow-wrap: anywhere; }
[hidden] { display: none; }
@media (prefers-reduced-motion: reduce) {
  button { transition: none; }
  button:hover { transform: none; }
}
```

### script.js

```js
'use strict';

const menuButton = document.querySelector('#menu-toggle');
const menu = document.querySelector('#menu');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menu.hidden = open;
  menuButton.textContent = open ? 'Abrir menu' : 'Fechar menu';
});

const unitPrice = 24990;
let quantity = 0;
const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL'
});
function renderSummary() {
  document.querySelector('#resumo').textContent =
    `${quantity} unidade(s). Total: ${money.format(unitPrice * quantity / 100)}`;
}
document.querySelector('#adicionar').addEventListener('click', () => {
  quantity += 1;
  renderSummary();
});
document.querySelector('#limpar').addEventListener('click', () => {
  quantity = 0;
  renderSummary();
});
renderSummary();

document.querySelector('#preparar').addEventListener('click', () => {
  const description = document.querySelector('#descricao').value.trim();
  if (description.length < 20) {
    document.querySelector('#previa').textContent = 'Escreva pelo menos 20 caracteres.';
    document.querySelector('#descricao').focus();
    return;
  }
  const message = [
    'Olá! Esta é uma mensagem de estudo.',
    'Serviço: Criação de Sites',
    `Descrição: ${description}`
  ].join('\n');
  const encoded = encodeURIComponent(message);
  document.querySelector('#previa').textContent =
    `${message}\n\nTexto codificado:\n${encoded}`;
});
```

Sirva essa nova pasta com o mesmo comando do servidor, em outra porta se necessário. Com duas unidades, o total deve ser R$ 499,80. A prévia deve manter acentos e quebras, enquanto o texto codificado deve conter sequências com `%`. Nenhum clique deve abrir outro site.

O laboratório simplifica o menu: o menu da aplicação inclui Escape, clique externo e gerenciamento de foco mais completo. Use esses comportamentos como próximos exercícios.

## Sequência de prática na cópia do projeto

| Etapa | Tarefa | Como verificar |
|---|---|---|
| 1 | Alterar conteúdo de um card | Texto muda e estrutura visual permanece |
| 2 | Alterar cor de uma variável CSS | Identificar os componentes que usam aquela variável |
| 3 | Reproduzir menu mobile | Classe/atributo acompanham abrir e fechar |
| 4 | Ajustar uma media query | Comparar 360, 768 e 1440 px sem overflow |
| 5 | Alterar intervalo da simulação | Dados mudam mais devagar e param ao pausar |
| 6 | Ajustar mensagem da automação | Sequência continua completa e reinício cancela callbacks |
| 7 | Adicionar produto fictício | Busca, categoria e total passam a incluí-lo |
| 8 | Exercitar validação do orçamento | Campos inválidos recebem mensagem, sem navegação com placeholder |
| 9 | Explicar a solução com suas palavras | Descrever dados, eventos e DOM sem depender de copiar o arquivo |

## Ferramentas do navegador

Abra DevTools com F12 ou a opção Inspecionar do navegador.

| Painel | O que observar |
|---|---|
| Elements / Inspector | HTML atual, classes e atributos alterados pelo JS |
| Styles | Regras aplicadas e regras sobrescritas |
| Computed | Valor final calculado de uma propriedade |
| Console | Erros e pequenos cálculos de estudo com dados fictícios |
| Sources / Debugger | Breakpoints e inspeção de variáveis durante um evento |
| Network | CSS/JS carregados, status HTTP, caminho e versão da URL |
| Application / Storage | Chave do carrinho fictício; ausência de chaves do orçamento |
| Modo responsivo | Comparação de tamanhos e interação com layout mobile |

Um breakpoint pausa o script em um ponto. Use-o dentro do listener de clique ou em `renderCart()` e observe o Map antes/depois. Não registre dados pessoais reais no Console para estudar o formulário.

## Erros frequentes

| Sintoma | Investigar |
|---|---|
| `Cannot read properties of null` | Seletor errado, elemento ausente ou script usado na página incorreta |
| Erro 404 | Caminho relativo incorreto ou arquivo com nome/maiúsculas diferentes |
| Mudança no CSS não aparece | Cascata, especificidade, arquivo carregado e cache |
| Menu some, mas Tab fica perdido | Elemento focado ficou escondido sem reposicionar foco |
| Simulação acelera a cada clique | Intervalos criados sem controle/cancelamento |
| Logs reaparecem após reiniciar | Timeout antigo não foi cancelado |
| Total vira uma concatenação | Soma feita com strings em vez de números |
| Carrinho some em outra porta | Mudança de origem do armazenamento |
| WhatsApp informa configuração ausente | Flag de placeholder, formato do número e versão de config carregada |

## Git e GitHub Pages

Git registra versões localmente. GitHub hospeda o repositório. GitHub Pages publica arquivos para o navegador. São etapas diferentes.

Na sua cópia de estudo, estes comandos ajudam a revisar:

```bash
git status
git diff
git add index.html style.css script.js
git commit -m "Pratica de layout e eventos"
```

`git add` prepara arquivos para o próximo commit; `commit` cria o registro local. Um `push` envia commits a um remoto, se ele estiver configurado e você tiver acesso. Para estudar com publicação, crie seu próprio repositório e confira o destino antes de fazer push.

No GitHub Pages, confirme a origem publicada, como `main` e pasta raiz. Um push bem-sucedido não significa que o deploy já terminou. Confira o resultado em Actions/Pages.

## Cache e versão dos scripts

No HTML principal, `config.js?v=...` e `orcamento.js?v=...` possuem uma query string de versão. Ela mantém o mesmo arquivo físico, mas muda a URL usada no cache.

Ao alterar esses arquivos e publicar, atualize o identificador em conjunto com a mudança. A versão não é uma senha, não substitui um deploy correto e não garante que um HTML antigo em cache já tenha sido substituído. Atualização forçada ou janela privativa ajudam no diagnóstico.

O parâmetro `v` identifica uma versão de recurso. O parâmetro `servico` tem outra finalidade: escolher uma opção do formulário. O fragmento `#orcamento` determina a seção de destino.

## Checklist antes de considerar um exercício concluído

- Expliquei o objetivo antes de modificar?
- Alterei apenas o que estava estudando?
- Há erros no Console ou arquivos 404 no Network?
- O resultado funciona com Tab, Enter e, quando aplicável, Escape?
- O layout cabe nas três larguras e no zoom do navegador?
- A preferência por movimento reduzido é respeitada?
- Os cálculos batem com um exemplo feito à mão?
- Timers param quando necessário?
- Minha prática não enviou mensagens nem expôs dados reais?
- O diff corresponde ao que eu pretendia alterar?
