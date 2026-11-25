'use strict';
/* IRONLINE // Effects, weather, path utilities, plot generation and map building */
class Particles{
  constructor(scene,max=900){this.max=max;this.pos=new Float32Array(max*3);this.col=new Float32Array(max*3);
    this.base=new Float32Array(max*3);this.vel=new Float32Array(max*3);this.life=new Float32Array(max);
    this.maxLife=new Float32Array(max);this.grav=new Float32Array(max);
    for(let i=0;i<max;i++)this.pos[i*3+1]=-999;
    this.geo=new THREE.BufferGeometry();
    this.geo.setAttribute('position',new THREE.BufferAttribute(this.pos,3).setUsage(THREE.DynamicDrawUsage));
    this.geo.setAttribute('color',new THREE.BufferAttribute(this.col,3).setUsage(THREE.DynamicDrawUsage));
    this.mat=new THREE.PointsMaterial({size:.18,vertexColors:true,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false});
    this.points=new THREE.Points(this.geo,this.mat);this.points.frustumCulled=false;scene.add(this.points);this.cursor=0;}
  spawn(x,y,z,color,count=8,speed=5,gravity=9,life=.6){const c=new THREE.Color(color);
    for(let i=0;i<count;i++){const idx=this.cursor;this.cursor=(this.cursor+1)%this.max;
      this.pos[idx*3]=x;this.pos[idx*3+1]=y;this.pos[idx*3+2]=z;
      const a=Math.random()*Math.PI*2,e=Math.random()*Math.PI-Math.PI/2;
      const s=speed*(.3+Math.random()*.7);
      this.vel[idx*3]=Math.cos(a)*Math.cos(e)*s;this.vel[idx*3+1]=Math.sin(e)*s+rand(.5,2);
      this.vel[idx*3+2]=Math.sin(a)*Math.cos(e)*s;
      this.base[idx*3]=c.r;this.base[idx*3+1]=c.g;this.base[idx*3+2]=c.b;
      this.col[idx*3]=c.r;this.col[idx*3+1]=c.g;this.col[idx*3+2]=c.b;
      this.life[idx]=life*(.5+Math.random()*.6);this.maxLife[idx]=this.life[idx];this.grav[idx]=gravity;}}
  update(dt){for(let i=0;i<this.max;i++){if(this.life[i]<=0)continue;this.life[i]-=dt;
    if(this.life[i]<=0){this.pos[i*3+1]=-999;continue;}
    this.vel[i*3+1]-=this.grav[i]*dt;this.vel[i*3]*=.985;this.vel[i*3+2]*=.985;
    this.pos[i*3]+=this.vel[i*3]*dt;this.pos[i*3+1]+=this.vel[i*3+1]*dt;this.pos[i*3+2]+=this.vel[i*3+2]*dt;
    if(this.pos[i*3+1]<.05){this.pos[i*3+1]=.05;this.vel[i*3+1]*=-.28;}
    const t=clamp(this.life[i]/this.maxLife[i],0,1);
    this.col[i*3]=this.base[i*3]*t;this.col[i*3+1]=this.base[i*3+1]*t;this.col[i*3+2]=this.base[i*3+2]*t;}
    this.geo.attributes.position.needsUpdate=true;this.geo.attributes.color.needsUpdate=true;}}
