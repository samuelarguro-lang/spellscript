from pathlib import Path
from playwright.sync_api import sync_playwright
import json,time,math
root=Path(__file__).resolve().parents[1];out=root/'capturas_v7';fixture=(Path(__file__).resolve().parent/'fixture_visual_v7.html').read_text();res=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage']);
 for w,h in [(1440,900),(768,1024),(390,844),(360,800)]:
  p=b.new_page(viewport={'width':w,'height':h},reduced_motion='reduce');err=[];p.on('pageerror',lambda e:err.append(str(e)));p.set_content(fixture,wait_until='load');p.wait_for_timeout(250);assert p.evaluate('SpellGraphics.get()')=='full';assert p.evaluate('document.documentElement.scrollWidth')<=w
  if w!=1440:p.screenshot(path=str(out/f'{w}_menu.jpg'),full_page=True,quality=85)
  p.locator('[data-difficulty=facil]').first.click();p.locator('#startButton').click();p.locator('#tutorialSkip').click();p.wait_for_timeout(200);
  if p.locator('#v6Cinematic').is_visible():p.locator('#v6CinemaSkip').click()
  p.wait_for_timeout(350);assert p.evaluate('document.documentElement.scrollWidth')<=w
  p.locator('#aetherHelp').click();p.wait_for_timeout(150);assert p.locator('.v7-familiar').evaluate("e=>e.classList.contains('speaking')");m=p.locator('.v7-mouth').evaluate('(e)=>e.getAnimations().length');assert m>0
  p.screenshot(path=str(out/f'{w}_aether.jpg'),full_page=True,quality=85)
  p.locator('#audioButton').click();assert p.evaluate('SpellMusic.isEnabled()');p.locator('#spellInput').fill('mal conjuro');p.locator('#castButton').click();p.wait_for_timeout(1300);assert p.evaluate('SpellGame.state.lives')==6;assert 'CONSEJO' in p.locator('#aetherMood').inner_text();p.locator('#validationButton').click();p.wait_for_timeout(150);p.screenshot(path=str(out/f'{w}_afd.jpg'),full_page=True,quality=85);assert p.evaluate('document.documentElement.scrollWidth')<=w
  p.locator('[data-go=aventura]').first.click();p.wait_for_timeout(400)
  if w==1440:
   p.wait_for_timeout(3000);idle=p.evaluate('SpellClock.metrics()'); start=time.monotonic();i=0
   while time.monotonic()-start<3:p.mouse.move(650+math.sin(i*.3)*300,420+math.cos(i*.3)*200);p.wait_for_timeout(45);i+=1
   moving=p.evaluate('SpellClock.metrics()'); print('FPS no recording',idle,moving,flush=True)
  else:idle=moving=None
  p.locator('#settingsButton').click();p.locator('#graphicsMode').select_option('off');p.locator('#modalClose').click();assert p.evaluate("localStorage.getItem('spellscript-v7-graphics')")=='off'
  # All campaigns were already covered by node; complete easy through UI once.
  if w==1440:
   for room in range(3):
    assert p.evaluate('SpellGame.state.currentRoom')==room
    while not p.evaluate('SpellGame.state.solved[SpellGame.state.currentRoom]'):
     p.locator('#spellInput').fill(p.evaluate('SpellNatural.example(SpellGame.currentPuzzle().solution,SpellGame.state.difficulty)'));p.locator('#castButton').click();p.wait_for_timeout(220)
    p.wait_for_timeout(650)
    if room<2:p.locator('#nextRoomButton').click();p.wait_for_timeout(150)
   assert p.evaluate('SpellGame.state.solved.every(Boolean)');p.locator('[data-go=progreso]').first.click();p.wait_for_timeout(150);p.screenshot(path=str(out/'1440_progreso.jpg'),full_page=True,quality=85)
  assert not err,err;res.append({'viewport':[w,h],'noOverflow':True,'companionMouthAnimation':True,'automaticAdvice':True,'audioEnabled':True,'afd':True,'graphicsSaved':True,'uiCampaignComplete':w==1440,'idleFrameSample':idle,'movingFrameSample':moving,'errors':err});p.close();print(json.dumps(res[-1]),flush=True)
 b.close();(root/'pruebas/RESULTADOS_VISUALES_V7.json').write_text(json.dumps(res,indent=2))
