import {test} from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';import path from 'node:path';import os from 'node:os';
import {findAssets} from '../skills/explain-ai/scripts/find-assets.mjs';import {fixture} from './fixtures.mjs';
test('asset search reuses indexed local files and narrows by all query terms',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'explain-ai-assets-'));try{
  const f=fixture();await writeFile(path.join(root,'explain-ai.config.json'),JSON.stringify(f.config));await mkdir(path.join(root,'asset-library'));
  f.index.assets=[{id:'shape-diagram',type:'image',path:'diagram.svg',tags:['shape','maths'],description:'A labelled diagram',license:'MIT',source:'original fixture'}];
  await writeFile(path.join(root,'asset-library/index.json'),JSON.stringify(f.index));await writeFile(path.join(root,'asset-library/diagram.svg'),'<svg/>');
  assert.equal((await findAssets(root,'SHAPE maths'))[0].id,'shape-diagram');assert.deepEqual(await findAssets(root,'biology'),[]);
  await rm(path.join(root,'asset-library/diagram.svg'));await assert.rejects(findAssets(root,'shape'),{code:'ENOENT'});
 }finally{await rm(root,{recursive:true,force:true});}
});
