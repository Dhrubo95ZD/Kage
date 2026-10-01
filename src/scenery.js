import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
export function buildScenery(scene){const batches=new Map(),dummy=new T.Object3D();function add(geo,color,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){if(geo.index){const old=geo;geo=geo.toNonIndexed();old.dispose();}dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();geo.applyMatrix4(dummy.matrix);if(!batches.has(color))batches.set(color,[]);batches.get(color).push(geo);}
 // Monumental civil aqueduct on the reservoir's far rim. No religious motifs.
 for(const x of [20.5,24.5,28.5,32.5]){add(new T.CylinderGeometry(.48,.8,6,10),'#b4c3c2',x,2.8,-36.8);for(const y of [.35,4.8,5.6])add(new T.CylinderGeometry(.9,.9,.16,10),'#d9dfd5',x,y,-36.8);for(let i=0;i<6;i++){const a=i*Math.PI/3;add(new T.CylinderGeometry(.045,.07,4.3,5),'#d7dfda',x+Math.cos(a)*.51,2.7,-36.8+Math.sin(a)*.51);}}
 for(const x of [22.5,26.5,30.5]){add(new T.TorusGeometry(2,.28,8,28,Math.PI),'#c9d4ce',x,3.3,-36.8);add(new T.BoxGeometry(4.3,.45,1.2),'#d6dfd8',x,5.8,-36.8);add(new T.BoxGeometry(4.3,.16,1.3),'#f0f4e8',x,6.08,-36.8);}
 // Snow shelves and layered cliff silhouettes beyond the walkable rim.
 for(let i=0;i<18;i++){const x=17.5+i*1.1,z=-39-Math.sin(i*.7);add(new T.IcosahedronGeometry(1.8,1),'#6f8796',x,-1,z,1.0,2+Math.sin(i)*.5,.8);add(new T.IcosahedronGeometry(1.3,1),'#e2ebe7',x,1.5,z,1.25,.20,1);}
 // Mossy forest steps, gnarled roots and fern beds along the cedar route.
 for(const [x,z] of [[-21,-4],[-16,-10],[-8,-12]]){for(let i=0;i<5;i++){add(new T.BoxGeometry(1.4,.13,.40),'#778b79',x+i*.16,.04+i*.012,z+i*.43);add(new T.IcosahedronGeometry(.4,1),'#618464',x-.8,.13,z+i*.45,1,.45,1);}for(let j=0;j<4;j++){const curve=new T.CatmullRomCurve3([new T.Vector3(x-2,1.1,z),new T.Vector3(x-1.3,.3,z+j*.12),new T.Vector3(x-.5,.05,z+.3+j*.25)]);add(new T.TubeGeometry(curve,10,.09,5,false),'#75806a',0,0,0);}}
 for(let i=0;i<55;i++){const x=-23+(i%11)*1.1,z=-10+Math.floor(i/11)*1.4;for(let leaf=0;leaf<5;leaf++){const a=leaf*1.25;add(new T.SphereGeometry(.16,6,4),'#3e795f',x+Math.cos(a)*.25,.2,z+Math.sin(a)*.25,.65,.17,2.7,.3,a,0);}}
 for(const [color,list] of batches){const mesh=new T.Mesh(mergeGeometries(list),new T.MeshStandardMaterial({color,roughness:1}));list.forEach(g=>g.dispose());mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);}
}
