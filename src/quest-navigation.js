import {LEVEL,inFloor} from './js/level.js';
import {currentStory} from './js/story.js';
import {HUNTS,hunterState} from './js/hunt-data.js';
import {huntObjective} from './js/hunters.js';
import {departurePortal} from './js/world-portals.js';
const STEP=45,cache=new Map(),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// Only an explicitly chosen destination or an active fight is tracked.
export const campaignComplete=()=>false;
export const expeditionGoal=()=>null;
export function questGoal(sim){const h=sim.huntRun&&!sim.huntRun.completed?huntObjective(sim):null;return h?{...h,radius:150}:null;}
export function walkable(sim,x,y){
 const key=x+','+y;let valid=cache.get(key);
 if(valid===undefined){valid=inFloor(x,y,24)&&!LEVEL.obstacles.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+28);if(cache.size<100000)cache.set(key,valid);}
 return valid&&!LEVEL.gates.some(g=>!sim.bossesDefeated.includes(g.boss)&&x>g.x1-25&&x<g.x2+25&&y>g.y1-25&&y<g.y2+25);
}
export function clearSegment(sim,a,b){const n=Math.ceil(distance(a,b)/15);for(let i=1;i<=n;i++)if(!walkable(sim,a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n))return false;return true;}
export function findQuestPath(sim,goal){
 const start=sim.player;if(distance(start,goal)<=goal.radius)return [];
 const seeds=[];for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){const p={x:(Math.round(start.x/STEP)+dx)*STEP,y:(Math.round(start.y/STEP)+dy)*STEP};if(walkable(sim,p.x,p.y)&&clearSegment(sim,start,p))seeds.push(p);}
 seeds.sort((a,b)=>distance(a,start)-distance(b,start));if(!seeds.length)return null;
 // A* visits the route corridor instead of flooding every region of the continent.
 const root=seeds[0],queue=[],seen=new Map([[root.x+','+root.y,null]]),scores=new Map([[root.x+','+root.y,0]]);let end=null;
 const push=n=>{queue.push(n);let i=queue.length-1;while(i){const j=(i-1)>>1;if(queue[j].f<=n.f)break;queue[i]=queue[j];i=j;}queue[i]=n;};
 const pop=()=>{const first=queue[0],last=queue.pop();if(queue.length){let i=0;while(i*2+1<queue.length){let j=i*2+1;if(j+1<queue.length&&queue[j+1].f<queue[j].f)j++;if(queue[j].f>=last.f)break;queue[i]=queue[j];i=j;}queue[i]=last;}return first;};
 push({...root,g:0,f:distance(root,goal)});
 for(let i=0;queue.length&&i<65000;i++){
  const p=pop(),key=p.x+','+p.y;if(p.g!==scores.get(key))continue;
  if(distance(p,goal)<=goal.radius){end=p;break;}
  for(const [dx,dy] of [[STEP,0],[-STEP,0],[0,STEP],[0,-STEP],[STEP,STEP],[STEP,-STEP],[-STEP,STEP],[-STEP,-STEP]]){
   const next={x:p.x+dx,y:p.y+dy},k=next.x+','+next.y,g=p.g+Math.hypot(dx,dy);
   if(g<(scores.get(k)??Infinity)&&walkable(sim,next.x,next.y)&&clearSegment(sim,p,next)){
    scores.set(k,g);seen.set(k,p);push({...next,g,f:g+distance(next,goal)});
   }
  }
 }
 if(!end)return null;const path=[];for(let p=end;p;p=seen.get(p.x+','+p.y))path.push(p);path.reverse();
 const smooth=[];let from=start;for(let i=0;i<path.length;){let j=i;while(j+1<path.length&&clearSegment(sim,from,path[j+1]))j++;smooth.push(path[j]);from=path[j];i=j+1;}return smooth;
}
export class QuestWalker{
 constructor(notify=()=>{}){this.notify=notify;this.cancel();}
 cancel(){this.path=null;this.goal=null;this.customGoal=null;this.stalled=0;this.last=null;}
 start(sim,destination=null){this.cancel();this.customGoal=destination;const goal=destination||questGoal(sim);if(!goal){this.notify('No active quest objective. Open the journal for available quests.');return false;}const path=findQuestPath(sim,goal);if(!path){this.notify('Route blocked. Clear the gate guards or check your quest journal.');return false;}if(!path.length){this.notify('At the objective · use Talk / Examine, or clear the guards.');return false;}this.path=path;this.goal=goal;sim.player.lootTarget=null;this.notify('Auto-walk started · move or attack to stop');return true;}
 step(sim,dt){if(!this.path)return {x:0,y:0};const goal=this.customGoal||questGoal(sim),p=sim.player;if(p.dead||!goal){this.cancel();return {x:0,y:0};}if(goal.navKey?goal.navKey!==this.goal.navKey:goal.x!==this.goal.x||goal.y!==this.goal.y){if(!this.start(sim))return {x:0,y:0};}
 if(goal.movingTarget&&distance(goal,this.goal)>75){const path=findQuestPath(sim,goal);if(!path?.length){this.cancel();return {x:0,y:0};}this.path=path;this.goal=goal;this.stalled=0;}
 if(distance(p,goal)<=goal.radius+5){this.cancel();this.notify('Objective reached · Talk / Examine, or clear the guards.');return {x:0,y:0};}
 if(this.last&&distance(p,this.last)<.2)this.stalled+=dt;else this.stalled=0;this.last={x:p.x,y:p.y};
 if(this.stalled>1.5){this.cancel();this.notify('Auto-walk stopped · path obstructed');return {x:0,y:0};}
 while(this.path.length>1&&distance(p,this.path[0])<20)this.path.shift();const next=this.path[0],d=distance(p,next);if(!clearSegment(sim,p,next)){this.cancel();this.notify('Auto-walk stopped · tap the quest to find a new route');return {x:0,y:0};}return {x:(next.x-p.x)/Math.max(d,20),y:(next.y-p.y)/Math.max(d,20)};
 }
}
