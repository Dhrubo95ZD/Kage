import assert from 'node:assert/strict';
import * as T from 'three';
import Sim from '../src/js/combat.js';
import {newProfile,makeItem,stats} from '../src/js/rpg.js';
import {HUNTS,HUNT_KEEPER,HUNT_BY_ID,SIGNATURES,hunterState,visualProfile,rememberAppearance} from '../src/js/hunt-data.js';
import {huntError,tickHunt,huntInteract,signatureItem,signatureAttack,signatureMultiplier,afterSignatureHit,huntObjective} from '../src/js/hunters.js';
import {LEVEL,inFloor} from '../src/js/level.js';
import {applyCommands} from '../src/js/commands.js';
import {gearMesh,disposeGear} from '../src/gear-visuals.js';
import {buildHuntScenery} from '../src/hunt-scenery.js';
import {huntsView,lootJournalView,wardrobeView,loadoutsView,catalogItems} from '../src/hunter-ui.js';
import {itemFacts,itemSummary} from '../src/item-info.js';
import {lootLabelIds} from '../src/combat-hud.js';
const fresh=(classId='katana')=>{const p=newProfile('hunt','Hunter',classId);p.level=15;p.story={version:2,stage:9,journal:[],flags:{}};const s=new Sim(classId,{sandbox:true}).attachProfile(p,425,'hunt-test');Object.assign(s.player,HUNT_KEEPER);return s;};
const killStage=s=>{for(const e of s.enemies.filter(e=>!e.dead&&e.group===s.huntRun.group))s.killEnemy(e,{kind:'skill',step:0});tickHunt(s);};
function finish(s,h,tier='standard'){Object.assign(s.player,HUNT_KEEPER);assert(s.hunterAction('start',h.id,tier));assert.equal(s.huntRun.stage,-1);Object.assign(s.player,h.entry);tickHunt(s);assert.equal(s.huntRun.stage,0);assert(!huntInteract(s));killStage(s);assert.equal(s.huntRun.stage,1);killStage(s);assert(s.huntRun.objectiveReady);assert(!huntInteract(s));Object.assign(s.player,h.stages[1]);assert(huntInteract(s));assert.equal(s.huntRun.stage,2);assert(!huntInteract(s));killStage(s);assert(s.huntRun.completed);}
{
 const s=fresh();assert(huntError(s,'constructor'));assert(!s.hunterAction('start','constructor','standard'));assert(!s.hunterAction('start','crystal','invalid'));s.profile.level=1;assert(huntError(s,'crystal'));s.profile.level=15;s.player.x=0;assert(huntError(s,'crystal'));Object.assign(s.player,HUNT_KEEPER);assert(huntError(s,'crystal','veteran'));assert(!s.hunterAction('craft','gale'));assert(!s.hunterAction('look',null,{outfit:'master',dye:'original',slots:{}}));
}
{
 const s=fresh();for(const h of HUNTS){finish(s,h);const state=structuredClone(s.profile),loot=s.loot.length;for(let i=0;i<10;i++)tickHunt(s);assert.deepEqual(s.profile,state);assert.equal(s.loot.length,loot);assert.equal(hunterState(s.profile).fragments[h.id],2);assert(hunterState(s.profile).outfits.includes(h.outfit));assert(s.chests.some(c=>c.id.startsWith('hunt-cache-')&&!c.opened));finish(s,h,'veteran');assert.equal(hunterState(s.profile).fragments[h.id],5);}
 assert(hunterState(s.profile).outfits.includes('master'));assert.equal(s.chests.filter(c=>c.id.startsWith('hunt-cache-')&&!c.opened).length,6);const restored=Sim.restore(s.exportState());assert.deepEqual(s.exportState(),restored.exportState());
}
{
 const s=fresh();finish(s,HUNTS[0]);finish(s,HUNTS[0]);finish(s,HUNTS[0]);assert.equal(hunterState(s.profile).fragments.crystal,6);assert(s.hunterAction('craft','gale'));assert.equal(hunterState(s.profile).fragments.crystal,0);assert(!s.hunterAction('craft','gale'));const i=s.profile.inventory.find(i=>i.huntSignature==='gale');assert(i.locked);assert(!s.salvageItem(i.id));assert(hunterState(s.profile).discovered.includes('gale'));assert(s.equipItem(i.id));s.profile.inventory.push(makeItem('higher','weapon',20,'legendary','katana','keep'));s.equipBest();assert.equal(s.profile.equipment.weapon.id,i.id);
 s.profile.materials={scrap:120,alloy:16,crystal:0};const hp=s.player.hp=100;assert(s.hunterAction('temper',i.id,'swift'));assert.equal(s.build.attackSpeed,.06);assert.equal(s.player.hp,hp);assert(!s.hunterAction('temper',i.id,'swift'));assert(s.hunterAction('temper',i.id,'guard'));assert.equal(s.build.attackSpeed,0);assert.equal(s.profile.materials.scrap,0);assert.equal(s.player.hp,hp);
}
{
 const s=fresh();const i=makeItem('collected','head',8,'rare','katana','keep');s.profile.inventory.push(i);rememberAppearance(s.profile,i);const key=Object.keys(hunterState(s.profile).appearances).find(k=>k.startsWith('head'));assert(s.salvageItem(i.id));assert(hunterState(s.profile).appearances[key]);const hp=s.player.hp=100,before=stats(s.profile);hunterState(s.profile).outfits.push('surveyor');assert(s.hunterAction('look',null,{outfit:'surveyor',dye:'indigo',slots:{}}));assert.deepEqual(stats(s.profile),before);assert.equal(s.player.hp,hp);assert.equal(visualProfile(s.profile).equipment.chest.visualCloth,'#343e68');assert(!s.hunterAction('look',null,{outfit:'surveyor',dye:'bad',slots:{}}));
 assert(s.hunterAction('savePreset','0'));const weapon=s.profile.equipment.weapon;const replacement=makeItem('replacement','weapon',10,'rare','katana','keep');s.profile.inventory.push(replacement);assert(s.equipItem(replacement.id));assert(s.hunterAction('loadPreset','0'));assert.equal(s.profile.equipment.weapon.id,weapon.id);assert.equal(s.player.hp,hp);assert(s.equipItem(replacement.id));s.profile.inventory=s.profile.inventory.filter(i=>i.id!==weapon.id);const snapshot=structuredClone(s.profile);assert(!s.hunterAction('loadPreset','0'));assert.deepEqual(s.profile,snapshot);
}
{
 const s=fresh();const commands=[{op:'hunter',action:'filter',id:'useful'},{op:'hunter',action:'savePreset',id:'0'},{op:'hunter',action:'look',value:{outfit:null,dye:'cedar',slots:{}}},{op:'hunter',action:'start',id:'convoy',value:'standard'}],copy=Sim.restore(s.exportState());applyCommands(s,commands);applyCommands(copy,commands);assert.deepEqual(s.exportState(),copy.exportState());assert(!s.hunterAction('start','crystal','standard'));
}
{
 for(const spec of SIGNATURES){const s=fresh(spec.classId),item=signatureItem(s,spec.id);s.profile.inventory.push(item);assert(s.equipItem(item.id));const d=signatureAttack(s,{damage:100,duration:1,active:.2,reach:200,slam:true,pulses:1,shape:spec.classId==='pistols'?'bullet':'arc',arc:2},'skill');assert.equal(d.huntSignature,spec.id);assert(Number.isFinite(d.damage)&&Number.isFinite(d.duration)&&d.damage>0);assert(itemFacts(item).tradeoff.length>10);assert(itemSummary(item).includes('data-item-explain'));const mesh=gearMesh('weapon',item,spec.classId);assert(new T.Box3().setFromObject(mesh).getSize(new T.Vector3()).length()>0);disposeGear(mesh);}
 const s=fresh();s.profile.equipment.weapon=signatureItem(s,'gale');s.player.x=s.player.y=0;const e=s.addEnemy('raider',100,0);e.wind=.2;e.attackX=e.attackY=0;assert(s.input('dash'));const d=signatureAttack(s,{damage:100,duration:1,active:.2,reach:200},'dashAttack');assert.equal(d.damage,150);assert.equal(d.reach,340);
 for(const [id,enemy,expected] of [['silk',{z:50},1.5],['breach',{broken:1},1.6],['mercy',{hp:20,maxHp:100},1.7],['anchor',{},1.35]])assert.equal(signatureMultiplier(s,{def:{huntSignature:id}},enemy),expected);
 const t=fresh('twins');const a={id:1,pulses:0,kind:'normal',def:{huntSignature:'copper'}};for(let i=0;i<7;i++)afterSignatureHit(t,a,{id:i},10);assert.equal(t.player.huntRhythm,5);const skill=signatureAttack({...t,profile:{...t.profile,equipment:{weapon:{huntSignature:'copper'}}}},{damage:100,duration:1,active:.2},'skill');assert.equal(skill.damage,150);assert.equal(t.player.huntRhythm,0);
}
{
 const s=fresh('pistols');s.player.x=s.player.y=0;s.player.angle=0;s.profile.equipment.weapon=signatureItem(s,'glasswing');s.applyStats();const first=s.addEnemy('brute',200,0),second=s.addEnemy('brute',200,210);first.trainingDummy=second.trainingDummy=true;first.hp=first.maxHp=second.hp=second.maxHp=10000;assert(s.input('attack'));for(let i=0;i<60;i++)s.update(.02);assert(first.hp<10000,'first bullet hits');assert(second.hp<10000,'ricochet hits off-axis second target');assert.equal(s.bullets.length,0);
}
{
 const s=fresh();assert(s.hunterAction('train'));const dummy=s.enemies.find(e=>e.trainingDummy),beforeXP=s.profile.xp;dummy.hp=1;Object.assign(s.player,{x:dummy.x-75,y:dummy.y,angle:0});s.strike({id:7,pulses:0,step:0,kind:'normal',def:{damage:100,name:'Test',reach:200,arc:3}});assert.equal(dummy.hp,1);assert(!dummy.dead);assert.equal(s.profile.xp,beforeXP);assert.equal(s.loot.length,0);assert(s.training.damage>0);assert(huntObjective(s).detail.includes('DPS'));assert(s.hunterAction('endTraining'));assert(!s.training);
}
{
 const s=fresh();s.player.x=s.player.y=0;const ordinary=s.drop(0,0,'equipment');ordinary.item=makeItem('basic','head',1,'common','katana','approach');const named=s.drop(1,0,'equipment');named.item=signatureItem(s,'gale');s.hunterAction('filter','signature');assert.deepEqual([...lootLabelIds(s)],[named.id]);assert.equal(s.loot.length,2);s.hunterAction('filter','all');assert.equal(lootLabelIds(s).size,2);assert(huntsView(s).includes('WHAT DOES IT DO?'));assert(lootJournalView(s).includes('Trade-off:'));assert(wardrobeView(s.profile).includes('APPLY LOOK'));assert(loadoutsView(s).includes('Saved equipment is locked'));assert.equal(catalogItems(s.profile).length,12);
}
// All new entrances and objectives are connected to Saffron with player clearance.
{
 const step=50,queue=[[Math.round(HUNT_KEEPER.x/step),Math.round(HUNT_KEEPER.y/step)]],seen=new Set([queue[0].join(',')]);for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(!seen.has(k)&&inFloor(nx*step,ny*step,20)&&!LEVEL.obstacles.some(o=>Math.hypot(o.x-nx*step,o.y-ny*step)<o.r+23)){seen.add(k);queue.push([nx,ny]);}}}for(const h of HUNTS)for(const p of [h.entry,...h.stages]){assert(inFloor(p.x,p.y,20),h.id+' on floor');assert(queue.some(([x,y])=>Math.hypot(x*step-p.x,y*step-p.y)<100),h.id+' connected');}
 const scene=new T.Scene(),scenery=buildHuntScenery(scene);scenery.update({huntRun:{id:'crystal',objectiveDone:true}});assert(scene.children.length>3);scene.traverse(o=>{if(o.isMesh){assert(o.geometry.attributes.position.array.every(Number.isFinite));o.geometry.dispose();o.material.dispose();}});
}
console.log('PASS Hunter’s Road: all hunts/tier gates, objective interactions, single-award rewards, retained chests, fragments/crafting, wardrobe ownership, salvage collection, atomic presets, save replay, 12 signature effects, ricochet, harmless training, loot filters, mobile explanations and connected routes');
// Dungeon discovery works from the loot journal and the physical entrance.
for(const h of HUNTS){const s=fresh();s.profile.caravan={started:true,stage:9};Object.assign(s.player,{x:5200,y:800});const before=structuredClone(hunterState(s.profile).fragments);const command={op:'hunter',action:'trackDungeon',id:h.id};const replay=Sim.restore(s.exportState());applyCommands(s,[command]);applyCommands(replay,[command]);assert.deepEqual(s.exportState(),replay.exportState());assert.equal(huntObjective(s).x,h.entry.x);assert.deepEqual(hunterState(s.profile).fragments,before);Object.assign(s.player,h.entry);assert.equal(huntError(s,h.id),'');assert(s.hunterAction('start',h.id,'standard'));tickHunt(s);assert.equal(s.huntRun.stage,0);assert(!s.hunterAction('trackDungeon','cinder'));killStage(s);killStage(s);Object.assign(s.player,h.stages[1]);assert(huntInteract(s));assert(s.enemies.some(e=>!e.dead&&e.displayName===h.bossName));killStage(s);assert.equal(hunterState(s.profile).fragments[h.id],2);tickHunt(s);assert.equal(hunterState(s.profile).fragments[h.id],2);assert(s.hunterAction('trackDungeon',h.id));Object.assign(s.player,h.entry);assert(s.hunterAction('start',h.id,'standard'));tickHunt(s);assert(s.enemies.some(e=>!e.dead&&e.group===s.huntRun.group));}
console.log('PASS entrance-start dungeons, discoverable boss destination, saved tracking, guaranteed fragments once and repeat spawns');
{
 const s=fresh(),h=HUNTS[0];Object.assign(s.player,h.entry);s.projectiles.push({x:99999,y:99999});const enemy=s.addEnemy('spider',h.entry.x+800,h.entry.y,'unrelated');enemy.active=true;assert(!s.canEditTree());assert.equal(huntError(s,h.id),'','distant combat cannot lock dungeon entry');const hp=s.player.hp;assert(s.hunterAction('start',h.id,'standard'));assert.equal(s.player.hp,hp);assert(s.enemies.includes(enemy),'world threats are preserved');assert.equal(s.projectiles.length,1,'projectiles are not erased');tickHunt(s);let remaining=s.enemies.filter(e=>e.group===s.huntRun.group&&!e.dead);assert(remaining.some(e=>e.x===huntObjective(s).x&&e.y===huntObjective(s).y),'tracker points at living enemy');killStage(s);killStage(s);assert.equal(huntObjective(s).x,h.stages[1].x);assert.equal(huntObjective(s).y,h.stages[1].y);assert(s.huntRun.objectiveReady);s.player.dead=true;assert(!huntInteract(s));s.huntRun.completed=true;assert(huntError(s,h.id).includes('Revive'));
}
console.log('PASS dungeon entry is independent of tree safety; world threats retained; enemy-to-mechanism objective handoff');
{
 const s=fresh();s.enemies=[];hunterState(s.profile).fragments.crystal=7;const html=huntsView(s);assert(html.includes('7 owned'));assert(html.includes('data-craft="gale"'));assert(html.includes('You will keep 1 fragment.'));const old=s.profile.inventory.length;assert(s.hunterAction('craft','gale'));assert.equal(hunterState(s.profile).fragments.crystal,1);assert.equal(s.profile.inventory.length,old+1);assert.equal(s.profile.inventory.at(-1).huntSignature,'gale');assert(!s.hunterAction('craft','gale'));assert.equal(hunterState(s.profile).fragments.crystal,1);assert(huntsView(s).includes('Earn 5 more matching fragments'));
}
console.log('PASS craft directly from dungeon card, 7 owned / 6 cost, 1 retained and insufficient-repeat prevention');

