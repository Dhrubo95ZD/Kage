import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {LEVEL,inFloor} from './js/level.js';
import {biomeWeights,LORE} from './js/wilderness-data.js';
import {buildTerrain} from './terrain-world.js';
import {SurfaceFX} from './surface-fx.js';
const rand=(x,z)=>{const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);};
export function buildDarkWorld(scene){
 buildTerrain(scene);const groups=new Map(),o=new T.Object3D();
 const put=(g,c,x,y,z,sx=1,sy=1,sz=1,ry=0,rz=0)=>{if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(0,ry,rz);o.updateMatrix();g.applyMatrix4(o.matrix);g.computeBoundingBox();const center=g.boundingBox.getCenter(new T.Vector3()),key=c+":"+Math.floor(center.x/12)+":"+Math.floor(center.z/12);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(g);};
 const box=(c,x,y,z,w,h,d,ry=0,rz=0)=>put(new T.BoxGeometry(w,h,d),c,x,y,z,1,1,1,ry,rz);
 const roadPoints=[];for(const path of LEVEL.paths)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=0;t<=len;t+=70)roadPoints.push({x:(a[0]+(b[0]-a[0])*t/len)*.01,z:(a[1]+(b[1]-a[1])*t/len)*.01});}
 const nearRoad=(x,z,r=2)=>roadPoints.some(p=>(x-p.x)**2+(z-p.z)**2<r*r);
 const clear=(x,z)=>inFloor(x*100,z*100,160)&&!nearRoad(x,z,2.6)&&!LEVEL.obstacles.some(p=>Math.hypot(x*100-p.x,z*100-p.y)<p.r+180)&&!LEVEL.groups.some(p=>Math.hypot(x*100-p.x,z*100-p.y)<340)&&!LORE.some(p=>Math.hypot(x*100-p.x,z*100-p.y)<250);
 const water=new T.Mesh(new T.PlaneGeometry(330,240),new T.MeshStandardMaterial({color:'#456b77',roughness:.35,metalness:.3}));water.rotation.x=-Math.PI/2;water.position.y=-1.4;scene.add(water);
 // Weathered tracks are translucent patches, so no biome edge becomes a straight paint cut.
 const pathGeo=new T.CircleGeometry(.85,9);pathGeo.rotateX(-Math.PI/2);
 const patches=new T.InstancedMesh(pathGeo,new T.MeshStandardMaterial({color:'#8b806c',transparent:true,opacity:.25,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-1}),roadPoints.length);
 roadPoints.forEach((p,i)=>{o.position.set(p.x,-.032,p.z);o.rotation.set(0,rand(i,2)*6.28,0);o.scale.set(1.1+rand(i,3),1,1.4);o.updateMatrix();patches.setMatrixAt(i,o.matrix);});scene.add(patches);
 const grass=[];
 for(let x=-36;x<112;x+=.72)for(let z=-38;z<30;z+=.72){const seed=rand(x,z),w=biomeWeights(x*100,z*100);if(seed<.64||w[6]>.42||w[7]>.48||!inFloor(x*100,z*100,65)||nearRoad(x,z,1.5)||LEVEL.obstacles.some(p=>Math.hypot(x*100-p.x,z*100-p.y)<p.r+50))continue;grass.push({x,z,seed});}
 const surface=new SurfaceFX(scene,grass);
 // Lean, broken trunks and irregular evergreen branches; no stacked spheres or toy snow cones.
 for(let x=-35;x<110;x+=2.75)for(let z=-37;z<28;z+=2.75){const seed=rand(x,z);if(seed<.44||!clear(x,z))continue;const w=biomeWeights(x*100,z*100),burnt=w[7]>.38||w[8]>.5,h=3.6+seed*2.7;
  put(new T.CylinderGeometry(.06,.18,h,6),'#39372f',x,h*.5,z,1,1,1,0,.07*(seed-.5));
  for(let k=0;k<9;k++){const a=k*2.4+seed*5,y=1.2+k*h*.072,r=(1-k/12)*.9;
   const curve=new T.CatmullRomCurve3([new T.Vector3(x,y,z),new T.Vector3(x+Math.cos(a)*r*.5,y+.15,z+Math.sin(a)*r*.5),new T.Vector3(x+Math.cos(a)*r,y+.45,z+Math.sin(a)*r)]);
   put(new T.TubeGeometry(curve,3,.035,4,false),'#39372f',0,0,0);
   if(!burnt){const g=new T.ConeGeometry(.7*(1-k/14),.7,7);const pos=g.attributes.position;for(let j=0;j<pos.count;j++)pos.setY(j,pos.getY(j)+(rand(j,k)-.5)*.18);g.computeVertexNormals();put(g,w[6]>.32?(k%3?'#75888a':'#a0aba9'):(k%3?'#263e35':'#435345'),x+Math.cos(a)*r*.65,y+.38,z+Math.sin(a)*r*.65,1,.55,1.5,a,.15);}
  }
 }
 // Natural scree and eroded boulders in loose clusters, never regular rings of crates.
 for(let i=0;i<950;i++){const x=-35+rand(i,11)*147,z=-37+rand(i,12)*65;if(!clear(x,z)||rand(i,17)<.35)continue;const r=.18+rand(i,18)*.72,g=new T.IcosahedronGeometry(r,1),p=g.attributes.position;for(let j=0;j<p.count;j++){const n=.8+rand(j,i)*.3;p.setXYZ(j,p.getX(j)*n,p.getY(j)*n,p.getZ(j)*n);}g.computeVertexNormals();put(g,i%3?'#4b504b':'#66685d',x,r*.18,z,1.5,.65,1,rand(i,13)*6.28);}
 // Timber lodges occupy the same colliders as the old settlement buildings.
 for(const b of LEVEL.buildings){const x=b.x*.01,z=b.y*.01,w=b.w*.01,d=b.d*.01;
  box('#55564d',x,.35,z,w,.7,d);box('#777264',x,1.25,z,w,1.8,d);
  for(const a of [-1,1])for(const c of [-1,1])box('#373a32',x+a*w*.47,1.3,z+c*d*.47,.14,2.1,.14);
  for(const side of [-1,1]){box('#343c3e',x+side*w*.25,2.55,z,w*.62,.15,d+.55,0,-side*.48);for(let row=0;row<5;row++)box('#4a5050',x+side*(.1+row*w*.105),2.85-row*.13,z,.04,.06,d+.5);}
  box('#252c29',x,.9,z+d*.505,.7,1.6,.06);box('#aa8b57',x+w*.3,1.3,z+d*.51,.36,.4,.04);
  box('#393b36',x-w*.28,3,z-.3,.36,1.3,.4);
 }
 // Civil ruins frame high-tier arenas, with gaps and fractured lintels.
 for(const [x,z] of [[95,-27],[101,-22],[89,-8],[69,-21]])for(let i=0;i<6;i++){const h=.7+rand(i,x)*2.3;box('#555b58',x+i*.78,h/2,z+Math.sin(i)*.25,.62,h,.65,rand(i,z)*.2);box('#757b70',x+i*.78,h,z+Math.sin(i)*.25,.76,.15,.8);}
 for(const [key,parts] of groups){const c=key.split(":")[0];const g=mergeGeometries(parts);parts.forEach(p=>p.dispose());const m=new T.Mesh(g,new T.MeshStandardMaterial({color:c,roughness:.95}));m.name="scenery-chunk";m.castShadow=true;m.receiveShadow=true;g.computeBoundingSphere();scene.add(m);}
 return {water,surface,update(){}};
}
