/* Música ORIGINAL, sintetizada en el navegador: sin pistas externas ni descargas.
   Música ambiental discreta, independiente de los efectos de lanzamiento. */
(function(){
 'use strict';
 let context=null,master=null,enabled=false,volume=.25,theme='inicio',timer=null,nextTime=0;
 let active=[];
 const themes={
  inicio:{bass:130.81,notes:[261.63,392,329.63,293.66,349.23,329.63],wave:'sine',color:1600},
  hielo:{bass:146.83,notes:[293.66,349.23,440,392,349.23,261.63],wave:'sine',color:2400},
  fuego:{bass:110.00,notes:[220,261.63,329.63,293.66,246.94,220],wave:'triangle',color:950},
  niebla:{bass:174.61,notes:[349.23,523.25,440,392,523.25,587.33],wave:'sine',color:1900}
 };
 function init(){
  if(context)return true;
  const C=window.AudioContext||window.webkitAudioContext;
  if(!C)return false;
  context=new C();master=context.createGain();master.gain.value=volume*0.42;master.connect(context.destination);return true;
 }
 function stopNotes(){for(const node of active){try{node.osc.stop(Math.min(context.currentTime+.18,node.stopTime));}catch(e){}try{node.gain.gain.setTargetAtTime(0,context.currentTime,.08);}catch(e){}}active=[];}
 function note(freq,when,duration,amplitude,type='sine',cutoff=1600,pan=0){
  if(!context||!master)return;
  const osc=context.createOscillator(),gain=context.createGain(),filter=context.createBiquadFilter();
  const panner=context.createStereoPanner?context.createStereoPanner():null;
  osc.type=type;osc.frequency.value=freq;
  filter.type='lowpass';filter.frequency.value=cutoff;
  gain.gain.setValueAtTime(.0001,when);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002,amplitude),when+Math.min(.8,duration*.3));
  gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
  osc.connect(filter);filter.connect(gain);
  if(panner){panner.pan.value=pan;gain.connect(panner);panner.connect(master);}else gain.connect(master);
  osc.start(when);osc.stop(when+duration+.05);active.push({osc,gain,stopTime:when+duration+.05});
 }
 function schedule(){
  if(!enabled||!context)return;
  const t=themes[theme]||themes.inicio;
  // 12 s de ambiente en cada iteración; las ondas son deliberadamente suaves.
  const start=Math.max(nextTime,context.currentTime+.05);
  note(t.bass,start,11.7,.045,'sine',650,-.3);
  note(t.bass*1.5,start+.5,10.6,.026,'sine',450,.3);
  t.notes.forEach((frequency,i)=>{
   const startNote=start+i*1.84;
   note(frequency,startNote,3.2,.036,t.wave,t.color,i%2===0?-.26:.26);
   if(i%3===0)note(frequency*2,startNote+.21,1.7,.012,'sine',2800,.47);
  });
  nextTime=start+11.3;
  active=active.filter(n=>n.stopTime>context.currentTime);
 }
 function enable(){
  if(!init())return false;
  context.resume().catch(()=>{});enabled=true;nextTime=context.currentTime+.05;
  schedule();if(timer)clearInterval(timer);timer=setInterval(()=>{if(enabled&&context.currentTime+4>nextTime)schedule();},900);
  return true;
 }
 function disable(){enabled=false;if(timer)clearInterval(timer);timer=null;if(context)stopNotes();}
 function toggle(){if(enabled){disable();return false;}return enable();}
 function setTheme(value){const next=themes[value]?value:'inicio';if(theme===next)return;theme=next;if(enabled&&context){stopNotes();nextTime=context.currentTime+.15;schedule();}}
 function setVolume(next){volume=Math.max(0,Math.min(1,Number(next)||0));if(master&&context)master.gain.setTargetAtTime(volume*.42,context.currentTime,.04);}
 function spell(kind,element){
  if(!enabled||!context)return;
  const base=element==='fuego'?660:element==='hielo'?820:490;
  const now=context.currentTime+.01;
  if(kind==='correct'){
   note(base,now,.6,.17,'sine',3800,-.6);
   note(base*1.5,now+.16,.95,.14,'sine',4200,.6);
   note(base*2,now+.34,1.25,.09,'sine',3000,0);
  }else{
   note(188,now,.3,.08,'triangle',850,-.25);
   note(137,now+.13,.45,.07,'triangle',700,.25);
  }
 }
 document.addEventListener('visibilitychange',()=>{
  if(!context)return;
  if(document.hidden)context.suspend().catch(()=>{});
  else if(enabled)context.resume().catch(()=>{});
 });
 window.SpellMusic={toggle,enable,disable,setTheme,setVolume,spell,isEnabled:()=>enabled,getVolume:()=>volume};
})();
