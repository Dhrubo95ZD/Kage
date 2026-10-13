import * as T from 'three';
import {LEVEL,inFloor} from './js/level.js';
import {biomeWeights,LORE} from './js/wilderness-data.js';
import {LANDMARKS} from './js/landmark-data.js';
import {floorDistance,groundHeight,reliefHeight,WATER_LEVEL,VOLCANO} from './world-relief.js';
import {paint,place,join,rand,wobble,sceneryKit,crystal,rock} from './scenery-kit.js';
// One memorable silhouette per region. Static stone and timber merge into the scenery batches;
// only sails, beams, boats, waterfalls and smoke stay separate so they can move.
const cyl=(r1,r2,h,seg=8,open=false)=>new T.CylinderGeometry(r1,r2,h,seg,1,open);
const boxGeo=(w,h,d)=>new T.BoxGeometry(w,h,d);
export function buildLandmarks(scene,batch,glow){
 const kit=sceneryKit(),movers=[],put=(b,geo,color,x,y,z,ry=0,rx=0,rz=0,j=.08)=>b.put(paint(geo,color,j),x,y,z,1,ry,1,rx,rz);
 const solid=(color,o={})=>new T.MeshStandardMaterial({color,roughness:.75,...o});
 const coloredMesh=(geo,mat,parent,x=0,y=0,z=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;};
 // Lighthouse on the Greyshore islet, its lamp sweeping the bay.
 {const x=-41,z=4,y=groundHeight(x,z);batch.add(kit.rock[0],x,y-.6,z,2.6,.4,1.4);
  put(batch,cyl(.62,.92,5.6,12),'#ece5d6',x,y+2.8,z);for(const k of [0,1,2])put(batch,cyl(.84-k*.1,.88-k*.1,.42,12),'#b8433a',x,y+.9+k*1.6,z);
  put(batch,cyl(1.02,1.02,.16,12),'#33363a',x,y+5.65,z);put(glow,cyl(.48,.48,.85,10),'#ffe6a6',x,y+6.15,z);put(batch,new T.ConeGeometry(.7,.8,10),'#9c3a30',x,y+6.98,z);
  const beam=new T.Group();beam.position.set(x,y+6.15,z);scene.add(beam);const light=new T.MeshBasicMaterial({color:'#fff1c4',transparent:true,opacity:.085,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});
  for(const s of [-1,1]){const cone=new T.Mesh(new T.ConeGeometry(1.2,12,18,1,true),light);cone.rotation.z=s*Math.PI/2;cone.position.x=s*6;beam.add(cone);}
  movers.push(t=>{beam.rotation.y=t*.55;});}
 // Seabell pier, moored skiffs and a merchant ship riding at anchor.
 {const z=12.5,x0=-36.3,x1=-42.6;put(batch,boxGeo(x0-x1,.14,1.3),'#7c5b3d',(x0+x1)/2,-.02,z);put(batch,boxGeo(1.5,.14,3.8),'#7c5b3d',x1-.6,-.02,z);
  for(let x=x0-.3;x>x1-1.2;x-=1.15)for(const s of [-1,1])put(batch,cyl(.08,.09,1.4,6),'#4b3727',x,-.6,z+s*.62);
  for(const [dx,dz,c] of [[-1.2,.3,'#8b6a43'],[-1.8,-.35,'#6e5236'],[-5.6,1.2,'#8b6a43']])put(batch,boxGeo(.5,.5,.5),c,x0+dx,.3,z+dz,rand(dx,dz));
  put(batch,cyl(.24,.24,.6,8),'#5d4630',x0-2.6,.3,z-.35);put(glow,cyl(.12,.12,.22,6),'#ffd890',x1-.6,1.5,z+1.6);put(batch,cyl(.05,.05,1.4,5),'#3a2c22',x1-.6,.7,z+1.6);
  const hull=solid('#6b4a30'),sail=solid('#efe5cc',{side:T.DoubleSide}),trim=solid('#9a3a2e');
  const boat=(x,z,ry,size,masts)=>{const g=new T.Group();g.position.set(x,WATER_LEVEL,z);g.rotation.y=ry;scene.add(g);const h=coloredMesh(cyl(.5*size,.32*size,2.4*size,10),hull,g);h.rotation.z=Math.PI/2;h.scale.set(1,1,.62);
   coloredMesh(boxGeo(2.2*size,.12,.62*size),trim,g,0,.28*size,0);for(let m=0;m<masts;m++){const mx=(m-(masts-1)/2)*.9*size;coloredMesh(cyl(.035*size,.05*size,2.4*size,5),hull,g,mx,1.3*size,0);const s=coloredMesh(new T.PlaneGeometry(.9*size,1.4*size),sail,g,mx+.05,1.45*size,0);s.rotation.y=Math.PI/2+.25;}
   movers.push(t=>{g.position.y=WATER_LEVEL+Math.sin(t*1.3+x)*.06;g.rotation.z=Math.sin(t*.9+z)*.045;g.rotation.x=Math.sin(t*.7+x)*.03;});};
  boat(-40.4,11,.2,.8,1);boat(-41.4,14.2,-.3,.75,1);boat(-50,15,.6,1.9,2);boat(-46.5,6,1.4,.85,1);}
 // Windmills over the wheat; sails face the default camera so their turn reads.
 const lattice=solid('#ece0c4'),spar=solid('#5a4330');
 for(const l of LANDMARKS.filter(l=>l.kind==='windmill')){const x=l.x*.01,z=l.y*.01;put(batch,cyl(.52,.82,3.5,8),'#d9cdb2',x,1.75,z);put(batch,new T.ConeGeometry(.82,1,8),'#7b4b33',x,4,z);put(batch,boxGeo(.5,.9,.1),'#4a3326',x+.21,.45,z+.73,.48);put(batch,boxGeo(.3,.3,.08),'#f0c56b',x+.36,2.3,z+.62,.48);
  const hub=new T.Group();hub.position.set(x+Math.sin(.48)*.95,3.25,z+Math.cos(.48)*.95);hub.rotation.y=.48;scene.add(hub);const rotor=new T.Group();hub.add(rotor);coloredMesh(cyl(.12,.12,.3,8),spar,rotor).rotation.x=Math.PI/2;
  for(let k=0;k<4;k++){const arm=new T.Group();arm.rotation.z=k*Math.PI/2;rotor.add(arm);coloredMesh(boxGeo(.07,2.7,.06),spar,arm,0,1.35,0);coloredMesh(boxGeo(.52,2.1,.03),lattice,arm,.3,1.6,.02);}
  movers.push(t=>{rotor.rotation.z=-t*.9-x;});}
 // The Elder Blackpine towers over the woods; lantern stones ring its roots.
 for(const l of LANDMARKS.filter(l=>l.kind==='elderTree')){const x=l.x*.01,z=l.y*.01;batch.add(kit.pineDeep[1],x,-.2,z,2.6,.7,3.1);for(let k=0;k<5;k++){const a=k*1.26+.4;batch.add(kit.rock[k%3],x+Math.cos(a)*1.25,0,z+Math.sin(a)*1.25,.55,a,.5);}
  for(let k=0;k<3;k++){const a=k*2.1+1;put(batch,cyl(.07,.09,.9,5),'#4a3a2c',x+Math.cos(a)*2.4,.45,z+Math.sin(a)*2.4);put(glow,boxGeo(.2,.22,.2),'#ffc977',x+Math.cos(a)*2.4,1,z+Math.sin(a)*2.4);}}
 // Standing stones with a softly glowing rune altar.
 for(const l of LANDMARKS.filter(l=>l.kind==='stoneCircle')){const x=l.x*.01,z=l.y*.01;for(let k=0;k<7;k++){const a=k*Math.PI*2/7,h=1.8+rand(k,3)*.8;batch.put(paint(wobble(boxGeo(.55,h,.36),.18,k),'#7d8277',.12),x+Math.cos(a)*2.4,h/2-.05,z+Math.sin(a)*2.4,1,-a+Math.PI/2,1,(rand(k,1)-.5)*.12,(rand(k,2)-.5)*.12);put(batch,boxGeo(.58,.12,.4),'#5f7a46',x+Math.cos(a)*2.4,h-.03,z+Math.sin(a)*2.4,-a+Math.PI/2);}
  put(batch,boxGeo(1.1,.55,.7),'#6f736a',x,.27,z,.3);put(glow,boxGeo(.8,.03,.4),'#7ce6c4',x,.56,z,.3);}
 // Sandstone arch over the Saffron coast road; walkable underneath.
 for(const l of LANDMARKS.filter(l=>l.kind==='arch')){const x=l.x*.01,z=l.y*.01;for(const s of [-1,1])batch.put(paint(wobble(cyl(.5,.62,4.2,7),.12,s+4),'#c47b45',.1),x+s*1.5,2.1,z);const top=paint(wobble(new T.TorusGeometry(1.5,.52,6,12,Math.PI),.1,9),'#cf8a52',.1);batch.put(top,x,4.1,z);}
 for(const l of LANDMARKS.filter(l=>l.kind==='totem')){const x=l.x*.01,z=l.y*.01;put(batch,cyl(.2,.26,4.2,7),'#6d4b30',x,2.1,z);['#b8433a','#e2b448','#3f8b8a','#e2b448'].forEach((c,k)=>put(batch,boxGeo(.62,.5,.62),c,x,.9+k*.8,z,k*.4));
  put(batch,boxGeo(2.4,.1,.1),'#6d4b30',x,3.6,z,.48);[-1,-.4,.4,1].forEach((o,k)=>put(batch,boxGeo(.36,1.1,.03),['#b8433a','#3f8b8a','#e2b448','#b8433a'][k],x+Math.cos(.48)*o,3,z-Math.sin(.48)*o,.48));put(glow,new T.IcosahedronGeometry(.28,0),'#ffd86e',x,4.45,z);}
 for(const l of LANDMARKS.filter(l=>l.kind==='crystalSpire')){const x=l.x*.01,z=l.y*.01;glow.add(kit.crystal[0],x,-.1,z,3.1,rand(x,z)*6);batch.add(kit.rockSlate[0],x,0,z,1.4,0,.6);}
 for(const l of LANDMARKS.filter(l=>l.kind==='windShrine')){const x=l.x*.01,z=l.y*.01,flags=['#c8433a','#e8c25a','#3f8bb0','#f2f0e8','#5aa36a'];for(const s of [-1,1])put(batch,cyl(.2,.24,3,8),'#7a2f28',x+s*1.2,1.5,z);
  put(batch,boxGeo(3.4,.22,.32),'#4a2420',x,3.05,z);put(batch,boxGeo(3.1,.16,.26),'#7a2f28',x,2.55,z);put(batch,boxGeo(3.5,.08,.4),'#eef3f6',x,3.2,z);
  for(let k=0;k<9;k++){const t=k/8,fx=x-1.05+t*2.1,fy=2.42-Math.sin(t*Math.PI)*.3;put(batch,boxGeo(.2,.28,.02),flags[k%5],fx,fy,z+.05);}}
 for(const l of LANDMARKS.filter(l=>l.kind==='obsidian')){const x=l.x*.01,z=l.y*.01;batch.add(kit.obsidian[0],x,0,z,2.6,rand(x,z)*6);put(glow,cyl(.75,.9,.04,9),'#c2410f',x+.9,-.025,z+.8,0,0,0,.3);}
 for(const l of LANDMARKS.filter(l=>l.kind==='brassColossus')){const x=l.x*.01,z=l.y*.01,brass='#b38b4a',patina='#5f8f7c';
  for(const s of [-1,1])put(batch,boxGeo(.55,1.6,.6),brass,x+s*.42,.8,z);put(batch,boxGeo(1.5,1.7,.9),patina,x,2.3,z+.1,0,.18,.12);put(batch,boxGeo(.45,1.5,.45),brass,x+1,2.1,z+.3,0,.3,-.6);
  put(batch,cyl(.5,.55,.8,8),brass,x-2,.35,z+1.6,0,Math.PI/2,.4);put(glow,boxGeo(.3,.08,.05),'#ffb34a',x-2.1,.55,z+1.2,.4);put(batch,boxGeo(.8,.3,1.4),patina,x+2.2,.15,z-1,.7);}
 for(const l of LANDMARKS.filter(l=>l.kind==='brassCog')){const x=l.x*.01,z=l.y*.01;put(batch,new T.TorusGeometry(1.3,.24,6,18),'#a8823e',x,.85,z,.5);put(batch,cyl(.35,.35,.4,10),'#7d6234',x,.85,z,.5,Math.PI/2);
  for(let k=0;k<14;k++){const a=k/14*Math.PI*2;if(Math.sin(a)<-.6)continue;const tooth=paint(boxGeo(.3,.42,.3),'#a8823e',.08);place(tooth,Math.cos(a)*1.58,Math.sin(a)*1.58,0,1,1,1,0,0,a+Math.PI/2);place(tooth,x,.85,z,1,1,1,.5);batch.put(tooth,0,0,0);}}
 // Drowned towers and a broken dam at the head of the Cloudwater reservoir.
 {for(const [x,z,h,r] of [[10,-24,3.4,1.1],[14.5,-30.5,4.6,1.3],[7.5,-30,2.6,.9]]){batch.put(paint(wobble(cyl(r,r*1.12,h+1.6,10),.06,x),'#7c8580',.1),x,WATER_LEVEL+(h-1.6)/2,z);
   for(let k=0;k<7;k++){const a=k/7*Math.PI*2,ch=.3+rand(k,x)*.7;put(batch,boxGeo(.42,ch,.32),'#8d968f',x+Math.cos(a)*r*.92,WATER_LEVEL+h+ch/2,z+Math.sin(a)*r*.92,-a);}
   put(glow,boxGeo(.22,.4,.05),'#9be7ff',x+Math.sin(.48)*r*1.02,WATER_LEVEL+h*.7,z+Math.cos(.48)*r*1.02,.48);}
  for(const [x0,z0,x1,z1] of [[10,-24,12.6,-27.6],[14.5,-30.5,10.8,-30.2]]){const len=Math.hypot(x1-x0,z1-z0),a=Math.atan2(z1-z0,x1-x0);put(batch,boxGeo(len,1.1,.55),'#7c8580',(x0+x1)/2,WATER_LEVEL+.35,(z0+z1)/2,-a);}
  let damZ=-31;while(damZ>-46&&reliefHeight(12,damZ)<.4)damZ-=.25;damZ+=.9;const damY=Math.max(3,reliefHeight(12,damZ-2)),width=11;
  put(batch,boxGeo(width,damY-WATER_LEVEL+.6,1.6),'#8a918a',12,(damY+WATER_LEVEL)/2,damZ-.6);for(let k=0;k<9;k++)put(batch,boxGeo(.5,.5,1.7),'#9aa29a',12-width/2+.6+k*1.22,damY+.5,damZ-.6);
  const tex=streakTexture(),fallMat=new T.MeshBasicMaterial({map:tex,transparent:true,opacity:.82,depthWrite:false,side:T.DoubleSide});
  for(const [x,w] of [[9.6,1.6],[12.6,2.2],[15,1.2]]){const fall=new T.Mesh(new T.PlaneGeometry(w,damY-WATER_LEVEL),fallMat);fall.position.set(x,(damY+WATER_LEVEL)/2,damZ+.25);scene.add(fall);
   const foam=new T.Mesh(new T.CircleGeometry(w*.75,12),new T.MeshBasicMaterial({color:'#f2fbfb',transparent:true,opacity:.7,depthWrite:false}));foam.rotation.x=-Math.PI/2;foam.position.set(x,WATER_LEVEL+.03,damZ+.7);scene.add(foam);movers.push(t=>{foam.scale.setScalar(1+Math.sin(t*3+x)*.08);});}
  movers.push(t=>{tex.offset.y=-t*1.4;});}
 // Sea stacks and a natural arch guard the Saffron bay.
 {for(const [x,z,h,r] of [[44,17,6.5,1.4],[53,24,7.5,1.7],[57,20.5,4.2,1],[23,24,5,1.2]]){const layers=Math.round(h/1.1);for(let k=0;k<layers;k++)batch.put(paint(wobble(cyl(r*(1-k*.04),r*(1.05-k*.04),1.15,7),.16,x+k),k%2?'#c47b45':'#d8975c',.12),x,WATER_LEVEL+k*1.1+.4,z,1,k*.6);batch.add(kit.bushDry[0],x,WATER_LEVEL+layers*1.1-.1,z,1.2,x);}
  for(const s of [-1,1])batch.put(paint(wobble(cyl(.7,.9,4.4,7),.14,s),'#c98049',.12),48+s*1.8,WATER_LEVEL+2,21.5);batch.put(paint(wobble(new T.TorusGeometry(1.8,.7,6,12,Math.PI),.1,3),'#d38f55',.1),48,WATER_LEVEL+4.1,21.5);}
 // Giant crystals grow from the ravine walls.
 {let n=0;for(let i=0;i<220&&n<9;i++){const a=i*2.39996,r=8+(i%13)*1.6,x=66+Math.cos(a)*r,z=-14.5+Math.sin(a)*r*.8,d=floorDistance(x,z);if(d<1.8||d>7.5)continue;const w=biomeWeights(x*100,z*100);if(w[5]<.35)continue;const h=reliefHeight(x,z);if(h<0)continue;glow.add(kit.crystal[n%3],x,h-.3,z,3.4+rand(i,3)*2.6,a,4+rand(3,i)*3);n++;}}
 // Brasswater's ring of towers on the heights, with gilded domes.
 {const towers=[];for(let i=0;i<360&&towers.length<8;i++){const a=i/360*Math.PI*2,x=98.2+Math.cos(a)*15,z=-24.5+Math.sin(a)*12;let px=x,pz=z;for(let k=0;k<30;k++){const d=floorDistance(px,pz);if(Math.abs(d-3.2)<.4)break;const s=d<3.2?1.12:.92;px=98.2+(px-98.2)*s;pz=-24.5+(pz+24.5)*s;}
   if(Math.abs(floorDistance(px,pz)-3.2)>.6||towers.some(t=>Math.hypot(t[0]-px,t[1]-pz)<7))continue;const w=biomeWeights(px*100,pz*100);if(w[8]<.3)continue;towers.push([px,pz,Math.max(0,reliefHeight(px,pz))]);}
  for(const [x,z,y] of towers){put(batch,cyl(1,1.15,5.2,10),'#8d806a',x,y+2.3,z);for(let k=0;k<8;k++){const a=k/8*Math.PI*2;put(batch,boxGeo(.38,.45,.3),'#9c8f76',x+Math.cos(a)*.96,y+5.1,z+Math.sin(a)*.96,-a);}put(batch,new T.SphereGeometry(.8,10,6,0,Math.PI*2,0,Math.PI/2),'#c79d52',x,y+4.95,z);put(glow,boxGeo(.22,.42,.05),'#ffc56a',x+Math.sin(.48)*1.05,y+3.4,z+Math.cos(.48)*1.05,.48);}
  for(let i=0;i<towers.length;i++)for(let j=i+1;j<towers.length;j++){const [ax,az,ay]=towers[i],[bx,bz,by]=towers[j],len=Math.hypot(bx-ax,bz-az);if(len>11)continue;put(batch,boxGeo(len-1.6,2.6,.8),'#857862',(ax+bx)/2,(ay+by)/2+1.2,(az+bz)/2,-Math.atan2(bz-az,bx-ax));}}
 // The Cinderwash volcano breathes a slow plume over the wastes.
 const smoke=volcanoSmoke(scene);movers.push(smoke);
 lanterns(glow,batch);
 return {update(time){for(const m of movers)m(time);}};
}
const canvas=(w,h)=>{if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=w;c.height=h;return c.getContext?.('2d')?c:null;};
function streakTexture(){const c=canvas(32,128);if(!c)return new T.Texture();const g=c.getContext('2d');g.fillStyle='#bfe6f0';g.fillRect(0,0,32,128);
 for(let i=0;i<40;i++){g.fillStyle=`rgba(255,255,255,${.35+Math.random()*.5})`;g.fillRect(Math.random()*32,Math.random()*128,1+Math.random()*2,10+Math.random()*30);}
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;return t;}
export function softDot(){const c=canvas(64,64);if(!c)return null;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.45,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new T.CanvasTexture(c);}
function volcanoSmoke(scene){const count=40,geo=new T.BufferGeometry(),pos=new Float32Array(count*3),seeds=[];for(let i=0;i<count;i++)seeds.push(Math.random());geo.setAttribute('position',new T.BufferAttribute(pos,3));
 const top=reliefHeight(VOLCANO.x,VOLCANO.z),mat=new T.PointsMaterial({color:'#5d5450',size:9,map:softDot(),transparent:true,opacity:.5,depthWrite:false,sizeAttenuation:true}),points=new T.Points(geo,mat);points.frustumCulled=false;scene.add(points);
 return t=>{for(let i=0;i<count;i++){const life=(t*.05+seeds[i])%1;pos[i*3]=VOLCANO.x+Math.sin(seeds[i]*40)*1.4-life*26;pos[i*3+1]=top+life*16;pos[i*3+2]=VOLCANO.z+Math.cos(seeds[i]*40)*1.4-life*9;}geo.attributes.position.needsUpdate=true;};}
