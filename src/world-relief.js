import * as T from 'three';
import {inFloor} from './js/level.js';
import {biomeWeights} from './js/wilderness-data.js';
// Visual relief around the flat combat floor: coasts fall into an animated sea, interior edges rise into ridges.
// Units are render metres (sim / 100). Gameplay collision is untouched; only scenery reads these heights.
export const WATER_LEVEL=-.42;
const X0=-110,Z0=-125,X1=190,Z1=95,NX=X1-X0+1,NZ=Z1-Z0+1;
// Region order follows WILDERNESS: coast, forest, lowlands, reservoir, saffron, ravine, snow, cinder, fortress.
export const GROUND=['#7d8c58','#3f5c3a','#8c9650','#5a7360','#b39250','#5b7876','#dfe7ea','#4b3e37','#8b7a5c'].map(c=>new T.Color(c));
const ROCK=['#8d8a78','#565d52','#7e7c68','#5c696a','#b0653c','#4d6872','#8e99a2','#2f2925','#7e6b50'].map(c=>new T.Color(c));
const SNOWLINE=[15,16,15,12,99,10,3.2,99,13],TERRACE=[.55,.35,.25,.65,1,.85,.5,.6,.75],SCALE=[.75,.9,.6,1,.85,1.1,1.3,1.1,1];
// Sea and lakes are authored as soft anchors [x,z,radius]; everything else outside the floor is upland.
const WATERS=[[-64,12,32],[-52,42,28],[-22,48,25],[6,43,23],[26,15,11],[30,31,18],[52,37,20],[78,47,23],[101,41,18],[12,-27,10],[43.5,-27,6.5]];
// Rocky islets [x,z,radius,height] give the coast silhouettes and a lighthouse a footing.
export const ISLETS=[[-41,4,2.8,1.5],[-47,21,2.2,1.1],[-44.5,-2,1.7,.9],[20,22.5,2.4,1.3],[60,26,2.6,1.4]];
export const VOLCANO={x:127,z:-7,r:16,h:25};
const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
const hash=(x,z)=>{const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);};
export function noise(x,z){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);return (hash(ix,iz)*(1-u)+hash(ix+1,iz)*u)*(1-v)+(hash(ix,iz+1)*(1-u)+hash(ix+1,iz+1)*u)*v;}
function ridged(x,z){let s=0,a=.55,f=1;for(let i=0;i<4;i++){s+=a*(1-Math.abs(noise(x*f+i*7.3,z*f+i*3.1)*2-1))**2;f*=2.07;a*=.5;}return s/1.03;}
// Felzenszwalb squared distance transform, one line at a time.
function edt1(f,n,d,v,z){let k=0;v[0]=0;z[0]=-Infinity;z[1]=Infinity;
 for(let q=1;q<n;q++){let s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]);while(s<=z[k]){k--;s=((f[q]+q*q)-(f[v[k]]+v[k]*v[k]))/(2*q-2*v[k]);}k++;v[k]=q;z[k]=s;z[k+1]=Infinity;}
 k=0;for(let q=0;q<n;q++){while(z[k+1]<q)k++;d[q]=(q-v[k])**2+f[v[k]];}}
function distanceTo(grid,target){const n=Math.max(NX,NZ),f=new Float64Array(n),d=new Float64Array(n),v=new Int32Array(n),z=new Float64Array(n+1),out=new Float64Array(NX*NZ);
 for(let k=0;k<out.length;k++)out[k]=grid[k]===target?0:1e10;
 for(let i=0;i<NX;i++){for(let j=0;j<NZ;j++)f[j]=out[j*NX+i];edt1(f,NZ,d,v,z);for(let j=0;j<NZ;j++)out[j*NX+i]=d[j];}
 for(let j=0;j<NZ;j++){for(let i=0;i<NX;i++)f[i]=out[j*NX+i];edt1(f,NX,d,v,z);for(let i=0;i<NX;i++)out[j*NX+i]=Math.sqrt(d[i]);}
 return out;}
let field=null;
function getField(){if(field)return field;const inside=new Uint8Array(NX*NZ);
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++)inside[j*NX+i]=inFloor((X0+i)*100,(Z0+j)*100)?1:0;
 const out=distanceTo(inside,1),into=distanceTo(inside,0),sd=new Float32Array(NX*NZ);
 for(let k=0;k<sd.length;k++)sd[k]=inside[k]?.5-into[k]:out[k]-.5;
 return field={inside,sd};}
