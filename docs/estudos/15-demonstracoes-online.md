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

Os subdomínios são destinos planejados. A criação dos projetos, sua publicação e a associação dos domínios ainda dependem do painel da conta Cloudflare. Nenhum endereço de demonstração foi acrescentado ao portfólio antes de existir e ser confirmado.

## Publicação

1. Em Workers & Pages, criar uma aplicação **Pages** conectada ao GitHub.
2. Escolher o respectivo repositório e usar as configurações da tabela.
3. Esperar o deploy concluir e abrir o endereço pages.dev fornecido pela Cloudflare.
4. Testar imagens, navegação, catálogo, carrinho e os perfis demonstrativos usando apenas dados fictícios.
5. Em Custom domains do projeto, associar seu subdomínio. Confirmar a criação do registro DNS oferecido pela Cloudflare e aguardar HTTPS ativo.
6. Confirmar os endereços reais para então incorporar cada demonstração ao portfólio. A interface interativa no site principal ainda não foi implementada nesta preparação.

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
