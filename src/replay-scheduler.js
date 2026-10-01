import {applyCommands} from './js/commands.js';
// The queue remains live while saving: include inputs appended during each yield.
// Commit in the final slice so no newly queued input can be lost at the swap.
export async function replayWithoutBlocking(sim,queue,commit,{now=()=>performance.now(),yieldFrame=()=>new Promise(resolve=>setTimeout(resolve,0)),budget=4}={}){
 let cursor=0;
 while(cursor<queue.length){const start=now();do{applyCommands(sim,[queue[cursor++]]);}while(cursor<queue.length&&now()-start<budget);
 if(cursor<queue.length)await yieldFrame();
 }
 commit(sim);
}
