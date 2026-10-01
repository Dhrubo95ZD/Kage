import assert from 'node:assert/strict';
import {LEVEL,inFloor} from '../src/js/level.js';
import ShadowData from '../src/js/weapons.js';import CombatSim from '../src/js/combat.js';
function advance(s,seconds,move){for(let i=0;i<Math.ceil(seconds*120);i++)s.update(1/120,move);}
function empty(id='katana'){const s=new CombatSim(id,{sandbox:true});s.enemies=[];s.player.x=0;s.player.y=0;s.player.angle=0;return s;}
let checks=0;function test(name,fn){fn();checks++;console.log('PASS',name);}
for(const id of Object.keys(ShadowData.weapons).filter(id=>id!=='pistols')){
 test(id+': entire light chain uses each weapon move',()=>{const s=empty(id);const observed=[];for(let i=0;i<s.weapon.chain.length;i++){assert(s.input('attack'));observed.push(s.player.attack.def.name);advance(s,s.player.attack.def.duration+.01);}assert.deepEqual(observed,s.weapon.chain.map(d=>d.name));});
 test(id+': light light heavy uses weapon finisher',()=>{const s=empty(id);s.input('attack');advance(s,.11);assert(s.input('attack'));advance(s,s.weapon.chain[0].duration+.03);assert.equal(s.player.chain,2);s.player.attack=null;assert(s.input('heavy'));assert.equal(s.player.attack.kind,'finisher');assert.equal(s.player.attack.def.name,s.weapon.finisher.name);});
 test(id+': dash cancel / invulnerability / follow-up',()=>{const s=empty(id);s.input('heavy');assert(s.input('dash'));assert.equal(s.player.attack,null);assert.equal(s.damagePlayer(25,0,0),false);assert.equal(s.input('dash'),false);s.input('attack');advance(s,.23);assert.equal(s.player.attack.kind,'dashAttack');assert(s.player.x>130);});
 test(id+': abilities hit and respect cooldown',()=>{const s=empty(id);s.addEnemy('brute',90,0);s.input('skill0');advance(s,s.weapon.skills[0].duration+.2);assert(s.combo>=1);assert(s.player.skillCooldowns[0]>0);assert.equal(s.input('skill0'),false);});
}
test('directional hit rejects targets behind the player',()=>{const s=empty();const front=s.addEnemy('brute',90,0),back=s.addEnemy('brute',-90,0);s.input('attack');advance(s,.15);assert(front.hp<front.maxHp);assert.equal(back.hp,back.maxHp);});
test('radial orbit hits targets on all sides',()=>{const s=empty();const front=s.addEnemy('brute',90,0),back=s.addEnemy('brute',-90,0);s.input('skill1');advance(s,.4);assert(front.hp<front.maxHp&&back.hp<back.maxHp);});
test('ultimate cannot recharge itself',()=>{const s=empty('twins');for(let i=0;i<8;i++)s.addEnemy('brute',Math.cos(i)*100,Math.sin(i)*100);assert(s.input('ultimate'));advance(s,1.5);assert.equal(s.player.ultimate,0);assert.equal(s.input('ultimate'),false);});
test('enemy telegraphs, hurts, and can be interrupted',()=>{const s=empty();const e=s.addEnemy('raider',45,0);e.cooldown=0;advance(s,.05);assert(e.wind>0);advance(s,.95);assert(s.player.hp<240);s.player.invulnerable=0;e.wind=.5;s.input('attack');advance(s,.15);assert(e.wind>0,'basic spam cannot cancel a committed attack');s.player.attack=null;s.input('skill1');advance(s,.3);assert.equal(e.wind,0);assert(e.stun>0);});
test('death and reset clear all combat state',()=>{const s=empty();s.damagePlayer(999,20,0);assert(s.player.dead);assert.equal(s.input('attack'),false);s.reset('greatsword');assert.equal(s.player.hp,240);assert.equal(s.player.weapon,'greatsword');assert.equal(s.enemies.length,0);});

for(const id of Object.keys(ShadowData.weapons).filter(id=>id!=='pistols'))test(id+': actual launch → juggle → slam sequence',()=>{
 const s=empty(id),e=s.addEnemy('brute',95,0);e.hp=e.maxHp=2000;
 for(let j=0;j<2;j++){s.input('attack');advance(s,s.weapon.chain[j].duration+.10);}
 assert.equal(s.player.chain,2);assert(s.input('heavy'));advance(s,s.weapon.finisher.active+.09);assert(e.z>0);assert(e.vz>0);
 advance(s,s.weapon.finisher.duration-s.weapon.finisher.active);assert(s.input('attack'));assert.equal(s.player.attack.kind,'juggle');
 advance(s,s.player.attack.def.duration+.13);assert(e.z>20);assert(s.input('heavy'));assert.equal(s.player.attack.kind,'slam');
 advance(s,s.weapon.slam.active+.13);assert.equal(e.z,0);assert(e.stun>0);assert(s.drainEvents().some(x=>x.type==='slam'));
});
test('lunge closes the gap instead of swinging at air',()=>{const s=empty();const e=s.addEnemy('brute',210,0);s.input('attack');advance(s,.24);assert(s.player.x>15&&s.player.x<60);assert(e.hp<e.maxHp);});

