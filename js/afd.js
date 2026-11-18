/* AFD por carácter sobre la forma canónica de los 27 conjuros. */
(function(){
 'use strict';
 const {spells,normalize,pattern}=window.SpellData;
 const states=[{edges:new Map(),final:false}];
 const acceptedSpells=new Map();
 for(const spell of spells){
  const normalized=normalize(spell.text);
  let s=0;
  for(const char of [...normalized]){
   if(!states[s].edges.has(char)) {const next=states.length;states[s].edges.set(char,next);states.push({edges:new Map(),final:false});}
   s=states[s].edges.get(char);
  }
  states[s].final=true;
  acceptedSpells.set(normalized,spell);
 }
 function run(raw){
  const normalized=normalize(raw);
  let s=0,firstError=null;
  const trace=[];
  for(const [i,char] of [...normalized].entries()){
   const dest=s===-1?-1:(states[s].edges.has(char)?states[s].edges.get(char):-1);
   if(dest===-1&&!firstError)firstError={kind:'invalid-symbol',index:i+1,symbol:char,expected:s>=0?[...states[s].edges.keys()]:[]};
   trace.push({position:i+1,symbol:char,from:s===-1?'q⊥':'q'+s,to:dest===-1?'q⊥':'q'+dest,rejected:dest===-1});
   s=dest;
  }
  const accepted=s>=0&&states[s].final;
  if(!accepted&&!firstError)firstError={kind:'incomplete',index:[...normalized].length+1,symbol:'fin de cadena',expected:s>=0?[...states[s].edges.keys()]:[]};
  return {accepted,trace,firstError,endState:s===-1?'q⊥':'q'+s,spell:accepted?acceptedSpells.get(normalized):null,byRegex:pattern.test(normalized),normalized,wasNormalized:normalized!==String(raw??'').trim()};
 }
 window.SpellAFD=Object.freeze({states,run,validSpells:acceptedSpells.size});
})();
