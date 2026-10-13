import {wildernessRegion} from './js/wilderness-data.js';
// Cinematic region and boss titles. A region card waits until the player has settled across a border,
// so skirting a boundary never flickers, and the same region stays quiet for two minutes.
export function createTitleCards(root,chime=()=>{}){
 const card=document.createElement('div');card.id='regionCard';card.setAttribute('aria-live','polite');root.append(card);
 let current=null,pending=null,held=0,clock=0,busyUntil=0;const shownAt={},rewards={};
 function show(kind,eyebrow,title,line,detail,tone=''){
  const parts=[['small',eyebrow],['strong',title],['em',line],['span',detail]].filter(p=>p[1]).map(([tag,text])=>{const n=document.createElement(tag);n.textContent=text;return n;});
  if(tone)parts[parts.length-1].className=tone;card.className='';void card.offsetWidth;card.replaceChildren(...parts);card.className='show '+kind;chime(kind==='boss');
 }
 return {
  update(dt,sim,running){
   clock+=dt;if(!sim.profile||!running||clock<busyUntil)return;const r=wildernessRegion(sim.player.x,sim.player.y);
   if(r.id===current){pending=null;return;}if(pending!==r.id){pending=r.id;held=0;}held+=dt;if(held<1.1)return;
   current=r.id;pending=null;const xp=rewards[r.id];delete rewards[r.id];if(!xp&&clock-(shownAt[r.id]??-1e9)<120)return;shownAt[r.id]=clock;
   const gap=r.level-sim.profile.level,tone=gap>=5?'deadly':gap>=2?'dangerous':'';
   show('region',xp?'REGION DISCOVERED · +'+xp+' XP':'ENTERING',r.name,r.tagline,'ENEMY LEVEL '+r.level+(tone==='deadly'?' · DEADLY':tone?' · DANGEROUS':gap<=-5?' · SAFE':''),tone);
  },
  // The simulation awards the discovery; the card announces it once the player settles in.
  discovered(id,xp){rewards[id]=xp;},
  landmark(name,xp,region){if(clock<busyUntil)return false;show('landmark','LANDMARK DISCOVERED',name,region,'+'+xp+' XP');busyUntil=clock+4;return true;},
  boss(name,level,title){show('boss','A CHAMPION STIRS',name,title,'BOSS · LEVEL '+level,'deadly');busyUntil=clock+4.6;},
  reset(){current=null;pending=null;held=0;},
 };
}
