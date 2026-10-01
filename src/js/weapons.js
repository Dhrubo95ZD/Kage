const cut=(name,damage,reach,arc,duration,clip,extra={})=>({name,damage,reach,arc,duration,active:duration*.32,clip,lunge:190,chainAt:.64,swingSide:1,...extra});
const ShadowData={weapons:{
 katana:{id:'katana',name:'Nightfall',type:'KATANA',tag:'Flow · launch · execute',color:'#ff6639',speed:440,
 description:'Cut twice, then Heavy to launch. Attack juggles airborne enemies. Heavy again drives them into the ground.',
 chain:[cut('Draw',22,135,1.8,.34,'1H_Melee_Attack_Slice_Diagonal'),cut('Reversal',26,145,2.4,.34,'1H_Melee_Attack_Slice_Horizontal',{swingSide:-1}),cut('Pierce',32,175,1.5,.36,'1H_Melee_Attack_Stab',{lunge:260}),cut('Reaping crescent',52,190,4.6,.54,'2H_Melee_Attack_Spin',{knock:240})],
 heavy:cut('Falling edge',48,175,2.5,.60,'2H_Melee_Attack_Chop',{knock:140}),
 finisher:cut('Rising night',42,190,3.3,.53,'1H_Melee_Attack_Slice_Diagonal',{launch:480}),
 slam:cut('Nightfall execution',88,235,7,.65,'2H_Melee_Attack_Chop',{radial:true,slam:true,knock:360}),
 dashAttack:cut('Running draw',45,195,2.5,.36,'1H_Melee_Attack_Stab',{lunge:420,knock:120}),
 skills:[{...cut('Long cut',68,310,2.8,.55,'1H_Melee_Attack_Slice_Horizontal'),id:'longcut',cooldown:4,shape:'rush',lunge:520,width:90,icon:'↗'}, {...cut('Whirlwind cut',27,340,7,.92,'2H_Melee_Attack_Spinning'),id:'orbit',cooldown:7,shape:'spin',pulses:4,radial:true,icon:'◎'}],
 ultimate:{...cut('Full commitment',135,380,7,.95,'2H_Melee_Attack_Spin'),shape:'nova',radial:true,launch:520}},
 twins:{id:'twins',name:'Whisper & Wound',type:'TWIN BLADES',tag:'Rapid · pursuit · flurry',color:'#ded4bb',speed:480,
 description:'Five quick cuts. Two cuts into Heavy launch the target; another Heavy ends the juggle. Rush cuts through groups.',
 chain:[cut('Fang',15,125,2,.26,'Dualwield_Melee_Attack_Slice'),cut('Echo',17,130,2.3,.27,'Dualwield_Melee_Attack_Chop'),cut('Split',20,140,2.5,.28,'Dualwield_Melee_Attack_Stab'),cut('Lacerate',22,145,3,.29,'Dualwield_Melee_Attack_Slice'),cut('Sever',39,170,4.1,.41,'Dualwield_Melee_Attack_Chop',{knock:160})],
 heavy:cut('Twin fang',35,170,2.4,.42,'Dualwield_Melee_Attack_Chop',{lunge:240}),finisher:cut('Rising blades',38,180,3,.42,'Dualwield_Melee_Attack_Slice',{launch:510}),
 slam:cut('Death from above',76,230,7,.53,'Dualwield_Melee_Attack_Chop',{slam:true,radial:true,knock:300}),
 dashAttack:cut('Backstab',57,170,3,.28,'Dualwield_Melee_Attack_Stab',{lunge:360}),
 skills:[{...cut('Blade rush',25,245,7,.70,'Dualwield_Melee_Attack_Slice'),id:'rush',cooldown:4,shape:'rush',pulses:4,radial:true,lunge:520,icon:'»'}, {...cut('Blade bloom',61,360,7,.57,'2H_Melee_Attack_Spin'),id:'bloom',cooldown:6,shape:'nova',radial:true,icon:'✧'}],
 ultimate:{...cut('Thousand cuts',40,340,7,1.1,'2H_Melee_Attack_Spinning'),shape:'spin',pulses:6,radial:true}},
 greatsword:{id:'greatsword',name:'Ironbreaker',type:'GREATSWORD',tag:'Weight · crush · rupture',color:'#eab478',speed:400,
 description:'Three heavy cuts. Two cuts into Heavy throw enemies into the air. Follow with a crushing ground execution.',
 chain:[cut('Iron cut',38,185,2.6,.49,'2H_Melee_Attack_Slice'),cut('Reverse cleave',48,200,3.3,.55,'2H_Melee_Attack_Chop'),cut('Breaker sweep',72,220,4.7,.70,'2H_Melee_Attack_Spin',{knock:330})],
 heavy:cut('Earthsplitter',65,225,2.6,.72,'2H_Melee_Attack_Chop',{knock:260}),finisher:cut('Rising steel',65,235,4,.69,'2H_Melee_Attack_Slice',{launch:540}),
 slam:cut('Crushing finish',125,285,7,.81,'2H_Melee_Attack_Chop',{radial:true,slam:true,knock:440}),
 dashAttack:cut('Iron charge',58,210,2.3,.43,'2H_Melee_Attack_Stab',{lunge:390,knock:260}),
 skills:[{...cut('Fault line',95,370,2.8,.75,'2H_Melee_Attack_Chop'),id:'breaker',cooldown:5,shape:'rush',lunge:460,width:110,knock:300,icon:'↯'}, {...cut('Guard breaker',64,350,7,.68,'2H_Melee_Attack_Slice'),id:'guardbreak',cooldown:8,shape:'spin',radial:true,lunge:0,icon:'◉'}],
 ultimate:{...cut('Total onslaught',190,410,7,1.1,'2H_Melee_Attack_Chop'),shape:'nova',radial:true,launch:600,knock:400}}
,
 pistols:{id:'pistols',name:'Iron Viper',type:'PISTOLS',tag:'Strafe · pierce · suppress',color:'#ffcc77',speed:455,ranged:true,
 description:'Fire on the move. Tap for chained shots; the third shot pierces. Heavy fires a close spread. Skills: piercing rail shot and a rolling burst. No melee launcher or aerial slam.',
 chain:[cut('Snap shot',25,900,.12,.24,'1H_Ranged_Shoot',{shape:'bullet',lunge:0,width:26}),cut('Follow-up shot',27,900,.12,.24,'1H_Ranged_Shooting',{shape:'bullet',lunge:0,width:26}),cut('Through shot',44,1050,.12,.38,'1H_Ranged_Shoot',{shape:'bullet',lunge:0,width:30,pierce:3})],
 heavy:cut('Scatter shot',23,570,.75,.48,'1H_Ranged_Shooting',{shape:'bullet',lunge:0,pellets:5,spread:.65,width:23,knock:330}),
 finisher:cut('Scatter shot',23,570,.75,.48,'1H_Ranged_Shooting',{shape:'bullet',lunge:0,pellets:5,spread:.65,width:23,knock:330}),
 slam:cut('Close shot',45,500,.12,.3,'1H_Ranged_Shoot',{shape:'bullet',lunge:0}),
 dashAttack:cut('Retaliation burst',28,850,.12,.50,'1H_Ranged_Shooting',{shape:'bullet',lunge:0,pulses:3,width:28}),
 skills:[{...cut('Piercing round',105,1300,.10,.55,'1H_Ranged_Shoot',{shape:'bullet',lunge:0,pierce:6,width:65,knock:280}),cooldown:4,icon:'➤'}, {...cut('Strafe barrage',13,950,.15,.8,'1H_Ranged_Shooting',{shape:'bullet',lunge:0,pulses:6,width:32,pellets:3,spread:.5}),cooldown:7,icon:'»'}],
 ultimate:{...cut('Full magazine',38,1100,.4,1.25,'1H_Ranged_Shooting',{shape:'bullet',lunge:0,pulses:10,pellets:3,spread:.24,width:28,pierce:2})}}
},enemies:{raider:{hp:112,speed:330,damage:18,range:110,wind:.58,radius:24,color:'#bcaa8b'},brute:{hp:285,speed:245,damage:32,range:180,wind:.88,radius:40,color:'#928888'},archer:{hp:92,speed:295,damage:23,range:470,wind:.80,radius:23,color:'#998571'},captain:{hp:1150,speed:300,damage:32,range:190,wind:.78,radius:43,color:'#bd8b65',boss:true,name:'TOLL CAPTAIN'},commander:{hp:2400,speed:325,damage:39,range:210,wind:.80,radius:48,color:'#b9996e',boss:true,name:'MARSHAL ROOK'}}};
Object.assign(ShadowData.enemies,{
 shieldguard:{hp:310,speed:275,damage:24,range:125,wind:.75,radius:29,color:'#a7b4b6',name:'CARAVAN SHIELDGUARD'},
 scout:{hp:120,speed:370,damage:17,range:115,wind:.6,radius:22,color:'#b6a17c',name:'SIGNAL SCOUT'},
 spider:{hp:170,speed:355,damage:23,range:340,wind:.8,radius:30,color:'#83c7d7',creature:'spider',name:'GLASSBACK SPIDER'},
 golem:{hp:570,speed:185,damage:40,range:220,wind:1.15,radius:52,color:'#b77344',creature:'golem',name:'CINDER GOLEM'},
 ridgebeast:{hp:230,speed:390,damage:29,range:340,wind:.85,radius:34,color:'#adb9bc',creature:'beast',name:'RIDGE STALKER'},
 warden:{hp:2400,speed:300,damage:37,range:220,wind:.9,radius:44,color:'#bd9b65',boss:true,name:'MARSHAL HADRIK'},
 matriarch:{hp:2900,speed:320,damage:32,range:500,wind:1.1,radius:56,color:'#7ac7d8',boss:true,creature:'spider',name:'GLASSWEAVER MATRIARCH'},
 colossus:{hp:4200,speed:210,damage:48,range:340,wind:1.25,radius:65,color:'#d98a48',boss:true,creature:'golem',name:'FURNACE COLOSSUS'}
});
export default ShadowData;
