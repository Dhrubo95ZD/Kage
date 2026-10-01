import {wildernessRegion} from './wilderness-data.js';
import {HUNTS,HUNT_POLYGONS} from './hunt-data.js';
import {CARAVAN_POLYGONS,CARAVAN_ROOMS,CARAVAN_PATHS,CARAVAN_BUILDINGS,CARAVAN_GROUPS,CARAVAN_CHESTS} from './chapter-two-data.js';
// Windward Vale: authored land masses, shoreline, loop routes and a gated reservoir.
export const WORLD_VERSION=9;
export const LEVEL={name:'WINDWARD VALE',scale:1,start:{x:-2700,y:1450},
 polygons:[
 [[-3570,2040],[-3500,1040],[-3000,600],[-2470,660],[-2130,950],[-1720,1350],[-1940,2040],[-2530,2450],[-3160,2360]],
 [[-2680,970],[-2200,430],[-1530,200],[-940,320],[-330,510],[160,1010],[-380,1600],[-1180,1900],[-1890,1630]],
 [[-480,840],[-90,350],[660,80],[1310,290],[1600,780],[1280,1290],[620,1510],[30,1330]],
 [[-30,530],[360,-220],[420,-890],[850,-1320],[1510,-1240],[1860,-730],[1800,-130],[1270,430]],
 [[-2040,450],[-2460,-210],[-2170,-950],[-1510,-1490],[-760,-1500],[-290,-1010],[520,-740],[470,-200],[-430,-400],[-820,-920],[-1420,-1010],[-1740,-420],[-1420,180]],
 [[1260,-700],[1780,-1170],[2030,-1660],[2460,-2080],[3000,-2090],[3360,-1560],[3210,-1010],[2680,-660],[2110,-360]],
 [[2220,-1850],[2780,-1850],[2780,-2640],[2220,-2640]],
 [[2210,-2440],[1850,-2880],[1860,-3440],[2320,-3820],[3120,-3730],[3570,-3200],[3380,-2610],[2830,-2430]]
 ],
 rooms:[
 {id:'settlement',name:'Seabell Harbor',x1:-3700,x2:-1900,y1:600,y2:2600},
 {id:'approach',name:'Marigold Downs',x1:-2400,x2:0,y1:150,y2:2000},
 {id:'depot',name:'Apricot Orchards',x1:-100,x2:1700,y1:100,y2:1600},
 {id:'quarry',name:'Blue Cedar Hollow',x1:-2600,x2:0,y1:-1600,y2:200},
 {id:'garrison',name:'Willowbend Mill',x1:200,x2:1870,y1:-1350,y2:250},
 {id:'bridge',name:'The Wind Stairs',x1:1800,x2:3500,y1:-2400,y2:-400},
 {id:'keep',name:'Cloudwater Reservoir',x1:1750,x2:3650,y1:-3900,y2:-2400}
 ],
 paths:[
 [[-2700,1450],[-2420,1170],[-1990,920],[-1470,900],[-850,920],[-100,850],[700,730]],
 [[-1700,600],[-2040,-170],[-1770,-720],[-1200,-1170],[-650,-1100],[-230,-650],[900,-540]],
 [[700,730],[890,180],[1070,-470],[1380,-730],[1950,-940],[2450,-1500],[2500,-2230],[2570,-2900],[2700,-3330]]
 ],
 groups:[],chests:[],obstacles:[],gates:[{id:'bridgeGate',x1:2200,x2:2800,y1:-2330,y2:-2260,boss:'captain'}],fires:[],
 buildings:[
 {x:-3200,y:1430,w:330,d:270,type:'house',color:'#c37558'},
 {x:-2970,y:1970,w:360,d:290,type:'bakery',color:'#d2a35e'},
 {x:-2380,y:1980,w:330,d:280,type:'clinic',color:'#618f96'},
 {x:-3260,y:2020,w:260,d:230,type:'house',color:'#93a072'},
 {x:-2660,y:810,w:320,d:260,type:'house',color:'#ac7867'},
 {x:1480,y:-800,w:340,d:300,type:'mill',color:'#6e8e9c'},
 {x:1070,y:1120,w:270,d:220,type:'barn',color:'#a97659'}
 ]};
const encounters=[['lookouts',-1730,960,5],['yard',-760,1050,7],['depot',650,700,5],['barracks',850,-450,7],['captain',2490,-1630,4],['bridgePatrol',2500,-2130,3],['keepFront',2530,-2730,6],['commander',2730,-3320,7],['woodland',-1950,-280,5],['quarry',-1180,-1240,4]];
for(const [id,x,y,count] of encounters){const boss=id==='captain'||id==='commander';const units=Array.from({length:count},(_,i)=>[boss&&i===0?id:i===count-1?'archer':i===count-2&&count>4?'brute':'raider',(i%3-1)*155,Math.floor(i/3)*145-90]);LEVEL.groups.push({id,x,y,aggro:boss?560:480,units});}
for(const [id,name,x,y,guards,gold,heal,upgrade] of [
 ['yardCache','Meadow courier cache',-940,1470,'yard',80,65,'health'],['depotCache','Orchard armorer chest',1100,900,'depot',120,45,'blade'],['garrisonCache','Toll captain strongbox',3020,-1420,'captain',100,100,'none'],['keepCache','Reservoir pay chest',2930,-3550,'commander',250,200,'none'],['woodCache','Cedar trail cache',-2280,-540,'woodland',110,45,'none'],['quarryCache','Hidden millwright chest',-1450,-1280,'quarry',140,55,'none']])LEVEL.chests.push({id,name,x,y,guards,gold,heal,upgrade});
