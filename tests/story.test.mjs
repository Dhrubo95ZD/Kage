import {WORLD_PORTALS} from '../src/js/world-portals.js';
import assert from 'node:assert/strict';
import Combat from '../src/js/combat.js';
import {newProfile} from '../src/js/rpg.js';
import {CHAPTER,PEOPLE,currentStory,storyState,tickStory} from '../src/js/story.js';
import {applyCommands} from '../src/js/commands.js';
import {LEVEL,inFloor,WORLD_VERSION} from '../src/js/level.js';
const fresh=()=>new Combat().attachProfile(newProfile('story','Traveler','katana'),42,'chapter');
assert.equal(currentStory(null),null);
const old=fresh().exportState();old.worldVersion=8;old.profile.gold=777;old.profile.story={version:1,stage:11,journal:[{title:'Old story'}]};old.player.x=0;old.player.y=-4500;const migrated=Combat.restore(old);assert.equal(migrated.worldVersion,WORLD_VERSION);assert.equal(migrated.profile.story.stage,0);assert.equal(migrated.profile.previousStory.stage,11);assert.equal(migrated.profile.gold,777);assert.equal(migrated.player.x,LEVEL.start.x);
for(const branch of ['orchard','cedar']){let sim=fresh();sim.player.x=2000;sim.player.y=2000;assert(!sim.storyAction('farid'));sim.player.dead=true;assert(!sim.storyAction('farid'));sim.player.dead=false;
 for(let stage=0;stage<CHAPTER.length;stage++){const quest=currentStory(sim.profile);assert.equal(quest.stage,stage);Object.assign(sim.player,{x:quest.target.x,y:quest.target.y});if(quest.target.guards){assert(!sim.storyAction(quest.target.id));sim.enemies.filter(e=>e.group===quest.target.guards).forEach(e=>e.dead=true);}if(stage===5){assert(!sim.storyAction('defense'));for(let i=0;i<25;i++){tickStory(sim,1);sim.enemies.filter(e=>e.group==='millDefense').forEach(e=>e.dead=true);}tickStory(sim,.01);assert.equal(sim.millDefense.wave,3);assert(sim.millDefense.complete);assert.equal(sim.enemies.filter(e=>e.group==='millDefense').length,12);for(const e of sim.enemies.filter(e=>e.group==='millDefense'))assert(inFloor(e.homeX,e.homeY,20));}
 if(quest.choices)assert(!sim.storyAction(quest.target.id,'invalid'));const choice=stage===2?branch:stage===8?(branch==='orchard'?'courtship':'friendship'):'continue';const replay=Combat.restore(sim.exportState()),command={op:'story',id:quest.target.id,choice};applyCommands(sim,[command]);applyCommands(replay,[command]);assert.deepEqual(sim.exportState(),replay.exportState());assert.equal(sim.profile.story.stage,stage+1);sim=Combat.restore(sim.exportState());}
 assert.equal(currentStory(sim.profile),null);assert.equal(sim.profile.story.choice,branch);const gold=sim.gold;assert(!sim.storyAction('ending','courtship'));assert.equal(sim.gold,gold);assert.equal(sim.profile.story.journal.length,CHAPTER.length);const restart=new Combat().attachProfile(sim.profile,24,'new-run');assert.equal(restart.profile.story.stage,CHAPTER.length);
}
console.log('PASS world migration preserves equipment/currency, both routes and relationship choices, mill waves, deterministic replay and single-award story');
const step=45,seen=new Set(),queue=[[Math.round(LEVEL.start.x/step),Math.round(LEVEL.start.y/step)]],key=(x,y)=>x+','+y;
const valid=(x,y)=>inFloor(x*step,y*step,20)&&!LEVEL.obstacles.some(o=>Math.hypot(o.x-x*step,o.y-y*step)<o.r+23);
seen.add(key(...queue[0]));for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(!seen.has(k)&&valid(nx,ny)){seen.add(k);queue.push([nx,ny]);}}}
for(const n of [...PEOPLE,...LEVEL.chests,...WORLD_PORTALS,...WORLD_PORTALS.map(g=>({...g.to,id:g.id+'-exit'}))]){assert(inFloor(n.x,n.y,20),n.id+' floor');assert(queue.some(([x,y])=>Math.hypot(x*step-n.x,y*step-n.y)<140),n.id+' reachable');}
console.log('PASS entire new valley connected with reachable story objectives and chests');
