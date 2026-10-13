import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
// Low-poly, vertex-coloured templates. Each prop is cloned, transformed and merged into 12 m chunks,
// so a whole region draws in a handful of calls and off-screen chunks are frustum culled.
export const rand=(x,z)=>{const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);};
const O=new T.Object3D(),C=new T.Color();
export function paint(geo,color,jitter=0,seed=0){
 const g=geo.index?geo.toNonIndexed():geo;if(g!==geo)geo.dispose();g.deleteAttribute('uv');
 const n=g.attributes.position.count,a=new Float32Array(n*3);C.set(color);
 for(let i=0;i<n;i++){const k=jitter?1+(rand(i*.37+seed,i*.11)-.5)*jitter:1;a[i*3]=C.r*k;a[i*3+1]=C.g*k;a[i*3+2]=C.b*k;}
 g.setAttribute('color',new T.BufferAttribute(a,3));return g;
}
export function place(geo,x=0,y=0,z=0,sx=1,sy=sx,sz=sx,ry=0,rx=0,rz=0){O.position.set(x,y,z);O.scale.set(sx,sy,sz);O.rotation.set(rx,ry,rz);O.updateMatrix();geo.applyMatrix4(O.matrix);return geo;}
// Jitter keyed on position, so faces sharing a corner stay welded after toNonIndexed().
export function wobble(geo,amount,seed=0){const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+(rand(x*13.1+seed,y*7.7+z*3.3)-.5)*amount;p.setXYZ(i,x*k,y*(1+(k-1)*.4),z*k);}return geo;}
export function join(parts){const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());g.computeVertexNormals();return g;}
export class Batch{
 constructor(cell=12){this.cell=cell;this.cells=new Map();this.count=0;}
 add(template,x,y,z,s=1,ry=0,sy=s,rx=0,rz=0){return this.put(template.clone(),x,y,z,s,ry,sy,rx,rz);}
 put(g,x,y,z,s=1,ry=0,sy=s,rx=0,rz=0){place(g,x,y,z,s,sy,s,ry,rx,rz);const key=Math.floor(x/this.cell)+','+Math.floor(z/this.cell);let list=this.cells.get(key);if(!list)this.cells.set(key,list=[]);list.push(g);this.count++;return g;}
 build(scene,material,name){const meshes=[];for(const parts of this.cells.values()){const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());g.computeBoundingSphere();const m=new T.Mesh(g,material);m.name=name;m.castShadow=true;m.receiveShadow=true;scene.add(m);meshes.push(m);}this.cells.clear();return meshes;}
}
// Emissive parts take their glow from the vertex colour.
export function glowMaterial(strength=1.4){const m=new T.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:.1});m.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vColor.rgb*'+strength.toFixed(2)+';');};return m;}
const cyl=(r1,r2,h,seg=6,open=true)=>new T.CylinderGeometry(r1,r2,h,seg,1,open);
function trunk(color,h=1.2,r=.13){return place(paint(cyl(r*.55,r,h,5),color,.15),0,h/2,0);}
function pine(seed,{dark='#22402e',light='#3a5b3d',bark='#4b3a2b',snow=false,tiers=4}={}){
 const parts=[trunk(bark,1.3)];
 for(let k=0;k<tiers;k++){const r=.98-k*.19,h=1.05-k*.1,y=.62+k*.5;
  parts.push(place(paint(wobble(new T.ConeGeometry(r,h,7,1,true),.22,seed*9+k),k%2?light:dark,.18,seed+k),0,y+h/2,0,1,1,1,rand(seed,k)*6.3));
  if(snow)parts.push(place(paint(wobble(new T.ConeGeometry(r*.72,h*.45,7,1,true),.2,seed*5+k),'#eef3f6',.06),0,y+h*.78,0,1,1,1,rand(k,seed)*6.3));}
 return join(parts);
}
function blobTree(seed,colors,bark='#5a4430',{height=1.1,spread=.55,size=.62,count=4,flat=1}={}){
 const parts=[trunk(bark,height+.2,.11)];
 for(let k=0;k<count;k++){const a=k*2.4+seed,r=k?spread:0,s=size*(k?.78:1);parts.push(place(paint(wobble(new T.IcosahedronGeometry(s,0),.25,seed+k),colors[k%colors.length],.16,seed*3+k),Math.cos(a)*r,height+.25+(k?.05:.32),Math.sin(a)*r,1,flat,1,a));}
 return join(parts);
}
function willow(seed){const parts=[trunk('#5d5240',1.5,.15),place(paint(wobble(new T.IcosahedronGeometry(.85,0),.2,seed),'#6f8f52',.12),0,1.9,0,1.15,.7,1.15)];
 for(let k=0;k<9;k++){const a=k*.7+seed;parts.push(place(paint(new T.ConeGeometry(.16,1.3,4,1,true),k%2?'#5f7d45':'#7f9c5c',.1),Math.cos(a)*.78,1.25,Math.sin(a)*.78,1,1,1,a,Math.PI));}
 return join(parts);}
