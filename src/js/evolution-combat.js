import {trackTraining} from './caravan-story.js';
export const basic=kind=>kind==='normal'||kind==='juggle';
export function grantBarrier(sim,fraction,seconds){const p=sim.player;const amount=p.maxHp*fraction*(1+(sim.build?.barrier||0));p.barrier=Math.max(p.barrier||0,amount);p.barrierTime=Math.max(p.barrierTime||0,seconds);}
export function onBuildDodge(sim){const b=sim.build||{},p=sim.player;if(b.keys?.reserve)grantBarrier(sim,.1,3);if(b.evolution==='strider'){p.momentum=Math.min(3,(p.momentum||0)+1);p.momentumTime=5;}if(b.traits?.rollingReload)p.skillCooldowns=p.skillCooldowns.map(t=>Math.max(0,t-.5));p.focus=0;}
export function prepareBuildAttack(sim,def,kind){const p=sim.player,b=sim.build||{},t=b.traits||{},d={...def};d.buildMultiplier=1;
 if(b.evolution==='sharpshooter'){d.buildMultiplier*=1+(p.focus||0)/1.5*.35;if(p.focus>=1.49){d.focused=true;if(t.cleanLine)d.pierce=(d.pierce||1)+2;if(t.patientAim)d.extraCrit=.15;}}
 if(kind==='skill'){if(b.evolution==='strider'){const stacks=p.momentum||0;trackTraining(sim,'momentum',stacks);d.buildMultiplier*=1+stacks*.2;if(t.crosswind)d.reach*=1+stacks*.15;p.momentum=0;p.momentumTime=0;}
 if(b.keys?.alternation){d.buildMultiplier*=p.primed>0?1.35:.85;p.primed=0;}}
 if(b.keys?.volley)d.pierce=1;
 return d;
}
export function buildHitContext(sim,a,e){const p=sim.player,b=sim.build||{},t=b.traits||{};let multiplier=a.def.buildMultiplier||1,forceCrit=false;
 if(e.exposedUntil>sim.time){multiplier*=1.2;trackTraining(sim,'exposed');}
 if(b.evolution==='duelist'&&a.kind==='skill'&&p.markId===e.id&&p.markTime>0){const marks=p.marks||0;trackTraining(sim,'marks',marks);multiplier*=1+marks*.15;forceCrit=!!t.perfectMeasure&&marks>=3;if(t.resetForm)p.skillCooldowns=p.skillCooldowns.map(v=>Math.max(0,v-.4*marks));p.marks=0;p.markTime=0;}
 if(t.guardedStrike&&a.kind==='skill'&&p.barrier>0)multiplier*=1.25;
 return {multiplier,forceCrit};
}
export function afterBuildHit(sim,a,e,critical){const p=sim.player,b=sim.build||{},t=b.traits||{};
 if(e.z>25)trackTraining(sim,'air');if(basic(a.kind)&&sim.combo>=10)trackTraining(sim,'rhythm');if(a.kind==='dashAttack')trackTraining(sim,'dashHit');if(a.def.focused)trackTraining(sim,'focus',1,a.id+':'+a.pulses);
 if(b.evolution==='duelist'&&basic(a.kind)){p.marks=p.markId===e.id&&p.markTime>0?Math.min(3,(p.marks||0)+1):1;p.markId=e.id;p.markTime=4;}
 if((b.evolution==='siege'&&a.kind==='skill')||(b.keys?.exploit&&critical))e.exposedUntil=sim.time+4;
 if(b.keys?.alternation&&basic(a.kind))p.primed=4;
 if(t.airGuard&&e.z>25){const token=a.id+':'+a.pulses;if(!(p.airGuardTokens||[]).includes(token)){grantBarrier(sim,.06,3);p.airGuardTokens=[...(p.airGuardTokens||[]),token].slice(-100);}}
}
export function onBuildBlock(sim){trackTraining(sim,'block');const b=sim.build||{};if(b.evolution==='bulwark')grantBarrier(sim,.12,4);if(b.keys?.rebound)sim.player.hp=Math.min(sim.player.maxHp,sim.player.hp+sim.player.maxHp*.05);}
export function onBuildKill(sim){const b=sim.build||{};if(b.keys?.sustain)grantBarrier(sim,.08,4);if(b.traits?.quickReturn)sim.player.dashCooldown=Math.max(0,sim.player.dashCooldown-.25);}
export function tickBuild(sim,dt,move){const p=sim.player,b=sim.build||{};for(const key of ['markTime','momentumTime','primed'])p[key]=Math.max(0,(p[key]||0)-dt);if(!p.markTime)p.marks=0;if(!p.momentumTime)p.momentum=0;if(b.evolution==='sharpshooter')p.focus=Math.hypot(move.x,move.y)>.08||p.dashTime>0?0:Math.min(1.5,(p.focus||0)+dt);if(!p.dead&&!b.keys?.rebound){const regen=(b.regen||0)+(b.keys?.tenacity&&p.hp<p.maxHp*.4?3:0);p.hp=Math.min(p.maxHp,p.hp+regen*dt);}}
export function buildStatus(sim){const p=sim.player,b=sim.build||{};if(b.evolution==='duelist')return `MARKS ${p.marks||0}/3`;if(b.evolution==='strider')return `MOMENTUM ${p.momentum||0}/3`;if(b.evolution==='sharpshooter')return `FOCUS ${Math.round((p.focus||0)/1.5*100)}%`;return p.primed>0?'TECHNIQUE PRIMED':'';}
export function clearBuildRuntime(sim){for(const k of ['marks','markTime','momentum','momentumTime','primed','focus','barrier','barrierTime','counterPower'])sim.player[k]=0;}
