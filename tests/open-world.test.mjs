import assert from 'node:assert/strict';
import * as T from 'three';
import Sim from '../src/js/combat.js';
import {newProfile,makeItem} from '../src/js/rpg.js';
import {initOpenWorld,tickOpenWorld} from '../src/js/open-world.js';
import {currentStory} from '../src/js/story.js';
import {questGoal,findQuestPath} from '../src/quest-navigation.js';
import {HUNTS,hunterState} from '../src/js/hunt-data.js';
import {huntError,tickHunt} from '../src/js/hunters.js';
import {regionDestination} from '../src/js/region-travel.js';
import {biomeColor} from '../src/terrain-world.js';
import {buildDarkWorld} from '../src/dark-world.js';
import {LORE} from '../src/js/wilderness-data.js';
const fresh=(sandbox=false)=>new Sim('katana',{sandbox}).attachProfile(newProfile('sandbox-test','Tester','katana'),425,'sandbox-test');
{
 const s=fresh(),p=s.profile;p.inventory.push(makeItem('kept','head',12,'rare','katana','keep'));p.gold=s.gold=345;p.materials={scrap:42,alloy:7,crystal:3};
 const retained=structuredClone({inventory:p.inventory,equipment:p.equipment,materials:p.materials,skills:p.skills,gold:p.gold});
 delete s.openWorldVersion;s.profile.hunters.destination='crystal';s.huntRun={id:'crystal',stage:1};initOpenWorld(s);
 assert.deepEqual({inventory:p.inventory,equipment:p.equipment,materials:p.materials,skills:p.skills,gold:p.gold},retained);
 assert.equal(s.huntRun,null);assert.equal(currentStory(p),null);assert.equal(questGoal(s),null);assert.equal(p.hunters.destination,null);
 const n=s.enemies.length;initOpenWorld(s);assert.equal(s.enemies.length,n);
 const copy=Sim.restore(s.exportState());assert.deepEqual(copy.exportState(),s.exportState());
 for(const id of ['saffron','whitewind','brasswater',...HUNTS.map(h=>h.id)]){const goal=regionDestination(id);assert(goal);assert(findQuestPath(s,goal),id+' is connected');}
 assert.equal(regionDestination('constructor'),null);
 console.log('PASS save migration, preserved possessions, no quests and connected regions/lairs');
}
{
 const s=fresh(true);for(const h of HUNTS)for(const tier of ['standard','veteran']){
 Object.assign(s.player,h.entry);assert.equal(huntError(s,h.id,tier),'');assert(s.hunterAction('start',h.id,tier));tickHunt(s);
 for(let stage=0;stage<3;stage++){assert.equal(s.huntRun.stage,stage);for(const e of s.enemies.filter(e=>e.group===s.huntRun.group&&!e.dead))s.killEnemy(e,{kind:'skill',step:0});tickHunt(s);}
 assert(s.huntRun.completed);assert(!s.huntRun.objectiveReady);const before=structuredClone(s.profile);tickHunt(s);assert.deepEqual(s.profile,before);
 }for(const h of HUNTS)assert.equal(hunterState(s.profile).fragments[h.id],5);
 hunterState(s.profile).fragments.crystal=7;const before=s.profile.inventory.length;assert(s.hunterAction('craft','gale'));assert.equal(hunterState(s.profile).fragments.crystal,1);assert.equal(s.profile.inventory.length,before+1);assert(!s.hunterAction('craft','gale'));
 assert.equal(questGoal(s),null);
 console.log('PASS all lairs at both difficulties without quest gates; automatic stages, single awards, crafting');
}
{
 const s=fresh(),g=s.groups.find(g=>g.id.startsWith('wild:'));for(const e of s.enemies.filter(e=>e.group===g.id))e.dead=true;g.cleared=true;
 Object.assign(s.player,{x:g.x,y:g.y});tickOpenWorld(s,0);const at=g.respawnAt;assert.equal(at,s.time+90);s.time=at+1;tickOpenWorld(s,0);assert(g.cleared,'no respawn on top of player');s.player.x=-3200;s.player.y=1600;tickOpenWorld(s,0);assert(!g.cleared);const n=s.enemies.filter(e=>!e.dead&&e.group===g.id).length;assert.equal(n,g.units.length);tickOpenWorld(s,0);assert.equal(s.enemies.filter(e=>!e.dead&&e.group===g.id).length,n);
 s.drainEvents();Object.assign(s.player,LORE[0]);tickOpenWorld(s,0);assert(s.drainEvents().some(e=>e.type==='notice'));tickOpenWorld(s,0);assert.equal(s.drainEvents().length,0);
 const low=s.enemies.find(e=>e.level===1),high=s.enemies.find(e=>e.level>=15);assert(high.damageScale>low.damageScale);
 console.log('PASS safe timed camp respawns, no duplication, lore cooldown and regional threat');
}
{
 for(const [x,z] of [[76,-19],[46,7],[82,-29]]){const a=biomeColor(x-.001,z),b=biomeColor(x+.001,z);assert(Math.abs(a.r-b.r)+Math.abs(a.g-b.g)+Math.abs(a.b-b.b)<.001);}
 const scene=new T.Scene();buildDarkWorld(scene);scene.updateMatrixWorld(true);let meshes=0;scene.traverse(o=>{if(o.isMesh){meshes++;assert(o.geometry.attributes.position.array.every(Number.isFinite));}});assert(meshes>5);const terrain=scene.getObjectByName('continuous-biome-terrain');assert(terrain);
 for(const [x,z] of [[48,6.5],[66,-14.5],[82.5,-29.5]]){const ray=new T.Raycaster(new T.Vector3(x,10,z),new T.Vector3(0,-1,0));assert(ray.intersectObject(terrain).length,'continuous floor at '+x+','+z);}
 console.log('PASS finite world geometry, continuous biome colors and region floors');
}
