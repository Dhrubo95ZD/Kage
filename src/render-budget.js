// Cosmetic visibility only: never remove loot or enemies from the simulation.
export function nearbyRenderIds(items,player,existing=new Map(),enter=1800,leave=2200){
 const ids=new Set();for(const item of items){const limit=existing.has(item.id)?leave:enter;if((item.x-player.x)**2+(item.y-player.y)**2<=limit*limit)ids.add(item.id);}return ids;
}
export function renderBudget(mobile,performance){return {pixelRatio:performance?1:mobile?1.25:1.5,shadowSize:mobile?1024:2048,postprocessing:!performance&&!mobile};}
