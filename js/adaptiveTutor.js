/* Tutor adaptativo basado en contadores verificables, sin IA ni servicios externos. */
(function(){
 'use strict';
 const L=window.SpellLearningProgress;
 const R=window.SpellWritingRules;
 const TIP={
  'coma-omitida':{skill:'puntuación',msg:'Has omitido comas obligatorias en varios ejercicios. Practiquemos cómo separar una condición inicial o un vocativo.'},
  'puntuacion':{skill:'puntuación',msg:'Conviene reforzar el uso de los signos de puntuación en expresiones formales.'},
  'conector-omitido':{skill:'conectores',msg:'En varias expresiones faltaron conectores. Practiquemos cómo unir ideas con «porque», «aunque» o «por eso».'},
  'conector-incorrecto':{skill:'conectores',msg:'Has confundido conectores en varias prácticas. Revisemos si cada oración expresa causa, contraste o consecuencia.'},
  'orden-palabras':{skill:'estructura',msg:'El orden de las palabras ha causado dificultades en distintas actividades. Practiquemos sujeto, verbo y complementos.'},
  'palabras-omitidas':{skill:'estructura',msg:'Varios ejercicios quedaron incompletos. Revisemos qué elementos necesita una expresión.'}
 };
 const CONFIG=Object.freeze({minAttempts:5,minErrors:3,minDistinctExercises:3,recentWindow:20,recentSuccesses:3,noticeInterval:4});
 function overview(){
  const all=L.getAttempts();const recent=all.slice(-CONFIG.recentWindow);
  const results=[];
  for(const [category,info] of Object.entries(TIP)){
   const matching=recent.filter(e=>!e.accepted&&e.category===category);
   const unique=new Set(matching.map(e=>e.id));
   if(recent.length>=CONFIG.minAttempts&&matching.length>=CONFIG.minErrors&&unique.size>=CONFIG.minDistinctExercises){
    const latest=recent.filter(e=>e.skill===info.skill).slice(-CONFIG.recentSuccesses);
    const improvement=latest.length===CONFIG.recentSuccesses&&latest.every(e=>e.accepted)&&matching.some(e=>e.t<=latest[0].t);
    results.push({category,skill:info.skill,count:matching.length,unique:unique.size,recommendation:improvement?'¡Buen progreso reciente! Tus tres últimas prácticas de esta habilidad fueron correctas. Sigue consolidándola.':info.msg,improvement,exercise:R.bySkill(info.skill).find(e=>!all.some(a=>a.id===e.id&&a.accepted))?.id||R.bySkill(info.skill)[0]?.id});
   }
  }
  return results.sort((a,b)=>b.count-a.count);
 }
 function contextual(ex,analysis){
  if(!ex||!analysis)return '';
  if(analysis.accepted)return analysis.warningOnly?'El AFD aceptó la expresión normalizada. La sugerencia ortográfica no modifica el resultado.':'¡Bien! El AFD aceptó la expresión. Observa el estado final y las transiciones recorridas.';
  return `El AFD detuvo el reconocimiento porque la expresión no sigue su patrón. ${analysis.message} ${analysis.advice}`;
 }
 function recommendation(){if(!L.enabled())return null;const top=overview()[0];if(!top)return null;
  const count=L.getAttempts().length;
  if(!L.shouldShowNotice(top.category,count,CONFIG.noticeInterval))return null;
  L.markNotice(top.category,count);
  return top;
 }
 window.SpellAdaptiveTutor={overview,contextual,recommendation,CONFIG};
})();
