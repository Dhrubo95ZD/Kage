import {TEMPERS} from './hunt-data.js';
import {evolutionBonuses} from './evolutions.js';
// Original connected passive atlas. All effects are consumed by the shared simulation.
export const STAT_LABELS={damage:'Damage',attackSpeed:'Attack speed',crit:'Critical chance',critPower:'Critical multiplier',bossDamage:'Boss damage',aerial:'Airborne damage',launch:'Launch height',knock:'Knockback',move:'Movement speed',dashCooldown:'Dodge recovery',dashDamage:'Dodge follow-up damage',attackMove:'Movement while attacking',armor:'Armor',health:'Maximum health',block:'Block chance',range:'Attack reach',pierce:'Projectile pierce',cooldown:'Skill recovery',skillDamage:'Skill damage',healKill:'Life on kill',regen:'Life regeneration per second',area:'Area reach',stun:'Stagger duration',barrier:'Barrier strength'};
export const DISCIPLINES=[
 {id:'edge',name:'EDGECRAFT',color:'#e59674',stats:[['damage',.04],['attackSpeed',.025],['bossDamage',.05],['crit',.015]],paths:[['Keen Edge','Measured Cut','Fencer’s Rhythm','Open Guard','Clean Finish','Deadeye'],['Steady Hand','Weight of Steel','Patient Hunter','Unbroken Form','Final Measure','Resolute']],keys:['deadeye','resolute']},
 {id:'air',name:'AERIAL CONTROL',color:'#a4c9df',stats:[['aerial',.07],['launch',.06],['knock',.05],['damage',.03]],paths:[['Rising Edge','Light Step','Above the Guard','Long Descent','Skyward Pursuit','Sky Hunter'],['Deep Stance','Driving Cut','Heavy Landing','Fault Line','Ground Mastery','Groundbreaker']],keys:['sky','ground']},
 {id:'motion',name:'MOMENTUM',color:'#8bd2bb',stats:[['move',.025],['dashCooldown',.04],['dashDamage',.07],['attackMove',.04]],paths:[['Footwork','Fast Recovery','Winding Step','Passing Strike','Return Stroke','Riposte Runner'],['Open Road','Loose Stance','Relentless Pace','Moving Guard','Travel Light','Fleetfoot']],keys:['riposte','fleet']},
 {id:'guard',name:'IRON DISCIPLINE',color:'#d5bf8b',stats:[['armor',.06],['health',.035],['block',.015],['damage',.03]],paths:[['Brace','Layered Plate','Firm Ground','Lasting Guard','Unyielding','Fortress'],['Watchful','Angled Guard','Turn the Edge','Measured Answer','Counter Drill','Counterweight']],keys:['fortress','counter']},
 {id:'precision',name:'PRECISION',color:'#d5a7c1',stats:[['crit',.015],['critPower',.06],['bossDamage',.05],['range',.03]],paths:[['Weak Point','Fine Aim','Read the Opening','Exact Timing','Hunter’s Focus','Finishing School'],['Quiet Breath','Long Sight','Measured Distance','Clear Line','Patient Trigger','Longshot']],keys:['finish','longshot']},
 {id:'ballistics',name:'BALLISTICS',color:'#aab8e3',stats:[['range',.035],['attackSpeed',.025],['damage',.03],['critPower',.04]],paths:[['Prepared Round','Quick Chamber','Tight Pattern','Steel Jacket','Crossfire','Scattershot'],['Far Reach','Steady Barrel','Follow Through','Deep Impact','Penetration','Rail Discipline']],keys:['scatter','rail']},
 {id:'technique',name:'TECHNIQUE',color:'#cbb1e1',stats:[['cooldown',.04],['skillDamage',.05],['attackSpeed',.025],['damage',.03]],paths:[['Repetition','Short Recovery','Perfect Sequence','Linked Forms','Flow State','Combo Engine'],['Deliberate','Stored Power','Full Commitment','Decisive Form','Signature Move','Specialist']],keys:['engine','specialist']},
 {id:'endurance',name:'ENDURANCE',color:'#b4ca8b',stats:[['health',.035],['healKill',2],['regen',.3],['armor',.05]],paths:[['Fieldcraft','Strong Pulse','Stay Standing','Recover Ground','Deep Reserve','Second Wind'],['Hard Bargain','Sharp Resolve','Narrow Margin','Nothing Wasted','All In','Glass Edge']],keys:['second','glass']}
];
export const KEYSTONES={deadeye:{text:'+20% critical chance. 15% less hit damage.'},resolute:{text:'30% more hit damage. You cannot critically strike.'},sky:{text:'Every third basic melee hit launches non-armored targets. +50% airborne damage; 20% less damage to grounded targets.',melee:true},ground:{text:'+60% slam damage and +20% basic damage. Your attacks can no longer launch enemies.',melee:true},riposte:{text:'+60% damage on attacks immediately after a dodge. Dodge cooldown is 30% longer.'},fleet:{text:'+35% movement speed and full movement while attacking. 15% less hit damage.'},fortress:{text:'70% more armor. 15% less movement speed.'},counter:{text:'+15% block chance. Blocking empowers your next hit by 60% for 4 seconds. 10% less hit damage.'},finish:{text:'Deal 45% more hit damage to enemies below 30% life. Deal 10% less above that threshold.'},longshot:{text:'Shots deal 70% more damage beyond 500 distance, 35% less inside 250.',weapon:'pistols'},scatter:{text:'Fire two additional rounds in a spread. Each round deals 48% damage and has 30% less range.',weapon:'pistols'},rail:{text:'Shots pierce two additional enemies and deal 20% more damage. 20% less attack speed.',weapon:'pistols'},engine:{text:'Basic hits reduce both skill cooldowns by 0.12 seconds (once per attack pulse). 15% less skill damage.'},specialist:{text:'65% more skill damage. 35% less basic and dodge-follow-up damage.'},second:{text:'Below 30% life, gain a barrier equal to 20% maximum life for 4 seconds, once every 12 seconds. 10% less hit damage.'},glass:{text:'40% more hit damage. 35% less maximum life.'}};
Object.assign(KEYSTONES,{
 pressure:{text:'Each hit gains 2% more damage per current combo hit, up to 40%. 15% less hit damage.'},
 opening:{text:'80% more damage against enemies above 90% life; 10% less otherwise.'},
 hangtime:{text:'40% more airborne damage and 40% stronger juggle lifts. 20% less damage to grounded enemies.',melee:true},
 impact:{text:'Slam attacks gain 50% reach and 35% damage. Other attacks deal 15% less damage.',melee:true},
 pursuit:{text:'30% more hit damage while moving. 20% less while standing still.'},
 reserve:{text:'Dodge grants a 10% maximum-life barrier for 3 seconds. Dodge cooldown is 40% longer.'},
 bastion:{text:'Take 30% less damage above 80% life. 10% less movement speed.'},
 rebound:{text:'Blocking recovers 5% maximum life. Passive life regeneration is disabled.'},
 exploit:{text:'Critical hits expose enemies for 4 seconds; later hits deal 20% more damage. Critical hits deal 15% less damage.'},
 focus:{text:'40% more hit damage while stationary. 15% less while moving.'},
 close:{text:'60% more damage within 300 distance. 40% less beyond 600.',weapon:'pistols'},
 volley:{text:'Skills fire two extra pulses at 60% damage per pulse. All shots stop at the first enemy, overriding pierce bonuses.',weapon:'pistols'},
 alternation:{text:'A basic hit primes your next skill for 35% more damage for 4 seconds. Skills without preparation deal 15% less damage.'},
 overdrive:{text:'30% shorter skill cooldowns. Skills deal 20% less damage.'},
 tenacity:{text:'45% more hit damage below 40% life. Regenerate an additional 3 life per second while below 40%.'},
 sustain:{text:'Kills grant an 8% maximum-life barrier for 4 seconds. 10% less maximum life.'}
});
export const NODES=[],EDGES=[];const add=n=>{NODES.push(n);return n.id;},link=(a,b)=>EDGES.push([a,b]);
const polar=(a,r,t=0)=>({x:Math.cos(a)*r-Math.sin(a)*t,y:Math.sin(a)*r+Math.cos(a)*t});
for(const [di,d] of DISCIPLINES.entries()){const a=di*Math.PI/4-Math.PI/2;
 for(let i=0;i<4;i++){const [stat,value]=d.stats[i];add({id:d.id+'-s'+i,name:d.name.split(' ')[0]+' · '+['Foundation','Practice','Discipline','Mastery'][i],group:d.id,kind:'small',effects:{[stat]:value},...polar(a,210+i*70)});if(i)link(d.id+'-s'+(i-1),d.id+'-s'+i);}
 for(let side=0;side<2;side++)for(let i=0;i<6;i++){const id=d.id+'-'+side+'-'+i,key=i===5?d.keys[side]:null,[stat,value]=d.stats[(i+side)%4],kind=key?'keystone':i>=3?'notable':'small';add({id,name:d.paths[side][i],group:d.id,kind,key,level:key?8:i>=3?4:1,effects:key?{}:{[stat]:value*(i>=3?2:1)},...polar(a,470+i*65,(side?1:-1)*(75+i*10))});link(i?d.id+'-'+side+'-'+(i-1):d.id+'-s3',id);}
 for(let i=0;i<2;i++){const id=d.id+'-link'+i;add({id,name:['Versatile Training','Cross Discipline'][i],group:d.id,kind:'small',effects:i?{health:.025}:{damage:.025},...polar(a+Math.PI/8,270+i*90)});link(d.id+'-s'+(i+1),id);link(id,DISCIPLINES[(di+1)%8].id+'-s'+(i+1));}
}
// Outer atlas: 24 branching clusters, a cross-sector ring, and no forced keystone tolls.
const OUTER=[
 ['pressure','opening',['Relentless Pressure','First Contact','Blade Mastery']],
 ['hangtime','impact',['Long Descent','Seismic Form','Aerial Mastery']],
 ['pursuit','reserve',['Running Battle','Stored Resolve','Movement Mastery']],
 ['bastion','rebound',['Fortified Position','Restorative Guard','Defense Mastery']],
 ['exploit','focus',['Exploit Weakness','Stillpoint','Precision Mastery']],
 ['close','volley',['Point Blank','Full Salvo','Firearm Mastery']],
 ['alternation','overdrive',['Linked Technique','Rapid Cycling','Technique Mastery']],
 ['tenacity','sustain',['Narrow Escape','Field Recovery','Endurance Mastery']]
];
for(const [di,d] of DISCIPLINES.entries()){
 const a=di*Math.PI/4-Math.PI/2,[keyA,keyB,names]=OUTER[di];
 for(let branch=0;branch<3;branch++)for(let i=0;i<9;i++){
  const id=d.id+'-outer-'+branch+'-'+i,key=i===8&&branch<2?[keyA,keyB][branch]:null;
  const [stat,value]=d.stats[(i+branch)%4],special=['area','stun','barrier'][(di+branch)%3];
  const effects=key?{}:i===8?{[stat]:value*2,[special]:.12}:i===4?{[stat]:value*1.5,[special]:.06}:{[i===2?special:stat]:i===2?.04:value};
  add({id,name:i===8?names[branch]:names[branch]+' · '+['Approach','Practice','Adaptation','Commitment','Expertise','Application','Resolve','Perfection'][i],group:d.id,kind:key?'keystone':i===4||i===8?'notable':'small',key,level:i===8?12:i>=4?8:4,effects,...polar(a,890+i*68,(branch-1)*220)});
  link(i?d.id+'-outer-'+branch+'-'+(i-1):d.id+'-'+(branch===0?0:1)+'-4',id);
 }
 // Five travel nodes form a ring between neighboring sectors; two branches can enter it.
 for(let i=0;i<5;i++){
  const id=d.id+'-road-'+i;add({id,name:d.name+' · Outer passage '+(i+1),group:d.id,kind:'small',effects:i%2?{health:.02}:{damage:.02},level:4,...polar(a+(.09+(i/4)*.60),1080)});
  link(i?d.id+'-road-'+(i-1):d.id+'-outer-2-3',id);
 }
 link(d.id+'-road-4',DISCIPLINES[(di+1)%8].id+'-outer-0-3');
 link(d.id+'-outer-0-4',d.id+'-outer-1-4');link(d.id+'-outer-1-4',d.id+'-outer-2-4');
}
export const STARTS={katana:['edge','air'],twins:['motion','precision'],greatsword:['guard','endurance'],pistols:['ballistics','technique']};
for(const [i,[classId,groups]] of Object.entries(STARTS).entries()){const root=add({id:'root-'+classId,name:{katana:'Vanguard',twins:'Skirmisher',greatsword:'Breaker',pistols:'Gunslinger'}[classId],kind:'root',group:groups[0],effects:{},...polar(i*Math.PI/2,100)});for(const group of groups)link(root,group+'-s0');}
export const BY_ID=Object.fromEntries(NODES.map(n=>[n.id,n]));export const NEIGHBORS=Object.fromEntries(NODES.map(n=>[n.id,[]]));for(const [a,b] of EDGES){NEIGHBORS[a].push(b);NEIGHBORS[b].push(a);}
export function treeState(p){return p?(p.skillTree??={version:1,nodes:[]}):null;}
export function pointBudget(p){return 3+(Math.min(20,Math.max(1,p.level))-1)*2+Object.values(p.quests||{}).filter(q=>q.status==='claimed').length+(p.story?.version===2?Math.floor(Math.min(9,p.story.stage)/3):0);}
export function pointsLeft(p){return pointBudget(p)-treeState(p).nodes.length;}
export function allowed(p,n){const k=KEYSTONES[n?.key];return !!n&&n.kind!=='root'&&(!k?.weapon||k.weapon===p.classId)&&(!k?.melee||p.classId!=='pistols');}
export function allocationError(p,id){if(typeof id!=='string'||!Object.hasOwn(BY_ID,id))return 'Unknown passive.';const n=BY_ID[id],st=treeState(p);if(!allowed(p,n))return 'This node is not available to your weapon class.';if(st.nodes.includes(id))return 'Already allocated.';if(pointsLeft(p)<1)return 'No passive points available.';if(p.level<(n.level||1))return 'Requires level '+n.level+'.';if(!NEIGHBORS[id].some(x=>x==='root-'+p.classId||st.nodes.includes(x)))return 'Connect a path from your class origin first.';if(n.key){if(st.nodes.filter(x=>BY_ID[x]?.key).length>=2)return 'At most two keystones can be active.';if(st.nodes.some(x=>BY_ID[x]?.key&&BY_ID[x].group===n.group))return 'Choose one keystone in each discipline.';}return '';}
export function allocate(p,id){if(allocationError(p,id))return false;treeState(p).nodes.push(id);return true;}
export function refund(p,id){const st=treeState(p);if(!st.nodes.includes(id))return false;const remaining=new Set(st.nodes.filter(n=>n!==id)),seen=new Set(),queue=['root-'+p.classId];for(let i=0;i<queue.length;i++)for(const n of NEIGHBORS[queue[i]]||[])if(remaining.has(n)&&!seen.has(n)){seen.add(n);queue.push(n);}if(seen.size!==remaining.size)return false;st.nodes=st.nodes.filter(n=>n!==id);return true;}
export function treeBonuses(p){const out={keys:{},...evolutionBonuses(p)};if(!p)return out;for(const id of treeState(p).nodes){const n=BY_ID[id];if(!n)continue;if(n.key)out.keys[n.key]=true;for(const [k,v] of Object.entries(n.effects))out[k]=(out[k]||0)+v;}for(const item of Object.values(p.equipment||{}))if(item?.passiveKey&&Object.hasOwn(KEYSTONES,item.passiveKey))out.keys[item.passiveKey]=true;for(const item of Object.values(p.equipment||{})){const t=TEMPERS[item?.temper];if(t)out[t.stat]=(out[t.stat]||0)+t.value;}for(const k of ['attackSpeed','cooldown','dashCooldown','block','crit'])out[k]=Math.min(out[k]||0,k==='block'||k==='crit'?.5:.4);return out;}
export function describe(n){if(n.key)return KEYSTONES[n.key].text;return Object.entries(n.effects).map(([k,v])=>`+${['healKill','regen','pierce'].includes(k)?Number(v.toFixed(2)):Math.round(v*100)+'%'} ${STAT_LABELS[k]}`).join(' · ');}

// Dijkstra by unspent point count. This is a roadmap; all real allocations still validate.
export function routeTo(p,target){
 if(!Object.hasOwn(BY_ID,target)||!allowed(p,BY_ID[target]))return [];
 const owned=new Set(treeState(p).nodes),root='root-'+p.classId,cost=new Map([[root,0]]),prev=new Map(),pending=new Set([root]),visited=new Set();
 while(pending.size){const u=[...pending].sort((a,b)=>cost.get(a)-cost.get(b))[0];pending.delete(u);if(u===target)break;visited.add(u);
  for(const v of NEIGHBORS[u]){if(visited.has(v)||!allowed(p,BY_ID[v]))continue;const c=cost.get(u)+(owned.has(v)?0:1);if(c<(cost.get(v)??Infinity)){cost.set(v,c);prev.set(v,u);pending.add(v);}}
 }
 if(!cost.has(target))return [];const path=[];for(let u=target;u&&u!==root;u=prev.get(u))if(!owned.has(u))path.unshift(u);return path;
}
