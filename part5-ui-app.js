'use strict';
/* IRONLINE // Interface, tutorial, menus and application boot */
const ICONS={
  gunner:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="6"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><rect x="10" y="9" width="8" height="3" rx="1"/></svg>',
  cannon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20h16"/><path d="M7 20V9h6l5 5-2 2-4-4"/><circle cx="9" cy="17" r="2.5"/></svg>',
  missile:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2l4 6v8l-4 6-4-6V8z"/><path d="M12 8v8M8 14l-3 3M16 14l3 3"/></svg>',
  laser:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l6 9-6 9-6-9z"/><path d="M12 8v8"/></svg>',
  tesla:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13 2L4 14h6l-2 8 9-12h-6z"/></svg>'
};
const UI={
  game:null,currentStage:0,
  init(){this.buildTowerBar();this.bind();this.refreshMenuStats();},
  bind(){
    $('#btn-deploy').onclick=()=>{Audio.ensure();Audio.sfx('ui');this.buildMaps();this.show('screen-maps');};
    $('#btn-upgrades').onclick=()=>{Audio.ensure();Audio.sfx('ui');this.buildUpgrades();this.show('screen-upgrades');};
    $('#btn-upgrades-back').onclick=()=>{Audio.sfx('back');this.refreshMenuStats();this.show('screen-menu');};
    $('#btn-continue').onclick=()=>{Audio.ensure();Audio.sfx('ui');const st=Progress.data.unlockedStage;this.buildLevels(st);this.show('screen-levels');};
    $('#btn-maps-back').onclick=()=>{Audio.sfx('back');this.show('screen-menu');};
    $('#btn-levels-back').onclick=()=>{Audio.sfx('back');this.buildMaps();this.show('screen-maps');};
    $('#btn-endless-back').onclick=()=>{Audio.sfx('back');this.buildMaps();this.show('screen-maps');};
    $('#btn-endless-mode').onclick=()=>{
      Audio.sfx('ui');
      const unlocked = Object.values(Progress.data.endlessUnlocked).some(v=>v);
      if(!unlocked) {
        this.toast('ENDLESS MODE UNLOCKS AFTER CLEARING 20 LEVELS IN ANY THEATER','danger',4000);
        return;
      }
      this.buildEndlessMaps();
      this.show('screen-endless-maps');
    };
    $('#btn-achievements').onclick=()=>{Audio.sfx('ui');this.buildAchievements();this.show('screen-achievements');};
    $('#btn-achievements-back').onclick=()=>{Audio.sfx('back');this.refreshMenuStats();this.show('screen-menu');};
    $('#btn-daily-gift').onclick=()=>{Audio.ensure();Audio.sfx('ui');this.openDailyGift();};
    $('#btn-settings').onclick=()=>{this.syncSettingsUI();this.openModal('modal-settings');Audio.sfx('ui');};
    $('#btn-howto').onclick=()=>{this.openModal('modal-howto');Audio.sfx('ui');};
    $('#btn-pause').onclick=()=>this.pause(true);
    $('#btn-resume').onclick=()=>this.pause(false);
    $('#btn-restart').onclick=()=>{this.closeModal('modal-pause');this.startLevel(this.game.stageIndex,this.game.level);};
    $('#btn-quit').onclick=()=>{this.closeModal('modal-pause');this.quitToMaps();};
    $('#tutorial-skip').onclick=()=>this.skipTutorial();
    $('#btn-speed').onclick=()=>{if(!this.game)return;
      const SP=[1,1.5,2];this.game.speed=SP[(SP.indexOf(this.game.speed)+1)%SP.length];
      $('#btn-speed').textContent=this.game.speed+'X';
      $('#btn-speed').classList.toggle('active',this.game.speed>1);Audio.sfx('ui');
    };
    $('#wave-btn').onclick=()=>{if(!this.game)return;
      if(this.game.phase==='prep'){
        const completesTutorial=tutorialStep===5;
        this.game.startWave();
        if(completesTutorial)this.completeTutorial();
      }};
    $('#btn-upgrade').onclick=()=>{
      if(this.game&&this.game.selectedTower){
        const t=this.game.selectedTower;const c=t.upgradeCost();
        if(c===null){this.toast('MAX LEVEL','');return;}
        if(this.game.credits<c){this.toast('INSUFFICIENT CREDITS','danger');return;}
        if(!t.upgrade()){this.toast('INSUFFICIENT CREDITS','danger');return;}
        this.showSelection(t);this.updateTowerBar();this.updateHUD(this.game);}};
    // v2.3.2: hover preview — show next-level stats in green
    $('#btn-upgrade').onmouseenter=()=>{
      document.querySelectorAll('.sel-stat').forEach(el=>el.classList.add('preview'));
    };
    $('#btn-upgrade').onmouseleave=()=>{
      document.querySelectorAll('.sel-stat').forEach(el=>el.classList.remove('preview'));
    };
    $('#btn-sell').onclick=()=>{
      if(this.game&&this.game.selectedTower){
        this.game.selectedTower.sell();this.hideSelection();
        this.updateTowerBar();this.updateHUD(this.game);}};
    $('#emp-btn').onclick=()=>{
      if(this.game){
        if(tutorialStep===6){
          tutorialStep=0;
          Progress.data.empTutorialDone=true;
          Progress.save();
          this.clearTutorial();
          this.game.paused=false;
          this.game.activateEMP();
          Audio.sfx('ui');
        } else if(this.game.activateEMP()){
          Audio.sfx('ui');
        }
      }
    };
    $('#btn-target-mode').onclick=()=>{
      const tower=this.game?.selectedTower;
      if(!tower)return;
      tower.cycleTargetMode();
      this.showSelection(tower);
      this.toast('TARGET PRIORITY // '+tower.targetMode.toUpperCase(),'');
      Audio.sfx('ui');
      if(tutorialStep===4)this.advanceTutorialToWave();
    };
    $$('.modal-close,[data-close]').forEach(b=>b.onclick=()=>{
      $$('.modal').forEach(m=>m.classList.remove('open'));
      if(this.game)this.game.paused=false;});
    $('#btn-replay-tutorial').onclick=()=>{
      Progress.data.tutorialDone=false;Progress.save();
      this.closeModal('modal-settings');
      this.startLevel(0,1);
    };
    $('#btn-reset-progress').onclick=()=>{
      if(confirm('Reset all campaign progress, gold, and upgrades?')){
        Progress.data={unlockedStage:1,completed:{},stars:{},gold:0,upgrades:{gunner:0,cannon:0,missile:0,laser:0,tesla:0},tutorialDone:false,tutorialArmoryDone:false,empTutorialDone:false,endlessUnlocked:{1:false,2:false,3:false,4:false},endlessHighScores:{1:0,2:0,3:0,4:0},achievements:{},stats:{totalKills:0,totalWavesCleared:0,totalTowersBuilt:0,totalUpgrades:0,empUses:0,flawlessWins:0,highestTowerLevel:1,highestArmoryTier:0,maxEndlessWave:0,bestDailyStreak:0},dailyStreak:0,lastDailyGift:0};
        Progress.save();this.refreshMenuStats();this.toast('PROGRESS RESET','');}};
    ['music','sfx','bloom','shadows'].forEach(k=>{
      const el=$('#set-'+k);if(!el)return;
      el.onclick=()=>{Settings.data[k]=!Settings.data[k];
        el.classList.toggle('on',Settings.data[k]);Settings.save();
        if(k==='music')Audio.setMusic(Settings.data[k]);
        if(k==='sfx')Audio.setSfx(Settings.data[k]);};});
    document.addEventListener('keydown',e=>this.handleKey(e));
    document.addEventListener('keyup',e=>this.handleKeyUp(e));},
  syncSettingsUI(){['music','sfx','bloom','shadows'].forEach(k=>{
    const el=$('#set-'+k);if(el)el.classList.toggle('on',Settings.data[k]);});},
  handleKey(e){
    if(e.key==='Escape'){
      if($('#modal-pause').classList.contains('open')){this.pause(false);return;}
      if(this.game&&!this.game.over){
        if(this.game.buildType){this.game.cancelBuild();}
        else if(this.game.selectedTower&&(tutorialStep!==3&&tutorialStep!==4)){this.game.selectTower(null);}
        else if(tutorialStep===3||tutorialStep===4||tutorialStep===6){return;}
        else{this.pause(true);}return;}}
    if(!this.game||this.game.paused||this.game.over)return;
    const k=e.key.toLowerCase();
    if(k===' '){e.preventDefault();if(this.game.phase==='prep')$('#wave-btn').click();}
    if(k>='1'&&k<='5'){const t=TOWER_ORDER[parseInt(k)-1];if(t)this.game.setBuildType(t);}
    if(k==='u'&&this.game.selectedTower){const t=this.game.selectedTower;
      if(t.upgradeCost()===null&&t.level<4)this.toast('LEVEL '+(t.level+1)+' UNLOCKS IN THE ARMORY // '+t.def.name+' TIER '+(t.level===2?1:3),'gold',3000);
      else $('#btn-upgrade').click();}
    if(k==='x'&&this.game.selectedTower)$('#btn-sell').click();
    if(k==='f')$('#btn-speed').click();
    if(k==='t'&&this.game.selectedTower){
      const tower=this.game.selectedTower;tower.cycleTargetMode();this.showSelection(tower);Audio.sfx('ui');
      if(tutorialStep===4)this.advanceTutorialToWave();
    }
    if(k==='e'){
      if(tutorialStep===6) $('#emp-btn').click();
      else this.game.activateEMP();
    }
    if(e.key==='+'||e.key==='=')this.game.targetZoom=clamp(this.game.targetZoom*1.18,this.game.zoomMin,this.game.zoomMax);
    else if(e.key==='-'||e.key==='_')this.game.targetZoom=clamp(this.game.targetZoom*0.85,this.game.zoomMin,this.game.zoomMax);
    else if(e.key==='0'){this.game.targetZoom=1;this.game.pan.x=0;this.game.pan.z=0;}
    const panMap={arrowleft:'left',arrowright:'right',arrowup:'up',arrowdown:'down',a:'left',d:'right',w:'up',s:'down'};
    if(panMap[k]){e.preventDefault();this.game._panKeys[panMap[k]]=true;}
    if(k==='p')this.pause(true);},
  handleKeyUp(e){
    if(!this.game)return;
    const k=e.key.toLowerCase();
    const panMap={arrowleft:'left',arrowright:'right',arrowup:'up',arrowdown:'down',a:'left',d:'right',w:'up',s:'down'};
    if(panMap[k])this.game._panKeys[panMap[k]]=false;
  },
  show(id){
    if(id!=='screen-game')this.clearAirWarning();
    $$('.screen').forEach(s=>s.classList.toggle('active',s.id===id));
    if(id==='screen-menu'){this.refreshMenuStats();this.refreshDailyGiftButton();}
  },
  clearAirWarning(){
    const el=$('#air-warning');
    if(el){el.classList.add('hidden');el.textContent='';}
  },
  startLevel(stage,level){
    this.closeAllModals();
    this.clearTutorial();
    this.clearAirWarning();
    const old=App.world;if(old)old.dispose();
    const gw=new GameWorld(stage,level,App.renderer);
    App.world=gw;this.game=gw;
    this.show('screen-game');$('#screen-game').classList.add('active');
    gw.start();this.buildTowerBar();UI.updateEMP(gw);this.hideTowerTooltip();
    $('#btn-speed').textContent='1X';$('#btn-speed').classList.remove('active');
    const m=MAPS[stage];
    document.documentElement.style.setProperty('--accent',m.accent);
    $('#hud-kicker').textContent='THEATER '+String(stage+1).padStart(2,'0');
    $('#hud-stage').textContent=m.name;
    $('#hud-level').textContent=level===ENDLESS_LEVEL ? 'ENDLESS SURVIVAL' : 'MISSION '+String(level).padStart(2,'0')+' · '+STAGE_PROFILE[stage].name;
    this.hideSelection();this.hidePrep();
    gw.resize(innerWidth,innerHeight);
    
    if(!Progress.data.tutorialDone&&stage===0&&level===1){
      setTimeout(()=>this.startTutorial(gw),300);
    }
  },
  startTutorial(gw){
    if(!gw||this.game!==gw||Progress.data.tutorialDone)return;
    tutorialStep=1;
    gw.phase='tutorial';
    gw.prepTime=999;
    this.updatePrep(0);
    $('#wave-btn').disabled=true;
    const gunnerCard=document.querySelector('.tower-card[data-type="gunner"]');
    this.updateTutorialHighlight(gunnerCard,
      'Welcome to IRONLINE. Start by selecting the GUNNER defense from the tower bar.');
  },
  advanceTutorialToWave(){
    if(tutorialStep!==4||!this.game)return;
    tutorialStep=5;
    const g=this.game;
    g.phase='prep';
    g.waveIndex=-1;
    g.prepTime=12;
    this.updatePrep(12);
    this.updateHUD(g);
    this.updateTutorialHighlight(document.getElementById('wave-btn'),
      'Your defense is ready. Start the first wave when you are prepared.');
  },
  completeTutorial(){
    Progress.data.tutorialDone=true;
    Progress.save();
    tutorialStep=0;
    this.clearTutorial();
    if(this.game&&this.game.selectedTower)this.showSelection(this.game.selectedTower);
    this.toast('FIELD TRAINING COMPLETE','gold',2800);
  },
  skipTutorial(){
    if(!this.game)return;
    const g=this.game;
    Progress.data.tutorialDone=true;
    Progress.save();
    tutorialStep=0;
    g.phase='prep';
    g.waveIndex=-1;
    g.prepTime=12;
    this.clearTutorial();
    this.updatePrep(12);
    this.updateHUD(g);
    if(g.selectedTower)this.showSelection(g.selectedTower);
    this.toast('FIELD TRAINING SKIPPED','gold',2200);
  },
  clearTutorial(){
    tutorialStep=0;
    this.tutorialTargetEl=null;this.tutorialSpotEl=null;
    document.getElementById('tutorial-highlight').classList.add('hidden');
    document.getElementById('tutorial-message').classList.add('hidden');
    document.querySelectorAll('.tutorial-highlight').forEach(el=>el.classList.remove('tutorial-highlight'));
    const selectionPanel=document.getElementById('sel-panel');
    if(selectionPanel)selectionPanel.classList.remove('tutorial-upgrade-focus');
    if(App.world&&App.world.tutMarker)App.world.tutMarker.visible=false;
  },
  startTutorialFollow(){ // keep the spotlight glued to its target every frame (the panel slides in)
    if(this._tutFollow)return;
    const loop=()=>{if(!tutorialStep){this._tutFollow=0;return;}this.refreshTutorialPosition();this._tutFollow=requestAnimationFrame(loop);};
    this._tutFollow=requestAnimationFrame(loop);},
  refreshTutorialPosition(){
    const el=this.tutorialSpotEl||this.tutorialTargetEl;
    const highlight=$('#tutorial-highlight');
    if(!el||!el.isConnected){highlight.classList.add('hidden');return;}
    const rect=el.getBoundingClientRect();
    if(!rect.width||!rect.height){highlight.classList.add('hidden');return;}
    highlight.classList.remove('hidden');
    highlight.style.left=Math.round(rect.left-5)+'px';
    highlight.style.top=Math.round(rect.top-5)+'px';
    highlight.style.width=Math.round(rect.width+10)+'px';
    highlight.style.height=Math.round(rect.height+10)+'px';
  },
    updateTutorialHighlight(el,msg){
    const highlight=$('#tutorial-highlight');
    const message=$('#tutorial-message');
    document.querySelectorAll('.tutorial-highlight').forEach(e=>e.classList.remove('tutorial-highlight'));
    const selectionPanel=$('#sel-panel');
    if(selectionPanel)selectionPanel.classList.toggle('tutorial-upgrade-focus',tutorialStep===3);

    // --- YENİ: Tutorial pəncərəsinin yerini tənzimləyirik (3 və 4-cü addımlar sağda) ---
    if(tutorialStep===3 || tutorialStep===4){
      message.classList.add('tut-right');
      message.classList.remove('tut-left');
    } else {
      message.classList.add('tut-left');
      message.classList.remove('tut-right');
    }
    // ---------------------------------------------------------------------------------

    this.tutorialTargetEl=el||null;
    this.tutorialSpotEl=(tutorialStep===3||tutorialStep===4)?$('#sel-panel'):null; // light the whole defense panel
    this.startTutorialFollow();
    if(el){
      if(el.classList.contains('btn')||el.classList.contains('tower-card'))el.classList.add('tutorial-highlight');
      this.refreshTutorialPosition();
    }else{
      highlight.classList.add('hidden');
    }

    const steps={
      1:{title:'SELECT YOUR FIRST DEFENSE',action:'ACTION // SELECT THE GUNNER'},
      2:{title:'PLACE THE TOWER',action:'ACTION // CLICK THE PULSING PAD'},
      3:{title:'UPGRADE YOUR DEFENSE',action:'ACTION // DEFENSE PANEL → UPGRADE'},
      4:{title:'SET TARGET PRIORITY',action:'ACTION // CYCLE TARGET PRIORITY'},
      5:{title:'READY FOR COMBAT',action:'ACTION // START WAVE 01'},
      6:{title:'EMP PULSE',action:'ACTION // CLICK EMP PULSE'}
    };
    const step=Math.max(1,Math.min(6,tutorialStep||1));
    if(step===6){
      $('#tutorial-counter').textContent='EMP';
    } else {
      $('#tutorial-counter').textContent=String(step).padStart(2,'0')+' / 05';
    }
    
    const meta=steps[step];
    $('#tutorial-title').textContent=meta.title;
    $('#tutorial-copy').textContent=msg||'';
    $('#tutorial-action').textContent=meta.action;
    $('#tutorial-progress').innerHTML=Array.from({length:5},(_,i)=>
      `<span class="${i<step?'done':''}"></span>`).join('');
    message.classList.remove('hidden');
  },
  quitToMaps(){Audio.stopMusic();
    this.clearTutorial();
    this.clearAirWarning();
    if(this.game){this.game.dispose();this.game=null;}
    App.world=new AttractWorld(App.renderer);
    App.world.resize(innerWidth,innerHeight);
    this.buildMaps();this.show('screen-maps');
    this.hideSelection();this.hidePrep();this.hideTowerTooltip();},
  buildMaps(){const grid=$('#map-grid');grid.innerHTML='';
    MAPS.forEach((m,i)=>{const stage=i+1;
      const unlocked=Progress.stageUnlocked(stage);
      const done=Progress.maxCompleted(stage);
      const card=document.createElement('div');
      card.className='map-card'+(unlocked?'':' locked');
      const thumb=makeMapThumb(m);
      card.innerHTML=`
        <div class="preview" style="background-image:url('${thumb}')"></div>
        <div class="overlay"></div>
        <div class="meta">
          <div class="pill ${unlocked?'hot':''}">THEATER ${String(stage).padStart(2,'0')}</div>
          <div class="pill">${done}/${LEVELS_PER_STAGE}</div>
        </div>
        <div class="info">
          <div class="kicker">${m.sub}</div>
          <h3>${m.name}</h3>
          <p>${m.modifier}</p>
        </div>
        ${unlocked?'':`<div class="lock-badge"><div class="lock-ico"></div>CLEAR PREVIOUS THEATER</div>`}
      `;
      if(unlocked)card.onclick=()=>{Audio.sfx('ui');this.buildLevels(stage);this.show('screen-levels');};
      grid.appendChild(card);});},
  buildEndlessMaps(){const grid=$('#endless-map-grid');grid.innerHTML='';
    MAPS.forEach((m,i)=>{const stage=i+1;
      const unlocked=Progress.data.endlessUnlocked[stage];
      const hs=Progress.data.endlessHighScores[stage]||0;
      const card=document.createElement('div');
      card.className='map-card endless-card'+(unlocked?'':' locked');
      const thumb=makeMapThumb(m);
      card.innerHTML=`
        <div class="preview" style="background-image:url('${thumb}')"></div>
        <div class="overlay"></div>
        <div class="endless-score">BEST: ${hs > 0 ? 'WAVE ' + hs : 'NO RECORD'}</div>
        <div class="meta">
          <div class="pill ${unlocked?'hot':''}">SURVIVAL</div>
        </div>
        <div class="info">
          <div class="kicker">${m.sub}</div>
          <h3>${m.name}</h3>
          <p>Face infinite waves. How long can you hold?</p>
        </div>
        ${unlocked?'':`<div class="lock-badge"><div class="lock-ico"></div>CLEAR 20 LEVELS TO UNLOCK</div>`}
      `;
      if(unlocked)card.onclick=()=>{Audio.sfx('ui');this.startLevel(stage-1,ENDLESS_LEVEL);};
      grid.appendChild(card);});},
  buildLevels(stage){this.currentStage=stage-1;const m=MAPS[stage-1];
    $('#levels-kicker').textContent='THEATER '+String(stage).padStart(2,'0');
    $('#levels-title').textContent=m.name;
    $('#levels-desc').textContent=m.modifier;
    const grid=$('#level-grid');grid.innerHTML='';
    for(let l=1;l<=LEVELS_PER_STAGE;l++){
      const unlocked=Progress.levelUnlocked(stage,l);
      const stars=Progress.data.stars[stage+'-'+l]||0;
      const current=unlocked&&!Progress.data.completed[stage+'-'+l];
      const routeCount=getActiveRoutes(stage-1,l).length;
      const routeDots=Array.from({length:routeCount},()=>'<i></i>').join('');
      const el=document.createElement('div');
      el.className='level-node'+(unlocked?'':' locked')+(current?' current':'');
      el.innerHTML=`
        ${l%10===0?'<div class="boss-tag">BOSS</div>':''}
        <div class="routes">${routeDots}</div>
        <div class="num">${String(l).padStart(2,'0')}</div>
        ${(()=>{const u=TOWER_ORDER.filter(t=>TOWER_UNLOCKS[t]===gIndex(stage-1,l)&&gIndex(stage-1,l)>1);return u.length?'<div class="lbl unlock">+ '+TOWER_TYPES[u[0]].name+'</div>':'<div class="lbl">MISSION</div>';})()}
        <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div>
      `;
      if(unlocked)el.onclick=()=>{Audio.sfx('ui');this.startLevel(stage-1,l);};
      grid.appendChild(el);}
  },
  buildUpgrades(){this.renderUpgradeCards();},
  pulseGold(){const el=$('#gold-amount');if(!el)return;
    el.classList.add('pulse');setTimeout(()=>el.classList.remove('pulse'),250);},
  renderUpgradeCards(){
    const grid=$('#upgrade-grid');if(!grid)return;
    grid.innerHTML='';const goldEl=$('#gold-amount');
    const header = document.querySelector('.upgrade-header');
    let levelBox = document.getElementById('commander-level-box');
    if(!levelBox && header) {
      levelBox = document.createElement('div');
      levelBox.id = 'commander-level-box';
      levelBox.style = "margin-right: 20px; text-align: right;";
      header.appendChild(levelBox);
    }
    if(levelBox) {
      const xpRequirements = [0, 50, 100, 175, 300, 450, 620, 820, 1100, 1500, 1950, 2500, 3300, 4000, 5000]; 
      const getXpNeeded = (lvl) => xpRequirements[lvl] || (5000 + ((lvl - 14) * 500));
      const xpNeeded = getXpNeeded(Progress.data.playerLevel);
      
      levelBox.innerHTML = `
        <div class="g-label" style="color:var(--accent)">COMMANDER LVL ${Progress.data.playerLevel}</div>
        <div style="font-size:10px; color:#aaa; margin-top:2px">XP: ${Progress.data.playerExp} / ${xpNeeded}</div>
      `;
    }
    if(goldEl)goldEl.textContent=Progress.data.gold;
    
    if(!Progress.data.tutorialArmoryDone){
      const wrap=document.querySelector('.upgrade-wrap');
      let banner=document.getElementById('armory-tutorial');
      if(!banner){
        banner=document.createElement('section');
        banner.id='armory-tutorial';
        banner.className='armory-tutorial-card';
        wrap.insertBefore(banner,wrap.firstChild);
      }
      const affordable=TOWER_ORDER.some(type=>Progress.canUpgrade(type));
      banner.innerHTML=`
        <div class="armory-tutorial-icon">◆</div>
        <div>
          <div class="armory-tutorial-kicker">COMMAND TRAINING // RESEARCH</div>
          <div class="armory-tutorial-title">TURN GOLD INTO PERMANENT FIREPOWER</div>
          <p class="armory-tutorial-copy">Choose a defense below and purchase its next tier. The bonus applies to that tower type in every mission, not just the current battle.</p>
          <div class="armory-tutorial-status">${affordable?'YOUR BALANCE IS READY — SELECT ANY AVAILABLE UPGRADE BELOW.':'COMPLETE A MISSION TO EARN GOLD, THEN RETURN HERE TO INVEST IT.'}</div>
        </div>`;
    } else {
      const banner=document.getElementById('armory-tutorial');
      if(banner)banner.remove();
    }
    
    for(const type of TOWER_ORDER)grid.appendChild(this.makeUpgradeCard(type));
  },
  makeUpgradeCard(type){
    const def=TOWER_TYPES[type];const tier=Progress.data.upgrades[type]||0;
    const maxed=tier>=UPGRADE_TIERS;const cost=maxed?null:upgradeCostFor(type,tier);
    const open=towerUnlockedInCampaign(type);

    const reqLevels = [2, 4, 6, 8, 10]; 
    const requiredLevel = reqLevels[tier];
    const hasLevel = Progress.data.playerLevel >= requiredLevel;

    const canAfford=open&&hasLevel&&!maxed&&Progress.data.gold>=cost;
    const cur=getUpgradeMultipliers(type);
    const nextTier=Math.min(tier+1,UPGRADE_TIERS);
    const next={damage:1+nextTier*0.12,range:1+nextTier*0.04,rate:1+nextTier*0.05};
    const lines=[];
    if(type==='laser'){
      lines.push(['DPS',(def.dps*cur.damage).toFixed(1),maxed?null:(def.dps*next.damage).toFixed(1)]);
      lines.push(['RANGE',(def.range*cur.range).toFixed(1),maxed?null:(def.range*next.range).toFixed(1)]);
    }else{
      lines.push(['DMG',(def.damage*cur.damage).toFixed(1),maxed?null:(def.damage*next.damage).toFixed(1)]);
      lines.push(['RATE',(def.rate*cur.rate).toFixed(2)+'/s',maxed?null:(def.rate*next.rate).toFixed(2)+'/s']);
      lines.push(['RANGE',(def.range*cur.range).toFixed(1),maxed?null:(def.range*next.range).toFixed(1)]);}
    const card=document.createElement('div');
    card.className='upgrade-card'+(maxed?' maxed':'')+(open?'':' locked');
    const ul=[[3,1],[4,3]].map(([lv,tr])=>`<span class="${tier>=tr?'on':''}">LV ${lv} @ TIER ${tr}</span>`).join('');
    card.style.setProperty('--tc',def.color);
    card.style.setProperty('--tc-a',def.color+'33');
    const tierSegs=Array.from({length:UPGRADE_TIERS},(_,i)=>`<div class="tier-seg ${i<tier?'on':''}"></div>`).join('');
    const statHTML=lines.map(([k,curV,nextV])=>{
      if(maxed||nextV===null)return `<div class="uc-stat maxed"><span class="k">${k}</span><span class="v">${curV}</span></div>`;
      return `<div class="uc-stat"><span class="k">${k}</span><span><span class="v">${curV}</span><span class="arrow">→</span><span class="v next">${nextV}</span></span></div>`;}).join('');
    let btnHTML;
    if(!open)btnHTML=`<button class="btn" disabled>🔒 UNLOCKS AT MISSION ${TOWER_UNLOCKS[type]}</button>`;
    else if(!hasLevel)btnHTML=`<button class="btn" disabled>🔒 REQ. COMMANDER LV ${requiredLevel}</button>`;
    else if(maxed)btnHTML=`<button class="btn maxed">MAXED</button>`;
    else btnHTML=`<button class="btn ${canAfford?'gold':''}" ${canAfford?'':'disabled'}><span class="price">${cost}</span> UPGRADE</button>`;
    card.innerHTML=`
      <div class="uc-head">
        <div class="uc-icon">${ICONS[type]}</div>
        <div><div class="uc-name">${def.name}</div><div class="uc-desc">${
        !open ? 'LOCKED // REACH MISSION '+TOWER_UNLOCKS[type]+' TO UNLOCK' : 
        !hasLevel ? 'LOCKED // NEED COMMANDER LEVEL '+requiredLevel : 
        def.desc
      }</div></div>
      </div>
      <div class="uc-tier"><span class="uc-tier-label">TIER</span><span class="uc-tier-count">${tier} / ${UPGRADE_TIERS}</span></div>
      <div class="tier-bar">${tierSegs}</div>
      <div class="uc-unlock">${ul}</div>
      <div class="uc-stats">${statHTML}</div>
      <div class="uc-btn">${btnHTML}</div>
    `;
    if(!maxed&&canAfford){
      const btn=card.querySelector('.uc-btn .btn');
      btn.onclick=()=>{if(Progress.buyUpgrade(type)){
        Audio.sfx('coin');this.pulseGold();this.renderUpgradeCards();
        this.refreshMenuStats();{const nt=Progress.data.upgrades[type],ms=nt===1||nt===3;this.toast(ms?'TOWER LEVEL '+(nt===1?3:4)+' UNLOCKED: '+def.name:'UPGRADED '+def.name,'gold',ms?2800:1400);}}};}
    return card;},
  buildTowerBar(){const bar=$('#tower-bar');if(!bar)return;bar.innerHTML='';
    this.hideTowerTooltip();
    TOWER_ORDER.forEach((type,i)=>{const d=TOWER_TYPES[type];
      const tier=Progress.data.upgrades[type]||0;
      const card=document.createElement('div');
      card.className='tower-card';card.dataset.type=type;
      card.style.setProperty('--tc',d.color);
      card.innerHTML=`
        <div class="tc-icon">${ICONS[type]}</div>
        <div class="tc-info"><div class="tc-name">${d.name}</div><div class="tc-cost">${d.cost} CR</div></div>
        <div class="tc-key">${i+1}</div>
        ${this.game&&!this.game.isUnlocked(type)?'<div class="tc-lock">LV '+TOWER_UNLOCKS[type]+'</div>':''}
        ${tier>0?`<div class="tc-tier">T${tier}</div>`:''}
        <div class="tc-bar"></div>
      `;
      card.onclick=()=>{if(this.game)this.game.setBuildType(type);};
      card.onmouseenter=(e)=>{
        // Yalnız kompüterdə (siçan varsa) göstər
        if(window.matchMedia("(hover: hover)").matches) {
          Audio.sfx('uiHover');
          this.showTowerTooltip(type,e.currentTarget);
        }
      };
      card.onmouseleave=()=>this.hideTowerTooltip();
      bar.appendChild(card);});
    this.updateTowerBar();},
  updateTowerBar(){if(!this.game)return;
    $$('.tower-card').forEach(card=>{const t=card.dataset.type;
      const def=TOWER_TYPES[t];
      card.classList.toggle('selected',this.game.buildType===t);
      const open=this.game.isUnlocked(t);card.classList.toggle('locked',!open);card.classList.toggle('unaffordable',open&&this.game.credits<def.cost);
      const bar=card.querySelector('.tc-bar');
      if(bar)bar.style.width=this.game.buildType===t?'100%':'0%';});},
  showTowerTooltip(type,anchor){
    const def=TOWER_TYPES[type];const tip=$('#tower-tooltip');
    if(!tip||!def)return;
    const mult=getUpgradeMultipliers(type);
    const tier=Progress.data.upgrades[type]||0;
    const dmgVal=type==='laser'
      ?(def.dps*mult.damage).toFixed(0)+' /s'
      :((def.damage||0)*mult.damage).toFixed(0);
    const rateVal=type==='laser'?'—':(def.rate*mult.rate).toFixed(2)+'/s';
    const rangeVal=(def.range*mult.range).toFixed(1);
    const rows=[
      ['COST',def.cost+' CR','gold'],
      ['DAMAGE',dmgVal,''],
      ['RANGE',rangeVal,''],
      ['FIRE RATE',rateVal,''],
      ['TARGETS',def.air?'AIR + GROUND':'GROUND','cyan'],['MAX LEVEL','LV '+towerMaxLevel(type),'green']
    ];
    if(def.splash)rows.push(['SPLASH',def.splash+' units','']);
    if(def.chain)rows.push(['CHAIN',def.chain+' targets','']);
    tip.innerHTML=`
      <div class="tt-name">${def.name}</div>
      <div class="tt-desc">${def.desc}</div>
      ${rows.map(([k,v,cls])=>`<div class="tt-row"><span class="k">${k}</span><span class="v ${cls}">${v}</span></div>`).join('')}
      ${tier>0?`<div class="tt-tier">ARMORY TIER ${tier} · +${tier*12}% DMG</div>`:''}
    `;
    tip.classList.add('show');
    const rect=anchor.getBoundingClientRect();
    // Measure after content is set
    const tr=tip.getBoundingClientRect();
    let x=rect.left+rect.width/2-tr.width/2;
    let y=rect.top-tr.height-10;
    if(y<8)y=rect.bottom+10;              // Fall below if no room above
    x=Math.max(8,Math.min(innerWidth-tr.width-8,x));
    tip.style.left=Math.round(x)+'px';
    tip.style.top=Math.round(y)+'px';
  },
  hideTowerTooltip(){const tip=$('#tower-tooltip');if(tip)tip.classList.remove('show');},
  updateCredits(g){if(!g)return;
    $('#hud-credits').textContent=Math.floor(g.credits);
    this.updateTowerBar();
    if(g.selectedTower){
      const cost=g.selectedTower.upgradeCost();
      const button=$('#btn-upgrade');
      if(button)button.disabled=cost===null||g.credits<cost;
    }
  },
  updateHUD(g){if(!g)return;
    this.updateCredits(g);
    $('#hud-lives').textContent=Math.max(0,Math.ceil(g.lives-1e-9));
    $('#lives-wrap').classList.toggle('low',g.lives<=6);
    
    const totalWaves = g.isEndless ? '∞' : (g.waves.length||0);
    const waveNum=Math.min(g.waveIndex+1,totalWaves);
    
    $('#hud-wave').textContent=String(Math.max(0,waveNum)).padStart(2,'0');
    $('#hud-wave-total').textContent=totalWaves;
    const alive=g.enemies.length+g.spawnQueue.length;
    $('#hud-enemies').textContent=alive+' HOSTILE'+(alive===1?'':'S');
    
    let fill=0;
    if(g.isEndless) {
       fill = 100;
    } else {
       if(g.phase==='prep'&&g.waveIndex>=0)fill=(g.waveIndex/g.waves.length)*100;
       else if(g.phase==='spawning'||g.phase==='active')fill=((g.waveIndex+1)/g.waves.length)*100;
    }
    $('#wave-fill').style.width=fill+'%';
    
    const btn=$('#wave-btn');
    if(g.phase==='prep'){
      btn.disabled=false;
      btn.textContent=g.waveIndex<0?'START WAVE':'NEXT WAVE';
      btn.classList.add('ready');
    }else{
      btn.disabled=true;btn.textContent='WAVE IN PROGRESS';
      btn.classList.remove('ready');}
    this.updateTowerBar();
    if(g.selectedTower)this.showSelection(g.selectedTower);},
  updatePrep(t){const el=$('#prep-countdown'),sub=$('#prep-sub');
    if(t>0){el.textContent=String(Math.ceil(t)).padStart(2,'0');
      el.classList.add('show');sub.classList.add('show');}
    else{el.classList.remove('show');sub.classList.remove('show');}},
  hidePrep(){$('#prep-countdown').classList.remove('show');$('#prep-sub').classList.remove('show');},
  showWaveBanner(n,groups){
    const el=$('#wave-banner');
    const counts={};for(const gr of groups)counts[gr.type]=(counts[gr.type]||0)+gr.count;
    const comp=Object.entries(counts).map(([t,c])=>c+'× '+ENEMY_TYPES[t].name).join('   ·   ');
    el.querySelector('.wb-title').textContent='WAVE '+String(n).padStart(2,'0');
    el.querySelector('.wb-comp').textContent=comp;
    el.classList.add('show');clearTimeout(this._bannerTimer);
    this._bannerTimer=setTimeout(()=>el.classList.remove('show'),2200);},
  showSelection(t){
    const p=$('#sel-panel');p.classList.add('show');
    $('#sel-name').textContent=t.def.name;
    $('#sel-lvl').textContent='LV '+t.level+' / '+t.maxLevel;
    const rate=t.type==='laser'?(t.dps.toFixed(0)+'/s'):(t.rate?t.rate.toFixed(1)+'/s':'—');
    $('#sel-dmg').textContent=t.type==='laser'?t.dps.toFixed(0):(t.damage?t.damage.toFixed(0):'—');
    $('#sel-range').textContent=t.range.toFixed(1);
    $('#sel-rate').textContent=rate;
    $('#sel-air').textContent=t.def.air?'AIR + GROUND':'GROUND';
    const c=t.upgradeCost();const up=$('#btn-upgrade');
    if(c===null){up.innerHTML=t.level<4?'LV '+(t.level+1)+' LOCKED · ARMORY T'+(t.level===2?1:3):'MAX LEVEL';up.disabled=true;}
    else{up.innerHTML='UPGRADE <span>'+c+' CR</span>';up.disabled=this.game.credits<c;}
    $('#sell-val').textContent=t.sellValue()+' CR';
    $('#btn-sell').disabled=tutorialStep>0;
    const b=$('#btn-target-mode');
    if(b)b.textContent='TARGET: '+(t.targetMode||'first').toUpperCase();

    // ---- v2.3.2: Next-level preview ----
    const dmArr=[1,1.35,1.8,2.4], rmArr=[1,1.06,1.12,1.2], fmArr=[1,1.06,1.12,1.2];
    const nextIdx=t.level; // next level = t.level+1 → multiplier index = (t.level+1)-1 = t.level
    if(nextIdx<4 && c!==null){
      const nextDm=dmArr[nextIdx], nextRm=rmArr[nextIdx], nextFm=fmArr[nextIdx];
      const nextDmg=t.type==='laser'
        ?(t.def.dps*nextDm*t.metaMult.damage).toFixed(0)
        :((t.def.damage||0)*nextDm*t.metaMult.damage).toFixed(0);
      const nextRange=(t.def.range*nextRm*t.metaMult.range).toFixed(1);
      const nextRate=t.type==='laser'?'':(t.def.rate*nextFm*t.metaMult.rate).toFixed(1)+'/s';
      $('#sel-dmg-next').textContent=nextDmg;
      $('#sel-range-next').textContent=nextRange;
      $('#sel-rate-next').textContent=nextRate;
    } else {
      $('#sel-dmg-next').textContent='';
      $('#sel-range-next').textContent='';
      $('#sel-rate-next').textContent='';
    }
    // Reset any preview state that might have been left from hovering
    document.querySelectorAll('.sel-stat').forEach(el=>el.classList.remove('preview'));
  },
  hideSelection(){$('#sel-panel').classList.remove('show');},
  toast(msg,type='',dur=2400){const box=$('#toasts');
    const el=document.createElement('div');
    el.className='toast '+type;el.textContent=msg;box.appendChild(el);
    setTimeout(()=>el.remove(),dur+300);},
  pause(on){
    if(!this.game||this.game.over)return;
    this.game.paused=on;
    if(on){this.openModal('modal-pause');gameplayStop();Audio.sfx('ui');}
    else{this.closeModal('modal-pause');gameplayStart();}},
  openModal(id){$('#'+id).classList.add('open');},
  closeModal(id){$('#'+id).classList.remove('open');},
  closeAllModals(){$$('.modal').forEach(m=>m.classList.remove('open'));},
    updateEMP(g){
    const b=$('#emp-btn');if(!b||!g)return;
    
    // EMP TUTORIAL XÜSUSİ VƏZİYYƏT (oyun donanda belə aktiv qalsın)
    if(tutorialStep===6){
      b.textContent='EMP PULSE · READY';
      b.disabled=false;
      b.classList.add('ready');
      return;
    }

    if(!Progress.data.empTutorialDone){
      b.textContent='EMP LOCKED';
      b.disabled=true;
      b.classList.remove('ready');
      return;
    }
    
    const cd=Math.ceil(g.empCooldown||0);
    const active=g.phase==='spawning'||g.phase==='active';
    if(cd>0){b.textContent='EMP RECHARGE · '+cd+'s';b.disabled=true;b.classList.remove('ready');}
    else if(!active||g.paused||g.over){b.textContent='EMP PULSE · STANDBY';b.disabled=true;b.classList.remove('ready');}
    else{b.textContent='EMP PULSE · READY';b.disabled=false;b.classList.add('ready');}
  },
  buildAchievements(){
    const grid=$('#ach-grid'),summary=$('#ach-summary');
    if(!grid||!summary)return;
    grid.innerHTML='';
    const unlockedCount=Object.keys(Progress.data.achievements||{}).length;
    const s=Progress.data.stats||{};
    summary.innerHTML='<div><div style="font-size:10px;letter-spacing:.3em;color:var(--gold);font-weight:800">ACHIEVEMENT PROGRESS</div><div class="as-num">'+unlockedCount+' <span style="font-size:18px;color:var(--muted);font-weight:600">/ '+ACHIEVEMENTS.length+'</span></div></div><div class="as-stats"><div class="as-stat"><b>'+formatNum(s.totalKills||0)+'</b><span>TOTAL KILLS</span></div><div class="as-stat"><b>'+formatNum(s.totalWavesCleared||0)+'</b><span>WAVES CLEARED</span></div><div class="as-stat"><b>'+formatNum(s.maxEndlessWave||0)+'</b><span>BEST ENDLESS</span></div><div class="as-stat"><b>'+formatNum(s.bestDailyStreak||0)+'</b><span>DAILY STREAK</span></div></div>';
    for(const a of ACHIEVEMENTS){
      const unlocked=!!Progress.data.achievements[a.id];
      let cur=0,tgt=a.target||1;
      if(a.check){cur=a.check(s)?1:0;tgt=1;}else{cur=s[a.stat]||0;}
      const pct=unlocked?100:Math.min(100,(cur/tgt)*100);
      const card=document.createElement('div');
      card.className='ach-card '+(unlocked?'unlocked':'locked');
      const prog=a.check?'':'<div class="ach-progress"><div class="ach-bar"><i style="width:'+pct+'%"></i></div><div class="ach-progress-txt"><span>'+formatNum(Math.min(cur,tgt))+' / '+formatNum(tgt)+'</span><span>'+Math.floor(pct)+'%</span></div></div>';
      card.innerHTML='<div class="ach-head"><div><div class="ach-name">'+a.name+'</div><div class="ach-desc">'+a.desc+'</div></div><div class="ach-reward">+'+a.reward+' ◆</div></div>'+prog+'<div class="ach-status">'+(unlocked?'★ UNLOCKED':'○ LOCKED')+'</div>';
      grid.appendChild(card);
    }
  },
  refreshDailyGiftButton(){
    const btn=$('#btn-daily-gift');if(!btn)return;
    const available=DailyGift.isAvailable();
    btn.classList.toggle('available',available);
    if(available){btn.textContent='🎁 DAILY GIFT';}
    else{const h=Math.max(1,Math.ceil(DailyGift.timeUntilNext()/3600000));btn.textContent='🎁 GIFT IN '+h+'H';}
  },
  openDailyGift(){
    const content=$('#daily-gift-content');if(!content)return;
    const available=DailyGift.isAvailable();
    const streak=Progress.data.dailyStreak||0;
    const best=Progress.data.stats.bestDailyStreak||0;
    if(available){
      const nextStreak=DailyGift.computeStreak();
      const estLow=20+(nextStreak-1)*5,estHigh=estLow+15;
      const dots=Array.from({length:7},(_,i)=>'<i class="'+(i<nextStreak?'on':'')+'"></i>').join('');
      content.innerHTML='<div class="daily-gift-row"><div class="dg-left"><div class="k">DAY STREAK</div><div class="v">'+nextStreak+'<small> / 7</small></div><div class="gift-streak-mini">'+dots+'</div></div><div class="dg-right"><div class="k">ESTIMATED REWARD</div><div class="v">'+estLow+'–'+estHigh+' ◆</div></div></div><p>Claim once per day to keep your streak. Miss a day and the streak resets.</p><div class="modal-actions"><button class="btn primary" id="btn-claim-gift">CLAIM GIFT</button></div>';
      const claimBtn=$('#btn-claim-gift');
      if(claimBtn)claimBtn.onclick=()=>{
        const result=DailyGift.claim();
        if(result){UI.closeModal('modal-daily-gift');UI.refreshMenuStats();UI.refreshDailyGiftButton();Progress.checkAchievements();}
      };
    }else{
      const ms=DailyGift.timeUntilNext();
      const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000);
      content.innerHTML='<div class="gift-countdown"><div class="k">NEXT GIFT IN</div><div class="t">'+String(h).padStart(2,'0')+' : '+String(m).padStart(2,'0')+'</div></div><p>Current streak: <b style="color:var(--gold)">'+streak+' days</b> · Best: <b style="color:var(--gold)">'+best+' days</b></p><div class="modal-actions"><button class="btn ghost" data-close>CLOSE</button></div>';
      content.querySelector('[data-close]').onclick=()=>UI.closeModal('modal-daily-gift');
    }
    UI.openModal('modal-daily-gift');
  },
  showResult(win,stars,g,goldEarned, expEarned=0){
    if(g.isEndless){
      $('#result-kicker').textContent='SURVIVAL OVER';
      $('#result-title').textContent='WAVE '+(g.waveIndex+1)+' REACHED';
      $('#result-stars').innerHTML='';
      
      const stage = g.stageIndex + 1;
      const best = Progress.data.endlessHighScores[stage];
      
      if (g.waveIndex >= best) {
         $('#result-desc').textContent = 'NEW HIGH SCORE! Your defense network held the line against the endless horde.';
      } else {
         $('#result-desc').textContent = 'Your defense was overwhelmed. Personal best: Wave ' + best + '.';
      }
      
      $('#res-waves').textContent=g.waveIndex+1;
      $('#res-kills').textContent=g.kills;
      $('#res-credits').textContent=Math.floor(g.credits);
      $('#res-gold').textContent='+0';
      $('#res-exp').textContent='+0';
      
      const actions=$('#result-actions');actions.innerHTML='';
      const b=document.createElement('button');
      b.className='btn primary';b.textContent='RETRY ENDLESS';
      b.onclick=()=>{this.closeModal('modal-result');this.startLevel(g.stageIndex,ENDLESS_LEVEL);};
      actions.appendChild(b);
      
      const m=document.createElement('button');
      m.className='btn ghost';m.textContent='THEATERS';
      m.onclick=()=>{this.closeModal('modal-result');this.quitToMaps();};
      actions.appendChild(m);
      
      this.openModal('modal-result');
      this.refreshMenuStats();
      return;
    }
    
    $('#result-kicker').textContent=win?'MISSION COMPLETE':'MISSION FAILED';
    $('#result-title').textContent=win?'SECTOR SECURED':'DEFENSE COLLAPSED';
    $('#result-stars').innerHTML=[1,2,3].map(i=>`<span class="${i<=stars?'on':''}">★</span>`).join('');
    $('#result-desc').textContent=win?'Theater control restored. Forward operating data archived.':'The command base was overrun. Recalibrate and redeploy.';
    $('#res-waves').textContent=g.waveIndex+1;
    $('#res-kills').textContent=g.kills;
    $('#res-credits').textContent=Math.floor(g.credits);
    $('#res-gold').textContent=win?'+'+goldEarned:'+0';
    $('#res-exp').textContent=win?'+'+expEarned:'+0'; // <--- YENİ
    const actions=$('#result-actions');actions.innerHTML='';
    if(win){
      const nextStage=g.level===LEVELS_PER_STAGE?g.stageIndex+2:g.stageIndex+1;
      const nextLevel=g.level===LEVELS_PER_STAGE?1:g.level+1;
      if(nextStage<=4){
        const b=document.createElement('button');
        b.className='btn primary';
        b.textContent=g.level===LEVELS_PER_STAGE?'NEXT THEATER':'NEXT MISSION';
        b.onclick=()=>{this.closeModal('modal-result');this.startLevel(nextStage-1,nextLevel);};
        actions.appendChild(b);
      }else{
        const b=document.createElement('button');
        b.className='btn primary';b.textContent='CAMPAIGN COMPLETE';
        b.onclick=()=>{this.closeModal('modal-result');this.quitToMaps();};
        actions.appendChild(b);}
      const arm=document.createElement('button');
      arm.className='btn gold';arm.textContent='⌁ ARMORY';
      arm.onclick=()=>{this.closeModal('modal-result');this.quitToMaps();
        this.buildUpgrades();this.show('screen-upgrades');Audio.sfx('ui');};
      actions.appendChild(arm);
    }else{
      const b=document.createElement('button');
      b.className='btn primary';b.textContent='RETRY MISSION';
      b.onclick=()=>{this.closeModal('modal-result');this.startLevel(g.stageIndex,g.level);};
      actions.appendChild(b);}
    const m=document.createElement('button');
    m.className='btn ghost';m.textContent='THEATERS';
    m.onclick=()=>{this.closeModal('modal-result');this.quitToMaps();};
    actions.appendChild(m);
    
    if(win&&!Progress.data.tutorialArmoryDone){
      const arm=actions.querySelector('.btn.gold');
      if(arm){
        arm.classList.add('pulsing-glow');
        arm.textContent='⌁ GO TO ARMORY';
      }
      const others=actions.querySelectorAll('.btn:not(.gold)');
      others.forEach(b=>{
        b.style.opacity='0.25';
        b.style.pointerEvents='none';
      });
      const hint=document.createElement('div');
      hint.style='width:100%; text-align:center; font-size:11px; color:var(--gold); margin-top:12px; letter-spacing:0.1em;';
      hint.textContent='TUTORIAL: Visit the Armory to upgrade your towers!';
      actions.appendChild(hint);
    }
    
    this.openModal('modal-result');this.refreshMenuStats();},
  refreshMenuStats(){
    $('#stat-stages').textContent=String(Progress.data.unlockedStage).padStart(2,'0');
    $('#stat-levels').textContent=String(Progress.totalLevels()).padStart(2,'0');
    $('#stat-stars').textContent=String(Progress.totalStars()).padStart(2,'0');
    $('#stat-gold').textContent=Progress.data.gold;
    this.refreshDailyGiftButton();}
};

