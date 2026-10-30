import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Verificação local e somente leitura. Não acessa .env, banco ou serviços externos.
const root = fileURLToPath(new URL('../', import.meta.url));
const publication = JSON.parse(await readFile(path.join(root, 'publicacao.config.json'), 'utf8'));
const origin = new URL(publication.origin);
if (origin.protocol !== 'https:' || origin.origin !== publication.origin) throw new Error('Defina uma origem pública HTTPS sem caminho ou barra final.');
const pages = [
  'index.html',
  ...['criacao-de-sites', 'automacao', 'infraestrutura'].map(name => `servicos/${name}/index.html`),
  ...['linha-tenue', 'cidade-do-sabor', 'loja', 'automacao', 'infraestrutura'].map(name => `projetos/${name}/index.html`),
  '404.html'
];
const errors = [];
const warnings = [];
const cache = new Map();
const titles = new Set();
const descriptions = new Set();
let references = 0;

async function read(file) {
  if (!cache.has(file)) cache.set(file, await readFile(file, 'utf8'));
  return cache.get(file);
}

function resolvePublicPath(href, page) {
  const url = new URL(href, `https://local.invalid/${page}`);
  if (url.origin !== 'https://local.invalid') return null;
  const pathname = decodeURIComponent(url.pathname);
  // O login/painel são servidos pelo Express, nunca pela raiz estática do repositório.
  const relative = /^\/(auth|admin)(\/|$)/.test(pathname)
    ? `backend/public${pathname}` : pathname.slice(1);
  const file = path.resolve(root, relative || 'index.html');
  if (!file.startsWith(root)) throw new Error('Referência fora do projeto.');
  return { file, fragment: decodeURIComponent(url.hash.slice(1)) };
}

for (const page of pages) {
  const source = await read(path.join(root, page));
  const title = source.match(/<title>([^<]+)<\/title>/i)?.[1];
  const description = source.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1];
  if (!title || titles.has(title)) errors.push(`${page}: título ausente ou duplicado.`);
  if (!description || descriptions.has(description)) errors.push(`${page}: descrição ausente ou duplicada.`);
  titles.add(title); descriptions.add(description);
  if (page !== '404.html') {
    const expected = `${publication.origin}/${page.replace(/index\.html$/, '')}`;
    const canonical = source.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    const ogUrl = source.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i)?.[1];
    if (canonical !== expected || ogUrl !== expected) errors.push(`${page}: canonical/og:url deve usar a URL pública configurada.`);
  }
  if ([...source.matchAll(/<h1(?:\s|>)/gi)].length !== 1) errors.push(`${page}: deve conter exatamente um H1.`);
  const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) errors.push(`${page}: IDs duplicados.`);
  for (const image of source.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt="[^"]+"/i.test(image[0])) errors.push(`${page}: imagem sem texto alternativo.`);
  }
  for (const reference of source.matchAll(/\b(?:href|src|poster)="([^"]+)"/g)) {
    const href = reference[1];
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) continue;
    try {
      const target = resolvePublicPath(href, page);
      if (!target) continue;
      let { file, fragment } = target;
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      if (!(await stat(file)).isFile()) throw new Error('Não é um arquivo.');
      references++;
      if (fragment && file.endsWith('.html')) {
        const ids = [...(await read(file)).matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
        if (!ids.includes(fragment)) errors.push(`${page}: âncora inexistente: ${href}`);
      }
    } catch { errors.push(`${page}: referência local inválida: ${href}`); }
  }
}

const config = await read(path.join(root, 'config.js'));
const number = config.match(/\bnumber:\s*'([^']*)'/)?.[1];
if (!number || !/^55\d{10,11}$/.test(number) || !/\bisPlaceholder:\s*false/.test(config)) {
  errors.push('WhatsApp: número comercial não configurado ou ainda marcado como placeholder.');
}
const contactScript = await read(path.join(root, 'script.js'));
const email = contactScript.match(/const CONTACT_EMAIL\s*=\s*'([^']+)'/)?.[1];
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !(await read(path.join(root, 'index.html'))).includes(`href="mailto:${email}"`)) {
  errors.push('Contato: confira o e-mail configurado em script.js e o link mailto do HTML.');
}
const robots = await read(path.join(root, 'robots.txt'));
if (!robots.includes(`Sitemap: ${publication.origin}/sitemap.xml`)) errors.push('robots.txt deve apontar para o sitemap da origem configurada.');
const locations = [...(await read(path.join(root, 'sitemap.xml'))).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
if (!locations.length || new Set(locations).size !== locations.length) errors.push('Sitemap vazio ou com URLs duplicadas.');
for (const location of locations) {
  try {
    const url = new URL(location);
    if (url.origin !== publication.origin) throw new Error();
    let file = resolvePublicPath(url.pathname, 'index.html').file;
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    if (!(await stat(file)).isFile()) throw new Error();
  } catch { errors.push(`URL inválida no sitemap: ${location}`); }
}
if (publication.mode !== 'static' || publication.hosting !== 'cloudflare-pages') errors.push('A preparação atual é para o portfólio estático no Cloudflare Pages.');
if (publication.deploymentVerified !== true) warnings.push('Pacote preparado; ainda falta publicar no Cloudflare Pages, configurar DNS no Registro.br e validar HTTPS/domínio.');
warnings.push('Validar o contato e a navegação em celular físico, Safari e Firefox antes de encerrar a revisão de publicação.');

console.log(`${pages.length} páginas públicas e ${references} referências locais verificadas.`);
for (const error of errors) console.error(`ERRO: ${error}`);
for (const warning of warnings) console.warn(`PENDÊNCIA: ${warning}`);
console.log('Esta verificação não publica o site nem certifica segurança, entrega de mensagens ou disponibilidade pública.');
if (errors.length || (process.argv.includes('--estrito') && warnings.length)) process.exitCode = 1;
