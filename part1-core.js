'use strict';
/* IRONLINE // Core utilities, configuration, audio, settings and save data */
/* ========== UTILS ========== */
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rand=(a=0,b=1)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const dist2=(ax,az,bx,bz)=>Math.hypot(ax-bx,az-bz);
const angleLerp=(a,b,t)=>{let d=((b-a+Math.PI)%(Math.PI*2))-Math.PI;if(d<-Math.PI)d+=Math.PI*2;return a+d*t;};
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
function formatNum(n){
  if(!isFinite(n)||n<0)return '0';
  if(n>=1e6)return (n/1e6).toFixed(1).replace(/\.0$/,'')+'M';
  if(n>=1e3)return (n/1e3).toFixed(1).replace(/\.0$/,'')+'k';
  return String(Math.floor(n));
}
let tutorialStep=0;

/* ========== SHARED GEOMETRY ========== */
const GEO={
  box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(.5,.5,1,16),
  cyl6:new THREE.CylinderGeometry(.5,.5,1,6),cyl8:new THREE.CylinderGeometry(.5,.5,1,8),
  cyl16:new THREE.CylinderGeometry(.5,.5,1,16),cone:new THREE.ConeGeometry(.5,1,12),
  cone4:new THREE.ConeGeometry(.5,1,4),sphere:new THREE.SphereGeometry(.5,16,12),
  sphereLow:new THREE.SphereGeometry(.5,10,8),sphereTiny:new THREE.SphereGeometry(.5,8,6),
  capsule:new THREE.CapsuleGeometry(.5,1,5,10),ico:new THREE.IcosahedronGeometry(.5,0),
  ico1:new THREE.IcosahedronGeometry(.5,1),octa:new THREE.OctahedronGeometry(.5,0),
  tetra:new THREE.TetrahedronGeometry(.5,0),ring:new THREE.RingGeometry(.5,.6,48),
  plane:new THREE.PlaneGeometry(1,1),torus:new THREE.TorusGeometry(.5,.07,8,32),
  torusThin:new THREE.TorusGeometry(.5,.03,6,28)
};
const _matCache=new Map();
function M(color,opts={}){const key=color+'|'+JSON.stringify(opts);
  if(!_matCache.has(key))_matCache.set(key,new THREE.MeshStandardMaterial({color,roughness:.58,metalness:.5,...opts}));
  return _matCache.get(key);}
const COL={
  dark:M(0x151b22),black:M(0x080c10),metal:M(0x44515e,{metalness:.82,roughness:.32}),
  metalDark:M(0x2a343e,{metalness:.8,roughness:.38}),metalLight:M(0x5a6a78,{metalness:.75,roughness:.35}),
  rubber:M(0x101418,{roughness:.96,metalness:.05}),rubberLight:M(0x202830,{roughness:.9,metalness:.1}),
  glass:M(0x0a2230,{metalness:.9,roughness:.08,emissive:0x1a5a78,emissiveIntensity:.7}),
  glassDark:M(0x061218,{metalness:.9,roughness:.05,emissive:0x0a3a55,emissiveIntensity:.5}),
  red:M(0xd43a28,{emissive:0xff1a00,emissiveIntensity:.55}),orange:M(0xff7a2f,{emissive:0xff3a00,emissiveIntensity:.45}),
  cyan:M(0x5ee7ff,{emissive:0x2bc7ff,emissiveIntensity:1.1}),cyanDim:M(0x2a7f99,{emissive:0x1a5f7a,emissiveIntensity:.6}),
  white:M(0xdfeef5),gold:M(0xffd166,{emissive:0xff9a00,emissiveIntensity:.35}),
  yellow:M(0xffcc33,{emissive:0xffaa00,emissiveIntensity:.3}),purple:M(0xb388ff,{emissive:0x7a3cff,emissiveIntensity:.7}),
  green:M(0x5effc2,{emissive:0x1aff9a,emissiveIntensity:.55}),
  player:M(0x364b54),playerLight:M(0x4a5f6a),enemy:M(0x4a3028),
  robot:M(0x222830,{metalness:.75,roughness:.4}),robotLight:M(0x3a424e,{metalness:.7,roughness:.42}),
  hazard:M(0xffcc00,{emissive:0xffaa00,emissiveIntensity:.25})
};
function mm(parent,geo,mat,p=[0,0,0],s=[1,1,1],r=[0,0,0]){
  const m=new THREE.Mesh(geo,mat);m.position.set(...p);m.scale.set(...s);m.rotation.set(...r);
  parent.add(m);return m;}
function muzzleAnchor(parent,p=[0,0,0]){
  const a=new THREE.Object3D();a.position.set(...p);a.name='PROJECTILE_MUZZLE';parent.add(a);return a;}
function wheel(parent,x,z,r=.3,w=.18){
  mm(parent,GEO.cyl,COL.rubber,[x,r,z],[r*2,w,r*2],[0,0,Math.PI/2]);
  mm(parent,GEO.cyl,COL.metalLight,[x,r,z],[r*.7,w*1.06,r*.7],[0,0,Math.PI/2]);
  mm(parent,GEO.box,COL.metalDark,[x,r,z],[r*1.3,r*.1,r*.1]);}