// Crafting changes inventory only; nearby danger must not freeze the recipe UI.
{
 const s=fresh();hunterState(s.profile).fragments.crystal=7;
 const e=s.addEnemy('raider',s.player.x+100,s.player.y);e.active=true;
 assert.equal(s.canEditTree(),false);
 const html=lootJournalView(s);assert.match(html,/data-craft="gale" >/);
 assert(html.includes('CONTINUE STORY'));assert(!html.includes('Move away from combat, then craft'));
 const hp=s.player.hp,equipment=structuredClone(s.profile.equipment),copy=Sim.restore(s.exportState());
 const commands=[{op:'hunter',action:'craft',id:'gale'}];
 applyCommands(s,commands);applyCommands(copy,commands);
 assert.deepEqual(s.exportState(),copy.exportState());
 assert.equal(hunterState(s.profile).fragments.crystal,1);
 assert.equal(s.profile.inventory.filter(i=>i.huntSignature==='gale').length,1);
 assert.equal(s.player.hp,hp);assert.deepEqual(s.profile.equipment,equipment);
 assert(!s.hunterAction('craft','gale'));
 hunterState(s.profile).fragments.crystal=7;
 s.profile.inventory=Array.from({length:30},(_,i)=>makeItem('full'+i,'head',1,'common','katana','keep'));
 assert(!s.hunterAction('craft','gale'));assert.equal(hunterState(s.profile).fragments.crystal,7);
 assert(lootJournalView(s).includes('BACKPACK FULL'));
 assert.match(lootJournalView(s),/data-craft="gale" disabled/);
}
