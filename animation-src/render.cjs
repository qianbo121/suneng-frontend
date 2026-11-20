const fs=require('fs'),path=require('path'),{spawn}=require('child_process');
const {once}=require('events');
const {createRequire}=require('node:module');
const {chromium}=createRequire(path.resolve(__dirname,'../frontend/package.json'))('@playwright/test');
const base=path.resolve(__dirname,'..');
const src=base+'/animation-src',work=fs.mkdtempSync(path.join(require('os').tmpdir(),'fork-case-render-')),out=base+'/frontend/public/fork-case-review/films';
fs.mkdirSync(out,{recursive:true});
async function getPage(b,id,w,h){
 const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>console.error('pageerror',id,e.message));
 await p.route('http://film.test/**',async r=>{
  const name=new URL(r.request().url()).pathname;const file=name.includes('three.module')?base+'/frontend/public/animations/furnaces/v3/three.module.min.js':src+'/'+path.basename(name);
  if(!fs.existsSync(file)){await r.fulfill({status:404});return;}
  await r.fulfill({path:file,contentType:name.endsWith('.html')?'text/html':'application/javascript'});
 });
 await p.goto('http://film.test/capture.html?id='+id+'&w='+w+'&h='+h);await p.waitForFunction(()=>window.ready,{}, {timeout:30000});return p;
}
async function frame(p,t,quality){const a=await p.evaluate(([t,q])=>window.renderFrame(t,q),[t,quality]);return {image:Buffer.from(a.image,'base64'),focus:a.focus,pose:a.pose};}
async function film(b,id,sample){
 const w=1680,h=472;const p=await getPage(b,id,w,h);
 const dir=out+'/'+id;fs.mkdirSync(dir,{recursive:true});
 try{
 if(sample){for(const [j,t] of [0.18,1.63,2.58,3.80].entries()){const f=await frame(p,t,.94);fs.writeFileSync(work+'/'+id+'-'+j+'.jpg',f.image);}return;}
 const fps=24,passes=id==='03'?4:id==='05'?2:1,cycleDuration=passes>1?19:16,duration=passes*cycleDuration,frames=fps*duration;const enc=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','19','-g','24','-threads','3','-pix_fmt','yuv420p','-movflags','+faststart',work+'/'+id+'.mp4'],{stdio:['pipe','inherit','inherit']});
 const finished=once(enc,'exit');const tracks=[];const anchors=[37,146,247,347];
 for(let i=0;i<frames;i++){
  const f=await frame(p,i/fps/4,.91);
  if(i%4===0)tracks.push(f.focus);
  if(i===0)fs.writeFileSync(dir+'/poster.jpg',f.image);
  if(anchors.includes(i))fs.writeFileSync(work+'/'+id+'-thumb'+anchors.indexOf(i)+'.jpg',f.image);
  if(!enc.stdin.write(f.image))await once(enc.stdin,'drain');
 }
 enc.stdin.end();const [code]=await finished;if(code!==0)throw Error('ffmpeg '+code);
 fs.copyFileSync(work+'/'+id+'.mp4',dir+'/line.mp4');fs.writeFileSync(dir+'/camera.json',JSON.stringify({width:w,height:h,fps,duration,cycleDuration,passCount:passes,stageDuration:4,tracks,anchors:anchors.map(i=>i/fps)}));console.log('finished',id,fs.statSync(dir+'/line.mp4').size);
 }finally{await p.close();}
}
(async()=>{const args=process.argv.slice(2);const sample=args.includes('--sample');const ids=args.filter(x=>/^\d\d$/.test(x));const b=await chromium.launch({channel:'chrome',headless:true});try{while(ids.length)await Promise.all(ids.splice(0,sample?2:2).map(id=>film(b,id,sample)));}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
