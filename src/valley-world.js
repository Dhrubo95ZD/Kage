import {buildTerrain} from './terrain-world.js';
import {groundLayer} from './world-visibility.js';
import {buildUnderstory} from './landscape-atmosphere.js';
import {buildCaravanScenery} from './caravan-scenery.js';
import {SurfaceFX} from './surface-fx.js';
import {buildScenery} from './scenery.js';
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {LEVEL,inFloor} from './js/level.js';
const noise=(x,z)=>{const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);};
// Original mottled paint textures: no film frames or downloaded artwork in the game.
function paintTexture(){const size=128,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,n=noise(x,y)*.08+Math.sin(x*.16+Math.sin(y*.09)*3)*.035+Math.sin(y*.11)*.035,value=225+n*130;data[i]=value;data[i+1]=value;data[i+2]=value-5;data[i+3]=255;}const t=new T.DataTexture(data,size,size);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.colorSpace=T.SRGBColorSpace;t.needsUpdate=true;return t;}
export function buildValley(scene){
 const caravanScenery=buildCaravanScenery(scene);const grassPoints=[];const texture=paintTexture(),materials=new Map(),batches=new Map(),temp=new T.Object3D(),wheels=[],canopies=[],boats=[],clouds=[],residents=[];
 const material=(color)=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,map:texture,roughness:1,metalness:0}));return materials.get(color);};
 function bake(geo,c,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){if(geo.index){const a=geo;geo=geo.toNonIndexed();a.dispose();}temp.position.set(x,y,z);temp.scale.set(sx,sy,sz);temp.rotation.set(rx,ry,rz);temp.updateMatrix();geo.applyMatrix4(temp.matrix);if(!batches.has(c))batches.set(c,[]);batches.get(c).push(geo);}
 const box=(c,x,y,z,w,h,d,rx=0,ry=0,rz=0)=>bake(new T.BoxGeometry(w,h,d),c,x,y,z,1,1,1,rx,ry,rz);
 const ball=(c,x,y,z,r,sx=1,sy=1,sz=1)=>bake(new T.IcosahedronGeometry(r,r<.9?0:1),c,x,y,z,sx,sy,sz);
 const cyl=(c,x,y,z,r,h,n=10)=>bake(new T.CylinderGeometry(r*.85,r,h,n),c,x,y,z);
 const wood='#8c6744',dark='#5c5145',cream='#edd9af',rock='#85968b';
 // Sunlit water, painterly foam streaks and shore shelves below the walkable land.
 const water=new T.Mesh(new T.PlaneGeometry(320,220,90,80),new T.MeshStandardMaterial({color:'#244e63',roughness:.38,metalness:.12}));water.rotation.x=-Math.PI/2;water.position.y=-1.35;scene.add(water);
 water.material.onBeforeCompile=shader=>{shader.uniforms.uTime={value:0};water.userData.shader=shader;shader.vertexShader='uniform float uTime;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z += sin(position.x*.6+uTime*.7)*.055 + cos(position.y*.7+uTime*.5)*.04;');};
 for(let i=0;i<160;i++){const x=noise(i,3)*130-55,z=noise(i,7)*100-55;if(!inFloor(x*100,z*100)){box('#b8dfcb',x,-1.23,z,.6+noise(i,1)*1.9,.015,.045,0,noise(i,2)*.3);}}
 buildTerrain(scene);
 // Meandering ribbons rather than room tiles. Roads are intentionally readable in combat.
 const pathSamples=[];for(const [pathIndex,path] of LEVEL.paths.entries()){const curve=new T.CatmullRomCurve3(path.map(([x,z])=>new T.Vector3(x*.01,.016,z*.01))),points=curve.getPoints(180),verts=[],uv=[];for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),w=.95+Math.sin(i*.11)*.15,nx=-dz/len*w,nz=dx/len*w;pathSamples.push(a);for(const p of [[a.x+nx,a.z+nz],[a.x-nx,a.z-nz],[b.x+nx,b.z+nz],[a.x-nx,a.z-nz],[b.x-nx,b.z-nz],[b.x+nx,b.z+nz]]){verts.push(p[0],.012,p[1]);uv.push(p[0]*.4,p[1]*.4);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();const roadColors=[];for(let i=0;i<verts.length;i+=3){const c=new T.Color(verts[i]>76&&verts[i+2]<-19?'#c6d4da':verts[i]>77?'#7c6c5a':'#b5a17a');roadColors.push(c.r,c.g,c.b);}g.setAttribute('color',new T.Float32BufferAttribute(roadColors,3));const road=new T.Mesh(g,new T.MeshStandardMaterial({color:'#ffffff',map:texture,vertexColors:true,roughness:1}));groundLayer(road.material,pathIndex,'road');road.renderOrder=40+pathIndex;road.material.side=T.DoubleSide;road.receiveShadow=true;scene.add(road);}
 const closeRoad=(x,z)=>pathSamples.some(p=>(p.x-x)**2+(p.z-z)**2<2.3**2);
 // Dense interactive blades replace baked grass cones. Flowers sit outside swing-height grass.
 for(let x=-35;x<113;x+=.44)for(let z=-38;z<30;z+=.44){const f=noise(x,z);if((x>76||z<-24)||f<.30||!inFloor(x*100,z*100,75)||closeRoad(x,z)||LEVEL.obstacles.some(o=>Math.hypot(x*100-o.x,z*100-o.y)<o.r+50))continue;grassPoints.push({x:x+f*.18,z:z+noise(z,x)*.18,seed:f});}
 const surface=new SurfaceFX(scene,grassPoints);buildUnderstory(scene,grassPoints);buildScenery(scene);
 // Irregular branching silhouettes and layered needles replace round lollipop crowns.
 function tree(x,z,seed,orchard=false){
  const snow=x>76&&z<-19,cinder=x>77&&!snow;
  if(cinder)return;
  const h=orchard?3.4:4.6+seed*2;
  cyl('#514538',x,h*.42,z,.13,h*.84,7);
  if(snow||x<0&&z<0){
   for(let k=0;k<5;k++){const r=(1-k*.15)*(1+seed*.3),py=1.8+k*.69;bake(new T.ConeGeometry(r,1.9,9),snow?(k%2?'#a4b9ba':'#dce5df'):(k%2?'#2c584b':'#3d6c50'),x,py,z,1,1,1,0,seed+k*.3,0);}
   return;
  }
  for(let k=0;k<7;k++){
   const a=k*2.399+seed,r=.5+(k%3)*.32,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r,py=h-.8+Math.sin(k*1.9)*.55;
   const curve=new T.CatmullRomCurve3([new T.Vector3(x,h*.38,z),new T.Vector3((x+px)/2,h*.7,(z+pz)/2),new T.Vector3(px,py,pz)]);
   bake(new T.TubeGeometry(curve,4,.05,4,false),'#514538',0,0,0);
   const geo=new T.SphereGeometry(1,9,6),p=geo.attributes.position;
   for(let j=0;j<p.count;j++){const n=.78+noise(p.getX(j)*9+k,p.getZ(j)*7)*.38;p.setXYZ(j,p.getX(j)*n,p.getY(j)*n,p.getZ(j)*n);}geo.computeVertexNormals();
   bake(geo,['#315944','#47784d','#739258'][k%3],px,py,pz,1.0+seed*.25,.53,1.05,0,a,0);
   for(let j=0;j<4;j++){const q=a+j*1.7;bake(new T.ConeGeometry(.23,.16,5),'#90a969',px+Math.cos(q)*.8,py+.3,pz+Math.sin(q)*.8,1,1,1,0,q,.3);}
  }
 }
 for(let x=-34;x<104;x+=3.0)for(let z=-37;z<24;z+=3.0){const f=noise(x,z);if([[65.8,-18.2],[64,0],[66,-17]].some(([a,b])=>Math.hypot(x-a,z-b)<3)||f<.35||!inFloor(x*100,z*100,140)||closeRoad(x,z)||LEVEL.obstacles.some(o=>Math.hypot(x*100-o.x,z*100-o.y)<o.r+150)||LEVEL.groups.some(g=>Math.hypot(x*100-g.x,z*100-g.y)<330)||Math.hypot(x+27,z-14)<6)continue;tree(x,z,f,x>0&&z>3);}
 // Buildings have tiled pitched roofs, deep eaves, dormers, porches and planted windows.
 for(const b of LEVEL.buildings){const x=b.x*.01,z=b.y*.01,w=b.w*.01,d=b.d*.01;
  box('#a9a68b',x,.13,z,w+.22,.26,d+.22);box(cream,x,1.16,z,w,2.05,d);box('#d2ba8c',x,.42,z,w+.08,.35,d+.08);
  for(const side of [-1,1]){bake(new T.BoxGeometry(w*.57,.15,d+.6),b.color,x+side*w*.24,2.65,z,1,1,1,0,0,-side*.42);for(let row=0;row<5;row++)for(let col=0;col<7;col++){const xx=x+side*(.08+row*w*.11);box(row%2?b.color:'#b98262',xx,2.99-row*.14,z-d*.52+col*d*.17,w*.13,.07,d*.15,0,0,-side*.42);}}
  box(wood,x,2.16,z,w+.09,.12,d+.08);for(const side of [-1,1])for(const end of [-1,1])box(wood,x+side*w*.47,1.12,z+end*d*.47,.105,2,.105);
  const front=z+d*.5+.045;box('#546c66',x,.8,front,.65,1.45,.10);box('#d4b46f',x+.22,.86,front+.065,.045,.045,.055);
  for(const side of [-1,1]){box('#667d7a',x+side*w*.31,1.37,front,.62,.7,.08);box('#c3dbbe',x+side*w*.31,1.37,front+.045,.48,.55,.02);box(wood,x+side*w*.31,1.37,front+.06,.045,.60,.03);box(wood,x+side*w*.31,1.37,front+.06,.52,.045,.03);box(wood,x+side*w*.31,1.0,front+.15,.74,.13,.25);for(let k=0;k<5;k++)ball(k%2?'#deb0a8':'#90aa6a',x+side*w*.31-.27+k*.13,1.15,front+.15,.12);}
  box('#b2a085',x,.08,front+.45,1.1,.16,.8);box(wood,x,2.0,front+.47,1.2,.12,1.05,-.12);for(const side of [-1,1])box(wood,x+side*.5,1,front+.85,.06,1.95,.06);
  box('#bfa98a',x+w*.27,2.9,z-.5,.35,1.15,.39);box('#8f8d81',x+w*.27,3.51,z-.5,.46,.10,.49);
  if(b.type==='mill'){const wheel=new T.Group();wheel.position.set(x+w*.5+.24,1.35,z);scene.add(wheel);const ring=new T.Mesh(new T.TorusGeometry(1.3,.10,6,24),material(wood));ring.rotation.y=Math.PI/2;wheel.add(ring);for(let i=0;i<12;i++){const a=i*Math.PI/6,blade=new T.Mesh(new T.BoxGeometry(.8,.14,.5),material('#8f6d4b'));blade.position.set(0,Math.sin(a)*1.25,Math.cos(a)*1.25);blade.rotation.x=-a;wheel.add(blade);const spoke=new T.Mesh(new T.BoxGeometry(.09,.1,2.5),material(wood));spoke.rotation.x=a;wheel.add(spoke);}wheels.push(wheel);}
 }
 // Harbor docks with moored sailboats and rope bollards.
 for(let i=0;i<23;i++)box('#ac895e',-33,.04,21+i*.14,2.8,.12,.115);for(const x of [-34.2,-31.8])for(const z of [21,22.7,24]){cyl(wood,x,-.4,z,.10,1.4);cyl('#d4c598',x,.30,z,.15,.08);}
 for(const [x,z] of [[-35,24],[-31,25]]){const boat=new T.Group();boat.position.set(x,-.85,z);scene.add(boat);const hull=new T.Mesh(new T.SphereGeometry(.9,14,8),material('#b48051'));hull.scale.set(.7,.36,1.6);boat.add(hull);const mast=new T.Mesh(new T.CylinderGeometry(.035,.05,2.6,6),material(wood));mast.position.y=1.25;boat.add(mast);const sail=new T.Mesh(new T.PlaneGeometry(.9,1.5),new T.MeshStandardMaterial({color:'#f1e6c8',side:T.DoubleSide,roughness:1}));sail.position.set(.45,1.7,0);boat.add(sail);boats.push(boat);}
 // Harbor market, kitchen gardens, pergola and shade cloth.
 for(const [x,z,c] of [[-28,16,'#8baeb0'],[-25.1,16.8,'#dbab69'],[-30.5,10.8,'#bb8b87']]){box(wood,x,.72,z,1.6,.16,.8);for(const a of [-.72,.72])for(const b of [-.36,.36])box(wood,x+a,1,z+b,.055,2,.055);for(let i=0;i<6;i++)box(i%2?c:'#f4e6c8',x-.85+i*.34,2.05,z,.34,.065,1.15,0,0,Math.sin(i*.7)*.04);for(let i=0;i<12;i++)ball(i%3?'#deac60':'#a96755',x-.6+(i%4)*.37,.94,z-.22+Math.floor(i/4)*.22,.105);}
 for(const [x,z] of [[-24,22],[-32,11]]){box('#aa9270',x,.11,z,2.5,.22,1.5);for(let i=0;i<5;i++)for(let j=0;j<3;j++)ball('#779a62',x-1+i*.5,.35,z-.5+j*.5,.2,1,.65,1);}
 for(const [x,z] of [[-28,20],[-25,11],[-12,16],[11,13]]){box(wood,x,.35,z,1.2,.12,.4);for(const a of [-.45,.45])box(wood,x+a,.15,z,.1,.30,.35);box(wood,x,.7,z-.18,1.2,.18,.08);}
 for(let i=0;i<10;i++){const x=-22+i*.48;box('#c8b88d',x,.3,6.1,.10,.6,.1);box('#c8b88d',x,.35,6.1,.5,.065,.06);}
 // Terraced crop beds: straw, green shoots and retaining stone. Separate from fighting lanes.
 for(const [x,z] of [[-13,16],[-17,13],[-7,5]])for(let row=0;row<4;row++){box('#baa77c',x,.09,z+row*.42,2.6,.18,.3);for(let col=0;col<12;col++)bake(new T.ConeGeometry(.045,.40,3),'#d0c37b',x-1.2+col*.21,.30,z+row*.42);}
 // Elevated-looking bridge and reservoir masonry; physical floor matches the deck.
 for(let z=-24.8;z<-20.0;z+=.22)box('#c4ad7e',25,.028,z,5.4,.13,.20);for(const x of [22.4,27.6]){for(let z=-24.8;z<-20;z+=.7)box(wood,x,.55,z,.13,1.1,.13);box(wood,x,1,-22.4,.11,.11,4.8);}
 for(let x=20.1;x<34;x+=.85){box('#bac0aa',x,.5,-36.8,.82,1,1);box('#d7d2b6',x,1.05,-36.8,.86,.13,1.04);}
 const falls=new T.Group();scene.add(falls);for(let i=0;i<18;i++){const sheet=new T.Mesh(new T.PlaneGeometry(.12+noise(i,7)*.14,2.3),new T.MeshBasicMaterial({color:i%3?'#d2ece0':'#81cbd0',transparent:true,opacity:.7,depthWrite:false,side:T.DoubleSide}));sheet.position.set(26+i*.12,-.9,-37.6+Math.sin(i)*.08);falls.add(sheet);}
 const orchardWater=new T.Group();scene.add(orchardWater);for(let i=0;i<12;i++){const channel=new T.Mesh(new T.BoxGeometry(.16,.025,.75),new T.MeshStandardMaterial({color:'#75b9b5',roughness:.4}));channel.position.set(9.5+Math.sin(i*.45)*.4,.045,7.2+i*.7);orchardWater.add(channel);}
 // Distinct large windmill landmark on the meadow ridge.
 cyl('#e3cf9f',-14,1.8,5.2,.95,3.6,12);bake(new T.ConeGeometry(1.25,1.0,12),'#a4715b',-14,4,5.2);const windmill=new T.Group();windmill.position.set(-14,3.25,6.25);scene.add(windmill);for(let i=0;i<4;i++){const arm=new T.Group();arm.rotation.z=i*Math.PI/2;const spar=new T.Mesh(new T.BoxGeometry(.10,2.0,.1),material(wood));spar.position.y=1;arm.add(spar);const sail=new T.Mesh(new T.PlaneGeometry(.48,1.35),new T.MeshStandardMaterial({color:'#ece1bb',side:T.DoubleSide}));sail.position.set(.20,1.2,.04);arm.add(sail);windmill.add(arm);}
 // Backdrop ridges are built outside the full playable footprint in landscape-atmosphere.js.
 // All baked details collapse to one draw call per paint color.
 for(const [c,parts] of batches){const geometry=mergeGeometries(parts);parts.forEach(g=>g.dispose());const m=new T.Mesh(geometry,material(c));m.castShadow=true;m.receiveShadow=true;scene.add(m);}
 for(let i=0;i<7;i++){const root=new T.Group(),cloth=material(['#759b9a','#c4a26f','#a18179'][i%3]);const body=new T.Mesh(new T.CylinderGeometry(.18,.28,1.05,7),cloth);body.position.y=.7;root.add(body);const head=new T.Mesh(new T.SphereGeometry(.17,8,6),material('#b7a080'));head.position.y=1.4;root.add(head);const cap=new T.Mesh(new T.ConeGeometry(.23,.22,8),cloth);cap.position.y=1.51;root.add(cap);root.userData={x:-29+i*.75,z:17+(i%2)*2};scene.add(root);residents.push(root);}
 return {water,wheels,surface,update(time,profile){caravanScenery.update(time);if(water.userData.shader)water.userData.shader.uniforms.uTime.value=time;const restored=(profile?.story?.stage||0)>=8;falls.visible=restored;orchardWater.visible=restored||profile?.story?.choice==='orchard'&&profile.story.stage>=4;falls.children.forEach((m,i)=>{m.scale.y=.94+Math.sin(time*7+i)*.06;});for(const w of wheels)w.rotation.x=time*((profile?.story?.stage||0)>=6?.75:.07);windmill.rotation.z=-time*.18;boats.forEach((b,i)=>{b.rotation.z=Math.sin(time*.8+i)*.055;b.position.y=-.85+Math.sin(time+i)*.06;});clouds.forEach((c,i)=>c.position.x+=Math.sin(i)*.0008);residents.forEach((r,i)=>{r.position.set(r.userData.x+Math.sin(time*.25+i)*.8,0,r.userData.z+Math.cos(time*.25+i)*.4);r.rotation.y=time*.25+i;});}};
}
