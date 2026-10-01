import {HUNT_BY_ID} from './hunt-data.js';
// Destinations are ordinary ground positions, never teleport endpoints.
export const REGION_DESTINATIONS=[
 {id:'harbor',name:'Greyshore',x:-2700,y:1450,level:'1–3'},
 {id:'mill',name:'Old Mill Lowlands',x:1130,y:-470,level:'3–6'},
 {id:'saffron',name:'Saffron Frontier',x:4650,y:700,level:'10–12'},
 {id:'glassroot',name:'Glassroot Ravine',x:6940,y:-1510,level:'12–14'},
 {id:'whitewind',name:'Whitewind Pass',x:8240,y:-3030,level:'14–16'},
 {id:'cinderwash',name:'Cinderwash Basin',x:8500,y:-810,level:'14–16'},
 {id:'brasswater',name:'Brasswater Fortress',x:9440,y:-2520,level:'18–20'}
];
export const regionDestination=id=>{const h=Object.hasOwn(HUNT_BY_ID,id)?HUNT_BY_ID[id]:null,r=REGION_DESTINATIONS.find(r=>r.id===id)||(h?{id,name:h.name,...h.entry}:null);return r?{...r,radius:150,detail:'TRAVELLING · '+r.name}:null;};
