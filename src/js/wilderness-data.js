export const WILDERNESS=[
 {id:'coast',name:'Greyshore',x:-2750,y:1350,level:1,loot:'approach',color:'#555d4e'},
 {id:'forest',name:'Blackpine Woods',x:-1450,y:-650,level:4,loot:'quarry',color:'#36483e'},
 {id:'lowlands',name:'Old Mill Lowlands',x:850,y:400,level:6,loot:'garrison',color:'#65614c'},
 {id:'reservoir',name:'The Drowned Ramparts',x:2650,y:-3100,level:8,loot:'keep',color:'#485457'},
 {id:'saffron',name:'Saffron Frontier',x:4800,y:650,level:10,loot:'terraces',color:'#6b6252'},
 {id:'ravine',name:'Glassroot Ravine',x:6600,y:-1450,level:12,loot:'terraces',color:'#44575b'},
 {id:'snow',name:'Whitewind Highlands',x:8250,y:-2950,level:15,loot:'highlands',color:'#a2aeb3'},
 {id:'cinder',name:'Cinderwash Wastes',x:8850,y:0,level:16,loot:'highlands',color:'#55483e'},
 {id:'fortress',name:'Brasswater Ruins',x:9820,y:-2450,level:19,loot:'fortress',color:'#5b5851'}
];
export function wildernessRegion(x,y){return WILDERNESS.reduce((a,b)=>Math.hypot(x-b.x,y-b.y)<Math.hypot(x-a.x,y-a.y)?b:a);}
// Continuous weighted field shared by the terrain and biome decoration.
export function biomeWeights(x,y){const weights=WILDERNESS.map(r=>1/Math.pow(1+((x-r.x)**2+(y-r.y)**2)/180000,2));const total=weights.reduce((a,b)=>a+b,0);return weights.map(w=>w/total);}
export const LORE=[
 {id:'farid',x:-2620,y:1370,name:'Farid',text:'The woods pay better than the coast. Watch the axemen: let their swing miss, then step in.'},
 {id:'c2-hunts',x:5730,y:1020,name:'Nadia',text:'Each boss lair has its own weapon fragments. Six matching pieces make a signature weapon. Craft from your menu whenever you have room.'},
 {id:'c2-trainer',x:5450,y:920,name:'Maryam',text:'Save your dodge for the warning. A shield is strongest at the front. Circle behind it or break it with a skill.'},
 {id:'c2-surveyor',x:7250,y:-2030,name:'Idris',text:'Whitewind and Cinderwash are harsh country. Better armor and a focused build matter there. No permit will stop you trying.'}
];
