import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import Ajv from '../skills/explain-ai/node_modules/ajv/dist/2020.js';

test('all contracts compile in strict Draft 2020-12 mode', async () => {
  const ajv = new Ajv({ strict: true });
  const folder = new URL('../skills/explain-ai/schemas/', import.meta.url);
  const schemas = await Promise.all((await readdir(folder)).map(async name => JSON.parse(await readFile(new URL(name, folder), 'utf8'))));
  schemas.forEach(schema => ajv.addSchema(schema));
  schemas.forEach(schema => assert.equal(typeof ajv.getSchema(schema.$id), 'function'));
});
