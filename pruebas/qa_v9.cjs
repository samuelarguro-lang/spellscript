const {chromium}=require('/usr/local/lib/node_modules/playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{const file=path.join(root,new URL(req.url,'http://localhost').pathname==='/'?'index.html':decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}const size=fs.statSync(file).size;res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');if(req.headers.range){const m=req.headers.range.match(/bytes=(\d+)-(\d*)/);if(m){const a=Number(m[1]),b=m[2]?Math.min(Number(m[2]),size-1):size-1;res.writeHead(206,{'Content-Range':`bytes ${a}-${b}/${size}`,'Content-Length':b-a+1});fs.createReadStream(file,{start:a,end:b}).pipe(res);return;}}res.setHeader('Content-Length',size);fs.createReadStream(file).pipe(res);});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/';
 const b=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
 const out=[];const dir=path.join(root,'capturas_v9');fs.mkdirSync(dir,{recursive:true});
 for(const [w,h] of [[1440,900],[390,844]]){
 const p=await b.newPage({viewport:{width:w,height:h}});const errors=[],bad=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))bad.push(r.status()+' '+r.url());});
 await p.goto(url,{waitUntil:'load'});await p.waitForFunction('SpellVideoBackgrounds.active()?.currentTime>0.1');
 const forbidden='.v7-home-orbit,.floating-crystal,.rune-orbit,.v7-home-particles,.v7-ambient,.v7-ice-seal,.v7-astral-ring,#particles,#roomPortal,#roomSuccess';
 assert.equal(await p.locator(forbidden).count(),0);
 await p.screenshot({path:path.join(dir,w+'_menu.jpg'),type:'jpeg',quality:78});
 await p.locator('[data-difficulty=facil]').first().click();await p.locator('#startButton').click();if(await p.locator('#tutorialBackdrop').isVisible())await p.locator('#tutorialSkip').click();if(await p.locator('#v6Cinematic').isVisible())await p.locator('#v6CinemaSkip').click();
 await p.waitForFunction('SpellVideoBackgrounds.active()?.currentTime>0.1');
 assert.equal(await p.locator(forbidden).count(),0);assert.equal(await p.locator('#hintButton').count(),0);
 await p.screenshot({path:path.join(dir,w+'_ice.jpg'),type:'jpeg',quality:78});
 const before=await p.evaluate('SpellVideoBackgrounds.active().currentTime');for(let i=0;i<10;i++){await p.mouse.move(w*.4+i*3,h*.4+i*4);await p.waitForTimeout(100);}
 const after=await p.evaluate('SpellVideoBackgrounds.active().currentTime');assert.notEqual(before,after);
 const rooms=[];const max=w===1440?3:1;
 for(let room=0;room<max;room++){
 if(await p.locator('#v6Cinematic').isVisible())await p.locator('#v6CinemaSkip').click();
 await p.waitForFunction('SpellVideoBackgrounds.active()?.currentTime>0.1');
 const video=await p.evaluate(()=>{let v=SpellVideoBackgrounds.active();return {w:v.videoWidth,h:v.videoHeight,src:v.getAttribute('src'),time:v.currentTime,quality:v.getVideoPlaybackQuality?{total:v.getVideoPlaybackQuality().totalVideoFrames,dropped:v.getVideoPlaybackQuality().droppedVideoFrames}:null,fps:SpellClock.metrics()};});
 if(room>0)await p.screenshot({path:path.join(dir,w+'_room'+room+'.jpg'),type:'jpeg',quality:78});
 if(w===1440&&room===0){await p.locator('#spellInput').fill('texto inválido');await p.locator('#castButton').click();await p.waitForFunction('!document.querySelector("#castButton").disabled');assert.equal(await p.evaluate('SpellGame.state.lives'),6);}
 let i=0;while(!await p.evaluate('SpellGame.state.solved[SpellGame.state.currentRoom]')){
 await p.locator('#spellInput').fill(await p.evaluate('SpellNatural.example(SpellGame.currentPuzzle().solution,SpellGame.state.difficulty)'));
 await p.locator('#castButton').click();await p.waitForFunction('!document.querySelector("#castButton").disabled || SpellGame.state.solved[SpellGame.state.currentRoom]',{},{timeout:18000});i++;if(i>6)throw Error('Too many casts');}
 await p.waitForFunction('document.querySelector("#v9VictoryDialog").open || !document.querySelector("#v9VictoryFilm").hidden',{},{timeout:18000});
 if(await p.locator('#v9Skip').isVisible()){await p.waitForFunction('document.querySelector("#v9VictoryVideo").currentTime>0.15',{},{timeout:10000});await p.waitForTimeout(900);await p.screenshot({path:path.join(dir,w+'_film'+room+'.jpg'),type:'jpeg',quality:78});if(w!==1440)await p.locator('#v9Skip').click();}
 await p.waitForFunction('document.querySelector("#v9VictoryDialog").open',{},{timeout:20000});await p.waitForTimeout(500);
 assert.equal(await p.locator('#v9Solved').innerText(),'3/3');assert.equal(await p.locator(forbidden).count(),0);
 assert.equal(await p.evaluate('document.documentElement.scrollWidth>innerWidth'),false);
 await p.screenshot({path:path.join(dir,w+'_victory'+room+'.jpg'),type:'jpeg',quality:78});
 rooms.push({room,video,title:await p.locator('#v9VictoryTitle').innerText(),solved:await p.locator('#v9Solved').innerText(),lives:await p.locator('#v9Lives').innerText(),rewards:await p.evaluate('SpellRewardsV8.stats()')});
 await p.locator('#v9Continue').click();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(bad,[]);out.push({viewport:[w,h],rooms,errors,bad,mouseContinues:true});console.log(JSON.stringify(out.at(-1)));
 await p.close();
 }
 fs.writeFileSync(path.join(root,'pruebas','RESULTADOS_V9_NAVEGADOR.json'),JSON.stringify(out,null,2));await b.close();server.close();
})().catch(e=>{console.error(e.stack);server.close();process.exit(1)});