/* ========== MAP THUMB ========== */
function makeMapThumb(map){
  const c=document.createElement('canvas');c.width=640;c.height=360;
  const ctx=c.getContext('2d');
  const g=ctx.createLinearGradient(0,0,640,360);
  g.addColorStop(0,map.ground);g.addColorStop(1,'#05090d');
  ctx.fillStyle=g;ctx.fillRect(0,0,640,360);
  ctx.strokeStyle='rgba(255,255,255,.04)';ctx.lineWidth=1;
  for(let i=0;i<640;i+=32){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,360);ctx.stroke();}
  for(let i=0;i<360;i+=32){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(640,i);ctx.stroke();}
  const sx=640/48,sy=360/48;
  const tx=x=>(x+24)*sx,ty=z=>(z+24)*sy;
  map.routes.forEach((route,idx)=>{
    const alpha=idx===0?1:.5;
    ctx.strokeStyle=map.accent;
    ctx.globalAlpha=alpha;
    ctx.lineWidth=idx===0?9:6;
    ctx.lineCap='round';ctx.lineJoin='round';
    ctx.shadowColor=map.accent;ctx.shadowBlur=idx===0?16:8;
    ctx.beginPath();
    route.path.forEach((p,i)=>{const x=tx(p[0]),y=ty(p[1]);
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
    ctx.stroke();
    ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(4,10,15,.85)';
    ctx.lineWidth=idx===0?4:3;ctx.stroke();
  });
  ctx.globalAlpha=1;
  const end=map.routes[0].path[map.routes[0].path.length-1];
  ctx.fillStyle=map.accent;ctx.beginPath();ctx.arc(tx(end[0]),ty(end[1]),10,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#05090d';ctx.beginPath();ctx.arc(tx(end[0]),ty(end[1]),4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(0,0,640,360);
  return c.toDataURL('image/jpeg',.78);
}

/* ========== PLATFORM HOOKS ========== */
function gameplayStart(){try{window.CrazyGames?.SDK?.game?.gameplayStart?.();}catch(e){}}
function gameplayStop(){try{window.CrazyGames?.SDK?.game?.gameplayStop?.();}catch(e){}}
function happytime(){try{window.CrazyGames?.SDK?.game?.happytime?.();}catch(e){}}

/* ========== BOOT ========== */
const App={
  renderer:null,world:null,
  init(){
    const canvas=$('#c');
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    this.renderer.setSize(innerWidth,innerHeight);
    this.renderer.shadowMap.enabled=Settings.data.shadows;
    this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure=1.30;
    Audio.setMusic(Settings.data.music);Audio.setSfx(Settings.data.sfx);
    this.world=new AttractWorld(this.renderer);
    this.world.resize(innerWidth,innerHeight);
    UI.init();
    setTimeout(()=>{UI.show('screen-menu');UI.refreshMenuStats();},900);
    setTimeout(()=>Progress.checkAchievements(true),600);
    addEventListener('resize',()=>{
      this.renderer.setSize(innerWidth,innerHeight);
      if(this.world)this.world.resize(innerWidth,innerHeight);
      UI.refreshTutorialPosition();});
    addEventListener('pointerdown',()=>Audio.ensure(),{once:true});
    addEventListener('keydown',()=>Audio.ensure(),{once:true});
    let last=performance.now();
    const loop=(now)=>{requestAnimationFrame(loop);
      const dt=Math.min((now-last)/1000,.05);last=now;
      if(this.world)this.world.update(dt);
      if(this.world)this.world.render();};
    requestAnimationFrame(loop);}
};
App.init();
