/* Analizador de errores configurados. No interpreta lenguaje natural libre. */
(function(){
 'use strict';
 const R=window.SpellWritingRules;
 const connectors=['porque','aunque','por eso','sin embargo','pero','y'];
 const cleanWords=text=>R.normalize(text).replace(/[,.!?;:]/g,' ').split(/\s+/).filter(Boolean);
 const hasPhrase=(text,phrase)=>new RegExp('(?:^|\\s)'+phrase.replace(/ /g,'\\s+')+'(?:$|[\\s,.;:!?])').test(text);
 const stripPunctuation=text=>R.normalize(text).replace(/[,.!?;:]/g,'').replace(/\s+/g,' ').trim();
 const messages={
  'coma-omitida':'Falta una coma que la estructura de esta actividad exige.',
  'conector-omitido':'Falta el conector obligatorio de este ejercicio.',
  'conector-incorrecto':'El conector utilizado no expresa la relación pedida.',
  'orden-palabras':'Las palabras están presentes, pero no siguen el orden requerido.',
  'palabras-omitidas':'Faltan una o varias palabras necesarias para completar la expresión.',
  'puntuacion':'La puntuación no coincide con la estructura del ejercicio.',
  'acentuacion':'La expresión fue aceptada; conviene revisar las tildes de la escritura.',
  'estructura':'La expresión no coincide con la plantilla definida para este ejercicio.'
 };
 function analyze(exerciseId,input,dfa){
  const exercise=typeof exerciseId==='string'?R.get(exerciseId):exerciseId;
  if(!exercise)return {category:'estructura',message:'No existe este ejercicio.',accepted:false};
  const normalized=R.normalize(input),target=R.normalize(exercise.answer);
  const accepted=Boolean(dfa?.accepted);
  const advice=exercise.rule;
  if(!normalized)return {category:'palabras-omitidas',accepted:false,message:'Todavía no has escrito una expresión.',advice,correction:exercise.answer,firstError:dfa?.firstError};
  if(accepted){
   const userTrim=String(input).trim();
   const cleanUser=userTrim.toLocaleLowerCase('es').replace(/\s+/g,' ');
   const canonical=exercise.answer.toLocaleLowerCase('es').replace(/\s+/g,' ');
   const accentOnly=cleanUser.normalize('NFD').replace(/[\u0300-\u036f]/g,'')===canonical.normalize('NFD').replace(/[\u0300-\u036f]/g,'')&&cleanUser!==canonical;
   return {category:accentOnly?'acentuacion':null,accepted:true,message:accentOnly?'¡Respuesta válida! Revisa las tildes para escribirla con ortografía convencional.':'¡Estructura correcta! El AFD del ejercicio llegó a un estado final.',advice:accentOnly?exercise.rule:'Has aplicado la estructura solicitada.',correction:exercise.answer,firstError:null,warningOnly:accentOnly};
  }
  let category='estructura';
  const words=cleanWords(normalized),answerWords=cleanWords(target);
  const expectedConnector=connectors.find(c=>hasPhrase(target,c)&&(/conector/.test(exercise.type)));
  const usedConnector=connectors.find(c=>hasPhrase(normalized,c)&&c!==expectedConnector);
  if(stripPunctuation(normalized)===stripPunctuation(target)){
   category=target.includes(',')&&!normalized.includes(',')?'coma-omitida':'puntuacion';
  }else if(expectedConnector&&!hasPhrase(normalized,expectedConnector)){
   category=usedConnector?'conector-incorrecto':'conector-omitido';
  }else if(words.length===answerWords.length&&[...words].sort().join('|')===[...answerWords].sort().join('|')){
   category='orden-palabras';
  }else if(words.length<answerWords.length){
   category='palabras-omitidas';
  }else if((target.includes(',')&&!normalized.includes(','))&&(normalized.startsWith(target.split(',')[0]))) {
   category='coma-omitida';
  }else if(/[,.!?;:]/.test(normalized)&&/[,.!?;:]/.test(target)){
   category='puntuacion';
  }
  return {category,accepted:false,message:messages[category],advice,correction:exercise.answer,firstError:dfa?.firstError};
 }
 window.SpellWritingAnalyzer={analyze,messages,stripPunctuation};
})();