test('initial authored map is deterministic',()=>{const a=new CombatSim(),b=new CombatSim();assert.deepEqual(a.enemies.map(e=>[e.type,e.x,e.y]),b.enemies.map(e=>[e.type,e.x,e.y]));assert.equal(a.enemies.length,98);advance(a,12);assert.equal(a.enemies.length,98);assert.equal(a.chests.length,11);assert.equal(a.enemies.filter(e=>e.boss).length,5);});
test('guarded chest animates and throws unclaimed rewards onto ground',()=>{const s=new CombatSim(),c=s.chests[0];s.player.x=c.x;s.player.y=c.y;assert.equal(s.interact(),false);s.enemies.filter(e=>e.group===c.guards).forEach(e=>e.dead=true);assert(s.interact());assert.equal(c.openTime,s.time);assert.equal(s.player.maxHp,240);assert.equal(s.gold,0);assert.equal(s.loot.length,6);assert(s.loot.every(l=>l.vz>0));const count=s.loot.length;assert(!s.interact());assert.equal(s.loot.length,count);s.enemies=[];advance(s,1.8);for(const l of [...s.loot]){s.player.x=l.x;s.player.y=l.y;assert(s.pickup());}assert.equal(s.gold,80);assert.equal(s.player.maxHp,270);});
test('story gates are removed from the open world',()=>assert.equal(LEVEL.gates.length,0));
test('boss guard breaks and second phase starts',()=>{const s=empty(),e=s.addEnemy('commander',90,0);e.hp=e.maxHp*.49;advance(s,.01);assert.equal(e.phase,2);s.input('heavy');for(let i=0;i<4;i++)s.strike(s.player.attack);assert(e.broken>0);assert(s.drainEvents().some(e=>e.type==='guardBreak'));});
test('heavy queue is not overwritten by holding attack',()=>{const s=empty();s.input('attack');s.input('heavy');assert.equal(s.input('attack'),false);advance(s,.5);assert.equal(s.player.attack.kind,'heavy');});
test('cut emits synchronized whoosh and directional impact',()=>{const s=empty();s.addEnemy('brute',90,0);s.input('attack');advance(s,.22);const events=s.drainEvents();assert(events.findIndex(e=>e.type==='whoosh')<events.findIndex(e=>e.type==='hit'));const hit=events.find(e=>e.type==='hit');assert(Number.isFinite(hit.angle));assert(hit.id);assert(Math.abs(s.enemies[0].knockX)>0);});
test('final chest gives rewards without a mission gate',()=>{const s=new CombatSim(),c=s.chests[3];s.player.x=c.x;s.player.y=c.y;assert(!s.interact());s.enemies.filter(e=>e.group===c.guards).forEach(e=>e.dead=true);assert(s.interact());assert(!s.victory);assert(!s.drainEvents().some(e=>e.type==='victory'));});


test('pistol bullet travels, hits front target, and does not hit off-axis enemies',()=>{const s=empty('pistols'),e=s.addEnemy('brute',650,0),off=s.addEnemy('brute',700,220);e.stun=off.stun=10;s.input('attack');advance(s,.10);assert.equal(e.hp,e.maxHp);assert(s.bullets.length);advance(s,.5);assert(e.hp<e.maxHp);assert.equal(off.hp,off.maxHp);});
test('piercing round hits multiple enemies along its flight',()=>{const s=empty('pistols'),a=s.addEnemy('brute',400,0),b=s.addEnemy('brute',720,0);a.stun=b.stun=10;s.input('skill0');advance(s,.8);assert(a.hp<a.maxHp&&b.hp<b.maxHp);});
test('pistol class strafes while firing without melee lunges',()=>{const s=empty('pistols');s.addEnemy('brute',700,0);s.input('ultimate');advance(s,.5,{x:0,y:1});assert(s.player.y>40,"can strafe during committed fire");assert(s.player.y<130,"windup limits full-speed strafing");assert(Math.abs(s.player.x)<1);assert.equal(s.player.ultimate,0);});
test('movement heading follows input through attack recovery',()=>{const s=empty();s.input('attack');advance(s,.27,{x:0,y:1});assert.equal(s.player.angle,Math.PI/2);});
test('distant groups sleep; nearby patrols wake and engage',()=>{const s=new CombatSim(),e=s.enemies.find(e=>e.group==='commander'),x=e.x,y=e.y;advance(s,1);assert.equal(e.x,x);assert.equal(e.y,y);s.player.x=e.x+1000;s.player.y=e.y;advance(s,1);assert(Math.hypot(e.x-x,e.y-y)>10);s.player.x=e.x+350;s.player.y=e.y;advance(s,.1);assert(e.active);});
test('every authored spawn and chest is on playable terrain',()=>{for(const g of LEVEL.groups)for(const [type,x,y] of g.units)assert(inFloor(g.x+x,g.y+y),g.id+' '+type);for(const c of LEVEL.chests)assert(inFloor(c.x,c.y),c.id);});
console.log(`${checks} combat checks passed`);
