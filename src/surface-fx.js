import {biomeWeights} from './js/wilderness-data.js';
import * as T from 'three';
export const surfaceAt=(x,y)=>biomeWeights(x,y)[6]>.42?'snow':biomeWeights(x,y)[7]>.45?'stone':'grass';
// Cosmetic local terrain state. Spatial buckets keep each cut proportional to its radius.
export class SurfaceFX{
 constructor(scene,points=[]){this.points=points.map(p=>({...p,cut:false}));this.cells=new Map();this.matrix=new T.Object3D();this.clock=0;this.footSerial=0;this.lastStep=null;
 const positions=[];for(let k=0;k<3;k++){const a=k*Math.PI/3,c=Math.cos(a),s=Math.sin(a),width=.055;const p=[[-width,0,0],[width,0,0],[.03,.35,.035],[-width,0,0],[.03,.35,.035],[-.01,.35,.035],[-.01,.35,.035],[.03,.35,.035],[.075,.68,.09]];for(const [x,y,z] of p)positions.push(x*c+z*s,y,-x*s+z*c);}const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.computeVertexNormals();const mat=new T.MeshStandardMaterial({color:'#e2e6bf',roughness:1,side:T.DoubleSide});mat.onBeforeCompile=shader=>{shader.uniforms.grassTime={value:0};shader.uniforms.walker={value:new T.Vector2()};this.shader=shader;shader.vertexShader='uniform float grassTime; uniform vec2 walker;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 vec2 root = (modelMatrix * instanceMatrix * vec4(0.,0.,0.,1.)).xz;
 float bend = transformed.y * transformed.y;
 transformed.x += sin(grassTime*1.7+root.x*1.3+root.y*.8)*bend*.24;
 float nearFoot=1.-smoothstep(.15,.9,distance(root,walker));
 transformed.xz += normalize(root-walker+vec2(.001))*nearFoot*bend*.7;
 transformed.y *= 1.-nearFoot*.32;`);};
 this.grass=new T.InstancedMesh(geometry,mat,this.points.length);this.grass.receiveShadow=true;this.grass.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(this.grass);
 this.points.forEach((p,i)=>{this.setGrass(i,1);this.grass.setColorAt(i,new T.Color().setHSL(.23+p.seed*.045,.26,.30+p.seed*.12));const key=this.key(p.x,p.z);if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(i);});
 const footGeo=new T.CircleGeometry(1,10);footGeo.rotateX(-Math.PI/2);this.tracks=new T.InstancedMesh(footGeo,new T.MeshBasicMaterial({color:'#8ca5ba',transparent:true,opacity:.42,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),180);this.tracks.instanceMatrix.setUsage(T.DynamicDrawUsage);this.tracks.frustumCulled=false;this.trackAges=new Array(180).fill(-100);for(let i=0;i<180;i++){this.matrix.scale.set(0,0,0);this.matrix.updateMatrix();this.tracks.setMatrixAt(i,this.matrix.matrix);}scene.add(this.tracks);
 }
 key(x,z){return Math.floor(x/2)+','+Math.floor(z/2);}
 setGrass(i,scale){const p=this.points[i],o=this.matrix;o.position.set(p.x,.02,p.z);o.rotation.set(0,p.seed*6.28,0);o.scale.set(.85+p.seed*.5,(.65+p.seed*.8)*scale,.85+p.seed*.5);o.updateMatrix();this.grass.setMatrixAt(i,o.matrix);}
 cut(e){const x=e.x*.01,z=e.y*.01,r=Math.min(6,e.reach*.01),radial=['spin','nova','pull'].includes(e.shape),cut=[];for(let cx=Math.floor((x-r)/2);cx<=Math.floor((x+r)/2);cx++)for(let cz=Math.floor((z-r)/2);cz<=Math.floor((z+r)/2);cz++)for(const i of this.cells.get(cx+','+cz)||[]){const p=this.points[i],dx=p.x-x,dz=p.z-z,d=Math.hypot(dx,dz);if(p.cut||d>r)continue;const delta=Math.abs(Math.atan2(Math.sin(Math.atan2(dz,dx)-e.angle),Math.cos(Math.atan2(dz,dx)-e.angle)));if(!radial&&delta>(e.arc||1.4)/2)continue;p.cut=true;this.setGrass(i,.13);if(cut.length<18)cut.push(p);}if(cut.length)this.grass.instanceMatrix.needsUpdate=true;return cut;}
 update(time,player){this.clock=time;if(this.shader){this.shader.uniforms.grassTime.value=time;this.shader.uniforms.walker.value.set(player.x*.01,player.y*.01);}for(let i=0;i<180;i++)if(this.trackAges[i]>=0&&time-this.trackAges[i]>55){this.trackAges[i]=-100;this.matrix.scale.set(0,0,0);this.matrix.updateMatrix();this.tracks.setMatrixAt(i,this.matrix.matrix);this.tracks.instanceMatrix.needsUpdate=true;}
 if(!player.moving||player.dead){this.lastStep=null;return null;}const x=player.x*.01,z=player.y*.01;if(this.lastStep&&Math.hypot(x-this.lastStep.x,z-this.lastStep.z)<.43)return null;this.lastStep={x,z};const surface=surfaceAt(player.x,player.y);if(surface==='snow'){const side=this.footSerial%2?1:-1,i=this.footSerial++%180,angle=player.moveAngle??player.angle;this.matrix.position.set(x-Math.sin(angle)*.10*side,.018,z+Math.cos(angle)*.10*side);this.matrix.rotation.set(0,Math.PI/2-angle,0);this.matrix.scale.set(.07,1,.145);this.matrix.updateMatrix();this.tracks.setMatrixAt(i,this.matrix.matrix);this.trackAges[i]=time;this.tracks.instanceMatrix.needsUpdate=true;}return {x,z,surface};
 }
 reset(){this.points.forEach((p,i)=>{p.cut=false;this.setGrass(i,1);});this.grass.instanceMatrix.needsUpdate=true;this.lastStep=null;this.trackAges.fill(-100);for(let i=0;i<180;i++){this.matrix.scale.set(0,0,0);this.matrix.updateMatrix();this.tracks.setMatrixAt(i,this.matrix.matrix);}this.tracks.instanceMatrix.needsUpdate=true;}
}
