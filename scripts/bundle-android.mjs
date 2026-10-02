import {cp,mkdir,rm,readFile} from 'node:fs/promises';
const source='dist/client',target='android/app/src/main/assets/game';
await readFile(source+'/index.html');await rm(target,{recursive:true,force:true});await mkdir(target,{recursive:true});await cp(source,target,{recursive:true});
console.log('Bundled complete game, scripts, styles and GLB models into Android assets');
