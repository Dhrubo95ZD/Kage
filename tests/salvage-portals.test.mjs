import assert from 'node:assert/strict';
import Combat from '../src/js/combat.js';
import {newProfile,makeItem} from '../src/js/rpg.js';
import {salvageYield,salvagePreview,matchesSalvage,enhanceCost,validSalvageSelection} from '../src/js/salvage.js';
import {WORLD_PORTALS} from '../src/js/world-portals.js';
import {applyCommands} from '../src/js/commands.js';
import {motionSample,clipPhase,contactTime} from '../src/js/attack-timing.js';
import {salvageView} from '../src/salvage-ui.js';
import Data from '../src/js/weapons.js';
const make=()=>new Combat('katana',{sandbox:true}).attachProfile(newProfile('p','Tester','katana'));
const item=(id,level=1,rarity='common')=>makeItem(id,'weapon',level,rarity,'katana','approach');
{
 const s=make();s.profile.inventory=[item('a'),item('b',2,'rare')];const gold=s.gold,preview=salvagePreview(s.profile,['a','b']);assert(preview);assert(!s.salvageBatch(['a','a']));assert(!s.salvageBatch(['a','missing']));assert.equal(s.profile.inventory.length,2);assert(s.salvageBatch(['a','b']));assert.deepEqual(s.profile.materials,preview.materials);assert.equal(s.gold,gold);assert(!s.salvageItem('a'));assert(!s.salvageItem('p-starter'));
 const named={...item('named'),signature:'roadwarden'};s.profile.inventory=[named,{...item('locked'),locked:true},{...item('upgraded'),enhancement:1}];for(const i of s.profile.inventory)assert(!s.salvageItem(i.id));assert(s.lockItem('locked'));assert(s.salvageItem('locked'));assert(salvageView(s.profile).includes('PROTECTED'));
}

{
 const s=make();const numeric=item(41872,3,'common');numeric.id=41872;const second=item(41873,4,'uncommon');second.id=41873;const locked={...item(41874),id:41874,locked:true};s.profile.inventory=[numeric,second,locked];
 const ids=validSalvageSelection(s.profile,['41872',41872,'41873','41874','stale']);assert.deepEqual(ids,['41872','41873']);
 const html=salvageView(s.profile,ids);assert(html.includes('8 Iron fragments'));assert(html.includes('type="checkbox"'));assert(html.includes('data-salvage-item="41872" checked'));assert(html.includes('SALVAGE 2 ITEMS'));assert(!html.includes('disabled>SALVAGE 2 ITEMS'));
 const empty=salvageView(s.profile,['stale']);assert(empty.includes('SALVAGE PREVIEW · 0 SELECTED'));assert(empty.includes('Select items above to preview materials.'));assert(empty.includes('id="confirmSalvage" class="rpg-primary" disabled'));
 s.player.dead=true;assert(s.salvageBatch(ids));assert.equal(s.profile.inventory.length,1);assert.equal(s.profile.materials.scrap,8);assert(s.profile.materials.alloy>0);
}
{
 const s=make();s.profile.equipment.weapon=item('equipped',10);s.profile.inventory=Array.from({length:30},(_,i)=>item('bag'+i));assert(s.configureSalvage(true,['common','uncommon']));assert(!s.configureSalvage(true,['legendary']));const d=s.drop(0,0,'equipment');d.item=item('drop');Object.assign(d,{age:2,z:0,vz:0});assert(s.selectLoot(d.id));assert.equal(s.profile.inventory.length,30);assert.deepEqual(s.profile.materials,salvageYield(d.item));assert(!s.pickup(d.id));const upgrade=s.drop(0,0,'equipment');upgrade.item=item('upgrade',20);Object.assign(upgrade,{age:2,z:0,vz:0});assert(!s.selectLoot(upgrade.id));assert(s.loot.includes(upgrade));
 const a=item('bestA',20),b=item('bestB',20);s.profile.inventory=[a,b];assert(!matchesSalvage(s.profile,a));assert(matchesSalvage(s.profile,b));
}
{
 const s=make();const i=s.profile.equipment.weapon;s.profile.materials={scrap:500,alloy:100,crystal:10};s.player.hp=30;for(let rank=1;rank<=5;rank++){const old={...s.profile.materials},cost=enhanceCost(i);assert(s.enhanceItem(i.id));assert.equal(i.enhancement,rank);for(const k in old)assert.equal(s.profile.materials[k],old[k]-cost[k]);assert.equal(s.player.hp,30);}assert(!s.enhanceItem(i.id));assert.equal(i.stats.power,10);const restored=Combat.restore(s.exportState());assert.deepEqual(restored.profile,s.profile);
 const e=restored.addEnemy('raider',50,0);e.active=true;restored.profile.inventory=[item('unsafe')];assert(!restored.enhanceItem('unsafe'));
}
{
 const s=make();s.profile.inventory=[item('one'),item('two')];const clone=Combat.restore(s.exportState()),commands=[{op:'autoSalvage',enabled:true,rarities:['common']},{op:'lockItem',id:'two'},{op:'salvageBatch',ids:['one']},{op:'salvage',id:'one'}];applyCommands(s,commands);applyCommands(clone,commands);assert.deepEqual(s.exportState(),clone.exportState());assert.equal(s.profile.inventory.length,1);
}
{
 const s=new Combat().attachProfile(newProfile('p','Tester','katana'));s.enemies=[];
 s.profile.story.stage=6;Object.assign(s.player,{x:4200,y:0,hp:35});
 const equipment=structuredClone(s.profile.equipment),copy=Combat.restore(s.exportState());
 const commands=[{op:'step',dt:.02,x:0,y:0}];applyCommands(s,commands);applyCommands(copy,commands);
 assert.deepEqual(s.exportState(),copy.exportState());assert.equal(s.profile.openWorld,true);
 assert.equal(s.player.x,4200);assert.equal(s.player.hp,35);assert.deepEqual(s.profile.equipment,equipment);
 assert(!s.usePortal('willow-road'));assert.equal(WORLD_PORTALS.length,0);
}
{
 for(const weapon of Object.values(Data.weapons))for(const d of [...weapon.chain,...weapon.skills])for(let pulse=0;pulse<(d.pulses||1);pulse++){const sample=motionSample({def:d,elapsed:contactTime(d,pulse)});assert.equal(sample.pulse,pulse);assert(Math.abs(clipPhase(sample,.43)-.43)<1e-8);}
 const s=make();s.player.skillCooldowns[0]=.1;assert(s.input('skill0'));for(let i=0;i<7;i++)s.update(.02);assert(s.player.attack);assert.equal(s.player.attack.kind,'skill');const b=make();b.player.dashCooldown=.08;assert(b.input('dash'));for(let i=0;i<5;i++)b.update(.02);assert(b.player.dashTime>0);
 for(const weapon of Object.keys(Data.weapons)){const s=new Combat(weapon,{sandbox:true}).attachProfile(newProfile('p','Tester',weapon));const c=Combat.restore(s.exportState()),commands=[];for(let i=0;i<180;i++){if(i%15===0)commands.push({op:'act',action:'attack'});if(i%39===0)commands.push({op:'act',action:'skill1'});commands.push({op:'step',dt:.02,x:.5,y:0});}applyCommands(s,commands);applyCommands(c,commands);assert.deepEqual(s.exportState(),c.exportState());}
}
console.log('PASS salvage atomicity, materials, protected gear, full-bag auto-dismantling, enhancement costs/cap, replay, removed portals and unrestricted road travel, multi-hit contact timing and buffered inputs');

