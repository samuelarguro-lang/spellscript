/* AFD educativo por carácter. Los signos obligatorios son símbolos del alfabeto.
   Los acentos y mayúsculas se normalizan según la configuración pedagógica. */
(function(){
 'use strict';
 const rules=window.SpellWritingRules;
 const cache=new Map();
 function compile(exercise){
  const states=[{edges:new Map(),final:false,prefix:''}];
  for(const answer of exercise.answers){let s=0;
   for(const symbol of [...rules.normalize(answer)]){
    if(!states[s].edges.has(symbol)){
     const next=states.length;
     states[s].edges.set(symbol,next);
     states.push({edges:new Map(),final:false,prefix:states[s].prefix+symbol});
    }
    s=states[s].edges.get(symbol);
   }
   states[s].final=true;
  }
  return states;
 }
 function run(id,raw){
  const exercise=typeof id==='string'?rules.get(id):id;
  if(!exercise)return null;
  if(!cache.has(exercise.id))cache.set(exercise.id,compile(exercise));
  const states=cache.get(exercise.id), normalized=rules.normalize(raw);
  let s=0,firstError=null;
  const trace=[];
  [...normalized].forEach((symbol,i)=>{
    const old=s;
    const expected=old===-1?[]:[...states[old].edges.keys()];
    s=old===-1?-1:(states[old].edges.has(symbol)?states[old].edges.get(symbol):-1);
    if(s===-1&&!firstError)firstError={kind:'invalid-symbol',index:i+1,symbol,expected};
    trace.push({position:i+1,symbol,from:old===-1?'q⊥':'q'+old,to:s===-1?'q⊥':'q'+s,rejected:s===-1,expected});
  });
  const accepted=s!==-1&&states[s].final;
  if(!accepted&&!firstError)firstError={kind:'incomplete',index:trace.length+1,symbol:'fin de cadena',expected:[...states[s].edges.keys()]};
  return {accepted,trace,firstError,endState:s===-1?'q⊥':'q'+s,normalized,wasNormalized:normalized!==String(raw??'').trim(),statesCount:states.length,exerciseId:exercise.id,byRegex:exercise.answers.some(a=>rules.normalize(a)===normalized),spell:null,expectedText:exercise.answer};
 }
 window.SpellEducationalAFD={run,compile,getStates:id=>{const ex=rules.get(id);return ex?(cache.get(id)||compile(ex)):[];}};
})();
