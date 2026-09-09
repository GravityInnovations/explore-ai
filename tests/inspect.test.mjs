import {test} from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';import path from 'node:path';import os from 'node:os';
import {inspectProject} from '../skills/explain-ai/scripts/inspect.mjs';import {fixture} from './fixtures.mjs';
test('inspection detects missing, unconfigured and ready profiles without rewriting',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'explain-ai-inspect-'));try{
  assert.equal((await inspectProject(root)).design.status,'missing');
  const f=fixture();await mkdir(path.join(root,'design'));const profile=path.join(root,'design/profile.json');const bytes=JSON.stringify(f.design,null,2)+'\n';await writeFile(profile,bytes);
  assert.equal((await inspectProject(root)).design.status,'unconfigured');
  await writeFile(path.join(root,'explain-ai.config.json'),JSON.stringify(f.config));
  const result=await inspectProject(root);assert.equal(result.design.status,'ready');assert.equal(result.design.sha256.length,64);assert.equal(await readFile(profile,'utf8'),bytes);
 }finally{await rm(root,{recursive:true,force:true});}
});
