import {PEOPLE,currentStory,personPresent} from './js/story.js';
import {HUNTS} from './js/hunt-data.js';
// One shared budget for NPCs, scenery interactions and hunt entrances.
export function selectMarkers(candidates,width,height){
 const visible=candidates.filter(c=>c.distance<(c.target?800:450)&&c.pos.visible!==false&&c.pos.x>24&&c.pos.x<width-24&&c.pos.y>115&&c.pos.y<height-160);
 const nearest=visible.filter(c=>c.distance<230).sort((a,b)=>a.distance-b.distance)[0];
 visible.sort((a,b)=>Number(b===nearest)-Number(a===nearest)||Number(b.target)-Number(a.target)||a.distance-b.distance);
 const chosen=new Map();for(const c of visible){if(chosen.size===3)break;if([...chosen.values()].some(p=>Math.abs(p.pos.x-c.pos.x)<48&&Math.abs(p.pos.y-c.pos.y)<58))continue;chosen.set(c.id,{...c,named:c===nearest});}return chosen;
}
export function planWorldMarkers(renderer,sim){const current=currentStory(sim.profile),candidates=[];
 for(const n of PEOPLE){if(!personPresent(sim.profile,n))continue;candidates.push({id:'npc:'+n.id,label:n.name.split(' · ')[0],glyph:current?.target.id===n.id?'!':n.kind?'◇':'···',target:current?.target.id===n.id,distance:Math.hypot(n.x-sim.player.x,n.y-sim.player.y),pos:renderer.screenPosition(n.x*.01,n.kind?1.1:2.2,n.y*.01)});}
 for(const h of HUNTS)for(const kind of ['entry','objective']){if(kind==='objective'&&!(sim.huntRun?.id===h.id&&sim.huntRun.objectiveReady))continue;const p=kind==='entry'?h.entry:h.stages[1];candidates.push({id:'hunt:'+h.id+kind,label:kind==='entry'?h.name:h.action,glyph:kind==='entry'?'↗':'!',target:kind==='objective',distance:Math.hypot(p.x-sim.player.x,p.y-sim.player.y),pos:renderer.screenPosition(p.x*.01,1.8,p.y*.01)});}
 return selectMarkers(candidates,renderer.width,renderer.height);
}
export function paintMarker(node,spec,baseClass,accessibleName){node.hidden=!spec;node.style.display=spec?'grid':'none';if(!spec)return;
 node.className=baseClass+' world-marker'+(spec.target?' quest-target':'')+(spec.named?' named':'');node.setAttribute?.('aria-label',accessibleName);node.style.transform=`translate(${spec.pos.x}px,${spec.pos.y}px)`;
 const key=spec.glyph+'|'+(spec.named?spec.label:'');if(node._markerKey===key)return;node._markerKey=key;node.textContent='';const glyph=document.createElement('span');glyph.className='world-marker-glyph';glyph.textContent=spec.glyph;glyph.setAttribute?.('aria-hidden','true');node.append(glyph);if(spec.named){const name=document.createElement('span');name.className='world-marker-name';name.textContent=spec.label;node.append(name);}
}
