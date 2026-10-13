// Landmarks standing on the walkable floor. Shared by the simulation (colliders) and the renderer (models).
// Positions are world units; each spot keeps clear of roads, camps, chests, people and lair stages.
export const LANDMARKS=[
 {id:'mill-west',name:'Willowbend Windmills',kind:'windmill',x:-300,y:0,r:78},
 {id:'mill-shore',kind:'windmill',x:100,y:1550,r:78},
 {id:'mill-east',kind:'windmill',x:1600,y:750,r:78},
 {id:'elder-pine',name:'The Elder Blackpine',kind:'elderTree',x:-1000,y:50,r:85},
 {id:'stones-north',name:'The Mossbound Stones',kind:'stoneCircle',x:-2200,y:-1250,r:0},
 {id:'arch-saffron',name:'The Sunstone Arch',kind:'arch',x:3800,y:850,r:0},
 {id:'totem-saffron',name:'Caravan Totem',kind:'totem',x:5950,y:1450,r:45},
 {id:'spire-glass',name:'The Singing Spires',kind:'crystalSpire',x:5800,y:-600,r:80},
 {id:'spire-glass-2',kind:'crystalSpire',x:5600,y:-1200,r:70},
 {id:'shrine-wind',name:'Whitewind Shrine',kind:'windShrine',x:8200,y:-2200,r:0},
 {id:'spike-cinder',name:'The Obsidian Teeth',kind:'obsidian',x:8550,y:700,r:60},
 {id:'spike-cinder-2',kind:'obsidian',x:9100,y:950,r:55},
 {id:'colossus-brass',name:'The Fallen Colossus',kind:'brassColossus',x:9400,y:-1400,r:95},
 {id:'cog-brass',name:'The Great Cog',kind:'brassCog',x:10050,y:-2800,r:80},
];
// First visits grant exploration XP. Distant scenery is discovered from a viewpoint on the walkable floor.
export const DISCOVERIES=[
 ...LANDMARKS.filter(l=>l.name).map(l=>({id:l.id,name:l.name,x:l.x,y:l.y,r:550})),
 {id:'lighthouse',name:'Seabell Lighthouse',x:-3550,y:600,r:600},
 {id:'cloudwater-dam',name:'Cloudwater Dam',x:1950,y:-3100,r:650},
 {id:'sea-stacks',name:'The Saffron Sea Stacks',x:4500,y:1350,r:650},
 {id:'ember-throne',name:'The Ember Throne',x:10850,y:-500,r:750},
];
// Multi-part landmarks expose several small colliders instead of one blocking disc.
export function landmarkColliders(){
 const out=[];
 for(const l of LANDMARKS){
  if(l.kind==='stoneCircle')for(let i=0;i<7;i++){const a=i*Math.PI*2/7;out.push({x:l.x+Math.cos(a)*240,y:l.y+Math.sin(a)*240,r:32});}
  else if(l.kind==='arch')for(const s of [-1,1])out.push({x:l.x+s*150,y:l.y,r:48});
  else if(l.kind==='windShrine')for(const s of [-1,1])out.push({x:l.x+s*120,y:l.y,r:30});
  else out.push({x:l.x,y:l.y,r:l.r});
 }
 return out;
}
