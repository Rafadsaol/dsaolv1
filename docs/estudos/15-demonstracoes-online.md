# Demonstrações online: Linha Tênue e Cidade do Sabor

Preparação de 30/10/2026 para hospedagem estática na Cloudflare Pages. Cada demonstração tem seu próprio repositório e projeto. O site principal e seu backend não são copiados para esses projetos.

| Configuração | Linha Tênue | Cidade do Sabor |
| --- | --- | --- |
| Repositório | Rafadsaol/linhatenuev1 | Rafadsaol/cidadedosaborv1 |
| Branch de produção | main | main |
| Framework no painel | None | None |
| Comando de build | npm run build:demo | npm run build:demo |
| Diretório de saída | dist | out |
| Diretório raiz | vazio | vazio |
| Variável | NODE_VERSION=24 | NODE_VERSION=24 |
| Subdomínio pretendido | linhatenue.dsaol.com.br | cidadedosabor.dsaol.com.br |

Os subdomínios são destinos planejados. A criação dos projetos, sua publicação e a associação dos domínios ainda dependem do painel da conta Cloudflare. Os endereços pages.dev foram posteriormente fornecidos pela pessoa usuária e integrados ao portfólio, conforme registro abaixo.

## Publicação

1. Em Workers & Pages, criar uma aplicação **Pages** conectada ao GitHub.
2. Escolher o respectivo repositório e usar as configurações da tabela.
3. Esperar o deploy concluir e abrir o endereço pages.dev fornecido pela Cloudflare.
4. Testar imagens, navegação, catálogo, carrinho e os perfis demonstrativos usando apenas dados fictícios.
5. Em Custom domains do projeto, associar seu subdomínio. Confirmar a criação do registro DNS oferecido pela Cloudflare e aguardar HTTPS ativo.
6. Confirmar os endereços reais para então incorporar cada demonstração ao portfólio. A interface interativa no site principal foi implementada após o recebimento dos endereços pages.dev (ver atualização abaixo).

## Comportamento e limites

Linha Tênue usa React/Vite. O modo portfolio mantém catálogo, carrinho e painel de exemplo no navegador e desativa somente as chamadas à API de sincronização de campanha. O desenvolvimento local original mantém esse servidor. A campanha pública não sincroniza entre dispositivos.

Cidade do Sabor usa Next.js com um comando dedicado que ativa exportação estática, imagens sem otimizador de servidor e URLs com barra final. Os comandos originais de build e servidor permanecem disponíveis. O perfil administrativo é uma simulação local, sem autenticação real, conforme já informa o aplicativo.

Os cabeçalhos em public/_headers permitem iframe pelas origens https://dsaol.com.br, https://www.dsaol.com.br e https://dsaolv1.pages.dev, além da própria demonstração. Não adicionar X-Frame-Options DENY ou SAMEORIGIN nas demonstrações. Na futura integração, a CSP do site principal também precisará liberar os dois subdomínios em frame-src, pois hoje default-src permite apenas a própria origem. frame-ancestors nas demonstrações controla quais páginas podem incorporá-las.

Não há compra, cobrança, pedido enviado a restaurante, banco hospedado ou autenticação real. Utilizar dados fictícios. As demonstrações têm noindex/nofollow para não competir com o site comercial em buscas.

## Validação local

- Build estático dos dois projetos concluído; TypeScript do Cidade do Sabor aprovado pelo build.
- 50 testes existentes da Linha Tênue aprovados.
- Chromium em 390 e 1440 px: telas principais e painéis de exemplo abrem sem erros JavaScript nem chamadas a API de backend; sem overflow horizontal nos caminhos verificados.
- Incorporação por iframe com origem dsaol.com.br simulada localmente aprovada.
- Pacotes dentro dos limites por arquivo e quantidade da Cloudflare Pages: Linha Tênue, 61 arquivos, cerca de 81 MiB; Cidade do Sabor, 242 arquivos, cerca de 19 MiB. O maior arquivo de cada pacote tem menos de 4 MiB.
- DNS, HTTPS, cabeçalhos efetivos na Cloudflare, Safari/Firefox, armazenamento em iframe em celular físico e fluxo completo de compra fictícia ainda precisam de validação pública. O bloqueio de armazenamento por navegadores pode limitar a demonstração incorporada; oferecer também abertura em nova aba na futura integração.

## Atualização: janela interativa no portfólio

Endereços fornecidos pela pessoa usuária:

- https://linhatenuev1.pages.dev/
- https://cidadedosaborv1.pages.dev/

O botão “Explorar demonstração” está nos dois cards da página inicial e no início de cada estudo de caso. Um único componente (projetos/demo-viewer.js e projetos/demo-viewer.css) abre um dialog modal com iframe carregado somente ao clicar. Não abre outra aba. Oferece formatos Desktop/Celular em telas maiores, ocupa a tela disponível no celular e mantém um botão Fechar visível. Fechar descarta o iframe, encerra sua execução e devolve foco ao botão sem perder a posição no portfólio. Escape funciona nos controles da janela; teclas acionadas dentro da aplicação de outra origem são controladas pelo navegador e pela própria aplicação.

Há aviso de uso de dados fictícios e botão para recarregar a demonstração se a rede ou a incorporação falhar. O evento load de um iframe não comprova sucesso do site externo, por isso a interface não declara que a aplicação está operacional. O iframe restringe navegação superior e novas janelas, mantendo scripts, formulários e downloads de relatórios demonstrativos.

A CSP da publicação estática e do servidor Express permite frame-src exclusivamente para os dois endereços acima. Nenhuma alteração no banco ou na autenticação. As imagens e clipes do portfólio foram preservados.

Validação automatizada usa os builds locais reais das demonstrações e serve as três origens por interceptação no navegador para testar os cabeçalhos efetivos do pacote. Os acessos HTTPS públicos deste ambiente foram bloqueados pelo proxy de saída (CONNECT 403); isso não demonstra falha dos sites publicados. Validar a incorporação no domínio real após o deploy, inclusive Safari/Firefox e celular físico.

A integração foi validada em Chromium nas páginas inicial, Linha Tênue e Cidade do Sabor, em 390/768/1440 px: carregamento sob demanda, navegação do cardápio dentro do iframe, ausência de novas abas, alternância de largura, recarga, fechamento por botão e Escape nos controles, restauração de foco e posição da página. A navegação pública externa continua pendente pela restrição de rede descrita acima.

Nos testes de iframe entre dsaol.com.br e pages.dev, o Chromium restringiu o armazenamento local da demonstração. O Cidade do Sabor exibiu seu aviso existente e continuou funcionando com dados somente na aba. Os controles da janela não removem esse aviso. Associar as demonstrações aos subdomínios da dsaol.com.br é o próximo passo recomendado para usar origens do mesmo site; verificar novamente persistência e compatibilidade nos navegadores reais.
