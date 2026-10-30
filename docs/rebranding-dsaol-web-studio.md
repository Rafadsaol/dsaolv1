# dSaOl Web Studio — rebranding público

Registro de implementação e validação em 30/10/2026, na pasta `testeport`. O envio do rebranding ao GitHub na branch `v5-fullstack` foi autorizado pela pessoa usuária após a revisão. A publicação da aplicação não faz parte desta entrega.

## Escopo implementado

- Marca de apresentação **dSaOl Web Studio**, com origem **dos Santos Oliveira** e logotipo tipográfico `dSaOl`, destacando as letras finais em azul.
- Paleta Tech Premium: azul-marinho `#0B1120`, azul elétrico `#2563EB`, azul claro `#60A5FA` e branco gelo `#F8FAFC`.
- Space Grotesk para títulos e Inter para textos, com fallbacks. Fontes variáveis locais e licenças incluídas; nenhuma dependência instalada e nenhum pedido de fonte a serviços externos durante a navegação.
- Hero com título, subtítulo e CTAs solicitados. Ilustração original em CSS/SVG, benefícios, serviços, portfólio, processo, sobre, FAQ, orçamento, contato e rodapé.
- Oferta comercial limitada a landing pages, sites institucionais, portfólios e catálogos digitais. Lojas virtuais sob consulta, sem prometer pagamentos, frete ou outras integrações.
- Navegação por âncoras, menu mobile, destaque de seção, foco visível, entrada suave e respeito a movimento reduzido mantidos. FAQ e estudos de caso usam `details`/`summary`, sem biblioteca adicional.
- SEO básico: título e descrição da página, Open Graph sem domínio fictício e favicon SVG original. Páginas antigas de serviços retirados recebem `noindex, follow` e explicação do foco atual.

## Compatibilidade preservada

- Número comercial em `config.js` e contato por e-mail em `script.js` não foram alterados.
- WhatsApp continua preparando mensagem, abrindo nova aba/janela e oferecendo link manual. A interface não afirma que a mensagem foi enviada.
- IDs, validações e consentimento do formulário foram preservados. Os rótulos dos tipos de site são lidos do próprio select para compor a mensagem.
- O registro opcional reutiliza a validação do formulário sem disparar WhatsApp e mantém autorização separada, chave idempotente e funcionamento independente do contato externo.
- **Nenhuma migration, schema, credencial, regra de autenticação ou permissão foi alterada.** Os novos formatos de site são enviados à categoria já aceita `sites`; `outro` permanece `outro`. O formato detalhado fica no início da descrição, visível no painel. Os registros antigos continuam válidos.
- A descrição pública aceita de 20 a 1.900 caracteres, reservando espaço para o formato escolhido dentro do limite existente de 2.000 caracteres da API. Nenhum texto digitado é truncado para registrar.
- O único ajuste no servidor é permitir servir o favicon e os assets públicos de fontes/SVG. A raiz do checkout continua sem exposição. Licenças e metadados das fontes não são incluídos na lista de assets servidos por Express.
- Demos de loja, automação e infraestrutura continuam nos mesmos caminhos, com os scripts originais. As duas últimas aparecem como experimentos de interface, sem oferta comercial dos respectivos serviços.
- Caminhos antigos `servicos/automacao/` e `servicos/infraestrutura/` permanecem acessíveis como referências da versão anterior, com acesso às demos e aos serviços atuais. Os arquivos não foram excluídos.
- Telas de autenticação e administração receberam apenas nome de marca no HTML e favicon; lógica de sessão, cadastro, recuperação, dashboard e CRUD permaneceu intacta.

## Portfólio e modelo reutilizável

O componente `.case-study` apresenta: contexto, tecnologias, ação de demonstração e um disclosure `.case-details` com proposta, o que testar e limites. O bloco pode ser repetido sem novos scripts. Só inclua links para arquivos ou URLs verificados.

Exemplo de estrutura a preencher com informações verificadas:

```html
<article class="card case-study">
  <p class="project-label">CLASSIFICAÇÃO VERIFICADA DO PROJETO</p>
  <h3>Título verificado</h3>
  <p>Descrição baseada no conteúdo disponível.</p>
  <ul class="tech-tags" aria-label="Tecnologias">
    <li>Tecnologia realmente utilizada</li>
  </ul>
  <!-- Adicionar ação apenas quando houver destino real e validado. -->
  <details class="case-details">
    <summary>Sobre este estudo de caso</summary>
    <dl>
      <dt>Proposta</dt><dd>Objetivo verificado.</dd>
      <dt>O que testar</dt><dd>Funcionalidades existentes.</dd>
      <dt>Limites</dt><dd>O que é demonstrativo ou não está implementado.</dd>
    </dl>
  </details>
</article>
```

**Linha Tênue** e **Cidade do Sabor** foram citados pela pessoa usuária, mas não foram encontrados arquivos, imagens, escopo ou links desses projetos no repositório inspecionado. Os nomes foram reservados em cards com apresentação pendente e sem botão inativo ou link inventado. Não são classificados como clientes, projetos entregues ou conceitos concluídos. Para publicar estudos completos, faltam os materiais e a confirmação de sua natureza e autoria.

## Validação executada

