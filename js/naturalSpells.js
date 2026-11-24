/* Lenguaje finito de conjuros en español. Cada variante conserva elemento, intensidad y acción. */
(function(){'use strict';
 const D=window.SpellData;
 const elements=['fuego','hielo','viento'], forces=['leve','media','máxima'], verbs=['rompa el sello','detenga al guardián','disperse la niebla'], inf=['romper el sello','detener al guardián','dispersar la niebla'];
 const alias=['quiebre el sello','inmovilice al guardián','disipe la niebla'];
 const modes=['facil','normal','dificil'];
 function normalize(raw,mode){let s=String(raw??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');s=s.replace(/^¡\s*/,'').replace(/[.!]$/,'').trim();if(mode!=='dificil')s=s.replace(/[,;:]/g,' ').replace(/\s+/g,' ').trim();else s=s.replace(/\s*,\s*/g,', ');return s;}
 function variants(e,f,a,mode){const p=elements[e],q=forces[f],v=verbs[a];
  if(mode==='facil')return [`Que el ${p} ${v} con fuerza ${q}`,`Que el ${p} ${alias[a]} con fuerza ${q}`,`Invoco el ${p} para ${inf[a]} con fuerza ${q}`];
  if(mode==='normal')return [`Que el ${p} despierte y ${v} con fuerza ${q}`,`Que el ${p} se alce y ${alias[a]} con fuerza ${q}`,`Invoco el ${p} para ${inf[a]} con fuerza ${q}`];
  return [`Aunque el camino esté cerrado, que el ${p} ${v} con fuerza ${q}`,`Si el peligro nos acecha, que el ${p} despierte y ${v} con fuerza ${q}`,`Aunque el camino esté cerrado, que el ${p} ${alias[a]} con fuerza ${q}`];
 }
 const epicForces=['con un soplo de poder','con renovada fuerza','con todo su poder'];
 const epicActions=['rompa el sello que guarda este lugar','detenga al guardián que bloquea el paso','disperse la niebla que oculta el camino'];
 const epicInf=['romper el sello que guarda este lugar','detener al guardián que bloquea el paso','dispersar la niebla que oculta el camino'];
 function epic(e,f,a,mode){const p=elements[e],q=epicForces[f],v=epicActions[a],i=epicInf[a];
  if(mode==='facil')return [`Que el ${p} despierte ${q} y ${v}`,`Que el ${p} se alce ${q} y ${v}`,`Invoco el poder del ${p} ${q} para ${i}`];
  if(mode==='normal')return [`Que el ${p} se alce desde las sombras ${q} y ${v}`,`Invoco el poder del ${p} ${q} para ${i} y abrirnos paso`,`Que el ${p} responda a mi llamado ${q} y ${v}`];
  return [`Aunque las sombras cierren el camino, que el ${p} despierte ${q} y ${v}`,`Si el peligro nos acecha, que el ${p} se alce ${q} y ${v}`,`Aunque el camino esté cerrado, invoco el poder del ${p} ${q} para ${i}`];
 }
 const catalogs={},epicCatalogs={},allCatalogs={},automata={};
 const escapeReg=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 for(const mode of modes){const states=[{edges:new Map(),final:false}],accepted=new Map(),list=[];
  for(const make of [variants,epic])for(let e=0;e<3;e++)for(let f=0;f<3;f++)for(let a=0;a<3;a++)for(const text of make(e,f,a,mode)){
   const spell={invocation:D.invocations[e],circle:D.circles[f],action:D.actions[a],element:elements[e],force:forces[f],text:text+'.'};const str=normalize(text,mode);let s=0;
   for(const ch of str){if(!states[s].edges.has(ch)){states[s].edges.set(ch,states.length);states.push({edges:new Map(),final:false});}s=states[s].edges.get(ch);}states[s].final=true;accepted.set(str,spell);list.push(spell);
  }
  const regex=new RegExp('^(?:'+[...accepted.keys()].map(escapeReg).join('|')+')$');catalogs[mode]=list.slice(0,81);epicCatalogs[mode]=list.slice(81);allCatalogs[mode]=list;automata[mode]={states,accepted,regex};
 }
 function run(raw,mode='normal'){mode=modes.includes(mode)?mode:'normal';const A=automata[mode],normalized=normalize(raw,mode);let s=0,firstError=null;const trace=[];
  for(const [i,ch] of [...normalized].entries()){const dest=s<0?-1:(A.states[s].edges.get(ch)??-1);if(dest<0&&!firstError)firstError={kind:'invalid-symbol',index:i+1,symbol:ch,expected:[...A.states[s].edges.keys()]};trace.push({position:i+1,symbol:ch,from:s<0?'q⊥':'q'+s,to:dest<0?'q⊥':'q'+dest,rejected:dest<0});s=dest;}
  const accepted=s>=0&&A.states[s].final;if(!accepted&&!firstError)firstError={kind:'incomplete',index:normalized.length+1,symbol:'fin de cadena',expected:[...A.states[s].edges.keys()]};
  return {accepted,trace,firstError,endState:s<0?'q⊥':'q'+s,spell:accepted?A.accepted.get(normalized):null,byRegex:A.regex.test(normalized),normalized,wasNormalized:normalized!==String(raw).trim(),natural:true,mode};
 }
 function distance(a,b){let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const row=[i];for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=row;}return prev[b.length];}
 function analyze(dfa){if(dfa.accepted)return {category:null,skill:'estructura',message:'La expresión pertenece al lenguaje de esta dificultad.'};const n=dfa.normalized,mode=dfa.mode, list=allCatalogs[mode];
  let category='orden-palabras',skill='estructura',message='Revisa el orden: invocación, acción y fuerza del hechizo.';
  if(mode==='dificil'&&!n.includes(',')&&/^(aunque|si) /.test(n)){category='coma-omitida';skill='puntuación';message='La oración subordinada inicial debe separarse de la principal con una coma en esta fórmula.';}
  else if(/\b(despierte|se alce|responda)\b/.test(n)&&! /\by\b/.test(n)){category='conector-omitido';skill='conectores';message='Después de «despierte» o «se alce» el patrón requiere el conector «y» para unir las acciones.';}
  else if(/^invoco /.test(n)&&! /\bpara\b/.test(n)){category='conector-omitido';skill='conectores';message='La fórmula «Invoco… para…» necesita «para» antes del infinitivo.';}
  else if(!/\b(?:con fuerza (?:leve|media|maxima)|con un soplo de poder|con renovada fuerza|con todo su poder)\b/.test(n)){category='palabras-omitidas';message='Falta indicar la intensidad: «con un soplo de poder», «con renovada fuerza» o «con todo su poder».';}
  else if(mode==='dificil'&&!/^(aunque|si) /.test(n)){category='conector-omitido';skill='conectores';message='En Difícil, comienza por una condición o contraste: «Aunque el camino esté cerrado,» o «Si el peligro nos acecha,».';}
  const scored=list.map(sp=>({sp,d:distance(n,normalize(sp.text,mode))})).sort((a,b)=>a.d-b.d);const best=scored[0];const suggestion=best&&best.d<=Math.max(5,Math.floor(n.length*.18))&&(!scored[1]||scored[1].d>best.d)?best.sp.text:null;
  return {category,skill,message,suggestion};
 }
 function describe(mode){return mode==='facil'?'Que el [elemento] despierte [intensidad] y [acción].':mode==='normal'?'Que el [elemento] se alce desde las sombras [intensidad] y [acción].':'Aunque las sombras cierren el camino, que el [elemento] despierte [intensidad] y [acción].';}
 function example(solution,mode='normal',variant=0){return epic(D.invocations.indexOf(solution.invocation),D.circles.indexOf(solution.circle),D.actions.indexOf(solution.action),mode)[variant]+'.';}
 function segment(dfa){const n=dfa.normalized,words=[...n.matchAll(/\S+/g)];const marks=[];const add=(label,end)=>{if(end>(marks.at(-1)?.end||0))marks.push({label,end});};
  const epicForce=n.match(/\b(con un soplo de poder|con renovada fuerza|con todo su poder)\b/);const force=n.indexOf(' con fuerza ');const clause=n.indexOf(',');if(dfa.mode==='dificil'&&clause>=0)add('Condición / contraste',clause+1);
  const e=n.match(/\b(fuego|hielo|viento)\b/);if(e)add('Elemento',e.index+e[0].length);
  const conn=n.match(/\b(despierte y|se alce y|para)\b/);if(conn)add('Conector',conn.index+conn[0].length);
  if(epicForce){add('Invocación',epicForce.index);add('Intensidad',epicForce.index+epicForce[0].length);const next=n.slice(epicForce.index+epicForce[0].length).match(/^\s+(y|para)\b/);if(next)add('Conector',epicForce.index+epicForce[0].length+next[0].length);add('Acción',n.length);}else if(force>=0){add('Acción',force);add('Intensidad',n.length);}else add('Acción / estructura',n.length);
  if(!marks.length)add('Expresión',n.length);return marks;
 }
 window.SpellNatural={run,normalize,analyze,example,describe,segment,catalogs,epicCatalogs,allCatalogs,automata,elements,forces,epicForces,epicActions,verbs,inf};
})();