/* ========== MODEL FACTORY ========== */
const MAPS=[
  {id:'harbor',name:'NEON HARBOR',sub:'PORT AUTHORITY // SECTOR 07',accent:'#5ee7ff',
    ground:'#15222c',fog:'#0b1720',sky:0x18485a,hemi:0x396b87,weather:'rain',
    modifier:'Coastal rain. Reduced visibility. Multiple approach vectors detected.',
    music:{root:55,tempo:96},deco:'harbor',
    routes:[
      {path:[[-22,-15],[-8,-15],[-8,4],[7,4],[7,-11],[19,-11],[19,15]],
       air:[[-24,-20],[-10,-2],[5,6],[19,15]]},
      {path:[[-15,-22],[-15,-8],[-4,-8],[-4,6],[10,6],[10,-2],[19,-2],[19,15]],
       air:[[-20,-24],[-6,-6],[8,2],[19,15]]},
      {path:[[-8,22],[-8,10],[3,10],[3,18],[12,18],[12,4],[19,4],[19,15]],
       air:[[-12,24],[-2,8],[10,4],[19,15]]}
    ]},
  {id:'desert',name:'DESERT SIEGE',sub:'OIL FIELD // GRID 14',accent:'#ffb347',
    ground:'#2a2118',fog:'#2a1a0c',sky:0x6a3a1a,hemi:0x7a4a2a,weather:'sand',
    modifier:'Sandstorms reduce tower range. Multiple oil roads converge on the field HQ.',
    music:{root:49,tempo:104},deco:'desert',
    routes:[
      {path:[[-22,6],[-11,6],[-11,-13],[2,-13],[2,9],[13,9],[13,-5],[21,-5]],
       air:[[-24,0],[-8,-4],[6,2],[21,-5]]},
      {path:[[-4,22],[-4,14],[8,14],[8,4],[16,4],[16,-5],[21,-5]],
       air:[[0,24],[-2,8],[8,6],[21,-5]]},
      {path:[[10,-22],[10,-10],[-2,-10],[-2,4],[6,4],[6,10],[15,10],[15,-5],[21,-5]],
       air:[[12,-24],[8,-8],[14,0],[21,-5]]}
    ]},
  {id:'arctic',name:'ARCTIC OUTPOST',sub:'RESEARCH STATION // 82°N',accent:'#9ad8ff',
    ground:'#1a2830',fog:'#0c1a22',sky:0x7ab8d8,hemi:0x4a7a9a,weather:'snow',
    modifier:'Blizzard slows ground units. Ice corridors route around the station.',
    music:{root:45,tempo:84},deco:'arctic',
    routes:[
      {path:[[-20,-17],[-4,-17],[-4,1],[-16,1],[-16,15],[4,15],[4,-5],[18,-5],[18,17]],
       air:[[-24,-12],[-6,-6],[6,4],[18,17]]},
      {path:[[-10,-22],[-10,-10],[8,-10],[8,6],[0,6],[0,-2],[14,-2],[14,10],[18,10],[18,17]],
       air:[[-14,-24],[-4,-4],[6,0],[18,17]]},
      {path:[[-12,22],[-12,12],[6,12],[6,22],[14,22],[14,4],[18,4],[18,17]],
       air:[[-8,24],[4,12],[10,6],[18,17]]}
    ]},
  {id:'cyber',name:'CYBER NEXUS',sub:'AUTONOMOUS ZONE // CORE 01',accent:'#c77dff',
    ground:'#140f20',fog:'#0a0614',sky:0x3a1a5a,hemi:0x5a2a7a,weather:'embers',
    modifier:'Hostile units carry regenerating energy shields. Lasers pierce shields.',
    music:{root:41,tempo:118},deco:'cyber',
    routes:[
      {path:[[-20,13],[-20,-3],[-6,-3],[-6,13],[7,13],[7,-13],[20,-13],[20,3]],
       air:[[-24,10],[-8,4],[6,-4],[20,3]]},
      {path:[[-8,-22],[-8,-8],[3,-8],[3,7],[13,7],[13,-3],[20,-3],[20,3]],
       air:[[-6,-24],[0,-4],[8,2],[20,3]]},
      {path:[[6,22],[6,10],[-4,10],[-4,2],[10,2],[10,14],[16,14],[16,3],[20,3]],
       air:[[8,24],[4,8],[12,4],[20,3]]}
    ]}
];

