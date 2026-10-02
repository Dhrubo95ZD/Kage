import CombatSim from './js/combat.js';
import {CLASSES,newProfile,SLOTS,RARITIES} from './js/rpg.js';
export const isDeviceGame=()=>globalThis.location?.hostname==='appassets.androidplatform.net';
const fail=message=>{throw Error(message);};
export function characterExport(profile){return JSON.stringify({format:'kage-character',version:1,profile},null,2);}
export function parseCharacterExport(text){
 if(typeof text!=='string'||text.length>4*1024*1024)fail('Save file is too large.');
 let data;try{data=JSON.parse(text);}catch{fail('Choose a Kage character JSON file.');}
 if(data.format!=='kage-character'||data.version!==1)fail('Unsupported character file.');
 const p=data.profile;if(!p||!Object.hasOwn(CLASSES,p.classId)||typeof p.name!=='string'||p.name.length<2||p.name.length>20||!Number.isInteger(p.level)||p.level<1||p.level>10000||!Number.isFinite(p.xp)||p.xp<0||!Number.isFinite(p.gold)||p.gold<0||!Array.isArray(p.inventory)||p.inventory.length>1000||!p.equipment)fail('Character data is incomplete.');
 function validate(value,depth=0){if(depth>30)fail('Invalid save structure.');if(typeof value==='number'&&!Number.isFinite(value))fail('Invalid save number.');if(value&&typeof value==='object')for(const [k,v] of Object.entries(value)){if(['__proto__','constructor','prototype'].includes(k))fail('Invalid save field.');validate(v,depth+1);}}
 validate(p);
 for(const i of [...p.inventory,...Object.values(p.equipment).filter(Boolean)])if(!i||!SLOTS.includes(i.slot)||!RARITIES.some(r=>r.id===i.rarity)||!i.stats||!Number.isFinite(i.level)||i.level<1||!['string','number'].includes(typeof i.id))fail('Invalid equipment in save file.');
 if(!p.equipment.weapon)fail('Character has no weapon.');
 return structuredClone(p);
}
export function createDeviceService(storage){return async function request(path,body){
 if(path==='account')return {email:'ON THIS DEVICE · OFFLINE',characters:(await storage.all()).map(r=>r.profile)};
 if(path==='characters'||path==='import'){
  if((await storage.all()).length>=4)fail('Four character slots are already filled.');
  let p;if(path==='import')p=parseCharacterExport(body.text);else{const name=String(body.name||'').trim();if(!/^[\p{L}\p{N} _-]{2,20}$/u.test(name)||!Object.hasOwn(CLASSES,body.classId))fail('Use a 2–20 character name and choose a class.');p=newProfile(crypto.randomUUID(),name,body.classId);}
  p.id=crypto.randomUUID();const sim=new CombatSim(p.classId).attachProfile(p,crypto.getRandomValues(new Uint32Array(1))[0],crypto.randomUUID());
  await storage.put({id:p.id,profile:sim.profile,state:sim.exportState()});return {profile:sim.profile};
 }
 if(path==='run'){
  const row=await storage.get(body.id);if(!row)fail('Character not found on this device.');
  const sim=body.restart?new CombatSim(row.profile.classId).attachProfile(row.profile,crypto.getRandomValues(new Uint32Array(1))[0],crypto.randomUUID()):CombatSim.restore(row.state);
  await storage.put({id:sim.profile.id,profile:sim.profile,state:sim.exportState()});return {state:sim.exportState(),revision:0};
 }
 if(path==='save'){
  const state=body.state;if(!state?.profile?.id)fail('Cannot save this character.');
  await storage.put({id:state.profile.id,profile:state.profile,state});return {saved:true};
 }
 fail('This operation is unavailable offline.');
};}
let database;
function db(){return database??=new Promise((resolve,reject)=>{const r=indexedDB.open('kage-device-saves',1);r.onupgradeneeded=()=>r.result.createObjectStore('characters',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>{database=null;reject(Error('Device storage could not be opened.'));};});}
async function transaction(mode,operation){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('characters',mode),request=operation(tx.objectStore('characters'));let result;request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>resolve(result);tx.onabort=tx.onerror=()=>reject(Error('Device save failed. Free some storage, then retry.'));});}
export const deviceRequest=createDeviceService({all:()=>transaction('readonly',s=>s.getAll()),get:id=>transaction('readonly',s=>s.get(id)),put:row=>transaction('readwrite',s=>s.put(row))});
export function downloadCharacter(profile){const content=characterExport(profile);if(isDeviceGame()&&globalThis.KageAndroid?.exportSave){globalThis.KageAndroid.exportSave(content);return;}const url=URL.createObjectURL(new Blob([content],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='Kage-character.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
