import * as T from 'three';
import {inFloor} from './js/level.js';
import {biomeWeights} from './js/wilderness-data.js';
// Region moods, in WILDERNESS order. Light, fog, sky and weather blend with the same weights as the ground.
const MOODS=[
 {horizon:'#cfe5ec',zenith:'#4f93c0',ground:'#7d8a70',sun:'#fff1d6',sunI:2.35,fog:'#c2d8dd',near:62,far:175,exposure:1.2,fall:0,rise:0,motes:.35,mote:'#eaf6ff'},
 {horizon:'#c3dccb',zenith:'#3f7f7a',ground:'#4a5c40',sun:'#ffe6bd',sunI:2.05,fog:'#9fbaa6',near:42,far:150,exposure:1.16,fall:0,rise:0,motes:.9,mote:'#d9ff7a'},
 {horizon:'#f0e8c4',zenith:'#5f98bd',ground:'#8a8660',sun:'#ffe1a8',sunI:2.6,fog:'#ddd6ae',near:62,far:180,exposure:1.22,fall:0,rise:0,motes:.55,mote:'#fff6c8'},
 {horizon:'#c8dae5',zenith:'#4e7896',ground:'#64746e',sun:'#e9f1ff',sunI:1.95,fog:'#a9c0cb',near:38,far:140,exposure:1.12,fall:0,rise:0,motes:.45,mote:'#d6efff'},
 {horizon:'#f6dbab',zenith:'#c4844e',ground:'#9a7a4e',sun:'#ffcf8a',sunI:2.7,fog:'#e4c08a',near:52,far:165,exposure:1.2,fall:0,rise:0,motes:.6,mote:'#ffd98a'},
 {horizon:'#c2ebea',zenith:'#2f8796',ground:'#4b6b70',sun:'#d6f6ff',sunI:2.0,fog:'#90c1c4',near:42,far:150,exposure:1.15,fall:0,rise:0,motes:1,mote:'#7ffff0'},
 {horizon:'#eef5fb',zenith:'#86acd0',ground:'#b9c5cc',sun:'#ffffff',sunI:2.2,fog:'#dfe9f1',near:30,far:135,exposure:1.05,fall:1,rise:0,motes:0,mote:'#ffffff',flake:'#ffffff'},
 {horizon:'#e39b72',zenith:'#5c3029',ground:'#4a2e24',sun:'#ff9a5a',sunI:2.3,fog:'#8d5847',near:28,far:125,exposure:1.18,fall:.55,rise:1,motes:0,mote:'#ffb070',flake:'#6f6560'},
 {horizon:'#ead6ad',zenith:'#988566',ground:'#6e604a',sun:'#ffd9a0',sunI:2.3,fog:'#c1ae8a',near:48,far:155,exposure:1.15,fall:.25,rise:.15,motes:.2,mote:'#ffe2a0',flake:'#efe6d6'},
].map(m=>({...m,horizon:new T.Color(m.horizon),zenith:new T.Color(m.zenith),ground:new T.Color(m.ground),sun:new T.Color(m.sun),fog:new T.Color(m.fog),mote:new T.Color(m.mote),flake:new T.Color(m.flake||'#ffffff')}));
export function moodAt(x,y,out){
 const w=biomeWeights(x,y);out??={horizon:new T.Color(),zenith:new T.Color(),ground:new T.Color(),sun:new T.Color(),fog:new T.Color(),mote:new T.Color(),flake:new T.Color()};
 for(const k of ['horizon','zenith','ground','sun','fog'])out[k].setRGB(0,0,0);out.mote.setRGB(0,0,0);out.flake.setRGB(0,0,0);
 let moteSum=0,flakeSum=0;for(const k of ['sunI','near','far','exposure','fall','rise','motes'])out[k]=0;
 MOODS.forEach((m,i)=>{const s=w[i];for(const k of ['horizon','zenith','ground','sun','fog']){out[k].r+=m[k].r*s;out[k].g+=m[k].g*s;out[k].b+=m[k].b*s;}for(const k of ['sunI','near','far','exposure','fall','rise','motes'])out[k]+=m[k]*s;
  const ms=s*m.motes;moteSum+=ms;out.mote.r+=m.mote.r*ms;out.mote.g+=m.mote.g*ms;out.mote.b+=m.mote.b*ms;const fs=s*m.fall;flakeSum+=fs;out.flake.r+=m.flake.r*fs;out.flake.g+=m.flake.g*fs;out.flake.b+=m.flake.b*fs;});
 if(moteSum>0)out.mote.multiplyScalar(1/moteSum);if(flakeSum>0)out.flake.multiplyScalar(1/flakeSum);
 return out;
}
// GPU weather around the focus: particles stay put in the world and wrap inside a moving box.
function weatherLayer(scene,count,mode,size,additive){
 const geo=new T.BufferGeometry(),seed=new Float32Array(count*4);for(let i=0;i<seed.length;i++)seed[i]=Math.random();
 geo.setAttribute('position',new T.BufferAttribute(new Float32Array(count*3),3));geo.setAttribute('seed',new T.BufferAttribute(seed,4));
 const uniforms={uTime:{value:0},uFocus:{value:new T.Vector3()},uColor:{value:new T.Color()},uDensity:{value:0},uSize:{value:size},uMode:{value:mode}};
 const material=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:additive?T.AdditiveBlending:T.NormalBlending,
  vertexShader:`attribute vec4 seed;uniform float uTime,uDensity,uSize,uMode;uniform vec3 uFocus;varying float vAlpha;
 void main(){vec3 box=vec3(40.,13.,34.);vec3 p=seed.xyz*box;float t=uTime*(.55+seed.w*.8);
 if(uMode<.5){p.y-=t*1.7;p.x+=sin(t*.7+seed.w*20.)*1.1+t*.45;p.z+=cos(t*.5+seed.x*10.)*.7;}
 else if(uMode<1.5){p.y+=t*1.5;p.x+=sin(t*1.3+seed.w*30.)*.7;p.z+=cos(t*1.1+seed.y*20.)*.5;}
 else{p.x+=sin(t*.35+seed.w*40.)*2.2;p.y+=sin(t*.55+seed.z*30.)*.8;p.z+=cos(t*.3+seed.y*20.)*2.2;}
 vec3 origin=uFocus-vec3(box.x*.5,uMode>1.5?.2:1.5,box.z*.5),q=mod(p-origin,box),wp=origin+q;
 if(uMode>1.5)wp.y=origin.y+q.y*.28;
 float edge=smoothstep(0.,4.,min(min(q.x,box.x-q.x),min(q.z,box.z-q.z)))*smoothstep(0.,1.5,min(q.y,box.y-q.y));
 float blink=uMode>1.5?.35+.65*pow(max(0.,sin(uTime*(1.2+seed.w*2.)+seed.x*30.)),3.):uMode>.5?.5+.5*sin(uTime*9.+seed.z*40.):1.;
 vAlpha=step(seed.w,uDensity)*edge*blink;vec4 mv=viewMatrix*vec4(wp,1.);gl_Position=projectionMatrix*mv;gl_PointSize=uSize*(300./max(1.,-mv.z))*(.6+seed.y*.8);}`,
  fragmentShader:`uniform vec3 uColor;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.08,d)*vAlpha;if(a<.01)discard;gl_FragColor=vec4(uColor,a);}`});
 const points=new T.Points(geo,material);points.frustumCulled=false;points.renderOrder=5;scene.add(points);return uniforms;
}
export function buildAtmosphere(scene){
 const skyUniforms={horizon:{value:new T.Color('#cfe5ec')},zenith:{value:new T.Color('#4f93c0')}};
 const sky=new T.Mesh(new T.SphereGeometry(230,32,20),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:skyUniforms,
  vertexShader:`varying vec3 ray; void main(){ray=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 ray;uniform vec3 horizon,zenith;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 void main(){vec3 d=normalize(ray);float h=max(d.y,0.);vec3 c=mix(horizon,zenith,pow(h,.55));vec2 p=d.xz/max(d.y+.24,.10)*4.;float n=noise(p)*.6+noise(p*2.1)*.28+noise(p*4.2)*.12;float clouds=smoothstep(.52,.73,n)*smoothstep(.04,.2,d.y);c=mix(c,mix(horizon,vec3(1.),.6),clouds*.85);float sun=pow(max(0.,dot(d,normalize(vec3(-.6,.8,-.5)))),220.);c+=vec3(1.,.8,.4)*sun*.7;gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}));
 sky.frustumCulled=false;sky.renderOrder=-20;sky.userData.noCutaway=true;scene.add(sky);
 // Wildlife silhouettes are subtle and deliberately outside encounters.
 const birdGeo=new T.BufferGeometry();birdGeo.setAttribute('position',new T.Float32BufferAttribute([-.2,0,0,0,.04,.04,.2,0,0,0,.04,.04],3));
 const birds=[];for(let i=0;i<7;i++){const bird=new T.LineSegments(birdGeo,new T.LineBasicMaterial({color:'#476b6d'}));scene.add(bird);birds.push(bird);}
 const fall=weatherLayer(scene,900,0,.34,false),rise=weatherLayer(scene,320,1,.26,true),motes=weatherLayer(scene,260,2,.3,true);
 return {sky:skyUniforms,update(time,focus,mood){
  sky.position.copy(focus);birds.forEach((b,i)=>{const a=time*.035+i*2.4;b.position.set(focus.x+Math.cos(a)*(18+i),8+i*.3,focus.z-14+Math.sin(a)*(10+i));b.rotation.y=-a;b.scale.y=.5+Math.sin(time*2+i)*.5;});
  for(const u of [fall,rise,motes]){u.uTime.value=time;u.uFocus.value.copy(focus);}
  if(mood){skyUniforms.horizon.value.copy(mood.horizon);skyUniforms.zenith.value.copy(mood.zenith);fall.uDensity.value=Math.min(1,mood.fall);fall.uColor.value.copy(mood.flake);rise.uDensity.value=Math.min(1,mood.rise);rise.uColor.value.setRGB(1,.45,.12);motes.uDensity.value=Math.min(1,mood.motes);motes.uColor.value.copy(mood.mote);}
 }};
}
// One instanced draw for petals and one for fern leaves: detail without hundreds of objects.
export function buildUnderstory(scene,points){
 const dummy=new T.Object3D(),petal=new T.SphereGeometry(1,5,3),petals=[],ferns=[];
 for(let i=0;i<points.length;i+=5){const p=points[i];if(p.seed<.64)continue;const x=p.x,z=p.z;if(!inFloor(x*100,z*100,100))continue;for(let k=0;k<5;k++){const a=k*Math.PI*2/5;petals.push({x:x+Math.cos(a)*.065,y:.18+p.seed*.13,z:z+Math.sin(a)*.065,a,seed:p.seed});}if(i%15===0)for(let k=0;k<7;k++){const a=k*2.4;ferns.push({x:x+Math.cos(a)*.16,y:.15,z:z+Math.sin(a)*.16,a,seed:p.seed});}}
 function instances(list,color,flower){const m=new T.InstancedMesh(petal,new T.MeshStandardMaterial({color,roughness:1}),list.length);list.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(flower?0:.4,p.a,flower?.15:.25);dummy.scale.set(flower?.045:.065,flower?.018:.023,flower?.085:.38);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);m.setColorAt(i,new T.Color(flower?(p.seed>.85?'#edc771':'#f6f1d3'):'#3a8851'));});m.receiveShadow=true;scene.add(m);return m;}
 return {flowers:instances(petals,'#ffffff',true),ferns:instances(ferns,'#ffffff',false)};
}
