import * as T from '/animations/furnaces/v3/three.module.min.js';

const TAU = Math.PI * 2;
export const clamp = (v, lo=0, hi=1) => Math.min(hi,Math.max(lo,v));
export function ease(v) {const t=clamp(v);return t*t*(3-2*t);}
export function ramp(t,a,b) {return ease((t-a)/(b-a));}
const normal = new T.Vector3(0,1,0);
export function node(parent,x=0,y=0,z=0) {
  const g=new T.Group();parent.add(g);g.position.set(x,y,z);return g;
}
const geometries = new Map();
function mesh(parent,key,build,mat,x,y,z) {
  if(!geometries.has(key))geometries.set(key,build());
  const obj=new T.Mesh(geometries.get(key),mat);obj.castShadow=!mat.transparent;obj.receiveShadow=!mat.transparent;obj.position.set(x,y,z);parent.add(obj);return obj;
}
export function block(p,x,y,z,w,h,d,m) {
  const o=mesh(p,'box',()=>new T.BoxGeometry(),m,x,y,z);o.scale.set(w,h,d);return o;
}
export function rod(p,ax,ay,az,bx,by,bz,r,m,n=12) {
  const o=mesh(p,'cylinder'+n,()=>new T.CylinderGeometry(1,1,1,n),m,(ax+bx)/2,(ay+by)/2,(az+bz)/2);
  const dir=new T.Vector3(bx-ax,by-ay,bz-az);o.scale.set(r,dir.length(),r);o.quaternion.setFromUnitVectors(normal,dir.normalize());return o;
}
function hoop(p,x,y,z,r,t,m) {
  const o=mesh(p,'hoop'+t,()=>new T.TorusGeometry(1,t,8,48),m,x,y,z);o.scale.setScalar(r);return o;
}
function surface(color,metal=.35,rough=.39,extra={}) {
  return new T.MeshStandardMaterial({color,metalness:metal,roughness:rough,...extra});
}
function brickTexture() {
  const c=document.createElement('canvas');c.width=384;c.height=256;const g=c.getContext('2d');
  g.fillStyle='#49372f';g.fillRect(0,0,384,256);
  for(let y=0;y<8;y++)for(let x=-1;x<8;x++){const n=((x+12)*73+y*157)%37;const px=x*64+(y%2)*32;
    g.fillStyle='rgb('+(149+n)+','+(112+n)+','+(85+n)+')';g.fillRect(px+1,y*32+1,62,30);
    g.fillStyle='#ffffff16';g.fillRect(px+1,y*32+1,62,2);
    for(let j=0;j<26;j++){g.fillStyle=j%2?'#41221422':'#ecd3a11a';g.fillRect(px+(j*29%59)+2,y*32+(j*7%27)+3,2,1);}
  }
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}
function brushedTexture() {
  const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');
  g.fillStyle='#b3c0c8';g.fillRect(0,0,256,256);
  for(let j=0;j<512;j++){const y=(j*149)%256,x=(j*137)%256,w=15+(j*31%180);g.fillStyle=j%2?'#f6fbff20':'#233c511e';g.fillRect(x,y,w,1);}
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;return map;
}
function heatField(){
  const c=document.createElement('canvas');c.width=384;c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(190,80,0,190,80,205);
  gr.addColorStop(0,'rgba(255,100,9,.85)');gr.addColorStop(.44,'rgba(243,66,3,.50)');gr.addColorStop(1,'rgba(141,32,0,0)');g.fillStyle=gr;g.fillRect(0,0,384,128);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex;
}
function reflection(renderer){
  const env=new T.Scene();env.background=new T.Color('#627b89');
  const lightbox=(x,y,z,sx,sy,sz,color)=>{const o=new T.Mesh(new T.BoxGeometry(sx,sy,sz),new T.MeshBasicMaterial({color}));o.position.set(x,y,z);env.add(o);};
  lightbox(0,6,0,13,.2,3,'#f2fbff');lightbox(-6,1,-1,.2,7,8,'#c5e4ee');lightbox(5,0,0,.3,5,10,'#384451');lightbox(0,0,7,10,1,.1,'#bfdae6');
  const pmrem=new T.PMREMGenerator(renderer);const out=pmrem.fromScene(env,.06);pmrem.dispose();return out.texture;
}
export function workshop(renderer) {
  const scene=new T.Scene();scene.environment=reflection(renderer);scene.background=new T.Color('#07141e');
  const m={steel:surface('#536b80',.66,.34),rim:surface('#b0d8e6',.75,.22),dark:surface('#243e50',.57),
    black:surface('#101f2b',.58),bolt:surface('#b8cbd1',.84,.24),copper:surface('#a95c2c',.71,.27),
    pipe:surface('#ac8242',.64),frame:surface('#436477',.78),yellow:surface('#bd8936',.57),ceramic:surface('#77675a',.13,.82),
    liner:surface('#98775c',.08,.84,{map:brickTexture(),emissive:'#6e3312',emissiveIntensity:.32}),
    glass:surface('#74bdcf',.12,.22,{transparent:true,opacity:.13,depthWrite:false,side:T.DoubleSide}),
    water:surface('#43b7c0',.33,.18,{transparent:true,opacity:.34,depthWrite:false,side:T.DoubleSide}),
    waterGlass:surface('#2c7584',.16,.24,{transparent:true,opacity:.25,depthWrite:false,side:T.DoubleSide}),
    hot:surface('#eb9a46',.16,.45,{emissive:'#ff6306',emissiveIntensity:1.2}),
    darkBrick:surface('#514744',.12,.87), red:surface('#a94832'), teal:surface('#397e89'),floor:surface('#08131d',.17,.80)};
  const brushed=brushedTexture();for(const key of ['steel','frame','dark','rim'])m[key].map=brushed;
  m.heatMap=heatField(); const root=node(scene);scene.add(new T.HemisphereLight(0xe1f0ff,0x3b4655,1.00));
  for(const [pos,c,intensity] of [[[1,9,8],0xffedca,1.85],[[-7,5,2],0x9ed4ff,1.75],[[6,7,-6],0xd2f1ff,2.3]]){
    const l=new T.DirectionalLight(c,intensity);l.position.set(...pos);scene.add(l);
    if(c===0xffedca){l.castShadow=true;Object.assign(l.shadow.camera,{left:-15,right:15,top:10,bottom:-10,near:.1,far:40});l.shadow.camera.updateProjectionMatrix();l.shadow.mapSize.set(2048,1024);l.shadow.bias=-.00055;l.shadow.normalBias=.024;}

  }
  const cam=new T.OrthographicCamera(-10,10,3,-3,.1,150);
  return {scene,root,m,cam};
}
function beam(p,x,y,z,len,axis,m){
  const g=node(p,x,y,z);if(axis==='z')g.rotation.y=Math.PI/2;
  block(g,0,0,0,len,.15,.07,m.dark);for(const h of [-.095,.095])block(g,0,h,0,len,.045,.19,m.rim);
}
function feet(p,x,z,h,m){
  block(p,x,h/2,z,.15,h,.18,m.frame);block(p,x,.035,z,.37,.07,.37,m.rim);
}
function bolt(p,x,y,z,m,r=.036){rod(p,x,y,z,x,y,z+.038,r,m.bolt,6);}
function pulley(p,x,y,z,m,r=.15){
 rod(p,x,y,z-.08,x,y,z+.08,r,m.dark,20);rod(p,x,y,z+.08,x,y,z+.10,r*.79,m.rim,20);bolt(p,x,y,z+.10,m,r*.21);
}
function pipeElbow(p,points,r,mat){for(let i=1;i<points.length;i++)rod(p,...points[i-1],...points[i],r,mat);}
function rail(p,x1,x2,z,m){
 const l=x2-x1,x=(x1+x2)/2;block(p,x,.075,z,l,.075,.18,m.frame);block(p,x,.135,z,l,.11,.055,m.dark);
 block(p,x,.212,z,l,.057,.105,m.rim);
 for(let a=x1+.2;a<x2;a+=.69){block(p,a,.034,z,.24,.055,.36,m.black);block(p,a,.067,z+.12,.075,.034,.06,m.bolt);}
}
export function ground(root,min,max,m){
 const mid=(min+max)/2;block(root,mid,-.115,.65,max-min+1.1,.18,9.7,m.floor);
 for(const z of [4.0,5.12])rail(root,min,max,z,m);
 for(let x=min+.3;x<max;x+=1.7){block(root,x,-.019,.6,.013,.008,9,m.dark);}
}
function framePost(p,x,z,h,m){
 block(p,x,h/2,z,.17,h,.19,m.frame);block(p,x+.075,h/2,z+.095,.035,h,.04,m.rim);
 block(p,x,.065,z,.37,.12,.35,m.dark);bolt(p,x,.19,z+.13,m);
}
export function furnace(root,x,w,kind,m,{cool=false,coil=false,short=false,loadWidth=w*.85}={}){
 const p=node(root,x,0,-1.02);const h=short?1.12:coil?2.55:1.72,d=2.8;
 const sill=1.00,top=sill+h,front=d/2;
 for(const a of [-w*.41,w*.41])for(const z of [-1.08,1.08])feet(p,a,z,.83,m);
 block(p,0,.78,0,w+.3,.27,d+.23,m.dark);beam(p,0,.87,front,w+.4,'x',m);block(p,0,sill-.035,0,w,.14,d,m.darkBrick);
 for(let i=0;i<6;i++){const xx=w*(i/6-.42);
  block(p,xx,.55,front-.03,w*.15,.32,.085,m.dark);for(let j=-1;j<=1;j++)block(p,xx,.55+j*.045,front+.02,w*.096,.015,.018,m.black);
  bolt(p,xx-w*.06,.65,front+.03,m,.022);bolt(p,xx+w*.06,.47,front+.03,m,.022);
 }
 for(const ss of [-1,1]){const xx=ss*(w*.5+.14);pipeElbow(p,[[xx,.31,1.20],[xx,.31,-.8],[xx,.64,-1.06]],.034,m.rim);}
 for(let i=0;i<=Math.floor(w/.50);i++)bolt(p,-w/2+.12+i*.49,.86,front+.11,m,.029);

 block(p,0,sill+h/2,-d/2+.04,w,h,.16,cool?m.dark:m.liner);
 for(const s of [-1,1]){
  const xx=s*w/2;block(p,xx,sill+h/2,0,.14,h,d,m.frame);block(p,xx-s*.10,sill+h/2,0,.11,h-.06,d-.12,cool?m.rim:m.liner);
  for(const z of [-1.27,0,1.27]){framePost(p,xx+s*.1,z,top+.08,m);bolt(p,xx,top-.13,z+.12,m);}
  if(!cool)for(const z of [-.9,-.15,.62])rod(p,xx-s*.20,sill+.18,z,xx-s*.20,top-.2,z,.035,m.hot);
 }
 for(const z of [-front,front])beam(p,0,top+.04,z,w+.36,'x',m);
 block(p,0,top,0,w+.12,.09,d+.17,m.glass);
 for(const a of [-.33,0,.33]){block(p,a*w,top+.10,0,.04,.035,d+.05,m.rim);}
 for(const a of [-.275,0,.275]){const xx=a*loadWidth;block(p,xx,sill+.20,0,.12,.39,1.93,m.darkBrick);block(p,xx,sill+.414,0,.16,.06,1.98,m.ceramic);}
 if(!cool)for(let i=0;i<Math.floor(w*2.5);i++){
  const xx=-w/2+.26+i*.40;
  if(kind==='gas' && i%2===1)continue;
  if(kind==='gas'){rod(p,xx,sill+.45,-1.35,xx,sill+.45,-1.05,.075,m.copper);rod(p,xx,sill+.46,-1.1,xx,sill+.50,-.91,.037,m.hot);}
  else {const yy=top-.29;rod(p,xx,yy,-1.22,xx,yy-.27,-1.22,.022,m.hot);rod(p,xx,yy-.27,-1.22,xx+.17,yy-.27,-1.22,.022,m.hot);rod(p,xx+.17,yy-.27,-1.22,xx+.17,yy,-1.22,.022,m.hot);}
 }
 if(!cool){
  for(const side of [-1,1]){
   const x=side*(w*.50+.24);for(const z of [-.9,0,.9]){
    rod(p,x-.07,top+.12,z,x+.07,top+.12,z,.100,m.dark);rod(p,x-.05,top+.12,z,x+.05,top+.12,z,.110,m.rim);
   }
  }
 }
 if(kind==='gas'){
  rod(p,-w*.5-.16,.48,front+.11,w*.49,.48,front+.11,.055,m.pipe);
  for(let i=0;i<3;i++){const xx=-w*.39+i*w*.39;rod(p,xx,.45,front+.11,xx,.88,front+.11,.035,m.pipe);rod(p,xx,.73,front+.1,xx,.73,front+.29,.054,m.dark);hoop(p,xx,.73,front+.30,.10,.11,m.red);}
  const xx=-w/2-.28;pipeElbow(p,[[xx,.40,1.34],[xx,.40,-.90],[xx,1.56,-.90],[xx+.26,1.56,-.90]],.075,m.pipe);
  for(const z of [-.7,.05,.85])rod(p,xx,.40,z-.03,xx,.40,z+.03,.113,m.rim);
 }
 const door=node(p,0,0,front+.23);const dw=w-.20;
 // A cutaway sector retains the guides, lifting drive and ribs while revealing the load.
 block(door,0,sill+h/2,0,dw,h,.09,m.glass);
 for(const s of [-1,1]){block(door,s*dw/2,sill+h/2,0,.085,h,.13,m.frame);block(door,s*(dw/2-.13),sill+h*.60,.035,.17,h*.67,.075,m.steel);}
 for(const k of [sill+.04,top-.05])block(door,0,k,.045,dw,.075,.12,m.rim);
 for(const xx of [-.29,.29]){block(door,xx*dw,top-.12,.075,.08,.23,.075,m.dark);bolt(door,xx*dw,top-.13,.13,m);}
 const travel=h+.12,postHeight=top+travel+.26;
 for(const s of [-1,1]){
  const xx=s*(w/2+.15);framePost(p,xx,front+.26,postHeight,m);pulley(p,xx,postHeight-.08,front+.28,m,.115);
  rod(p,xx-.04,top-.06,front+.30,xx-.04,postHeight-.15,front+.30,.017,m.bolt);
 }
 beam(p,0,postHeight-.03,front+.25,w+.59,'x',m);
 rod(p,-w*.34,postHeight+.03,front+.26,w*.34,postHeight+.03,front+.26,.045,m.rim);
 const motor=block(p,w*.21,postHeight+.10,front+.21,.40,.22,.27,m.teal);
 for(let k=0;k<5;k++)block(motor,(-.35+.15*k),0,0,.06,1.18,1.08,m.rim);
 const glow=new T.MeshBasicMaterial({color:0xff6711,map:m.heatMap,transparent:true,opacity:.3,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending});
 block(p,0,sill+h*.48,-1.24,w-.35,h*.82,.012,glow);
 let fan;
 if(coil){fan=node(p,0,top+.12,-.45);rod(p,0,top-.07,-.45,0,top+.31,-.45,.20,m.teal);for(let k=0;k<4;k++){const blade=node(fan);blade.rotation.y=k*Math.PI/2;block(blade,.24,0,0,.47,.036,.13,m.rim);}}
 return {x,w,door,update(open,heat,t){door.position.y=open*travel;glow.opacity=cool?0:.25+heat*(.60+.07*Math.sin(t*4));if(fan)fan.rotation.y=t*4;},top:postHeight};
}
export function waterTank(root,x,w,m){
 const p=node(root,x,0,2.03),d=3.0,top=1.39;
 block(p,0,.07,0,w,.12,d,m.dark);block(p,0,.66,-d/2,w,1.30,.12,m.frame);
 for(const s of [-1,1]){block(p,s*w/2,.68,0,.11,1.35,d,m.waterGlass);beam(p,s*w/2,top,0,d+.17,'z',m);}
 block(p,0,.71,d/2,w,1.27,.055,m.waterGlass);
 for(const z of [-d/2,d/2]){beam(p,0,top,z,w+.17,'x',m);beam(p,0,.13,z,w+.15,'x',m);}
 for(const frac of [-.5,-.25,0,.25,.5])block(p,w*frac,.73,d/2+.04,.055,1.2,.065,m.frame);
 const surf=block(p,0,1.25,0,w-.13,.014,d-.12,m.water);
 for(let i=0;i<Math.ceil(w*2.4);i++)bolt(p,-w/2+.12+i*.40,top,d/2+.11,m,.025);
 const bubbles=[];const mist=new T.MeshBasicMaterial({color:0xb1eff0,transparent:true,opacity:.47,depthWrite:false});
 for(let i=0;i<24;i++){const bubble=mesh(p,'bubble',()=>new T.SphereGeometry(1,7,5),mist,0,0,0);bubbles.push(bubble);}
 const waves=[];for(let k=0;k<5;k++){
  const geo=new T.BufferGeometry(),data=new Float32Array(75*3);geo.setAttribute('position',new T.BufferAttribute(data,3));
  const mat=new T.LineBasicMaterial({color:k%2?0x72c5c9:0x47969e,transparent:true,opacity:.39});const line=new T.Line(geo,mat);p.add(line);waves.push([geo,data]);
 }
 return {update(t,intensity){surf.material.opacity=.27+.10*intensity;
  bubbles.forEach((b,i)=>{const k=(t*(.66+i%5*.055)+i*.137)%1;b.visible=intensity>.04;b.scale.setScalar((.012+.018*k)*intensity);b.position.set(((i*37%89)/89-.5)*w*.81,1.19+k*.38,Math.sin(i*3.1+k)*.59);});waves.forEach(([geo,pts],j)=>{for(let i=0;i<75;i++){pts[i*3]=(i/74-.5)*(w-.19);pts[i*3+1]=1.265+.012*Math.sin(i*.31+t*3+j);pts[i*3+2]=-.92+j*.43+.033*Math.sin(i*.22-t*2+j)*(1+2*intensity);}geo.attributes.position.needsUpdate=true;});}};
}
export function stand(root,x,w,m,scale=false){
 const p=node(root,x,0,-1.02);
 for(const a of [-.42,.42])for(const z of [-.9,.9])feet(p,w*a,z,1.08,m);
 for(const z of [-.96,.96])beam(p,0,1.08,z,w,'x',m);
 for(const a of [-.275,0,.275]){block(p,w*a,1.26,0,.15,.37,2.02,m.steel);block(p,w*a,1.458,0,.23,.04,2.07,m.rim);}
 if(scale){const xx=-w*.46;block(p,xx,.71,1.37,.09,1.32,.09,m.frame);block(p,xx,1.49,1.37,.45,.27,.13,m.dark);block(p,xx,1.50,1.45,.34,.14,.012,m.teal);}
}
export function car(root,w,m){
 const carriage=node(root),z=4.54;
 for(const zz of [z-.55,z+.56]){beam(carriage,0,.52,zz,w+.55,'x',m);for(const sx of [-.42,.42]){
  const xx=sx*w;rod(carriage,xx,.38,zz-.105,xx,.38,zz+.105,.165,m.black,20);
  rod(carriage,xx,.38,zz+.104,xx,.38,zz+.122,.117,m.rim,20);bolt(carriage,xx,.38,zz+.12,m);
 }}
 for(const sx of [-.42,.42]){const xx=w*sx;
  beam(carriage,xx,.52,z,1.37,'z',m);framePost(carriage,xx,z-.13,2.44,m);
  block(carriage,xx,2.47,3.86,.13,.16,1.20,m.rim);rod(carriage,xx,2.39,3.32,xx,.94,3.32,.063,m.steel);
  pipeElbow(carriage,[[xx,.66,4.65],[xx,1.63,4.52],[xx,2.25,4.45]],.042,m.black);
 }
 block(carriage,0,.66,z,w+.39,.12,.84,m.frame);
 for(let j=-2;j<=2;j++)block(carriage,w*.14*j,.731,z,.026,.016,.77,m.rim);
 block(carriage,-w*.29,.85,z+.22,.48,.32,.31,m.dark);for(let j=0;j<5;j++)block(carriage,-w*.29-.16+.08*j,1.018,z+.22,.035,.026,.27,m.rim);
 for(const sign of [-1,1]){
  const xx=sign*(w*.37);
  rod(carriage,xx,.76,4.42,xx,2.06,4.14,.087,m.dark);rod(carriage,xx,1.87,4.18,xx,2.43,3.99,.045,m.bolt);
  for(const dz of [-.4,0,.4])bolt(carriage,xx+sign*.07,.60,z+dz,m,.027);
 }
 const lift=node(carriage);block(lift,0,-.15,3.30,w+.07,.24,.21,m.frame);
 const forks=node(lift);const ts=[-.40,-.165,.165,.40];
 for(const sx of ts){const xx=w*sx;block(forks,xx,-.063,0,.14,.125,2.38,m.rim);block(forks,xx,-.083,1.10,.18,.17,.34,m.dark);block(lift,xx,-.145,2.56,.20,.13,1.40,m.steel);}
 block(forks,0,-.16,1.16,w*.88,.14,.15,m.steel);
 const pistons=ts.map(sx=>rod(lift,w*sx,-.14,0,w*sx,-.14,1,.062,m.rim));
 return {update(x,centerZ,y){carriage.position.x=x;lift.position.y=y;forks.position.z=centerZ;for(const piston of pistons){piston.position.z=(centerZ+1.04+3.23)/2;piston.scale.y=3.23-centerZ-1.04;}}};
}
export function payload(root,kind,w,m){
 const group=node(root),parts=node(group),items=[];
 const alloy=surface(kind==='coils'?'#bc774b':'#b8c5c9',.76,.26);
 const hot=new T.Color('#ff650c');
 function tray(y){block(group,0,y,0,w*.91,.10,1.36,m.frame);for(const s of [-1,1])beam(group,0,y+.075,s*.64,w*.96,'x',m);}
 if(kind==='bars'){
  for(let j=0;j<9;j++){const z=(j-4)*.170;items.push(rod(parts,-w*.47,.070,z,w*.47,.070,z,.057,alloy,20));}
 }else if(kind==='coils'){
  tray(.075);for(const sx of [-.44,0,.44])block(group,w*sx,.36,-.64,.055,.62,.055,m.steel);
  for(let i=0;i<6;i++){
   const one=node(parts,((i%3)-1)*w*.29,.43,(Math.floor(i/3)-.5)*.65);items.push(one);
   for(let j=0;j<8;j++){
    const ring=hoop(one,0,0,(j-3.5)*.061,.344,.087,alloy);
    ring.rotation.z=j*.22;
   }
   for(const a of [.76,2.43]){const bx=.347*Math.cos(a),by=.347*Math.sin(a);rod(one,bx,by,-.25,bx,by,.25,.018,m.dark);}
  }
 }else{
  tray(.055);
  for(const row of [-1,1])for(let i=0;i<4;i++){
   const one=node(parts,(i-1.5)*w*.205,.37,row*.25);items.push(one);
   const radius=.18+.024*(i%2);const tube=new T.Mesh(new T.TorusGeometry(.20,radius*.56,12,26,Math.PI/2),alloy);
   one.add(tube);tube.rotation.z=i%2?0:Math.PI*.5;
   const flange=hoop(one,-.01,-.01,.05,.166,.29,alloy);flange.rotation.x=Math.PI/2.75;
  }
  if(kind==='basket'){for(const z of [-.66,.66]){
   for(const yy of [.23,.56,.72])block(group,0,yy,z,w*.94,.035,.045,m.rim);
   for(let i=0;i<9;i++)block(group,(i/8-.5)*w*.93,.38,z,.033,.69,.045,m.steel);
  }for(const x of [-w*.47,w*.47]){block(group,x,.71,0,.045,.045,1.36,m.rim);block(group,x,.38,0,.036,.035,1.32,m.steel);}}
 }
 const bases=items.map(o=>o.position.clone());
 return {group,items,update(x,z,y,temperature,arrangement=1){
   group.position.set(x,y,z);alloy.emissive.copy(hot);alloy.emissiveIntensity=.72*temperature;
   alloy.color.set(kind==='coils'?'#ae6436':'#6f8999').lerp(new T.Color('#c54d18'),temperature*.91);
   items.forEach((o,i)=>{o.position.copy(bases[i]);if(arrangement<1){const u=1-ramp(arrangement,i/(items.length*1.8),.45+i/(items.length*1.8));
    o.position.y+=u*(.45+.08*(i%3));o.visible=u<.995;}else o.visible=true;});
 }};
}
