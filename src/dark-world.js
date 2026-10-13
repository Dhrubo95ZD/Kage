import * as T from 'three';
import {LEVEL,inFloor} from './js/level.js';
import {biomeWeights,LORE} from './js/wilderness-data.js';
import {LANDMARKS} from './js/landmark-data.js';
import {buildTerrain} from './terrain-world.js';
import {SurfaceFX} from './surface-fx.js';
import {buildRelief,floorDistance,reliefHeight,seaness,GROUND,WATER_LEVEL} from './world-relief.js';
import {Batch,sceneryKit,paint,rand,glowMaterial} from './scenery-kit.js';
import {buildLandmarks} from './landmarks.js';
// Region order follows WILDERNESS: coast, forest, lowlands, reservoir, saffron, ravine, snow, cinder, fortress.
const FLOOR_PROPS=[
 {density:.42,items:[['pine',.5,1.2,1.9],['leafy',.15,1,1.4],['bush',.2,.8,1.3],['rock',.15,.4,1]]},
 {density:.56,items:[['pineDeep',.52,1.25,1.95],['pine',.14,1.1,1.6],['birch',.08,1,1.3],['mushroom',.14,.9,1.5],['bush',.06,.8,1.2],['rock',.06,.4,.9]]},
 {density:.4,items:[['orchard',.48,1,1.4],['leafy',.18,1.1,1.5],['bush',.16,.8,1.2],['haystack',.1,.9,1.2],['rock',.08,.4,.8]]},
 {density:.5,items:[['willow',.32,1,1.4],['pine',.28,1.2,1.8],['birch',.15,1,1.3],['reeds',.15,.9,1.3],['rockSlate',.1,.4,1]]},
 {density:.24,items:[['acacia',.45,1,1.5],['rockSand',.3,.5,1.2],['bushDry',.25,.8,1.3]]},
 {density:.45,items:[['crystal',.3,.6,1],['pineTeal',.35,1.2,1.8],['rockSlate',.2,.4,1],['birch',.15,1,1.3]]},
 {density:.45,items:[['pineSnow',.7,1.2,2],['rockSnow',.2,.4,1],['ice',.1,.6,1]]},
 {density:.36,items:[['dead',.55,1,1.6],['obsidian',.25,.7,1.2],['rockBasalt',.2,.5,1.1]]},
 {density:.22,items:[['pillar',.35,.8,1.2],['rockBrass',.35,.5,1.1],['deadPale',.3,.9,1.3]]},
];
const SLOPE_PROPS=[
 {density:.5,line:9,items:[['pine',.8,1.4,2.2],['rock',.2,.6,1.4]]},
 {density:.88,line:14,items:[['pineDeep',.9,1.5,2.5],['rock',.1,.6,1.2]]},
 {density:.5,line:8,items:[['leafy',.5,1.3,1.8],['orchard',.3,1.2,1.6],['rock',.2,.6,1.2]]},
 {density:.55,line:10,items:[['pine',.65,1.4,2.2],['willow',.15,1.2,1.6],['rockSlate',.2,.6,1.4]]},
 {density:.18,line:7,items:[['rockSand',.6,1,2.4],['acacia',.4,1.1,1.5]]},
 {density:.42,line:9,items:[['crystal',.35,1.3,2.4],['pineTeal',.45,1.4,2],['rockSlate',.2,.7,1.5]]},
 {density:.5,line:7,items:[['pineSnow',.75,1.4,2.2],['rockSnow',.25,.7,1.6]]},
 {density:.26,line:99,items:[['dead',.45,1.2,1.8],['obsidian',.35,1,1.8],['rockBasalt',.2,.8,1.6]]},
 {density:.2,line:7,items:[['rockBrass',.6,.8,1.8],['deadPale',.4,1,1.4]]},
];
const GLOWING=new Set(['crystal']);
const GRASS=['#9fae6a','#5f7d3f','#b8bc60','#82a061','#d2b25d','#82a898',null,null,'#aa9c6a'].map(c=>c&&new T.Color(c));
function pick(list,seed){let t=seed*list.reduce((a,b)=>a+b[1],0);for(const item of list){t-=item[1];if(t<=0)return item;}return list[list.length-1];}
function chooseBiome(w,seed){let t=seed;for(let i=0;i<9;i++){t-=w[i];if(t<=0)return i;}return 8;}
export function buildDarkWorld(scene){
 buildTerrain(scene);const relief=buildRelief(scene),water=relief.water,kit=sceneryKit(),batch=new Batch(),glow=new Batch();
 // Road samples live in a coarse hash so clearance checks stay cheap across the whole continent.
 const roadPoints=[],roadCells=new Map();for(const path of LEVEL.paths)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=0;t<=len;t+=55){const p={x:(a[0]+(b[0]-a[0])*t/len)*.01,z:(a[1]+(b[1]-a[1])*t/len)*.01},k=Math.floor(p.x/4)+','+Math.floor(p.z/4);roadPoints.push(p);if(!roadCells.has(k))roadCells.set(k,[]);roadCells.get(k).push(p);}}
 const nearRoad=(x,z,r=2)=>{for(let i=Math.floor((x-r)/4);i<=Math.floor((x+r)/4);i++)for(let j=Math.floor((z-r)/4);j<=Math.floor((z+r)/4);j++)for(const p of roadCells.get(i+','+j)||[])if((x-p.x)**2+(z-p.z)**2<r*r)return true;return false;};
 const clear=(x,z,pad=160)=>inFloor(x*100,z*100,pad)&&!nearRoad(x,z,2.6)&&!LEVEL.obstacles.some(p=>Math.hypot(x*100-p.x,z*100-p.y)<p.r+180)&&!LEVEL.groups.some(p=>Math.hypot(x*100-p.x,z*100-p.y)<340)&&!LORE.some(p=>Math.hypot(x*100-p.x,z*100-p.y)<250);
 buildRoads(scene,roadPoints);
 const grass=[];
 for(let i=0;i<206;i++)for(let j=0;j<95;j++){const x=-36+i*.72,z=-38+j*.72,seed=rand(x,z);if(seed<.64||!inFloor(x*100,z*100,65)||nearRoad(x,z,1.5)||LEVEL.obstacles.some(p=>Math.hypot(x*100-p.x,z*100-p.y)<p.r+50))continue;
  const w=biomeWeights(x*100,z*100),tone=GRASS[chooseBiome(w,rand(z,x))];if(!tone||floorDistance(x,z)>-1.2&&seaness(x,z)>.5)continue;grass.push({x,z,seed,color:tone.clone().offsetHSL(0,0,(seed-.8)*.3)});}
 // Wheat plots ring each windmill; they are grass the blade can harvest.
 for(const l of LANDMARKS.filter(l=>l.kind==='windmill'))for(let a=0;a<110;a++)for(let b=0;b<14;b++){const ang=a/110*Math.PI*2,r=1.6+b*.3,x=l.x*.01+Math.cos(ang)*r,z=l.y*.01+Math.sin(ang)*r*.8;if(rand(a,b)<.45||!inFloor(x*100,z*100,60)||nearRoad(x,z,1.4)||LEVEL.groups.some(p=>Math.hypot(x*100-p.x,z*100-p.y)<300))continue;grass.push({x,z,seed:rand(b,a),tall:1.75,color:new T.Color('#d8b24c').offsetHSL(0,0,(rand(a*3,b)-.5)*.12)});}
 const surface=new SurfaceFX(scene,grass);
 const add=(name,x,y,z,s,seed)=>{const list=kit[name];(GLOWING.has(name)?glow:batch).add(list[Math.floor(seed*997)%list.length],x,y,z,s,seed*6.283,s*(.9+rand(seed,x)*.25));};
 for(let i=0;i<53;i++)for(let j=0;j<24;j++){const x=-35+i*2.75+(rand(i,j)-.5)*1.6,z=-37+j*2.75+(rand(j,i)-.5)*1.6,seed=rand(x,z);const w=biomeWeights(x*100,z*100),table=FLOOR_PROPS[chooseBiome(w,rand(z*1.3,x))];
  if(seed>table.density||!clear(x,z))continue;if(floorDistance(x,z)>-1.6&&seaness(x,z)>.5)continue;const [name,,s0,s1]=pick(table.items,rand(seed,i));add(name,x,0,z,s0+(s1-s0)*rand(i,seed),seed);}
 // Forests climb the hills beyond the floor, thinning at the tree line and on cliffs.
 for(let i=0;i<170;i++)for(let j=0;j<110;j++){const x=-80+i*1.7+(rand(i,j*3)-.5)*1.2,z=-90+j*1.7+(rand(j*3,i)-.5)*1.2,d=floorDistance(x,z);if(d<.9||d>17)continue;
  const seed=rand(x*1.7,z),w=biomeWeights(x*100,z*100),table=SLOPE_PROPS[chooseBiome(w,rand(z,x*1.3))];if(seed>table.density)continue;
  const h=reliefHeight(x,z),slope=Math.hypot(reliefHeight(x+.6,z)-h,reliefHeight(x,z+.6)-h)/.6;if(h<WATER_LEVEL+.35||h>table.line||slope>1.15)continue;
  const [name,,s0,s1]=pick(table.items,rand(seed,j));add(name,x,h-.15,z,s0+(s1-s0)*rand(j,seed),seed);}
 // Painted timber homes: each keeps its authored colour, with a region-appropriate roof.
 for(const b of LEVEL.buildings){const x=b.x*.01,z=b.y*.01,w=b.w*.01,d=b.d*.01,wr=biomeWeights(b.x,b.y),roof=wr[4]>.4?'#a5532f':wr[0]>.4?'#3d5664':'#4b3c34',wall=new T.Color(b.color).lerp(new T.Color('#efe3c8'),.25);
  const box=(c,bx,by,bz,bw,bh,bd,ry=0,rz=0)=>batch.put(paint(new T.BoxGeometry(bw,bh,bd),c,.06),bx,by,bz,1,ry,1,0,rz);
  box('#6b6658',x,.3,z,w+.1,.6,d+.1);box(wall,x,1.3,z,w,1.9,d);
  for(const a of [-1,1])for(const c of [-1,1])box('#4a3a2c',x+a*w*.48,1.35,z+c*d*.48,.16,2.2,.16);
  for(const side of [-1,1]){box(roof,x+side*w*.26,2.62,z,w*.64,.16,d+.6,0,-side*.5);for(let row=0;row<5;row++)box(new T.Color(roof).multiplyScalar(.8),x+side*(.1+row*w*.105),2.92-row*.14,z,.05,.07,d+.55);}
  box('#3a2c22',x,.95,z+d*.505,.72,1.7,.07);box('#f2c76e',x+w*.3,1.35,z+d*.51,.38,.42,.05);box('#f2c76e',x-w*.3,1.35,z+d*.51,.38,.42,.05);
  box('#5b5348',x-w*.28,3.05,z-.3,.38,1.35,.42);}
 // Civil ruins frame high-tier arenas, with gaps and fractured lintels.
 for(const [x,z] of [[95,-27],[101,-22],[89,-8],[69,-21]])for(let i=0;i<6;i++){const h=.7+rand(i,x)*2.3;batch.put(paint(new T.BoxGeometry(.62,h,.65),'#7d7563',.1),x+i*.78,h/2,z+Math.sin(i)*.25,1,rand(i,z)*.2);batch.put(paint(new T.BoxGeometry(.76,.15,.8),'#a39776',.08),x+i*.78,h,z+Math.sin(i)*.25);}
 const landmarks=buildLandmarks(scene,batch,glow);
 batch.build(scene,new T.MeshStandardMaterial({vertexColors:true,roughness:.92}),'scenery-chunk');glow.build(scene,glowMaterial(.55),'glow-chunk');
 return {water,relief,surface,landmarks,update(time){relief.update(time);landmarks.update(time);}};
}
// Continuous worn ribbons with soft shoulders, tinted to each region's soil.
function buildRoads(scene,points){
 const pos=[],col=[],soil=new T.Color(),dirt=new T.Color('#7a6648'),snow=new T.Color('#c5cfd4'),ash=new T.Color('#2f2622');
 for(const path of LEVEL.paths){const pts=[];for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/55));for(let k=i===1?0:1;k<=n;k++)pts.push([(a[0]+(b[0]-a[0])*k/n)*.01,(a[1]+(b[1]-a[1])*k/n)*.01]);}
  const rows=pts.map((p,i)=>{const q=pts[Math.min(pts.length-1,i+1)],r=pts[Math.max(0,i-1)],dx=q[0]-r[0],dz=q[1]-r[1],len=Math.hypot(dx,dz)||1,hw=.62+rand(p[0],p[1])*.22,w=biomeWeights(p[0]*100,p[1]*100);
   soil.setRGB(0,0,0);GROUND.forEach((g,k)=>{soil.r+=g.r*w[k];soil.g+=g.g*w[k];soil.b+=g.b*w[k];});soil.lerp(dirt,.55).lerp(snow,w[6]*.7).lerp(ash,w[7]*.5);const c=[soil.r,soil.g,soil.b];
   return [[p[0]-dz/len*hw*1.5,p[1]+dx/len*hw*1.5,0,c],[p[0]-dz/len*hw*.55,p[1]+dx/len*hw*.55,.7,c],[p[0]+dz/len*hw*.55,p[1]-dx/len*hw*.55,.7,c],[p[0]+dz/len*hw*1.5,p[1]-dx/len*hw*1.5,0,c]];});
  for(let i=0;i<rows.length-1;i++)for(let s=0;s<3;s++){const a=rows[i][s],b=rows[i][s+1],c=rows[i+1][s],d=rows[i+1][s+1];for(const v of [a,c,b,b,c,d]){pos.push(v[0],-.03,v[1]);col.push(...v[3],v[2]);}}}
 const g=new T.BufferGeometry(),up=new Float32Array(pos.length);for(let i=1;i<up.length;i+=3)up[i]=1;g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(up,3));g.setAttribute('color',new T.Float32BufferAttribute(col,4));g.computeBoundingSphere();
 const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,transparent:true,depthWrite:false,roughness:1,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4}));m.name='road-ribbons';m.receiveShadow=true;m.renderOrder=1;scene.add(m);
}