LEVEL.polygons.push(...CARAVAN_POLYGONS);LEVEL.rooms.push(...CARAVAN_ROOMS);LEVEL.paths.push(...CARAVAN_PATHS);LEVEL.buildings.push(...CARAVAN_BUILDINGS);LEVEL.groups.push(...CARAVAN_GROUPS);LEVEL.chests.push(...CARAVAN_CHESTS);
for(const b of LEVEL.buildings)LEVEL.obstacles.push({x:b.x,y:b.y,r:Math.max(b.w,b.d)*.53,kind:'building'});
for(const [x,y,r,kind] of [[-1350,1400,65,'wagon'],[1180,420,60,'crates'],[-2080,-620,65,'boulder'],[1970,-970,70,'boulder'],[3200,-2860,75,'crates']])LEVEL.obstacles.push({x,y,r,kind});
export function insidePolygon(x,y,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [ax,ay]=poly[i],[bx,by]=poly[j];if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;}return inside;}
LEVEL.polygons.push(...HUNT_POLYGONS);
for(const h of HUNTS){LEVEL.paths.push([[h.entry.x,h.entry.y],...h.stages.map(p=>[p.x,p.y])]);const poly=HUNT_POLYGONS[HUNTS.indexOf(h)];LEVEL.rooms.unshift({id:'hunt-'+h.id,name:h.name,x1:Math.min(...poly.map(p=>p[0])),x2:Math.max(...poly.map(p=>p[0])),y1:Math.min(...poly.map(p=>p[1])),y2:Math.max(...poly.map(p=>p[1]))});}
// Continuous roadbeds replace the door network. Additive geometry preserves saved positions.
// Broad hinterland makes the regions a continent rather than separate floating pads.
LEVEL.polygons.push([[-3650,2050],[-3660,600],[-2880,-520],[-2300,-1520],[-1240,-1790],[380,-1470],[1760,-1770],[1870,-3470],[2330,-3900],[3200,-3800],[3670,-2880],[3830,-1640],[5060,-1380],[6000,-2050],[7260,-2800],[8050,-3700],[9000,-3800],[9700,-3480],[10400,-2700],[10600,-1500],[11300,-100],[11000,1000],[9750,1300],[9200,2900],[8150,3090],[7300,2540],[6600,1600],[5200,1790],[3900,1260],[3180,520],[2020,400],[1460,1540],[290,1720],[-1060,2060],[-2550,2530]]);
export const OVERLAND_ROADS=[
 [[1380,-470],[2000,-300],[2800,-380],[3500,-360],[4030,-220],[4650,700]],
 [[5400,650],[5980,340],[6380,-430],[6650,-1050],[6940,-1510]],
 [[7040,-2100],[7580,-2450],[8140,-2870],[8520,-3000]],
 [[7140,-1400],[7640,-1470],[8100,-1100],[8500,-810]],
 [[8460,-1300],[8890,-2000],[9440,-2520]],
 [[6250,650],[6850,1100],[7150,1340]]
];
for(const road of OVERLAND_ROADS){
 LEVEL.paths.push(road);
 for(let i=1;i<road.length;i++){
  const a=road[i-1],b=road[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/d*290,ny=(b[0]-a[0])/d*290;
  LEVEL.polygons.push([[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]]);
 }
 for(const [x,y] of road)LEVEL.polygons.push(Array.from({length:12},(_,i)=>[x+Math.cos(i*Math.PI/6)*300,y+Math.sin(i*Math.PI/6)*300]));
}
export function inFloor(x,y,pad=0){const test=(x,y)=>LEVEL.polygons.some(poly=>insidePolygon(x,y,poly));return test(x,y)&&(!pad||[[pad,0],[-pad,0],[0,pad],[0,-pad]].every(([dx,dy])=>test(x+dx,y+dy)));}
export function areaAt(x,y){return wildernessRegion(x,y).name;}
function archivedAreaAt(x,y){return [...LEVEL.rooms].reverse().find(r=>x>=r.x1&&x<=r.x2&&y>=r.y1&&y<=r.y2)?.name||'Windward Vale';}
export function projectToFloor(x,y,pad=18){if(inFloor(x,y,pad))return{x,y};let best={x:LEVEL.start.x,y:LEVEL.start.y,d:Infinity};for(const poly of LEVEL.polygons)for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(len*len)));for(const side of [-1,1]){const px=a[0]+dx*t-dy/len*(pad+2)*side,py=a[1]+dy*t+dx/len*(pad+2)*side,d=(x-px)**2+(y-py)**2;if(d<best.d&&inFloor(px,py,pad))best={x:px,y:py,d};}}return best;}

// Roads and regions are never blocked by story progression.
LEVEL.gates.length=0;
