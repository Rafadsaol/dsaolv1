import { readdir, readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Monta somente o frontend público. Não instala dependências nem executa deploy.
const root = fileURLToPath(new URL('../', import.meta.url));
const config = JSON.parse(await readFile(path.join(root, 'publicacao.config.json'), 'utf8'));
if (config.mode !== 'static' || config.hosting !== 'cloudflare-pages') {
  throw new Error('Este empacotador prepara somente o modo estático para Cloudflare Pages.');
}
const check = spawnSync(process.execPath, ['scripts/verificar-publicacao.mjs'], { cwd: root, stdio: 'inherit' });
if (check.status !== 0) throw new Error('Corrija a verificação local antes de gerar o pacote.');

const files = new Map();
const assetTypes = new Set(['.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.mp4', '.vtt', '.woff2']);
async function add(relative, target = relative) {
  const source = path.join(root, relative);
  const info = await lstat(source);
  if (!info.isFile() || info.isSymbolicLink()) throw new Error(`Fonte pública inválida: ${relative}`);
  if (info.size > 25 * 1024 * 1024) throw new Error(`Arquivo acima do limite de 25 MiB: ${relative}`);
  files.set(target, await readFile(source));
}
async function collect(relative) {
  const directory = await lstat(path.join(root, relative));
  if (!directory.isDirectory() || directory.isSymbolicLink()) throw new Error(`Pasta pública inválida: ${relative}`);
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const file = `${relative}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Link simbólico não permitido: ${file}`);
    if (entry.isDirectory()) await collect(file);
    else if (assetTypes.has(path.extname(entry.name).toLowerCase()) || /-LICENSE\.txt$/i.test(entry.name)) await add(file);
  }
}
for (const file of ['index.html', '404.html', 'style.css', 'script.js', 'config.js', 'orcamento.js', 'favicon.svg', 'robots.txt', 'sitemap.xml']) await add(file);
for (const directory of ['assets', 'servicos', 'projetos']) await collect(directory);
await add('deploy/cloudflare/_headers', '_headers');

// A cópia estática não oferece login nem consulta uma API que não será hospedada.
// O index.html original e a integração V5 permanecem intactos no projeto.
let html = files.get('index.html').toString('utf8');
for (const expression of [
  /\s*<script\b[^>]*src="solicitacoes\.js[^\"]*"[^>]*>\s*<\/script>/g,
  /<a\b(?=[^>]*\bid="account-link")[^>]*>.*?<\/a>/gs,
  /\s*<section\b(?=[^>]*\bid="backend-contact")[^>]*>.*?<\/section>/gs
]) {
  if ([...html.matchAll(expression)].length !== 1) throw new Error('A estrutura da integração V5 mudou; revise a cópia estática.');
  html = html.replace(expression, '');
}
files.set('index.html', Buffer.from(html));
if (files.size > 20_000) throw new Error('Pacote acima do limite de arquivos do plano gratuito.');

const dist = path.join(root, 'dist');
const output = path.join(dist, 'site');
const marker = path.join(dist, '.site-public-build');
const markerText = 'dsaol-public-static-v1\n';
async function inspect(file) {
  try { return await lstat(file); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function assertDirectory(file) {
  const info = await inspect(file);
  if (info && (!info.isDirectory() || info.isSymbolicLink())) throw new Error('O destino deve ser uma pasta local, sem links simbólicos.');
  return info;
}
await assertDirectory(dist);
const exists = await assertDirectory(output);
const markerInfo = await inspect(marker);
if (markerInfo && (!markerInfo.isFile() || markerInfo.isSymbolicLink() || await readFile(marker, 'utf8') !== markerText)) {
  throw new Error('Marcador do pacote inválido. Nenhum arquivo foi alterado.');
}
const directories = new Set();
for (const file of files.keys()) {
  let directory = path.posix.dirname(file);
  while (directory !== '.') { directories.add(directory); directory = path.posix.dirname(directory); }
}
async function inspectExisting(relative = '') {
  for (const entry of await readdir(path.join(output, relative), { withFileTypes: true })) {
    const file = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error('O pacote existente contém um link simbólico.');
    if (entry.isDirectory()) {
      if (!directories.has(file)) throw new Error(`Pasta inesperada em dist/site: ${file}. Revise-a antes de publicar.`);
      await inspectExisting(file);
    } else if (!files.has(file)) throw new Error(`Arquivo inesperado em dist/site: ${file}. Revise-o antes de publicar.`);
  }
}
if (exists) {
  if (!markerInfo) {
    throw new Error('dist/site já existe e não foi identificado como pacote gerado. Nenhum arquivo foi alterado.');
  }
  await inspectExisting();
}
await mkdir(output, { recursive: true });
if (!markerInfo) await writeFile(marker, markerText, { flag: 'wx' });
for (const [relative, content] of files) {
  const destination = path.join(output, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content);
}
console.log(`Pacote estático gerado: dist/site (${files.size} arquivos).`);
console.log('Backend, .env, banco, autenticação e documentação não foram copiados. Nenhum deploy ou alteração de DNS foi executado.');
