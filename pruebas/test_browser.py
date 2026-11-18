from playwright.sync_api import sync_playwright
from pathlib import Path
import json,base64,re
ROOT=Path(__file__).resolve().parents[1]
def load_page(page):
 html=(ROOT/'index.html').read_text(encoding='utf8')
 css=(ROOT/'css/styles.css').read_text(encoding='utf8')
 for name in ['torreon_arcano.webp','puerta_helada.webp']:
  imageb64=base64.b64encode((ROOT/'assets'/name).read_bytes()).decode()
  css=css.replace("url('../assets/"+name+"')","url('data:image/webp;base64,"+imageb64+"')")
 html=html.replace('<link rel="stylesheet" href="css/styles.css" />','<style>'+css+'</style>')
 html=re.sub(r'<script src="js/[^"]+"></script>','',html)
 page.set_content(html,wait_until='load')
 for name in ['data.js','afd.js','game.js','app.js']:
  page.add_script_tag(content=(ROOT/'js'/name).read_text(encoding='utf8'))
report={'screenshots':[],'errors':[],'checks':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':900},device_scale_factor=1)
 page=context.new_page()
 page.on('pageerror', lambda e: report['errors'].append(str(e)))
 load_page(page)
 page.wait_for_timeout(350)
 def shot(name):
  target=ROOT/'pruebas'/name
  page.screenshot(path=str(target),full_page=True,animations='disabled')
  report['screenshots'].append(str(target.name))
 shot('01_inicio.png')
 page.get_by_role('button',name='Comenzar aventura').click()
 page.wait_for_timeout(200)
 shot('02_puerta_helada.png')
 page.get_by_role('button',name='Grimorio').last.click()
 page.wait_for_timeout(200)
 shot('03_grimorio.png')
 page.locator('#returnFromGrimoire').click()
 page.locator('#spellInput').fill('¡Aethra Ignus, despierta en el segundo círculo y rompe el sello!')
 page.locator('#castButton').click()
 assert 'Pierdes 1 PV' in page.locator('#spellStatus').inner_text()
 assert page.locator('#roomHearts').get_attribute('aria-label')=='4 de 5 puntos de vida'
 report['checks'].append('Error sintáctico: -1 PV')
 page.locator('#validationButton').click()
 shot('04_validacion_rechazo.png')
 assert 'RECHAZA' in page.locator('#validationReport').inner_text()
 page.locator('[data-go="aventura"]').first.click()
 page.locator('#spellInput').fill('¡Aethra Ignis, despierta en el tercer círculo y rompe el sello!')
 page.locator('#castButton').click()
 assert 'Pierdes 2 PV' in page.locator('#spellStatus').inner_text()
 assert page.locator('#roomHearts').get_attribute('aria-label')=='2 de 5 puntos de vida'
 report['checks'].append('Conjuro bien formado pero equivocado: -2 PV')
 page.locator('#spellInput').fill('   ')
 page.locator('#castButton').click()
 assert page.locator('#roomHearts').get_attribute('aria-label')=='2 de 5 puntos de vida'
 report['checks'].append('Entrada vacía: no descuenta PV')
 page.locator('#spellInput').fill('¡Aethra Ignis, despierta en el segundo círculo y rompe el sello!')
 page.locator('#castButton').click()
 assert page.locator('#roomSuccess').is_visible()
 assert page.locator('#roomHearts').get_attribute('aria-label')=='2 de 5 puntos de vida'
 report['checks'].append('Conjuro correcto: abre puerta sin descuento')
 page.locator('#validationButton').click()
 shot('05_validacion_aceptada.png')
 assert 'ACEPTA' in page.locator('#validationReport').inner_text()
 transition_rows=page.locator('.trace-row').count()
 assert transition_rows>50
 report['checks'].append(f'Recorrido AFD muestra {transition_rows} transiciones por carácter')
 page.locator('#continueFromValidation').click()
 shot('06_progreso.png')
 assert '1 de 3 habitaciones' in page.locator('#progressText').inner_text()
 report['checks'].append('Progreso tras primera habitación: 1 de 3')
 state=page.evaluate('''() => {
  const d=window.SpellData, afd=window.SpellAFD;
  let acc=d.spells.filter(s=>afd.run(s.text).accepted);
  let disagree=d.spells.filter(s=>afd.run(s.text).accepted!==afd.run(s.text).byRegex);
  let bad=['¡Aethra Ignus, despierta en el segundo círculo y rompe el sello!',
    '¡Aethra Ignis, despierta en el segundo circulo y rompe el sello!',
    '¡Aethra Ignis, despierta en el segundo círculo y rompe el sello',
    '¡Aethra Ignis,  despierta en el segundo círculo y rompe el sello!'];
  return {spellCount:d.spells.length,accepted:acc.length,difference:disagree.length,invalidRejected:bad.every(s=>!afd.run(s).accepted),states:afd.states.length};
 }''')
 assert state['spellCount']==state['accepted']==27 and state['difference']==0 and state['invalidRejected']
 report['dfa']=state
 report['checks'].append('Las 27 frases del lenguaje son aceptadas; ejemplos inválidos rechazados')
 # reinicio automático por agotamiento
 page.locator('#settingsButton').click(); page.locator('#resetGameButton').click()
 page.locator('#startButton').click()
 invalid='¡Aethra Ignus, despierta en el segundo círculo y rompe el sello!'
 for i in range(5):
  page.locator('#spellInput').fill(invalid); page.locator('#castButton').click()
 assert not page.locator('#modalBackdrop').is_hidden()
 assert page.locator('#roomHearts').get_attribute('aria-label')=='5 de 5 puntos de vida'
 report['checks'].append('Agotamiento de los 5 PV: reinicio de la sala')
 page.locator('#modalOk').click()
 desktop_overflow=page.evaluate('document.documentElement.scrollWidth > window.innerWidth')
 report['desktopHorizontalOverflow']=desktop_overflow
 # Mobile visual review
 mobile=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
 m=mobile.new_page();m.on('pageerror',lambda e: report['errors'].append('mobile:'+str(e)))
 load_page(m);m.wait_for_timeout(200)
 m.screenshot(path=str(ROOT/'pruebas'/'07_movil_inicio.png'),full_page=True,animations='disabled')
 m.locator('#startButton').click()
 m.screenshot(path=str(ROOT/'pruebas'/'08_movil_sala.png'),full_page=True,animations='disabled')
 report['mobileHorizontalOverflow']=m.evaluate('document.documentElement.scrollWidth > window.innerWidth')
 report['mobileScrollWidth']=m.evaluate('document.documentElement.scrollWidth')
 report['mobileInnerWidth']=m.evaluate('window.innerWidth')
 mobile.close();browser.close()
(ROOT/'pruebas'/'resultado_pruebas.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False,indent=2))
