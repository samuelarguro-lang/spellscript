/* Aether: asistencia contextual en la aventura y progreso lúdico persistente. */
(function(){'use strict';const D=window.SpellData,N=window.SpellNatural,L=window.SpellLearningProgress;const KEY='spellscript-v5-journey';
 const fresh=()=>({xp:0,awards:{},streak:0,best:0,corrections:0,failures:{},runes:{}});let record=fresh();try{const a=JSON.parse(localStorage.getItem(KEY)||'null');if(a&&typeof a.xp==='number')record={...fresh(),...a};}catch(_){}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(record));}catch(_){}}
 const rank=()=>record.xp>=900?'Archimago':record.xp>=450?'Hechicero':record.xp>=180?'Invocador':'Aprendiz';
 const threshold=mode=>mode==='facil'?1:mode==='normal'?3:5;
 function consume(result,puzzle,mode){if(!result?.dfa||!puzzle)return null;const id=puzzle.id,old=record.failures[id]||{count:0,last:'',same:0};let analysis=result.dfa.natural?N.analyze(result.dfa):{category:result.dfa.accepted?null:'orden-palabras',skill:'estructura',message:'Consulta las fórmulas del grimorio.'};
  // Solo se cuentan errores de escritura como tales. Una decisión mágica equivocada no es gramática.
  L.record({id:'adventure:'+id,room:result.roomIndex,skill:analysis.skill},{accepted:result.dfa.accepted,category:analysis.category,warningOnly:false});
  if(result.kind==='correct'){if(old.count){record.corrections++;}delete record.failures[id];record.streak++;record.best=Math.max(record.streak,record.best);let gain=0;if(!record.awards[id]){gain=60+(result.completedRoom?40:0);record.xp+=gain;record.awards[id]=true;}save();return {kind:'success',show:mode!=='dificil'||result.completedRoom,message:old.count?'¡Eso es! Has corregido tu magia y vencido el sello.':'¡Excelente! Tus palabras han hecho su trabajo.',gain};}
  record.streak=0;const cat=result.kind==='wrong-choice'?'eleccion':analysis.category;const count=old.count+1;const same=old.last===cat?old.same+1:1;record.failures[id]={count,last:cat,same};save();
  let message=result.kind==='wrong-choice'?'La frase es válida, pero el poder, la fuerza o el objetivo no coincide con la pista.':analysis.message;
  if(mode==='facil'&&result.kind==='wrong-choice'){const s=puzzle.solution,sp=result.dfa.spell;message=sp.invocation!==s.invocation?'Revisa el elemento: ¿qué poder puede vencer este obstáculo?':sp.circle!==s.circle?'El elemento es adecuado; revisa la intensidad que indica el acertijo.':'El elemento y la fuerza encajan, pero la acción no cumple la misión.';}
  const recent=L.getAttempts().filter(x=>!x.accepted&&x.category===analysis.category);const recurrent=analysis.category&&new Set(recent.map(x=>x.id)).size>=3;
  if(recurrent&&mode!=='dificil')message='He visto esta dificultad en varios retos. '+message;
  const show=L.enabled()&&(count>=threshold(mode)||Boolean(recurrent&&mode!=='dificil'));
  return {kind:'error',show,message:mode==='dificil'?'El recorrido contiene la pista. Revisa la transición que no pudo realizarse y la misión.':message,count,same,recurrent,guide:show&&mode==='facil'&&count>=2,suggestion:mode==='facil'?analysis.suggestion:null};
 }
 function inspect(puzzle,room){const k=puzzle.id;if(!record.runes[k]){record.runes[k]=true;save();}return room===0?'El cristal guarda una pista sobre el elemento o la intensidad.':room===1?'El guardián revela una debilidad. Observa el texto del enigma.':'Una inscripción aparece al disiparse la bruma.';}
 function help(puzzle,mode){L.recordHelp({id:'adventure:'+puzzle.id});return puzzle.hints[mode].replace(/Aethra Ignis/g,'fuego').replace(/Nivara Glacies/g,'hielo').replace(/Zephira Ventus/g,'viento').replace(/(?:del|en el|con el) primer círculo/g,'con fuerza leve').replace(/(?:del|en el|con el) segundo círculo/g,'con fuerza media').replace(/(?:del|en el|con el) tercer círculo/g,'con fuerza máxima').replace(/primer círculo/g,'fuerza leve').replace(/segundo círculo/g,'fuerza media').replace(/tercer círculo/g,'fuerza máxima');}
 window.SpellAdventureTutor={consume,inspect,help,rank,stats:()=>({...record,unlocked:Object.keys(record.awards).length,discovered:Object.keys(record.runes).length}),threshold};
})();
