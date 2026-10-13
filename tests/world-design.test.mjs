import assert from 'node:assert/strict';
import * as T from 'three';
import Sim from '../src/js/combat.js';
import {newProfile} from '../src/js/rpg.js';
import {LEVEL,inFloor} from '../src/js/level.js';
import {LANDMARKS,DISCOVERIES,landmarkColliders} from '../src/js/landmark-data.js';
import {WILDERNESS} from '../src/js/wilderness-data.js';
import {tickOpenWorld} from '../src/js/open-world.js';
import {floorDistance,reliefHeight,groundHeight,seaness,WATER_LEVEL} from '../src/world-relief.js';
import {AdventureCamera} from '../src/camera-rig.js';
import {buildDarkWorld} from '../src/dark-world.js';
import {moodAt} from '../src/landscape-atmosphere.js';
{
 for(const r of WILDERNESS){assert(floorDistance(r.x/100,r.y/100)<0,r.name+' centre is on the floor');assert.equal(reliefHeight(r.x/100,r.y/100),-.25,'relief stays under the walkable floor');assert.equal(groundHeight(r.x/100,r.y/100),0);assert(r.tagline);}
 assert(floorDistance(-60,12)>5&&seaness(-60,12)>.9&&reliefHeight(-60,12)<WATER_LEVEL,'Greyshore faces open sea');
 assert(reliefHeight(-14,-40)>6&&reliefHeight(80,-60)>10,'the north rises into ridges');
 for(let x=-100;x<180;x+=7.3)for(let z=-110;z<90;z+=6.1){const h=reliefHeight(x,z);assert(Number.isFinite(h));assert(groundHeight(x,z)>=0);}
 console.log('PASS relief: floor flat and hidden, coasts below sea level, interior edges rise, finite everywhere');
}
{
 const colliders=landmarkColliders();for(const c of colliders)assert(LEVEL.obstacles.some(o=>o.kind==='landmark'&&o.x===c.x&&o.y===c.y));
 const seg=(px,py,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((px-a[0])*dx+(py-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(px-a[0]-dx*t,py-a[1]-dy*t);};
 for(const c of colliders){for(const p of LEVEL.paths)for(let i=1;i<p.length;i++)assert(seg(c.x,c.y,p[i-1],p[i])>c.r+80,'landmark clear of road');for(const g of LEVEL.groups)assert(Math.hypot(c.x-g.x,c.y-g.y)>400);for(const ch of LEVEL.chests)assert(Math.hypot(c.x-ch.x,c.y-ch.y)>c.r+150);}
 for(const l of LANDMARKS)assert(inFloor(l.x,l.y),l.id+' stands on the floor');
 for(const d of DISCOVERIES)assert(inFloor(d.x,d.y),d.id+' viewpoint is walkable');
 console.log('PASS',colliders.length,'landmark colliders clear of roads, camps and chests; discovery viewpoints walkable');
}
{
 const s=new Sim('katana').attachProfile(newProfile('explorer','Explorer','katana'),7,'explore');s.enemies=[];
 Object.assign(s.player,{x:LANDMARKS[0].x+200,y:LANDMARKS[0].y});const xp=s.profile.xp,level=s.profile.level;s.drainEvents();tickOpenWorld(s,0);
 const found=s.drainEvents().filter(e=>e.type==='discovery');assert.deepEqual(found.map(e=>e.kind),['region','landmark']);assert.equal(found[1].id,LANDMARKS[0].id);assert(s.profile.level>level||s.profile.xp>xp);
 tickOpenWorld(s,0);assert.equal(s.drainEvents().filter(e=>e.type==='discovery').length,0,'each discovery pays once');
 const copy=Sim.restore(s.exportState());for(let i=0;i<30;i++){s.update(1/30,{x:1,y:0});copy.update(1/30,{x:1,y:0});}assert.deepEqual(copy.exportState(),s.exportState());
 const sandbox=new Sim('katana',{sandbox:true}).attachProfile(newProfile('sb','Sandbox','katana'),3,'sb');tickOpenWorld(sandbox,0);assert.equal(sandbox.profile.discoveries,undefined);
 console.log('PASS discoveries award XP once per character, replay deterministically and skip the sandbox');
}
{
 const camera=new T.PerspectiveCamera(),rig=new AdventureCamera(camera,new T.Vector3(),new T.Vector3());rig.configure({aspect:16/9});rig.update({x:0,y:0},[],1/60);const flat=camera.position.y;
 rig.ground=()=>30;rig.reset();rig.update({x:0,y:0},[],1/60);assert(camera.position.y>31,'camera clears high ground');rig.ground=()=>0;for(let i=0;i<240;i++)rig.update({x:0,y:0},[],1/30);assert(Math.abs(camera.position.y-flat)<.05,'camera settles back down');
 const a=moodAt(-2750,1350),b=moodAt(8850,0);assert(b.rise>a.rise&&b.fog.r>b.fog.b&&moodAt(8250,-2950).fall>.5);
 console.log('PASS camera lifts over ridges and settles; region moods blend weather and fog');
}
{
 const scene=new T.Scene(),world=buildDarkWorld(scene);for(const name of ['relief-chunk','animated-sea','road-ribbons','scenery-chunk','glow-chunk'])assert(scene.getObjectByName(name),name);
 for(let t=0;t<3;t+=.5)world.update(t);scene.traverse(o=>{if(o.isMesh)assert(o.geometry.attributes.position.array.every(Number.isFinite),o.name);});
 console.log('PASS world scene builds relief, sea, roads, scenery and animated landmarks');
}
