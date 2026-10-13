import {biomeWeights} from './js/wilderness-data.js';
import * as T from 'three';
import {inFloor} from './js/level.js';
import {GROUND,floorDistance,seaness} from './world-relief.js';
const wave=(x,z)=>Math.sin(x*.31+Math.sin(z*.22)*2)*.5+Math.cos(z*.43-x*.13)*.3+Math.sin(x*.91+z*.66)*.2;
const SAND=new T.Color('#d6c393');
export function biomeColor(x,z){
 const weights=biomeWeights(x*100,z*100),c=new T.Color(0,0,0);
 GROUND.forEach((b,i)=>{c.r+=b.r*weights[i];c.g+=b.g*weights[i];c.b+=b.b*weights[i];});
 c.multiplyScalar(1.02+wave(x,z)*.09);
 // Beaches line the sea; floor beside rising ground is shaded as if the slope casts onto it.
 const d=floorDistance(x,z),sea=seaness(x,z),beach=(1-Math.min(1,Math.max(0,(-d-.2)/1.6)))*Math.min(1,Math.max(0,(sea-.4)/.35));
 if(beach>0)c.lerp(SAND,beach*.85);
 return c.multiplyScalar(1-(1-Math.min(1,-d/2.5))*(1-sea)*.16);
}
// Single union surface: no stacked polygon floors, exposed polygon edges or depth fighting.
export function buildTerrain(scene){
 const positions=[],colors=[],uv=[],coast=[],step=.8,NI=193,NJ=90;
 // Grid corners are shared by six triangles: test and colour each once.
 const corners=[];for(let i=0;i<=NI;i++)for(let j=0;j<=NJ;j++){const x=-40+i*step,z=-40+j*step;corners.push({0:x,1:z,inside:inFloor(x*100,z*100)});}
 const inside=p=>p.inside??(p.inside=inFloor(p[0]*100,p[1]*100)),tint=p=>p.color??(p.color=biomeColor(p[0],p[1]));
 function edge(a,b){let lo=a,hi=b;for(let i=0;i<7;i++){const mid=[(lo[0]+hi[0])*.5,(lo[1]+hi[1])*.5];if(inFloor(mid[0]*100,mid[1]*100)===inside(a))lo=mid;else hi=mid;}return [(lo[0]+hi[0])*.5,(lo[1]+hi[1])*.5];}
 function triangle(tri){const out=[],crossings=[];for(let i=0;i<3;i++){const a=tri[i],b=tri[(i+1)%3],ia=inside(a),ib=inside(b);if(ia)out.push(a);if(ia!==ib){const p=edge(a,b);out.push(p);crossings.push(p);}}if(crossings.length===2){const [a,b]=crossings;for(const p of [[a[0],-.045,a[1]],[b[0],-.95,b[1]],[b[0],-.045,b[1]],[a[0],-.045,a[1]],[a[0],-.95,a[1]],[b[0],-.95,b[1]]])coast.push(...p);}for(let i=1;i<out.length-1;i++)for(const p of [out[0],out[i],out[i+1]]){positions.push(p[0],-.045,p[1]);const c=tint(p);colors.push(c.r,c.g,c.b);uv.push(p[0]*.25,p[1]*.25);}}
 for(let i=0;i<NI;i++)for(let j=0;j<NJ;j++){const a=corners[i*(NJ+1)+j],b=corners[i*(NJ+1)+j+1],c=corners[(i+1)*(NJ+1)+j],d=corners[(i+1)*(NJ+1)+j+1];if(!a.inside&&!b.inside&&!c.inside&&!d.inside)continue;triangle([a,b,c]);triangle([b,d,c]);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();
 const m=new T.MeshStandardMaterial({vertexColors:true,roughness:1});
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 terrainPosition;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nterrainPosition=position;');s.fragmentShader='varying vec3 terrainPosition;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float grain=sin(terrainPosition.x*21.+sin(terrainPosition.z*14.))*sin(terrainPosition.z*27.);
 float strata=sin(terrainPosition.x*1.7+sin(terrainPosition.z*2.3))*sin(terrainPosition.z*3.1);
 float tuft=fract(sin(dot(floor(terrainPosition.xz*2.5),vec2(12.9898,78.233)))*43758.5453);
 diffuseColor.rgb*=.97+grain*.035+strata*.05+(tuft-.5)*.06;`);};
 const terrain=new T.Mesh(g,m);terrain.name='continuous-biome-terrain';terrain.receiveShadow=true;scene.add(terrain);
 const shore=new T.BufferGeometry();shore.setAttribute('position',new T.Float32BufferAttribute(coast,3));shore.computeVertexNormals();const cliff=new T.Mesh(shore,new T.MeshStandardMaterial({color:'#7d735c',roughness:1,side:T.DoubleSide}));cliff.name='weathered-coastline';cliff.receiveShadow=true;scene.add(cliff);
 return terrain;
}
