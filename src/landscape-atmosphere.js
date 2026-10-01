import * as T from 'three';
import {inFloor} from './js/level.js';
const noise=(a,b)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n);};
export function buildAtmosphere(scene){
 const sky=new T.Mesh(new T.SphereGeometry(230,32,20),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{},vertexShader:`varying vec3 ray; void main(){ray=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 ray;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 void main(){vec3 d=normalize(ray);float h=max(d.y,0.);vec3 c=mix(vec3(.70,.79,.81),vec3(.34,.55,.70),pow(h,.55));vec2 p=d.xz/max(d.y+.24,.10)*4.;float n=noise(p)*.6+noise(p*2.1)*.28+noise(p*4.2)*.12;float clouds=smoothstep(.52,.73,n)*smoothstep(.04,.2,d.y);c=mix(c,vec3(.91,.92,.86),clouds*.9);float sun=pow(max(0.,dot(d,normalize(vec3(-.6,.8,-.5)))),220.);c+=vec3(1.,.8,.4)*sun*.7;gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}));sky.frustumCulled=false;sky.renderOrder=-20;sky.userData.noCutaway=true;scene.add(sky);
 // Distant ridgelines lie outside the playable footprint, keeping all combat terrain flat.
 const mountainMaterial=new T.MeshStandardMaterial({color:'#6eada5',roughness:1,vertexColors:true});
 const mountains=new T.Group();mountains.name='background-ridges';scene.add(mountains);
 for(let i=0;i<34;i++){const x=-65+i*6,z=-58-noise(i,9)*16;const g=new T.SphereGeometry(1,14,9),p=g.attributes.position,colors=[];for(let j=0;j<p.count;j++){const y=p.getY(j),rough=.86+noise(p.getX(j)*13+i,p.getZ(j)*17)*.28;p.setXYZ(j,p.getX(j)*rough,y,p.getZ(j)*rough);const c=new T.Color(y>.70?'#899593':y>.1?'#546465':'#3c4e56');colors.push(c.r,c.g,c.b);}g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();const m=new T.Mesh(g,mountainMaterial);m.position.set(x,-6,z);m.scale.set(8+noise(i,4)*8,10+noise(i,5)*15,10);mountains.add(m);}
 // Wildlife silhouettes are subtle and deliberately outside encounters.
 const birdGeo=new T.BufferGeometry();birdGeo.setAttribute('position',new T.Float32BufferAttribute([-.20,0,0,0,.04,.04,.20,0,0,0,.04,.04],3));const birds=[];for(let i=0;i<7;i++){const bird=new T.LineSegments(birdGeo,new T.LineBasicMaterial({color:'#476b6d'}));scene.add(bird);birds.push(bird);}
 return {update(time,focus){sky.position.copy(focus);birds.forEach((b,i)=>{const a=time*.035+i*2.4;b.position.set(focus.x+Math.cos(a)*(18+i),8+i*.3,focus.z-14+Math.sin(a)*(10+i));b.rotation.y=-a;b.scale.y=.5+Math.sin(time*2+i)*.5;});}};
}
// One instanced draw for petals and one for fern leaves: detail without hundreds of objects.
export function buildUnderstory(scene,points){
 const dummy=new T.Object3D(),petal=new T.SphereGeometry(1,5,3),petals=[],ferns=[];
 for(let i=0;i<points.length;i+=5){const p=points[i];if(p.seed<.64)continue;const x=p.x,z=p.z;if(!inFloor(x*100,z*100,100))continue;
 for(let k=0;k<5;k++){const a=k*Math.PI*2/5;petals.push({x:x+Math.cos(a)*.065,y:.18+p.seed*.13,z:z+Math.sin(a)*.065,a,seed:p.seed});}
 if(i%15===0)for(let k=0;k<7;k++){const a=k*2.4;ferns.push({x:x+Math.cos(a)*.16,y:.15,z:z+Math.sin(a)*.16,a,seed:p.seed});}}
 function instances(list,color,flower){const m=new T.InstancedMesh(petal,new T.MeshStandardMaterial({color,roughness:1}),list.length);list.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(flower?0:.4,p.a,flower?.15:.25);dummy.scale.set(flower?.045:.065,flower?.018:.023,flower?.085:.38);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);m.setColorAt(i,new T.Color(flower?(p.seed>.85?'#edc771':'#f6f1d3'):'#3a8851'));});m.receiveShadow=true;scene.add(m);return m;}
 return {flowers:instances(petals,'#ffffff',true),ferns:instances(ferns,'#ffffff',false)};
}
