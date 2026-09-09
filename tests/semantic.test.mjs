import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './fixtures.mjs';
import { validateSemantics, validateDesign } from '../skills/explain-ai/scripts/validate.mjs';
const check=f=>validateSemantics(f.lesson,f.design,f.index,f.runtime);
test('coherent semantic package passes',()=>assert.deepEqual(check(fixture()),[]));
for(const [name,mutate,match] of [
 ['unknown target',f=>f.lesson.steps[0].actions[0].target='shape.missing',/Unknown semantic/],
 ['unsupported action',f=>f.runtime.actions=[],/does not support/],
 ['component capability',f=>f.runtime.components[0].actions=[],/Component/],
 ['design inheritance',f=>f.lesson.designId='different',/inherit/],
 ['missing emphasis',f=>{f.lesson.steps[0].camera={mode:'wide',target:'shape'};f.lesson.steps[0].actions=[{action:'reveal',target:'shape.part'}];},/emphasis/],
 ['hidden explanation',f=>f.lesson.steps[0].actions.push({action:'hide',target:'shape'}),/hidden/],
 ['broken parent',f=>f.lesson.objects[1].parent='missing',/Parent/],
 ['duplicate object',f=>f.lesson.objects.push(f.lesson.objects[0]),/Duplicate/],
 ['missing asset',f=>f.lesson.objects[0].assetId='absent',/Unknown asset/],
 ['zero cut plane',f=>f.lesson.steps[0].actions.push({action:'cutaway',target:'shape',normal:{x:0,y:0,z:0},constant:0}),/normal cannot/]
])test(`rejects ${name}`,()=>{const f=fixture();mutate(f);assert.match(JSON.stringify(check(f)),match);});
test('design contrast is checked independently from its schema',()=>{const f=fixture();assert.deepEqual(validateDesign(f.design),[]);f.design.colors.text='#ffffff';assert.match(JSON.stringify(validateDesign(f.design)),/contrast/);});
