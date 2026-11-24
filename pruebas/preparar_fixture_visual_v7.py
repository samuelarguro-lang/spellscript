from pathlib import Path
import base64,mimetypes,re,json
root=Path(__file__).resolve().parents[1]
assets={str(p.relative_to(root)): 'data:'+mimetypes.guess_type(p.name)[0]+';base64,'+base64.b64encode(p.read_bytes()).decode() for p in (root/'assets').rglob('*') if p.is_file()}
def inline(s):
 return re.sub(r'(?:\.\./)?assets/[\w./-]+\.(?:webp|svg|png|jpg)',lambda m:assets.get(m.group().removeprefix('../'),m.group()),s)
s=(root/'index.html').read_text();s=inline(s)
s=re.sub(r'<link rel="stylesheet" href="([^"]+)"\s*/>',lambda m:'<style>'+inline((root/m[1]).read_text())+'</style>',s)
def script(m):
 t=(root/m[1]).read_text();t=t.replace("src=\"assets/scenes/'+path+'/architecture.webp\"", "src=\"'+window.__assets['assets/scenes/'+path+'/architecture.webp']+'\"") if m[1].endswith('sceneManager.js') else t
 t=t.replace("'url(\"assets/scenes/'+s.asset+'/architecture.webp\")'", "'url(\"'+window.__assets['assets/scenes/'+s.asset+'/architecture.webp']+'\")'") if m[1].endswith('cinematicManager.js') else t
 # avoid doubling images in the code by replacing static names with data URLs
 return '<script>'+inline(t)+'</script>'
s=re.sub(r'<script src="([^"]+)"></script>',script,s)
# Local storage shim for about:blank; persistent state verified separately by original suites.
s=s.replace('<head>','<head><script>window.__assets='+json.dumps(assets)+';window.__store=window.__store||{};Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>window.__store[k]??null,setItem:(k,v)=>window.__store[k]=String(v),removeItem:k=>delete window.__store[k]}});</script>',1)
(Path(__file__).resolve().parent/'fixture_visual_v7.html').write_text(s)
