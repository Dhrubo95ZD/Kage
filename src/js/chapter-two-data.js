export const CARAVAN_START={x:4650,y:700};
export const CARAVAN_POLYGONS=[
 [[3100,-1100],[3100,-1500],[4350,-1300],[4900,-600],[4740,100],[4370,50],[4110,-840]],
 [[4050,-100],[4750,-650],[5600,-450],[6100,150],[5960,1160],[5130,1580],[4330,1340],[4000,600]],
 [[5530,-160],[6100,-850],[6970,-900],[7600,-220],[7420,870],[6810,1330],[5940,1120]],
 [[6200,-730],[6050,-1580],[6480,-2380],[7210,-2570],[7700,-1920],[7620,-950],[7060,-590]],
 [[7240,-1960],[7660,-2720],[8070,-3530],[8840,-3650],[9310,-2960],[8990,-2190],[8230,-1820]],
 [[7370,-1500],[7890,-1210],[8110,-440],[8560,-350],[8910,-1010],[8710,-1740],[8180,-1980]],
 [[8780,-2930],[9380,-3410],[9960,-3130],[10300,-2340],[10090,-1590],[9430,-1400],[8800,-1940]]
];
export const CARAVAN_ROOMS=[
 {id:'caravan',name:'Saffron Caravanserai',x1:3980,x2:6030,y1:-650,y2:1600},
 {id:'terraces',name:'Amberstep Terraces',x1:5900,x2:7600,y1:-920,y2:1380},
 {id:'glasswood',name:'Glassroot Ravine',x1:6020,x2:7750,y1:-2600,y2:-920},
 {id:'snowpass',name:'Whitewind Pass',x1:7600,x2:9330,y1:-3670,y2:-1900},
 {id:'cinder',name:'Cinderwash Basin',x1:7710,x2:8930,y1:-1900,y2:-300},
 {id:'citadel',name:'The Brasswater Fortress',x1:9130,x2:10400,y1:-3450,y2:-1380}
];
export const CARAVAN_PATHS=[[[3300,-1270],[4220,-1050],[4580,-340],[4670,650],[5230,760],[6050,610],[6620,340],[6890,-390],[6940,-1510],[7040,-2170],[7810,-2340],[8240,-3030],[8780,-2770],[9440,-2520],[9760,-2360]],[[6980,-1270],[7770,-1420],[8170,-930],[8500,-810],[8550,-1560],[8850,-2150],[9440,-2520]]];
export const CARAVAN_BUILDINGS=[
 {x:4320,y:680,w:330,d:270,type:'inn',color:'#b86645'},{x:4520,y:1190,w:350,d:280,type:'market',color:'#9a8351'},
 {x:5300,y:1240,w:370,d:250,type:'workshop',color:'#5d8292'},{x:5550,y:160,w:310,d:260,type:'house',color:'#b87754'},
 {x:5060,y:-210,w:420,d:300,type:'caravan',color:'#cb9a55'},{x:5800,y:750,w:220,d:180,type:'store',color:'#688a79'}
];
const group=(id,x,y,types)=>({id,x,y,aggro:570,chapter:2,units:types.map((type,i)=>[type,(i%3-1)*120,Math.floor(i/3)*135-70])});
export const CARAVAN_GROUPS=[
 group('c2-road',6280,550,['shieldguard','scout','archer','raider','raider']),
 group('c2-wreck',6890,250,['ridgebeast','ridgebeast','raider','scout']),
 group('c2-warden',6990,-680,['warden','shieldguard','archer','raider']),
 group('c2-glass',6580,-1500,['spider','spider','spider','ridgebeast']),
 group('c2-nest',7060,-2150,['matriarch','spider','spider']),
 group('c2-snow',8080,-2900,['ridgebeast','ridgebeast','scout','archer','shieldguard']),
 group('c2-rescue',8720,-2770,['shieldguard','archer','scout','raider','raider']),
 group('c2-cinder',8190,-990,['golem','golem','spider']),
 group('c2-forge',8560,-1580,['golem','ridgebeast','spider','spider']),
 group('c2-fort',9440,-2630,['shieldguard','shieldguard','archer','scout','raider']),
 group('c2-colossus',9810,-2140,['colossus','golem','shieldguard'])
];
export const CARAVAN_CHESTS=[
 {id:'c2-terrace-cache',name:'Terrace courier chest',x:7130,y:650,guards:'c2-wreck',gold:180,heal:75,upgrade:'none'},
 {id:'c2-warden-cache',name:'Marshal supply vault',x:7330,y:-800,guards:'c2-warden',gold:200,heal:90,upgrade:'none'},
 {id:'c2-glass-cache',name:'Glassroot survey chest',x:7340,y:-2240,guards:'c2-nest',gold:240,heal:100,upgrade:'none'},
 {id:'c2-cinder-cache',name:'Smelter stores',x:8500,y:-600,guards:'c2-cinder',gold:260,heal:100,upgrade:'none'},
 {id:'c2-fort-cache',name:'Brasswater treasury',x:10060,y:-2440,guards:'c2-colossus',gold:400,heal:160,upgrade:'none'}
];
export const CARAVAN_PEOPLE=[
 {id:'c2-lina',name:'Lina · Caravanserai',role:'A missing caravan',x:4820,y:770,color:'#668eab'},
 {id:'c2-salma',name:'Salma',role:'Caravan quartermaster',x:5250,y:620,color:'#bc9460'},
 {id:'c2-wreck',name:'The broken caravan',role:'Search the abandoned wagons',x:6850,y:480,kind:'supplies',guards:'c2-wreck'},
 {id:'c2-orders',name:'Marshal’s dispatch case',role:'Read the sealed orders',x:7180,y:-760,kind:'supplies',guards:'c2-warden'},
 {id:'c2-surveyor',name:'Surveyor Idris',role:'A witness in Glassroot',x:7250,y:-2030,color:'#c7a16a',guards:'c2-nest'},
 {id:'c2-rescued',name:'Yusuf',role:'Lina’s father · caravan engineer',x:8840,y:-2750,color:'#85958c',guards:'c2-rescue'},
 {id:'c2-forge',name:'Pressure release valve',role:'Disable the fortress furnace feed',x:8580,y:-1620,kind:'wheel',guards:'c2-forge'},
 {id:'c2-ledger',name:'The ration ledger',role:'Evidence inside Brasswater',x:9920,y:-2440,kind:'supplies',guards:'c2-colossus'},
 {id:'c2-home',name:'Lina & Yusuf',role:'A place at the family table',x:5130,y:850,color:'#668eab'},
 {id:'c2-trainer',name:'Captain Maryam',role:'Discipline instructor',x:5450,y:920,color:'#9b875d'}
];
