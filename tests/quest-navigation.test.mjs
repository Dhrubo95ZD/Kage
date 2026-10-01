import assert from 'node:assert/strict';
import Combat from '../src/js/combat.js';
import {newProfile} from '../src/js/rpg.js';
import {PEOPLE,personPresent,currentStory} from '../src/js/story.js';
import {questGoal,findQuestPath,clearSegment,QuestWalker} from '../src/quest-navigation.js';
const sim=new Combat().attachProfile(newProfile('nav','Traveler','katana'),42,'chapter');
sim.bossesDefeated.push('captain');
for(const branch of ['orchard','cedar'])for(let stage=0;stage<=9;stage++){
 sim.profile.story.stage=stage;sim.profile.story.choice=branch;const goal=questGoal(sim);const path=findQuestPath(sim,goal);assert(path,`chapter1 ${stage} ${branch}`);let prev=sim.player;for(const p of path){assert(clearSegment(sim,prev,p));prev=p;}assert(Math.hypot(prev.x-goal.x,prev.y-goal.y)<=goal.radius);Object.assign(sim.player,prev);
}
sim.profile.caravan={started:true,stage:0,route:'family',fatherSafe:false};
for(const route of ['family','furnace'])for(let stage=0;stage<=9;stage++){
 const c=sim.profile.caravan;Object.assign(c,{stage,route,fatherSafe:stage>(route==='family'?5:6)});
 const visible=PEOPLE.filter(n=>personPresent(sim.profile,n));assert(visible.filter(n=>['lina','mill','ending','c2-lina','c2-home'].includes(n.id)).length<=1,'one Lina');assert(visible.filter(n=>['c2-rescued','c2-home'].includes(n.id)).length<=1,'one Yusuf');
 const q=currentStory(sim.profile);if(!q)continue;assert(visible.some(n=>n.id===q.target.id),'current NPC present');const path=findQuestPath(sim,questGoal(sim));assert(path,`chapter2 ${stage} ${route}`);if(path.length)Object.assign(sim.player,path.at(-1));
}
sim.profile.caravan.started=false;sim.profile.story.stage=7;sim.bossesDefeated=[];Object.assign(sim.player,{x:2500,y:-2100});assert(findQuestPath(sim,{...currentStory(sim.profile).target,radius:150}),'open hinterland permits exploration around the story bridge');
sim.profile.story.stage=0;Object.assign(sim.player,{x:-2900,y:1500});const walker=new QuestWalker();assert(walker.start(sim));const mv=walker.step(sim,.016);assert(Math.hypot(mv.x,mv.y)>.9);walker.cancel();assert.deepEqual(walker.step(sim,.016),{x:0,y:0});
assert(walker.start(sim));sim.player.dead=true;walker.step(sim,.016);assert.equal(walker.path,null);
console.log('PASS all quest routes, locked gates, story NPC identity handoffs, arrival and cancellation');
// Follow normal simulation steps; navigation never changes position directly.
sim.player.dead=false;sim.profile.story.stage=2;Object.assign(sim.player,{x:-1600,y:1040});sim.enemies.forEach(e=>e.dead=true);assert(walker.start(sim));
const destination=questGoal(sim);let frames=0;while(walker.path&&frames++<5000){const move=walker.step(sim,1/60);sim.update(1/60,move);}assert(frames<5000,'route completes');assert(Math.hypot(sim.player.x-destination.x,sim.player.y-destination.y)<160,'within interaction range');
console.log('PASS simulation walks around terrain to the actual interaction radius');
