import * as T from '/animations/furnaces/v3/three.module.min.js';
import {workshop,ground,furnace,stand,waterTank,car,payload,clamp,ease} from './machinery.js';
const frameY=1.468, travelY=1.82, belowY=1.29, endZ=2.03, ovenZ=-1.02;
const mode={
 '01':{w:6.20,kind:'bars',fuel:'electric',short:true},'02':{w:3.40,kind:'basket',fuel:'electric'},
 '03':{w:2.68,kind:'coils',fuel:'electric'},'04':{w:3.30,kind:'tray',fuel:'gas'},
 '05':{w:2.78,kind:'tray',fuel:'gas'},'06':{w:3.08,kind:'coils',fuel:'electric'},
 '07':{w:5.76,kind:'bars',fuel:'electric',short:true},'08':{w:4.40,kind:'tray',fuel:'gas'}
};
// A key describes physical positions, in the same coordinate system throughout the film.
// An attached batch shares all three fork axes; depositing it leaves it at the last support.
function path(initial) {
 const keys=[{t:0,...initial}];
 function add(t,changes={}){
  const s={...keys[keys.length-1],...changes,t};
  if(s.held){s.lx=s.x;s.lz=s.z;s.ly=s.y;}
  keys.push(s);
 }
 function at(time){
  const i=keys.findIndex(s=>s.t>=time);if(i<=0)return i===0?keys[0]:keys[keys.length-1];
  const a=keys[i-1],b=keys[i],q=ease((time-a.t)/(b.t-a.t)),s={};
  for(const k of Object.keys(initial))s[k]=typeof a[k]==='boolean'?(q<1?a[k]:b[k]):a[k]+(b[k]-a[k])*q;
  return s;
 }
 return {add,at};
}
function quench(id,a,b){
 const initial={x:a,z:endZ,y:travelY,lx:a,lz:endZ,ly:travelY,held:true,door:1,box:0,hot:.03,arrange:1};
 if(id==='02'||id==='04')initial.arrange=.05;
 const track=path(initial),k=track.add;
 if(id==='01'){
  k(.38,{z:ovenZ});k(.58,{y:frameY});k(.68,{held:false,y:belowY});k(.91,{z:endZ});k(1,{door:.20,hot:.80});
  k(1.26,{door:1,hot:.95});k(1.65,{z:ovenZ});k(1.81,{y:frameY,held:true});k(2,{y:travelY});
  k(2.63,{z:endZ});k(2.98,{x:a+(b-a)*.48,door:.17});k(3.38,{x:b});k(3.91,{y:.36,hot:.09});k(4,{y:.33,hot:.04});
 }else if(id==='04'){
  k(.58,{arrange:1});k(.92,{y:frameY});k(1,{held:false});
  // Leave the trial load on the preparation stand while the empty mechanism is exercised.
  k(1.16,{y:belowY});k(1.32,{x:b*.18+a*.82});k(1.48,{door:.04});k(1.75,{door:1});k(1.90,{x:a});k(2,{y:frameY,held:true});
  k(2.10,{y:travelY});k(2.36,{z:ovenZ});k(2.48,{y:frameY});k(2.57,{held:false,y:belowY});k(2.76,{z:endZ});k(2.98,{door:.05,hot:.93});
  k(3.12,{door:1});k(3.29,{z:ovenZ});k(3.38,{y:frameY,held:true});k(3.46,{y:travelY});
  k(3.64,{z:endZ});k(3.84,{x:b,door:.16});k(4,{y:.33,hot:.09});
 }else{
  if(id==='02'){
   k(.76,{arrange:1});k(1,{y:travelY});k(1.26,{z:ovenZ});k(1.39,{y:frameY});k(1.48,{held:false,y:belowY});k(1.71,{z:endZ});k(1.91,{door:.05,hot:.85});k(2,{hot:1});
  }else{
   k(.55,{z:ovenZ});k(.73,{y:frameY});k(.85,{held:false,y:belowY});k(1,{z:endZ});
   k(1.32,{door:.025,hot:.43});k(1.84,{hot:1});k(2,{door:.35});
  }
  k(2.18,{door:1});k(2.39,{z:ovenZ});k(2.50,{y:frameY,held:true});k(2.59,{y:travelY});
  if(id==='07'){k(2.72,{z:endZ});k(2.88,{x:b,door:.10});k(3,{y:.31,hot:.23});k(3.14,{hot:.06});k(3.46,{y:travelY});k(3.85,{x:a+.47*(b-a)});k(4,{hot:.025});}
  else{k(2.96,{z:endZ});k(3.42,{x:b,door:.13});k(3.93,{y:.32,hot:.08});k(4,{hot:.035});}
 }
 return track;
}
function chamberCycle(id,left,furn,right){
 const cooling=id==='05',coilPlan=id==='06';
 const t=path({x:left,z:endZ,y:belowY,lx:left,lz:ovenZ,ly:frameY,held:false,door:cooling?.05:1,box:cooling?1:0,hot:cooling?.82:.05,arrange:cooling?1:.01});
 const k=t.add;
 if(cooling){
  k(.38,{hot:1,door:.06});k(.65,{door:1});k(.86,{z:ovenZ});k(.94,{y:frameY,held:true});k(1,{y:travelY});
  k(1.25,{z:endZ});k(1.65,{x:right,door:.045});k(1.83,{z:ovenZ});k(1.95,{y:frameY});k(2,{held:false,y:belowY});
  k(2.25,{z:endZ});k(2.47,{box:.025,hot:.69});k(2.98,{hot:.13});
  k(3.25,{box:1});k(3.50,{z:ovenZ});k(3.60,{held:true,y:frameY});k(3.70,{y:travelY});k(4,{z:endZ,hot:.035});
 }else if(coilPlan){
  k(.46,{arrange:.26});k(.90,{arrange:.50,z:ovenZ});k(1,{arrange:.51});
  k(1.72,{arrange:1});k(1.88,{held:true,y:frameY});k(2,{y:travelY});
  k(2.15,{z:endZ});k(2.42,{x:furn});k(2.58,{z:ovenZ});k(2.67,{y:frameY});k(2.73,{held:false,y:belowY});k(2.86,{z:endZ});k(3,{door:.035,hot:.67});
  k(3.12,{door:1});k(3.23,{z:ovenZ});k(3.28,{held:true,y:frameY});k(3.36,{y:travelY});k(3.47,{z:endZ});k(3.72,{x:right,hot:.17});k(3.86,{z:ovenZ});k(4,{y:frameY});
 }else{
  k(.48,{arrange:1});k(.70,{z:ovenZ});k(.85,{y:frameY,held:true});k(1,{y:travelY});
  k(1.25,{z:endZ});k(1.59,{x:furn});k(1.84,{z:ovenZ});k(2,{y:frameY});
  k(2.10,{held:false,y:belowY});k(2.28,{z:endZ});k(2.50,{door:.025,hot:.45});k(2.86,{hot:.87});k(3,{door:.20});
  k(3.13,{door:1});k(3.29,{z:ovenZ});k(3.36,{y:frameY,held:true});k(3.46,{y:travelY});k(3.59,{z:endZ});k(3.81,{x:right,door:.12,hot:.40});k(3.94,{z:ovenZ});k(4,{y:frameY});
 }
 return t;
}
// Batch identical hardware into draws while leaving the articulation graph intact.
function batchMeshes(scene){
 const map=new Map();
 scene.traverse(o=>{if(!o.isMesh||o.material.transparent)return;const key=o.geometry.uuid+o.material.uuid;const set=map.get(key)||[];set.push(o);map.set(key,set);});
 const batches=[];const zero=new T.Matrix4().makeScale(0,0,0);
 for(const objects of map.values()){
  if(objects.length<3)continue;const group=new T.InstancedMesh(objects[0].geometry,objects[0].material,objects.length);
  group.instanceMatrix.setUsage(T.DynamicDrawUsage);group.frustumCulled=false;group.castShadow=true;group.receiveShadow=true;
  for(const o of objects)o.layers.set(3);scene.add(group);batches.push([group,objects]);
 }
 return ()=>{scene.updateMatrixWorld(true);for(const [b,items] of batches){items.forEach((o,i)=>{let visible=true;for(let p=o;p&&visible;p=p.parent)visible=p.visible;b.setMatrixAt(i,visible?o.matrixWorld:zero);});b.instanceMatrix.needsUpdate=true;}};
}
export function buildFilm(renderer,id){
 const {scene,root,m,cam}=workshop(renderer),cfg=mode[id];let min,max,tank,track,primary,secondary;const passes=[];
 const units=[],w=cfg.w;let activeX=0,otherX=0;const row=id==='03'||id==='05';
 const unit=(x,width,opts={})=>{const f=furnace(root,x,width,cfg.fuel,m,{loadWidth:cfg.w,...opts});units.push(f);return f;};
 if(id==='03'){
  min=-12;max=12;const xs=[-6.15,-2.03,2.09,6.21];xs.forEach(x=>unit(x,3.30,{coil:true}));activeX=xs[1];primary=units[1];
  stand(root,-10,3.0,m);stand(root,10.05,3.0,m);for(const chamber of units)passes.push({primary:chamber,path:chamberCycle(id,-10,chamber.x,10.05)});
 }else if(id==='05'){
  min=-8.6;max=8.6;const xs=[-6.18,-2.04,2.10,6.24];xs.forEach((x,i)=>unit(x,3.38,{cool:i>=2}));
  primary=units[0];secondary=units[2];activeX=xs[0];otherX=xs[2];for(let i=0;i<2;i++)passes.push({primary:units[i],secondary:units[2+i],path:chamberCycle(id,units[i].x,0,units[2+i].x)});
 }else if(id==='06'){
  min=-5.75;max=5.85;activeX=2.95;primary=unit(activeX,3.68,{coil:true});stand(root,-3.37,w,m,true);track=chamberCycle(id,-3.37,activeX,-3.37);
 }else{
  const fw=w+1.0;activeX=-(fw*.51+.40);otherX=fw*.51+.40;min=activeX-fw*.55-.42;max=otherX+fw*.55+.40;
  primary=unit(activeX,fw,{short:cfg.short});tank=waterTank(root,otherX,w+.79,m);track=quench(id,activeX,otherX);
  if(id==='04'){
   // The preparation trestles sit in the foreground, clear of the empty test stroke.
   for(const xx of [-w*.28,w*.28]){blockBase(activeX+xx);}
  }
 }
 function blockBase(x){const material=m.steel;const g=new T.Mesh(new T.BoxGeometry(.13,1.45,.17),material);g.position.set(x,.726,endZ-.48);root.add(g);}
 ground(root,min,max,m);const vehicle=car(root,w,m),load=payload(root,cfg.kind,w,m);
 const sync=batchMeshes(scene);
 const aim=new T.Vector3((min+max)/2,1.8,.67);cam.position.copy(aim).add(new T.Vector3(3.5,id==='01'||id==='07'?6.8:5.9,19));cam.lookAt(aim);
 const width=max-min+1.1,aspect=renderer.domElement.width/renderer.domElement.height;
 cam.left=-width/2;cam.right=width/2;cam.top=width/aspect/2;cam.bottom=-cam.top;cam.updateProjectionMatrix();cam.updateMatrixWorld();
 // Frame the highest door guides as well as the front rails. A true orthographic camera
 // preserves machine alignment while the viewing window zooms into the same master film.
 const test=[[min,0,5.3],[max,0,5.3],[min,0,-2.7],[max,0,-2.7],...units.flatMap(f=>[[f.x-f.w/2,f.top+.2,.65],[f.x+f.w/2,f.top+.2,.65]])].map(v=>new T.Vector3(...v).project(cam));
 const xmin=Math.min(...test.map(v=>v.x)),xmax=Math.max(...test.map(v=>v.x)),ymin=Math.min(...test.map(v=>v.y)),ymax=Math.max(...test.map(v=>v.y));
 const extra=Math.max((xmax-xmin)/1.91,(ymax-ymin)/1.88);const dx=(xmax+xmin)*width/4,dy=(ymax+ymin)*width/aspect/4;
 cam.left=-width*extra/2+dx;cam.right=width*extra/2+dx;cam.bottom=-width*extra/aspect/2+dy;cam.top=width*extra/aspect/2+dy;cam.updateProjectionMatrix();
 const point=(x,y,z)=>{const v=new T.Vector3(x,y,z).project(cam);return [(v.x+1)*.5,(1-v.y)*.5];};
 return function draw(time){
  const mult=passes.length>0;const cycleSeconds=mult?19:16;
  const seconds=time*4,localSeconds=seconds%cycleSeconds;
  const pass=mult?passes[Math.floor(seconds/cycleSeconds)%passes.length]:null;
  const localTime=Math.min(localSeconds/4,4);
  const s={...(pass?pass.path:track).at(localTime)};const temp=s.hot;
  if(pass){primary=pass.primary;secondary=pass.secondary;}
  if(mult && localSeconds>16){
   const q=(localSeconds-16)/3;
   if(id==='03'){
    s.y=frameY+(belowY-frameY)*ease(q/.16);
    s.z=ovenZ+(endZ-ovenZ)*ease((q-.14)/.26);
    s.x=10.05-20.05*ease((q-.40)/.60);
   }else{
    const dx=.65*ease(q);s.x+=dx;s.lx+=dx;
   }
  }
  for(const f of units){const open=f===primary?s.door:f===secondary?s.box:.025,heat=f===primary?temp:f===secondary?0:.10;f.update(open,heat,time*4.2);}
  vehicle.update(s.x,s.z,s.y);load.update(s.lx,s.lz,s.ly,temp,s.arrange);tank?.update(time*4.2,clamp((1.3-s.ly)*1.8));
  sync();renderer.render(scene,cam);
  const focus=point(s.lx,s.ly+.46,s.lz),left=point(s.lx-w*.70,1.36,s.lz),right=point(s.lx+w*.70,1.36,s.lz);
  const span=clamp(Math.abs(right[0]-left[0])*1.28,row?.32:.34,.59);
  return {focus:[...focus,span].map(v=>+v.toFixed(5)),pose:[s.x,s.z,s.y,s.lx,s.lz,s.ly,s.arrange,s.hot,s.door,s.box].map(v=>+v.toFixed(3))};
 };
}