function birch(seed){const parts=[place(paint(cyl(.05,.08,2.2,5),'#e8e4d8',.08),0,1.1,0)];for(let k=0;k<4;k++)parts.push(place(paint(new T.BoxGeometry(.11,.03,.11),'#2a2a2a'),0,.4+k*.42,0,1,1,1,k));
 for(let k=0;k<3;k++){const a=k*2.1+seed;parts.push(place(paint(wobble(new T.IcosahedronGeometry(.42,0),.25,seed+k),k%2?'#c9b54a':'#a8b44c',.15),Math.cos(a)*.25,2+k*.18,Math.sin(a)*.25));}
 return join(parts);}
function acacia(seed){const parts=[place(paint(cyl(.06,.1,1.1,5),'#5e4630',.1),0,.55,0,1,1,1,0,0,.25),place(paint(cyl(.05,.07,.9,5),'#5e4630',.1),.2,1.4,0,1,1,1,0,0,-.35),
 place(paint(wobble(new T.IcosahedronGeometry(.9,1),.18,seed),'#7f8a3c',.18),.3,1.95,0,1.55,.3,1.3),place(paint(wobble(new T.IcosahedronGeometry(.55,0),.2,seed+2),'#949c48',.15),-.35,1.75,.25,1.2,.35,1.1)];
 return join(parts);}
function deadTree(seed,color='#2c2522'){const parts=[place(paint(cyl(.05,.16,3,5),color,.2),0,1.5,0,1,1,1,0,(rand(seed,1)-.5)*.12,(rand(seed,2)-.5)*.12)];
 for(let k=0;k<3;k++){const a=k*2.2+seed,y=1.4+k*.45;parts.push(place(paint(cyl(.02,.05,1,4),color,.2),Math.cos(a)*.3,y+.3,Math.sin(a)*.3,1,1,1,-a,0,.9));}
 return join(parts);}
export function rock(seed,color,detail=1){return join([paint(wobble(new T.IcosahedronGeometry(.6,detail),.42,seed),color,.22,seed)]);}
function bush(seed,color){return join([place(paint(wobble(new T.IcosahedronGeometry(.45,0),.35,seed),color,.2,seed),0,.25,0,1.3,.7,1.1)]);}
function mushroom(seed){const parts=[];for(let k=0;k<3;k++){const a=k*2.1+seed,x=Math.cos(a)*.22*(k?1:0),z=Math.sin(a)*.22*(k?1:0),s=k?.6:1;parts.push(place(paint(cyl(.035,.045,.24,5,false),'#e9e1cc'),x,.12*s,z,s),place(paint(new T.SphereGeometry(.13,7,4,0,Math.PI*2,0,Math.PI/2),k?'#d79a3a':'#b53b30',.1),x,.22*s,z,s,s*.8,s));}
 return join(parts);}