(function extendRoutes(){ // prepend an off-screen lead-in so units arrive along the road instead of popping in
  const ext=(pts,d)=>{const a=pts[0],b=pts[1],dx=a[0]-b[0],dz=a[1]-b[1],l=Math.hypot(dx,dz)||1;return [[a[0]+dx/l*d,a[1]+dz/l*d],...pts];};
  for(const m of MAPS)for(const r of m.routes){r.path=ext(r.path,18);r.air=ext(r.air,22);}
})();
const TOWER_ORDER=['gunner','cannon','missile','laser','tesla'];
const TOWER_TYPES={
  gunner:{name:'GUNNER',desc:'Rapid single-target fire. Ground only.',cost:90,range:7.5,rate:3.1,damage:8,air:false,color:'#5ee7ff'},
  cannon:{name:'CANNON',desc:'Heavy splash damage. Ground only.',cost:170,range:9,rate:.55,damage:60,splash:3,air:false,color:'#ffb347'},
  missile:{name:'MISSILE',desc:'Homing rockets. Air & ground.',cost:230,range:12,rate:.7,damage:55,air:true,color:'#ff6b6b'},
  laser:{name:'LASER',desc:'Continuous beam. Pierces shields.',cost:280,range:10,rate:0,dps:52,air:true,color:'#b388ff'},
  tesla:{name:'TESLA',desc:'Chain lightning. Stuns targets.',cost:320,range:6.5,rate:.6,damage:30,chain:4,air:true,color:'#5effc2'}
};
// Central tuning table: everything that decides how hard and how generous a mission is.
const BALANCE={hpPerWave:.025,countPerWave:.13,start:[200,6],wb:[20,4],kill:.8,base:[4.8,.34]};
// In-mission upgrade costs remain separate from permanent Armory research costs.
const UPGRADE_BASE={gunner:80,cannon:100,missile:125,laser:160,tesla:200};
const ARMORY_BASE_COST={gunner:45,cannon:60,missile:80,laser:100,tesla:115};
const ARMORY_RATIO=[1,1.65,2.4,3.35,4.55];
const upgradeCostFor=(type,t)=>Math.round(ARMORY_BASE_COST[type]*ARMORY_RATIO[t]/5)*5;
const UPGRADE_TIERS=5;
const ARMORY_TIER_MISSION_OFFSETS=[2,5,9,14,20];
const LEVELS_PER_STAGE=20, ENDLESS_LEVEL=99;
// Campaign index G = stageIndex*20 + level. Towers become buildable at the listed mission.
const TOWER_UNLOCKS={gunner:1,cannon:3,missile:9,laser:13,tesla:17};
const PLOT_COUNT={harbor:16,desert:16,arctic:13,cyber:16};
function armoryTierMissionRequirement(type,tier=0){
  return (TOWER_UNLOCKS[type]||1)+(ARMORY_TIER_MISSION_OFFSETS[tier]??ARMORY_TIER_MISSION_OFFSETS[ARMORY_TIER_MISSION_OFFSETS.length-1]);
}
function campaignMissionLabel(index){
  const stage=Math.floor((index-1)/LEVELS_PER_STAGE)+1;
  const level=((index-1)%LEVELS_PER_STAGE)+1;
  return stage===1?'MISSION '+String(level).padStart(2,'0'):'THEATER '+String(stage).padStart(2,'0')+' · MISSION '+String(level).padStart(2,'0');
}
const ENEMY_UNLOCK={infantry:1,technical:2,apc:4,tank:7,drone:11,heli:9,jet:13,robot:31,heavy:55};
// Air enemies only appear once Missile (G9) exists, so every wave stays answerable with the towers unlocked.
const STAGE_PROFILE=[
  {name:'BALANCED',credit:1,reward:1,bonus:1,count:1,hp:1,cap:0},
  {name:'WAR CHEST',credit:1.7,reward:1.3,bonus:1.7,count:1.3,hp:1.12,cap:0},
  {name:'LEAN OPS',credit:.85,reward:.95,bonus:.9,count:.85,hp:.92,cap:8},
  {name:'ELITE',credit:1.35,reward:1.15,bonus:1.3,count:1.2,hp:1.15,cap:0}];
const START_CREDITS=[
  // ─── HARBOR (M1-M20) ───
  170, 240, 200, 250, 300, 230, 400, 250, 280, 350,
  300, 550, 320, 340, 450, 380, 650, 420, 430, 550,
  // ─── DESERT (M1-M20) ───
  220, 380, 260, 300, 360, 310, 500, 320, 340, 450,
  400, 700, 430, 400, 580, 500, 850, 560, 540, 720,
  // ─── ARCTIC (M1-M20) ───
  200, 340, 230, 270, 320, 280, 450, 290, 310, 400,
  350, 600, 380, 370, 500, 450, 750, 500, 470, 640,
  // ─── CYBER (M1-M20) ───
  240, 400, 270, 310, 380, 330, 520, 350, 370, 480,
  420, 720, 460, 430, 620, 520, 900, 600, 560, 780
];
const ROUTE_TABLE=[[0],[1],[2],[0],[1],[0,1],[0,2],[1,2],[0,1],[0,2],[0,1,2],[1,2],[0,1],[0,2],[0,1,2],[1,2],[0,1],[0,1,2],[0,2],[0,1,2]];
const TURN={gunner:{rate:9,tol:.14},cannon:{rate:4.5,tol:.09},missile:{rate:6,tol:.25},laser:{rate:7,tol:9},tesla:{rate:8,tol:9}};
const gIndex=(s,l)=>s*LEVELS_PER_STAGE+l;
const towerMaxLevel=(type,tier=Progress.data.upgrades[type]||0)=>2+(tier>=2?1:0)+(tier>=4?1:0);
function towerUnlockedInCampaign(type){const L=TOWER_UNLOCKS[type]||1;
  return L<=1||(Progress.data.upgrades[type]||0)>0||Progress.levelUnlocked(1,L);}
