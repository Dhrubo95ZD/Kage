import assert from 'node:assert/strict';
import Sim from '../src/js/combat.js';
import {newProfile} from '../src/js/rpg.js';
import {WORLD_PORTALS,departurePortal,tickPortals} from '../src/js/world-portals.js';
import {REGION_DESTINATIONS,regionDestination} from '../src/js/region-travel.js';
import {currentStory,PEOPLE,personPresent} from '../src/js/story.js';
import {questGoal,findQuestPath,QuestWalker,clearSegment} from '../src/quest-navigation.js';
import {applyCommands} from '../src/js/commands.js';
const s=new Sim().attachProfile(newProfile('pace','Traveler','katana'));s.enemies=[];
assert.equal(WORLD_PORTALS.length,0);s.profile.story.stage=5;assert.equal(departurePortal(s),null);
s.profile.story.stage=6;assert.equal(departurePortal(s).x,4650);
Object.assign(s.player,{x:4200,y:0,hp:71});const replay=Sim.restore(s.exportState());
applyCommands(s,[{op:'step',dt:.02,x:0,y:0}]);applyCommands(replay,[{op:'step',dt:.02,x:0,y:0}]);
assert.deepEqual(s.exportState(),replay.exportState());assert.equal(s.player.x,4200);assert.equal(s.player.hp,71);
assert.equal(currentStory(s.profile).target.id,'c2-lina');
assert.equal(PEOPLE.filter(n=>['mill','c2-lina'].includes(n.id)&&personPresent(s.profile,n)).length,1);
// Every region can be reached by walking from the previous one, without any door call.
let prev={x:-2700,y:1450};
for(const r of REGION_DESTINATIONS){Object.assign(s.player,prev);const goal=regionDestination(r.id),path=findQuestPath(s,goal);assert(path,r.name);let from=prev;for(const point of path){assert(clearSegment(s,from,point),r.name+' continuous segment');from=point;}prev=r;}
// A saved player at an old arch never teleports or loses progress, even in combat.
Object.assign(s.player,{x:1480,y:-400});const before=structuredClone(s.exportState());tickPortals(s,.02);assert.equal(s.player.x,1480);assert.equal(s.player.y,-400);assert.deepEqual(s.profile,before.profile);assert(!s.usePortal('willow-road'));
// User's completed-save case now walks directly to Cinderwash after crafting.
s.profile.story.stage=9;s.profile.caravan.stage=9;s.profile.level=14;s.profile.hunters.clears={crystal:{standard:3}};s.profile.hunters.fragments.crystal=7;s.profile.hunters.destination=null;
assert(s.hunterAction('craft','gale'));assert.equal(s.profile.hunters.fragments.crystal,1);
Object.assign(s.player,{x:5730,y:1020});assert.equal(questGoal(s).id,'expedition-cinder');assert(findQuestPath(s,questGoal(s)));
assert.deepEqual(questGoal(Sim.restore(s.exportState())),questGoal(s));
s.profile.hunters.clears.cinder={standard:1};assert(questGoal(s).detail.includes('Amberstep'));s.profile.hunters.clears.convoy={standard:1};assert.equal(questGoal(s),null);
// Actual movement follows a selected region independently of the quest tracker.
Object.assign(s.player,{x:4650,y:700});const walker=new QuestWalker();assert(walker.start(s,regionDestination('glassroot')));
for(let i=0;i<3000&&walker.path;i++)s.update(.033,walker.step(s,.033));
assert(!walker.path,'walk arrives');assert(Math.hypot(s.player.x-6940,s.player.y+1510)<170);
s.profile.caravan.stage=9;s.profile.story.stage=6;assert.equal(currentStory(s.profile).target.id,'captain');
console.log('PASS continuous region routes, actual walking, legacy save safety, replay, story handoff, crafting guidance and no teleporting');
