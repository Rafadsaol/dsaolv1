# 1 — HTML: estrutura, conteúdo e navegação

[Índice do guia](README.md) · [Próximo: CSS](02-css.md)

## O que HTML faz

HTML significa *HyperText Markup Language*, linguagem de marcação de hipertexto. Ele descreve elementos e suas relações; não executa algoritmos como JavaScript.

```html
<a class="button primary" href="#servicos">Conheça nossos serviços</a>
```

- `<a>` é a tag de abertura de um link.
- `class` é um atributo; `button primary` são duas classes.
- `href` informa o destino.
- O texto entre as tags é o conteúdo visível.
- `</a>` fecha o elemento.

`<input>`, `<meta>` e `<link>` são elementos vazios: não recebem uma tag de fechamento como `</input>`.

## O início de cada página

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>dSaOl IT — Tecnologia que move negócios</title>
  <link rel="stylesheet" href="style.css">
  <script src="script.js" defer></script>
</head>
```

| Trecho | Explicação |
|---|---|
| `<!DOCTYPE html>` | Solicita o modo padrão de renderização de HTML |
| `lang="pt-BR"` | Indica o idioma do documento, útil para leitores de tela e ferramentas de tradução |
| `<head>` | Metadados e referências; não é o cabeçalho visual |
| `charset="UTF-8"` | Define a codificação para acentos e outros caracteres |
| `viewport` | Faz a largura de layout acompanhar a largura do dispositivo |
| `<title>` | Nome da aba e informação usada por buscadores |
| `<link rel="stylesheet">` | Carrega o CSS |
| `defer` | Adia a execução do script até o HTML ser analisado, mantendo a ordem entre esses scripts clássicos |
| `<body>` | Conteúdo e interface da página |

CSS e JS não entram automaticamente na página só porque estão na mesma pasta: precisam ser referenciados.

## Semântica no index.html

Semântica é escolher elementos pelo significado.

| Elemento | Uso neste projeto |
|---|---|
| `header` | Cabeçalho visual com a marca e a navegação |
| `nav` | Grupo de links de navegação |
| `main` | Conteúdo principal |
| `section` | Uma seção temática, como serviços ou orçamento |
| `article` | Um card que faz sentido como unidade, como um projeto |
| `h1`, `h2`, `h3` | Título principal, títulos das seções e títulos dos cards |
| `p` | Parágrafo |
| `ul`, `ol`, `li` | Listas sem ordem, com ordem e seus itens |
| `div` | Agrupamento genérico, sem significado temático próprio |
| `span` | Agrupamento de trecho curto, dentro de uma linha |
| `footer` | Rodapé |

O `h1` não é escolhido apenas por ser grande: representa o assunto principal. O tamanho é uma decisão do CSS. Nas páginas de serviços, cada serviço possui seu próprio `h1`; na landing page, cada seção usa `h2`.

## ID, classe e âncora

Do projeto:

```html
<a href="#projetos">Projetos</a>
<section class="section portfolio" id="projetos" aria-labelledby="projects-title">
```

`id="projetos"` identifica um elemento naquela página. Não repita o mesmo ID em dois elementos do mesmo documento. Classes podem aparecer em vários elementos.

O fragmento `#projetos` manda o navegador procurar esse ID. `aria-labelledby` usa outro ID: o do título que nomeia a seção para tecnologias assistivas.

No CSS, `#projetos` seleciona por ID e `.portfolio` seleciona por classe. No JS, `document.querySelector('#projetos')` encontra o elemento.

## Caminhos relativos

| Referência | Significado |
|---|---|
| `style.css` | Arquivo na pasta da página atual |
| `projetos/loja/index.html` | Desce da raiz para uma subpasta |
| `../demo.css` | Sobe uma pasta antes de procurar o arquivo |
| `../../index.html` | Sobe duas pastas |
| `../../index.html#projetos` | Sobe duas pastas e abre uma seção da landing page |
| `../../index.html?servico=sites#orcamento` | Abre a landing com parâmetro de serviço e fragmento da seção |

Em `servicos/criacao-de-sites/index.html`, são necessários dois `../` para alcançar a raiz. O caminho é resolvido em relação à URL da página, não à pasta aberta no VS Code.

Um caminho começando com `/` parte da raiz do domínio. Em um site publicado em `/testeport/`, `/style.css` apontaria para fora da pasta do projeto. Por isso usamos referências relativas.

## Links e botões

Use `<a href="...">` para navegar e `<button>` para executar uma ação. Aplicar a classe `button` a um link muda a aparência, mas o elemento continua sendo um link.

