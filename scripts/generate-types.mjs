import { compileFromFile } from 'json-schema-to-typescript';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const base = new URL('../skills/explain-ai/', import.meta.url);
await mkdir(new URL('types/', base), { recursive: true });
for (const name of ['project', 'design', 'asset-index', 'runtime', 'lesson']) {
  const source = fileURLToPath(new URL(`schemas/${name}.schema.json`, base));
  const output = new URL(`types/${name}.d.ts`, base);
  const content = await compileFromFile(source, { bannerComment: '/* Generated from JSON Schema. Run npm run types:generate; do not edit. */', cwd: fileURLToPath(new URL('schemas/', base)) });
  if (process.argv.includes('--check')) {
    if ((await readFile(output, 'utf8')).replaceAll('\r\n','\n') !== content.replaceAll('\r\n','\n')) throw new Error(`Type drift: ${name}; run npm run types:generate`);
  } else await writeFile(output, content);
}
console.log(process.argv.includes('--check') ? 'Type contracts match schemas' : 'Generated five TypeScript contracts');
