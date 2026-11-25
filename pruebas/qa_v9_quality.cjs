const {chromium}=require('/usr/local/lib/node_modules/playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{const file=path.join(root,new URL(req.url,'http://localhost').pathname==='/'?'index.html':decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}const size=fs.statSync(file).size;res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');if(req.headers.range){const m=req.headers.range.match(/bytes=(\d+)-(\d*)/);if(m){const a=Number(m[1]),b=m[2]?Math.min(Number(m[2]),size-1):size-1;res.writeHead(206,{'Content-Range':`bytes ${a}-${b}/${size}`,'Content-Length':b-a+1});fs.createReadStream(file,{start:a,end:b}).pipe(res);return;}}res.setHeader('Content-Length',size);fs.createReadStream(file).pipe(res);});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/';
 const b=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage({viewport:{width:768,height:1024}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(url,{waitUntil:'load'});
 await p.waitForFunction('SpellVideoBackgrounds.active()?.currentTime>0.1');
 await p.locator('#settingsButton').click();assert(await p.locator('#v9VideoQuality').isVisible());
 await p.locator('#v9VideoQuality').selectOption('low');await p.waitForFunction('!SpellVideoBackgrounds.active()');
 await p.locator('#v9VideoQuality').selectOption('high');await p.waitForFunction('SpellVideoBackgrounds.active()?.videoWidth===1280');
 await p.locator('#graphicsMode').selectOption('off');await p.waitForFunction('!SpellVideoBackgrounds.active()');
 await p.locator('#graphicsMode').selectOption('full');await p.waitForFunction('SpellVideoBackgrounds.active()?.currentTime>0.1');
 await p.locator('#modalClose').click();await p.reload({waitUntil:'load'});assert.equal(await p.evaluate('SpellVideoQuality.get()'),'high');
 await p.waitForFunction('SpellVideoBackgrounds.active()?.currentTime>0.1');assert.equal(await p.evaluate('document.documentElement.scrollWidth>innerWidth'),false);
 await p.locator('[data-difficulty=facil]').first().click();await p.locator('#startButton').click();if(await p.locator('#tutorialBackdrop').isVisible())await p.locator('#tutorialSkip').click();if(await p.locator('#v6Cinematic').isVisible())await p.locator('#v6CinemaSkip').click();
 await p.waitForFunction('SpellVideoBackgrounds.active()?.videoHeight===834');
 await p.waitForFunction('SpellAudioMix.playing()');await p.waitForTimeout(1000);assert((await p.evaluate('SpellAudioMix.current().volume()'))>.1);
 await p.screenshot({path:path.join(root,'capturas_v9','768_tablet.jpg'),type:'jpeg',quality:78,fullPage:true});
 await p.evaluate(()=>SpellGraphics.set('off'));
 while(!await p.evaluate('SpellGame.state.solved[0]')){await p.locator('#spellInput').fill(await p.evaluate('SpellNatural.example(SpellGame.currentPuzzle().solution,SpellGame.state.difficulty)'));await p.locator('#castButton').click();await p.waitForFunction('!document.querySelector("#castButton").disabled || SpellGame.state.solved[0]');}
 await p.waitForFunction('document.querySelector("#v9VictoryDialog").open');await p.locator('#v9Close').click();await p.reload({waitUntil:'load'});assert(await p.evaluate('SpellGame.state.solved[0]'));assert.equal(await p.evaluate('SpellRewardsV8.stats().runes[0]'),true);
 await p.locator('#startButton').click();assert.equal(await p.locator('#v9VictoryDialog').evaluate(e=>e.open),false);assert(await p.locator('#nextRoomButton').isVisible());
 assert.deepEqual(errors,[]);const out={tablet:[768,1024],qualitySwitch:true,graphicsSwitch:true,music:true,persistence:true,wonRoomNotReplayed:true,errors};console.log(JSON.stringify(out));fs.writeFileSync(path.join(root,'pruebas','RESULTADOS_V9_CALIDAD.json'),JSON.stringify(out,null,2));await b.close();server.close();
})().catch(e=>{console.error(e.stack);server.close();process.exit(1)});