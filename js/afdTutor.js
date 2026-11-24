/* Tutor contextual integrado en el AFD; consume datos reales del recorrido. */
(function(){
 'use strict';
 function getStateEdges(dfa,source){
  if(dfa.natural)return window.SpellNatural.automata[dfa.mode].states;
  if(source==='educational'){
   const states=window.SpellEducationalAFD.getStates(dfa.exerciseId);
   return states;
  }
  return window.SpellAFD.states;
 }
 function explainStep(result,index){
  const dfa=result?.dfa;
  if(!dfa)return {heading:'Aún no hay una expresión',message:'Escribe una expresión y ejecuta el reconocimiento para observar sus estados.'};
  if(index===0)return {heading:'Estado inicial q0',message:'Todavía no se ha leído ningún carácter. El autómata parte de q0, y cada símbolo determinará una transición.'};
  const step=dfa.trace[index-1];if(!step)return {heading:'Sin transiciones',message:'No hay símbolos para recorrer.'};
  const source=result.educational?'educational':'classic';
  const edges=getStateEdges(dfa,source);const from=step.from==='q⊥'?-1:Number(step.from.slice(1));
  const expected=from===-1?[]:[...(edges[from]?.edges?.keys()||[])];
  const readable=x=>x===' '?'un espacio':x===','?'una coma':x===';'?'un punto y coma':x==='.'?'un punto':`«${x}»`;
  const symbol=readable(step.symbol);
  if(step.rejected){
   const options=expected.length?expected.slice(0,8).map(readable).join(', '):'ningún símbolo adicional';
   return {heading:`Rechazo en el carácter ${step.position}`,message:step.from==='q⊥'
    ?'El autómata ya se encontraba en el estado sumidero q⊥. Una vez allí, todas las transiciones permanecen en rechazo.'
    :`Desde ${step.from}, el AFD recibió ${symbol}, pero esperaba ${options}. Por eso avanzó a q⊥.`,expected};
  }
  const final=step.position===dfa.trace.length&&dfa.accepted;
  let segment='estructura de la expresión';
  if(dfa.natural){segment=window.SpellNatural.segment(dfa).find(m=>m.end>=step.position)?.label||'expresión';}
  else if(!result.educational){const wordCount=dfa.normalized.slice(0,step.position).split(/\s+/).length;
   segment=wordCount<=2?'invocación':wordCount<=5?'fórmula fija':wordCount<=8?'círculo': 'acción del conjuro';
  }else segment=result.exercise?.skill||'ejercicio';
  return {heading:final?'Estado de aceptación':`Transición ${step.position}: ${step.from} → ${step.to}`,
   message:`El autómata leyó ${symbol} en ${step.from} y pasó a ${step.to}. Este carácter continúa correctamente el patrón de ${segment}.${final?' Se han consumido todos los símbolos y el estado es final: la expresión fue aceptada.':''}`};
 }
 function review(result){
  if(!result?.dfa)return {title:'Tutor del AFD',message:'Aquí aparecerá una explicación basada en el recorrido.'};
  if(result.educational){const analysis=result.analysis||window.SpellWritingAnalyzer.analyze(result.exercise.id,result.text,result.dfa);
   return {title:analysis.accepted?'Expresión reconocida':'Corrección guiada del AFD',message:window.SpellAdaptiveTutor.contextual(result.exercise,analysis),suggestion:analysis.correction,rule:analysis.advice,category:analysis.category,accepted:analysis.accepted};
  }
  if(result.dfa.natural&&!result.dfa.accepted){const a=window.SpellNatural.analyze(result.dfa);return {title:'Aether · Corrige tu hechizo',message:a.message,suggestion:a.suggestion,rule:window.SpellNatural.describe(result.dfa.mode),accepted:false};}
  if(result.dfa.accepted)return {title:'Cadena aceptada por el AFD',message:result.kind==='wrong-choice'?'La expresión es formalmente válida, pero su elemento, círculo o acción no resuelve este acertijo. El AFD solo reconoce la estructura; la regla de la sala decide el acierto.':'El AFD consumió todos los caracteres y terminó en un estado final. Una expresión correcta no implica que cualquier reto se resuelva.',accepted:true};
  const fault=result.dfa.firstError;
  return {title:'¿Por qué se rechazó el conjuro?',message:fault?.kind==='incomplete'?'La expresión terminó antes de alcanzar un estado final. Revisa si falta alguna palabra, conector o acción en la fórmula del grimorio.':`El AFD llegó al estado sumidero cerca del símbolo ${fault?.index??'?'} de la forma normalizada. Reproduce el recorrido para identificar qué esperaba.`,rule:'Fórmula: INVOCACIÓN + «despierta en el» + CÍRCULO + «círculo y» + ACCIÓN.',accepted:false};
 }
 window.SpellAFDTutor={review,explainStep};
})();
