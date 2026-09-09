import path from 'node:path';import {pathToFileURL} from 'node:url';
import {readContract} from './contracts.mjs';import {resolveLocal} from './paths.mjs';
export async function findAssets(root,query=''){
 const config=await readContract('project',await resolveLocal(root,'explain-ai.config.json',{file:true}));
 const index=await readContract('asset-index',await resolveLocal(root,`${config.paths.assetLibrary}/index.json`,{file:true}));
 const ids=new Set();for(const a of index.assets){if(ids.has(a.id))throw new Error(`Duplicate asset ID: ${a.id}`);ids.add(a.id);}
 const terms=query.toLocaleLowerCase('en').split(/\s+/).filter(Boolean);const matches=[];
 for(const asset of index.assets){const search=[asset.id,asset.description,...asset.tags].join(' ').toLocaleLowerCase('en');if(terms.every(term=>search.includes(term)))matches.push({...asset,resolvedPath:await resolveLocal(root,`${config.paths.assetLibrary}/${asset.path}`,{file:true})});}
 return matches;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){try{if(!process.argv[2])throw new Error('Usage: find-assets.mjs <project-root> [search terms]');console.log(JSON.stringify(await findAssets(process.argv[2],process.argv.slice(3).join(' ')),null,2));}catch(error){console.error(error.message);process.exitCode=1;}}
