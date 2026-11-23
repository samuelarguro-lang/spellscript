/* Seguimiento didáctico local y separado de la partida V3.
   No se guardan respuestas en texto, nombres ni identificadores del jugador. */
(function(){
 'use strict';
 const KEY='spellscript-v4-learning';const LIMIT=240;
 const empty=()=>({version:1,attempts:[],help:[],recommendations:true,lastNotice:{}});
 let data=empty();let storageAvailable=true;
 const safeRead=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){storageAvailable=false;return null;}};
 function restore(){const saved=safeRead();if(saved&&saved.version===1){
  data.attempts=Array.isArray(saved.attempts)?saved.attempts.filter(e=>e&&typeof e.id==='string'&&typeof e.skill==='string').slice(-LIMIT):[];
  data.help=Array.isArray(saved.help)?saved.help.filter(e=>e&&typeof e.id==='string').slice(-LIMIT):[];
  data.recommendations=saved.recommendations!==false;
  data.lastNotice=saved.lastNotice&&typeof saved.lastNotice==='object'?saved.lastNotice:{};
 }}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(data));storageAvailable=true;return true;}catch(e){storageAvailable=false;return false;}}
 function record(ex,analysis){if(!ex||!analysis)return;
  data.attempts.push({id:ex.id,room:ex.room,skill:ex.skill,accepted:analysis.accepted,category:analysis.warningOnly?null:analysis.category,t:Date.now()});
  if(data.attempts.length>LIMIT)data.attempts=data.attempts.slice(-LIMIT);save();
 }
 function recordHelp(ex){if(!ex)return;data.help.push({id:ex.id,t:Date.now()});if(data.help.length>LIMIT)data.help=data.help.slice(-LIMIT);save();}
 function toggleRecommendations(on){data.recommendations=Boolean(on);save();return data.recommendations;}
 function clear(){const previous=data.recommendations;data=empty();data.recommendations=previous;save();}
 function stats(){
  const attempts=data.attempts;
  const completed=new Set(attempts.filter(e=>e.accepted).map(e=>e.id));
  const errors=attempts.filter(e=>!e.accepted);
  const categories={};for(const e of errors)categories[e.category]=(categories[e.category]||0)+1;
  const skills={};for(const skill of window.SpellWritingRules.skills){
   const items=attempts.filter(e=>e.skill===skill), successes=items.filter(e=>e.accepted);
   skills[skill]={attempts:items.length,correct:successes.length,completed:new Set(successes.map(e=>e.id)).size,errors:items.length-successes.length};
  }
  let corrections=0;for(const id of completed){const list=attempts.filter(e=>e.id===id);const ix=list.findIndex(e=>e.accepted);if(ix>0&&list.slice(0,ix).some(e=>!e.accepted))corrections++;}
  return {attempts:attempts.length,errors:errors.length,success:attempts.length-errors.length,completed:completed.size,corrections,help:data.help.length,categories,skills,storageAvailable};
 }
 const getAttempts=()=>data.attempts.slice();
 const enabled=()=>data.recommendations;
 const markNotice=(category,length)=>{data.lastNotice[category]=length;save();};
 const shouldShowNotice=(category,length,interval=4)=>length-(Number(data.lastNotice[category])||0)>=interval;
 restore();
 window.SpellLearningProgress={record,recordHelp,stats,clear,save,getAttempts,toggleRecommendations,enabled,markNotice,shouldShowNotice};
})();
