import Data from './weapons.js';
import {LEVEL,inFloor} from './level.js';
import {wildernessRegion,LORE} from './wilderness-data.js';
export function scaleRegionEnemy(e){if(e.openWorldScaled)return;e.openWorldScaled=true;const r=wildernessRegion(e.homeX,e.homeY);e.level=r.level;e.maxHp=Math.round(Data.enemies[e.type].hp*(1+(r.level-1)*.075));e.hp=e.maxHp;e.damageScale=1+(r.level-1)*.095;}
export function initOpenWorld(sim){
 if(sim.openWorldVersion===1)return;
 sim.openWorldVersion=1;sim.profile.openWorld=true;sim.huntRun=null;sim.profile.hunters.destination=null;sim.millDefense=null;
 sim.enemies=sim.enemies.filter(e=>!e.huntId&&e.group!=='millDefense');sim.groups=sim.groups.filter(g=>!g.id.startsWith('hunt-')&&g.id!=='millDefense');
 for(const e of sim.enemies)scaleRegionEnemy(e);
 // Authored patrol camps fill the travel lanes. Their loot tier follows their region.
 if(!sim.sandbox)for(const [i,x,y,types] of [
 [0,-1800,600,['raider','raider','archer']],[1,-950,-400,['brute','raider','archer']],
 [2,1800,300,['shieldguard','raider','scout']],[3,3200,-450,['brute','shieldguard','archer']],
 [4,6000,700,['ridgebeast','spider','spider']],[5,6590,-1100,['spider','golem','spider']],
 [6,7790,-2520,['ridgebeast','shieldguard','archer']],[7,8610,-1000,['golem','golem','scout']],
 [8,9550,-1800,['shieldguard','golem','archer','scout']]]){
  const id='wild:'+wildernessRegion(x,y).loot+':'+i;if(sim.groups.some(g=>g.id===id))continue;
  const g={id,x,y,aggro:410,units:types.map((t,j)=>[t,(j-1)*115,j%2*120]),alert:false,cleared:false};sim.groups.push(g);
  for(const [type,dx,dy] of g.units){if(!inFloor(x+dx,y+dy,35))continue;const e=sim.addEnemy(type,x+dx,y+dy,id);scaleRegionEnemy(e);}
 }
}
export function tickOpenWorld(sim,dt){
 if(!sim.profile||sim.sandbox)return;
 for(const g of sim.groups){
  if(!g.cleared||!g.units?.length||g.id.startsWith('hunt-'))continue;
  g.respawnAt??=sim.time+(g.units.some(u=>Data.enemies[u[0]].boss)?240:90);
  if(sim.time<g.respawnAt||Math.hypot(sim.player.x-g.x,sim.player.y-g.y)<1000)continue;
  g.cleared=false;g.alert=false;delete g.respawnAt;
  for(const [type,dx,dy] of g.units){const e=sim.addEnemy(type,g.x+dx,g.y+dy,g.id);scaleRegionEnemy(e);}
  for(const c of sim.chests)if(c.guards===g.id&&!c.id.startsWith('hunt-cache-')){c.opened=false;c.openTime=0;}
 }
 if(sim.player.dead)return;
 sim.loreUntil??={};for(const n of LORE)if(Math.hypot(sim.player.x-n.x,sim.player.y-n.y)<190&&(sim.loreUntil[n.id]||0)<=sim.time){sim.loreUntil[n.id]=sim.time+75;sim.emit('notice',{message:n.name+': '+n.text});break;}
}
