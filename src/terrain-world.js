import {WILDERNESS,biomeWeights} from './js/wilderness-data.js';
import * as T from 'three';
import {inFloor} from './js/level.js';
const wave=(x,z)=>Math.sin(x*.31+Math.sin(z*.22)*2)*.5+Math.cos(z*.43-x*.13)*.3+Math.sin(x*.91+z*.66)*.2;
const palette=WILDERNESS.map(r=>new T.Color(r.color));
export function biomeColor(x,z){
 const weights=biomeWeights(x*100,z*100),c=new T.Color(0,0,0);
 WILDERNESS.forEach((r,i)=>{const b=palette[i];c.r+=b.r*weights[i];c.g+=b.g*weights[i];c.b+=b.b*weights[i];});
 return c.multiplyScalar(1.02+wave(x,z)*.09);
}
// Single union surface: no stacked polygon floors, exposed polygon edges or depth fighting.
export function buildTerrain(scene){
 const positions=[],colors=[],uv=[],coast=[],step=.8;
 const inside=p=>inFloor(p[0]*100,p[1]*100);
 function edge(a,b){let lo=a,hi=b;for(let i=0;i<7;i++){const mid=[(lo[0]+hi[0])*.5,(lo[1]+hi[1])*.5];if(inside(mid)===inside(a))lo=mid;else hi=mid;}return [(lo[0]+hi[0])*.5,(lo[1]+hi[1])*.5];}
 function triangle(tri){const out=[],crossings=[];for(let i=0;i<3;i++){const a=tri[i],b=tri[(i+1)%3],ia=inside(a),ib=inside(b);if(ia)out.push(a);if(ia!==ib){const p=edge(a,b);out.push(p);crossings.push(p);}}if(crossings.length===2){const [a,b]=crossings;for(const p of [[a[0],-.045,a[1]],[b[0],-1.6,b[1]],[b[0],-.045,b[1]],[a[0],-.045,a[1]],[a[0],-1.6,a[1]],[b[0],-1.6,b[1]]])coast.push(...p);}for(let i=1;i<out.length-1;i++)for(const p of [out[0],out[i],out[i+1]]){positions.push(p[0],-.045,p[1]);const c=biomeColor(...p);colors.push(c.r,c.g,c.b);uv.push(p[0]*.25,p[1]*.25);}}
 for(let x=-40;x<114;x+=step)for(let z=-40;z<32;z+=step){const a=[x,z],b=[x,z+step],c=[x+step,z],d=[x+step,z+step];triangle([a,b,c]);triangle([b,d,c]);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();
 const m=new T.MeshStandardMaterial({vertexColors:true,roughness:1});
 m.onBeforeCompile=s=>{s.vertexShader='varying vec3 terrainPosition;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nterrainPosition=position;');s.fragmentShader='varying vec3 terrainPosition;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float grain=sin(terrainPosition.x*21.+sin(terrainPosition.z*14.))*sin(terrainPosition.z*27.);
 float strata=sin(terrainPosition.x*1.7+sin(terrainPosition.z*2.3))*sin(terrainPosition.z*3.1);
 diffuseColor.rgb*=.98+grain*.035+strata*.04;`);};
 const terrain=new T.Mesh(g,m);terrain.name='continuous-biome-terrain';terrain.receiveShadow=true;scene.add(terrain);
 const shore=new T.BufferGeometry();shore.setAttribute('position',new T.Float32BufferAttribute(coast,3));shore.computeVertexNormals();const cliff=new T.Mesh(shore,new T.MeshStandardMaterial({color:'#716e59',roughness:1,side:T.DoubleSide}));cliff.name='weathered-coastline';cliff.receiveShadow=true;scene.add(cliff);
 return terrain;
}
