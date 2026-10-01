import {paintMarker} from './world-markers.js';
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {HUNTS,HUNT_POLYGONS} from './js/hunt-data.js';
export function buildHuntScenery(scene){const batches=new Map(),temp=new T.Object3D(),objectives=[];
 const put=(geo,color,x,y,z,sx=1,sy=1,sz=1,rz=0)=>{if(geo.index){const old=geo;geo=geo.toNonIndexed();old.dispose();}temp.position.set(x,y,z);temp.scale.set(sx,sy,sz);temp.rotation.set(0,0,rz);temp.updateMatrix();geo.applyMatrix4(temp.matrix);if(!batches.has(color))batches.set(color,[]);batches.get(color).push(geo);};
 const box=(c,x,y,z,w,h,d)=>put(new T.BoxGeometry(w,h,d),c,x,y,z);
 for(const [hi,h] of HUNTS.entries()){const c=h.color;
 const ex=h.entry.x*.01,ez=h.entry.y*.01;for(const side of [-1,1]){box('#9e987f',ex+side*1.5,1.25,ez,.48,2.5,.55);box(c,ex+side*1.48,1.9,ez+.30,.54,.65,.04);}box('#a79b7b',ex,2.65,ez,3.65,.35,.65);
 for(const [si,p] of h.stages.entries()){const x=p.x*.01,z=p.y*.01;for(let k=0;k<8;k++){const a=k*Math.PI/4,px=x+Math.cos(a)*4.4,pz=z+Math.sin(a)*4.4;put(new T.DodecahedronGeometry(.55,0),hi===1?'#65584d':'#889b85',px,.24,pz,1.2,.65,1);if(hi===0){put(new T.ConeGeometry(.25,.95+(k%3)*.35,5),k%2?'#a4d2c1':'#83a7b8',px,.66,pz,1,1,1,.2*Math.sin(k));}else if(hi===1){box('#493f37',px,.6,pz,.8,1.2,.75);box('#d29660',px,.75,pz+.39,.3,.5,.02);}else {box('#855f42',px,.44,pz,1.1,.8,.85);box('#c4af7c',px,.88,pz,1.2,.08,.95);}}
 if(si===1){const root=new T.Group();root.position.set(x,0,z);for(let k=0;k<3;k++){const geo=hi===0?new T.ConeGeometry(.4,1.7,6):hi===1?new T.CylinderGeometry(.45,.45,.8,10):new T.BoxGeometry(.75,1.4,.65);const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({color:c,roughness:.75}));mesh.position.set((k-1)*1.1,.7,0);root.add(mesh);}scene.add(root);objectives.push({id:h.id,root});}
 if(hi===2){box('#876749',x-2, .75,z+2,2,.2,1.35);for(const side of [-1,1])put(new T.TorusGeometry(.5,.10,5,12),'#544934',x-2+side*.65,.5,z+2.75);box('#d7c293',x-2,1.45,z+2,2.1,.15,1.5);}}
 }
 for(const [color,geos] of batches){const geo=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.9,flatShading:true}));mesh.receiveShadow=true;scene.add(mesh);}
 return {update(sim){for(const o of objectives){const cleared=sim.huntRun?.id===o.id&&sim.huntRun.objectiveDone;o.root.scale.y=cleared?.2:1;}}};
}
export function updateHuntMarkers(renderer,sim){renderer.huntMarkers??=new Map();const run=sim.huntRun;for(const h of HUNTS){for(const kind of ['entry','objective']){const key=h.id+kind;let el=renderer.huntMarkers.get(key);if(!el){el=document.createElement('button');el.type='button';if(kind==='entry')el.onclick=()=>window.openDungeon?.(h.id);el.className='hunt-world-marker';if(kind==='objective'){el.type='button';el.onclick=()=>window.huntWorldInteract?.();}renderer.labelLayer.append(el);renderer.huntMarkers.set(key,el);}paintMarker(el,renderer.worldMarkerPlan?.get('hunt:'+key),'hunt-world-marker',kind==='entry'?h.name+' hunt entrance':h.action);}}}
