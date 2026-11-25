const {chromium}=require('/usr/local/lib/node_modules/playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{const file=path.join(root,new URL(req.url,'http://localhost').pathname==='/'?'index.html':decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}const size=fs.statSync(file).size;res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');if(req.headers.range){const m=req.headers.range.match(/bytes=(\d+)-(\d*)/);if(m){const a=Number(m[1]),b=m[2]?Math.min(Number(m[2]),size-1):size-1;res.writeHead(206,{'Content-Range':`bytes ${a}-${b}/${size}`,'Content-Length':b-a+1});fs.createReadStream(file,{start:a,end:b}).pipe(res);return;}}res.setHeader('Content-Length',size);fs.createReadStream(file).pipe(res);});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/';
 const b=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:1280,height:800}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url,{waitUntil:'load'});await p.locator('[data-difficulty=facil]').first().click();await p.locator('#startButton').click();if(await p.locator('#tutorialBackdrop').isVisible())await p.locator('#tutorialSkip').click();if(await p.locator('#v6Cinematic').isVisible())await p.locator('#v6CinemaSkip').click();
 await p.waitForTimeout(1200);
 const results=[];
 for(let room=0;room<3;room++){
 await p.evaluate(i=>{SpellGame.state.currentRoom=i;SpellUI.navigate('aventura');},room);
 if(await p.locator('#v6Cinematic').isVisible())await p.locator('#v6CinemaSkip').click();
 await p.waitForTimeout(3200);
 const snapshot=()=>p.evaluate(()=>({metrics:SpellClock.metrics(),video:SpellVideoBackgrounds.active()?.currentTime,src:SpellVideoBackgrounds.active()?.src,decoded:SpellVideoBackgrounds.active()?.getVideoPlaybackQuality?.(),volume:SpellAudioMix.current()?.volume(),engine:SpellParticles.engine()}));
 let idle=await snapshot();
 for(let i=0;i<15;i++){await p.mouse.move(420+i*13,300+(i%3)*15);await p.waitForTimeout(120);}
 let moving=await snapshot();assert(idle.src.includes(['ice','fire','mist'][room]));assert(idle.video!==moving.video);assert(idle.volume>.1);
 await p.screenshot({path:path.join(root,'capturas_v8','optimizada_'+room+'.jpg'),type:'jpeg',quality:80});
 results.push({room,idle,moving});console.log(JSON.stringify(results.at(-1)));
 }
 await p.evaluate(()=>SpellCompanion.celebrate());await p.waitForFunction('document.querySelector(".v8-aether-reaction")?.complete && document.querySelector(".v7-familiar-sprite").classList.contains("v8-reacting")',{}, {timeout:12000});await p.screenshot({path:path.join(root,'capturas_v8','aether_celebracion.jpg'),type:'jpeg',quality:82});
 await p.evaluate(()=>SpellGraphics.set('off'));await p.waitForTimeout(100);assert(!await p.locator('.v8-aether-reaction').count());assert(await p.evaluate('SpellVideoBackgrounds.active().paused'));
 await p.evaluate(()=>SpellGraphics.set('full'));await p.waitForTimeout(1000);assert(await p.evaluate('!SpellVideoBackgrounds.active().paused'));
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(root,'pruebas','RESULTADOS_V8_OPTIMIZADO.json'),JSON.stringify({results,aether:true,graphics:true,errors},null,2));await b.close();server.close();
})().catch(e=>{console.error(e.stack);server.close();process.exit(1)});