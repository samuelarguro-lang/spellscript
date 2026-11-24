from pathlib import Path
from playwright.sync_api import sync_playwright
import json, time, math, base64, sys, subprocess
root=Path(__file__).resolve().parents[1];out=root/'capturas_v7';fixture=(Path(__file__).resolve().parent/'fixture_visual_v7.html').read_text();scene=sys.argv[1];frames=out/('frames_'+scene);frames.mkdir(exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage']);p=b.new_page(viewport={'width':1440,'height':900},device_scale_factor=1,reduced_motion='reduce');errors=[];p.on('pageerror',lambda e:errors.append(str(e)));p.set_content(fixture,wait_until='load');p.wait_for_timeout(500);assert p.evaluate('SpellGraphics.get()')=='full';
 if scene!='menu':
  p.locator('[data-difficulty=facil]').first.click();p.locator('#startButton').click();p.locator('#tutorialSkip').click();p.wait_for_timeout(250)
  if p.locator('#v6Cinematic').is_visible():p.locator('#v6CinemaSkip').click()
  # Navigate through earlier rooms with original motor; no fabricated puzzle state.
  for i in range({'hielo':0,'fuego':1,'niebla':2}[scene]):
   p.evaluate('''()=>{while(!SpellGame.state.solved[SpellGame.state.currentRoom]){SpellGame.cast(SpellNatural.example(SpellGame.currentPuzzle().solution,SpellGame.state.difficulty));}SpellGame.nextRoom();SpellUI.renderRoom();}''')
  p.wait_for_timeout(500)
  assert p.evaluate('SpellGame.state.currentRoom')=={'hielo':0,'fuego':1,'niebla':2}[scene]
 p.screenshot(path=str(out/f'1440_{scene}.jpg'),full_page=True,quality=90)
 target='.v7-home-orbit' if scene=='menu' else '.v7-ice-seal i' if scene=='hielo' else '.v7-guardian' if scene=='fuego' else '.v7-astral-ring'
 # Continuous animation timeline and canvas pixel motion; capture before, stationary, and pointer movement.
 prop=lambda: p.locator(target).first.evaluate('(e)=>({time:e.getAnimations()[0]?.currentTime,style:getComputedStyle(e).transform})')
 start=prop();t0=p.evaluate('SpellClock.time()');p.wait_for_timeout(1300);stationary=prop();assert stationary['time']>start['time']+500,(start,stationary)
 c=p.context.new_cdp_session(p);log=[];stamps=[];capture_start=time.monotonic()
 def frame(evt):
  c.send('Page.screencastFrameAck',{'sessionId':evt['sessionId']}); name=frames/f'{len(log):05d}.jpg';name.write_bytes(base64.b64decode(evt['data']));log.append(name);stamps.append(evt.get('metadata',{}).get('timestamp',time.time()))
 c.on('Page.screencastFrame',frame);c.send('Page.startScreencast',{'format':'jpeg','quality':70,'maxWidth':1120,'maxHeight':700,'everyNthFrame':2})
 # 6 seconds still + 8 seconds active pointer + 6 seconds still/typing (20s total)
 p.wait_for_timeout(6000);a=prop();
 start_move=time.monotonic()
 i=0
 while time.monotonic()-start_move<8:
  p.mouse.move(730+math.sin(i*.22)*450,400+math.cos(i*.19)*250);p.wait_for_timeout(65);i+=1
 z=prop();assert z['time']>a['time']+4000,(a,z)
 if scene!='menu':
  # Cast a genuinely correct spell with full effects; record impact and recovery.
  p.locator('#spellInput').fill(p.evaluate('SpellNatural.example(SpellGame.currentPuzzle().solution,SpellGame.state.difficulty)'))
  p.locator('#castButton').click();p.wait_for_timeout(1000);p.screenshot(path=str(out/f'1440_{scene}_carga.jpg'),quality=85);p.wait_for_timeout(550);p.screenshot(path=str(out/f'1440_{scene}_impacto.jpg'),quality=85);p.wait_for_timeout(4500);assert p.evaluate('SpellGame.state.progress[SpellGame.state.currentRoom]')==1;assert p.locator('#castButton').is_enabled()
 else:p.wait_for_timeout(6000)
 c.send('Page.stopScreencast');finish=prop();metric=p.evaluate('SpellClock.metrics()');assert finish['time']>z['time']+3000,(z,finish)
 result={'scene':scene,'defaultFullEvenSystemReduced':True,'stationaryAnimationMs':stationary['time']-start['time'],'pointerAnimationMs':z['time']-a['time'],'afterPointerMs':finish['time']-z['time'],'clockElapsed':p.evaluate('SpellClock.time()')-t0,'captureFrames':len(log),'headlessSample':metric,'horizontalOverflow':p.evaluate('document.documentElement.scrollWidth')>1440,'jsErrors':errors};assert not errors,errors;assert not result['horizontalOverflow'];print(json.dumps(result,indent=2),flush=True);(root/'pruebas'/f'V7_{scene}_visual.json').write_text(json.dumps(result,indent=2));b.close()
 if len(log)>1:
  f=frames/'concat.txt';f.write_text(''.join(f"file '{n.name}'\nduration {max(.025,min(.35,stamps[i+1]-stamps[i])):.5f}\n" for i,n in enumerate(log[:-1]))+f"file '{log[-1].name}'\n");subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(f),'-vf','fps=24,scale=1120:-2','-c:v','libx264','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart',str(out/f'{scene}_movimiento.mp4')],check=True)