const levelKind=l=>l%5===0?'boss':l%5===2?'swarm':l%5===4?'heavy':'mixed';
const _smoothCache=new WeakMap();
function smoothPath(path,r=2.2,seg=6){
  if(_smoothCache.has(path))return _smoothCache.get(path);
  const out=[path[0]];
  for(let i=1;i<path.length-1;i++){
    const p0=path[i-1],p1=path[i],p2=path[i+1];
    const l1=Math.hypot(p0[0]-p1[0],p0[1]-p1[1]),l2=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]);
    const k1=Math.min(r,l1*.45)/l1,k2=Math.min(r,l2*.45)/l2;
    const a=[p1[0]+(p0[0]-p1[0])*k1,p1[1]+(p0[1]-p1[1])*k1],b=[p1[0]+(p2[0]-p1[0])*k2,p1[1]+(p2[1]-p1[1])*k2];
    for(let s=0;s<=seg;s++){const t=s/seg,u=1-t;
      out.push([u*u*a[0]+2*u*t*p1[0]+t*t*b[0],u*u*a[1]+2*u*t*p1[1]+t*t*b[1]]);}}
  out.push(path[path.length-1]);_smoothCache.set(path,out);return out;}
function getUpgradeMultipliers(type){
  const tier=Progress.data.upgrades[type]||0;
  return {damage:1+tier*0.08,range:1+tier*0.03,rate:1+tier*0.04,tier};
}

const ENEMY_STRENGTH_MULTIPLIER=0.85; // Correct global 15% reduction to HP, shields, speed and leak damage
const ENEMY_TYPES={
  infantry:{name:'INFANTRY',hp:42,speed:2.3,reward:5,cost:1,air:false,damage:1,build:()=>ModelFactory.infantry(),barY:1.9},
  technical:{name:'TECHNICAL',hp:65,speed:4.0,reward:8,cost:1.3,air:false,damage:2,build:()=>ModelFactory.technical(),barY:2.0},
  apc:{name:'APC',hp:180,speed:2.0,reward:13,cost:3,air:false,damage:3,build:()=>ModelFactory.apc(),barY:2.3},
  tank:{name:'TANK',hp:380,speed:1.45,reward:22,cost:6,air:false,damage:4,build:()=>ModelFactory.tank(),barY:2.4},
  heli:{name:'HELICOPTER',hp:150,speed:3.0,reward:15,cost:4,air:true,damage:3,build:()=>ModelFactory.helicopter(),barY:3.1},
  jet:{name:'JET',hp:95,speed:6.2,reward:15,cost:3.5,air:true,damage:3,build:()=>ModelFactory.jet(),barY:2.5},
  drone:{name:'DRONE',hp:55,speed:4.6,reward:9,cost:2,air:true,damage:2,build:()=>ModelFactory.drone(),barY:2.0},
  robot:{name:'WALKER',hp:650,speed:1.35,reward:38,cost:9,air:false,damage:5,shield:180,build:()=>ModelFactory.robot(),barY:2.9},
  heavy:{name:'TITAN',hp:1600,speed:1.0,reward:95,cost:22,air:false,damage:10,shield:500,build:()=>ModelFactory.heavy(),barY:3.6,boss:true}
};

/* ========== ACHIEVEMENTS ========== */
const ACHIEVEMENTS=[
  {id:'first_blood',name:'FIRST CONTACT',desc:'Destroy your first enemy',target:1,stat:'totalKills',reward:10},
  {id:'hunter',name:'HUNTER',desc:'Destroy 200 enemies',target:200,stat:'totalKills',reward:20},
  {id:'exterminator',name:'EXTERMINATOR',desc:'Destroy 2,000 enemies',target:2000,stat:'totalKills',reward:45},
  {id:'annihilator',name:'ANNIHILATOR',desc:'Destroy 15,000 enemies',target:15000,stat:'totalKills',reward:100},
  {id:'engineer',name:'FIELD ENGINEER',desc:'Build 100 towers',target:100,stat:'totalTowersBuilt',reward:25},
  {id:'max_tier',name:'PEAK PERFORMANCE',desc:'Upgrade any tower to max tier',check:s=>(s.highestTowerLevel||0)>=4||(s.highestArmoryTier||0)>=5,reward:45},
  {id:'flawless',name:'FLAWLESS VICTORY',desc:'Win 3 missions without losing a single life',target:3,stat:'flawlessWins',reward:50},
  {id:'emp_master',name:'EMP MASTER',desc:'Deploy 50 EMP pulses',target:50,stat:'empUses',reward:30},
  {id:'survivor',name:'SURVIVOR',desc:'Reach wave 20 in Endless mode',target:20,stat:'maxEndlessWave',reward:35},
  {id:'loyalty',name:'LOYAL DEFENDER',desc:'Claim daily gift 7 days in a row',target:7,stat:'bestDailyStreak',reward:55}
];
function notifyAchievement(a){
  const gameScreen=document.getElementById('screen-game');
  if(typeof UI!=='undefined'&&UI.game&&!UI.game.over&&gameScreen&&gameScreen.classList.contains('active')){
    UI.toast('★ ACHIEVEMENT: '+a.name+'  +'+a.reward+' ◆','gold',3500);
    return;
  }
  const el=document.createElement('div');
  el.className='ach-notify';
  el.innerHTML='<div class="an-k">★ ACHIEVEMENT UNLOCKED</div><div class="an-n">'+a.name+'</div><div class="an-r">+'+a.reward+' ◆ GOLD</div>';
  document.body.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  setTimeout(()=>el.classList.remove('show'),3200);
  setTimeout(()=>el.remove(),3700);
}

