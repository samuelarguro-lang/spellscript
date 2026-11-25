(function(){'use strict';const key='spellscript-v9-video-quality';let mode='auto';try{const v=localStorage.getItem(key);if(['auto','high','medium','low'].includes(v))mode=v;}catch(_){}
const get=()=>mode;function set(v){if(!['auto','high','medium','low'].includes(v))return;mode=v;try{localStorage.setItem(key,v);}catch(_){}document.dispatchEvent(new Event('spellvideoquality'));}
function source(name){if(mode==='low')return null;const useHigh=mode==='high'||(mode==='auto'&&(window.innerWidth>720||devicePixelRatio>1.3));return 'assets/loops/'+(useHigh?'high/':'medium/')+name+'.mp4';}
window.SpellVideoQuality={get,set,source};
})();
