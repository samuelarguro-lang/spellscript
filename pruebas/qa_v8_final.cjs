const {chromium}=require('/usr/local/lib/node_modules/playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{const file=path.join(root,new URL(req.url,'http://localhost').pathname==='/'?'index.html':decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}const size=fs.statSync(file).size;res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');if(req.headers.range){const m=req.headers.range.match(/bytes=(\d+)-(\d*)/);if(m){const a=Number(m[1]),b=m[2]?Math.min(Number(m[2]),size-1):size-1;res.writeHead(206,{'Content-Range':`bytes ${a}-${b}/${size}`,'Content-Length':b-a+1});fs.createReadStream(file,{start:a,end:b}).pipe(res);return;}}res.setHeader('Content-Length',size);fs.createReadStream(file).pipe(res);});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/';
 const b=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await b.newPage({viewport:{width:1440,height:900}});const errors=[],bad=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))bad.push(r.status()+' '+r.url());});
 await page.goto(url,{waitUntil:'load'});await page.locator('[data-difficulty=facil]').first().click();await page.locator('#startButton').click();if(await page.locator('#tutorialBackdrop').isVisible())await page.locator('#tutorialSkip').click();
 const results=[];
 for(let room=0;room<3;room++){
 if(await page.locator('#v6Cinematic').isVisible())await page.locator('#v6CinemaSkip').click();
 await page.waitForTimeout(900);
 const before=await page.evaluate(()=>{const v=SpellVideoBackgrounds.active();return {src:v?.getAttribute('src'),time:v?.currentTime,ready:v?.readyState,paused:v?.paused};});
 const expected=['ice','fire','mist'][room];assert(before.src.includes(expected)&&before.ready>=2&&!before.paused,JSON.stringify(before));
 await page.waitForTimeout(3000);const idle=await page.evaluate('SpellClock.metrics()');
 for(let i=0;i<24;i++){await page.mouse.move(490+Math.sin(i*.8)*180,330+Math.cos(i*.8)*120);await page.waitForTimeout(100);}
 const moving=await page.evaluate('SpellClock.metrics()'),after=await page.evaluate('SpellVideoBackgrounds.active().currentTime');assert(after!==before.time);
 const audio=await page.evaluate(()=>({playing:SpellAudioMix.playing(),volume:SpellAudioMix.current()?.volume(),source:String(SpellAudioMix.current()?._src),actual:SpellAudioMix.current()?._sounds?.filter(s=>!s._paused).map(s=>s._node?.volume??s._volume)}));assert(audio.playing&&audio.volume>.1&&audio.source.includes(['hielo','fuego','niebla'][room]),JSON.stringify(audio));
 await page.screenshot({path:path.join(root,'capturas_v8','final_'+expected+'.jpg'),type:'jpeg',quality:82});
 let i=0;
 while(!await page.evaluate('SpellGame.state.solved[SpellGame.state.currentRoom]')){
 await page.locator('#spellInput').fill(await page.evaluate('SpellNatural.example(SpellGame.currentPuzzle().solution,SpellGame.state.difficulty)'));
 await page.locator('#castButton').click();
 if(i===0){await page.waitForTimeout(1300);await page.screenshot({path:path.join(root,'capturas_v8','impacto_'+expected+'.jpg'),type:'jpeg',quality:82});}
 await page.waitForFunction('!document.querySelector("#castButton").disabled || SpellGame.state.solved[SpellGame.state.currentRoom]',{},{timeout:18000});await page.waitForTimeout(120);i++;if(i>7)throw Error('Too many attempts');
 }
 await page.waitForFunction('!document.querySelector("#nextRoomButton").hidden',{},{timeout:18000});
 results.push({room:expected,video:before,after,engine:await page.evaluate('SpellParticles.engine()'),idle,moving,audio,solved:true,errors:[...errors],bad:[...bad]});console.log(JSON.stringify(results.at(-1)));
 if(room<2)await page.locator('#nextRoomButton').click();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
 await page.locator('[data-go=progreso]').first().click();await page.waitForTimeout(300);assert(await page.locator('.v8-rune.earned').count()===3);await page.screenshot({path:path.join(root,'capturas_v8','final_progreso.jpg'),type:'jpeg',quality:82});
 fs.writeFileSync(path.join(root,'pruebas','RESULTADOS_V8_FINAL.json'),JSON.stringify(results,null,2));await b.close();server.close();
})().catch(e=>{console.error(e.stack);server.close();process.exit(1)});