/* ========== ROUTE SELECTION ========== */
function getActiveRoutes(stageIndex,level){
  if(level===ENDLESS_LEVEL)return [0,1,2];
  return ROUTE_TABLE[clamp(level,1,LEVELS_PER_STAGE)-1];
}

/* ========== AUDIO ENGINE ========== */
class AudioEngine{
  constructor(){this.ctx=null;this.master=null;this.musicGain=null;this.sfxGain=null;
    this.musicOn=true;this.sfxOn=true;this.noiseBuffer=null;this.musicTimer=null;
    this.step=0;this.nextTime=0;this.tempo=100;this.root=55;this._lastShot=0;this._shotCount=0;}
  init(){if(this.ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    this.ctx=new AC();const comp=this.ctx.createDynamicsCompressor();
    comp.threshold.value=-18;comp.knee.value=20;comp.ratio.value=6;comp.attack.value=.003;
    comp.release.value=.25;comp.connect(this.ctx.destination);
    this.master=this.ctx.createGain();this.master.gain.value=.82;this.master.connect(comp);
    this.musicGain=this.ctx.createGain();this.musicGain.gain.value=0;this.musicGain.connect(this.master);
    this.sfxGain=this.ctx.createGain();this.sfxGain.gain.value=.9;this.sfxGain.connect(this.master);
    const len=this.ctx.sampleRate*2;this.noiseBuffer=this.ctx.createBuffer(1,len,this.ctx.sampleRate);
    const d=this.noiseBuffer.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;}
  ensure(){this.init();if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume();}
  setMusic(on){this.musicOn=on;if(this.musicGain)this.musicGain.gain.value=on?.55:0;}
  setSfx(on){this.sfxOn=on;if(this.sfxGain)this.sfxGain.gain.value=on?.9:0;}
  pan(x=0){const p=this.ctx.createStereoPanner();p.pan.value=clamp(x/26,-1,1);p.connect(this.sfxGain);return p;}
  noise(dur,ff,vol,pn,type='lowpass'){const src=this.ctx.createBufferSource();src.buffer=this.noiseBuffer;
    const f=this.ctx.createBiquadFilter();f.type=type;f.frequency.value=ff;
    const g=this.ctx.createGain();g.gain.setValueAtTime(vol,this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001,this.ctx.currentTime+dur);
    src.connect(f);f.connect(g);g.connect(pn);src.start();src.stop(this.ctx.currentTime+dur+.02);}
  tone(freq,dur,type,vol,pn,slideTo=null){const o=this.ctx.createOscillator();o.type=type;
    o.frequency.setValueAtTime(freq,this.ctx.currentTime);
    if(slideTo)o.frequency.exponentialRampToValueAtTime(Math.max(20,slideTo),this.ctx.currentTime+dur);
    const g=this.ctx.createGain();g.gain.setValueAtTime(vol,this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001,this.ctx.currentTime+dur);
    o.connect(g);g.connect(pn);o.start();o.stop(this.ctx.currentTime+dur+.02);}
  sfx(name,x=0){if(!this.sfxOn||!this.ctx)return;const now=this.ctx.currentTime;
    if(name==='gun'){this._shotCount++;if(this._shotCount>16&&now-this._lastShot<.06)return;
      if(now-this._lastShot>.06){this._shotCount=0;this._lastShot=now;}
      const p=this.pan(x);this.noise(.055,2200,.16,p,'highpass');this.tone(380,.06,'square',.05,p,140);}
    else if(name==='cannon'){const p=this.pan(x);this.noise(.3,700,.35,p);this.tone(90,.35,'sine',.4,p,36);}
    else if(name==='missile'){const p=this.pan(x);this.noise(.45,1800,.18,p,'bandpass');this.tone(200,.4,'sawtooth',.06,p,600);}
    else if(name==='explosion'){const p=this.pan(x);this.noise(.55,500,.42,p);this.tone(70,.5,'sine',.35,p,24);}
    else if(name==='laser'){const p=this.pan(x);this.tone(1400,.12,'sawtooth',.07,p,420);this.noise(.1,4000,.06,p,'highpass');}
    else if(name==='tesla'){const p=this.pan(x);this.noise(.18,5000,.16,p,'highpass');this.tone(900,.12,'square',.04,p,200);}
    else if(name==='build'){const p=this.pan(x);this.tone(130,.22,'sine',.26,p,42);this.noise(.09,380,.12,p);this.tone(900,.03,'triangle',.03,p,500);setTimeout(()=>this.tone(70,.18,'sine',.11,p,40),70);}
    else if(name==='error'){const p=this.pan(0);this.tone(190,.12,'square',.045,p,140);setTimeout(()=>this.tone(150,.16,'square',.045,p,110),90);}
    else if(name==='back'){const p=this.pan(0);this.tone(620,.05,'triangle',.05,p,420);this.tone(310,.06,'sine',.03,p,240);}
    else if(name==='hitMetal'||name==='hitFlesh'){if(now-(this._lastHit||0)<.05)return;this._lastHit=now;const p=this.pan(x);
      if(name==='hitMetal'){this.tone(2600+Math.random()*900,.05,'triangle',.03,p,1800);this.noise(.04,5000,.06,p,'highpass');}
      else{this.noise(.06,900,.09,p);this.tone(140,.06,'sine',.06,p,80);}}
    else if(name==='upgrade'){const p=this.pan(x);this.tone(90,.2,'sine',.16,p,50);[0,110,220,330].forEach((d,i)=>setTimeout(()=>this.tone([440,554,659,880][i],.22,'triangle',.09,p),d));}
    else if(name==='sell'){const p=this.pan(x);this.tone(420,.15,'triangle',.09,p,200);}
    else if(name==='ui'){const p=this.pan(0);this.tone(700,.035,'triangle',.05,p,980);this.tone(1400,.02,'sine',.018,p);this.noise(.012,3000,.02,p,'highpass');}
    else if(name==='uiHover'){this.tone(480,.025,'sine',.02,this.pan(0),560);}
    else if(name==='alarm'){const p=this.pan(0);this.tone(300,.18,'sawtooth',.08,p,600);setTimeout(()=>this.tone(300,.25,'sawtooth',.07,p,500),220);}
    else if(name==='base'){const p=this.pan(0);this.noise(.4,300,.4,p);this.tone(50,.5,'sine',.4,p,22);}
    else if(name==='pop'){const p=this.pan(x);this.tone(180,.08,'square',.03,p,80);}
    else if(name==='coin'){const p=this.pan(0);this.tone(1200,.08,'sine',.06,p,1800);setTimeout(()=>this.tone(1600,.12,'sine',.05,p,2400),60);}
    else if(name==='victory'){this.stopMusic();[523,659,784,1047].forEach((f,i)=>setTimeout(()=>this.tone(f,.55,'triangle',.12,this.pan(0)),i*140));}
    else if(name==='defeat'){this.stopMusic();[392,330,262,196].forEach((f,i)=>setTimeout(()=>this.tone(f,.7,'sawtooth',.08,this.pan(0)),i*190));}}
  startMusic(c){this.ensure();if(!this.ctx||!this.musicOn)return;this.stopMusic();
    this.tempo=c?.tempo||100;this.root=c?.root||55;this.step=0;this.nextTime=this.ctx.currentTime+.1;
    this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.musicGain.gain.setValueAtTime(.55,this.ctx.currentTime);
    this.musicTimer=setInterval(()=>this.schedule(),25);}
  stopMusic(){if(this.musicTimer){clearInterval(this.musicTimer);this.musicTimer=null;}
    if(this.musicGain&&this.ctx)this.musicGain.gain.setTargetAtTime(0,this.ctx.currentTime,.15);}
  schedule(){if(!this.ctx)return;while(this.nextTime<this.ctx.currentTime+.2){
    this.playStep(this.step,this.nextTime);this.nextTime+=60/this.tempo/4;this.step=(this.step+1)%64;}}
  playStep(step,time){const beat=step%16,bar=Math.floor(step/16);
    if(beat%4===0)this.drum(time,'kick');if(beat===4||beat===12)this.drum(time,'snare');
    if(beat%2===0)this.drum(time,'hat');const scale=[0,3,5,7,10];
    if([0,3,6,8,11,14].includes(beat)){const semi=scale[(bar+beat)%scale.length];
      this.musicTone(this.root*Math.pow(2,semi/12),time,.22,'sawtooth',.055,180);}
    if(beat===0){[0,3,7].forEach(semi=>{
      this.musicTone(this.root*2*Math.pow(2,(semi+scale[bar%scale.length])/12),time,1.6,'sawtooth',.022,900);});}
    if(beat%2===0){const semi=scale[(bar*2+beat/2)%scale.length]+12;
      this.musicTone(this.root*2*Math.pow(2,semi/12),time,.12,'triangle',.03,2400);}}
  musicTone(freq,time,dur,type,vol,cutoff){const o=this.ctx.createOscillator();o.type=type;o.frequency.value=freq;
    const f=this.ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=cutoff;
    const g=this.ctx.createGain();g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(vol,time+.02);
    g.gain.exponentialRampToValueAtTime(.0001,time+dur);o.connect(f);f.connect(g);g.connect(this.musicGain);
    o.start(time);o.stop(time+dur+.02);}
  drum(time,kind){if(kind==='kick'){const o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.frequency.setValueAtTime(110,time);o.frequency.exponentialRampToValueAtTime(38,time+.12);
    g.gain.setValueAtTime(.18,time);g.gain.exponentialRampToValueAtTime(.0001,time+.16);
    o.connect(g);g.connect(this.musicGain);o.start(time);o.stop(time+.18);}else{
    const src=this.ctx.createBufferSource();src.buffer=this.noiseBuffer;
    const f=this.ctx.createBiquadFilter();f.type=kind==='snare'?'bandpass':'highpass';
    f.frequency.value=kind==='snare'?1800:7000;const g=this.ctx.createGain();
    const dur=kind==='snare'?.1:.03;g.gain.setValueAtTime(kind==='snare'?.07:.025,time);
    g.gain.exponentialRampToValueAtTime(.0001,time+dur);src.connect(f);f.connect(g);g.connect(this.musicGain);
    src.start(time);src.stop(time+dur+.02);}}
}
const Audio=new AudioEngine();

/* ========== SETTINGS ========== */
const Settings={data:{music:true,sfx:true,bloom:true,shadows:true},
  load(){try{const s=JSON.parse(localStorage.getItem('ironline_settings_v1'));if(s)Object.assign(this.data,s);}catch(e){}},
  save(){try{localStorage.setItem('ironline_settings_v1',JSON.stringify(this.data));}catch(e){}}};
Settings.load();

/* ========== PROGRESS ========== */
const Progress={data:{
  unlockedStage:1,completed:{},stars:{},gold:0,
  upgrades:{gunner:0,cannon:0,missile:0,laser:0,tesla:0},
  tutorialDone:false,tutorialArmoryDone:false, empTutorialDone:false,
  endlessUnlocked:{1:false,2:false,3:false,4:false},
  endlessHighScores:{1:0,2:0,3:0,4:0},
  achievements:{},
  stats:{totalKills:0,totalWavesCleared:0,totalTowersBuilt:0,totalUpgrades:0,empUses:0,flawlessWins:0,highestTowerLevel:1,highestArmoryTier:0,maxEndlessWave:0,bestDailyStreak:0},
  dailyStreak:0,lastDailyGift:0
},
  migrateV2(s){const c={},st={};for(const k in (s.completed||{})){const [a,b]=k.split('-').map(Number);
      for(const n of [b*2-1,b*2]){c[a+'-'+n]=true;st[a+'-'+n]=(s.stars||{})[k]||1;}}
    this.data.completed=c;this.data.stars=st;},
  load(){try{const s=JSON.parse(localStorage.getItem('ironline_progress_v1'));if(s){Object.assign(this.data,s);if(!s.ver)this.migrateV2(s);}this.data.ver=3;
    if(typeof this.data.gold!=='number')this.data.gold=0;
    if(!this.data.upgrades)this.data.upgrades={};
    if(typeof this.data.tutorialDone==='undefined')this.data.tutorialDone=false;
    if(typeof this.data.tutorialArmoryDone==='undefined')this.data.tutorialArmoryDone=false;
    if(typeof this.data.empTutorialDone==='undefined')this.data.empTutorialDone=false;
    // Remove obsolete Commander XP fields from legacy saves; progression is gold + campaign missions only.
    delete this.data.playerExp;delete this.data.playerLevel;
    if(!this.data.endlessUnlocked)this.data.endlessUnlocked={1:false,2:false,3:false,4:false};
    if(!this.data.endlessHighScores)this.data.endlessHighScores={1:0,2:0,3:0,4:0};
    for(const t of TOWER_ORDER){if(typeof this.data.upgrades[t]!=='number')this.data.upgrades[t]=0;}
    if(!this.data.achievements)this.data.achievements={};
    if(!this.data.stats)this.data.stats={};
    const statDefaults={totalKills:0,totalWavesCleared:0,totalTowersBuilt:0,totalUpgrades:0,empUses:0,flawlessWins:0,highestTowerLevel:1,highestArmoryTier:0,maxEndlessWave:0,bestDailyStreak:0};
    for(const k in statDefaults)if(typeof this.data.stats[k]!=='number')this.data.stats[k]=statDefaults[k];
    if(typeof this.data.dailyStreak!=='number')this.data.dailyStreak=0;
    if(typeof this.data.lastDailyGift!=='number')this.data.lastDailyGift=0;
    const maxTier=Math.max(...TOWER_ORDER.map(t=>this.data.upgrades[t]||0));
    this.data.stats.highestArmoryTier=Math.max(this.data.stats.highestArmoryTier,maxTier);
    try{this.checkAchievements(true);}catch(e){}
  }catch(e){}},
  save(){try{localStorage.setItem('ironline_progress_v1',JSON.stringify(this.data));}catch(e){}},
  stageUnlocked(s){return s<=this.data.unlockedStage;},
  maxCompleted(s){let m=0;while(this.data.completed[s+'-'+(m+1)])m++;return m;},
  levelUnlocked(s,l){if(!this.stageUnlocked(s))return false;
    if(s<this.data.unlockedStage)return true;if(l===1)return true;
    return !!this.data.completed[s+'-'+(l-1)];},
  complete(s,l,stars){
    const key=s+'-'+l;
    const wasCompleted=!!this.data.completed[key];
    const previousStars=this.data.stars[key]||0;
    const bestStars=Math.max(previousStars,stars);
    this.data.completed[key]=true;
    this.data.stars[key]=bestStars;
    if(l===LEVELS_PER_STAGE&&s<4){this.data.unlockedStage=Math.max(this.data.unlockedStage,s+1);this.data.endlessUnlocked[s]=true;}
    // Gold is the only permanent progression currency. First clears pay well;
    // replays are deliberately modest, with a small bonus for a better star result.
    const firstClearReward=8+stars*14+l+(s-1)*12;
    const replayReward=Math.max(2,Math.floor(firstClearReward*.05));
    const starImprovement=Math.max(0,bestStars-previousStars)*8;
    const gold=wasCompleted?replayReward+starImprovement:firstClearReward;
    this.data.gold+=gold;
    this.save();
    return { gold };
  },
  campaignProgressIndex(){
    let cleared=0;
    for(let index=1;index<=MAPS.length*LEVELS_PER_STAGE;index++){
      const stage=Math.floor((index-1)/LEVELS_PER_STAGE)+1;
      const level=((index-1)%LEVELS_PER_STAGE)+1;
      if(!this.data.completed[stage+'-'+level])break;
      cleared=index;
    }
    return cleared;
  },
  armoryRequirement(type,tier=this.data.upgrades[type]||0){return armoryTierMissionRequirement(type,tier);},
  canUpgrade(type){const t=this.data.upgrades[type]||0;if(t>=UPGRADE_TIERS||!towerUnlockedInCampaign(type))return false;
    if(this.campaignProgressIndex()<this.armoryRequirement(type,t))return false;
    return this.data.gold>=upgradeCostFor(type,t);},
  buyUpgrade(type){const t=this.data.upgrades[type]||0;if(t>=UPGRADE_TIERS||!towerUnlockedInCampaign(type))return false;
    if(this.campaignProgressIndex()<this.armoryRequirement(type,t))return false;
    const cost=upgradeCostFor(type,t);if(this.data.gold<cost)return false;
    this.data.gold-=cost;this.data.upgrades[type]=t+1;
    this.data.stats.highestArmoryTier=Math.max(this.data.stats.highestArmoryTier||0,this.data.upgrades[type]);
    if(!this.data.tutorialArmoryDone){
      this.data.tutorialArmoryDone=true;
      UI.toast('TUTORIAL COMPLETE! You can now upgrade towers freely.','gold',3000);
      const banner=document.getElementById('armory-tutorial');
      if(banner)banner.remove();
    }
    this.save();
    this.checkAchievements();
    return true;},
  totalLevels(){return Object.keys(this.data.completed).length;},
  totalStars(){return Object.values(this.data.stars).reduce((a,b)=>a+b,0);},
  bumpStat(key,amt=1){
    if(!this.data.stats)this.data.stats={};
    this.data.stats[key]=(this.data.stats[key]||0)+amt;
    this.checkAchievements();
  },
  setStatMax(key,value){
    if(!this.data.stats)this.data.stats={};
    this.data.stats[key]=Math.max(this.data.stats[key]||0,value);
    this.checkAchievements();
  },
  checkAchievements(silent=false){
    const newOnes=[];const s=this.data.stats||{};
    for(const a of ACHIEVEMENTS){
      if(this.data.achievements[a.id])continue;
      let met=false;
      if(a.check)met=a.check(s);
      else met=(s[a.stat]||0)>=a.target;
      if(met){
        this.data.achievements[a.id]={unlocked:true,at:Date.now()};
        this.data.gold+=a.reward;
        newOnes.push(a);
      }
    }
    if(newOnes.length){
      this.save();
      if(!silent)for(const a of newOnes)notifyAchievement(a);
    }
    return newOnes;
  }
};
Progress.load();

/* ========== DAILY GIFT ========== */
const DailyGift={
  DAY_MS:24*60*60*1000,
  GRACE_MS:12*60*60*1000,
  isAvailable(){
    const last=Progress.data.lastDailyGift||0;
    if(!last)return true;
    return Date.now()-last>=this.DAY_MS;
  },
  timeUntilNext(){
    const last=Progress.data.lastDailyGift||0;
    if(!last)return 0;
    return Math.max(0,(last+this.DAY_MS)-Date.now());
  },
  computeStreak(){
    const last=Progress.data.lastDailyGift||0;
    if(!last)return 1;
    const since=Date.now()-last;
    if(since>=this.DAY_MS&&since<=this.DAY_MS+this.GRACE_MS){
      return Math.min(7,(Progress.data.dailyStreak||0)+1);
    }
    return 1;
  },
  claim(){
    if(!this.isAvailable())return null;
    const streak=this.computeStreak();
    const base=12;
    const streakBonus=(streak-1)*3;
    const random=Math.floor(Math.random()*7);
    const reward=base+streakBonus+random;
    Progress.data.lastDailyGift=Date.now();
    Progress.data.dailyStreak=streak;
    Progress.data.gold+=reward;
    Progress.data.stats.bestDailyStreak=Math.max(Progress.data.stats.bestDailyStreak||0,streak);
    Progress.save();
    Progress.checkAchievements();
    Audio.sfx('coin');
    UI.toast('DAILY GIFT CLAIMED: +'+reward+' GOLD','gold',3200);
    return {streak,reward};
  }
};
/* ========== FX ========== */