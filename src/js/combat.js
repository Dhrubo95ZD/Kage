import {initOpenWorld,tickOpenWorld,scaleRegionEnemy} from './open-world.js';
import {initHunters,hunterAction,tickHunt,huntInteract,signatureAttack,signatureMultiplier,afterSignatureHit,ricochet} from './hunters.js';
import {rememberAppearance} from './hunt-data.js';
import {pulseInterval,steerBeforeContact} from './attack-timing.js';
import {usePortal,tickPortals,nearbyPortal,portalUnlocked} from './world-portals.js';
import {salvageState,salvageItems,salvageConfig,lockItem,enhanceItem,autoSalvages,grantMaterials,materialText} from './salvage.js';
import {installCaravan,shieldFactor,updateCaravanEnemy,tickHazards} from './caravan-combat.js';
import {travel,trainingAction,caravanState} from './caravan-story.js';
import {changeEvolution} from './evolutions.js';
import {grantBarrier,onBuildDodge,prepareBuildAttack,buildHitContext,afterBuildHit,onBuildBlock,onBuildKill,tickBuild,clearBuildRuntime} from './evolution-combat.js';
import {treeState,treeBonuses,allocate,refund} from './skill-tree.js';
import {modifyAttack,hitMultiplier} from './build-effects.js';
import {advanceStory,storyState,tickStory} from './story.js';
import {stats,grantXP,rollEquipment,QUESTS,SLOTS,regionFor,random,gearScore,REGIONS,makeNamedItem,rollNamed} from './rpg.js';
import ShadowData from './weapons.js';
import {WORLD_VERSION,LEVEL,inFloor,projectToFloor,areaAt} from './level.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export default class CombatSim {
 constructor(weapon='katana',options={}){this.sandbox=!!options.sandbox;this.reset(weapon);}
 reset(weapon=this.player?.weapon||'katana'){
  delete this.openWorldVersion;this.loreUntil={};this.worldVersion=WORLD_VERSION;this.caravanWorldVersion=1;this.hazards=[];this.millDefense=null;this.time=0;this.kills=0;this.combo=0;this.comboTime=0;this.hitstop=0;this.slowmo=0;this.events=[];this.enemies=[];this.projectiles=[];this.bullets=[];this.loot=[];this.serial=0;this.style=0;this.lastMove='';this.gold=0;this.bossesDefeated=[];this.victory=false;this.pendingVictory=false;this.damageBonus=0;
  this.chests=LEVEL.chests.map(c=>({...c,opened:false}));this.groups=LEVEL.groups.map(g=>({...g,alert:false,cleared:false}));
  this.player={x:this.sandbox?0:LEVEL.start.x,y:this.sandbox?0:LEVEL.start.y,z:0,vz:0,angle:-Math.PI/2,hp:240,maxHp:240,weapon,attack:null,chain:0,chainTime:0,invulnerable:0,dashTime:0,dashCooldown:0,dashWindow:0,skillCooldowns:[0,0],ultimate:100,dead:false,moving:false,knockX:0,knockY:0};
  if(!this.sandbox)for(const g of LEVEL.groups)for(const [type,dx,dy] of g.units)this.addEnemy(type,g.x+dx,g.y+dy,g.id);
 }
 hunterAction(action,id,value){return hunterAction(this,action,id,value);}
 canEditTree(){return !!this.profile&&!this.player.dead&&!this.player.attack&&!this.player.dashTime&&!this.bullets.length&&!this.projectiles.length&&!(this.hazards||[]).some(h=>Math.hypot(h.x-this.player.x,h.y-this.player.y)<1000)&&!this.enemies.some(e=>!e.dead&&!e.trainingDummy&&e.active&&Math.hypot(e.x-this.player.x,e.y-this.player.y)<1000);}
 treeAction(action,id){if(!this.canEditTree())return false;let ok=false;if(action==='allocate')ok=allocate(this.profile,id);if(action==='refund')ok=refund(this.profile,id);if(action==='reset'&&treeState(this.profile).nodes.length){treeState(this.profile).nodes=[];ok=true;}if(ok){this.applyStats();clearBuildRuntime(this);}return ok;}
 evolutionAction(action,id){if(!this.canEditTree()||!changeEvolution(this.profile,action,id))return false;this.applyStats();clearBuildRuntime(this);return true;}
 dropNamed(key,level=8){if(!this.profile)return;const item=makeNamedItem(this,key,level);if(item){const l=this.drop(this.player.x,this.player.y,'equipment');l.item=item;}}
 travel(){return false;}
 usePortal(id){return usePortal(this,id);}
 trainingAction(action){return trainingAction(this,action);}
 storyAction(){return false;}
 attachProfile(profile,seed=12345,runId='test'){this.profile=structuredClone(profile);storyState(this.profile);caravanState(this.profile);salvageState(this.profile);initHunters(this);this.rng=seed>>>0;this.runId=runId;this.itemSerial=0;this.profile.gold=profile.gold;this.gold=profile.gold;this.equip(profile.classId);this.applyStats(true);for(const e of this.enemies){e.level=({approach:1,quarry:3,garrison:4,keep:6}[regionFor(e.group)]||REGIONS[regionFor(e.group)].min);e.hp=Math.round(e.hp*(1+(e.level-1)*.10));e.maxHp=e.hp;scaleRegionEnemy(e);}initOpenWorld(this);return this;}
 applyStats(heal=false){if(!this.profile)return;this.build=treeBonuses(this.profile);const s=stats(this.profile),p=this.player,old=p.maxHp;p.maxHp=s.health;p.hp=heal?s.health:Math.min(s.health,p.hp);this.damageBonus=s.power/100+(this.profile.level-1)*.035;this.armor=s.armor;this.gold=this.profile.gold;}
 xp(amount){if(!this.profile)return;const n=grantXP(this.profile,amount);this.applyStats(n>0);if(n)this.emit('levelUp',{level:this.profile.level});}
 questEvent(){}
 claimQuest(){return false;}
 equipItem(id){const p=this.profile,item=p?.inventory.find(i=>String(i.id)===String(id));if(!item||this.player.dead||item.requiredLevel>p.level||item.classId&&item.classId!==p.classId)return false;const old=p.equipment[item.slot];p.inventory=p.inventory.filter(i=>String(i.id)!==String(id));if(old)p.inventory.push(old);p.equipment[item.slot]=item;this.applyStats();return true;}
 equipBest(){const p=this.profile;if(!p||this.player.dead)return false;let changed=false;for(const slot of SLOTS){if(p.equipment[slot]?.huntSignature)continue;const eligible=p.inventory.filter(i=>!i.huntSignature&&i.slot===slot&&i.requiredLevel<=p.level&&(!i.classId||i.classId===p.classId));let best=p.equipment[slot];for(const i of eligible)if(gearScore(i)>gearScore(best))best=i;if(best&&best.id!==p.equipment[slot]?.id)changed=this.equipItem(best.id)||changed;}return changed;}
 selectLoot(id){const l=this.loot.find(l=>l.id===id&&l.item);if(!l||this.player.dead||Math.hypot(l.x-this.player.x,l.y-this.player.y)>800)return false;if(this.profile?.inventory.length>=30&&!autoSalvages(this.profile,l.item)){this.emit('notice',{message:'Inventory full'});return false;}this.player.lootTarget=id;if(Math.hypot(l.x-this.player.x,l.y-this.player.y)<145)return this.pickup(id);return true;}
 unequipItem(slot){if(!SLOTS.includes(slot))return false;const p=this.profile,item=p?.equipment[slot];if(!item||p.inventory.length>=30||slot==='weapon')return false;p.inventory.push(item);p.equipment[slot]=null;this.applyStats();return true;}
 salvageItem(id){return salvageItems(this,[id]);}
 salvageBatch(ids){return salvageItems(this,ids);}
 configureSalvage(enabled,rarities){return salvageConfig(this,enabled,rarities);}
 lockItem(id){return lockItem(this,id);}
 enhanceItem(id){return enhanceItem(this,id);}
 exportState(){return JSON.parse(JSON.stringify({...this,events:[],bullets:this.bullets.map(b=>({...b,hit:[...b.hit]}))}));}
 static restore(data){if(data.worldVersion!==WORLD_VERSION&&!data.sandbox&&data.profile){const fresh=new CombatSim(data.profile.classId).attachProfile(data.profile,data.rng||12345,data.runId||'valley');fresh.wallAt=data.wallAt;fresh.wallCredit=data.wallCredit;fresh.lastBatchId=data.lastBatchId;return fresh;}const sim=Object.create(CombatSim.prototype);Object.assign(sim,structuredClone(data));sim.bullets=sim.bullets.map(b=>({...b,hit:new Set(b.hit)}));sim.events=[];storyState(sim.profile);caravanState(sim.profile);salvageState(sim.profile);initHunters(sim);installCaravan(sim);initOpenWorld(sim);sim.applyStats();return sim;}
 get weapon(){return ShadowData.weapons[this.player.weapon];}
 emit(type,data={}){this.events.push({type,...data});}
 drainEvents(){const events=this.events;this.events=[];return events;}
 addEnemy(type,x,y,group=null){const d=ShadowData.enemies[type];if(!d)throw Error('Unknown enemy '+type);const e={id:++this.serial,type,group,homeX:x,homeY:y,x,y,z:0,vz:0,angle:Math.PI/2,hp:d.hp,maxHp:d.hp,stun:0,wind:0,windMax:1,cooldown:.8+(this.serial%5)*.15,hit:0,hitSerial:0,cutAngle:0,knockX:0,knockY:0,dead:false,death:0,attackX:0,attackY:0,moving:false,attackAnim:0,active:this.sandbox,attackNo:0,attackKind:'cleave',boss:!!d.boss,phase:1,poise:0,broken:0};if(group?.startsWith("hunt-"))e.huntId=this.huntRun?.id;this.enemies.push(e);return e;}
 equip(id){if(!ShadowData.weapons[id])return false;this.player.weapon=id;this.player.attack=null;this.player.chain=0;this.player.chainTime=0;return true;}
 findTarget(range=this.weapon.ranged?1100:460){const p=this.player;let best=null,score=Infinity;for(const e of this.enemies){if(e.dead)continue;const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);if(d>range)continue;const a=Math.atan2(dy,dx),delta=Math.abs(Math.atan2(Math.sin(a-p.angle),Math.cos(a-p.angle)));if(delta>Math.PI*.78)continue;const value=d+delta*110-(e.z>25?45:0);if(value<score){score=value;best=e;}}return best;}
 targetAngle(){const e=this.findTarget();return e?Math.atan2(e.y-this.player.y,e.x-this.player.x):this.player.angle;}
 airborneTarget(){return this.enemies.find(e=>!e.dead&&e.z>30&&Math.hypot(e.x-this.player.x,e.y-this.player.y)<305);}
 nearbyChest(){return this.chests.find(c=>!c.opened&&Math.hypot(c.x-this.player.x,c.y-this.player.y)<140);}
 chestLocked(chest){return this.enemies.some(e=>!e.dead&&e.group===chest.guards);}
 drop(x,y,kind,amount=0){const id=++this.serial,a=id*2.399;const l={id,x,y,z:45,vx:Math.cos(a)*155,vy:Math.sin(a)*155,vz:300,age:0,kind,amount,bounces:0};this.loot.push(l);return l;}
 nearbyLoot(){return this.loot.find(l=>l.z<8&&l.age>.65&&Math.hypot(l.x-this.player.x,l.y-this.player.y)<165);}
 pickup(id){const l=id===undefined?this.nearbyLoot():this.loot.find(l=>l.id===id&&l.z<8&&l.age>.65&&Math.hypot(l.x-this.player.x,l.y-this.player.y)<165);if(!l||this.player.dead)return false;if(l.item&&this.profile){rememberAppearance(this.profile,l.item);if(autoSalvages(this.profile,l.item)){const materials=grantMaterials(this.profile,[l.item]);l.salvaged=true;l.materials=materials;}else{if(this.profile.inventory.length>=30){this.player.lootTarget=null;this.emit('notice',{message:'Inventory full — open Character → Salvage'});return false;}this.profile.inventory.push(l.item);}}this.loot.splice(this.loot.indexOf(l),1);if(this.player.lootTarget===l.id)this.player.lootTarget=null;if(l.kind==='gold')this.gold+=l.amount;if(l.kind==='heal')this.player.hp=Math.min(this.player.maxHp,this.player.hp+l.amount);if(l.kind==='health'){this.player.maxHp+=30;this.player.hp+=30;}if(l.kind==='blade')this.damageBonus+=.12;if(this.profile){this.profile.gold=this.gold;this.applyStats();}this.emit('pickup',{kind:l.kind,itemId:l.salvaged?null:l.item?.id,signature:l.item?.huntSignature,amount:l.amount,name:l.salvaged?'DISMANTLED · '+materialText(l.materials):l.item?.name});return true;}
 interact(){if(huntInteract(this))return true;const gate=nearbyPortal(this);if(gate){if(!portalUnlocked(this,gate)){this.emit('notice',{message:'Complete the story milestone shown on the world map to open this passage'});return false;}if(this.usePortal(gate.id))return true;this.emit('notice',{message:'Passage is recovering. Wait a moment, then try again.'});return false;}const c=this.nearbyChest();if(!c||this.player.dead||this.chestLocked(c))return false;c.opened=true;c.openTime=this.time;for(let i=0;i<4;i++)this.drop(c.x,c.y,'gold',Math.round(c.gold/4));this.drop(c.x,c.y,'heal',c.heal);if(this.profile){for(const item of rollEquipment(this,'chest',c.guards)){const l=this.drop(c.x,c.y,'equipment');l.item=item;}this.questEvent('chest',c);}else if(c.upgrade!=='none')this.drop(c.x,c.y,c.upgrade);this.emit('chest',{id:c.id,x:c.x,y:c.y});return true;}
 objective(){return {text:'OPEN WILDERNESS',detail:'Explore, fight and craft. All regions are open.',x:this.player.x,y:this.player.y};}
 activeBoss(){return this.enemies.find(e=>e.boss&&!e.dead&&e.active&&Math.hypot(e.x-this.player.x,e.y-this.player.y)<1100);}
 input(action){if(this.profile&&['heavy','ultimate'].includes(action))return false;const p=this.player;if(p.dead)return false;if(action==='interact')return this.interact();
  if(action==='dash'){p.lootTarget=null;if(p.dashCooldown>0){if(p.dashCooldown<=.12){p.bufferedDashUntil=this.time+.16;return true;}return false;}p.bufferedDashUntil=0;p.bufferedSkill=null;p.queuedDash=null;p.attack=null;p.dashTime=.21;p.dashCooldown=2.4*(1-(this.build?.dashCooldown||0))*(this.build?.keys.riposte?1.3:1)*(this.build?.keys.reserve?1.4:1);if(this.enemies.some(e=>!e.dead&&e.wind>0&&e.wind<=.32&&Math.hypot(e.attackX-p.x,e.attackY-p.y)<180)){p.huntPerfectUntil=this.time+.65;if(this.profile?.equipment.weapon?.huntSignature==='gale')this.emit('notice',{message:'PERFECT DODGE · GALE EDGE READY'});}onBuildDodge(this);p.invulnerable=.24;p.dashWindow=.58;this.emit('dash',{x:p.x,y:p.y,angle:p.angle});return true;}
  if(p.dashTime>0){if(['attack','heavy','skill0','skill1'].includes(action))p.queuedDash=action;return false;}
  if((action==='skill0'||action==='skill1')&&p.skillCooldowns[Number(action.slice(-1))]>0){if(p.skillCooldowns[Number(action.slice(-1))]<=.18){p.bufferedSkill={action,until:this.time+.22};return true;}return false;}
  if(action==='ultimate'&&p.ultimate<100)return false;
  if(p.attack?.queued&&p.attack.queued!=='attack'&&action==='attack')return false;
  if(p.attack){if(['attack','heavy','skill0','skill1','ultimate'].includes(action)){p.attack.queued=action;return true;}return false;}
  let def,kind='normal',step=p.chain,chained=p.chainTime>0;
  if(action==='attack'){
   if(p.dashWindow>0){def=this.weapon.dashAttack;kind='dashAttack';p.dashWindow=0;p.chain=0;}
   else{if(p.chainTime<=0)p.chain=0;step=p.chain;def=this.weapon.chain[p.chain];p.chain=(p.chain+1)%this.weapon.chain.length;if(!this.weapon.ranged&&this.airborneTarget())kind='juggle';}
  }else if(action==='heavy'){
   if(!this.weapon.ranged&&this.airborneTarget()){def=this.weapon.slam;kind='slam';p.vz=380;p.invulnerable=.5;}
   else{const enhanced=!this.weapon.ranged&&p.chainTime>0&&p.chain>=2;def=enhanced?this.weapon.finisher:this.weapon.heavy;kind=enhanced?'finisher':'heavy';}p.chain=0;
  }else if(action==='skill0'||action==='skill1'){const slot=Number(action.slice(-1));def=this.weapon.skills[slot];if(this.profile&&!this.weapon.ranged&&slot===(this.player.weapon==='twins'?1:0))def={...((this.airborneTarget()||(this.build?.keys.ground||this.build?.traits?.aftershock))?this.weapon.slam:this.weapon.finisher),reach:Math.max(def.reach,this.weapon.slam.reach),arc:Math.max(def.arc,3.8),cooldown:def.cooldown};p.skillCooldowns[slot]=def.cooldown*(1-(this.build?.cooldown||0))*(this.build?.keys.overdrive?.7:1);kind='skill';p.chain=0;}
  else if(action==='ultimate'){p.ultimate=0;def=this.weapon.ultimate;kind='ultimate';p.invulnerable=def.duration+.2;p.chain=0;}
  else return false;
  if(this.profile)def=prepareBuildAttack(this,modifyAttack(def,kind,this.build||treeBonuses(this.profile),this.weapon.ranged),kind);
  def=signatureAttack(this,def,kind);
  const target=this.findTarget(this.weapon.ranged?1100:kind==='juggle'?305:460);if(target)p.angle=Math.atan2(target.y-p.y,target.x-p.x);
  p.chainTime=1.2;p.attack={id:++this.serial,def,kind,step,chained,aimAngle:p.angle,elapsed:0,pulses:0,queued:null,whoosh:false,targetId:target?.id};
  this.emit('attack',{name:def.name,kind,step,clip:def.clip,duration:def.duration,x:p.x,y:p.y,angle:p.angle,color:this.weapon.color});return true;
 }
 killEnemy(e,a){const p=this.player;e.dead=true;e.death=1.65;e.vz=Math.max(110,e.vz);e.z=Math.max(3,e.z);const dx=e.x-p.x,dy=e.y-p.y,len=Math.max(1,Math.hypot(dx,dy)),power=e.boss?250:a.kind==='normal'?560:980;e.knockX=dx/len*power;e.knockY=dy/len*power;e.deathSide=(a.step%2?1:-1);this.kills++;onBuildKill(this);if(this.profile){p.hp=Math.min(p.maxHp,p.hp+(this.build?.healKill||0));}if(this.profile){this.profile.kills++;this.xp((e.boss?180:e.type==='brute'?35:18)*(1+(e.level||1)*.2));this.questEvent('kill',e);for(const item of rollEquipment(this,e.type,e.group)){const l=this.drop(e.x,e.y,'equipment');l.item=item;}}if(this.profile&&!e.huntId){const item=rollNamed(this,e.type);if(item){const l=this.drop(e.x,e.y,'equipment');l.item=item;}}this.drop(e.x,e.y,'gold',e.boss?150:e.type==='brute'?18:8);if(e.id%5===0||e.boss)this.drop(e.x,e.y,'heal',e.boss?55:18);this.emit('death',{id:e.id,x:e.x,y:e.y,angle:p.angle,cut:a.kind!=='normal',color:'#b09a78'});if(e.boss){this.bossesDefeated.push(e.type);this.emit('bossDown',{name:ShadowData.enemies[e.type].name,type:e.type});p.hp=Math.min(p.maxHp,p.hp+55);}
  if(a.kind==='slam'||e.boss)this.slowmo=.13;
 }
 strike(a){const p=this.player,d=a.def;if(d.shape==='bullet'&&!a.projectileHit){a.aimAngle=p.angle;const n=d.pellets||1;for(let i=0;i<n;i++){const angle=a.aimAngle+(i-(n-1)/2)*(d.spread||0)/Math.max(1,n-1);this.bullets.push({id:++this.serial,x:p.x,y:p.y,angle,vx:Math.cos(angle)*1900,vy:Math.sin(angle)*1900,remaining:d.reach,hit:new Set(),pierce:d.pierce||1,attack:{...a,def:{...d,shape:'impact'}}});}this.emit('shot',{x:p.x,y:p.y,angle:a.aimAngle,side:a.step%2?-1:1,kind:a.kind,reach:d.reach,spread:d.spread||0,color:this.weapon.color});return;}const shape=d.shape||(d.radial?'spin':'arc');if(!a.projectileHit)this.emit('slash',{x:p.x,y:p.y,z:p.z,angle:p.angle,reach:d.reach,arc:d.arc,shape,weapon:this.weapon.id,color:this.weapon.color,kind:a.kind,index:a.pulses,step:a.step,clip:d.clip});let hits=0;
  if(d.slam){p.z=0;p.vz=0;this.emit('slam',{x:p.x,y:p.y,reach:d.reach,color:this.weapon.color});}
  for(const e of this.enemies){if(e.dead)continue;const dx=e.x-p.x,dy=e.y-p.y,dist=Math.hypot(dx,dy),forward=dx*Math.cos(p.angle)+dy*Math.sin(p.angle),side=Math.abs(-dx*Math.sin(p.angle)+dy*Math.cos(p.angle));const delta=Math.abs(Math.atan2(Math.sin(Math.atan2(dy,dx)-p.angle),Math.cos(Math.atan2(dy,dx)-p.angle)));const radius=ShadowData.enemies[e.type].radius;
   const valid=a.projectileHit?e.id===a.projectileHit:shape==='line'?forward>=-radius&&forward<d.reach&&side<(d.width||65):dist<d.reach+radius&&(d.radial||shape==='rush'||shape==='spin'||shape==='nova'||delta<d.arc/2);if(!valid)continue;
   hits++;e.active=true;const group=this.groups.find(g=>g.id===e.group);if(group)group.alert=true;const aerial=e.z>25,b=this.build||{keys:{}},buildHit=buildHitContext(this,a,e),critical=!!this.profile&&!b.keys.resolute&&(buildHit.forceCrit||((b.crit||b.keys.deadeye||d.extraCrit)&&random(this)<Math.min(.75,(b.crit||0)+(d.extraCrit||0)+(b.keys.deadeye?.20:0))));const damage=Math.max(1,Math.round(d.damage*shieldFactor(this,e,a)*buildHit.multiplier*signatureMultiplier(this,a,e)*(1+this.damageBonus)*(e.recovery>0?1.25:1)*(aerial?1.3:1)*(e.boss?1+(b.bossDamage||0):1)*hitMultiplier(b,{kind:a.kind,aerial,slam:d.slam,enemyRatio:e.hp/e.maxHp,distance:dist,ranged:this.weapon.ranged,critical,counter:p.counterPower>0,moving:p.moving,combo:this.combo,lifeRatio:p.hp/p.maxHp})));e.hp=e.trainingDummy?Math.max(1,e.hp-damage):e.hp-damage;afterSignatureHit(this,a,e,damage);if(p.counterPower>0)p.counterPower=0;if(a.kind==='normal'&&b.keys.engine&&!(p.engineTokens||[]).includes(a.id+':'+a.pulses)){p.skillCooldowns=p.skillCooldowns.map(v=>Math.max(0,v-.12));p.engineTokens=[...(p.engineTokens||[]),a.id+':'+a.pulses].slice(-100);}
   if(e.boss){e.poise+=(a.kind==='normal'?10:30)*(b.traits?.breach&&e.exposedUntil>this.time?2:1);if(e.poise>=100){e.poise=0;e.broken=2.0;e.wind=0;this.emit('guardBreak',{x:e.x,y:e.y});}}
   e.resolve=(e.resolve||0)+1;e.resolveTimer=1;const armored=(a.kind==='normal'&&e.wind>0&&e.recovery<=0)||e.boss&&e.broken<=0||['brute','golem'].includes(e.type)&&e.resolve>=4&&e.z<5;e.stun=armored?0:(a.kind==='normal'?.14:.55)*(1+(b.stun||0));if(!armored){e.wind=0;e.cooldown=Math.max(e.cooldown,.65);}e.hit=.22;e.hitSerial++;e.cutAngle=(a.step%2?-.65:.65);e.hitFrom=p.angle;
   const push=(d.knock||((a.kind==='normal'||a.kind==='juggle')?230:540)*(1+(b.knock||0)))*(armored?.12:1),norm=Math.max(dist,1);e.knockX=dx/norm*push;e.knockY=dy/norm*push;
   if(a.kind==='normal')p.skyHits=(p.skyHits||0)+1;const launchPower=b.keys.ground?0:b.keys.sky&&a.kind==='normal'&&p.skyHits%3===0?310*(1+(b.launch||0)):d.launch;
   if(launchPower&&!armored){e.vz=launchPower;e.z=Math.max(e.z,8);e.stun=1.15*(1+(b.stun||0));e.knockX*=.35;e.knockY*=.35;this.emit('launch',{x:e.x,y:e.y});}
   else if(d.slam){e.z=0;e.vz=0;if(!armored)e.stun=1.1*(1+(b.stun||0));}
   else if(aerial&&!armored){e.vz=255*(b.keys.hangtime?1.4:1);e.z=Math.max(50,e.z);e.stun=.8*(1+(b.stun||0));}
   afterBuildHit(this,a,e,critical);this.combo++;this.comboTime=3.4;if(a.kind!=='ultimate')p.ultimate=Math.min(100,p.ultimate+damage*.14);this.style=clamp(this.style+(d.name!==this.lastMove?8:3)+(aerial?4:0),0,100);this.lastMove=d.name;
   this.emit('hit',{id:e.id,x:e.x,y:e.y,z:e.z,angle:p.angle,side:a.step%2?-1:1,damage,critical:!!critical,aerial,heavy:!['normal','juggle'].includes(a.kind),color:this.weapon.color});
   if(e.hp<=0)this.killEnemy(e,a);
  }
  if(hits)this.hitstop=Math.max(this.hitstop,d.pulses>1?.014:d.slam?.065:this.weapon.id==='greatsword'?.045:['normal','juggle'].includes(a.kind)?.022:.038);
 }
 damagePlayer(damage,fromX,fromY){damage=Math.max(1,Math.round(damage*(100/(100+(this.armor||0)*2))));const p=this.player;if(p.dead||p.invulnerable>0)return false;const b=this.build||{keys:{}};if(this.profile&&(b.block||b.keys.counter||b.evolution==='bulwark')&&random(this)<Math.min(.65,(b.block||0)+(b.keys.counter?.15:0)+(b.evolution==='bulwark'?.12:0))){p.invulnerable=.15;onBuildBlock(this);if(b.keys.counter)p.counterPower=4;this.emit('notice',{message:'BLOCKED'+(b.keys.counter?' · COUNTER READY':'')});return false;}damage*=b.keys.bastion&&p.hp>p.maxHp*.8?.7:1;damage*=b.traits?.holdLine&&!p.moving?.85:1;damage=Math.max(1,Math.round(damage));if(p.barrier>0){const absorbed=Math.min(p.barrier,damage);p.barrier-=absorbed;damage-=absorbed;}p.hp=Math.max(0,p.hp-damage);if(b.keys.second&&p.hp>0&&p.hp<p.maxHp*.3&&!(p.secondCooldown>0)){grantBarrier(this,.2,4);p.secondCooldown=12;this.emit('notice',{message:'SECOND WIND · BARRIER'});}p.invulnerable=.38;this.combo=0;this.style*=.6;const dist=Math.max(1,Math.hypot(p.x-fromX,p.y-fromY));p.knockX=(p.x-fromX)/dist*220;p.knockY=(p.y-fromY)/dist*220;this.emit('hurt',{x:p.x,y:p.y,damage});if(p.hp===0){p.dead=true;p.attack=null;p.bufferedSkill=null;p.bufferedDashUntil=0;p.queuedDash=null;this.emit('defeat',{kills:this.kills});}return true;}
 constrain(e,old={x:e.x,y:e.y}){if(this.sandbox)return;let point=projectToFloor(e.x,e.y,20);e.x=point.x;e.y=point.y;
  for(const gate of LEVEL.gates)if(!this.bossesDefeated.includes(gate.boss)&&e.x>gate.x1-20&&e.x<gate.x2+20&&e.y>gate.y1-20&&e.y<gate.y2+20){e.y=old.y>(gate.y1+gate.y2)/2?gate.y2+21:gate.y1-21;}
  for(const o of LEVEL.obstacles){const dx=e.x-o.x,dy=e.y-o.y,len=Math.hypot(dx,dy),r=o.r+22;if(len<r){e.x=o.x+(len?dx/len:1)*r;e.y=o.y+(len?dy/len:0)*r;}}point=projectToFloor(e.x,e.y,20);e.x=point.x;e.y=point.y;
 }
 updateEnemy(e,dt,attackers){if(!e.dead&&!e.active&&!e.returning&&(e.x-this.player.x)**2+(e.y-this.player.y)**2>2200**2){e.moving=false;return attackers;}if(e.trainingDummy){e.hit=Math.max(0,e.hit-dt);e.stun=0;e.z=0;e.vz=0;e.knockX=0;e.knockY=0;return attackers;}const p=this.player,d={...ShadowData.enemies[e.type],damage:ShadowData.enemies[e.type].damage*(e.damageScale||1)},old={x:e.x,y:e.y};
  if(e.dead){e.death-=dt;e.x+=e.knockX*dt;e.y+=e.knockY*dt;e.knockX*=Math.exp(-2.8*dt);e.knockY*=Math.exp(-2.8*dt);e.z=Math.max(0,e.z+e.vz*dt);e.vz-=900*dt;if(e.z===0)e.vz=0;this.constrain(e,old);return attackers;}
  const group=this.groups.find(g=>g.id===e.group);if(group?.alert)e.active=true;const distanceToPlayer=Math.hypot(p.x-e.x,p.y-e.y);
  // Reset only after retreating all the way home, never while still in striking range.
  if(e.active&&!e.huntId&&distanceToPlayer>850&&Math.hypot(e.x-e.homeX,e.y-e.homeY)>650){e.returning=true;}
  if(e.returning){const hx=e.homeX-e.x,hy=e.homeY-e.y,hd=Math.hypot(hx,hy);e.wind=0;e.charge=0;e.moving=true;e.angle=Math.atan2(hy,hx);if(hd<35){e.returning=false;e.active=false;e.hp=e.maxHp;if(group)group.alert=false;}else{e.x+=hx/hd*d.speed*1.5*dt;e.y+=hy/hd*d.speed*1.5*dt;this.constrain(e,old);}return attackers;}
  if(!e.active){if(group&&(distanceToPlayer<610||Math.hypot(p.x-group.x,p.y-group.y)<group.aggro)){group.alert=true;e.active=true;for(const other of this.groups)if(Math.hypot(other.x-group.x,other.y-group.y)<950)other.alert=true;this.emit('encounter',{id:group.id});}else{const t=this.time*.38+e.id*1.7,tx=e.homeX+Math.cos(t)*95,ty=e.homeY+Math.sin(t*.8)*75,dx=tx-e.x,dy=ty-e.y,len=Math.hypot(dx,dy);e.moving=len>8;if(e.moving){e.angle=Math.atan2(dy,dx);e.x+=dx/len*65*dt;e.y+=dy/len*65*dt;this.constrain(e,old);}return attackers;}}
  e.resolveTimer=Math.max(0,(e.resolveTimer||0)-dt);if(!e.resolveTimer)e.resolve=0;e.hit=Math.max(0,e.hit-dt);e.broken=Math.max(0,e.broken-dt);e.stun=Math.max(0,e.stun-dt);e.cooldown-=dt;e.recovery=Math.max(0,(e.recovery||0)-dt);e.attackAnim=Math.max(0,e.attackAnim-dt);e.x+=e.knockX*dt;e.y+=e.knockY*dt;e.knockX*=Math.exp(-5.4*dt);e.knockY*=Math.exp(-5.4*dt);e.z=Math.max(0,e.z+e.vz*dt);e.vz-=900*dt;if(e.z===0)e.vz=0;
  if(updateCaravanEnemy(this,e,dt)){this.constrain(e,old);return attackers;}
  const dx=p.x-e.x,dy=p.y-e.y,dist=Math.hypot(dx,dy);if(e.wind<=0&&!(e.charge>0))e.angle=Math.atan2(dy,dx);e.moving=false;
  if(e.boss&&e.phase===1&&e.hp<e.maxHp*.5){e.phase=2;e.cooldown=.1;this.emit('bossPhase',{name:d.name});}
  if(e.charge>0){e.charge-=dt;e.x+=Math.cos(e.angle)*700*dt;e.y+=Math.sin(e.angle)*700*dt;if(dist<85)this.damagePlayer(d.damage+8,e.x,e.y);if(e.charge<=0){e.recovery=1.2;e.cooldown=1.2;}this.constrain(e,old);return attackers;}
  if(e.stun<=0&&e.z<=0&&!p.dead){
   if(e.wind>0){e.wind-=dt;if(e.wind<=0){e.attackAnim=.40;e.recovery=e.boss?1.05:e.type==='brute'?.85:.5;
    if(e.type==='archer'){const a=Math.atan2(e.attackY-e.y,e.attackX-e.x);this.projectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*780,vy:Math.sin(a)*780,life:2.2,damage:d.damage});this.emit('bolt',{x:e.x,y:e.y});}
    else if(e.attackKind==='charge'){e.charge=e.boss?.47:.24;}
    else{const r=e.attackKind==='sweep'?235:e.boss?145:e.type==='brute'?125:78;const cx=e.attackKind==='sweep'?e.x:e.attackX,cy=e.attackKind==='sweep'?e.y:e.attackY;this.emit('enemyStrike',{x:cx,y:cy,reach:r});if(Math.hypot(p.x-cx,p.y-cy)<r)this.damagePlayer(d.damage*(e.phase===2?1.2:1),e.x,e.y);}
    e.cooldown=(e.boss?1.05:e.type==='brute'?1.2:.75)*(e.phase===2?.72:1);
   }}else if(e.recovery>0){e.moving=false;}else if(dist<(e.boss?420:e.type==='raider'&&(e.attackNo+1)%3===0?330:d.range)&&e.cooldown<=0&&attackers<5){e.attackKind=e.boss?((e.attackNo+1)%3===0?'charge':(e.attackNo+1)%3===2?'sweep':'cleave'):e.type==='raider'&&(e.attackNo+1)%3===0?'charge':e.type==='brute'?'sweep':'cleave';if(e.attackKind==='cleave'&&e.boss&&dist>225){e.x+=dx/Math.max(dist,1)*d.speed*dt;e.y+=dy/Math.max(dist,1)*d.speed*dt;e.moving=true;}
    else{e.attackNo++;e.windMax=(e.attackKind==='charge'?Math.max(.65,d.wind):d.wind)*(e.phase===2?.85:1);e.wind=e.windMax;e.attackX=p.x;e.attackY=p.y;e.angle=Math.atan2(dy,dx);attackers++;}}
   else if(e.type==='archer'&&dist<360){e.x-=dx/Math.max(dist,1)*d.speed*1.4*dt;e.y-=dy/Math.max(dist,1)*d.speed*1.4*dt;e.moving=true;}else if(dist>(e.type==='archer'?440:85)&&distanceToPlayer<1400){const offset=e.boss?0:Math.sin(e.id*2.7)*(dist<260?1.25:.45);e.x+=(dx/Math.max(1,dist)-dy/Math.max(1,dist)*offset)*d.speed*dt;e.y+=(dy/Math.max(1,dist)+dx/Math.max(1,dist)*offset)*d.speed*dt;e.moving=true;}
   else if(distanceToPlayer>1450){e.x+=(e.homeX-e.x)*dt*.5;e.y+=(e.homeY-e.y)*dt*.5;e.moving=true;}
  }if(e.moving&&!this.sandbox){const mx=e.x-old.x,my=e.y-old.y;for(const o of LEVEL.obstacles){if(Math.hypot(e.x-o.x,e.y-o.y)<o.r+70){const side=e.id%2?1:-1;e.x+=-my*side*1.5;e.y+=mx*side*1.5;break;}}}this.constrain(e,old);return attackers;
 }
 update(dt,move={x:0,y:0}){
  dt=Math.min(dt,.04);if(this.hitstop>0){this.hitstop-=dt;return;}if(this.slowmo>0){this.slowmo-=dt;dt*=.40;}this.time+=dt;tickOpenWorld(this,dt);const p=this.player,old={x:p.x,y:p.y};
  for(const key of ['invulnerable','dashCooldown','dashWindow','chainTime'])p[key]=Math.max(0,p[key]-dt);p.skillCooldowns=p.skillCooldowns.map(t=>Math.max(0,t-dt));this.comboTime-=dt;if(this.comboTime<=0){this.combo=0;this.style=Math.max(0,this.style-dt*12);}
  for(const key of ['counterPower','secondCooldown','barrierTime'])p[key]=Math.max(0,(p[key]||0)-dt);if(!p.barrierTime)p.barrier=0;tickBuild(this,dt,move);tickHazards(this,dt);
  if(!p.dead){if(p.bufferedDashUntil>=this.time&&p.dashCooldown<=0)this.input('dash');else if(p.bufferedDashUntil<this.time)p.bufferedDashUntil=0;if(p.bufferedSkill){const b=p.bufferedSkill;if(b.until<this.time)p.bufferedSkill=null;else if(p.skillCooldowns[Number(b.action.slice(-1))]<=0){p.bufferedSkill=null;this.input(b.action);}}}
  p.z=Math.max(0,p.z+p.vz*dt);p.vz-=1200*dt;if(p.z===0)p.vz=0;
  if(!p.dead){if(Math.hypot(move.x,move.y)>.1)p.lootTarget=null;if(p.lootTarget){const l=this.loot.find(l=>l.id===p.lootTarget);if(!l)p.lootTarget=null;else{const dx=l.x-p.x,dy=l.y-p.y,d=Math.hypot(dx,dy);if(d<120){this.pickup(l.id);move={x:0,y:0};}else move={x:dx/d,y:dy/d};}}const len=Math.hypot(move.x,move.y);p.moving=len>.08;let speed=this.weapon.speed*(p.surfaceSlow>0?.65:1)*(1+(this.build?.move||0)+(this.build?.keys.fleet?.35:0))*(this.build?.keys.fortress?.85:1)*(this.build?.keys.bastion?.9:1);if(!p.attack&&!this.enemies.some(e=>!e.dead&&e.active&&Math.hypot(e.x-p.x,e.y-p.y)<650))speed*=1.22;
   if(p.dashTime>0){p.dashTime-=dt;p.x+=Math.cos(p.angle)*1050*dt;p.y+=Math.sin(p.angle)*1050*dt;this.emit('trail',{x:p.x,y:p.y,angle:p.angle});if(p.dashTime<=0&&p.queuedDash){const next=p.queuedDash;p.queuedDash=null;this.input(next);}}
   else{
    if(p.attack){const a=p.attack,freeSpeed=speed;if(a.elapsed<a.def.active*.45)steerBeforeContact(this,a,dt);a.elapsed+=dt;speed*=(this.build?.keys.fleet||this.build?.evolution==='outrider')?1:Math.min(1,(a.elapsed<a.def.active?.25:.85)+(this.build?.attackMove||0));
     if(!a.whoosh&&a.elapsed>=Math.max(.01,a.def.active-.055)){a.whoosh=true;this.emit('whoosh',{kind:this.weapon.ranged?'gun':a.kind,side:a.step%2?-1:1});}
     if(!this.weapon.ranged&&a.elapsed<a.def.active+.045){const target=this.enemies.find(e=>e.id===a.targetId&&!e.dead);let lunge=a.def.lunge||0;if(target){const dist=Math.hypot(target.x-p.x,target.y-p.y);lunge=Math.min(Math.max(0,(dist-110)/Math.max(.06,a.def.active-a.elapsed)),230);if(dist<82)lunge=0;}p.x+=Math.cos(p.angle)*lunge*dt;p.y+=Math.sin(p.angle)*lunge*dt;}
     if(a.def.shape==='rush'&&a.elapsed>=a.def.active){p.x+=Math.cos(p.angle)*330*dt;p.y+=Math.sin(p.angle)*330*dt;}
     const pulses=a.def.pulses||1,interval=pulseInterval(a.def);
     while(a.pulses<pulses&&a.elapsed>=a.def.active+a.pulses*interval){this.strike(a);a.pulses++;if(a.pulses>1)this.emit('whoosh',{kind:this.weapon.ranged?'gun':a.kind,side:a.pulses%2?-1:1});}
     if(a.pulses===pulses&&a.elapsed>a.def.active+.065)speed=freeSpeed;
     const canChain=a.queued&&a.pulses===pulses&&a.elapsed>a.def.duration*(a.def.chainAt||(a.kind==='normal'?.88:.92));
     if(a.elapsed>=a.def.duration||canChain){const next=a.queued;p.attack=null;if(next)this.input(next);}
    }
    if(len>.08){p.moveAngle=Math.atan2(move.y,move.x);if(!p.attack||p.attack.pulses===(p.attack.def.pulses||1)&&p.attack.elapsed>p.attack.def.active+.06)p.angle=p.moveAngle;p.x+=move.x/Math.max(1,len)*speed*dt;p.y+=move.y/Math.max(1,len)*speed*dt;}
   }p.x+=p.knockX*dt;p.y+=p.knockY*dt;p.knockX*=Math.exp(-12*dt);p.knockY*=Math.exp(-12*dt);this.constrain(p,old);
  }
  tickPortals(this,dt);
  for(const l of this.loot){l.age+=dt;if(l.z>0||l.vz!==0){l.x+=l.vx*dt;l.y+=l.vy*dt;l.z+=l.vz*dt;l.vz-=900*dt;if(l.z<=0){l.z=0;l.bounces++;l.vz=l.bounces<2?Math.abs(l.vz)*.32:0;l.vx*=.3;l.vy*=.3;}const q=projectToFloor(l.x,l.y);if(!this.sandbox){l.x=q.x;l.y=q.y;}}}
  if(!p.dead)for(const l of [...this.loot])if((l.kind==='gold'||l.kind==='heal'&&p.hp<p.maxHp)&&l.z<8&&l.age>.65&&Math.hypot(l.x-p.x,l.y-p.y)<125)this.pickup(l.id);
  for(const b of this.bullets){const ox=b.x,oy=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.remaining-=1900*dt;const dx=b.x-ox,dy=b.y-oy,dd=dx*dx+dy*dy;const candidates=[];for(const e of this.enemies){if(e.dead||b.hit.has(e.id))continue;const t=clamp(((e.x-ox)*dx+(e.y-oy)*dy)/Math.max(1,dd),0,1);if(Math.hypot(e.x-ox-dx*t,e.y-oy-dy*t)<ShadowData.enemies[e.type].radius+(b.attack.def.width||22))candidates.push({e,t});}candidates.sort((a,b)=>a.t-b.t);for(const {e} of candidates){b.hit.add(e.id);this.strike({...b.attack,projectileHit:e.id});if(--b.pierce<=0){if(!ricochet(this,b,e))b.remaining=0;break;}}if(!this.sandbox&&!inFloor(b.x,b.y))b.remaining=0;}this.bullets=this.bullets.filter(b=>b.remaining>0);
  let attackers=this.enemies.filter(e=>e.wind>0&&!e.dead).length;for(const e of this.enemies)attackers=this.updateEnemy(e,dt,attackers);
  const living=this.enemies.filter(e=>!e.dead&&e.active);for(let i=0;i<living.length;i++)for(let j=i+1;j<living.length;j++){const a=living[i],b=living[j],dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy),min=ShadowData.enemies[a.type].radius+ShadowData.enemies[b.type].radius;if(dist<min&&dist>.01){const push=(min-dist)*.5;a.x-=dx/dist*push;a.y-=dy/dist*push;b.x+=dx/dist*push;b.y+=dy/dist*push;this.constrain(a);this.constrain(b);}}
  for(const b of this.projectiles){b.life-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(!this.sandbox&&!inFloor(b.x,b.y))b.life=0;if(Math.hypot(b.x-p.x,b.y-p.y)<28){this.damagePlayer(b.damage,b.x-b.vx,b.y-b.vy);b.life=0;}}this.projectiles=this.projectiles.filter(b=>b.life>0);this.enemies=this.enemies.filter(e=>!e.dead||e.death>0);
  for(const g of this.groups)if(!g.cleared&&!this.enemies.some(e=>e.group===g.id&&!e.dead)){g.cleared=true;g.respawnAt=this.time+(g.units?.some(u=>ShadowData.enemies[u[0]].boss)?240:90);this.emit('groupCleared',{id:g.id});}
  tickHunt(this);
 }
 snapshot(){return {zone:areaAt(this.player.x,this.player.y),kills:this.kills,combo:this.combo,health:this.player.hp,weapon:this.player.weapon,enemyCount:this.enemies.filter(e=>!e.dead).length,player:{x:this.player.x,y:this.player.y},ultimate:this.player.ultimate,gold:this.gold,chests:this.chests.filter(c=>c.opened).length,bosses:this.bossesDefeated.length,victory:this.victory};}
}