1. `npm test` em `backend`: **19 testes aprovados, 0 falhas e 0 ignorados**, com PostgreSQL real no banco separado de testes. Inclui sessões, permissões, CSRF, CRUD, integridade, solicitações, recuperação e proxy HTTPS simulado.
2. Chromium/Playwright disponível no ambiente: verificação visual e de overflow em **360, 768 e 1440 px** na landing page, páginas de serviços, demos e login. Painel também conferido nessas larguras. Capturas locais em `backend/.test-results/`, ignoradas pelo Git.
3. Menu mobile, Escape, navegação por âncoras, FAQ, estudos de caso e acesso às demos pelo bloco de experimentos.
4. Carregamento de Space Grotesk e Inter locais; estilo computado dos títulos e movimento reduzido verificados.
5. Os seis tipos de site do formulário: pré-seleção por query string, texto e destino do WhatsApp, nova aba e link manual. Abertura externa interceptada, sem envio de mensagens reais.
6. Rejeição de formulário vazio, e-mail inválido, telefone inválido e ciência desmarcada. Registro sem autorização específica também bloqueado.
7. Registro opcional com API/Prisma/PostgreSQL reais: categoria compatível com o banco, formato detalhado preservado, descrição no limite, repetição sem duplicação e visualização no painel ADMIN. Foram usados apenas dados fictícios; os registros criados para essa validação foram removidos ao final.
8. Backend indisponível simulado no navegador: área opcional oculta e contato por WhatsApp funcionando independentemente.
9. Loja: busca, carrinho, quantidade, total, persistência após recarregar e aviso de checkout demonstrativo. Fluxo: reinício cancela atualizações anteriores. Dashboard fictício: iniciar e pausar a simulação.
10. Login ADMIN e logout reais, sem alterar a lógica de autenticação. Nenhum erro JavaScript/CSP ou referência HTTP quebrada observado nessa execução.
11. Verificação de 12 páginas HTML: IDs únicos, um H1 por página, links locais, âncoras, rotas hash do painel e referências das fontes. Sintaxe dos scripts alterados e `git diff --check` aprovados.

As verificações de navegador foram executadas em Chromium Linux no ambiente de trabalho, não no computador Windows da pessoa usuária. Não equivalem a uma auditoria completa de acessibilidade ou segurança.

## Como visualizar

Na cópia Git conectada à branch `v5-fullstack`, receba a atualização com `git pull --ff-only`. Preserve alterações locais se o Git indicar conflito. Com PostgreSQL e `.env` já preparados:

```powershell
cd backend
npm.cmd start
```

Use a origem configurada em `APP_ORIGIN`. Para acesso local padrão, configure `APP_ORIGIN=http://127.0.0.1:3000` e `TRUST_PROXY=0` no `.env` local; reinicie o backend se mudar esses campos. Não substitua outras configurações nem recrie bancos ou administrador para visualizar o rebranding.

Para apenas a página estática, pode usar Live Server na raiz ou `python -m http.server 8000`. Nesse modo não há API nem painel protegido; o registro opcional fica oculto quando a API não está disponível. Use o backend para testar a V5 completa.

A transferência pelo Git inclui o código e os assets; não inclui `.env`, banco, dependências instaladas ou saídas temporárias de testes. A versão antiga do túnel temporário não é um endereço válido presumido para esta revisão. Este envio não altera a branch `main` nem publica a aplicação.

## Pendências antes do uso comercial

- Fornecer e revisar os materiais de Linha Tênue e Cidade do Sabor.
- Confirmar se o e-mail já configurado `contato@dsaol.it` é operacional. Foi preservado; o comentário no código ainda o identifica como provisório.
- Conferir os textos comerciais, escopo de lojas virtuais e condições de domínio, hospedagem e atendimento. Nenhum preço, prazo fixo, cliente, depoimento, certificação ou resultado foi inventado.
- Testar em celular físico, Safari/Firefox, Windows e com tecnologias assistivas. Não foram executados nesta revisão.
- Conferir a abertura do aplicativo WhatsApp no celular sem enviar mensagens de estudo a terceiros. A entrega real de WhatsApp não foi testada.
- Para publicação permanente: revisar HTTPS, SMTP com entrega real, backup/restauração, retenção de solicitações e configurações de produção conforme o README do backend. Nenhum deploy ou túnel público foi aberto nesta entrega.

## Arquivos modificados

```text
index.html
style.css
orcamento.js
solicitacoes.js
servicos/criacao-de-sites/index.html
servicos/automacao/index.html
servicos/infraestrutura/index.html
projetos/loja/index.html
projetos/automacao/index.html
projetos/infraestrutura/index.html
backend/src/app.js
backend/public/auth/login.html
backend/public/auth/register.html
backend/public/auth/forgot.html
backend/public/auth/reset.html
backend/public/admin/index.html
```

## Arquivos criados

```text
favicon.svg
assets/fonts/space-grotesk-latin.woff2
assets/fonts/space-grotesk-latin-ext.woff2
assets/fonts/space-grotesk-LICENSE.txt
assets/fonts/inter-latin.woff2
assets/fonts/inter-latin-ext.woff2
assets/fonts/inter-LICENSE.txt
assets/fonts/sources.json
docs/rebranding-dsaol-web-studio.md
```

Os pacotes de distribuição das fontes foram obtidos do registro npm sem instalação, com verificação SHA-512 do tarball. Origem, versão e integridade estão em `assets/fonts/sources.json`; as licenças acompanham os arquivos. Nenhum manifesto de dependências ou lockfile foi alterado.