class Rings{
  constructor(scene){this.items=[];for(let i=0;i<10;i++){
    const mat=new THREE.MeshBasicMaterial({color:0xffaa55,transparent:true,opacity:0,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    const mesh=new THREE.Mesh(new THREE.RingGeometry(.78,1,48),mat);
    mesh.rotation.x=-Math.PI/2;mesh.visible=false;mesh.position.y=.15;scene.add(mesh);
    this.items.push({mesh,mat,life:0,maxLife:.5,radius:3,color:0xffaa55});}}
  fire(x,z,color,radius){const it=this.items.find(i=>i.life<=0)||this.items[0];
    it.mesh.position.set(x,.15,z);it.mesh.visible=true;it.life=it.maxLife=.48;it.radius=radius;
    it.color=new THREE.Color(color);it.mat.color.copy(it.color);}
  update(dt){for(const it of this.items){if(it.life<=0)continue;it.life-=dt;
    const t=1-it.life/it.maxLife;const s=lerp(.4,it.radius,t);it.mesh.scale.set(s,s,s);
    it.mat.opacity=(1-t)*.55;if(it.life<=0)it.mesh.visible=false;}}}
class Bolts{
  constructor(scene){this.items=[];for(let i=0;i<6;i++){
    const geo=new THREE.BufferGeometry();const pos=new Float32Array(24*3);
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));
    const mat=new THREE.LineBasicMaterial({color:0x9affff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    const line=new THREE.Line(geo,mat);line.visible=false;line.frustumCulled=false;scene.add(line);
    this.items.push({line,geo,mat,life:0});}}
  fire(points){const it=this.items.find(i=>i.life<=0)||this.items[0];
    const arr=it.geo.attributes.position.array;let idx=0;
    for(let i=0;i<points.length-1&&idx<24;i++){const a=points[i],b=points[i+1];
      const steps=Math.min(8,24-idx);
      for(let s=0;s<steps&&idx<24;s++){const t=s/(steps-1||1);
        arr[idx*3]=lerp(a.x,b.x,t)+rand(-.18,.18);arr[idx*3+1]=lerp(a.y,b.y,t)+rand(-.18,.18);
        arr[idx*3+2]=lerp(a.z,b.z,t)+rand(-.18,.18);idx++;}}
    for(let i=idx;i<24;i++){arr[i*3]=points[points.length-1].x;arr[i*3+1]=-999;arr[i*3+2]=points[points.length-1].z;}
    it.geo.attributes.position.needsUpdate=true;it.geo.setDrawRange(0,idx);
    it.line.visible=true;it.mat.opacity=1;it.life=.16;}
  update(dt){for(const it of this.items){if(it.life<=0)continue;it.life-=dt;
    it.mat.opacity=Math.max(0,it.life/.16);if(it.life<=0)it.line.visible=false;}}}
class Flashes{
  constructor(scene){this.items=[];for(let i=0;i<24;i++){
    const mat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    const mesh=new THREE.Mesh(GEO.sphereLow,mat);mesh.visible=false;scene.add(mesh);
    this.items.push({mesh,mat,life:0,max:.09,size:.5});}}
  fire(x,y,z,color,size=.6){const it=this.items.find(i=>i.life<=0)||this.items[0];
    it.mesh.position.set(x,y,z);it.mat.color.set(color);it.life=it.max=.09;it.size=size;it.mesh.visible=true;}
  update(dt){for(const it of this.items){if(it.life<=0)continue;it.life-=dt;
    const t=Math.max(0,it.life/it.max);it.mesh.scale.setScalar(it.size*(1.6-.6*t));it.mat.opacity=t*.9;
    if(it.life<=0)it.mesh.visible=false;}}}
class Weather{
  constructor(scene,type,accent){this.type=type;
    this.count=type==='rain'?900:type==='snow'?600:type==='sand'?500:350;
    const pos=new Float32Array(this.count*3);this.speeds=new Float32Array(this.count);this.drift=new Float32Array(this.count);
    for(let i=0;i<this.count;i++){pos[i*3]=rand(-32,32);pos[i*3+1]=rand(0,24);pos[i*3+2]=rand(-32,32);
      this.speeds[i]=type==='rain'?rand(14,24):type==='snow'?rand(.7,2):type==='sand'?rand(2,5):rand(.6,1.8);
      this.drift[i]=type==='sand'?rand(4,9):rand(-1,1);}
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3).setUsage(THREE.DynamicDrawUsage));
    const color=type==='rain'?0x8ad8ff:type==='snow'?0xdff4ff:type==='sand'?0xd8a05a:0xc77dff;
    const size=type==='rain'?.07:type==='snow'?.12:type==='sand'?.09:.1;
    this.mat=new THREE.PointsMaterial({color,size,transparent:true,opacity:type==='rain'?.45:.6,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    this.points=new THREE.Points(geo,this.mat);this.points.frustumCulled=false;scene.add(this.points);
    this.pos=pos;this.geo=geo;}
  update(dt){const p=this.pos;for(let i=0;i<this.count;i++){
    if(this.type==='embers'){p[i*3+1]+=this.speeds[i]*dt;p[i*3]+=Math.sin(performance.now()*.001+i)*dt*.4;
      if(p[i*3+1]>24){p[i*3+1]=0;p[i*3]=rand(-32,32);p[i*3+2]=rand(-32,32);}}
    else if(this.type==='sand'){p[i*3]+=this.drift[i]*dt;p[i*3+1]+=Math.sin(performance.now()*.002+i)*dt*.3;
      if(p[i*3]>32){p[i*3]=-32;p[i*3+2]=rand(-32,32);}}
    else{p[i*3+1]-=this.speeds[i]*dt;p[i*3]+=this.drift[i]*dt;
      if(p[i*3+1]<0){p[i*3+1]=24;p[i*3]=rand(-32,32);p[i*3+2]=rand(-32,32);}}}
    this.geo.attributes.position.needsUpdate=true;}}

/* ========== MAP BUILDER ========== */
function nearPath(x,z,path,margin=3.5){
  for(let i=0;i<path.length-1;i++){const a=path[i],b=path[i+1];
    const dx=b[0]-a[0],dz=b[1]-a[1];const len2=dx*dx+dz*dz;
    let t=((x-a[0])*dx+(z-a[1])*dz)/len2;t=clamp(t,0,1);
    if(dist2(x,z,a[0]+dx*t,a[1]+dz*t)<margin)return true;}return false;}
function nearAnyPath(x,z,paths,margin=3.5){
  for(const path of paths)if(nearPath(x,z,path,margin))return true;
  return false;}
function makeGroundTexture(config){
  const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
  ctx.fillStyle=config.ground;ctx.fillRect(0,0,512,512);
  for(let i=0;i<3000;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*.025})`;
    ctx.fillRect(Math.random()*512,Math.random()*512,1.5,1.5);}
  ctx.strokeStyle='rgba(255,255,255,.045)';ctx.lineWidth=1;
  for(let i=0;i<=512;i+=64){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,512);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(512,i);ctx.stroke();}
  const tex=new THREE.CanvasTexture(c);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.repeat.set(10,10);tex.colorSpace=THREE.SRGBColorSpace;return tex;}

function distanceToPath(x,z,path){
  let nearest=Infinity;
  for(let i=0;i<path.length-1;i++){
    const a=path[i],b=path[i+1],dx=b[0]-a[0],dz=b[1]-a[1];
    const len2=dx*dx+dz*dz;if(len2<1e-6)continue;
    const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/len2,0,1);
    nearest=Math.min(nearest,dist2(x,z,a[0]+dx*t,a[1]+dz*t));
  }
  return nearest;
}
function generatePlots(paths,desiredCount=16){
  if(!paths.length)return [];
  const base=paths[0][paths[0].length-1];
  const entrances=paths.map(path=>path[Math.min(1,path.length-1)]);
  const candidates=[];
  // A 2.25-unit tactical lattice gives each approach several clear firing positions.
  // Pads stay outside the road shoulder, away from spawn gates and the command base.
  for(let ix=-8;ix<=8;ix++)for(let iz=-8;iz<=8;iz++){
    const x=ix*2.25,z=iz*2.25;
    if(Math.abs(x)>18||Math.abs(z)>18)continue;
    const routeDistances=paths.map(path=>distanceToPath(x,z,path));
    const nearest=Math.min(...routeDistances);
    if(nearest<3.9||nearest>7.5)continue;
    if(dist2(x,z,base[0],base[1])<7.3)continue;
    if(entrances.some(p=>dist2(x,z,p[0],p[1])<5.6))continue;
    const route=routeDistances.indexOf(nearest);
    candidates.push({x,z,nearest,route});
  }
  const selected=[];
  const routeUse=Array(paths.length).fill(0);
  while(candidates.length&&selected.length<desiredCount){
    let bestIndex=-1,bestScore=-Infinity;
    for(let i=0;i<candidates.length;i++){
      const p=candidates[i];
      const spread=selected.length?Math.min(...selected.map(q=>dist2(p.x,p.z,q.x,q.z))):9;
      if(spread<4.3)continue;
      const score=spread-Math.abs(p.nearest-5.5)*.2-routeUse[p.route]*1.15;
      if(score>bestScore){bestScore=score;bestIndex=i;}
    }
    if(bestIndex<0)break;
    const p=candidates.splice(bestIndex,1)[0];selected.push({x:p.x,z:p.z});routeUse[p.route]++;
  }
  return selected;
}

function drawRoad(scene, path, config){
  const v3Points=path.map(p=>new THREE.Vector3(p[0],0,p[1]));
  const firstDir=v3Points[0].clone().sub(v3Points[1]).normalize();
  const lastDir=v3Points[v3Points.length-1].clone().sub(v3Points[v3Points.length-2]).normalize();
  const startPoint=v3Points[0].clone().add(firstDir.multiplyScalar(5));
  const endPoint=v3Points[v3Points.length-1].clone().add(lastDir.multiplyScalar(5));
  
  const curvePoints=[startPoint,...v3Points,endPoint];
  const curve=new THREE.CatmullRomCurve3(curvePoints,false,'catmullrom',0.05);
  
  const numSamples=Math.max(40,path.length*20);
  const smoothPts=curve.getSpacedPoints(numSamples);
  
  const roadWidth=3.6;
  const halfW=roadWidth/2;
  
  const buildShape=(offset)=>{
    const leftPts=[];
    const rightPts=[];
    for(let i=0;i<smoothPts.length;i++){
      const p=smoothPts[i];
      let dx,dz;
      if(i===0){dx=smoothPts[1].x-p.x;dz=smoothPts[1].z-p.z;}
      else if(i===smoothPts.length-1){dx=p.x-smoothPts[i-1].x;dz=p.z-smoothPts[i-1].z;}
      else{dx=smoothPts[i+1].x-smoothPts[i-1].x;dz=smoothPts[i+1].z-smoothPts[i-1].z;}
      const len=Math.hypot(dx,dz);
      if(len<0.0001)continue;
      const nx=-dz/len;
      const nz=dx/len;
      
      leftPts.push(new THREE.Vector2(p.x+nx*offset,-(p.z+nz*offset)));
      rightPts.push(new THREE.Vector2(p.x-nx*offset,-(p.z-nz*offset)));
    }
    
    const shape=new THREE.Shape();
    if(leftPts.length===0)return shape;
    shape.moveTo(leftPts[0].x,leftPts[0].y);
    for(let i=1;i<leftPts.length;i++)shape.lineTo(leftPts[i].x,leftPts[i].y);
    for(let i=rightPts.length-1;i>=0;i--)shape.lineTo(rightPts[i].x,rightPts[i].y);
    shape.closePath();
    return shape;
  };
  
  const glowShape=buildShape(halfW+0.5);
  const glowGeo=new THREE.ShapeGeometry(glowShape);
  glowGeo.rotateX(-Math.PI/2);
  const glowMesh=new THREE.Mesh(glowGeo,new THREE.MeshBasicMaterial({
    color:config.accent,transparent:true,opacity:0.12,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false
  }));
  glowMesh.position.y=0.04;
  scene.add(glowMesh);
  
  const edgeShape=buildShape(halfW+0.15);
  const edgeGeo=new THREE.ShapeGeometry(edgeShape);
  edgeGeo.rotateX(-Math.PI/2);
  const edgeMesh=new THREE.Mesh(edgeGeo,new THREE.MeshBasicMaterial({
    color:config.accent,toneMapped:false
  }));
  edgeMesh.position.y=0.05;
  scene.add(edgeMesh);
  
  const roadShape=buildShape(halfW);
  const roadGeo=new THREE.ShapeGeometry(roadShape);
  roadGeo.rotateX(-Math.PI/2);
  const roadMat=new THREE.MeshStandardMaterial({
    color:0x1a222a,roughness:0.92,metalness:0.1
  });
  const roadMesh=new THREE.Mesh(roadGeo,roadMat);
  roadMesh.position.y=0.06;
  roadMesh.receiveShadow=true;
  scene.add(roadMesh);
  
  const dashMat=new THREE.MeshBasicMaterial({
    color:config.accent,toneMapped:false,transparent:true,opacity:0.55
  });
  const curveLength=curve.getLength();
  const dashSpacing=3.5;
  const dashCount=Math.floor(curveLength/dashSpacing);
  
  for(let i=0;i<dashCount;i++){
    if(i%2!==0)continue;
    const t=(i+0.5)/dashCount;
    const pt=curve.getPointAt(t);
    const tangent=curve.getTangentAt(t);
    
    const dash=new THREE.Mesh(GEO.box,dashMat);
    dash.position.set(pt.x,0.075,pt.z);
    dash.scale.set(0.12,0.02,0.6);
    dash.rotation.y=Math.atan2(tangent.x,tangent.z);
    scene.add(dash);
  }
}


function buildMap(scene, config, activeRoutes){
  const uniqueTextures=[];
  const paths=activeRoutes.map(r=>r.path);
  const plotsData=generatePlots(paths,PLOT_COUNT[config.id]||16);

  const tex=makeGroundTexture(config);tex.repeat.set(15.6,15.6);uniqueTextures.push(tex);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),
    new THREE.MeshStandardMaterial({map:tex,color:0xffffff,roughness:.94,metalness:.05}));
  ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);

  for(const route of activeRoutes){
    drawRoad(scene, route.path, config);
  }


  const basePos=activeRoutes[0].path[activeRoutes[0].path.length-1];
  const base=ModelFactory.baseStation(new THREE.Color(config.accent));
  base.position.set(basePos[0],0,basePos[1]);scene.add(base);

  const plots=[];
  for(const p of plotsData){
    const pad=new THREE.Mesh(GEO.cyl6,
      new THREE.MeshStandardMaterial({color:config.id==='harbor'?0x243642:0x1c2832,roughness:.7,metalness:.5}));
    pad.position.set(p.x,.11,p.z);pad.scale.set(2.3,.22,2.3);pad.receiveShadow=true;scene.add(pad);
    const padTop=new THREE.Mesh(GEO.cyl6,
      new THREE.MeshStandardMaterial({color:config.id==='harbor'?0x304858:0x243444,roughness:.6,metalness:.6}));
    padTop.position.set(p.x,.23,p.z);padTop.scale.set(2.05,.04,2.05);scene.add(padTop);
    const ring=new THREE.Mesh(GEO.torus,
      new THREE.MeshBasicMaterial({color:config.accent,toneMapped:false,transparent:true,opacity:.45}));
    ring.position.set(p.x,.26,p.z);ring.scale.set(1.95,1.95,1.95);ring.rotation.x=Math.PI/2;scene.add(ring);
    const hover=new THREE.Mesh(new THREE.RingGeometry(.86,1.0,32),
      new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false,transparent:true,opacity:.45,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
    hover.position.set(p.x,.27,p.z);hover.rotation.x=-Math.PI/2;hover.visible=false;scene.add(hover);
    const plot={x:p.x,z:p.z,mesh:pad,ring,hover,tower:null};
    pad.userData.plot=plot;plots.push(plot);
  }

  const rng=mulberry32(config.id.length*977+11);
  const PAD_SCENERY_CLEARANCE=5.6;
  const scatter=(count,fn,minDist=5.0,plotClearance=PAD_SCENERY_CLEARANCE)=>{
    let placed=0,guard=0;
    while(placed<count&&guard++<count*60){
      const x=rand(-21,21),z=rand(-21,21);
      if(nearAnyPath(x,z,paths,4.5))continue;
      if(plots.some(p=>dist2(x,z,p.x,p.z)<plotClearance))continue;
      if(dist2(x,z,basePos[0],basePos[1])<7.5)continue;
      let nearGate=false;
      for(const r of activeRoutes)if(dist2(x,z,r.path[0][0],r.path[0][1])<5.5){nearGate=true;break;}
      if(nearGate)continue;
      if(scene.children.some(c=>c.userData.decoPos&&dist2(x,z,c.userData.decoPos[0],c.userData.decoPos[1])<minDist))continue;
      const g=fn(rng);g.position.set(x,0,z);g.rotation.y=rng()*Math.PI*2;
      g.userData.decoPos=[x,z];
      g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
      scene.add(g);placed++;
    }
  };
  const placeFixedDecoration=(group,preferredX,preferredZ,clearance=6.2)=>{
    const safe=(x,z)=>{
      if(Math.abs(x)>26||Math.abs(z)>26)return false;
      if(nearAnyPath(x,z,paths,5.0))return false;
      if(plots.some(p=>dist2(x,z,p.x,p.z)<clearance))return false;
      if(dist2(x,z,basePos[0],basePos[1])<8)return false;
      for(const route of activeRoutes){
        if(dist2(x,z,route.path[0][0],route.path[0][1])<5.5)return false;
      }
      if(scene.children.some(c=>c.userData.decoPos&&
        dist2(x,z,c.userData.decoPos[0],c.userData.decoPos[1])<clearance))return false;
      return true;
    };
    let chosen=null;
    if(safe(preferredX,preferredZ))chosen={x:preferredX,z:preferredZ};
    if(!chosen){
      const sx=Math.sign(preferredX)||1,sz=Math.sign(preferredZ)||1;
      for(let step=2;step<=12&&!chosen;step+=2){
        const x=preferredX+sx*step,z=preferredZ+sz*step;
        if(safe(x,z))chosen={x,z};
      }
    }
    if(!chosen){
      let bestScore=Infinity;
      for(let x=-26;x<=26;x+=2)for(let z=-26;z<=26;z+=2){
        if(!safe(x,z))continue;
        const score=dist2(x,z,preferredX,preferredZ);
        if(score<bestScore){bestScore=score;chosen={x,z};}
      }
    }
    if(!chosen){group.visible=false;return false;}
    group.position.set(chosen.x,0,chosen.z);
    group.userData.decoPos=[chosen.x,chosen.z];
    group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
    scene.add(group);
    return true;
  };

  if(config.deco==='harbor'){
    scatter(10,r=>{const g=new THREE.Group();
      const colors=[0x2a5a7a,0x7a3a2a,0x2a6a4a,0x6a5a2a,0x4a2a6a];
      const c1=pick(colors),c2=pick(colors);const h=rand(1,2);
      for(let i=0;i<h;i++){const c=i===0?c1:c2;
        mm(g,GEO.box,M(c),[0,.62+i*1.22,0],[2.2,1.1,1.1]);
        for(let k=0;k<3;k++)mm(g,GEO.box,M(c,{roughness:.7}),[-.7+k*.7,.62+i*1.22,.56],[.06,.9,1.1]);
        mm(g,GEO.box,M(0x0a0a0a),[0,1.18+i*1.22,0],[2.24,.04,1.14]);
        mm(g,GEO.box,M(0x0a0a0a),[0,.06+i*1.22,0],[2.24,.04,1.14]);
        mm(g,GEO.box,M(0x000000),[0,.62+i*1.22,.56],[.04,.9,.02]);
        mm(g,GEO.box,COL.yellow,[0,.9+i*1.22,.56],[1.4,.06,.02]);}return g;});
    scatter(4,r=>{const g=new THREE.Group();
      mm(g,GEO.box,COL.metalDark,[0,2,0],[.28,4,.28]);
      mm(g,GEO.box,COL.metalDark,[0,.15,0],[.5,.3,.5]);
      mm(g,GEO.box,COL.metalDark,[1.2,4,0],[2.8,.25,.25]);
      mm(g,GEO.box,COL.metalDark,[-1.2,4,0],[2.8,.25,.25]);
      mm(g,GEO.cyl,COL.metal,[0,4,0],[.15,.2,.15]);
      mm(g,GEO.box,COL.yellow,[2.6,3.85,0],[.3,.15,.3]);
      mm(g,GEO.box,COL.yellow,[-2.6,3.85,0],[.3,.15,.3]);
      mm(g,GEO.sphere,COL.orange,[2.6,3.7,0],[.15,.15,.15]);
      mm(g,GEO.sphere,COL.orange,[-2.6,3.7,0],[.15,.15,.15]);return g;},6.5);
    const crane=new THREE.Group();
    mm(crane,GEO.box,COL.metalDark,[0,3,0],[.6,6,.6]);
    mm(crane,GEO.box,COL.metalDark,[0,.3,0],[2.4,.6,2.4]);
    mm(crane,GEO.box,COL.metalDark,[2.2,5.8,0],[4.4,.4,.5]);
    mm(crane,GEO.box,COL.metalDark,[-1.8,5.8,0],[1.6,.4,.5]);
    mm(crane,GEO.box,COL.metal,[3.5,4.8,0],[.1,2,.1]);
    mm(crane,GEO.box,COL.hazard,[3.5,3.8,0],[.4,.1,.4]);
    mm(crane,GEO.sphere,COL.red,[0,6.2,0],[.15,.15,.15]);
    placeFixedDecoration(crane,-18,-18,7.0);
  }else if(config.deco==='desert'){
    scatter(13,r=>{const g=new THREE.Group();const s=rand(.7,2.4);
      mm(g,GEO.ico1,M(0x5a4630),[0,s*.3,0],[s,s*.7,s]);
      mm(g,GEO.ico,M(0x6a5638),[s*.4,s*.15,s*.2],[s*.5,s*.4,s*.5]);
      mm(g,GEO.ico,M(0x4a3620),[s*.15,s*.5,-s*.2],[s*.4,s*.3,s*.4]);return g;});
    scatter(5,r=>{const g=new THREE.Group();
      for(const s of [-1,1])mm(g,GEO.box,COL.metalDark,[s*.7,1.6,0],[.18,3.2,.18]);
      for(const s of [-1,1])mm(g,GEO.box,COL.metalDark,[0,1.6,s*.7],[.18,3.2,.18]);
      for(const y of [1,2,3])mm(g,GEO.box,COL.metal,[0,y,0],[1.8,.08,.08],[0,y*.4,0]);
      mm(g,GEO.box,COL.metalDark,[0,3.2,0],[1.6,.2,.2]);
      mm(g,GEO.cyl,M(0x3a2a1a),[1.5,.4,0],[.8,.8,.8],[0,0,Math.PI/2]);
      mm(g,GEO.cyl,M(0x2a1a0a),[1.9,.4,0],[.8,.1,.8],[0,0,Math.PI/2]);
      mm(g,GEO.cone,COL.orange,[0,3.7,0],[.4,.6,.4]);
      mm(g,GEO.cone,COL.yellow,[0,3.9,0],[.25,.4,.25]);return g;},7);
    const well=new THREE.Group();
    mm(well,GEO.cyl,M(0x2a2018),[0,.5,0],[3,1,3]);
    mm(well,GEO.cyl,COL.metalDark,[0,1,0],[2.6,.5,2.6]);
    mm(well,GEO.box,COL.metalDark,[0,2,0],[.3,2,.3]);
    mm(well,GEO.cone,COL.orange,[0,3.2,0],[1.2,1.5,1.2]);
    mm(well,GEO.cone,COL.yellow,[0,3.5,0],[.7,1,.7]);
    mm(well,GEO.sphere,COL.orange,[0,3.8,0],[.4,.4,.4]);
    placeFixedDecoration(well,-21,21,7.0);
  }else if(config.deco==='arctic'){
    scatter(13,r=>{const g=new THREE.Group();const s=rand(.7,2.4);
      mm(g,GEO.ico,M(0x8ab8cc),[0,s*.3,0],[s,s*.8,s]);
      mm(g,GEO.ico,M(0xaac8d8),[s*.35,s*.4,s*.15],[s*.4,s*.5,s*.4]);return g;});
    scatter(5,r=>{const g=new THREE.Group();
      mm(g,GEO.box,COL.metalDark,[0,1,0],[2.4,1.6,2]);
      mm(g,GEO.box,COL.metal,[0,1.85,0],[2.5,.1,2.1]);
      mm(g,GEO.box,M(0x2a4a5a),[0,1.1,.99],[1.6,.3,.02]);
      mm(g,GEO.box,M(0x2a4a5a),[.99,1.1,.6],[.02,.3,.3]);
      mm(g,GEO.cyl,COL.metal,[0,2.2,0],[.1,1.2,.1]);
      mm(g,GEO.sphere,COL.cyan,[0,2.85,0],[.12,.12,.12]);
      mm(g,GEO.box,COL.metal,[0,2.3,0],[.6,.05,.05]);
      for(let i=0;i<3;i++)mm(g,GEO.box,COL.glass,[-.7+i*.7,1.4,.99],[.4,.3,.02]);return g;},7);
    const spire=new THREE.Group();
    mm(spire,GEO.cone,M(0xaad8e8),[0,3,0],[2,6,2]);
    mm(spire,GEO.cone,M(0xcce8f0),[0,4,0],[1.4,4,1.4]);
    mm(spire,GEO.cone,M(0xffffff),[0,5,0],[.8,2,.8]);
    mm(spire,GEO.ico,M(0x8ab8cc),[1.5,1,0],[1.5,1.5,1.5]);
    placeFixedDecoration(spire,-20,20,6.8);
  }else{
    scatter(13,r=>{const g=new THREE.Group();const h=rand(2,5);
      mm(g,GEO.box,COL.robot,[0,h/2,0],[.7,h,.7]);
      for(let i=0;i<3;i++)mm(g,GEO.box,COL.purple,[0,.5+i*1.1,.36],[.5,.05,.02]);
      mm(g,GEO.box,COL.cyan,[0,h/2,-.36],[.1,h*.8,.02]);return g;});
    scatter(5,r=>{const g=new THREE.Group();
      mm(g,GEO.octa,COL.purple,[0,1.2,0],[.7,1.8,.7]);
      mm(g,GEO.octa,COL.cyan,[0,1.2,0],[.3,.8,.3]);
      mm(g,GEO.cyl6,COL.metalDark,[0,.2,0],[1.2,.4,1.2]);
      mm(g,GEO.torus,COL.cyan,[0,.4,0],[1.3,1.3,1.3],[Math.PI/2,0,0]);return g;},7);
    const holo=new THREE.Group();
    mm(holo,GEO.cyl6,COL.metalDark,[0,.5,0],[2,1,2]);
    mm(holo,GEO.cyl,COL.purple,[0,3,0],[.6,6,.6]);
    mm(holo,GEO.torus,COL.cyan,[0,2,0],[1.5,1.5,1.5],[Math.PI/2,0,0]);
    mm(holo,GEO.torus,COL.cyan,[0,4,0],[1.5,1.5,1.5],[Math.PI/2,0,0]);
    mm(holo,GEO.octa,COL.purple,[0,6.5,0],[1,2,1]);
    placeFixedDecoration(holo,-18,18,6.5);
  }

  return {plots,base,uniqueTextures,paths};
}

/* ========== ATTRACT WORLD ========== */
class AttractWorld{
  constructor(renderer){this.renderer=renderer;this.scene=new THREE.Scene();
    this.scene.fog=new THREE.FogExp2(0x03080d,.028);
    this.camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);
    this.camera.position.set(0,6.5,15);this.camera.lookAt(0,1.4,0);
    this.composer=makeComposer(renderer,this.scene,this.camera);
    this.t=0;this.build();}
  build(){const s=this.scene;
    s.add(new THREE.HemisphereLight(0x3a7a9a,0x081018,.8));
    const dir=new THREE.DirectionalLight(0xbfe9ff,2.4);dir.position.set(8,14,8);s.add(dir);
    const p1=new THREE.PointLight(0x5ee7ff,30,30);p1.position.set(-6,3,4);s.add(p1);
    const p2=new THREE.PointLight(0xff3b6b,24,30);p2.position.set(6,2,-4);s.add(p2);
    const floor=new THREE.Mesh(new THREE.CylinderGeometry(7.5,8,.3,48),
      new THREE.MeshStandardMaterial({color:0x0b141c,roughness:.7,metalness:.6}));
    floor.position.y=-.15;floor.receiveShadow=true;s.add(floor);
    for(let i=0;i<4;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(3+i*1.4,.018,6,64),
      new THREE.MeshBasicMaterial({color:i%2?0x5ee7ff:0x2d7dff,toneMapped:false,transparent:true,opacity:.5}));
      ring.rotation.x=Math.PI/2;ring.position.y=.02;s.add(ring);}
    this.platform=new THREE.Group();s.add(this.platform);
    const tank=ModelFactory.tank();tank.position.set(-2.2,0,0);tank.scale.setScalar(1.25);this.platform.add(tank);
    const heli=ModelFactory.helicopter();heli.position.set(2.2,1.2,-.5);heli.scale.setScalar(1.15);this.platform.add(heli);
    const robot=ModelFactory.robot();robot.position.set(.2,0,2.2);robot.scale.setScalar(1.2);this.platform.add(robot);
    [tank,heli,robot].forEach(g=>g.traverse(o=>{if(o.isMesh)o.castShadow=true;}));
    this.heli=heli;}
  update(dt){this.t+=dt;this.platform.rotation.y+=dt*.12;
    this.heli.position.y=1.2+Math.sin(this.t*1.8)*.18;
    this.heli.rotation.y=Math.sin(this.t*.4)*.3;
    if(this.heli.userData.rotor)this.heli.userData.rotor.rotation.y+=dt*18;
    if(this.heli.userData.tailRotor)this.heli.userData.tailRotor.rotation.z+=dt*22;
    this.camera.position.x=Math.sin(this.t*.13)*1.2;this.camera.lookAt(0,1.4,0);}
  resize(w,h){this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.composer.setSize(w,h);}
  render(){this.composer.render();}
  dispose(){disposeScene(this.scene);this.composer.dispose();}}

function makeComposer(renderer,scene,camera){
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  if(Settings.data.bloom){const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.55,.42,.82);
    composer.addPass(bloom);}
  composer.addPass(new OutputPass());return composer;}
function disposeScene(scene){
  const seen=new Set();
  scene.traverse(o=>{if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];
    for(const m of mats){if(seen.has(m))continue;seen.add(m);
      if(m.map&&m.map.dispose)m.map.dispose();if(m.dispose)m.dispose();}}});}

/* ========== ENEMY ========== */
