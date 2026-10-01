import {buildValley} from '../src/valley-world.js';
import {buildAtmosphere} from '../src/landscape-atmosphere.js';
import {LEVEL} from '../src/js/level.js';
import fs from 'node:fs';
import {createBackPauseGuard} from '../src/back-navigation.js';
import assert from 'node:assert/strict';
import * as T from 'three';
import {AdventureCamera,cameraSettings,CAMERA_MODES} from '../src/camera-rig.js';
import {projectedPoint,groundLayer} from '../src/world-visibility.js';
import {SurfaceFX} from '../src/surface-fx.js';
// Portrait and landscape: keep hero and the close combat ring on screen in every supported view.
for(const aspect of [393/852,852/393,16/9])for(const mode of CAMERA_MODES)for(const yaw of [.48,.48+Math.PI/4,.48+Math.PI]){
 const camera=new T.PerspectiveCamera(),focus=new T.Vector3(),offset=new T.Vector3(),rig=new AdventureCamera(camera,focus,offset);rig.configure({aspect,mode,yaw});
 const p={x:-2700,y:1450,angle:0,moving:false};rig.update(p,[],1/60);const q=projectedPoint(camera,aspect*800,800,p.x*.01,1,p.y*.01);assert(q.visible);assert(q.x>aspect*800*.25&&q.x<aspect*800*.75);assert(q.y>240&&q.y<560);
 for(const a of [0,1.57,3.14,4.71]){const point=projectedPoint(camera,aspect*800,800,p.x*.01+Math.cos(a)*3,1,p.y*.01+Math.sin(a)*3);assert(point.visible&&point.x>0&&point.x<aspect*800&&point.y>0&&point.y<800);}
 const before=camera.position.clone();rig.update(p,[],0);assert(camera.position.equals(before));
 p.x+=10000;rig.update(p,[],1/60);assert(focus.distanceTo(rig.target)<.001,'portals must snap, not fly across world');
 const behind=camera.position.clone().add(offset);assert.equal(projectedPoint(camera,800,800,...behind.toArray()).visible,false);
 assert(camera.far>230+offset.length(),'sky dome fits the far plane');
}
// Exponential follow converges similarly at 30/60 fps, avoiding frame-rate dependent camera lag.
function follow(hz){const c=new T.PerspectiveCamera(),f=new T.Vector3(),o=new T.Vector3(),r=new AdventureCamera(c,f,o);r.configure();const p={x:0,y:0,angle:0,moving:false};r.update(p,[],0);p.x=300;for(let i=0;i<hz;i++)r.update(p,[],1/hz);return f;}
assert(follow(30).distanceTo(follow(60))<1e-6);
assert.equal(cameraSettings('invalid').fov,48);assert(cameraSettings('close',1,.48,99).offset.length()<24);
// The entire character cutaway is removed; grass retains only its own movement shader.
const scene=new T.Scene(),surface=new SurfaceFX(scene,[{x:1,z:1,seed:.5}]);
const shader={uniforms:{},vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader};surface.grass.material.onBeforeCompile(shader,{});assert(shader.vertexShader.includes('grassTime'));assert(!shader.fragmentShader.includes('kageCutaway'));
const runtime=fs.readFileSync(new URL('../src/render3d.js',import.meta.url),'utf8');assert(!runtime.includes('installWorldVisibility'));assert(!runtime.includes('worldVisibility.update'));
const a=groundLayer(new T.MeshStandardMaterial(),0),b=groundLayer(new T.MeshStandardMaterial(),1),road=groundLayer(new T.MeshStandardMaterial(),0,'road');assert(a.polygonOffset&&b.polygonOffset);assert(road.polygonOffsetUnits<b.polygonOffsetUnits&&b.polygonOffsetUnits<a.polygonOffsetUnits);
console.log('PASS camera framing, portrait combat, zero-dt stability, portal snaps, behind-camera culling, sky depth, frame-rate independence and world/grass shader composition');

// The touch target is visibly labeled and easy to reach in the persistent HUD.
const page=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8'),css=fs.readFileSync(new URL('../src/style.css',import.meta.url),'utf8');assert.match(page,/<button id=\"pauseButton\" class=\"pause-control\"[^>]*>Ⅱ PAUSE<\/button>/);assert.match(css,/menu-buttons button\.pause-control\{width:auto;min-width:76px/);
assert(css.includes('button:not(#menuButton):not(#pauseButton){display:none}'));assert(!css.includes('button:not(#menuButton){display:none}'));
// A single Back action pauses the run and restores its history sentinel.
const listeners=new Map(),historyEntries=[];const fakeWindow={history:{pushState(...v){historyEntries.push(v);}},addEventListener(k,v){listeners.set(k,v);},removeEventListener(k){listeners.delete(k);}};let running=true,pauses=0;const guard=createBackPauseGuard(fakeWindow,()=>{pauses++;running=false;},()=>true,()=>running);guard.arm();assert.equal(historyEntries.length,1);listeners.get('popstate')();assert.equal(pauses,1);assert.equal(historyEntries.length,2);listeners.get('popstate')();assert.equal(pauses,1);assert.equal(historyEntries.length,3);running=true;listeners.get('popstate')();assert.equal(pauses,2);assert.equal(historyEntries.length,4);guard.dispose();assert(!listeners.has('popstate'));console.log('PASS Android/back navigation pauses active play and retains a safe in-game history entry');

// These playable Chapter II coordinates were buried 4–5 metres under decorative hills.
const valley=new T.Scene();buildValley(valley);buildAtmosphere(valley);valley.updateMatrixWorld(true);
for(const [x,z] of [[65.8,-18.2],[64,0],[66,-17]]){const ray=new T.Raycaster(new T.Vector3(x,15,z),new T.Vector3(0,-1,0));const hit=ray.intersectObjects(valley.children,true).find(h=>h.object.material.side!==T.BackSide);assert(hit,`Missing ground at ${x},${z}`);assert(hit.point.y<.2,`Route buried under scenery at ${x},${z}: ${hit.point.y}`);}
const northEdge=Math.min(...LEVEL.polygons.flat().map(p=>p[1]*.01));
for(const ridge of valley.getObjectByName('background-ridges').children){const bounds=new T.Box3().setFromObject(ridge);assert(bounds.max.z<northEdge-6,'Backdrop must remain outside the entire expanded world');}
console.log('PASS Glassroot and Chapter II routes are clear of backdrop hills; distant ridges stay beyond all playable zones');

// Dense settlement: retain nearby interaction + quest, cap markers and reject overlap/offscreen.
const {selectMarkers}=await import('../src/world-markers.js');
const marker=(id,distance,x,y,target=false)=>({id,distance,pos:{x,y,visible:true},target,label:id,glyph:'!'});
const markers=selectMarkers([marker('near',70,160,300),marker('overlap',85,170,310),marker('quest',700,280,440,true),marker('other',250,60,470),marker('distant',500,120,500),marker('edge',40,8,300)],393,800);
assert.equal(markers.size,3);assert(markers.has('near')&&markers.has('quest'));assert(!markers.has('overlap')&&!markers.has('distant')&&!markers.has('edge'));assert.equal([...markers.values()].filter(m=>m.named).length,1);assert(markers.get('near').named);
assert([...selectMarkers([marker('far',300,160,300)],393,800).values()].every(m=>!m.named));
console.log('PASS settlement marker cap, proximity name, quest priority, overlap and screen-edge exclusion');
