import {test,before,after} from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';
import ts from 'typescript';import {Box3,Vector3,PerspectiveCamera} from 'three';import {fixture} from './fixtures.mjs';
let directory,createLessonController,frameBounds;
before(async()=>{
 await mkdir(path.resolve('.tmp'),{recursive:true});
 directory=await mkdtemp(path.resolve('.tmp/runtime-'));
 for(const name of ['controller','camera']){
  const source=await readFile(new URL(`../skills/explain-ai/assets/templates/${name}.ts`,import.meta.url),'utf8');
  await writeFile(path.join(directory,`${name}.mjs`),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
 }
 ({createLessonController}=await import(pathToFileURL(path.join(directory,'controller.mjs'))));
 ({frameBounds}=await import(pathToFileURL(path.join(directory,'camera.mjs'))));
});
after(async()=>{if(directory)await rm(directory,{recursive:true,force:true});});
function setup(){const f=fixture();let state=0,disposed=0;const adapter={resetBaseline(){state=0;},handlers:{highlight(a,p){state+=p;}},camera(){},render(){},dispose(){disposed++;}};return{...f,adapter,get state(){return state;},get disposed(){return disposed;}};}
test('repeat and reverse seeking never accumulate scene state',()=>{const f=setup();const c=createLessonController(f.lesson,f.design,f.adapter);c.seek(0.8);assert.equal(f.state,0.8);c.seek(0.8);assert.equal(f.state,0.8);c.seek(0.2);assert.equal(f.state,0.2);c.seek(1);assert.equal(f.state,1);});
test('weighted steps, direct jumps and reduced motion sample deterministic endpoints',()=>{const f=setup();f.lesson.steps[0].scrollUnits=1;f.lesson.steps.push({...f.lesson.steps[0],id:'next',scrollUnits:3});const c=createLessonController(f.lesson,f.design,f.adapter);assert.deepEqual(c.seek(0.25),{index:1,progress:0});assert.deepEqual(c.seek(0.5),{index:1,progress:1/3});assert.deepEqual(c.showStep(0,0.25,true),{index:0,progress:1});assert.equal(f.state,1);});
test('missing handlers and invalid progress fail instead of silently dropping actions',()=>{const f=setup();assert.throws(()=>createLessonController(f.lesson,f.design,{...f.adapter,handlers:{}}),/Missing action/);const c=createLessonController(f.lesson,f.design,f.adapter);assert.throws(()=>c.seek(NaN));assert.throws(()=>c.showStep(-1));});
test('owned resources dispose exactly once and further sampling is rejected',()=>{const f=setup();const c=createLessonController(f.lesson,f.design,f.adapter);c.dispose();c.dispose();assert.equal(f.disposed,1);assert.throws(()=>c.seek(0.5),/disposed/);});
test('camera bounds fitting accounts for narrow viewports without mutating camera',()=>{const bounds=new Box3(new Vector3(-1,-1,-1),new Vector3(1,1,1));const camera=new PerspectiveCamera(50,2,0.1,100);camera.position.set(0,0,5);const wide=frameBounds(bounds,camera,'close');camera.aspect=0.5;const narrow=frameBounds(bounds,camera,'close');assert.ok(narrow.position.length()>wide.position.length());assert.deepEqual(camera.position.toArray(),[0,0,5]);assert.ok(narrow.near>0);assert.ok(narrow.far>narrow.position.length());assert.throws(()=>frameBounds(new Box3(),camera));});
