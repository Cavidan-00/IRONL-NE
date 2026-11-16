'use strict';
/* IRONLINE // Procedural 3D models for towers, enemies and the base */
const ModelFactory={
  base(accent){
    const g=new THREE.Group();
    mm(g,GEO.cyl6,COL.metalDark,[0,.14,0],[1.65,.28,1.65]);
    mm(g,GEO.cyl6,COL.metal,[0,.28,0],[1.4,.08,1.4]);
    mm(g,GEO.cyl6,M(0x18232c),[0,.34,0],[1.32,.06,1.32]);
    mm(g,GEO.torus,accent,[0,.4,0],[1.55,1.55,1.55],[Math.PI/2,0,0]);
    for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;
      mm(g,GEO.box,COL.metalDark,[Math.cos(a)*1.15,.3,Math.sin(a)*1.15],[.14,.5,.14]);}
    for(let i=0;i<6;i++){const a=i*Math.PI/3;
      mm(g,GEO.box,M(0x0f161c),[Math.cos(a)*.7,.36,Math.sin(a)*.7],[.5,.01,.08],[0,a,0]);}
    return g;},
  gunner(){
    const g=this.base(COL.cyan);const turret=new THREE.Group();turret.position.y=.72;g.add(turret);
    mm(turret,GEO.box,COL.player,[0,.18,0],[1.05,.38,.95]);
    mm(turret,GEO.box,COL.playerLight,[0,.32,0],[.92,.1,.82]);
    mm(turret,GEO.box,COL.metalDark,[0,.38,-.12],[.8,.16,.5]);
    mm(turret,GEO.box,COL.metal,[.55,.18,0],[.05,.28,.7]);
    mm(turret,GEO.box,COL.metal,[-.55,.18,0],[.05,.28,.7]);
    mm(turret,GEO.box,COL.metalDark,[0,.22,-.42],[.5,.28,.14]);
    mm(turret,GEO.box,COL.hazard,[0,.36,-.42],[.5,.02,.14]);
    mm(turret,GEO.box,COL.dark,[.25,.42,.1],[.16,.08,.16]);
    mm(turret,GEO.sphere,COL.cyan,[.25,.45,.18],[.06,.06,.06]);
    const barrels=[];
    for(const x of [0]){const b=new THREE.Group();b.position.set(x,.22,.5);turret.add(b);
      mm(b,GEO.cyl,COL.metal,[0,0,.62],[.055,1.2,.055],[Math.PI/2,0,0]);
      mm(b,GEO.cyl,COL.metalLight,[0,0,.4],[.075,.3,.075],[Math.PI/2,0,0]);
      mm(b,GEO.box,COL.metalDark,[0,0,1.2],[.13,.1,.2]);
      mm(b,GEO.cyl,COL.metalDark,[0,0,1.32],[.08,.1,.08],[Math.PI/2,0,0]);
      b.userData.muzzle=muzzleAnchor(b,[0,0,1.42]);b.userData.homeZ=b.position.z;b.userData.recoil=0;barrels.push(b);}
    mm(turret,GEO.box,COL.metalDark,[0,.16,.28],[.28,.1,.15]);
    for(let i=0;i<3;i++)mm(turret,GEO.box,COL.dark,[0,.28,-.28+i*.06],[.35,.02,.04]);
    g.userData.turret=turret;g.userData.barrels=barrels;return g;},
  cannon(){
    const g=this.base(COL.orange);const turret=new THREE.Group();turret.position.y=.75;g.add(turret);
    mm(turret,GEO.cyl6,COL.player,[0,.16,0],[1.2,.42,1.1]);
    mm(turret,GEO.box,COL.playerLight,[0,.34,0],[1.0,.1,.9]);
    mm(turret,GEO.box,COL.metalDark,[.56,.16,0],[.08,.36,.9]);
    mm(turret,GEO.box,COL.metalDark,[-.56,.16,0],[.08,.36,.9]);
    mm(turret,GEO.box,COL.metalDark,[0,.4,-.4],[.9,.18,.3]);
    mm(turret,GEO.cyl,COL.metalDark,[0,.4,-.55],[.4,.22,.4],[Math.PI/2,0,0]);
    mm(turret,GEO.box,COL.metal,[0,.28,.35],[.5,.32,.28]);
    const barrel=new THREE.Group();barrel.position.set(0,.24,.45);turret.add(barrel);
    mm(barrel,GEO.cyl,COL.metal,[0,0,.85],[.13,1.9,.13],[Math.PI/2,0,0]);
    mm(barrel,GEO.cyl,COL.metalLight,[0,0,.55],[.18,.6,.18],[Math.PI/2,0,0]);
    mm(barrel,GEO.box,COL.metalDark,[0,0,1.8],[.32,.22,.38]);
    mm(barrel,GEO.cyl,COL.metalDark,[0,0,1.98],[.15,.14,.15],[Math.PI/2,0,0]);
    barrel.userData.muzzle=muzzleAnchor(barrel,[0,0,2.10]);barrel.userData.homeZ=barrel.position.z;
    mm(turret,GEO.cyl,COL.metal,[.2,.22,.35],[.08,.5,.08],[Math.PI/2,0,0]);
    mm(turret,GEO.cyl,COL.metal,[-.2,.22,.35],[.08,.5,.08],[Math.PI/2,0,0]);
    mm(turret,GEO.box,COL.metalDark,[0,.05,.5],[.4,.2,.22]);
    g.userData.turret=turret;g.userData.barrel=barrel;return g;},
  missile(){
    const g=this.base(COL.red);const turret=new THREE.Group();turret.position.y=.72;g.add(turret);
    mm(turret,GEO.box,COL.player,[0,.2,0],[1.15,.42,1.0]);
    mm(turret,GEO.box,COL.playerLight,[0,.36,0],[1.0,.08,.86]);
    mm(turret,GEO.box,COL.metalDark,[.55,.2,0],[.06,.3,.72]);
    mm(turret,GEO.box,COL.metalDark,[-.55,.2,0],[.06,.3,.72]);
    const launcher=new THREE.Group();launcher.position.set(0,.55,0);launcher.rotation.x=-.22;turret.add(launcher);
    mm(launcher,GEO.box,COL.metalDark,[0,0,0],[1.1,.5,.9]);
    mm(launcher,GEO.box,COL.metal,[0,.28,0],[1.12,.04,.92]);
    for(const x of [-.26,.26])for(const y of [-.12,.12]){
      mm(launcher,GEO.cyl,COL.metal,[x,y,.5],[.18,.8,.18],[Math.PI/2,0,0]);
      mm(launcher,GEO.cyl,COL.dark,[x,y,.92],[.14,.04,.14],[Math.PI/2,0,0]);
      mm(launcher,GEO.box,COL.hazard,[x,y,.4],[.19,.04,.05]);}
    launcher.userData.muzzles=[];
    for(const x of [-.26,.26])for(const y of [-.12,.12])
      launcher.userData.muzzles.push(muzzleAnchor(launcher,[x,y,.98]));
    launcher.userData.homeZ=launcher.position.z;launcher.userData.recoil=0;
    mm(turret,GEO.cyl,COL.metalDark,[.35,.58,-.28],[.16,.32,.16]);
    mm(turret,GEO.cone,COL.metalLight,[.35,.74,-.28],[.32,.14,.32],[Math.PI,0,0]);
    mm(turret,GEO.sphere,COL.red,[0,.42,-.4],[.09,.09,.09]);
    g.userData.turret=turret;g.userData.launcher=launcher;return g;},
  laser(){
    // Industrial continuous-beam turret: armored gimbal, exposed power couplers and a precision emitter.
    const g=this.base(COL.cyan);
    const turret=new THREE.Group();turret.position.y=.72;g.add(turret);
    mm(turret,GEO.cyl8,COL.player,[0,.16,0],[1.08,.34,1.02]);
    mm(turret,GEO.box,COL.playerLight,[0,.34,-.02],[.94,.12,.84]);
    // Heavy side trunnions and pivot caps.
    for(const side of [-1,1]){
      mm(turret,GEO.cyl,COL.metalDark,[side*.52,.42,-.02],[.19,.34,.19],[0,0,Math.PI/2]);
      mm(turret,GEO.cyl,COL.metalLight,[side*.52,.42,-.02],[.11,.36,.11],[0,0,Math.PI/2]);
      mm(turret,GEO.box,COL.metalDark,[side*.49,.22,-.38],[.16,.28,.42]);
      mm(turret,GEO.box,COL.cyanDim,[side*.49,.37,-.39],[.12,.025,.28]);
    }
    // Rear power-conditioning block with service panels.
    mm(turret,GEO.box,COL.metalDark,[0,.49,-.52],[.72,.40,.48]);
    mm(turret,GEO.box,COL.playerLight,[0,.71,-.52],[.62,.045,.40]);
    mm(turret,GEO.box,COL.black,[0,.50,-.275],[.48,.22,.025]);
    for(let i=0;i<4;i++)mm(turret,GEO.box,COL.metalLight,[(i-1.5)*.12,.51,-.25],[.045,.14,.035]);
    mm(turret,GEO.box,COL.hazard,[0,.285,-.52],[.42,.035,.32]);
    // Emitter barrel: its origin is the muzzle so gameplay beams originate at the visible lens.
    const barrel=new THREE.Group();barrel.position.set(0,.48,1.22);turret.add(barrel);
    mm(barrel,GEO.cyl,COL.metalDark,[0,0,-.58],[.23,1.18,.23],[Math.PI/2,0,0]);
    mm(barrel,GEO.cyl,COL.metal,[0,0,-.34],[.27,.28,.27],[Math.PI/2,0,0]);
    mm(barrel,GEO.cyl,COL.metalLight,[0,0,-.18],[.245,.12,.245],[Math.PI/2,0,0]);
    mm(barrel,GEO.cyl,COL.black,[0,0,-.045],[.19,.055,.19],[Math.PI/2,0,0]);
    const emitterLens=mm(barrel,GEO.cyl,COL.cyan,[0,0,.012],[.115,.035,.115],[Math.PI/2,0,0]);
    barrel.userData.muzzle=muzzleAnchor(barrel,[0,0,.055]);
    // Longitudinal heat-sink fins around the rear half of the barrel.
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      const fin=mm(barrel,GEO.box,COL.metalLight,[Math.cos(a)*.145,Math.sin(a)*.145,-.68],[.045,.075,.66]);
      fin.rotation.z=a;
    }
    // Front optical hood and paired sighting sensors.
    mm(turret,GEO.box,COL.metalDark,[0,.80,.18],[.52,.16,.38]);
    mm(turret,GEO.box,COL.cyanDim,[0,.89,.25],[.28,.025,.20]);
    for(const side of [-1,1]){
      mm(turret,GEO.cyl,COL.metalDark,[side*.32,.78,.20],[.075,.18,.075]);
      mm(turret,GEO.sphere,COL.cyan,[side*.32,.79,.25],[.045,.045,.045]);
    }
    g.userData.turret=turret;g.userData.barrel=barrel;g.userData.emitter=barrel;g.userData.emitterLens=emitterLens;return g;},
  tesla(){
    // Industrial chain-discharge tower: transformer banks, insulated busbars and twin contact forks.
    const g=this.base(COL.green);
    const turret=new THREE.Group();turret.position.y=.70;g.add(turret);
    mm(turret,GEO.cyl8,COL.player,[0,.16,0],[1.12,.34,1.08]);
    mm(turret,GEO.cyl8,COL.playerLight,[0,.34,0],[.92,.07,.90]);
    // Main insulated transformer column.
    mm(turret,GEO.cyl,COL.metalDark,[0,.78,0],[.48,.86,.48]);
    mm(turret,GEO.cyl,COL.metal,[0,.82,0],[.37,.78,.37]);
    mm(turret,GEO.cyl,COL.black,[0,.84,0],[.27,.82,.27]);
    // Visible copper induction windings: real coil hardware, not a floating energy halo.
    const copper=M(0x9b633d,{metalness:.82,roughness:.3});
    for(let i=0;i<7;i++){
      const y=.48+i*.115;
      mm(turret,GEO.torus,copper,[0,y,0],[.39,.39,.39],[Math.PI/2,0,0]);
    }
    // Insulated uprights and foot clamps.
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2+Math.PI/4,x=Math.cos(a)*.57,z=Math.sin(a)*.57;
      mm(turret,GEO.cyl,COL.metalDark,[x,.63,z],[.13,.72,.13]);
      mm(turret,GEO.cyl,COL.metalLight,[x,.35,z],[.18,.10,.18]);
      mm(turret,GEO.box,COL.green,[x,.98,z],[.16,.035,.16]);
    }
    // Twin capacitor/transformer housings mounted low on each flank.
    for(const side of [-1,1]){
      mm(turret,GEO.box,COL.metalDark,[side*.66,.55,-.08],[.34,.58,.58]);
      mm(turret,GEO.box,COL.playerLight,[side*.66,.86,-.08],[.30,.055,.52]);
      mm(turret,GEO.box,COL.black,[side*.66,.56,.225],[.22,.34,.025]);
      for(let i=0;i<4;i++)mm(turret,GEO.box,COL.metalLight,[side*.66,.43+i*.085,.25],[.19,.025,.025]);
      mm(turret,GEO.cyl,copper,[side*.66,.58,.29],[.11,.22,.11],[Math.PI/2,0,0]);
      mm(turret,GEO.box,COL.hazard,[side*.66,.25,-.08],[.25,.035,.38]);
    }
    // Top yoke and two fixed discharge electrodes.
    mm(turret,GEO.box,COL.metalDark,[0,1.28,0],[.92,.20,.34]);
    mm(turret,GEO.box,COL.metalLight,[0,1.39,0],[.78,.045,.28]);
    const contacts=[];
    for(const side of [-1,1]){
      const arm=new THREE.Group();arm.position.set(side*.34,1.42,.02);turret.add(arm);
      mm(arm,GEO.cyl,COL.metalDark,[0,.22,0],[.12,.55,.12]);
      mm(arm,GEO.cyl,COL.metalLight,[0,.46,0],[.17,.12,.17]);
      mm(arm,GEO.cone,COL.green,[0,.57,.02],[.13,.20,.13]);
      contacts.push(arm);
    }
    // A small service mast sits behind the yoke, with no suspended orb.
    mm(turret,GEO.cyl,COL.metalDark,[0,1.22,-.48],[.07,.48,.07]);
    mm(turret,GEO.box,COL.metal,[0,1.46,-.48],[.36,.18,.16]);
    mm(turret,GEO.box,COL.glass,[0,1.47,-.385],[.20,.09,.025]);
    const barrel=new THREE.Group();barrel.position.set(0,1.72,0);turret.add(barrel);
    barrel.userData.muzzle=muzzleAnchor(barrel,[0,.30,.02]);
    g.userData.turret=turret;g.userData.barrel=barrel;g.userData.contacts=contacts;return g;},
  upgrade(tower,level){
    const g=tower.group;
    const accent={gunner:COL.cyan,cannon:COL.orange,missile:COL.red,laser:COL.purple,tesla:COL.green}[tower.type]||COL.cyan;

    // LASER PROGRESSION — practical beam hardware, cooling and targeting systems.
    if(tower.type==='laser'){
      const t=tower.turret,b=tower.barrel;
      if(level===2){
        // Tier II: armored side cheeks and twin heat-exchanger packs.
        for(const side of [-1,1]){
          mm(t,GEO.box,COL.metalDark,[side*.70,.24,-.18],[.24,.42,.72]);
          mm(t,GEO.box,COL.playerLight,[side*.70,.47,-.18],[.25,.055,.66]);
          mm(t,GEO.box,COL.cyanDim,[side*.70,.505,.04],[.16,.025,.28]);
          for(let i=0;i<4;i++)mm(t,GEO.box,COL.black,[side*.825,.22,-.40+i*.14],[.018,.055,.085]);
          mm(t,GEO.cyl,COL.metal,[side*.70,.20,-.57],[.10,.18,.10],[Math.PI/2,0,0]);
        }
        mm(b,GEO.cyl,COL.metalDark,[0,0,-.62],[.29,.24,.29],[Math.PI/2,0,0]);
        mm(b,GEO.cyl,COL.metalLight,[0,0,-.48],[.30,.07,.30],[Math.PI/2,0,0]);
        mm(t,GEO.box,COL.metalDark,[0,.22,.52],[.70,.18,.22]);
      }
      if(level===3){
        // Tier III: dual capacitor cartridges and a protected dual-sensor rangefinder.
        for(const side of [-1,1]){
          mm(t,GEO.cyl,COL.metalDark,[side*.52,.78,-.48],[.18,.64,.18]);
          mm(t,GEO.cyl,COL.metalLight,[side*.52,.78,-.48],[.13,.66,.13]);
          mm(t,GEO.box,COL.cyanDim,[side*.52,1.12,-.48],[.22,.045,.20]);
          mm(t,GEO.box,COL.metalDark,[side*.52,.46,-.48],[.26,.20,.30]);
          for(let i=0;i<3;i++)mm(t,GEO.box,COL.black,[side*.66,.74,-.66+i*.16],[.018,.07,.07]);
        }
        mm(t,GEO.box,COL.metalDark,[0,.88,-.72],[.54,.28,.36]);
        mm(t,GEO.box,COL.metalLight,[0,1.04,-.72],[.46,.045,.30]);
        mm(t,GEO.box,COL.glass,[0,.91,-.525],[.28,.13,.025]);
        for(const side of [-1,1])mm(t,GEO.sphere,COL.cyan,[side*.14,.92,-.49],[.045,.045,.045]);
        // Reinforced barrel jacket and visible segmented heat fins.
        mm(b,GEO.cyl,COL.player,[0,0,-.72],[.31,.72,.31],[Math.PI/2,0,0]);
        for(const z of [-.92,-.72,-.52])mm(b,GEO.cyl,COL.metalLight,[0,0,z],[.34,.055,.34],[Math.PI/2,0,0]);
      }
      if(level===4){
        // Tier IV: elite armored focusing assembly with twin radiator banks and redundant optics.
        mm(t,GEO.box,COL.player,[0,.50,-.02],[1.02,.32,.94]);
        mm(t,GEO.box,COL.metalLight,[0,.68,-.02],[.88,.045,.78]);
        mm(t,GEO.box,COL.cyanDim,[0,.712,.08],[.54,.022,.40]);
        for(const side of [-1,1]){
          mm(t,GEO.box,COL.metalDark,[side*.88,.48,-.22],[.18,.62,.82]);
          mm(t,GEO.box,COL.playerLight,[side*.88,.80,-.22],[.20,.055,.76]);
          for(let i=0;i<6;i++){
            const fin=mm(t,GEO.box,COL.metalLight,[side*.88,.49,-.53+i*.12],[.22,.045,.055]);
            fin.rotation.z=side*.12;
          }
          mm(t,GEO.box,COL.cyan,[side*.985,.50,.10],[.025,.09,.34]);
          mm(t,GEO.cyl,COL.metalDark,[side*.42,.96,-.72],[.12,.42,.12]);
          mm(t,GEO.sphere,COL.cyan,[side*.42,1.19,-.72],[.07,.07,.07]);
        }
        mm(b,GEO.cyl,COL.player,[0,0,-.78],[.36,.92,.36],[Math.PI/2,0,0]);
        for(const z of [-1.08,-.82,-.56,-.30])mm(b,GEO.cyl,COL.metalLight,[0,0,z],[.39,.065,.39],[Math.PI/2,0,0]);
        mm(b,GEO.cyl,COL.black,[0,0,-.12],[.23,.08,.23],[Math.PI/2,0,0]);
        mm(b,GEO.cyl,COL.cyan,[0,0,.015],[.16,.04,.16],[Math.PI/2,0,0]);
        mm(t,GEO.box,COL.metalDark,[0,.24,.68],[.88,.20,.24]);
        mm(t,GEO.box,COL.hazard,[0,.35,.72],[.50,.025,.035]);
      }
      return;
    }

    // TESLA PROGRESSION — transformer capacity, insulated electrodes and heavy busbars.
    if(tower.type==='tesla'){
      const t=tower.turret;
      if(level===2){
        // Tier II: reinforced twin transformer banks and heavy connecting busbars.
        for(const side of [-1,1]){
          mm(t,GEO.box,COL.metalDark,[side*.88,.64,-.06],[.28,.76,.70]);
          mm(t,GEO.box,COL.playerLight,[side*.88,1.04,-.06],[.30,.06,.62]);
          mm(t,GEO.box,COL.green,[side*.88,1.08,.05],[.16,.025,.32]);
          for(let i=0;i<5;i++)mm(t,GEO.box,COL.metalLight,[side*.88,.42+i*.11,.30],[.21,.035,.035]);
          mm(t,GEO.cyl,COL.metalDark,[side*.88,.60,.38],[.13,.28,.13],[Math.PI/2,0,0]);
          mm(t,GEO.box,COL.metalDark,[side*.58,1.18,0],[.18,.16,.22]);
        }
        mm(t,GEO.box,COL.metalDark,[0,1.48,0],[1.10,.18,.42]);
        mm(t,GEO.box,COL.metalLight,[0,1.58,0],[.92,.045,.34]);
        for(let i=0;i<3;i++)mm(t,GEO.torus,COL.metal,[0,.70+i*.15,0],[.45,.45,.45],[Math.PI/2,0,0]);
      }
      if(level===3){
        // Tier III: four-point discharge yoke, larger contact assemblies and insulated braces.
        for(const side of [-1,1]){
          const arm=new THREE.Group();arm.position.set(side*.54,1.22,.08);t.add(arm);
          mm(arm,GEO.cyl,COL.metalDark,[0,.28,0],[.14,.58,.14]);
          mm(arm,GEO.cyl,COL.metalLight,[0,.53,0],[.19,.12,.19]);
          mm(arm,GEO.cone,COL.green,[0,.65,.02],[.16,.24,.16]);
          mm(arm,GEO.box,COL.metalDark,[side*.08,.16,-.05],[.18,.20,.22]);
        }
        mm(t,GEO.box,COL.metalDark,[0,1.72,0],[1.34,.22,.48]);
        mm(t,GEO.box,COL.playerLight,[0,1.85,0],[1.16,.045,.38]);
        mm(t,GEO.box,COL.green,[0,1.88,.08],[.64,.025,.08]);
        // Additional coil section is enclosed by a ribbed protective sleeve.
        mm(t,GEO.cyl,COL.metalDark,[0,.88,0],[.56,.78,.56]);
        for(let i=0;i<5;i++)mm(t,GEO.torus,COL.metalLight,[0,.58+i*.14,0],[.50,.50,.50],[Math.PI/2,0,0]);
        for(const side of [-1,1]){
          mm(t,GEO.cyl,COL.metalDark,[side*.72,.94,-.42],[.11,.72,.11]);
          mm(t,GEO.box,COL.green,[side*.72,1.32,-.42],[.14,.035,.14]);
        }
      }
      if(level===4){
        // Tier IV: heavy substation-grade armor, redundant capacitors and reinforced discharge forks.
        for(const side of [-1,1]){
          mm(t,GEO.box,COL.player,[side*.96,.72,-.06],[.34,.94,.82]);
          mm(t,GEO.box,COL.metalLight,[side*.96,1.21,-.06],[.32,.06,.70]);
          mm(t,GEO.box,COL.green,[side*.96,1.25,.02],[.20,.025,.36]);
          for(let i=0;i<6;i++)mm(t,GEO.box,COL.black,[side*1.135,.56+i*.12,.18],[.018,.055,.10]);
          mm(t,GEO.cyl,COL.metalDark,[side*.96,.70,.40],[.16,.36,.16],[Math.PI/2,0,0]);
          mm(t,GEO.cyl,COL.metalLight,[side*.96,.70,.60],[.19,.08,.19],[Math.PI/2,0,0]);
        }
        mm(t,GEO.box,COL.metalDark,[0,1.92,0],[1.72,.28,.58]);
        mm(t,GEO.box,COL.playerLight,[0,2.08,0],[1.48,.05,.46]);
        mm(t,GEO.box,COL.green,[0,2.11,.10],[.82,.025,.08]);
        for(const side of [-1,1]){
          const fork=new THREE.Group();fork.position.set(side*.40,1.95,.08);t.add(fork);
          mm(fork,GEO.cyl,COL.metalDark,[0,.24,0],[.16,.52,.16]);
          mm(fork,GEO.cyl,COL.metalLight,[0,.48,0],[.21,.12,.21]);
          mm(fork,GEO.cone,COL.green,[0,.60,.02],[.18,.28,.18]);
          mm(fork,GEO.box,COL.metalDark,[side*.12,.14,-.04],[.18,.22,.20]);
        }
        mm(t,GEO.box,COL.metalDark,[0,.38,-.62],[.92,.36,.32]);
        mm(t,GEO.box,COL.metalLight,[0,.58,-.62],[.76,.045,.24]);
        if(tower.barrel&&tower.barrel.userData.muzzle)tower.barrel.userData.muzzle.position.y=.83;
        for(let i=0;i<6;i++){
          const x=(i-2.5)*.13;
          mm(t,GEO.box,COL.metal,[x,.68,-.62],[.065,.16,.23]);
        }
      }
      return;
    }

    // MISSILE VISUAL PROGRESSION — modular 4/6/8/10 tube battery.
    // Mechanical equipment only: no decorative ground rings, floating crowns or halos.
    if(tower.type==='missile'){
      const t=tower.turret;
      const launcher=tower.launcher||tower.group.userData.launcher;
      if(!t||!launcher){console.warn('Missile upgrade skipped: launcher reference is missing.');return;}
      const addTube=(x,y)=>{
        const tube=new THREE.Group();tube.position.set(x,y,.5);launcher.add(tube);
        mm(tube,GEO.cyl,COL.metal,[0,0,0],[.18,.8,.18],[Math.PI/2,0,0]);
        mm(tube,GEO.cyl,COL.metalLight,[0,0,.27],[.205,.22,.205],[Math.PI/2,0,0]);
        mm(tube,GEO.cyl,COL.dark,[0,0,.42],[.145,.035,.145],[Math.PI/2,0,0]);
        mm(tube,GEO.box,COL.hazard,[0,-.105,-.02],[.19,.035,.06]);
        mm(tube,GEO.box,COL.hazard,[0,.105,-.02],[.19,.035,.06]);
        (launcher.userData.muzzles||(launcher.userData.muzzles=[])).push(muzzleAnchor(tube,[0,0,.45]));
      };
      if(level===2){
        // Tier II: six launch tubes and reinforced launcher cheeks.
        addTube(0,-.12);addTube(0,.12);
        for(const x of [-.68,.68]){
          mm(launcher,GEO.box,COL.metalDark,[x,0,.02],[.16,.62,1.02]);
          mm(launcher,GEO.box,COL.red,[x,0,.12],[.035,.42,.72]);
          mm(launcher,GEO.box,COL.metalLight,[x,0,-.43],[.18,.12,.12]);
        }
        mm(t,GEO.box,COL.metalDark,[0,.48,-.48],[.72,.22,.28]);
        mm(t,GEO.box,COL.gold,[0,.60,-.48],[.46,.025,.18]);
        for(const x of [-.42,.42]){
          mm(t,GEO.cyl,COL.metalDark,[x,.48,-.28],[.12,.34,.12]);
          mm(t,GEO.sphere,COL.red,[x,.68,-.28],[.075,.075,.075]);
        }
      }
      if(level===3){
        // Tier III: eight-tube battery, tracking mast and rangefinder.
        for(const x of [-.52,.52])addTube(x,0);
        mm(launcher,GEO.box,COL.metalDark,[0,.02,-.52],[1.38,.68,.2]);
        mm(launcher,GEO.box,COL.red,[0,.38,-.52],[1.12,.045,.12]);
        mm(t,GEO.cyl,COL.metalDark,[0,.78,-.62],[.12,.72,.12]);
        mm(t,GEO.box,COL.metal,[0,1.18,-.62],[.62,.34,.18]);
        mm(t,GEO.box,COL.glass,[0,1.2,-.515],[.38,.19,.025]);
        for(const x of [-.2,.2])mm(t,GEO.sphere,COL.cyan,[x,1.2,-.49],[.055,.055,.055]);
        for(const x of [-.78,.78]){
          mm(t,GEO.box,COL.metalDark,[x,.28,0],[.16,.52,.82]);
          mm(t,GEO.box,COL.red,[x,.53,0],[.045,.025,.62]);
          mm(t,GEO.cyl,COL.metalLight,[x,.12,.18],[.09,.22,.09]);
        }
      }
      if(level===4){
        // Tier IV: ten-tube elite launcher, heavy bracing and protected dual optics.
        addTube(0,-.34);addTube(0,.34);
        // Keep the launch tubes exposed: move the heavy armor spine behind the battery.
        mm(launcher,GEO.box,COL.metalDark,[0,0,-.48],[1.62,.82,.34]);
        mm(launcher,GEO.box,COL.metalLight,[0,.43,-.48],[1.48,.075,.30]);
        // Wider outer cheeks make the elite launcher read as a larger, heavier unit.
        for(const x of [-.88,.88]){
          mm(launcher,GEO.box,COL.metalDark,[x,0,.02],[.20,.82,1.04]);
          mm(launcher,GEO.box,COL.red,[x,.34,.12],[.045,.035,.72]);
        }
        for(const x of [-.78,.78]){
          mm(t,GEO.box,COL.metalDark,[x,.36,.02],[.18,.72,1.0]);
          mm(t,GEO.box,COL.red,[x,.74,.02],[.055,.035,.78]);
          mm(t,GEO.cyl,COL.metal,[x,.18,.46],[.11,.42,.11],[Math.PI/2,0,0]);
          mm(t,GEO.cyl,COL.metalLight,[x,.18,.68],[.14,.12,.14],[Math.PI/2,0,0]);
        }
        mm(t,GEO.cyl,COL.metalDark,[0,1.34,-.62],[.16,.52,.16]);
        mm(t,GEO.box,COL.metal,[0,1.64,-.62],[.82,.24,.3]);
        mm(t,GEO.box,COL.glass,[0,1.65,-.455],[.58,.14,.025]);
        mm(t,GEO.sphere,COL.cyan,[-.25,1.66,-.43],[.07,.07,.07]);
        mm(t,GEO.sphere,COL.red,[.25,1.66,-.43],[.07,.07,.07]);
        for(const x of [-.48,.48]){
          mm(t,GEO.cyl,COL.metalDark,[x,.62,-.36],[.075,.9,.075]);
          mm(t,GEO.cyl,COL.metalLight,[x,.62,.28],[.09,.9,.09]);
        }
        // Tier IV is the elite/heaviest form: enlarge the complete turret assembly.
        t.scale.set(1.16,1.16,1.16);
      }
      return; // Do not append the legacy halo/crown upgrades to Missile.
    }

    // GUNNER VISUAL PROGRESSION — mechanical upgrades, no decorative halos.
    if(tower.type==='gunner'){
      while(tower.barrels.length<level){
        const b=new THREE.Group();b.position.set(0,.22,.5);tower.turret.add(b);
        mm(b,GEO.cyl,COL.metal,[0,0,.62],[.055,1.2,.055],[Math.PI/2,0,0]);
        mm(b,GEO.cyl,COL.metalLight,[0,0,.4],[.075,.3,.075],[Math.PI/2,0,0]);
        mm(b,GEO.box,COL.metalDark,[0,0,1.2],[.13,.1,.2]);
        mm(b,GEO.cyl,COL.metalDark,[0,0,1.32],[.08,.1,.08],[Math.PI/2,0,0]);
        b.userData.muzzle=muzzleAnchor(b,[0,0,1.42]);b.userData.homeZ=b.position.z;b.userData.recoil=0;
        tower.barrels.push(b);
      }
      tower.barrels.forEach((b,i)=>b.position.x=(i-(level-1)/2)*.17);

      const t=tower.turret;
      if(level===3){
        // Twin ammunition / cooling modules mounted to the turret flanks.
        for(const side of [-1,1]){
          mm(t,GEO.box,COL.metalDark,[side*.72,.19,-.08],[.28,.32,.64]);
          mm(t,GEO.box,COL.playerLight,[side*.72,.37,-.08],[.30,.07,.68]);
          mm(t,GEO.box,COL.cyan,[side*.72,.412,.14],[.18,.025,.22]);
          for(let i=0;i<3;i++)mm(t,GEO.box,COL.black,[side*.865,.18,-.22+i*.13],[.018,.035,.075]);
          mm(t,GEO.cyl,COL.metal,[side*.72,.13,-.43],[.105,.18,.105],[Math.PI/2,0,0]);
        }
        mm(t,GEO.box,COL.metalDark,[0,.27,.48],[.74,.13,.18]);
        mm(t,GEO.box,COL.cyan,[0,.345,.51],[.36,.025,.035]);
      }
      if(level===4){
        for(const side of [-1,1]){
          mm(t,GEO.box,COL.player,[side*.91,.20,-.08],[.12,.40,.76]);
          mm(t,GEO.box,COL.metalLight,[side*.91,.405,.10],[.13,.045,.34]);
          mm(t,GEO.box,COL.cyan,[side*.978,.22,.12],[.018,.055,.24]);
          for(const z of [-.34,.22])mm(t,GEO.cyl,COL.metalLight,[side*.985,.20,z],[.035,.035,.035],[0,0,Math.PI/2]);
        }
        mm(t,GEO.box,COL.metalDark,[0,.49,-.43],[1.08,.17,.48]);
        mm(t,GEO.box,COL.playerLight,[0,.585,-.43],[1.02,.035,.43]);
        for(let i=0;i<5;i++){
          const x=(i-2)*.19;
          mm(t,GEO.box,COL.metal,[x,.68,-.43],[.075,.19,.40]);
          mm(t,GEO.box,COL.cyan,[x,.782,-.43],[.035,.018,.30]);
        }
        mm(t,GEO.box,COL.metalDark,[0,.59,-.70],[.42,.18,.28]);
        mm(t,GEO.box,COL.metalLight,[0,.685,-.70],[.32,.035,.20]);
        for(const side of [-1,1]){
          mm(t,GEO.cyl,COL.black,[side*.12,.61,-.535],[.075,.07,.07],[Math.PI/2,0,0]);
          mm(t,GEO.sphere,COL.cyan,[side*.12,.61,-.49],[.047,.047,.047]);
        }
        mm(t,GEO.box,COL.player,[0,.34,.43],[.92,.16,.20]);
        mm(t,GEO.box,COL.cyan,[0,.425,.45],[.48,.025,.035]);
      }
    }

    // CANNON VISUAL PROGRESSION — field artillery hardware, no ground halos or crowns.
    if(tower.type==='cannon'){
      const t=tower.turret;
      const b=tower.barrel;
      if(level===2){
        // Reinforced chassis flanks and compact ammunition boxes.
        for(const side of [-1,1]){
          mm(g,GEO.box,COL.metalDark,[side*.82,.30,0],[.18,.50,1.10]);
          mm(g,GEO.box,COL.orange,[side*.82,.56,0],[.055,.025,1.02]);
          mm(t,GEO.box,COL.metalDark,[side*.62,.20,-.03],[.16,.34,.76]);
          mm(t,GEO.box,COL.playerLight,[side*.62,.39,-.03],[.17,.045,.62]);
          mm(t,GEO.box,COL.orange,[side*.708,.23,.13],[.018,.055,.36]);
          // Side-mounted ammunition bins, fitted behind the barrel pivot.
          mm(t,GEO.box,COL.black,[side*.39,.13,-.56],[.29,.34,.40]);
          mm(t,GEO.box,COL.metalLight,[side*.39,.31,-.56],[.30,.055,.41]);
          mm(t,GEO.box,COL.orange,[side*.39,.342,-.56],[.18,.018,.28]);
        }
        mm(t,GEO.box,COL.metalDark,[0,.46,-.51],[.54,.12,.40]);
        mm(t,GEO.box,COL.orange,[0,.528,-.51],[.26,.018,.28]);
      }
      if(level===3){
        // Armored breech and paired hydraulic recoil cylinders.
        mm(t,GEO.box,COL.player,[0,.39,-.39],[.88,.43,.62]);
        mm(t,GEO.box,COL.metalLight,[0,.625,-.39],[.66,.045,.42]);
        for(const side of [-1,1]){
          mm(t,GEO.cyl,COL.metalDark,[side*.34,.30,.68],[.092,.90,.092],[Math.PI/2,0,0]);
          mm(t,GEO.cyl,COL.metalLight,[side*.34,.30,.96],[.052,.42,.052],[Math.PI/2,0,0]);
          mm(t,GEO.cyl,COL.black,[side*.34,.30,.34],[.12,.13,.12],[Math.PI/2,0,0]);
          mm(t,GEO.box,COL.orange,[side*.34,.405,.68],[.16,.035,.30]);
          // Bolted recoil-arm brackets.
          mm(t,GEO.box,COL.metalDark,[side*.42,.22,.38],[.16,.24,.22]);
        }
        // Compact rangefinder mounted to the turret roof.
        mm(t,GEO.box,COL.metalDark,[0,.72,-.34],[.40,.18,.34]);
        mm(t,GEO.box,COL.metalLight,[0,.82,-.32],[.31,.035,.22]);
        mm(t,GEO.box,COL.black,[0,.74,-.155],[.18,.10,.035]);
        mm(t,GEO.sphere,COL.orange,[0,.75,-.125],[.052,.052,.052]);
        // Functional multi-port muzzle brake on the end of the cannon tube.
        mm(b,GEO.cyl,COL.metalDark,[0,0,1.94],[.22,.38,.22],[Math.PI/2,0,0]);
        mm(b,GEO.cyl,COL.metalLight,[0,0,2.08],[.225,.055,.225],[Math.PI/2,0,0]);
        for(const side of [-1,1]){
          mm(b,GEO.box,COL.black,[side*.13,0,1.94],[.07,.105,.24]);
        }
        mm(b,GEO.box,COL.orange,[0,.115,1.94],[.15,.025,.23]);
        if(b.userData.muzzle)b.userData.muzzle.position.z=2.12;
      }
      if(level===4){
        // Reinforced barrel sleeve and short functional clamp bands.
        mm(b,GEO.cyl,COL.metalDark,[0,0,1.05],[.19,1.38,.19],[Math.PI/2,0,0]);
        for(const z of [.62,1.02,1.42]){
          mm(b,GEO.cyl,COL.metalLight,[0,0,z],[.205,.075,.205],[Math.PI/2,0,0]);
        }
        // Extended muzzle shroud with three visible exhaust slots.
        mm(b,GEO.cyl,COL.player,[0,0,2.02],[.255,.48,.255],[Math.PI/2,0,0]);
        for(const side of [-1,1]){
          mm(b,GEO.box,COL.black,[side*.16,0,2.02],[.055,.12,.27]);
          mm(b,GEO.box,COL.orange,[side*.205,0,2.02],[.018,.045,.22]);
        }
        mm(b,GEO.box,COL.black,[0,.19,2.02],[.12,.045,.25]);
        // Heavy autoloader housing on the rear deck.
        mm(t,GEO.box,COL.metalDark,[0,.66,-.78],[.86,.42,.52]);
        mm(t,GEO.box,COL.playerLight,[0,.885,-.78],[.76,.055,.43]);
        mm(t,GEO.box,COL.orange,[0,.919,-.78],[.52,.018,.30]);
        // Cooling louvers and reinforced side armor.
        for(let i=0;i<4;i++){
          const x=(i-1.5)*.16;
          mm(t,GEO.box,COL.metal,[x,.96,-.78],[.075,.12,.30]);
        }
        for(const side of [-1,1]){
          mm(t,GEO.box,COL.player,[side*.78,.22,-.06],[.16,.47,.88]);
          mm(t,GEO.box,COL.metalLight,[side*.78,.47,-.02],[.17,.045,.54]);
          mm(t,GEO.box,COL.orange,[side*.87,.24,.20],[.018,.06,.28]);
          // Dual targeting optics integrated into the rear armor, not floating above it.
          mm(t,GEO.box,COL.metalDark,[side*.23,.72,-.48],[.20,.16,.25]);
          mm(t,GEO.sphere,COL.orange,[side*.23,.76,-.34],[.055,.055,.055]);
        }
        // Front mantlet ties the barrel and recoil gear into one heavy assembly.
        mm(t,GEO.box,COL.player,[0,.35,.46],[.96,.22,.24]);
        mm(t,GEO.box,COL.orange,[0,.47,.49],[.42,.028,.045]);
        if(b.userData.muzzle)b.userData.muzzle.position.z=2.27;
      }
    }

    // Shared low-tier chassis upgrade remains for towers other than Cannon.
    if(level===2&&tower.type!=='cannon'){
      mm(g,GEO.box,COL.metalDark,[-.82,.3,0],[.18,.5,1.1]);
      mm(g,GEO.box,COL.metalDark,[.82,.3,0],[.18,.5,1.1]);
      mm(g,GEO.box,accent,[-.82,.55,0],[.06,.02,1.05]);
      mm(g,GEO.box,accent,[.82,.55,0],[.06,.02,1.05]);
      if(tower.type==='missile'){
        mm(tower.turret,GEO.box,COL.red,[0,.82,0],[.35,.12,.55]);
        mm(tower.turret,GEO.box,COL.gold,[0,.89,0],[.36,.02,.56]);
      }
    }
    // Preserve the original tier-III treatment for the remaining tower classes.
    if(level===3&&tower.type!=='gunner'&&tower.type!=='cannon'){
      const ring=mm(g,GEO.torus,COL.gold,[0,.48,0],[1.9,1.9,1.9],[Math.PI/2,0,0]);
      ring.material=COL.gold;
      mm(g,GEO.box,COL.cyan,[0,1.0,-.8],[.06,1.2,.06]);
      mm(g,GEO.sphere,COL.cyan,[0,1.65,-.8],[.13,.13,.13]);
      mm(g,GEO.box,COL.gold,[0,.42,.9],[.6,.04,.2]);
      if(tower.type==='laser'&&tower.crystal)tower.crystal.scale.set(.82,1.7,.82);
      if(tower.type==='tesla'&&tower.orb)tower.orb.scale.set(.62,.62,.62);
    }
    // Preserve the original tier-IV treatment for the remaining tower classes.
    if(level===4&&tower.type!=='gunner'&&tower.type!=='cannon'){
      mm(g,GEO.torus,accent,[0,.62,0],[2.1,2.1,2.1],[Math.PI/2,0,0]);
      for(const [sx,sz] of [[1,1],[-1,1],[1,-1],[-1,-1]]){
        mm(g,GEO.cyl,COL.metalDark,[sx*.78,.55,sz*.78],[.12,.9,.12]);
        mm(g,GEO.sphere,accent,[sx*.78,1.05,sz*.78],[.15,.15,.15]);
      }
      mm(tower.turret,GEO.box,COL.gold,[0,.5,0],[.3,.06,.3]);
      if(tower.type==='laser'&&tower.crystal)tower.crystal.scale.set(1,2.1,1);
      if(tower.type==='tesla'&&tower.orb)tower.orb.scale.set(.8,.8,.8);
    }
  },
  infantry(){
    const g=new THREE.Group();const body=M(0x4a5a4a),dark=COL.dark,gear=M(0x3a4a3a),skin=M(0x8a7a6a);
    mm(g,GEO.capsule,body,[0,.68,0],[.36,.5,.36]);
    mm(g,GEO.box,M(0x5a6a5a),[0,.72,.14],[.28,.32,.06]);
    mm(g,GEO.box,dark,[0,.45,0],[.4,.12,.38]);
    mm(g,GEO.box,M(0x2a3a2a),[.16,.45,.18],[.14,.16,.1]);
    mm(g,GEO.box,M(0x2a3a2a),[-.16,.45,.18],[.14,.16,.1]);
    mm(g,GEO.sphere,skin,[0,1.12,0],[.38,.38,.38]);
    mm(g,GEO.sphere,dark,[0,1.18,0],[.42,.32,.42]);
    mm(g,GEO.cyl6,dark,[0,1.04,0],[.5,.08,.5]);
    mm(g,GEO.box,M(0x1a2a2a),[0,1.13,.18],[.28,.08,.04]);
    mm(g,GEO.cyl,dark,[.15,1.3,-.08],[.015,.35,.015]);
    mm(g,GEO.sphere,COL.red,[.15,1.5,-.08],[.04,.04,.04]);
    mm(g,GEO.box,gear,[0,.7,-.22],[.32,.42,.16]);
    mm(g,GEO.box,M(0x2a3a2a),[0,.6,-.32],[.16,.18,.06]);
    mm(g,GEO.box,M(0x2a3a2a),[0,.8,-.32],[.16,.18,.06]);
    mm(g,GEO.box,body,[.24,.86,.14],[.1,.28,.1],[.5,0,.3]);
    mm(g,GEO.box,body,[-.22,.86,.1],[.1,.28,.1],[.5,0,-.3]);
    mm(g,GEO.box,dark,[.24,.86,.36],[.06,.08,.5]);
    mm(g,GEO.box,dark,[.24,.78,.5],[.04,.14,.06]);
    mm(g,GEO.box,COL.metal,[.24,.94,.28],[.02,.03,.12]);
    mm(g,GEO.box,dark,[.12,.2,0],[.16,.42,.18]);
    mm(g,GEO.box,dark,[-.12,.2,0],[.16,.42,.18]);
    mm(g,GEO.box,M(0x1a1a1a),[.12,.04,.04],[.18,.1,.24]);
    mm(g,GEO.box,M(0x1a1a1a),[-.12,.04,.04],[.18,.1,.24]);
    mm(g,GEO.sphere,COL.red,[-.24,1.0,.12],[.05,.05,.05]);
    g.userData.height=1.55;return g;},
  technical(){
    const g=new THREE.Group();const body=M(0x3a4038),dark=COL.dark,metal=COL.metalDark;
    mm(g,GEO.box,body,[0,.42,0],[1.05,.42,1.9]);
    mm(g,GEO.box,body,[0,.5,.7],[1.0,.28,.5]);
    mm(g,GEO.box,M(0x2a302a),[0,.64,.7],[.95,.04,.48]);
    mm(g,GEO.box,M(0x2a302a),[0,.68,-.15],[.9,.35,.9]);
    mm(g,GEO.box,COL.glass,[0,.72,.35],[.78,.22,.06]);
    mm(g,GEO.box,COL.glass,[.44,.72,-.1],[.04,.18,.55]);
    mm(g,GEO.box,COL.glass,[-.44,.72,-.1],[.04,.18,.55]);
    mm(g,GEO.box,COL.glass,[0,.72,-.6],[.6,.18,.04]);
    mm(g,GEO.box,dark,[0,.86,-.15],[.92,.04,.92]);
    mm(g,GEO.box,metal,[0,.28,.94],[1.0,.14,.12]);
    mm(g,GEO.box,metal,[0,.28,-.94],[1.0,.14,.12]);
    mm(g,GEO.box,dark,[0,.5,.93],[.7,.16,.04]);
    for(let i=0;i<3;i++)mm(g,GEO.box,COL.metal,[0,.44+i*.06,.94],[.62,.02,.02]);
    mm(g,GEO.sphere,COL.gold,[.35,.55,.93],[.12,.12,.06]);
    mm(g,GEO.sphere,COL.gold,[-.35,.55,.93],[.12,.12,.06]);
    mm(g,GEO.box,COL.red,[.35,.5,-.94],[.15,.1,.03]);
    mm(g,GEO.box,COL.red,[-.35,.5,-.94],[.15,.1,.03]);
    for(const s of [-1,1])for(const z of [-.6,.6])wheel(g,s*.52,z,.3,.18);
    mm(g,GEO.box,metal,[0,.88,-.15],[.8,.04,.8]);
    mm(g,GEO.box,metal,[0,.88,-.55],[.8,.04,.06]);
    mm(g,GEO.box,metal,[0,.88,.25],[.8,.04,.06]);
    const gun=new THREE.Group();gun.position.set(0,.95,.45);g.add(gun);
    mm(gun,GEO.cyl,metal,[0,0,0],[.14,.08,.14]);
    mm(gun,GEO.box,metal,[0,0,.05],[.16,.16,.4]);
    mm(gun,GEO.cyl,COL.metal,[0,0,.38],[.06,.55,.06],[Math.PI/2,0,0]);
    mm(gun,GEO.box,dark,[0,0,.62],[.1,.08,.12]);
    mm(g,GEO.box,dark,[.52,.72,.28],[.06,.08,.12]);
    mm(g,GEO.box,dark,[-.52,.72,.28],[.06,.08,.12]);
    mm(g,GEO.cyl,dark,[-.35,.7,-.5],[.015,.5,.015]);
    g.userData.height=1.7;return g;},
  apc(){
    const g=new THREE.Group();const body=M(0x39463c),dark=COL.dark,metal=COL.metalDark;
    mm(g,GEO.box,body,[0,.4,0],[1.55,.4,2.4]);
    mm(g,GEO.box,body,[0,.72,0],[1.5,.28,2.3]);
    mm(g,GEO.box,M(0x2e3a30),[0,.82,1.05],[1.45,.28,.5],[-.32,0,0]);
    mm(g,GEO.box,M(0x2e3a30),[0,.68,-1.22],[1.4,.5,.08]);
    mm(g,GEO.box,metal,[.78,.32,0],[.06,.4,2.35]);
    mm(g,GEO.box,metal,[-.78,.32,0],[.06,.4,2.35]);
    for(const s of [-1,1])for(const z of [-.9,-.3,.3,.9])wheel(g,s*.78,z,.34,.2);
    mm(g,GEO.sphere,COL.gold,[.6,.72,1.28],[.11,.11,.06]);
    mm(g,GEO.sphere,COL.gold,[-.6,.72,1.28],[.11,.11,.06]);
    mm(g,GEO.box,COL.red,[.6,.66,-1.26],[.14,.08,.03]);
    mm(g,GEO.box,COL.red,[-.6,.66,-1.26],[.14,.08,.03]);
    mm(g,GEO.box,metal,[.3,.9,-.2],[.4,.06,.4]);
    mm(g,GEO.box,metal,[-.3,.9,.3],[.4,.06,.4]);
    mm(g,GEO.box,dark,[0,.72,-1.05],[.6,.06,.14]);
    for(let i=0;i<3;i++)mm(g,GEO.box,metal,[0,.68+i*.03,-1.05],[.55,.02,.1]);
    mm(g,GEO.cyl,dark,[.55,.72,-1.0],[.015,.7,.015]);
    mm(g,GEO.sphere,COL.red,[.55,1.4,-1.0],[.04,.04,.04]);
    const t=new THREE.Group();t.position.y=.95;g.add(t);
    mm(t,GEO.cyl6,metal,[0,.12,0],[.62,.28,.62]);
    mm(t,GEO.box,metal,[0,.28,0],[.42,.08,.42]);
    mm(t,GEO.cyl,COL.metal,[0,.15,.4],[.07,.9,.07],[Math.PI/2,0,0]);
    mm(t,GEO.box,metal,[0,.15,.82],[.14,.12,.14]);
    mm(g,GEO.box,metal,[.55,.35,1.22],[.12,.14,.06]);
    mm(g,GEO.box,metal,[-.55,.35,1.22],[.12,.14,.06]);
    g.userData.height=2.1;return g;},
  tank(){
    const g=new THREE.Group();const body=M(0x3f4a3a),dark=COL.dark,metal=COL.metalDark,metalL=COL.metalLight;
    mm(g,GEO.box,body,[0,.36,0],[1.2,.36,2.05]);
    mm(g,GEO.box,body,[0,.6,0],[1.35,.24,1.9]);
    mm(g,GEO.box,M(0x4a5540),[0,.72,.72],[1.32,.2,.62],[-.32,0,0]);
    for(const s of [-1,1]){
      for(let i=0;i<8;i++)mm(g,GEO.box,COL.rubber,[s*.65,.16,-.85+i*.24],[.35,.24,.22]);
      mm(g,GEO.box,dark,[s*.65,.22,0],[.42,.12,2.15]);
      for(const z of [-.72,-.24,.24,.72])wheel(g,s*.65,z,.24,.12);}
    mm(g,GEO.box,metal,[.78,.4,0],[.06,.14,2.15]);
    mm(g,GEO.box,metal,[-.78,.4,0],[.06,.14,2.15]);
    mm(g,GEO.box,body,[.7,.65,0],[.14,.18,2.1]);
    mm(g,GEO.box,body,[-.7,.65,0],[.14,.18,2.1]);
    mm(g,GEO.box,metal,[0,.55,-1.0],[1.3,.4,.1]);
    mm(g,GEO.box,dark,[.5,.6,-1.06],[.3,.2,.06]);
    mm(g,GEO.box,dark,[-.5,.6,-1.06],[.3,.2,.06]);
    mm(g,GEO.box,M(0x2a3a2a),[.65,.82,-.6],[.24,.16,.5]);
    mm(g,GEO.box,M(0x2a3a2a),[-.65,.82,-.6],[.24,.16,.5]);
    mm(g,GEO.sphere,COL.gold,[.55,.72,.95],[.1,.1,.06]);
    mm(g,GEO.sphere,COL.gold,[-.55,.72,.95],[.1,.1,.06]);
    mm(g,GEO.torusThin,COL.metal,[.4,.85,-.9],[.4,.4,.4],[0,0,0]);
    const turret=new THREE.Group();turret.position.y=.82;g.add(turret);
    mm(turret,GEO.cyl6,body,[0,.16,0],[1.1,.34,1.0]);
    mm(turret,GEO.box,body,[0,.34,0],[.9,.1,.86]);
    mm(turret,GEO.box,body,[0,.3,-.55],[.85,.24,.36]);
    mm(turret,GEO.box,metal,[0,.42,-.55],[.86,.04,.37]);
    for(const s of [-1,1])mm(turret,GEO.box,metalL,[s*.52,.16,.1],[.06,.26,.6]);
    mm(turret,GEO.box,metal,[.25,.4,.1],[.3,.04,.3]);
    mm(turret,GEO.box,metal,[-.25,.4,.1],[.3,.04,.3]);
    mm(turret,GEO.box,metal,[0,.24,.45],[.45,.28,.24]);
    const barrel=new THREE.Group();turret.add(barrel);
    mm(barrel,GEO.cyl6,COL.metal,[0,.2,1.02],[.14,1.55,.14],[Math.PI/2,0,0]);
    mm(barrel,GEO.cyl,metal,[0,.2,.85],[.19,.7,.19],[Math.PI/2,0,0]);
    mm(barrel,GEO.box,metal,[0,.2,1.72],[.28,.18,.3]);
    mm(barrel,GEO.cyl,COL.metalLight,[0,.2,1.92],[.18,.16,.18],[Math.PI/2,0,0]);
    mm(turret,GEO.box,metal,[.3,.2,.4],[.05,.06,.6]);
    mm(turret,GEO.cyl,dark,[.4,.55,-.35],[.015,.7,.015]);
    mm(turret,GEO.sphere,COL.red,[.4,1.2,-.35],[.04,.04,.04]);
    mm(turret,GEO.box,metal,[-.2,.5,.15],[.14,.1,.14]);
    mm(turret,GEO.sphere,COL.cyan,[-.2,.55,.22],[.05,.05,.05]);
    mm(turret,GEO.box,COL.hazard,[0,.36,.85],[.06,.02,.1]);
    g.userData.turret=turret;g.userData.barrel=barrel;g.userData.height=2.2;return g;},
  helicopter(){
    const g=new THREE.Group();const body=M(0x2f3a42),dark=COL.dark,metal=COL.metalDark;
    mm(g,GEO.capsule,body,[0,1.75,0],[.72,.8,1.25]);
    mm(g,GEO.sphere,body,[0,1.75,.95],[.6,.55,.5]);
    mm(g,GEO.sphere,COL.glass,[0,1.85,.62],[.55,.5,.55]);
    mm(g,GEO.box,COL.glass,[0,1.75,.85],[.4,.3,.15]);
    mm(g,GEO.box,dark,[0,2.1,.62],[.58,.04,.3]);
    mm(g,GEO.box,dark,[0,1.75,.9],[.05,.5,.05]);
    mm(g,GEO.box,body,[.4,1.6,-.15],[.04,.5,.55]);
    mm(g,GEO.box,body,[-.4,1.6,-.15],[.04,.5,.55]);
    mm(g,GEO.box,body,[0,1.6,-1.35],[.16,.16,1.8]);
    mm(g,GEO.cyl,metal,[0,1.6,-2.2],[.1,.25,.1],[Math.PI/2,0,0]);
    mm(g,GEO.box,body,[0,1.9,-2.3],[.06,.5,.3],[0,0,0]);
    mm(g,GEO.box,body,[0,1.5,-2.3],[.06,.3,.3]);
    const tail=new THREE.Group();tail.position.set(0,1.7,-2.2);g.add(tail);
    mm(tail,GEO.cyl,COL.metal,[0,0,0],[.06,.7,.06],[0,0,Math.PI/2]);
    mm(tail,GEO.cyl,dark,[0,0,0],[.1,.08,.1],[0,0,Math.PI/2]);
    const rotor=new THREE.Group();rotor.position.set(0,2.35,.05);g.add(rotor);
    mm(rotor,GEO.cyl,dark,[0,0,0],[.16,.12,.16]);
    mm(rotor,GEO.cyl,metal,[0,-.05,0],[.24,.1,.24]);
    for(let i=0;i<4;i++){const b=mm(rotor,GEO.box,COL.rubber,[0,0,0],[2.8,.03,.1]);
      b.rotation.y=i*Math.PI/2;
      const tip=mm(rotor,GEO.box,COL.metal,[0,0,0],[.1,.035,.12]);
      tip.position.set(Math.cos(i*Math.PI/2)*1.35,0,Math.sin(i*Math.PI/2)*1.35);}
    mm(g,GEO.box,metal,[.5,1.35,.1],[.06,.06,.7]);
    mm(g,GEO.box,metal,[-.5,1.35,.1],[.06,.06,.7]);
    for(const s of [-1,1]){
      mm(g,GEO.cyl,metal,[s*.5,1.15,.1],[.16,.5,.16],[Math.PI/2,0,0]);
      mm(g,GEO.cyl,COL.metalLight,[s*.5,1.15,.4],[.18,.05,.18],[Math.PI/2,0,0]);}
    for(const s of [-1,1])mm(g,GEO.box,metal,[s*.35,.85,.1],[.08,.06,1.6]);
    for(const s of [-1,1])for(const z of [-.5,.5])mm(g,GEO.box,metal,[s*.35,1.15,z],[.05,.45,.05]);
    mm(g,GEO.cyl,dark,[0,1.55,-1.1],[.015,.4,.015]);
    mm(g,GEO.cyl,dark,[.3,1.4,-.9],[.015,.3,.015]);
    mm(g,GEO.cyl,dark,[.35,1.85,-.4],[.14,.18,.14],[Math.PI/2-.3,0,0]);
    mm(g,GEO.cyl,dark,[-.35,1.85,-.4],[.14,.18,.14],[Math.PI/2-.3,0,0]);
    mm(g,GEO.sphere,metal,[0,1.5,.9],[.16,.16,.16]);
    mm(g,GEO.sphere,COL.red,[0,1.5,.98],[.06,.06,.06]);
    g.userData.rotor=rotor;g.userData.tailRotor=tail;g.userData.height=3.0;return g;},
  jet(){
    const g=new THREE.Group();const body=M(0x37424c),dark=COL.dark,metal=COL.metalDark;
    mm(g,GEO.cone,body,[0,0,0],[.5,2.3,.5],[Math.PI/2,0,0]);
    mm(g,GEO.sphere,COL.glass,[0,.14,.65],[.34,.22,.5]);
    mm(g,GEO.box,COL.glassDark,[0,.18,.8],[.24,.08,.25]);
    mm(g,GEO.cone,body,[0,.02,1.6],[.32,.5,.32],[Math.PI/2,0,0]);
    mm(g,GEO.sphere,COL.red,[0,.02,1.85],[.06,.06,.06]);
    mm(g,GEO.box,body,[0,-.02,-.1],[2.0,.06,.55]);
    mm(g,GEO.box,body,[0,.02,-.15],[2.1,.04,.4]);
    mm(g,GEO.box,metal,[.98,-.02,-.1],[.06,.08,.5]);
    mm(g,GEO.box,metal,[-.98,-.02,-.1],[.06,.08,.5]);
    for(const s of [-1,1])for(const z of [0,-.4]){
      mm(g,GEO.cyl,metal,[s*.7,-.1,z],[.06,.4,.06],[Math.PI/2,0,0]);
      mm(g,GEO.cone,COL.red,[s*.7,-.1,z+.24],[.06,.15,.06],[Math.PI/2,0,0]);}
    mm(g,GEO.box,body,[0,.28,-1.0],[.06,.42,.4]);
    mm(g,GEO.box,metal,[0,.5,-1.0],[.04,.06,.4]);
    mm(g,GEO.box,body,[.32,.02,-1.05],[.55,.05,.24]);
    mm(g,GEO.box,body,[-.32,.02,-1.05],[.55,.05,.24]);
    mm(g,GEO.box,dark,[.32,-.05,.1],[.16,.2,.5]);
    mm(g,GEO.box,dark,[-.32,-.05,.1],[.16,.2,.5]);
    mm(g,GEO.sphere,COL.orange,[0,0,-1.18],[.32,.32,.12]);
    mm(g,GEO.sphere,COL.orange,[0,0,-1.12],[.24,.24,.06]);
    mm(g,GEO.box,dark,[0,-.16,.4],[.35,.06,.4]);
    g.userData.height=1.8;return g;},
  drone(){
    const g=new THREE.Group();const dark=COL.metalDark,metal=COL.metal;
    mm(g,GEO.box,dark,[0,0,0],[.55,.22,.55]);
    mm(g,GEO.box,metal,[0,.14,0],[.45,.06,.45]);
    mm(g,GEO.box,M(0x1a2028),[0,-.14,0],[.4,.06,.4]);
    mm(g,GEO.box,metal,[.29,0,0],[.04,.16,.5]);
    mm(g,GEO.box,metal,[-.29,0,0],[.04,.16,.5]);
    const rotors=[];
    for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;const cx=Math.cos(a),cz=Math.sin(a);
      const arm=mm(g,GEO.box,metal,[cx*.5,0,cz*.5],[.7,.05,.06]);arm.rotation.y=-a;
      mm(g,GEO.cyl,metal,[cx*.8,.06,cz*.8],[.16,.14,.16]);
      const r=new THREE.Group();r.position.set(cx*.8,.14,cz*.8);g.add(r);
      mm(r,GEO.cyl,COL.rubber,[0,0,0],[.34,.02,.34]);
      mm(r,GEO.cyl,COL.metal,[0,.02,0],[.1,.04,.1]);rotors.push(r);}
    mm(g,GEO.sphere,dark,[0,-.06,.3],[.13,.13,.13]);
    mm(g,GEO.sphere,COL.red,[0,-.08,.4],[.05,.05,.05]);
    mm(g,GEO.sphere,COL.green,[.24,.08,-.18],[.04,.04,.04]);
    mm(g,GEO.sphere,COL.red,[-.24,.08,-.18],[.04,.04,.04]);
    mm(g,GEO.cyl,dark,[.15,.2,-.2],[.012,.25,.012]);
    mm(g,GEO.cyl,dark,[-.15,.2,-.2],[.012,.25,.012]);
    g.userData.rotors=rotors;g.userData.height=1.5;return g;},
  robot(){
    const g=new THREE.Group();const body=COL.robot,metal=COL.metalDark,light=COL.robotLight;
    mm(g,GEO.box,body,[0,1.35,0],[.85,1.05,.65]);
    mm(g,GEO.box,light,[0,1.4,.32],[.7,.7,.08]);
    mm(g,GEO.sphere,COL.red,[0,1.4,.4],[.14,.14,.06]);
    mm(g,GEO.torus,COL.metal,[0,1.4,.38],[.32,.32,.32],[Math.PI/2,0,0]);
    mm(g,GEO.box,metal,[0,1.35,-.3],[.75,.85,.06]);
    mm(g,GEO.box,COL.cyan,[0,1.4,-.35],[.5,.04,.03]);
    mm(g,GEO.box,metal,[0,2.0,0],[.55,.4,.5]);
    mm(g,GEO.box,light,[0,2.02,.24],[.45,.06,.04]);
    mm(g,GEO.box,COL.red,[0,2.02,.27],[.4,.1,.03]);
    mm(g,GEO.sphere,COL.red,[.15,2.04,.29],[.05,.05,.03]);
    mm(g,GEO.sphere,COL.red,[-.15,2.04,.29],[.05,.05,.03]);
    mm(g,GEO.cyl,metal,[0,2.28,-.1],[.02,.2,.02]);
    for(const s of [-1,1]){
      mm(g,GEO.box,light,[s*.62,1.7,0],[.3,.4,.5]);
      mm(g,GEO.box,metal,[s*.62,1.7,.26],[.24,.3,.06]);
      mm(g,GEO.box,COL.hazard,[s*.62,1.5,.26],[.24,.04,.06]);
      mm(g,GEO.sphere,COL.orange,[s*.62,1.86,.1],[.06,.06,.06]);}
    mm(g,GEO.box,metal,[.62,1.35,0],[.22,.5,.24]);
    mm(g,GEO.box,metal,[-.62,1.35,0],[.22,.5,.24]);
    mm(g,GEO.box,light,[.62,1.0,.15],[.2,.44,.2]);
    mm(g,GEO.box,light,[-.62,1.0,.15],[.2,.44,.2]);
    mm(g,GEO.box,metal,[.62,1.0,.35],[.24,.28,.18]);
    mm(g,GEO.box,metal,[-.62,1.0,.35],[.24,.28,.18]);
    mm(g,GEO.cyl,COL.metal,[.62,1.0,.52],[.08,.22,.08],[Math.PI/2,0,0]);
    mm(g,GEO.cyl,COL.metal,[-.62,1.0,.52],[.08,.22,.08],[Math.PI/2,0,0]);
    mm(g,GEO.cyl,metal,[0,.75,0],[.5,.24,.5],[0,0,Math.PI/2]);
    const legs=[];
    for(const s of [-1,1]){const leg=new THREE.Group();leg.position.set(s*.3,.8,0);g.add(leg);
      mm(leg,GEO.box,metal,[0,-.3,0],[.22,.65,.24]);
      mm(leg,GEO.sphere,light,[0,-.62,.05],[.16,.16,.16]);
      mm(leg,GEO.box,light,[0,-.85,.05],[.24,.5,.28]);
      mm(leg,GEO.box,body,[0,-1.1,.12],[.3,.18,.5]);
      mm(leg,GEO.box,metal,[0,-1.08,.3],[.26,.06,.16]);legs.push(leg);}
    for(let i=0;i<3;i++)mm(g,GEO.box,COL.hazard,[0,1.7-i*.15,-.34],[.5,.03,.02]);
    g.userData.legs=legs;g.userData.height=2.6;return g;},
  heavy(){
    const g=new THREE.Group();const body=COL.robot,metal=COL.metalDark,light=COL.robotLight;
    mm(g,GEO.box,body,[0,1.6,0],[1.25,1.3,.9]);
    mm(g,GEO.box,light,[0,1.65,.48],[1.0,.9,.1]);
    mm(g,GEO.box,metal,[0,1.65,.55],[.85,.6,.06]);
    mm(g,GEO.sphere,COL.orange,[0,1.65,.6],[.24,.24,.08]);
    mm(g,GEO.torus,COL.metal,[0,1.65,.55],[.5,.5,.5],[Math.PI/2,0,0]);
    mm(g,GEO.torus,COL.metal,[0,1.65,.55],[.38,.38,.38],[Math.PI/2,0,0]);
    mm(g,GEO.box,metal,[0,1.6,-.5],[1.1,1.0,.1]);
    mm(g,GEO.box,COL.cyan,[0,1.4,-.56],[.7,.04,.04]);
    mm(g,GEO.box,COL.cyan,[0,1.85,-.56],[.5,.04,.04]);
    mm(g,GEO.box,metal,[0,2.4,0],[.7,.45,.6]);
    mm(g,GEO.box,light,[0,2.42,.3],[.6,.08,.06]);
    mm(g,GEO.box,COL.orange,[0,2.4,.35],[.5,.14,.04]);
    mm(g,GEO.box,COL.glassDark,[.35,2.4,.2],[.04,.14,.3]);
    mm(g,GEO.box,COL.glassDark,[-.35,2.4,.2],[.04,.14,.3]);
    mm(g,GEO.sphere,COL.red,[.25,2.55,.2],[.06,.06,.06]);
    mm(g,GEO.sphere,COL.red,[-.25,2.55,.2],[.06,.06,.06]);
    mm(g,GEO.sphere,COL.red,[0,2.55,.25],[.08,.08,.06]);
    for(const s of [-1,1]){
      mm(g,GEO.box,light,[s*.9,1.85,0],[.4,.7,.8]);
      mm(g,GEO.box,metal,[s*.9,1.85,.42],[.35,.55,.05]);
      mm(g,GEO.box,COL.hazard,[s*.9,1.5,.42],[.35,.05,.05]);
      mm(g,GEO.box,body,[s*.9,2.2,0],[.35,.15,.75]);
      mm(g,GEO.sphere,COL.orange,[s*.9,2.28,0],[.06,.06,.06]);}
    mm(g,GEO.box,metal,[.9,1.5,0],[.32,.55,.36]);
    mm(g,GEO.box,metal,[-.9,1.5,0],[.32,.55,.36]);
    mm(g,GEO.box,light,[.9,1.05,.1],[.3,.55,.32]);
    mm(g,GEO.box,light,[-.9,1.05,.1],[.3,.55,.32]);
    for(const s of [-1,1]){
      mm(g,GEO.box,metal,[s*.95,1.05,.4],[.36,.4,.3]);
      mm(g,GEO.cyl,COL.metal,[s*.95,1.05,.62],[.1,.3,.1],[Math.PI/2,0,0]);
      mm(g,GEO.cyl,metal,[s*.95,1.05,.8],[.14,.16,.14],[Math.PI/2,0,0]);}
    mm(g,GEO.box,body,[0,.85,0],[1.1,.4,.7]);
    mm(g,GEO.cyl,metal,[0,.85,.42],[.4,.3,.4],[Math.PI/2,0,0]);
    const legs=[];
    for(const s of [-1,1]){const leg=new THREE.Group();leg.position.set(s*.42,.85,0);g.add(leg);
      mm(leg,GEO.box,metal,[0,-.32,0],[.32,.7,.38]);
      mm(leg,GEO.cyl,COL.metal,[s*.15,-.32,.28],[.06,.6,.06]);
      mm(leg,GEO.sphere,light,[0,-.68,.1],[.22,.22,.22]);
      mm(leg,GEO.box,light,[0,-.95,.15],[.34,.55,.42]);
      mm(leg,GEO.box,metal,[0,-1.25,.2],[.3,.15,.42]);
      mm(leg,GEO.box,body,[0,-1.35,.24],[.42,.18,.7]);
      mm(leg,GEO.box,metal,[0,-1.33,.56],[.36,.06,.2]);
      for(let i=0;i<3;i++)mm(leg,GEO.box,metal,[-s*.12+i*s*.12,-1.42,.55],[.08,.06,.14]);
      legs.push(leg);}
    mm(g,GEO.box,metal,[0,1.7,-.7],[.6,.7,.3]);
    mm(g,GEO.cyl,COL.cyan,[0,1.7,-.88],[.35,.1,.35],[Math.PI/2,0,0]);
    for(let i=0;i<4;i++)mm(g,GEO.box,COL.dark,[0,1.4+i*.15,-.72],[.55,.04,.08]);
    for(let i=0;i<4;i++)mm(g,GEO.box,COL.hazard,[0,2.0-i*.18,.55],[.7,.03,.02]);
    mm(g,GEO.cyl,COL.dark,[.3,2.7,-.2],[.02,.4,.02]);
    mm(g,GEO.sphere,COL.red,[.3,3.0,-.2],[.05,.05,.05]);
    g.userData.legs=legs;g.userData.height=3.2;return g;},
  baseStation(accent=COL.cyan){
    const g=new THREE.Group();
    mm(g,GEO.cyl6,M(0x1a242c),[0,.22,0],[5.2,.44,5.2]);
    mm(g,GEO.cyl6,COL.metalDark,[0,.48,0],[4.4,.16,4.4]);
    mm(g,GEO.box,COL.metalDark,[0,1.1,0],[3.0,1.4,3.0]);
    mm(g,GEO.box,COL.metal,[0,1.9,0],[3.3,.24,3.3]);
    mm(g,GEO.box,COL.metalDark,[0,2.05,0],[2.9,.06,2.9]);
    mm(g,GEO.box,COL.cyan,[0,1.1,1.52],[1.4,.08,.06]);
    mm(g,GEO.box,COL.cyan,[0,1.1,-1.52],[1.4,.08,.06]);
    mm(g,GEO.box,COL.cyan,[1.52,1.1,0],[.06,.08,1.4]);
    mm(g,GEO.box,COL.cyan,[-1.52,1.1,0],[.06,.08,1.4]);
    for(const s of [-1,1]){
      mm(g,GEO.box,COL.metal,[s*1.52,1.5,.5],[.02,.4,.6]);
      mm(g,GEO.box,COL.metal,[s*1.52,1.5,-.5],[.02,.4,.6]);
      mm(g,GEO.box,COL.metal,[.5,1.5,s*1.52],[.6,.4,.02]);
      mm(g,GEO.box,COL.metal,[-.5,1.5,s*1.52],[.6,.4,.02]);}
    for(const sx of [-1,1])for(const sz of [-1,1])
      mm(g,GEO.box,COL.metal,[sx*1.5,.85,sz*1.5],[.16,1.4,.16]);
    const radar=new THREE.Group();radar.position.set(0,2.2,0);g.add(radar);
    mm(radar,GEO.cyl,COL.metal,[0,.35,0],[.12,.7,.12]);
    mm(radar,GEO.cyl,COL.metalDark,[0,.1,0],[.3,.16,.3]);
    const dish=mm(radar,GEO.cone,COL.metal,[0,.85,.1],[1.0,.32,1.0],[Math.PI/2,0,0]);
    dish.rotation.x=Math.PI/2-.3;
    mm(radar,GEO.sphere,COL.red,[0,.92,.32],[.08,.08,.08]);
    mm(g,GEO.box,COL.metalDark,[0,2.3,0],[.2,1.6,.2]);
    mm(g,GEO.box,COL.metal,[0,2.1,0],[.3,.06,.3]);
    mm(g,GEO.box,COL.metal,[0,2.6,0],[.3,.06,.3]);
    mm(g,GEO.sphere,COL.red,[0,3.2,0],[.14,.14,.14]);
    mm(g,GEO.sphere,COL.orange,[0,3.2,0],[.08,.08,.08]);
    const shield=mm(g,GEO.sphere,accent,[0,1.2,0],[7.2,4.2,7.2]);
    shield.material=new THREE.MeshBasicMaterial({color:accent.color,transparent:true,opacity:.055,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false});
    g.userData.radar=radar;g.userData.shield=shield;return g;}
};