Um botão dentro de um formulário pode submetê-lo quando não recebe um tipo explícito. Por isso o site usa `type="submit"` no orçamento e `type="button"` nos botões de simulação ou reinício.

`mailto:` é um esquema de URL que solicita a abertura do aplicativo de e-mail. Não garante que haja uma conta de e-mail configurada no dispositivo.

## Formulário: cada atributo tem uma função

Do projeto:

```html
<label for="quote-email">E-mail *</label>
<input id="quote-email" type="email" required maxlength="254"
       inputmode="email" aria-describedby="quote-email-error">
<p class="field-error" id="quote-email-error"></p>
```

- `for` liga o rótulo ao `id` do controle.
- `type="email"` dá semântica e validação nativa de formato.
- `inputmode="email"` sugere um teclado adequado no celular; não valida sozinho.
- `required` marca o campo como obrigatório.
- `maxlength` limita a quantidade de caracteres digitáveis. O JS também confere os valores.
- `aria-describedby` associa explicações e erros ao campo.
- `placeholder` é uma dica temporária; não substitui um `label`.
- `textarea` aceita múltiplas linhas; `rows` sugere sua altura inicial.
- `select` reúne `option`; o `value` é a chave que o JS usa.
- No checkbox, o estado marcado é lido por `.checked`, e não pelo texto de `.value`.

No formulário atual, os controles não têm `name`. Esse atributo é usado na serialização nativa de formulários; `id` tem outra função. O JS lê cada valor por ID. O botão começa `disabled`, e o script instala o tratamento de `submit` antes de habilitá-lo.

`method="post"` no HTML não cria um backend. Nesta aplicação, `event.preventDefault()` cancela a submissão nativa. Sem JS, o botão continua desabilitado.

## Acessibilidade que já está no código

| Recurso | Função |
|---|---|
| Link “Pular para o conteúdo” | Permite chegar ao `main` sem atravessar todo o menu |
| `tabindex="-1"` no `main` | Permite receber foco por navegação/script sem adicioná-lo à ordem normal de Tab |
| `aria-expanded` | Informa se o menu está aberto |
| `aria-controls` | Identifica qual elemento o botão controla |
| `aria-label` | Dá um nome acessível quando necessário |
| `aria-hidden="true"` | Retira decoração da árvore de acessibilidade; não esconde visualmente |
| `aria-current="location"` | Marca a seção ativa no menu |
| `role="alert"` | Anuncia feedback importante, como erro do formulário |
| `role="status"` | Anuncia atualizações menos urgentes |
| `role="log"` | Identifica uma área de registros incrementais |

ARIA comunica significado. Não abre menus, não desenha foco e não substitui a lógica do JS. Também não torna um elemento focável por si só.

## SVG e o desenho de código do hero

SVG é um formato vetorial baseado em elementos, como `svg`, `path`, `rect` e `polyline`. `viewBox` estabelece o sistema de coordenadas. Os ícones dos cards são SVGs locais, sem requisições a um serviço externo.

O bloco `solucao.js` do hero é uma ilustração feita com HTML e CSS. O texto `transformar(seuNegócio)` não executa uma função real. A decoração está sob `aria-hidden="true"` para não ser confundida com conteúdo funcional.

## SEO e Open Graph

`meta name="description"` descreve a página. Tags `og:title`, `og:description`, `og:type`, `og:locale` e `og:site_name` ajudam serviços a interpretar compartilhamentos. Isso não garante posicionamento em buscas nem uma aparência idêntica em todos os aplicativos.

Não há `canonical` nem `og:url` com domínio presumido. Cada página de serviço tem título e descrição próprios.

## Como ler as três páginas de serviços

Todas seguem o mesmo padrão: cabeçalho, apresentação, problemas, exemplos de soluções, etapas gerais, CTA e rodapé. As diferenças estão no conteúdo e na chave `servico` do link de orçamento. O visual compartilhado está em `servicos/servicos.css`, e elas não carregam JavaScript próprio.

## Exercícios

1. Na cópia de estudo, crie uma seção com `id="aprendizado"` e um link `href="#aprendizado"`. O clique deve chegar à seção.
2. Altere o texto de um card sem modificar sua classe. O visual deve continuar igual.
3. Mude um caminho relativo de propósito. Observe o erro 404 no painel Network e corrija-o.
4. Navegue apenas com Tab e Enter. Explique por que um link e um botão recebem foco sem `tabindex="0"`.
5. Adicione um rótulo e um campo em uma página de laboratório. Ao clicar no rótulo, o campo deve receber foco.
