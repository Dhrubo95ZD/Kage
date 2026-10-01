import * as T from 'three';
// Natural depth occlusion: no player-centred clipping or material fading.
export function projectedPoint(camera,width,height,x,y,z){const p=new T.Vector3(x,y,z).project(camera);const visible=p.z>=-1&&p.z<=1&&Number.isFinite(p.x)&&Number.isFinite(p.y);return{x:visible?(p.x*.5+.5)*width:-10000,y:visible?(-p.y*.5+.5)*height:-10000,visible};}
// Ordered decal layers: each overlapping road / land polygon has an explicit depth bias.
export function groundLayer(material,index,kind='land'){material.polygonOffset=true;material.polygonOffsetFactor=0;material.polygonOffsetUnits=-(kind==='road'?64:1)-index*2;return material;}