/* ========== ENHANCED DETAIL PASS ========== */
const DETAIL={
  armor:M(0x53616a,{metalness:.78,roughness:.38}),
  armorDark:M(0x202a32,{metalness:.82,roughness:.42}),
  panel:M(0x111a22,{metalness:.45,roughness:.72}),
  glassBlue:M(0x0b3446,{metalness:.75,roughness:.12,emissive:0x0b5b78,emissiveIntensity:.85}),
  amber:M(0xffb347,{emissive:0xff7a16,emissiveIntensity:.7}),
  red:M(0xff3e48,{emissive:0xff1724,emissiveIntensity:.85}),
  cyan:M(0x5ee7ff,{emissive:0x1bcfff,emissiveIntensity:1.1}),
  violet:M(0xb388ff,{emissive:0x783dff,emissiveIntensity:.9}),
  green:M(0x5effc2,{emissive:0x1aff9a,emissiveIntensity:.8})
};
function detailBoltRow(parent,points,mat=COL.metalLight,r=.035){
  for(const p of points)mm(parent,GEO.sphere,mat,p,[r,r,r]);
}
function detailVent(parent,x,y,z,count=4,axis='x'){
  for(let i=0;i<count;i++){
    const off=(i-(count-1)/2)*.11;
    const p=axis==='x'?[x+off,y,z]:[x,y,z+off];
    mm(parent,GEO.box,COL.black,p,axis==='x'?[.035,.025,.18]:[.18,.025,.035]);
  }
}
function enhanceModel(type,g,args=[]){
  if(g.userData.__detailPass)return g;
  g.userData.__detailPass=true;
  if(type==='gunner'){
    const t=g.userData.turret;
    for(const x of [-.62,.62]){
      mm(t,GEO.cyl,DETAIL.armor,[x,.19,-.1],[.19,.28,.19],[Math.PI/2,0,0]);
      mm(t,GEO.cyl,COL.black,[x,.19,-.1],[.12,.29,.12],[Math.PI/2,0,0]);
      mm(t,GEO.box,DETAIL.cyan,[x,.39,-.1],[.045,.035,.24]);
    }
    detailVent(t,-.26,.49,-.23,4,'x');
    detailBoltRow(t,[[-.46,.37,.36],[.46,.37,.36],[-.46,.37,-.34],[.46,.37,-.34]],COL.metalLight,.035);
  }else if(type==='cannon'){
    const t=g.userData.turret;
    for(const x of [-.32,.32]){
      mm(t,GEO.cyl,DETAIL.armor,[x,.38,-.1],[.085,.46,.085],[Math.PI/2,0,0]);
      mm(t,GEO.cyl,COL.metalLight,[x,.38,.18],[.11,.07,.11],[Math.PI/2,0,0]);
    }
    // Keep the barrel silhouette clean; the upgraded muzzle brake is added by ModelFactory.upgrade.
    detailBoltRow(t,[[-.48,.24,.34],[.48,.24,.34],[-.48,.24,-.28],[.48,.24,-.28]],COL.metalLight,.028);
    mm(t,GEO.box,DETAIL.amber,[0,.13,-.32],[.38,.035,.06]);
    detailVent(t,0,.49,-.36,5,'x');
  }else if(type==='missile'){
    const t=g.userData.turret,launcher=g.userData.launcher;
    for(const x of [-.26,.26])for(const y of [-.12,.12]){
      mm(launcher,GEO.box,DETAIL.amber,[x,y,.2],[.045,.045,.36]);
      mm(launcher,GEO.cone,COL.red,[x,y,.92],[.10,.16,.10],[Math.PI/2,0,0]);
    }
    for(const x of [-.62,.62]){
      mm(t,GEO.box,DETAIL.armor,[x,.18,-.1],[.12,.3,.72]);
      mm(t,GEO.box,DETAIL.red,[x,.38,-.1],[.05,.025,.45]);
    }
    detailBoltRow(launcher,[[-.48,.28,-.3],[.48,.28,-.3],[-.48,.28,.3],[.48,.28,.3]],COL.metalLight,.03);
  }else if(type==='laser'){
    const t=g.userData.turret;
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2+Math.PI/4;
      const crystal=mm(t,GEO.octa,DETAIL.violet,[Math.cos(a)*.67,.92,Math.sin(a)*.67],[.12,.28,.12]);
      crystal.rotation.y=a;
      mm(t,GEO.sphere,DETAIL.cyan,[Math.cos(a)*.67,1.18,Math.sin(a)*.67],[.055,.055,.055]);
    }
    mm(t,GEO.torus,DETAIL.violet,[0,.73,0],[.72,.72,.72],[Math.PI/2,0,0]);
  }else if(type==='tesla'){
    const t=g.userData.turret;
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      const p=[Math.cos(a)*.8,.9,Math.sin(a)*.8];
      mm(t,GEO.sphere,DETAIL.green,p,[.075,.075,.075]);
    }
    for(let i=0;i<3;i++)mm(t,GEO.torus,DETAIL.armor,[0,.82+i*.24,0],[.44+i*.08,.44+i*.08,.44+i*.08],[Math.PI/2,0,0]);
  }else if(type==='infantry'){
    mm(g,GEO.box,DETAIL.armor,[0,.73,.19],[.32,.25,.08]);
    mm(g,GEO.box,DETAIL.panel,[0,.72,.245],[.18,.14,.025]);
    for(const x of [-.22,.22]){
      mm(g,GEO.box,DETAIL.armor,[x,.9,.12],[.16,.16,.2]);
      mm(g,GEO.box,DETAIL.amber,[x,.9,.225],[.09,.035,.025]);
    }
    for(const x of [-.13,.13])mm(g,GEO.box,DETAIL.armor,[x,.22,.12],[.13,.18,.2]);
  }else if(type==='technical'){
    mm(g,GEO.box,DETAIL.armor,[0,.82,-.55],[.85,.16,.62]);
    mm(g,GEO.box,DETAIL.panel,[0,.92,-.55],[.55,.035,.42]);
    for(const x of [-.42,.42]){
      mm(g,GEO.sphere,DETAIL.amber,[x,.72,.88],[.09,.09,.05]);
      mm(g,GEO.box,DETAIL.armor,[x,.42,-.85],[.12,.3,.16]);
    }
    detailVent(g,0,.72,-.94,5,'x');
  }else if(type==='apc'){
    for(const x of [-.62,.62]){
      mm(g,GEO.box,DETAIL.armor,[x,.84,-.2],[.12,.12,1.48]);
      for(let i=0;i<5;i++)mm(g,GEO.sphere,COL.metalLight,[x*1.04,.37,-.78+i*.38],[.09,.09,.09]);
    }
    mm(g,GEO.box,DETAIL.panel,[0,1.02,-.55],[.58,.045,.4]);
    mm(g,GEO.sphere,DETAIL.red,[0,1.22,-.6],[.07,.07,.07]);
    detailVent(g,0,.86,-.88,5,'x');
  }else if(type==='tank'){
    const t=g.userData.turret;
    for(const side of [-1,1]){
      for(let i=0;i<10;i++){
        const z=-.94+i*.205;
        mm(g,GEO.box,DETAIL.armorDark,[side*.84,.17,z],[.055,.16,.145]);
        if(i%2===0)mm(g,GEO.box,COL.metalLight,[side*.88,.17,z],[.025,.055,.09]);
      }
      for(const z of [-.72,-.24,.24,.72]){
        mm(g,GEO.cyl,DETAIL.armor,[side*.86,.23,z],[.22,.05,.22],[0,0,Math.PI/2]);
        mm(g,GEO.cyl,COL.metalLight,[side*.9,.23,z],[.09,.055,.09],[0,0,Math.PI/2]);
      }
      mm(t,GEO.box,DETAIL.armorDark,[side*.48,.42,-.06],[.22,.12,.76]);
      mm(t,GEO.box,DETAIL.amber,[side*.48,.49,.18],[.13,.025,.22]);
    }
    mm(t,GEO.cyl,DETAIL.armor,[0,.52,-.38],[.42,.10,.42]);
    mm(t,GEO.box,DETAIL.armor,[0,.55,-.42],[.48,.08,.42]);
    mm(t,GEO.box,DETAIL.panel,[0,.61,-.42],[.28,.025,.25]);
    detailBoltRow(t,[[-.38,.49,-.48],[.38,.49,-.48],[-.38,.49,.34],[.38,.49,.34]],COL.metalLight,.04);
    for(const side of [-1,1]){
      mm(g,GEO.cyl,COL.black,[side*.48,.84,-.96],[.095,.22,.095],[Math.PI/2,0,0]);
      mm(g,GEO.cyl,DETAIL.armor,[side*.48,.84,-.96],[.06,.24,.06],[Math.PI/2,0,0]);
    }
    detailVent(t,0,.48,-.58,5,'x');
  }else if(type==='helicopter'){
    for(const side of [-1,1]){
      mm(g,GEO.box,DETAIL.glassBlue,[side*.46,1.9,-.08],[.055,.34,.43]);
      mm(g,GEO.box,DETAIL.armor,[side*.52,1.9,-.08],[.035,.39,.49]);
      mm(g,GEO.cyl,COL.metalDark,[side*.55,1.55,-.22],[.06,.28,.06]);
      mm(g,GEO.sphere,DETAIL.red,[side*.57,1.58,-.22],[.06,.06,.06]);
    }
    mm(g,GEO.torus,DETAIL.armor,[0,2.37,.05],[.28,.28,.28],[Math.PI/2,0,0]);
    const rotor=g.userData.rotor;
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2;
      const stripe=mm(rotor,GEO.box,DETAIL.amber,[0,0,0],[.24,.045,.12]);
      stripe.position.set(Math.cos(a)*1.15,0,Math.sin(a)*1.15);stripe.rotation.y=a;
    }
    mm(g,GEO.box,DETAIL.armor,[0,1.82,-2.36],[.64,.12,.22]);
    mm(g,GEO.box,DETAIL.red,[0,1.82,-2.49],[.16,.08,.04]);
  }else if(type==='jet'){
    for(const side of [-1,1]){
      mm(g,GEO.box,DETAIL.armor,[side*.72,-.08,-.1],[.16,.055,.64]);
      mm(g,GEO.sphere,DETAIL.amber,[side*1.02,-.02,-.1],[.075,.075,.075]);
      mm(g,GEO.cyl,DETAIL.armorDark,[side*.34,0,-1.12],[.2,.34,.2],[Math.PI/2,0,0]);
      mm(g,GEO.cyl,DETAIL.amber,[side*.34,0,-1.3],[.12,.09,.12],[Math.PI/2,0,0]);
      mm(g,GEO.box,DETAIL.armor,[side*.34,.02,-.72],[.34,.04,.35]);
      detailBoltRow(g,[[side*.56,-.02,-.38],[side*.88,-.02,-.38]],COL.metalLight,.025);
    }
    mm(g,GEO.box,DETAIL.armor,[0,.3,-1.08],[.16,.5,.24]);
    mm(g,GEO.box,DETAIL.red,[0,.54,-1.08],[.045,.12,.25]);
    mm(g,GEO.sphere,DETAIL.glassBlue,[0,.18,.62],[.22,.12,.22]);
  }else if(type==='drone'){
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2+Math.PI/4,cx=Math.cos(a),cz=Math.sin(a);
      const guard=mm(g,GEO.torusThin,DETAIL.armor,[cx*.8,.14,cz*.8],[.48,.48,.48],[Math.PI/2,0,0]);
      guard.rotation.z=a;
    }
    mm(g,GEO.cyl,DETAIL.armorDark,[0,-.24,.24],[.12,.2,.12]);
    mm(g,GEO.sphere,DETAIL.glassBlue,[0,-.34,.28],[.11,.11,.11]);
    mm(g,GEO.box,DETAIL.armor,[0,.22,-.08],[.28,.045,.28]);
    for(const x of [-.12,.12])mm(g,GEO.sphere,DETAIL.red,[x,.17,-.12],[.035,.035,.035]);
  }else if(type==='robot'||type==='heavy'){
    const heavy=type==='heavy';
    const y=heavy?2.0:1.7, shoulder=heavy?1.02:.63;
    for(const side of [-1,1]){
      mm(g,GEO.box,DETAIL.armor,[side*shoulder,y,0],[heavy?.56:.34,heavy?.64:.42,.66]);
      mm(g,GEO.box,DETAIL.amber,[side*shoulder,y-.22,.36],[heavy?.42:.24,.055,.055]);
      mm(g,GEO.sphere,DETAIL.red,[side*(shoulder+.12),y+.12,.3],[.075,.075,.06]);
    }
    mm(g,GEO.box,DETAIL.panel,[0,heavy?1.55:1.4,.39],[heavy?.72:.46,heavy?.42:.32,.06]);
    mm(g,GEO.box,DETAIL.cyan,[0,heavy?1.56:1.42,.43],[heavy?.35:.23,.06,.025]);
    for(let i=0;i<5;i++)mm(g,GEO.box,DETAIL.armorDark,[0,(heavy?1.12:1.0)+i*.11,.39],[heavy?.62:.38,.035,.07]);
    if(heavy){
      detailVent(g,0,2.8,-.38,7,'x');
      for(const side of [-1,1]){
        mm(g,GEO.cyl,DETAIL.armorDark,[side*1.18,1.9,.05],[.15,.65,.15],[Math.PI/2,0,0]);
        mm(g,GEO.cyl,DETAIL.red,[side*1.18,1.9,.37],[.1,.08,.1],[Math.PI/2,0,0]);
      }
    }
  }else if(type==='baseStation'){
    const accentMat=args[0]?new THREE.MeshStandardMaterial({color:args[0],emissive:args[0],emissiveIntensity:.9,metalness:.55,roughness:.3}):DETAIL.cyan;
    for(const side of [-1,1])for(const front of [-1,1]){
      const x=side*1.72,z=front*1.72;
      mm(g,GEO.box,DETAIL.armor,[x,1.18,z],[.32,.85,.32]);
      mm(g,GEO.box,accentMat,[x,1.65,z],[.34,.045,.34]);
      mm(g,GEO.sphere,DETAIL.amber,[x,2.0,z],[.075,.075,.075]);
    }
    for(const x of [-1,1]){
      const panel=mm(g,GEO.box,DETAIL.armorDark,[x*2.2,.92,0],[.65,.08,1.15]);
      panel.rotation.z=x*.12;
      for(let i=0;i<4;i++)mm(g,GEO.box,accentMat,[x*2.2,.98,-.42+i*.28],[.48,.018,.035]);
    }
    mm(g,GEO.torus,accentMat,[0,2.18,0],[.5,.5,.5],[Math.PI/2,0,0]);
    mm(g,GEO.cyl,DETAIL.armorDark,[0,2.95,0],[.06,.9,.06]);
    mm(g,GEO.sphere,DETAIL.red,[0,3.42,0],[.09,.09,.09]);
  }
  return g;
}
for(const modelType of ['gunner','cannon','missile','laser','tesla','infantry','technical','apc','tank','helicopter','jet','drone','robot','heavy','baseStation']){
  const originalBuilder=ModelFactory[modelType];
  ModelFactory[modelType]=function(...args){
    const model=originalBuilder.apply(this,args);
    return enhanceModel(modelType,model,args);
  };
}
/* ========== MAP DATA ========== */
