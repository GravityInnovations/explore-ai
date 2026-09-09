import {spawn} from 'node:child_process';import path from 'node:path';import {createInterface} from 'node:readline';

// Read-only Codex app-server query: no model turn, account change or project write.
if(!process.argv[2])throw new Error('Usage: node scripts/check-discovery.mjs <installed-target-project>');
const cwd=path.resolve(process.argv[2]);
const child=spawn(process.env.CODEX_BIN??'codex',['app-server','--listen','stdio://'],{cwd,stdio:['pipe','pipe','pipe'],windowsHide:true});
const lines=createInterface({input:child.stdout});const pending=new Map();let counter=0;
child.stderr.resume();
function request(method,params){const id=++counter;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});child.stdin.write(JSON.stringify({id,method,params})+'\n');});}
lines.on('line',line=>{try{const message=JSON.parse(line);const item=pending.get(message.id);if(item){pending.delete(message.id);message.error?item.reject(new Error(JSON.stringify(message.error))):item.resolve(message.result);}}catch{}});
const fail=error=>{for(const item of pending.values())item.reject(error);pending.clear();};
child.on('error',fail);child.on('exit',code=>fail(new Error(`Codex app-server exited (${code})`)));
const timeout=setTimeout(()=>{fail(new Error('Codex discovery timed out'));child.kill();},20000);
try{
 await request('initialize',{clientInfo:{name:'explain-ai-discovery',version:'0.1.0'}});
 child.stdin.write(JSON.stringify({method:'initialized'})+'\n');
 const result=await request('skills/list',{cwds:[cwd],forceReload:true});
 const matches=(result.data??[]).flatMap(entry=>(entry.skills??[]).filter(skill=>skill.name==='explain-ai').map(skill=>({cwd:entry.cwd,name:skill.name,path:skill.path,scope:skill.scope,enabled:skill.enabled})));
 if(matches.length!==1||matches[0].enabled===false)throw new Error(`Expected one enabled ExplainAI skill, found ${matches.length}`);
 const expected=path.join(cwd,'.agents','skills','explain-ai','SKILL.md');
 if(path.resolve(matches[0].path).toLowerCase()!==expected.toLowerCase())throw new Error('Discovered a different ExplainAI installation');
 console.log(JSON.stringify({discovered:true,...matches[0]},null,2));
}catch(error){console.error(error.message);process.exitCode=1;}finally{clearTimeout(timeout);lines.close();child.stdin.end();child.kill();}
