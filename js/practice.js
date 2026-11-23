/* Controlador de ejercicios complementarios, sin PV ni progreso de campaña. */
(function(){
 'use strict';
 const R=window.SpellWritingRules, A=window.SpellEducationalAFD, E=window.SpellWritingAnalyzer, L=window.SpellLearningProgress;
 function evaluate(id,text){const ex=R.get(id);if(!ex)return null;
  const dfa=A.run(id,text);const analysis=E.analyze(id,text,dfa);
  L.record(ex,analysis);
  return {kind:dfa.accepted?'correct':'syntax-error',dfa,text,damage:0,educational:true,exercise:ex,analysis};
 }
 function hint(id){const ex=R.get(id);if(ex)L.recordHelp(ex);return ex?.tip||'';}
 window.SpellPractice={evaluate,hint,exercises:R.exercises,forRoom:R.exercisesByRoom};
})();
