import * as T from 'three';
function createChest(scene,c){
 const root=new T.Group();root.scale.setScalar(1.4);scene.add(root);
 function box(parent,size,color,position){const object=new T.Mesh(new T.BoxGeometry(...size),new T.MeshStandardMaterial({color,roughness:.7,metalness:.15}));object.position.set(...position);object.castShadow=true;parent.add(object);return object;}
 box(root,[.9,.48,.6],'#a88353',[0,.24,0]);
 const lid=new T.Group();lid.position.set(0,.49,-.3);root.add(lid);
 box(lid,[.94,.16,.64],'#bc9c61',[0,.02,.3]);box(root,[.15,.24,.04],'#5e706b',[0,.42,.32]);
 return lid;
}
// Runtime rewards and restored saves can contain chests absent from LEVEL.chests.
export function syncChests(scene,objects,chests,time){
 const live=new Set();for(const c of chests){live.add(c.id);let lid=objects.get(c.id);if(!lid){lid=createChest(scene,c);objects.set(c.id,lid);}lid.parent.position.set(c.x*.01,0,c.y*.01);
 const t=!c.opened?0:Number.isFinite(c.openTime)?Math.max(0,Math.min(1,(time-c.openTime)/.8)):1;
 lid.rotation.x=-1.9*(1-Math.pow(1-t,3));lid.parent.rotation.z=t>0&&t<1?Math.sin(t*24)*(1-t)*.045:0;
 }
 for(const [id,lid] of objects)if(!live.has(id)){const root=lid.parent;root.removeFromParent();root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});objects.delete(id);}
}