// Signed distance to the walkable edge: negative on the floor, positive beyond it.
export function floorDistance(x,z){const {sd}=getField(),gx=Math.max(0,Math.min(NX-1.0001,x-X0)),gz=Math.max(0,Math.min(NZ-1.0001,z-Z0)),i=Math.floor(gx),j=Math.floor(gz),u=gx-i,v=gz-j,k=j*NX+i;
 return (sd[k]*(1-u)+sd[k+1]*u)*(1-v)+(sd[k+NX]*(1-u)+sd[k+NX+1]*u)*v;}
export function seaness(x,z){let s=0;for(const [ax,az,r] of WATERS)s=Math.max(s,1-smooth(.55,1,Math.hypot(x-ax,z-az)/r));return s;}
// Ridges climb gently off the floor edge, then steepen into peaks; the camera rig lifts itself clear of them.
const rise=e=>Math.min(44,e<2.5?.55*e:1.4+(e-2.5)*1.02);
function sample(x,z){
 const d=floorDistance(x,z),w=biomeWeights(x*100,z*100);
 if(d<=0)return {h:-.25,d,w,sea:0,glow:0};
 const sea=seaness(x,z),e=Math.max(0,d-.45);let terrace=0,scale=0;for(let i=0;i<9;i++){terrace+=w[i]*TERRACE[i];scale+=w[i]*SCALE[i];}
 const n=ridged(x*.05,z*.05),hills=.55+noise(x*.018+40,z*.018-7)*.6;
 let hm=rise(e)*(.3+.7*n)*scale*hills;
 const step=1.9,t=hm/step;hm=hm*(1-terrace)+(Math.floor(t)+smooth(.3,.7,t-Math.floor(t)))*step*terrace;
 const lava=w[7]*smooth(.3,.12,n)*smooth(1.2,3,e);hm-=lava*hm*.35;
 const hs=-.05-Math.min(3.2,Math.max(0,d-.2)*1.15);
 let h=hs*sea+(hm-.05)*(1-sea);
 for(const [ix,iz,r,ih] of ISLETS){const q=Math.hypot(x-ix,z-iz)/r;if(q<1)h=Math.max(h,WATER_LEVEL-.4+(ih+.4)*(1-q*q)*(.8+noise(x*1.3,z*1.3)*.4));}
 const vq=Math.hypot(x-VOLCANO.x,z-VOLCANO.z)/VOLCANO.r;
 if(vq<1){const rim=VOLCANO.h*.84**1.35,cone=vq<.16?rim-3.2*(1-(vq/.16)**2):VOLCANO.h*(1-vq)**1.35;h=Math.max(h,cone);}
 // Lava runs down the cone in narrow radial streaks from the glowing crater.
 const streak=vq<.9&&vq>.12?smooth(.74,.9,noise(Math.atan2(z-VOLCANO.z,x-VOLCANO.x)*4.5+3,vq*2.2))*Math.min(1,(1-vq)*1.6):0;
 return {h,d,w,sea,glow:Math.max(lava*(1-sea),vq<.13?1:0,streak)};}
