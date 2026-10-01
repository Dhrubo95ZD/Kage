import assert from 'node:assert/strict';
import * as T from 'three';
import {syncChests} from '../src/chest-renderer.js';
import {LEVEL} from '../src/js/level.js';
const reward={id:'hunt-cache-987',name:'Crystal Ravine reward chest',x:4900,y:-2220,opened:false};
const oldMap=new Map(LEVEL.chests.map(c=>[c.id,new T.Group()]));assert.throws(()=>{oldMap.get(reward.id).rotation.x=0;},/rotation/);
const scene=new T.Scene(),objects=new Map();syncChests(scene,objects,LEVEL.chests,0);const chests=[...LEVEL.chests,reward];assert.doesNotThrow(()=>syncChests(scene,objects,chests,5));assert(objects.has(reward.id));assert.equal(Math.abs(objects.get(reward.id).rotation.x),0);
reward.opened=true;reward.openTime=5;syncChests(scene,objects,chests,5.4);assert(objects.get(reward.id).rotation.x<0);syncChests(scene,objects,chests,6);assert.equal(objects.get(reward.id).rotation.x,-1.9);
// A resumed save must build the reward model on its very first frame.
const restored=JSON.parse(JSON.stringify(chests)),newScene=new T.Scene(),newObjects=new Map();syncChests(newScene,newObjects,restored,10);assert.equal(newObjects.get(reward.id).rotation.x,-1.9);delete restored.at(-1).openTime;syncChests(newScene,newObjects,restored,10);assert(Number.isFinite(newObjects.get(reward.id).rotation.x));
const root=objects.get(reward.id).parent;syncChests(scene,objects,LEVEL.chests,10);assert(!objects.has(reward.id));assert.equal(root.parent,null);
console.log('PASS reproduced missing reward-lid rotation crash; runtime chest creation, save restoration, lid animation and cleanup');