// Road lamps light the harbour, the frontier camp and the fortress approach.
function lanterns(glow,batch){const spots=[];for(const path of LEVEL.paths)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=0;t<len;t+=850){const x=(a[0]+(b[0]-a[0])*t/len)*.01,z=(a[1]+(b[1]-a[1])*t/len)*.01,w=biomeWeights(x*100,z*100);if(w[0]+w[4]+w[8]<.45)continue;
  const side=spots.length%2?1:-1,nx=-(b[1]-a[1])/len*side*1.35,nz=(b[0]-a[0])/len*side*1.35,px=x+nx,pz=z+nz;if(!inFloor(px*100,pz*100,40)||LEVEL.obstacles.some(o=>Math.hypot(px*100-o.x,pz*100-o.y)<o.r+60)||LORE.some(o=>Math.hypot(px*100-o.x,pz*100-o.y)<150)||spots.some(s=>Math.hypot(s[0]-px,s[1]-pz)<5))continue;spots.push([px,pz]);}}
 for(const [x,z] of spots){batch.put(paint(cyl(.05,.07,1.6,5),'#3a2c22'),x,.8,z);batch.put(paint(boxGeo(.4,.06,.06),'#3a2c22'),x+.15,1.6,z);glow.put(paint(boxGeo(.16,.24,.16),'#ffcf7a'),x+.3,1.45,z);}}
