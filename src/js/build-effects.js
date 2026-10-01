export function modifyAttack(def,kind,b,ranged){const d={...def},k=b.keys||{},t=b.traits||{},normal=kind==='normal'||kind==='juggle',speed=Math.max(.6,(1+(b.attackSpeed||0)+(b.evolution==='dancer'&&normal?.15:0))*(k.rail?.8:1));d.duration/=speed;d.active/=speed;d.reach*=1+(b.range||0)+(!ranged?(b.area||0):0);if(d.launch)d.launch*=1+(b.launch||0);if(d.knock)d.knock*=1+(b.knock||0);
 if(b.evolution==='windblade'&&kind==='skill'){d.reach*=1.3;if(d.launch)d.launch*=1.25;if(t.updraft&&!d.slam)d.launch=Math.max(d.launch||0,310);}
 if(b.evolution==='dancer'&&normal){d.arc*=1.4;d.damage*=.9;if(t.fullCircle){d.shape='spin';d.radial=true;d.reach*=.85;}}
 if(t.encore&&kind==='skill'){d.pulses=(d.pulses||1)+1;d.damage*=.8;}
 if(t.aftershock&&d.slam){d.pulses=2;d.reach*=1.25;d.damage*=.7;}
 if(k.impact&&d.slam)d.reach*=1.5;
 if(k.ground)d.launch=0;
 if(ranged){if(k.scatter){d.pellets=(d.pellets||1)+2;d.spread=Math.max(d.spread||0,.32);d.damage*=.48;d.reach*=.7;}if(k.rail){d.pierce=(d.pierce||1)+2;d.damage*=1.2;}if(b.evolution==='outrider'&&kind==='dashAttack'){d.pellets=(d.pellets||1)+2;d.spread=Math.max(d.spread||0,.40);d.damage*=.75;}if(k.volley){d.pierce=1;if(kind==='skill'){d.pulses=(d.pulses||1)+2;d.damage*=.6;}}}
 return d;
}
export function hitMultiplier(b,{kind,aerial,slam,enemyRatio,distance,ranged,critical,counter,moving=false,combo=0,lifeRatio=1}){const k=b.keys||{},t=b.traits||{};let m=1;if(kind==='skill')m*=1+(b.skillDamage||0);if(kind==='dashAttack')m*=1+(b.dashDamage||0)+(k.riposte?.6:0);if(aerial)m*=1+(b.aerial||0)+(k.sky?.5:0);else if(k.sky)m*=.8;if(k.ground)m*=slam?1.6:kind==='normal'?1.2:1;if(k.deadeye)m*=.85;if(k.resolute)m*=1.3;if(k.fleet)m*=.85;if(k.counter)m*=.9;if(k.finish)m*=enemyRatio<.3?1.45:.9;if(k.longshot&&ranged)m*=distance>500?1.7:distance<250?.65:1;if(k.engine&&kind==='skill')m*=.85;if(k.specialist)m*=kind==='skill'?1.65:.65;if(k.second)m*=.9;if(k.glass)m*=1.4;if(counter)m*=1.6;
 if(k.pressure)m*=.85*(1+Math.min(20,combo)*.02);if(k.opening)m*=enemyRatio>.9?1.8:.9;if(k.hangtime)m*=aerial?1.4:.8;if(k.impact)m*=slam?1.35:.85;if(k.pursuit)m*=moving?1.3:.8;if(k.focus)m*=moving?.85:1.4;if(k.close&&ranged)m*=distance<300?1.6:distance>600?.6:1;if(k.overdrive&&kind==='skill')m*=.8;if(k.tenacity&&lifeRatio<.4)m*=1.45;if(k.exploit&&critical)m*=.85;
 if(b.evolution==='windblade')m*=aerial?1.2:.9;if(b.evolution==='bulwark')m*=.9;if(t.closeQuarters)m*=distance<300?1.25:distance>600?.85:1;
 if(critical)m*=1.5+(b.critPower||0);return m;
}
