const {chromium}=require('/usr/local/lib/node_modules/playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{const file=path.join(root,new URL(req.url,'http://localhost').pathname==='/'?'index.html':decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}const size=fs.statSync(file).size;res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');if(req.headers.range){const m=req.headers.range.match(/bytes=(\d+)-(\d*)/);if(m){const a=Number(m[1]),b=m[2]?Math.min(Number(m[2]),size-1):size-1;res.writeHead(206,{'Content-Range':`bytes ${a}-${b}/${size}`,'Content-Length':b-a+1});fs.createReadStream(file,{start:a,end:b}).pipe(res);return;}}res.setHeader('Content-Length',size);fs.createReadStream(file).pipe(res);});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/';const b=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const out=[];
for(const [w,h] of [[1440,900],[390,844],[360,800]]){
 const page=await b.newPage({viewport:{width:w,height:h},reducedMotion:'no-preference'});const errors=[],bad=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))bad.push(r.status()+' '+r.url());});page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,180));});
 await page.goto(url,{waitUntil:'load'});await page.waitForTimeout(1400);
 const checkVideo=()=>page.evaluate(()=>{const v=SpellVideoBackgrounds.active();return {src:v?.getAttribute('src'),time:v?.currentTime,ready:v?.readyState,paused:v?.paused,visible:v?.classList.contains('ready')};});
 const home=await checkVideo();assert(home.visible&&home.time>0,JSON.stringify(home));await page.screenshot({path:path.join(root,'capturas_v8',w+'_menu.jpg'),type:'jpeg',quality:78,fullPage:true});
 await page.locator('[data-difficulty=facil]').first().click();await page.locator('#startButton').click();if(await page.locator('#tutorialBackdrop').isVisible())await page.locator('#tutorialSkip').click();if(await page.locator('#v6Cinematic').isVisible())await page.locator('#v6CinemaSkip').click();await page.waitForTimeout(1300);
 const ice=await checkVideo();assert(ice.src.includes('ice')&&ice.time>0,JSON.stringify(ice));assert(await page.locator('#hintButton').count()===0);assert(await page.evaluate('SpellMusic.isEnabled()'));assert(await page.evaluate('SpellAudioMix.playing()'));
 await page.locator('#aetherHelp').click();await page.waitForTimeout(200);
 await page.screenshot({path:path.join(root,'capturas_v8',w+'_hielo.jpg'),type:'jpeg',quality:78,fullPage:true});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert(!overflow);
 const v1=await checkVideo();for(let i=0;i<8;i++){await page.mouse.move(w*.35+(i%3)*20,h*.40+(i%4)*20);await page.waitForTimeout(80);}const v2=await checkVideo();assert(v2.time!==v1.time);
 const engine=await page.evaluate('SpellParticles.engine()');
 await page.locator('#spellInput').fill(await page.evaluate('SpellNatural.example(SpellGame.currentPuzzle().solution,SpellGame.state.difficulty)'));
 await page.locator('#castButton').click();await page.waitForTimeout(1100);await page.screenshot({path:path.join(root,'capturas_v8',w+'_hechizo.jpg'),type:'jpeg',quality:78,fullPage:true});await page.waitForTimeout(2200);await page.waitForFunction('SpellGame.state.progress[0]===1');
 await page.locator('#settingsButton').click();await page.screenshot({path:path.join(root,'capturas_v8',w+'_audio.jpg'),type:'jpeg',quality:78,fullPage:true});assert(await page.locator('[data-mix]').count()===3);await page.locator('#graphicsMode').selectOption('off');await page.locator('#modalClose').click();await page.waitForTimeout(200);assert((await checkVideo()).paused);
 if(w===1440){
  for(let room=0;room<3;room++){
   if(room>0){await page.locator('#nextRoomButton').click();await page.waitForTimeout(250);if(await page.locator('#v6Cinematic').isVisible())await page.locator('#v6CinemaSkip').click();}
   while(!await page.evaluate('SpellGame.state.solved[SpellGame.state.currentRoom]')){await page.locator('#spellInput').fill(await page.evaluate('SpellNatural.example(SpellGame.currentPuzzle().solution,SpellGame.state.difficulty)'));await page.locator('#castButton').click();await page.waitForTimeout(300);}
   await page.waitForTimeout(750);
  }
  assert(await page.evaluate('SpellGame.state.solved.every(Boolean)'));if(await page.locator('#modalBackdrop').isVisible())await page.locator('#modalClose').click();await page.locator('[data-go=progreso]').first().click();await page.waitForTimeout(300);assert(await page.locator('.v8-rune.earned').count()===3);await page.screenshot({path:path.join(root,'capturas_v8','1440_collection.jpg'),type:'jpeg',quality:78,fullPage:true});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);
 out.push({viewport:[w,h],home,ice,mouseMotionContinues:true,engine,aether:true,musicPlaying:true,settings:true,noOverflow:true,complete:w===1440,errors,bad});console.log(JSON.stringify(out.at(-1)));await page.close();
}
await b.close();fs.writeFileSync(path.join(root,'pruebas','RESULTADOS_V8_VISUALES.json'),JSON.stringify(out,null,2));server.close();
})().catch(e=>{console.error(e.stack);server.close();process.exit(1)});