function reeds(seed){const parts=[];for(let k=0;k<7;k++){const a=k*2.4+seed,r=rand(seed,k)*.3;parts.push(place(paint(new T.ConeGeometry(.025,.9+rand(k,seed)*.5,3,1,true),k%3?'#7e8c4a':'#a99a5a'),Math.cos(a)*r,.5,Math.sin(a)*r,1,1,1,0,(rand(k,1)-.5)*.3,(rand(k,2)-.5)*.3));}return join(parts);}
function haystack(){return join([place(paint(wobble(new T.CylinderGeometry(.55,.62,.7,9),.08,3),'#d8b55c',.12),0,.35,0),place(paint(wobble(new T.ConeGeometry(.6,.55,9),.08,4),'#c9a24c',.12),0,.97,0)]);}
function pillar(seed){const h=1+rand(seed,3)*1.6;return join([place(paint(cyl(.32,.36,h,8,false),'#a99877',.12),0,h/2,0),place(paint(new T.BoxGeometry(.9,.18,.9),'#8f7d5c'),0,h+.09,0,1,1,1,seed)]);}
function obsidian(seed){const parts=[];for(let k=0;k<4;k++){const a=k*1.9+seed,h=.7+rand(seed,k)*1.3;parts.push(place(paint(new T.ConeGeometry(.22,h,5),'#1c1720',.3),Math.cos(a)*.25*(k?1:0),h/2,Math.sin(a)*.25*(k?1:0),1,1,1,a,(rand(k,seed)-.5)*.4,(rand(seed,k)-.5)*.4));}return join(parts);}
export function crystal(seed,color='#2fb8b4',size=1){const parts=[];for(let k=0;k<5;k++){const a=k*1.3+seed,h=(.5+rand(seed,k)*1.1)*size,r=(.09+rand(k,seed)*.07)*size,tilt=k?.35+rand(k,3)*.3:0;
 const shard=join([place(paint(cyl(r,r,h,6,false),color,.18),0,h/2,0),place(paint(new T.ConeGeometry(r,r*2.4,6),color,.12),0,h+r*1.2,0)]);place(shard,Math.cos(a)*.18*size*(k?1:0),0,Math.sin(a)*.18*size*(k?1:0),1,1,1,a,Math.sin(a)*tilt,Math.cos(a)*tilt);parts.push(shard);}
 return join(parts);}
function iceShard(seed){return crystal(seed,'#8fc4d6',.8);}
let kit=null;
// Variants per kind give silhouettes variety without unique geometry per prop.
export function sceneryKit(){
 if(kit)return kit;const v=(n,f)=>Array.from({length:n},(_,i)=>f(i*7.3+1));
 return kit={
  pine:v(3,s=>pine(s)),pineDeep:v(3,s=>pine(s,{dark:'#1a3426',light:'#2c4a33',tiers:5})),pineTeal:v(2,s=>pine(s,{dark:'#244a4a',light:'#3a6a62'})),pineSnow:v(3,s=>pine(s,{dark:'#2b4438',light:'#3f5b4b',snow:true})),
  orchard:v(3,s=>blobTree(s,['#d9893a','#e3ad4b','#c56a2f','#89a24a'])),leafy:v(2,s=>blobTree(s,['#5f8a3c','#78a148','#4d7535'])),willow:v(2,s=>willow(s)),birch:v(2,s=>birch(s)),acacia:v(2,s=>acacia(s)),
  dead:v(2,s=>deadTree(s)),deadPale:v(2,s=>deadTree(s,'#8a8478')),bush:v(2,s=>bush(s,'#4f7a3a')),bushDry:v(2,s=>bush(s,'#8f8a4a')),mushroom:v(2,s=>mushroom(s)),reeds:v(2,s=>reeds(s)),haystack:[haystack()],pillar:v(3,s=>pillar(s)),obsidian:v(2,s=>obsidian(s)),ice:v(2,s=>iceShard(s)),
  rock:v(3,s=>rock(s,'#6d6f66')),rockSand:v(2,s=>rock(s,'#b47a4a')),rockBasalt:v(2,s=>rock(s,'#2f2a28')),rockSlate:v(2,s=>rock(s,'#5a6566')),rockSnow:v(2,s=>rock(s,'#9aa4aa')),rockBrass:v(2,s=>rock(s,'#8a7656')),
  crystal:v(3,s=>crystal(s)),
 };
}
