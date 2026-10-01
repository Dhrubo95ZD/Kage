import * as T from 'three';
export const CAMERA_MODES=['adventure','tactical','close'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function cameraSettings(mode='adventure',aspect=1,yaw=.48,zoom=1){
 if(!CAMERA_MODES.includes(mode))mode='adventure';
 const portrait=aspect<1,elevation=(mode==='tactical'?51:mode==='close'?29:43)*Math.PI/180;
 const distance=(mode==='tactical'?27:mode==='close'?18:23)*(portrait?1.36:1)*clamp(zoom,.8,1.25),horizontal=Math.cos(elevation)*distance;
 return {fov:portrait?57:48,near:.35,far:340,offset:new T.Vector3(Math.sin(yaw)*horizontal,Math.sin(elevation)*distance,Math.cos(yaw)*horizontal)};
}
export class AdventureCamera{
 constructor(camera,focus,offset){this.camera=camera;this.focus=focus;this.offset=offset;this.mode='adventure';this.yaw=.48;this.zoom=1;this.aspect=1;this.initialized=false;this.combat=0;this.look=new T.Vector3();this.target=new T.Vector3();}
 configure({mode=this.mode,yaw=this.yaw,zoom=this.zoom,aspect=this.aspect}={}){this.mode=CAMERA_MODES.includes(mode)?mode:'adventure';this.yaw=Number.isFinite(yaw)?yaw:.48;this.zoom=Number.isFinite(zoom)?clamp(zoom,.8,1.25):1;this.aspect=aspect;const c=cameraSettings(this.mode,aspect,this.yaw,this.zoom);this.baseOffset=c.offset;Object.assign(this.camera,{fov:c.fov,near:c.near,far:c.far,aspect});this.camera.updateProjectionMatrix();this.offset.copy(this.baseOffset);}
 reset(){this.initialized=false;this.look.set(0,0,0);this.combat=0;}
 update(player,enemies,dt,reduced=false){const step=clamp(dt,0,.05),a=1-Math.exp(-step*9),busy=enemies.some(e=>e.active&&!e.dead&&Math.hypot(e.x-player.x,e.y-player.y)<650);this.combat+=(Number(busy)-this.combat)*(1-Math.exp(-step*2));
 const angle=player.moveAngle??player.angle??0,moving=player.moving&&!reduced;this.look.lerp(new T.Vector3(moving?Math.cos(angle)*.8:0,0,moving?Math.sin(angle)*.8:0),a);
 // Lead the view into the landscape; keep the feet below centre and above thumb controls.
 this.target.set(player.x*.01-Math.sin(this.yaw)*1.25,.85,player.y*.01-Math.cos(this.yaw)*1.25).add(this.look);
 if(!this.initialized||this.focus.distanceTo(this.target)>15){this.focus.copy(this.target);this.initialized=true;}else this.focus.lerp(this.target,a);
 this.offset.copy(this.baseOffset).multiplyScalar(1+this.combat*.07);this.camera.position.copy(this.focus).add(this.offset);this.camera.lookAt(this.focus);this.camera.updateMatrixWorld();
 }
}
