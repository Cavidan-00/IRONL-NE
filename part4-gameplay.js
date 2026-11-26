'use strict';
/* IRONLINE // Enemies, towers, projectiles, game world and wave generation */
class Enemy{
  constructor(game,type,path,waveIndex){this.game=game;this.type=type;
    const def=ENEMY_TYPES[type];this.def=def;
    const difficultyScale=1.35*Math.min(1,.9+game.G*.04)*(1+(game.G-1)*.011)*game.hpMul*(1+Math.max(0,waveIndex)*BALANCE.hpPerWave);
    this.maxHp=Math.round(def.hp*difficultyScale*ENEMY_STRENGTH_MULTIPLIER);this.hp=this.maxHp;
    this.shieldMax=Math.round((def.shield||0)*difficultyScale*1.08*ENEMY_STRENGTH_MULTIPLIER);this.shield=this.shieldMax;this.shieldTimer=0;
    const speedScale=1.04+game.stageIndex*.01+Math.min(.12,Math.max(0,game.level-1)*.006+Math.max(0,waveIndex)*.003);
    this.speed=def.speed*(game.mapId==='arctic'&&!def.air?.88:1)*speedScale*ENEMY_STRENGTH_MULTIPLIER;
    this.leakDamage=(def.damage||0)*ENEMY_STRENGTH_MULTIPLIER;
    this.reward=Math.ceil(def.reward*(.88+game.stageIndex*.018+game.G*.003)*game.profile.reward*BALANCE.kill);this.air=def.air;
    this.path=smoothPath(path);this.pathIndex=1;this.distance=0;this.alive=true;
    this.stun=0;this.slow=1;this.hitTimer=0;this.waveIndex=waveIndex;
    this.group=def.build();
    const y=def.air?rand(4.5,6.5):0;
    this.group.position.set(path[0][0]+rand(-.7,.7),y,path[0][1]+rand(-.7,.7));
    this.group.rotation.y=rand(0,Math.PI*2);
    this.group.traverse(o=>{if(o.isMesh){
      const s=o.scale;const size=Math.max(s.x,s.y,s.z);
      o.castShadow=!def.air&&size>0.35;o.receiveShadow=false;}});
    game.scene.add(this.group);this.y=y;
    if(this.shieldMax){
      this.shieldMesh=new THREE.Mesh(GEO.sphere,
        new THREE.MeshBasicMaterial({color:0x66ccff,transparent:true,opacity:.1,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
      this.shieldMesh.scale.setScalar(def.barY*.55);this.group.add(this.shieldMesh);}
    const bgMat=new THREE.SpriteMaterial({color:0x000000,transparent:true,opacity:.55,depthTest:false});
    const fgMat=new THREE.SpriteMaterial({color:0x2aff88,transparent:true,opacity:.95,depthTest:false});
    this.barBg=new THREE.Sprite(bgMat);this.barFg=new THREE.Sprite(fgMat);
    this.barBg.scale.set(1.9,.14,1);this.barFg.scale.set(1.75,.09,1);
    this.barBg.center.set(0,.5);this.barFg.center.set(0,.5);
    this.barBg.renderOrder=998;this.barFg.renderOrder=999;
    this.barBg.visible=false;this.barFg.visible=false;
    game.scene.add(this.barBg);game.scene.add(this.barFg);
    this.dirVec=V3(0,0,1);}
  update(dt){if(!this.alive)return;
    if(this.hitTimer>0)this.hitTimer-=dt;
    if(this.stun>0){this.stun-=dt;dt=0;}dt*=this.slow;
    if(this.shieldMax&&this.shield<this.shieldMax){
      if(this.shieldTimer>0)this.shieldTimer=Math.max(0,this.shieldTimer-dt);
      else this.shield=Math.min(this.shieldMax,this.shield+dt*35*ENEMY_STRENGTH_MULTIPLIER);
    }
    if(dt>0){let move=this.speed*dt;
      while(move>0){const target=this.path[this.pathIndex];
        if(!target){this.leak();return;}
        const p=this.group.position,dx=target[0]-p.x,dz=target[1]-p.z,d=Math.hypot(dx,dz);
        if(d<=move+1e-4){p.x=target[0];p.z=target[1];move-=d;this.distance+=d;this.pathIndex++;
          if(this.pathIndex>=this.path.length){this.leak();return;}continue;}
        const nx=dx/d,nz=dz/d;p.x+=nx*move;p.z+=nz*move;this.distance+=move;move=0;this.dirVec.set(nx,0,nz);
        const ta=Math.atan2(nx,nz),prev=this.group.rotation.y;
        this.group.rotation.y=angleLerp(prev,ta,Math.min(1,dt*10));
        if(this.air){const turn=angleLerp(prev,ta,1)-prev;this.group.rotation.z=lerp(this.group.rotation.z,clamp(-turn*6,-.5,.5),Math.min(1,dt*5));}}
      if(this.air)this.group.position.y=this.y+Math.sin(performance.now()*.0018+this.group.position.x)*.18;}
    const ud=this.group.userData;
    if(ud.rotor)ud.rotor.rotation.y+=dt*22;
    if(ud.tailRotor)ud.tailRotor.rotation.z+=dt*28;
    if(ud.rotors)for(const r of ud.rotors)r.rotation.y+=dt*30;
    if(ud.legs){const swing=Math.sin(performance.now()*.006+this.group.position.x)*.35;
      ud.legs.forEach((l,i)=>l.rotation.x=swing*(i?1:-1));}
    if(this.shieldMesh){this.shieldMesh.material.opacity=this.shield>0?.09+Math.sin(performance.now()*.005)*.025:0;
      this.shieldMesh.rotation.y+=dt*.6;}
    const show=this.hp<this.maxHp||this.shield<this.shieldMax;
    this.barBg.visible=show;this.barFg.visible=show;
    if(show){const y=this.def.barY+(this.air?.2:0);
      const x=this.group.position.x,yy=this.group.position.y+y,z=this.group.position.z;
      this.barBg.position.set(x-.95,yy,z);this.barFg.position.set(x-.95,yy,z);
      const ratio=clamp(this.hp/this.maxHp,0,1);
      this.barFg.scale.x=1.75*ratio;
      this.barFg.material.color.setHex(ratio>.55?0x2aff88:ratio>.25?0xffd166:0xff4a3a);}}
  predict(t){ // position after t seconds of travel along the (smoothed) path, honouring stun
    let rem=this.speed*(this.slow||1)*Math.max(0,t-(this.stun>0?this.stun:0));
    let x=this.group.position.x,z=this.group.position.z,i=this.pathIndex;
    while(i<this.path.length){const p=this.path[i],dx=p[0]-x,dz=p[1]-z,d=Math.hypot(dx,dz);
      if(d>=rem){const k=d?rem/d:0;return V3(x+dx*k,this.group.position.y,z+dz*k);}
      rem-=d;x=p[0];z=p[1];i++;}
    return V3(x,this.group.position.y,z);}
  takeDamage(amount,opts={}){if(!this.alive)return;let dmg=amount;
    if(this.shield>0&&!opts.pierce){this.shield-=dmg;this.shieldTimer=3;
      if(this.shield<0){this.hp+=this.shield;this.shield=0;}
      this.hitTimer=.08;
      this.game.fx.spawn(this.group.position.x,this.group.position.y+this.def.barY*.5,this.group.position.z,0x66ccff,4,3,3,.3);
      if(this.shield<=0)this.game.fx.spawn(this.group.position.x,this.group.position.y+this.def.barY*.5,this.group.position.z,0x9aeeff,10,6,4,.5);
    }else{if(opts.pierce&&this.shield>0)this.shield=Math.max(0,this.shield-dmg*.5);
      this.hp-=dmg;this.hitTimer=.08;
      this.game.fx.spawn(this.group.position.x,this.group.position.y+this.def.barY*.5,this.group.position.z,0xffaa55,3,3,4,.25);}
    if(this.hp<=0)this.die();}
  die(){if(!this.alive)return;this.alive=false;this.game.addCredits(this.reward);this.game.kills++;
    Progress.bumpStat('totalKills');
    this.game.fx.spawn(this.group.position.x,this.group.position.y+.8,this.group.position.z,this.def.boss?0xffd166:0xff7a2f,this.def.boss?36:12,this.def.boss?11:6,6,.8);
    this.game.fx.ring(this.group.position.x,this.group.position.z,this.def.boss?0xffd166:0xff7a2f,this.def.boss?4:1.8);
    this.game.fx.flash(this.group.position.x,this.group.position.y+.8,this.group.position.z,0xffb066,this.def.boss?2.4:1);
    Audio.sfx(this.def.boss?'explosion':'pop',this.group.position.x);this.remove();}
  leak(){if(!this.alive)return;this.alive=false;this.game.lives-=this.leakDamage;
    this.game.damageFlash();Audio.sfx('base');
    this.game.fx.spawn(this.group.position.x,1,this.group.position.z,0xff3a2a,20,8,6,.8);
    this.remove();if(this.game.lives<=0)this.game.defeat();}
  remove(){this.game.scene.remove(this.group);this.game.scene.remove(this.barBg);this.game.scene.remove(this.barFg);}
}
/* ========== TOWER ========== */
class Tower{
  constructor(game,type,plot){this.game=game;this.type=type;this.plot=plot;
    const def=TOWER_TYPES[type];this.def=def;this.level=1;this.invested=def.cost;
    this.metaMult=getUpgradeMultipliers(type);
    this.range=def.range*this.metaMult.range;
    this.damage=(def.damage||0)*this.metaMult.damage;
    this.rate=(def.rate||0)*this.metaMult.rate;
    this.dps=(def.dps||0)*this.metaMult.damage;
    this.targetMode='first';this.cooldown=0;this.target=null;this.retarget=0;this.recoil=0;
    this.firingLaser=false;this.laserSoundTimer=0;
    this.group=ModelFactory[type]();
    this.group.position.set(plot.x,0,plot.z);this.group.scale.setScalar(1.12);
    this.group.traverse(o=>{if(o.isMesh){const s=o.scale;const size=Math.max(s.x,s.y,s.z);
      o.castShadow=size>0.35;o.receiveShadow=size>0.35;}});
    game.scene.add(this.group);
    this.turret=this.group.userData.turret;this.barrels=this.group.userData.barrels||[];
    this.barrel=this.group.userData.barrel;this.launcher=this.group.userData.launcher;
    this.contacts=this.group.userData.contacts||[];this.emitterLens=this.group.userData.emitterLens||null;
    this.coilMeshes=this.turret?this.turret.children.filter(o=>o.geometry===GEO.torus):[];
    this.gunnerBarrelIndex=0;this.missileTubeIndex=0;this.cannonRecoil=0;this.missileRecoil=0;
    this.teslaPulse=0;this.animationTime=0;this.firingLaser=false;
    if(this.barrel)this.barrelHomeZ=this.barrel.position.z;
    if(this.launcher)this.launcherHomeZ=this.launcher.position.z;
    this.pick=new THREE.Mesh(GEO.cyl,new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false}));
    // YENİ: Ölçünü 2.6-dan 5.0-a qaldırırıq və hündürlüyünü artırırıq ki, lülə də içinə düşsün
    this.pick.position.set(plot.x,2.0,plot.z);this.pick.scale.set(5.0,5.0,5.0); 
    this.pick.userData.tower=this;game.scene.add(this.pick);
    if(type==='laser'){
      this.beamGlow=new THREE.Mesh(GEO.cyl,new THREE.MeshBasicMaterial({color:0xb388ff,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
      this.beamCore=new THREE.Mesh(GEO.cyl,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
      this.beamGlow.visible=false;this.beamCore.visible=false;
      game.scene.add(this.beamGlow);game.scene.add(this.beamCore);}
    this.plot.tower=this;this.plot.hover.visible=false;}
  get maxLevel(){return towerMaxLevel(this.type);}
  get cost(){return this.def.cost;}
  upgradeCost(){if(this.level>=this.maxLevel)return null;

    return Math.round(UPGRADE_BASE[this.type]*[1,1.8,2.8][this.level-1]);}
  upgrade(){if(this.level>=this.maxLevel)return false;const cost=this.upgradeCost();
    if(!this.game.spendCredits(cost))return false;
    this.invested+=cost;this.level++;
    const dm=[1,1.35,1.8,2.4][this.level-1];const rm=[1,1.06,1.12,1.2][this.level-1];const fm=[1,1.06,1.12,1.2][this.level-1];
    this.damage=(this.def.damage||0)*dm*this.metaMult.damage;
    this.dps=(this.def.dps||0)*dm*this.metaMult.damage;
    this.range=this.def.range*rm*this.metaMult.range;
    this.rate=(this.def.rate||0)*fm*this.metaMult.rate;
    if(this.game.selectedTower===this){
      this.game.rangeRing.scale.set(this.range,this.range,this.range);
      UI.showSelection(this);
    }
    ModelFactory.upgrade(this,this.level);
    Audio.sfx('upgrade',this.plot.x);
    this.game.fx.spawn(this.plot.x,1.5,this.plot.z,0xffd166,18,6,4,.7);
    
    if(tutorialStep===3){
      tutorialStep=4;
      UI.updateTutorialHighlight(document.getElementById('btn-target-mode'),
        'Your tower is upgraded. Now try changing which enemy it prioritizes.');
    }
    return true;}
  sellValue(){return Math.floor(this.invested*.7);}
  sell(){this.game.addCredits(this.sellValue());
    this.game.scene.remove(this.group);this.game.scene.remove(this.pick);
    if(this.beamGlow){this.game.scene.remove(this.beamGlow);this.game.scene.remove(this.beamCore);}
    this.plot.tower=null;this.plot.hover.visible=false;
    this.game.towers=this.game.towers.filter(t=>t!==this);
    this.game.pickables=this.game.pickables.filter(p=>p!==this.pick);
    if(this.game.selectedTower===this)this.game.selectTower(null);
    Audio.sfx('sell',this.plot.x);
    this.game.fx.spawn(this.plot.x,1,this.plot.z,0x9ad8ff,10,4,4,.5);
    
  }
  getMuzzleWorld(index=null){
    if(this.type==='gunner'&&this.barrels.length){
      const b=this.barrels[(index===null?0:index)%this.barrels.length];
      if(b.userData.muzzle)return b.userData.muzzle.getWorldPosition(V3());
      return b.getWorldPosition(V3());
    }
    if(this.type==='missile'&&this.launcher){
      const tubes=this.launcher.userData.muzzles||[];
      if(tubes.length){const i=(index===null?this.missileTubeIndex:index)%tubes.length;return tubes[i].getWorldPosition(V3());}
    }
    if(this.barrel&&this.barrel.userData.muzzle)return this.barrel.userData.muzzle.getWorldPosition(V3());
    return this.group.position.clone().add(V3(0,1.2,0));
  }
  canTarget(e){if(!e.alive)return false;if(e.air&&!this.def.air)return false;return true;}
  findTarget(){let best=null,bestScore=-Infinity;
    for(const e of this.game.enemies){if(!this.canTarget(e))continue;
      const d=dist2(this.plot.x,this.plot.z,e.group.position.x,e.group.position.z);
      if(d>this.range)continue;
      const score=this.targetMode==='strongest'?(e.hp+e.shield):this.targetMode==='closest'?-d:e.distance;
      if(score>bestScore){bestScore=score;best=e;}
    }
    return best;}
  cycleTargetMode(){
    const modes=['first','strongest','closest'];
    const i=modes.indexOf(this.targetMode);
    this.targetMode=modes[(i+1)%modes.length];
    this.target=null;this.retarget=0;
    return this.targetMode;
  }
  update(dt){
    this.animationTime+=dt;
    this.kick=Math.max(0,(this.kick||0)-dt*5.5);
    if(this.turret){const ry=this.turret.rotation.y,k=this.kick*.09;this.turret.position.x=-Math.sin(ry)*k;this.turret.position.z=-Math.cos(ry)*k;}
    this.retarget-=dt;
    if(this.retarget<=0){this.retarget=.12;
      if(!this.target||!this.target.alive||dist2(this.plot.x,this.plot.z,this.target.group.position.x,this.target.group.position.z)>this.range||!this.canTarget(this.target))this.target=this.findTarget();}
    const target=this.target;

    // GUNNER: alternating barrels, individual recoil and a short mechanical recovery cycle.
    for(const b of this.barrels){
      b.userData.recoil=Math.max(0,(b.userData.recoil||0)-dt*2.8);
      b.position.z=(b.userData.homeZ??.5)-(b.userData.recoil||0);
    }

    // CANNON: the barrel elevates independently and recoils along its bore after every shell.
    if(this.type==='cannon'&&this.barrel){
      this.cannonRecoil=Math.max(0,this.cannonRecoil-dt*2.4);
      this.barrel.position.z=this.barrelHomeZ-this.cannonRecoil*.20;
    }

    // MISSILE: the whole launcher slews in elevation and rocks back on ignition.
    if(this.type==='missile'&&this.launcher){
      this.missileRecoil=Math.max(0,this.missileRecoil-dt*2.1);
      this.launcher.position.z=this.launcherHomeZ-this.missileRecoil*.18;
    }

    // TESLA: capacitors wind down, while the electrode arms close back after each discharge.
    if(this.type==='tesla'){
      this.teslaPulse=Math.max(0,this.teslaPulse-dt*3.2);
      this.contacts.forEach((arm,i)=>{const side=i===0?-1:1;arm.rotation.z=side*this.teslaPulse*.28;});
      for(const coil of this.coilMeshes)coil.rotation.y+=dt*(this.teslaPulse>0?5.5:1.0);
    }

    if(this.type==='laser'){
      if(target&&target.alive){
        this.firingLaser=true;this.aim(target,dt);this.updateBeam(target);
        const ch=this.laserCharge=Math.min(1,(this.laserCharge||0)+dt*3); // spin-up: beam widens and damage ramps over ~0.35s
        target.takeDamage(this.dps*dt*(.45+.55*ch),{pierce:true});
        this.sparkT=(this.sparkT||0)-dt;if(this.sparkT<=0){this.sparkT=.06;const hp=target.group.position;this.game.fx.spawn(hp.x,hp.y+target.def.barY*.5,hp.z,0xd9b8ff,3,4,6,.25);}
        this.laserSoundTimer-=dt;
        if(this.laserSoundTimer<=0){this.laserSoundTimer=.22;Audio.sfx('laser',this.plot.x);}
        if(this.emitterLens){const pulse=1+.10*Math.sin(this.animationTime*18);this.emitterLens.scale.set(.115*pulse,.035,.115*pulse);}
      }else{
        this.laserCharge=0;this.firingLaser=false;this.beamGlow.visible=false;this.beamCore.visible=false;
        if(this.emitterLens)this.emitterLens.scale.set(.115,.035,.115);
      }
      return;
    }

    if(this.cooldown>0)this.cooldown-=dt;
    if(target&&target.alive){
      this.aim(target,dt);
      if(this.cooldown<=0&&(this.aimErr||0)<TURN[this.type].tol){this.fire(target);this.cooldown=1/(this.rate||.5);}
    }
  }
  leadPoint(start,speed,e,minT=0){ // iterative intercept against the enemy's predicted path position
    let t=minT,p=e.predict(0);
    for(let i=0;i<3;i++){p=e.predict(t);t=Math.max(minT,start.distanceTo(p)/speed);}
    p=e.predict(t);p.y+=e.def.barY*(e.air?.5:.45);return p;}
  aimPointFor(e){const d=Math.hypot(e.group.position.x-this.plot.x,e.group.position.z-this.plot.z);
    const s=this.type==='gunner'?52:this.type==='cannon'?24:this.type==='missile'?16:0;
    return s?e.predict(d/s):e.group.position;}
  aim(target,dt){
    if(!this.turret)return;
    const ap=this.aimPointFor(target),dx=ap.x-this.plot.x,dz=ap.z-this.plot.z;
    const horizontal=Math.max(.001,Math.hypot(dx,dz));
    const ang=Math.atan2(dx,dz);
    const smooth=Math.min(1,dt*8.5),tr=TURN[this.type];
    const diff=angleLerp(this.turret.rotation.y,ang,1)-this.turret.rotation.y;
    this.aimErr=Math.abs(diff);
    this.turret.rotation.y+=clamp(diff*Math.min(1,dt*14),-tr.rate*dt,tr.rate*dt);

    // Elevation is handled by each weapon's own moving assembly, not by the whole turret.
    const targetY=target.group.position.y+target.def.barY*.52;
    const muzzleY=this.getMuzzleWorld().y;
    const pitch=clamp(-Math.atan2(targetY-muzzleY,horizontal),-.78,.52);
    if(this.type==='gunner'){
      for(const b of this.barrels)b.rotation.x+= (pitch-b.rotation.x)*smooth;
    }else if((this.type==='cannon'||this.type==='laser')&&this.barrel){
      this.barrel.rotation.x+=(pitch-this.barrel.rotation.x)*smooth;
    }else if(this.type==='missile'&&this.launcher){
      const missilePitch=clamp(pitch,-.92,.34);
      this.launcher.rotation.x+=(missilePitch-this.launcher.rotation.x)*smooth;
    }
  }
  updateBeam(target){const start=this.getMuzzleWorld();
    const end=target.group.position.clone();end.y+=target.def.barY*.55;
    const w=.4+.6*(this.laserCharge||0);setBeam(this.beamGlow,start,end,.1*w);setBeam(this.beamCore,start,end,.035*w);
    const pulse=.92+.08*Math.sin(this.animationTime*24);
    const gw=.2*pulse*(.4+.6*(this.laserCharge||0));this.beamGlow.scale.set(gw,this.beamGlow.scale.y,gw);
    this.beamGlow.visible=true;this.beamCore.visible=true;}
  fire(target){
    this.kick=this.type==='cannon'?1:this.type==='missile'?.7:this.type==='gunner'?.35:0;
    if(this.type==='gunner'){
      const idx=this.gunnerBarrelIndex%Math.max(1,this.barrels.length);
      const barrel=this.barrels[idx];const start=this.getMuzzleWorld(idx);
      this.gunnerBarrelIndex=(idx+1)%Math.max(1,this.barrels.length);
      if(barrel)barrel.userData.recoil=.20;
      this.game.projectiles.push(new Bullet(this.game,start,this.leadPoint(start,52,target),this.damage,0x9ff5ff,false));
      this.game.fx.flash(start.x,start.y,start.z,0xbff8ff,.20);this.game.fx.spawn(start.x,start.y,start.z,0x9ff5ff,4,2.4,2,.18);
      Audio.sfx('gun',this.plot.x);

    }else if(this.type==='cannon'){
      const start=this.getMuzzleWorld();const tp=this.leadPoint(start,24,target,.4);tp.y=.3;
      this.game.projectiles.push(new CannonShell(this.game,start,tp,this.damage,this.def.splash,0xffb347));
      this.cannonRecoil=.24;
      this.game.fx.flash(start.x,start.y,start.z,0xffd090,.50);this.game.fx.spawn(start.x,start.y,start.z,0xffc06a,12,5.5,3,.28);
      Audio.sfx('cannon',this.plot.x);

    }else if(this.type==='missile'){
      const tubes=this.launcher?.userData?.muzzles||[];
      const idx=tubes.length?this.missileTubeIndex%tubes.length:0;
      const start=this.getMuzzleWorld(idx);
      if(tubes.length)this.missileTubeIndex=(idx+1)%tubes.length;
      this.game.projectiles.push(new Missile(this.game,start,target,this.damage,0xff6b6b));
      this.missileRecoil=.22;
      this.game.fx.flash(start.x,start.y,start.z,0xffb080,.38);this.game.fx.spawn(start.x,start.y,start.z,0xff9a62,5,2.5,2,.24);
      Audio.sfx('missile',this.plot.x);

    }else if(this.type==='tesla'){
      const start=this.getMuzzleWorld();const chain=[target];let current=target;
      for(let i=1;i<this.def.chain;i++){let next=null,nd=5.0;
        for(const e of this.game.enemies){if(!this.canTarget(e)||chain.includes(e))continue;
          const d=dist2(current.group.position.x,current.group.position.z,e.group.position.x,e.group.position.z);
          if(d<nd){nd=d;next=e;}}
        if(!next)break;chain.push(next);current=next;}
      const pts=[start.clone()];
      for(let i=0;i<chain.length;i++){
        const e=chain[i];e.takeDamage(this.damage*(i===0?1:.88),{pierce:false});
        e.stun=Math.max(e.stun,.42);
        pts.push(e.group.position.clone().add(V3(0,e.def.barY*.5,0)));
      }
      this.teslaPulse=1;
      this.game.fx.flash(start.x,start.y,start.z,0x9fffd8,.42);this.game.fx.spawn(start.x,start.y,start.z,0x75ffc8,9,3.5,2,.35);
      this.game.fx.bolt(pts);Audio.sfx('tesla',this.plot.x);
    }
  }
}
function setBeam(mesh,start,end,radius){
  const dir=end.clone().sub(start);const len=dir.length();
  mesh.position.copy(start).addScaledVector(dir,.5);mesh.scale.set(radius*2,len,radius*2);
  mesh.quaternion.setFromUnitVectors(V3(0,1,0),dir.normalize());}

/* ========== PROJECTILES ========== */
class Bullet{ // straight, lead-aimed round with swept collision (can hit any enemy in its path)
  constructor(game,from,aim,damage,color,air){this.game=game;this.damage=damage;this.air=air;this.dead=false;this.life=1.1;this.speed=52;
    this.dir=aim.clone().sub(from).normalize();
    this.dir.x+=rand(-.012,.012);this.dir.z+=rand(-.012,.012);this.dir.normalize();
    this.pos=from.clone();
    this.mesh=new THREE.Mesh(GEO.box,new THREE.MeshBasicMaterial({color,toneMapped:false}));
    this.mesh.scale.set(.055,.055,.7);this.mesh.position.copy(from);game.scene.add(this.mesh);}
  update(dt){if(this.dead)return;this.life-=dt;if(this.life<=0){this.destroy();return;}
    const a=this.pos.clone();this.pos.addScaledVector(this.dir,this.speed*dt);
    const ab=this.pos.clone().sub(a),len2=Math.max(1e-6,ab.lengthSq());
    for(const e of this.game.enemies){if(!e.alive||(e.air&&!this.air))continue;
      const c=e.group.position,cy=c.y+e.def.barY*.42;
      const t=clamp(((c.x-a.x)*ab.x+(cy-a.y)*ab.y+(c.z-a.z)*ab.z)/len2,0,1);
      const px=a.x+ab.x*t,py=a.y+ab.y*t,pz=a.z+ab.z*t;
      if(Math.hypot(px-c.x,py-cy,pz-c.z)<(e.def.boss?1.3:.85)){this.hit(e,px,py,pz);return;}}
    this.mesh.position.copy(this.pos);this.mesh.lookAt(this.pos.clone().add(this.dir));
    if(this.pos.y<.05)this.destroy();}
  hit(e,x,y,z){const armored=['tank','apc','robot','heavy'].some(k=>e.def.name===ENEMY_TYPES[k].name);
    e.takeDamage(this.damage);
    if(armored){this.game.fx.spawn(x,y,z,0xfff2b0,9,8,12,.22);Audio.sfx('hitMetal',x);}
    else{this.game.fx.spawn(x,y,z,0xc0392b,4,3,8,.2);Audio.sfx('hitFlesh',x);}
    this.destroy();}
  destroy(){this.dead=true;this.game.scene.remove(this.mesh);}}
class CannonShell{
  constructor(game,from,targetPos,damage,splash,color){this.game=game;this.damage=damage;this.splash=splash;this.dead=false;
    this.start=from.clone();this.targetPos=targetPos.clone();
    const dist=from.distanceTo(targetPos);this.flight=Math.max(.4,dist/24);
    this.vel=targetPos.clone().sub(from);this.vel.y=0;this.vel.divideScalar(this.flight);
    this.vy=(targetPos.y-from.y+.5*30*this.flight*this.flight)/this.flight;
    this.pos=from.clone();this.t=0;
    this.mesh=new THREE.Mesh(GEO.sphere,new THREE.MeshBasicMaterial({color,toneMapped:false}));
    this.mesh.scale.setScalar(.22);this.mesh.position.copy(from);game.scene.add(this.mesh);}
  update(dt){if(this.dead)return;this.t+=dt;this.pos.x+=this.vel.x*dt;this.pos.z+=this.vel.z*dt;
    this.pos.y+=this.vy*dt;this.vy-=30*dt;this.mesh.position.copy(this.pos);
    this.game.fx.spawn(this.pos.x,this.pos.y,this.pos.z,0x9aa3ad,1,.5,-1.5,.55);
    if(this.t>=this.flight)this.explode();}
  explode(){if(this.dead)return;this.dead=true;this.game.scene.remove(this.mesh);
    const p=this.targetPos;
    this.game.fx.spawn(p.x,.4,p.z,0xffb347,22,7,7,.6);
    this.game.fx.ring(p.x,p.z,0xffb347,this.splash);Audio.sfx('explosion',p.x);
    this.game.fx.spawn(p.x,.6,p.z,0x7a828c,14,2.5,-1.2,1.1);
    for(const e of this.game.enemies){if(!e.alive||e.air)continue;
      const d=dist2(p.x,p.z,e.group.position.x,e.group.position.z);
      if(d<=this.splash)e.takeDamage(this.damage*(1-d/this.splash*.35));}}}
class Missile{
  constructor(game,from,target,damage,color){this.game=game;this.target=target;this.damage=damage;this.dead=false;
    this.pos=from.clone();this.speed=8;this.age=0;this.life=4.6;this.trail=0;
    this.homingTurnRate=4.5*1.3;this.proximityFuse=.7*1.3;
    this.dir=target.group.position.clone().add(V3(0,target.def.barY*.5,0)).sub(from).normalize().multiplyScalar(.55).add(V3(0,.85,0)).normalize(); // pops upward, then dives
    this.mesh=new THREE.Mesh(GEO.cyl,new THREE.MeshBasicMaterial({color,toneMapped:false}));
    this.mesh.scale.set(.09,.7,.09);this.mesh.position.copy(from);game.scene.add(this.mesh);}
  update(dt){if(this.dead)return;this.life-=dt;if(this.life<=0){this.explode();return;}
    this.age+=dt;this.speed=lerp(8,21,Math.min(1,this.age/.7));
    if(this.target.alive){const tp=this.target.predict(this.pos.distanceTo(this.target.group.position)/this.speed*.8);tp.y+=this.target.def.barY*.5;
      const desired=tp.sub(this.pos).normalize();
      this.dir.lerp(desired,Math.min(1,dt*this.homingTurnRate*(this.age<.18?.15:1))).normalize();}
    this.pos.addScaledVector(this.dir,this.speed*dt);this.mesh.position.copy(this.pos);
    this.mesh.quaternion.setFromUnitVectors(V3(0,1,0),this.dir);
    this.trail-=dt;if(this.trail<=0){this.trail=.035;
      this.game.fx.spawn(this.pos.x,this.pos.y,this.pos.z,0xff8a6a,2,1.2,0,.35);}
    if(this.target.alive&&this.pos.distanceTo(this.target.group.position.clone().add(V3(0,this.target.def.barY*.5,0)))<this.proximityFuse)this.explode();
    if(this.pos.y<.15)this.explode();}
  explode(){if(this.dead)return;this.dead=true;this.game.scene.remove(this.mesh);
    const p=this.pos;
    this.game.fx.spawn(p.x,p.y,p.z,0xff6b6b,18,6,6,.55);
    this.game.fx.ring(p.x,p.z,0xff6b6b,1.8);Audio.sfx('explosion',p.x);
    for(const e of this.game.enemies){if(!e.alive)continue;
      const d=dist2(p.x,p.z,e.group.position.x,e.group.position.z);
      if(d<=1.8)e.takeDamage(this.damage*(1-d/1.8*.4));}}}

/* ========== GAME WORLD (with built-in zoom) ========== */
class GameWorld{
  constructor(stageIndex,level,renderer){
    this.stageIndex=stageIndex;this.level=level;this.map=MAPS[stageIndex];
    this.mapId=this.map.id;this.renderer=renderer;
    this.isEndless=level===ENDLESS_LEVEL;
    this.G=this.isEndless?25+stageIndex*5:gIndex(stageIndex,level);this.profile=STAGE_PROFILE[stageIndex];
    this.kind=this.isEndless?'mixed':levelKind(level);this.hpMul=this.profile.hp*(this.kind==='swarm'?.8:1);
    this.towerCap=!this.isEndless&&this.profile.cap?this.profile.cap+Math.floor(level/4):0;
    this.activeRoutes=getActiveRoutes(stageIndex,level).map(i=>this.map.routes[i]);
    this.scene=new THREE.Scene();
    this.camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,200);
    this.camBase=V3(0,40,18);this.camera.position.copy(this.camBase);
    this.camera.lookAt(0,0,0);this.cameraShake=0;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;
    if (isMobile) {
        this.zoom = 1.18;
        this.targetZoom = 1.18;
        this.zoomMin = 0.95;
        this.zoomMax = 4.2;
    } else {
        this.zoom = 1;
        this.targetZoom = 1;
        this.zoomMin = 0.75;
        this.zoomMax = 3.0;
    }
    this.camAspect=innerWidth/innerHeight;
    this.camBaseSize=Math.max(26,24/this.camAspect);
    // v2.3.1 — map panning
    this.pan={x:0,z:0};
    this.panMin=-22;this.panMax=22;
    this.panState=null;
    this._panKeys={left:false,right:false,up:false,down:false};
    this.composer=makeComposer(renderer,this.scene,this.camera);
    this.credits=0;this.lives=20;this.kills=0;
    this.towers=[];this.enemies=[];this.projectiles=[];this.pickables=[];
    this.plots=[];this.waves=[];this.waveIndex=-1;this.phase='prep';
    this.prepTime=12;this.waveElapsed=0;this.spawnQueue=[];this.waveTotal=0;
    this.speed=1;this.paused=false;this.over=false;this.empCooldown=0;this.empMaxCooldown=38;
    this.selectedTower=null;this.buildType=null;
    this.ghost=null;this.ghostRange=null;this._ghostColor=null;
    this.hoveredPlot=null;this.hoveredTower=null;
    this.raycaster=new THREE.Raycaster();
    this.pointer=new THREE.Vector2(-2,-2);
    this.groundPlane=new THREE.Plane(V3(0,1,0),0);
    this.groundTarget=V3();
    this.uiTimer=0;this.baseObj=null;this.baseRadar=null;this.baseShield=null;
    this.sandstormTimer=40;this.sandstorm=0;this.uniqueTextures=[];
    this.tutorialTarget=null;
    this.fx={particles:null,rings:null,bolts:null,
      spawn:(...a)=>this.fx.particles.spawn(...a),
      ring:(...a)=>this.fx.rings.fire(...a),
      bolt:(...a)=>this.fx.bolts.fire(...a)};
    this.onPointerMove=this.handlePointerMove.bind(this);
    this.onPointerDown=this.handlePointerDown.bind(this);
    this.onPointerUp=this.handlePointerUp.bind(this);
    this.onPointerLeave=this.handlePointerLeave.bind(this);
    this.onContext=this.handleContext.bind(this);
    this._onWheel=this.handleWheel.bind(this);
  }
  start(){this.buildScene();
    if(this.isEndless){
      this.waves=[];
    } else {
      this.waves=generateWaves(this.stageIndex,this.level,this.map,this.activeRoutes.length);
    }
    const creditIdx=this.stageIndex*LEVELS_PER_STAGE+(this.isEndless?LEVELS_PER_STAGE-1:this.level-1);
    this.credits=START_CREDITS[Math.min(creditIdx,START_CREDITS.length-1)]||250;
    this.phase='prep';this.prepTime=12;this.bindEvents();
    Audio.ensure();Audio.startMusic(this.map.music);
    gameplayStart();UI.game=this;UI.updateTowerBar();this.updateUI(true);
    UI.toast(this.map.modifier,'',3200);
    const nu=TOWER_ORDER.find(t=>TOWER_UNLOCKS[t]===this.G&&this.G>1);
    if(nu)setTimeout(()=>UI.toast('NEW DEFENSE UNLOCKED: '+TOWER_TYPES[nu].name,'gold',4200),800);
    if(this.towerCap)setTimeout(()=>UI.toast('LEAN OPS // TOWER CAP '+this.towerCap,'gold',3200),2000);
    if(this.activeRoutes.length>1)setTimeout(()=>UI.toast(this.activeRoutes.length+' APPROACH VECTORS ACTIVE','gold',3200),1400);
    const active=TOWER_ORDER.filter(t=>(Progress.data.upgrades[t]||0)>0);
    if(active.length)setTimeout(()=>UI.toast('ARMORY BONUSES ACTIVE: '+active.length+' TOWER TYPE'+(active.length>1?'S':''),'gold',3000),2200);
    setTimeout(()=>UI.toast('SCROLL TO ZOOM · RIGHT-DRAG TO PAN · WASD TO MOVE','',4500),3600);}
  addCredits(amount){
    const value=Number(amount);
    if(!Number.isFinite(value)||value<=0)return this.credits;
    this.credits+=value;
    this.syncCreditUI();
    return this.credits;
  }
  spendCredits(amount){
    const cost=Number(amount);
    if(!Number.isFinite(cost)||cost<=0||this.credits<cost){
      this.syncCreditUI();
      return false;
    }
    this.credits-=cost;
    if(Math.abs(this.credits)<1e-9)this.credits=0;
    this.syncCreditUI();
    return true;
  }
  syncCreditUI(){
    if(UI.game===this)UI.updateCredits(this);
  }
  buildScene(){const s=this.scene;
    s.fog=new THREE.FogExp2(this.map.fog,.0105);
    const harborLighting=this.stageIndex===0;
    s.add(new THREE.HemisphereLight(this.map.sky,this.map.hemi,harborLighting?2.05:1.95));
    const dir=new THREE.DirectionalLight(0xfff8eb,harborLighting?4.25:3.55);
    dir.position.set(18,32,12);dir.castShadow=Settings.data.shadows;
    dir.shadow.mapSize.set(1536,1536);
    dir.shadow.camera.left=-28;dir.shadow.camera.right=28;
    dir.shadow.camera.top=28;dir.shadow.camera.bottom=-28;
    dir.shadow.camera.near=1;dir.shadow.camera.far=90;
    dir.shadow.bias=-.0006;s.add(dir);
    // Soft opposing fill keeps tower silhouettes and build pads readable,
    // especially on the rain-soaked opening Harbor map.
    const fill=new THREE.DirectionalLight(0xb8e2f4,harborLighting?0.82:0.62);
    fill.position.set(-18,15,-14);s.add(fill);
    const accent=new THREE.Color(this.map.accent);
    const p1=new THREE.PointLight(accent,harborLighting?25:22,48);p1.position.set(-10,8,-10);s.add(p1);
    const p2=new THREE.PointLight(0xff7b54,harborLighting?16:15,42);p2.position.set(10,5,10);s.add(p2);
    const built=buildMap(s,this.map,this.activeRoutes);
    this.plots=built.plots;this.baseObj=built.base;
    this.baseRadar=built.base.userData.radar;this.baseShield=built.base.userData.shield;
    this.uniqueTextures=built.uniqueTextures;
    for(const p of this.plots)this.pickables.push(p.mesh);
    this.fx.particles=new Particles(s);this.fx.rings=new Rings(s);this.fx.bolts=new Bolts(s);
    this.fx.flashes=new Flashes(s);this.fx.flash=(...a)=>this.fx.flashes.fire(...a);
    this.weather=new Weather(s,this.map.weather,this.map.accent);
    this.selectionBox=new THREE.Group();
    const boxMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide});
    this.selectionBox.add(new THREE.Mesh(GEO.box,boxMat));
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(GEO.box),
      new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.8}));
    this.selectionBox.add(edges);this.selectionBox.visible=false;s.add(this.selectionBox);
    this.rangeRing=new THREE.Mesh(new THREE.RingGeometry(.97,1,64),
      new THREE.MeshBasicMaterial({color:0x5ee7ff,toneMapped:false,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false}));
    this.rangeRing.rotation.x=-Math.PI/2;this.rangeRing.visible=false;this.rangeRing.position.y=.16;s.add(this.rangeRing);
    this.ghostRange=new THREE.Mesh(new THREE.RingGeometry(.97,1,64),
      new THREE.MeshBasicMaterial({color:0x5effc2,toneMapped:false,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}));
    this.ghostRange.rotation.x=-Math.PI/2;this.ghostRange.visible=false;this.ghostRange.position.y=.20;s.add(this.ghostRange);
    // v2.3.2 — faint range ring shown when hovering an existing tower
    this.hoverRange=new THREE.Mesh(new THREE.RingGeometry(.94,1,64),
      new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}));
    this.hoverRange.rotation.x=-Math.PI/2;this.hoverRange.visible=false;this.hoverRange.position.y=.24;s.add(this.hoverRange);
    
    this.tutMarker=new THREE.Group();
    const arrowGeo = new THREE.ConeGeometry(0.8, 2, 4);
    arrowGeo.rotateX(Math.PI);
    this.tutArrow = new THREE.Mesh(arrowGeo, new THREE.MeshBasicMaterial({color: 0xffd166, toneMapped: false}));
    this.tutArrow.position.y = 3;
    this.tutMarker.add(this.tutArrow);
    const ringGeo = new THREE.RingGeometry(1.5, 2, 32);
    ringGeo.rotateX(-Math.PI/2);
    this.tutRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({color: 0xffd166, transparent:true, opacity:0.8, side:THREE.DoubleSide, toneMapped:false, blending: THREE.AdditiveBlending}));
    this.tutRing.position.y = 0.2;
    this.tutMarker.add(this.tutRing);
    this.tutMarker.visible = false;
    s.add(this.tutMarker);
  }
  bindEvents(){const c=this.renderer.domElement;
    c.addEventListener('pointermove',this.onPointerMove);
    c.addEventListener('pointerdown',this.onPointerDown);
    c.addEventListener('pointerup',this.onPointerUp);
    c.addEventListener('pointerleave',this.onPointerLeave);
    c.addEventListener('contextmenu',this.onContext);
    c.addEventListener('wheel',this._onWheel,{passive:false});
    c.style.touchAction='none';
    c.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    c.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    c.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
  }
  unbindEvents(){const c=this.renderer.domElement;
    c.removeEventListener('pointermove',this.onPointerMove);
    c.removeEventListener('pointerdown',this.onPointerDown);
    c.removeEventListener('pointerup',this.onPointerUp);
    c.removeEventListener('pointerleave',this.onPointerLeave);
    c.removeEventListener('contextmenu',this.onContext);
    c.removeEventListener('wheel',this._onWheel);
    c.removeEventListener('touchstart', this.onTouchStart);
    c.removeEventListener('touchmove', this.onTouchMove);
    c.removeEventListener('touchend', this.onTouchEnd);
  }
  handleWheel(e){
    if(this.paused||this.over)return;
    e.preventDefault();
    const factor=e.deltaY>0?0.9:1.1;
    this.targetZoom=clamp(this.targetZoom*factor,this.zoomMin,this.zoomMax);
  }
  _applyZoom(){
    const aspect=this.camAspect||(innerWidth/innerHeight);
    const base=this.camBaseSize||26;
    const size=base/(this.zoom||1);
    this.camera.left=-size*aspect;this.camera.right=size*aspect;
    this.camera.top=size;this.camera.bottom=-size;
    this.camera.updateProjectionMatrix();
  }
  handleContext(e){e.preventDefault();}
  updatePointer(e){const r=this.renderer.domElement.getBoundingClientRect();
    this.pointer.x=((e.clientX-r.left)/r.width)*2-1;
    this.pointer.y=-((e.clientY-r.top)/r.height)*2+1;}
  handlePointerMove(e){
    if(this.panState){
      const dx=e.clientX-this.panState.startScreenX;
      const dy=e.clientY-this.panState.startScreenY;
      if(!this.panState.moved&&(Math.abs(dx)+Math.abs(dy)>3)){
        this.panState.moved=true;
        this.cancelGhost();
        this.selectionBox.visible=false;
        this.plots.forEach(p=>p.hover.visible=false);
      }
      if(this.panState.moved){
        const canvasH=this.renderer.domElement.clientHeight||innerHeight;
        const wpp=(2*(this.camBaseSize/this.zoom))/canvasH;
        const pitchRad=Math.asin(this.camBase.y/Math.hypot(this.camBase.y,this.camBase.z));
        const dzScale=wpp/Math.sin(pitchRad);
        this.pan.x=clamp(this.panState.startPanX-dx*wpp,this.panMin,this.panMax);
        this.pan.z=clamp(this.panState.startPanZ-dy*dzScale,this.panMin,this.panMax);
        return;
      }
    }
    this.updatePointer(e);
    this.updateHover();
  }
  handlePointerDown(e){
    if(this.paused||this.over)return;Audio.ensure();
    // Pan start: right button (2) or middle button (1)
    if(e.button===1||e.button===2){
      e.preventDefault();
      try{this.renderer.domElement.setPointerCapture(e.pointerId);}catch(err){}
      this.panState={startScreenX:e.clientX,startScreenY:e.clientY,
        startPanX:this.pan.x,startPanZ:this.pan.z,moved:false,button:e.button};
      return;
    }
    if(e.button!==0)return;
    this.updatePointer(e);this.updateHover();
    if(this.buildType){
      if(this.hoveredPlot&&!this.hoveredPlot.tower){
        if(tutorialStep===2&&this.hoveredPlot!==this.plots[0]){
          UI.toast('PLACE THE GUNNER ON THE PULSING PAD','gold');return;
        }
        this.build(this.buildType,this.hoveredPlot);return;}
      if(this.hoveredTower){this.cancelBuild();this.selectTower(this.hoveredTower);return;}
      return;
    }
    if(this.hoveredTower){this.selectTower(this.hoveredTower);return;}
    if(this.hoveredPlot&&this.hoveredPlot.tower){this.selectTower(this.hoveredPlot.tower);return;}
    if((tutorialStep===3||tutorialStep===4)&&this.selectedTower)return;
    this.selectTower(null);}
  handlePointerUp(e){
    if(!this.panState)return;
    const ps=this.panState;
    this.panState=null;
    try{this.renderer.domElement.releasePointerCapture(e.pointerId);}catch(err){}
    // Right-click without drag → original cancel behavior
    if(!ps.moved&&ps.button===2){
      this.cancelBuild();
      if(tutorialStep!==3&&tutorialStep!==4)this.selectTower(null);
    }
    // Refresh hover for the new camera position
    const px=this.pan.x,pz=this.pan.z;
    this.camera.position.set(this.camBase.x+px,this.camBase.y,this.camBase.z+pz);
    this.camera.lookAt(px,0,pz);
    this.camera.updateMatrixWorld();
    if(this.pointer.x>-1.5)this.updateHover();
  }
  handlePointerLeave(){this.pointer.set(-2,-2);this.clearHover();}
    onTouchStart(e){
    e.preventDefault();
    if(e.touches.length===1){
      this.touchState = { active: true, moved: false, startX: e.touches[0].clientX, startY: e.touches[0].clientY, lastX: e.touches[0].clientX, lastY: e.touches[0].clientY, isPinching: false };
    } else if(e.touches.length===2){
      if(!this.touchState) this.touchState = {};
      this.touchState.active = false; this.touchState.isPinching = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.touchState.pinchDist = Math.max(10, Math.hypot(dx, dy));
      this.touchState.startZoom = this.targetZoom;
    }
  }
  onTouchMove(e){
    e.preventDefault();
    if(!this.touchState) return;
    if(e.touches.length===1 && this.touchState.active){
      const stepDx = e.touches[0].clientX - this.touchState.lastX;
      const stepDy = e.touches[0].clientY - this.touchState.lastY;
      const totalMove = Math.hypot(e.touches[0].clientX - this.touchState.startX, e.touches[0].clientY - this.touchState.startY);
      if(!this.touchState.moved && totalMove > 14){
        this.touchState.moved = true;
        this.cancelGhost(); this.selectionBox.visible = false;
        this.plots.forEach(p => p.hover.visible = false);
      }
      if(this.touchState.moved){
        const canvasH = this.renderer.domElement.clientHeight || innerHeight;
        const wpp = (2 * (this.camBaseSize / this.zoom)) / canvasH;
        const pitchRad = Math.asin(this.camBase.y / Math.hypot(this.camBase.y, this.camBase.z));
        const dzScale = wpp / Math.sin(pitchRad);
        const dragFactor = 0.85;
        this.pan.x = clamp(this.pan.x - stepDx * wpp * dragFactor, this.panMin, this.panMax);
        this.pan.z = clamp(this.pan.z - stepDy * dzScale * dragFactor, this.panMin, this.panMax);
      }
      this.touchState.lastX = e.touches[0].clientX;
      this.touchState.lastY = e.touches[0].clientY;
    } else if(e.touches.length===2 && this.touchState.isPinching){
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.max(10, Math.hypot(dx, dy));
      const ratio = dist / this.touchState.pinchDist;
      this.targetZoom = clamp(this.touchState.startZoom * ratio, this.zoomMin, this.zoomMax);
    }
  }
  onTouchEnd(e){
    e.preventDefault();
    if(e.touches.length===0){
      if(this.touchState && this.touchState.active && !this.touchState.moved && !this.touchState.isPinching){
        // Barmaqla sadəcə klik (tık) edildisə
        const touch = e.changedTouches[0];
        const r = this.renderer.domElement.getBoundingClientRect();
        this.pointer.x = ((touch.clientX - r.left) / r.width) * 2 - 1;
        this.pointer.y = -((touch.clientY - r.top) / r.height) * 2 + 1;
        this.updateHover();
        this.handlePointerDown({ button: 0, clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
      }
      this.touchState = null;
    } else if(e.touches.length===1){
      this.touchState.isPinching = false; this.touchState.active = true;
      this.touchState.startX = e.touches[0].clientX; this.touchState.startY = e.touches[0].clientY;
    }
  }
  clearHover(){this.hoveredPlot=null;this.hoveredTower=null;
    this.selectionBox.visible=false;this.plots.forEach(p=>p.hover.visible=false);
    if(this.hoverRange)this.hoverRange.visible=false;
    this.cancelGhost();}
  getGroundHit(){
    this.raycaster.setFromCamera(this.pointer,this.camera);
    const result=this.raycaster.ray.intersectPlane(this.groundPlane,this.groundTarget);
    return result?this.groundTarget:null;}
  updateHover(){
    if(this.paused||this.over)return;
    if(this.pointer.x<-1.5)return;
    this.raycaster.setFromCamera(this.pointer,this.camera);
    const hits=this.raycaster.intersectObjects(this.pickables,false);
    let tower=null,plot=null;
    for(const h of hits){
      if(h.object.userData.tower){tower=h.object.userData.tower;break;}
      if(h.object.userData.plot){plot=h.object.userData.plot;break;}}
    if(this.buildType){
      this.hoveredTower=null;this.selectionBox.visible=false;
      this.plots.forEach(p=>p.hover.visible=false);
      if(plot&&!plot.tower){
        this.hoveredPlot=plot;plot.hover.visible=true;
        this.snapGhost(plot.x,plot.z,0x5effc2);
      }else if(plot&&plot.tower){
        this.hoveredPlot=null;plot.hover.visible=true;
        const g=this.getGroundHit();
        if(g)this.snapGhost(g.x,g.z,0xff6655);else this.cancelGhost();
      }else{
        this.hoveredPlot=null;
        const g=this.getGroundHit();
        if(g)this.snapGhost(g.x,g.z,0xff6655);else this.cancelGhost();
      }
      return;
    }
    this.hoveredTower=tower;this.hoveredPlot=plot;
    this.plots.forEach(p=>p.hover.visible=false);
    this.cancelGhost();
    if(this.hoverRange)this.hoverRange.visible=false;
    if(tower){
      this.showSelectionBox(tower.group);
      // Show faint range preview only when tower is NOT the currently-selected one
      // (selection already displays the range ring prominently)
      if(this.selectedTower!==tower&&this.hoverRange){
        this.hoverRange.position.set(tower.plot.x,.18,tower.plot.z);
        this.hoverRange.scale.set(tower.range,tower.range,tower.range);
        this.hoverRange.material.color.set(tower.def.color);
        this.hoverRange.material.opacity=.28;
        this.hoverRange.visible=true;
      }
      return;
    }
    if(plot){plot.hover.visible=true;this.selectionBox.visible=false;return;}
    this.selectionBox.visible=false;}
  showSelectionBox(obj){
    const box=new THREE.Box3().setFromObject(obj);
    const size=box.getSize(V3()),center=box.getCenter(V3());
    this.selectionBox.position.copy(center);
    this.selectionBox.scale.set(size.x+.18,size.y+.18,size.z+.18);
    this.selectionBox.visible=true;}
  ensureGhost(){
    if(this.ghost&&this.ghost.userData.type===this.buildType)return;
    if(this.ghost){this.scene.remove(this.ghost);this.ghost=null;}
    const g=ModelFactory[this.buildType]();
    const mat=new THREE.MeshStandardMaterial({color:0x5ee7ff,emissive:0x5ee7ff,emissiveIntensity:.7,transparent:true,opacity:.38,depthWrite:false});
    g.traverse(o=>{if(o.isMesh)o.material=mat;});
    g.userData.type=this.buildType;g.visible=false;this.scene.add(g);this.ghost=g;
    this._ghostColor=null;}
  cancelGhost(){
    if(this.ghost)this.ghost.visible=false;
    this.ghostRange.visible=false;
    this._ghostColor=null;}
  snapGhost(x,z,color){
    this.ensureGhost();
    this.ghost.position.set(x,0,z);
    this.ghost.visible=true;
    if(this._ghostColor!==color){
      this._ghostColor=color;
      this.ghost.traverse(o=>{
        if(o.isMesh&&o.material&&o.material.color){
          o.material.color.setHex(color);
          if(o.material.emissive)o.material.emissive.setHex(color);}});}
    const def=TOWER_TYPES[this.buildType];
    const mult=getUpgradeMultipliers(this.buildType);
    const range=def.range*mult.range;
    this.ghostRange.position.set(x,.18,z);
    this.ghostRange.scale.set(range,range,range);
    this.ghostRange.visible=true;
    this.ghostRange.material.color.setHex(color);
    this.ghostRange.material.opacity=color===0x5effc2?.45:.28;}
  build(type,plot){
    const def=TOWER_TYPES[type];
    if(this.towerCap&&this.towers.length>=this.towerCap){UI.toast('TOWER LIMIT REACHED // '+this.towerCap,'danger');Audio.sfx('error');return;}
    if(!this.spendCredits(def.cost)){UI.toast('INSUFFICIENT CREDITS','danger');Audio.sfx('error');return;}
    const t=new Tower(this,type,plot);
    this.towers.push(t);this.pickables.push(t.pick);
    Audio.sfx('build',plot.x);
    this.fx.spawn(plot.x,.8,plot.z,0x5ee7ff,14,5,3,.6);
    this.fx.ring(plot.x,plot.z,0x5ee7ff,2.2);
    Progress.bumpStat('totalTowersBuilt');
    this.cancelGhost();
    this.updateHover();
    UI.updateTowerBar();this.updateUI(true);
    
    if(tutorialStep===2){
      this.tutorialTarget=null;
      this.tutMarker.visible=false;
      this.cancelBuild();
      this.selectTower(t);
      tutorialStep=3;
      UI.showSelection(t);
      UI.updateTutorialHighlight(document.getElementById('btn-upgrade'),
        'Find the glowing DEFENSE panel. Then click its highlighted UPGRADE button to increase this tower\'s combat power.');
    }
  }
  selectTower(tower){
    if(this.selectedTower===tower)return;
    this.selectedTower=tower;
    if(!tower){UI.hideSelection();this.rangeRing.visible=false;return;}
    UI.showSelection(tower);
    this.rangeRing.position.set(tower.plot.x,0,tower.plot.z);
    this.rangeRing.scale.set(tower.range,tower.range,tower.range);
    this.rangeRing.material.color.set(tower.def.color);
    this.rangeRing.visible=true;}
  cancelBuild(){this.buildType=null;this.cancelGhost();UI.updateTowerBar();}
  isUnlocked(type){return this.G>=(TOWER_UNLOCKS[type]||1);}
  setBuildType(type){
    if(!this.isUnlocked(type)){UI.toast(TOWER_TYPES[type].name+' UNLOCKS AT MISSION '+TOWER_UNLOCKS[type],'danger');Audio.sfx('error');return;}
    if(tutorialStep>0&&tutorialStep<3&&type!=='gunner'){
      UI.toast('FIELD TRAINING: SELECT THE GUNNER','gold');return;
    }
    if(tutorialStep===3||tutorialStep===4){
      UI.toast('COMPLETE THE CURRENT FIELD TRAINING STEP','gold');return;
    }
    if(this.buildType===type){this.cancelBuild();return;}
    this.buildType=type;this.selectTower(null);UI.updateTowerBar();Audio.sfx('ui');
    if(this.pointer.x>-1.5)this.updateHover();
    
    if(tutorialStep===1&&type==='gunner'){
      tutorialStep=2;
      const targetPlot=this.plots[0];
      this.tutorialTarget={x:targetPlot.x,z:targetPlot.z};
      UI.updateTutorialHighlight(null,'Click the highlighted pad to place the tower.');
    }
  }
  startWave(){
    if((this.phase!=='prep'&&this.phase!=='tutorial')||this.over)return;
    this.waveIndex++;
    if(!this.isEndless && this.waveIndex>=this.waves.length){this.victory();return;}
    
    let groups;
    if(this.isEndless){
      groups = generateEndlessWave(this.waveIndex, this.stageIndex, this.map);
    } else {
      groups = this.waves[this.waveIndex];
    }
    
    this.spawnQueue=[];let t=0;let enemyCounter=0;
    const routeCount=this.activeRoutes.length;
    for(const g of groups){
      const interval=g.type==='infantry'||g.type==='technical'?.38:g.type==='tank'||g.type==='apc'?.90:.60;
      for(let i=0;i<g.count;i++){
        const routeIndex=routeCount>1?enemyCounter%routeCount:0;
        this.spawnQueue.push({type:g.type,time:t+i*interval,routeIndex});
        enemyCounter++;}
      t+=g.count*interval+1.25;}
    this.spawnQueue.sort((a,b)=>a.time-b.time);
    this.waveElapsed=0;this.waveTotal=this.spawnQueue.length;
    this.phase='spawning';this.prepTime=0;
    UI.hidePrep();UI.showWaveBanner(this.waveIndex+1,groups);
    Audio.sfx('alarm');gameplayStart();this.updateUI(true);}
  completeWave(){
    const bonus=25;
    this.addCredits(bonus);
    UI.toast('WAVE CLEARED  +'+bonus+' CR','gold');Audio.sfx('upgrade');
    Progress.bumpStat('totalWavesCleared');Progress.save();
    if(!this.isEndless && this.waveIndex>=this.waves.length-1){this.victory();return;}
    this.phase='prep';this.prepTime=8;this.updateUI(true);}
  update(dt){
    if(this.paused||this.over)return;
    // --- EMP TUTORIAL TRIGGER (Level 2, Wave 2) ---
    if(this.stageIndex===0 && this.level===2 && this.waveIndex===1 && !Progress.data.empTutorialDone && tutorialStep===0){
      
      let aboutToEscape = false;
      
      // Bütün qurulmuş qüllələri yoxlayırıq
      for (const t of this.towers) {
          // Əgər qüllənin hazırda hədəfi varsa və hədəf hələ də sağdırsa
          if (t.target && t.target.alive) {
              const e = t.target;
              const dx = e.group.position.x - t.plot.x;
              const dz = e.group.position.z - t.plot.z;
              const d = Math.hypot(dx, dz);
              
              // Skalyar hasil: Əgər nəticə > 0-dırsa, düşmən qüllədən UZAQLAŞIR (bazaya gedir)
              const dot = dx * e.dirVec.x + dz * e.dirVec.z;
              
              // Şərt: Düşmən mənzilin içindədir (d <= t.range), kənara yaxındır (d >= t.range - 2.0) 
              // VƏ qüllədən uzaqlaşır (dot > 0) - yəni spawn-a doğru yox, bazaya doğru gedir
              if (d <= t.range && d >= t.range - 2.0 && dot > 0) {
                  aboutToEscape = true;
                  break;
              }
          }
      }
      
      // Təhlükəsizlik üçün: Əgər oyunçu qüllələri elə güclüdürsə ki, heç bir düşmən mənzilin kənarına çatmır,
      // 15-ci saniyədə məcburi olaraq tutorialı işə salırıq.
      const timePassed = this.waveElapsed > 15;

      if(aboutToEscape || timePassed){
        tutorialStep=6; // EMP tutorial addımı
        this.paused=true; // Oyunu dondur
        UI.updateEMP(this);
        
        UI.updateTutorialHighlight(document.getElementById('emp-btn'),
          'An enemy is escaping the tower range! Use the EMP PULSE to stun all hostiles.');
      }
    }
    const sdt=dt*this.speed;
    this.empCooldown=Math.max(0,this.empCooldown-sdt);
    this.uiTimer-=sdt;
    if(this.uiTimer<=0){this.uiTimer=.1;this.updateUI();this.updateAirWarning();UI.updateEMP(this);}
    if(this.buildType&&this.pointer.x>-1.5)this.updateHover();
    
    if(this.tutorialTarget){
      this.tutMarker.visible=true;
      this.tutMarker.position.set(this.tutorialTarget.x,0,this.tutorialTarget.z);
      this.tutArrow.position.y=3+Math.sin(performance.now()*.005)*.5;
      this.tutRing.scale.setScalar(1+Math.sin(performance.now()*.005)*.1);
    } else {
      this.tutMarker.visible=false;
    }
    
    if(this.mapId==='desert'){
      this.sandstormTimer-=sdt;
      if(this.sandstormTimer<=0){this.sandstorm=8;this.sandstormTimer=42;
        UI.toast('SANDSTORM — TOWER RANGE REDUCED','danger');}
      if(this.sandstorm>0)this.sandstorm-=sdt;}
    this.weather.update(sdt);
    if(this.phase==='prep'&&tutorialStep===0){this.prepTime-=sdt;UI.updatePrep(this.prepTime);
      if(this.prepTime<=0)this.startWave();}
    else if(this.phase==='spawning'){this.waveElapsed+=sdt;
      while(this.spawnQueue.length&&this.spawnQueue[0].time<=this.waveElapsed){
        const q=this.spawnQueue.shift();
        const route=this.activeRoutes[q.routeIndex]||this.activeRoutes[0];
        const path=ENEMY_TYPES[q.type].air?route.air:route.path;
        this.enemies.push(new Enemy(this,q.type,path,this.waveIndex));}
      if(!this.spawnQueue.length)this.phase='active';}
    else if(this.phase==='active'){if(!this.enemies.length)this.completeWave();}
    for(const e of this.enemies)e.update(sdt);
    this.enemies=this.enemies.filter(e=>e.alive);
    for(const t of this.towers)t.update(sdt);
    for(const p of this.projectiles)p.update(sdt);
    this.projectiles=this.projectiles.filter(p=>!p.dead);
    this.fx.particles.update(sdt);this.fx.rings.update(sdt);this.fx.bolts.update(sdt);this.fx.flashes.update(sdt);
    if(this.baseRadar)this.baseRadar.rotation.y+=sdt*.5;
    if(this.baseShield)this.baseShield.material.opacity=.045+Math.sin(performance.now()*.002)*.015;
    for(const p of this.plots)if(p.hover.visible)
      p.hover.scale.setScalar(1.02);
    if(this.hoverRange&&this.hoverRange.visible){
      this.hoverRange.material.opacity=.22+Math.sin(performance.now()*.004)*.06;
    }
    // Keyboard pan (WASD / arrow keys)
    const panSpeed=22*sdt;
    if(this._panKeys.left)this.pan.x-=panSpeed;
    if(this._panKeys.right)this.pan.x+=panSpeed;
    if(this._panKeys.up)this.pan.z-=panSpeed;
    if(this._panKeys.down)this.pan.z+=panSpeed;
    this.pan.x=clamp(this.pan.x,this.panMin,this.panMax);
    this.pan.z=clamp(this.pan.z,this.panMin,this.panMax);
    const px=this.pan.x,pz=this.pan.z;
    if(this.cameraShake>0){this.cameraShake=Math.max(0,this.cameraShake-sdt*3);
      this.camera.position.set(
        this.camBase.x+px+rand(-1,1)*this.cameraShake,
        this.camBase.y+rand(-.5,.5)*this.cameraShake,
        this.camBase.z+pz+rand(-1,1)*this.cameraShake);}
    else this.camera.position.set(this.camBase.x+px,this.camBase.y,this.camBase.z+pz);
    this.camera.lookAt(px,0,pz);
    // Smooth zoom interpolation
    if(this.targetZoom!==undefined&&this.zoom!==this.targetZoom){
      this.zoom=lerp(this.zoom,this.targetZoom,Math.min(1,sdt*12));
      if(Math.abs(this.zoom-this.targetZoom)<0.001)this.zoom=this.targetZoom;
      this._applyZoom();
    }
  }
  updateAirWarning(){
    let targetWave=this.phase==='prep'?this.waveIndex+1:this.waveIndex;
    let warningText="";
    if(this.isEndless){
      const el=$('#air-warning');
      el.classList.add('hidden');
      return;
    }
    for(let offset=0;offset<=2;offset++){
      const checkIdx=targetWave+offset;
      if(checkIdx<this.waves.length&&this.waves[checkIdx]){
        const hasAir=this.waves[checkIdx].some(g=>ENEMY_TYPES[g.type].air);
        if(hasAir){
          if(offset===0)warningText="AIR ATTACK THIS WAVE";
          else if(offset===1)warningText="AIR ATTACK IN 1 WAVE";
          else warningText="AIR ATTACK IN 2 WAVES";
          break;
        }
      }
    }
    const el=$('#air-warning');
    if(warningText){el.textContent=warningText;el.classList.remove('hidden');}
    else{el.classList.add('hidden');}
  }
  updateUI(force){if(!force&&this.uiTimer>.02)return;UI.updateHUD(this);}
  damageFlash(){this.cameraShake=.5;const el=$('#damage-flash');
    el.classList.add('on');setTimeout(()=>el.classList.remove('on'),120);}
  victory(){
    if(this.over)return;this.over=true;this.phase='done';Audio.sfx('victory');
    const stars=this.lives>=18?3:this.lives>=12?2:1;
    const rewards = Progress.complete(this.stageIndex+1,this.level,stars); // Obyekt kimi tuturuq
    if(this.lives===20)Progress.bumpStat('flawlessWins');
    Progress.save();
    UI.showResult(true,stars,this,rewards.gold,rewards.expEarned); // EXP-ni də ötürürük
    gameplayStop();happytime();}
  defeat(){
    if(this.over)return;this.over=true;this.phase='done';Audio.sfx('defeat');
    
    if(this.isEndless){
      const stage = this.stageIndex + 1;
      const currentHigh = Progress.data.endlessHighScores[stage] || 0;
      if(this.waveIndex > currentHigh){
        Progress.data.endlessHighScores[stage] = this.waveIndex;
        Progress.save();
      }
      Progress.setStatMax('maxEndlessWave',this.waveIndex+1);
    }
    Progress.save();
    UI.showResult(false,0,this,0);gameplayStop();}
  resize(w,h){
    this.camAspect=w/h;
    this.camBaseSize=Math.max(26,24/this.camAspect);
    this._applyZoom();
    this.composer.setSize(w,h);
    if(this.pan){
      this.camera.position.set(this.camBase.x+this.pan.x,this.camBase.y,this.camBase.z+this.pan.z);
      this.camera.lookAt(this.pan.x,0,this.pan.z);
      this.camera.updateMatrixWorld();
    }
  }
  render(){this.composer.render();}
  dispose(){this.unbindEvents();disposeScene(this.scene);
    for(const t of this.uniqueTextures)if(t.dispose)t.dispose();
    this.composer.dispose();Audio.stopMusic();}
}

/* ========== EMP ABILITY ========== */
GameWorld.prototype.activateEMP=function(){
  if(!Progress.data.empTutorialDone && tutorialStep!==6)return false;
  if(this.paused||this.over||this.empCooldown>0||!(this.phase==='spawning'||this.phase==='active'))return false;
  this.empCooldown=this.empMaxCooldown;
  let affected=0;
  for(const e of this.enemies){
    if(!e.alive)continue;
    e.stun=Math.max(e.stun,2.0);
    if(e.shield>0){e.shield=Math.max(0,e.shield-e.shieldMax*.18);e.shieldTimer=2.8;}
    this.fx.spawn(e.group.position.x,e.group.position.y+e.def.barY*.45,e.group.position.z,0x5ee7ff,8,4,2,.48);
    affected++;
  }
  this.fx.ring(0,0,0x5ee7ff,28);
  const base=this.baseObj?.position;
  if(base)this.fx.ring(base.x,base.z,0x5ee7ff,6);
  Audio.sfx('tesla',0);
  UI.toast(affected?`EMP DISCHARGE // ${affected} HOSTILES DISRUPTED`:'EMP DISCHARGE // NO CONTACTS','gold',2400);
  UI.updateEMP(this);
  Progress.bumpStat('empUses');
  return true;
};

/* ========== TOWER UPGRADE STAT HOOK ========== */
const _origTowerUpgrade=Tower.prototype.upgrade;
Tower.prototype.upgrade=function(){
  const r=_origTowerUpgrade.call(this);
  if(r){Progress.bumpStat('totalUpgrades');Progress.setStatMax('highestTowerLevel',this.level);}
  return r;
};

/* ========== WAVE GENERATION ========== */
function weightedPick(pool,rng){
  let total=0;const weights=pool.map(t=>{const w=1/ENEMY_TYPES[t].cost;total+=w;return w;});
  let r=rng()*total;
  for(let i=0;i<pool.length;i++){r-=weights[i];if(r<=0)return pool[i];}
  return pool[pool.length-1];}

function generateEndlessWave(wIdx, stage, map) {
  const rng = mulberry32(wIdx * 7717 + stage * 977);
  
  const pool = ['infantry','technical','apc'];
  if (wIdx >= 2) pool.push('heli');
  if (wIdx >= 4) pool.push('tank');
  if (wIdx >= 6) pool.push('jet');
  if (wIdx >= 8) pool.push('drone');
  if (wIdx >= 10) pool.push('robot');
  if (wIdx >= 14) pool.push('heavy');
  
  const isBoss = (wIdx + 1) % 5 === 0;
  
  let budget = (15 + wIdx * 4.5 + stage * 10) * (1 + wIdx * 0.08);
  if (isBoss) budget *= 2.0;
  
  const groups = [];
  let remaining = budget;
  let guard = 0;
  let totalCount = 0;
  const maxEnemies = 60 + wIdx * 8;
  
  const airOnly = rng() < 0.15 && wIdx > 2;
  const candidates = pool.filter(t => airOnly ? ENEMY_TYPES[t].air : true);
  
  while (remaining > 1 && guard++ < 20 && totalCount < maxEnemies) {
    const type = weightedPick(candidates.length ? candidates : pool, rng);
    const cost = ENEMY_TYPES[type].cost;
    if (cost > remaining && groups.length) break;
    
    let count = Math.max(1, Math.floor((remaining * rand(0.2, 0.5)) / cost));
    count = Math.min(count, 30);
    if (type === 'heavy') count = Math.min(count, 1 + Math.floor(wIdx / 10));
    
    remaining -= count * cost;
    totalCount += count;
    groups.push({ type, count });
    
    if (airOnly && groups.length >= 2) break;
  }
  
  if (isBoss) {
    const bossType = stage === 0 ? 'apc' : stage === 1 ? 'tank' : stage === 2 ? 'robot' : 'heavy';
    const bossCount = 1 + Math.floor(wIdx / 15);
    groups.push({ type: bossType, count: bossCount });
  }
  
  return groups;
}

function generateWaves(stage,level,map,routeCount){
  const G=gIndex(stage,level),P=STAGE_PROFILE[stage],kind=levelKind(level);
  const rng=mulberry32(G*7919+routeCount*31+17); // deterministic: same level, same waves
  const pool=Object.keys(ENEMY_TYPES).filter(t=>G>=ENEMY_UNLOCK[t]);
  let _pool=pool.filter(t=>!ENEMY_TYPES[t].air || G>=TOWER_UNLOCKS.missile);
  const cheap=pool.filter(t=>ENEMY_TYPES[t].cost<=2);
  const n=8+Math.round(level*.65)+(kind==='boss'?2:0);
  const base=(BALANCE.base[0]+G*BALANCE.base[1])*P.count*(G===1?.8:1)*(kind==='swarm'?(G<5?1.3:1.6):1);
  const bossType=['apc','tank','robot','heavy'].filter(t=>pool.includes(t)).pop();
  const waves=[];
  for(let w=0;w<n;w++){
    const last=w===n-1,mini=w>2&&(w+1)%5===0;
    const swarmWave=kind==='swarm'||(w%3===1&&cheap.length>1&&G>2);
    let cand=(swarmWave?cheap:pool).filter(t=>!(G<14&&w<3&&ENEMY_TYPES[t].cost>=3));
    if(kind==='heavy'&&G>=7&&!swarmWave){const f=cand.filter(t=>ENEMY_TYPES[t].cost>=3);if(f.length)cand=f;}
    if(rng()<.2&&w>1&&!swarmWave){const air=cand.filter(t=>ENEMY_TYPES[t].air);if(air.length)cand=air;}
    if(!cand.length)cand=['infantry'];
    let rem=base*(1+w*BALANCE.countPerWave)*(w%4===3?1.2:1)*((last&&kind==='boss')||mini?1.5:1)*(swarmWave?1.35:1);
    const groups=[];let guard=0,total=0;
    while(rem>.6&&guard++<14&&total<150){
      const type=weightedPick(cand,rng),cost=ENEMY_TYPES[type].cost;
      if(cost>rem&&groups.length)break;
      let count=Math.max(1,Math.floor(rem*(.25+rng()*.3)/cost));
      count=Math.min(count,swarmWave?45:28);if(type==='heavy')count=Math.min(count,2);
      total+=count;rem-=count*cost;groups.push({type,count});}
    // each new enemy type debuts as a small squad mid-battle
    if(w===Math.floor(n*.45))for(const t of pool)if(G===ENEMY_UNLOCK[t]&&G>1)groups.push({type:t,count:Math.min(3,1+Math.floor(level/8))});
    if(last&&kind==='boss'&&bossType)groups.push({type:bossType,count:Math.min(bossType==='heavy'?2:6,1+Math.floor(level/6))});
    groups.sort((a,b)=>ENEMY_TYPES[a.type].cost-ENEMY_TYPES[b.type].cost);
    waves.push(groups);}
  return waves;}
  /* ========== UI ========== */
