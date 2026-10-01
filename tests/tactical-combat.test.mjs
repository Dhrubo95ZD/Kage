import assert from 'node:assert/strict';
import Sim from '../src/js/combat.js';
import Data from '../src/js/weapons.js';
const fresh=()=>{const s=new Sim('katana',{sandbox:true});s.enemies=[];s.player.angle=0;return s;};
// Committed strikes punish stationary play but can actually be stepped out of.
for(const dodge of [false,true]){const s=fresh(),e=s.addEnemy('raider',90,0);Object.assign(e,{active:true,wind:.4,windMax:.58,attackX:0,attackY:0,attackKind:'cleave',cooldown:1,stun:0,z:0});if(dodge)s.player.y=220;const hp=s.player.hp;for(let i=0;i<50;i++)s.updateEnemy(e,.01,0);assert.equal(e.attackX,0);assert.equal(e.attackY,0);assert.equal(s.player.hp<hp,!dodge);assert(e.recovery>0);}
// Recovery windows reward timing without raising enemy health.
function damage(recovery){const s=fresh(),e=s.addEnemy('raider',90,0);e.recovery=recovery;const hp=e.hp;s.strike({id:1,kind:'normal',step:0,pulses:0,def:Data.weapons.katana.chain[0]});assert.equal(e.maxHp,Data.enemies.raider.hp);return hp-e.hp;}
assert(damage(1)>damage(0));
// Repeated basic hits cannot permanently cancel a committed attack; a skill can interrupt it.
{const s=fresh(),e=s.addEnemy('raider',90,0);Object.assign(e,{resolve:3,recovery:0,wind:.5});s.strike({id:1,kind:'normal',step:0,pulses:0,def:{...Data.weapons.katana.chain[0],damage:1}});assert(e.wind>0);s.strike({id:2,kind:'skill',step:0,pulses:0,def:{...Data.weapons.katana.skills[1],damage:1}});assert.equal(e.wind,0);}
// Wider radial skills hit a pack outside the old radius, including behind the player.
{const s=fresh();const es=[s.addEnemy('brute',300,0),s.addEnemy('brute',-300,0)];s.strike({id:1,kind:'skill',step:0,pulses:0,def:Data.weapons.katana.skills[1]});assert(es.every(e=>e.hp<e.maxHp));}
console.log('PASS committed dodgeable strikes, recovery damage windows, basic-spam resistance, skill interrupts and wider AoE');