export function reliefHeight(x,z){return sample(x,z).h;}
// Prop placement: flat floor reads as zero, the relief beyond it as its own height.
export function groundHeight(x,z){const s=sample(x,z);return s.d<=0?0:Math.max(s.h,0);}
const SAND=new T.Color('#d9c79a'),WET=new T.Color('#9d9476'),SNOW=new T.Color('#f3f7fa'),LAVA=new T.Color('#3a1d14');
function mix(a,b,t,out){return out.copy(a).lerp(b,Math.max(0,Math.min(1,t)));}
function blend(list,w,out){out.setRGB(0,0,0);for(let i=0;i<9;i++){out.r+=list[i].r*w[i];out.g+=list[i].g*w[i];out.b+=list[i].b*w[i];}return out;}
export function buildRelief(scene){
 const heights=new Float32Array(NX*NZ),colors=new Float32Array(NX*NZ*3),glows=new Float32Array(NX*NZ),seas=new Float32Array(NX*NZ),dist=new Float32Array(NX*NZ);
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const k=j*NX+i,s=sample(X0+i,Z0+j);heights[k]=s.h;glows[k]=s.glow;seas[k]=s.sea;dist[k]=s.d;}
 const g=new T.Color(),r=new T.Color(),c=new T.Color();
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const k=j*NX+i,h=heights[k],w=biomeWeights((X0+i)*100,(Z0+j)*100);
  const gx=(heights[Math.min(k+1,j*NX+NX-1)]-heights[Math.max(k-1,j*NX)])/2,gz=(heights[Math.min(k+NX,k%NX+(NZ-1)*NX)]-heights[Math.max(k-NX,k%NX)])/2,slope=Math.hypot(gx,gz);
  blend(GROUND,w,g).multiplyScalar(.82+noise(i*.31,j*.31)*.2);blend(ROCK,w,r);
  let snowline=0;for(let q=0;q<9;q++)snowline+=w[q]*SNOWLINE[q];
  mix(g,r,Math.max(smooth(.45,1,slope),smooth(2.5,9,h)*.75),c);
  if(h>snowline)mix(c,SNOW,smooth(snowline,snowline+1.6,h)*(1-smooth(.7,1.3,slope)*.85),c);
  if(seas[k]>.35&&h<WATER_LEVEL+.45)mix(c,h<WATER_LEVEL?WET:SAND,smooth(.35,.7,seas[k]),c);
  if(glows[k]>0)mix(c,LAVA,glows[k],c);
  colors.set([c.r,c.g,c.b],k*3);}
 // 2 m blocks; far-off ridges use one coarse cell, edges shared with them are interpolated so no cracks appear.
 const BX=Math.floor((NX-1)/2),BZ=Math.floor((NZ-1)/2),mode=new Uint8Array(BX*BZ);
 for(let b=0;b<BZ;b++)for(let a=0;a<BX;a++){let under=true,deep=true,far=true;
  for(let j=0;j<3;j++)for(let i=0;i<3;i++){const k=(b*2+j)*NX+a*2+i;if(dist[k]>-.9)under=false;if(heights[k]>WATER_LEVEL-.9)deep=false;if(dist[k]<20)far=false;}
  mode[b*BX+a]=under||deep?0:far?2:1;}
 const chunks=new Map(),CH=12;
 function vertex(list,i,j,h){const k=j*NX+i;list.p.push(X0+i,h??heights[k],Z0+j);list.c.push(colors[k*3],colors[k*3+1],colors[k*3+2]);list.g.push(glows[k]);}
 function quad(list,v){for(const q of [0,2,1,1,2,3])vertex(list,...v[q]);}
 for(let b=0;b<BZ;b++)for(let a=0;a<BX;a++){const m=mode[b*BX+a];if(!m)continue;const key=Math.floor(a/CH)+','+Math.floor(b/CH);
  if(!chunks.has(key))chunks.set(key,{p:[],c:[],g:[]});const list=chunks.get(key),i0=a*2,j0=b*2;
  if(m===2){quad(list,[[i0,j0],[i0+2,j0],[i0,j0+2],[i0+2,j0+2]]);continue;}
  const coarse=(da,db)=>a+da>=0&&a+da<BX&&b+db>=0&&b+db<BZ&&mode[(b+db)*BX+a+da]===2,edge=(i,j,ai,aj,bi,bj)=>[i,j,(heights[aj*NX+ai]+heights[bj*NX+bi])/2];
  const mid={n:coarse(0,-1)?edge(i0+1,j0,i0,j0,i0+2,j0):[i0+1,j0],s:coarse(0,1)?edge(i0+1,j0+2,i0,j0+2,i0+2,j0+2):[i0+1,j0+2],w:coarse(-1,0)?edge(i0,j0+1,i0,j0,i0,j0+2):[i0,j0+1],e:coarse(1,0)?edge(i0+2,j0+1,i0+2,j0,i0+2,j0+2):[i0+2,j0+1]},o=[i0+1,j0+1];
  quad(list,[[i0,j0],mid.n,mid.w,o]);quad(list,[mid.n,[i0+2,j0],o,mid.e]);quad(list,[mid.w,o,[i0,j0+2],mid.s]);quad(list,[o,mid.e,mid.s,[i0+2,j0+2]]);}
 const time={value:0},material=new T.MeshStandardMaterial({vertexColors:true,roughness:.96});
 material.onBeforeCompile=s=>{s.uniforms.reliefTime=time;
  s.vertexShader='attribute float glow;varying float vGlow;varying vec3 vRelief;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGlow=glow;vRelief=position;');
  s.fragmentShader='uniform float reliefTime;varying float vGlow;varying vec3 vRelief;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 float strata=sin(vRelief.y*5.5+sin(vRelief.x*.6+vRelief.z*.4)*1.8);diffuseColor.rgb*=.93+strata*.05+fract(sin(dot(floor(vRelief.xz*3.),vec2(12.9,78.2)))*437.5)*.04;`).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 float flow=.65+.35*sin(reliefTime*1.7+vRelief.x*1.3+vRelief.z*.9)*sin(reliefTime*.9-vRelief.z*1.1);totalEmissiveRadiance+=vec3(1.,.36,.08)*vGlow*flow*1.6;`);};
 const meshes=[];
 for(const list of chunks.values()){if(!list.p.length)continue;const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(list.p,3));geo.setAttribute('color',new T.Float32BufferAttribute(list.c,3));geo.setAttribute('glow',new T.Float32BufferAttribute(list.g,1));geo.computeVertexNormals();geo.computeBoundingSphere();
  const mesh=new T.Mesh(geo,material);mesh.name='relief-chunk';mesh.receiveShadow=mesh.castShadow=true;scene.add(mesh);meshes.push(mesh);}
 // Water depth below the shared sea level, baked once for shore foam and shallows.
 const DW=NX*2,DH=NZ*2,depth=new Uint8Array(DW*DH*4);
 for(let j=0;j<DH;j++)for(let i=0;i<DW;i++){const gi=Math.min(NX-2,Math.floor(i/2)),gj=Math.min(NZ-2,Math.floor(j/2)),u=i/2-gi,v=j/2-gj,k=gj*NX+gi;
  const h=(heights[k]*(1-u)+heights[k+1]*u)*(1-v)+(heights[k+NX]*(1-u)+heights[k+NX+1]*u)*v,o=(j*DW+i)*4;depth[o]=Math.max(0,Math.min(255,(WATER_LEVEL-h)/4*255));depth[o+3]=255;}
 const depthMap=new T.DataTexture(depth,DW,DH);depthMap.magFilter=depthMap.minFilter=T.LinearFilter;depthMap.needsUpdate=true;
 const water=buildWater(scene,depthMap,time);
 return {meshes,water,update(t){time.value=t;}};
}
function buildWater(scene,depthMap,time){
 const geo=new T.PlaneGeometry(900,700,1,1);geo.rotateX(-Math.PI/2);
 const material=new T.MeshStandardMaterial({color:'#1d5466',roughness:.34,metalness:.15});
 material.onBeforeCompile=s=>{s.uniforms.waterTime=time;s.uniforms.depthMap={value:depthMap};s.uniforms.depthBox={value:new T.Vector4(X0-.25,Z0-.25,NX,NZ)};
  s.vertexShader='varying vec3 vWater;\n'+s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWater=(modelMatrix*vec4(transformed,1.)).xyz;');
  s.fragmentShader='uniform float waterTime;uniform sampler2D depthMap;uniform vec4 depthBox;varying vec3 vWater;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 vec2 duv=(vWater.xz-depthBox.xy)/depthBox.zw;bool inside=all(greaterThan(duv,vec2(0.)))&&all(lessThan(duv,vec2(1.)));
 float depth=inside?texture2D(depthMap,duv).r*4.:4.;
 float ripple=sin(vWater.x*1.7+waterTime*1.3+sin(vWater.z*.9))*sin(vWater.z*1.3-waterTime*1.1);
 vec3 water=mix(vec3(.36,.74,.72),vec3(.07,.25,.36),smoothstep(.0,2.8,depth+ripple*.12));
 float band=smoothstep(.82,1.,sin(depth*15.-waterTime*1.6+ripple*1.5)*.5+.5)*(1.-smoothstep(.04,.42,depth))*(.55+.45*sin(vWater.x*.7+vWater.z*.5+waterTime*.35));
 float foam=clamp(1.-smoothstep(.0,.1+ripple*.04,depth)+band*.55,0.,1.);
 diffuseColor.rgb=mix(water,vec3(.9,.96,.95),foam);`).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 vec2 swell=vec2(sin(vWater.x*.83+vWater.z*.41+waterTime*1.1)+sin(vWater.x*1.97-vWater.z*1.31+waterTime*1.7)*.5,cos(vWater.z*.77-vWater.x*.37+waterTime*.9)+cos(vWater.z*2.13+vWater.x*1.19-waterTime*1.5)*.5);
 normal=normalize(normal+(viewMatrix*vec4(swell.x*.035,0.,swell.y*.035,0.)).xyz);`);};
 const water=new T.Mesh(geo,material);water.name='animated-sea';water.position.set(40,WATER_LEVEL,-15);water.receiveShadow=true;scene.add(water);
 return water;
}
