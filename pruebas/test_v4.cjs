'use strict';
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'), store=new Map();
function boot(){
 const ctx={Date,Math,localStorage:{getItem:key=>store.get(key)??null,setItem:(key,v)=>store.set(key,v),removeItem:key=>store.delete(key)}};ctx.window=ctx;vm.createContext(ctx);
 for(const file of ['data','afd','game','writingRules','educationalAFD','writingAnalyzer','learningProgress','adaptiveTutor','practice','afdTutor']){
  vm.runInContext(fs.readFileSync(path.join(root,'js',file+'.js'),'utf8'),ctx,{filename:file+'.js'});
 }
 return ctx;
}
let ctx=boot();const D=ctx.SpellData,G=ctx.SpellGame,A=ctx.SpellAFD,R=ctx.SpellWritingRules,EA=ctx.SpellEducationalAFD,W=ctx.SpellWritingAnalyzer,L=ctx.SpellLearningProgress,T=ctx.SpellAdaptiveTutor,P=ctx.SpellPractice;
assert.equal(D.spells.length,27);assert.equal(A.validSpells,27);assert.equal(D.rooms.length,3);
assert.deepEqual(Array.from(D.rooms,room=>room.puzzles.length),[15,15,15]);
assert.deepEqual(Object.keys(D.difficulty).sort(),['dificil','facil','normal']);
for(const spell of D.spells)assert.equal(A.run(spell.text).accepted,true,spell.text);
assert.equal(A.run('aethra ignis despierta en el segundo circulo y rompe el sello').accepted,true);
assert(R.exercises.length>=21);
for(const ex of R.exercises){
 const dfa=EA.run(ex.id,ex.answer);
 assert.equal(dfa.accepted,true,ex.id);assert.equal(dfa.byRegex,true,ex.id);
 assert.equal(dfa.trace.length,[...R.normalize(ex.answer)].length,ex.id);
 assert(dfa.statesCount>dfa.trace.length);
 const normalizedNoAccent=ex.answer.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 assert.equal(EA.run(ex.id,normalizedNoAccent).accepted,true,ex.id+' tolerant uppercase/accents');
}
for(const ex of R.exercises.filter(e=>e.answer.includes(','))){
 const invalid=ex.answer.replace(',','');
 const result=EA.run(ex.id,invalid);
 assert.equal(result.accepted,false,ex.id+' strict comma');
 assert.equal(result.byRegex,false);
 const analysis=W.analyze(ex.id,invalid,result);
 assert.equal(analysis.category,'coma-omitida',ex.id);
 assert(result.firstError,'Expected error location');
}
for(const ex of R.exercises.filter(e=>e.type==='conector')){
 const connector=['porque','aunque','por eso'].find(k=>R.normalize(ex.answer).includes(k));
 assert(connector,ex.id);
 const invalid=ex.answer.replace(new RegExp(connector,'i'),'').replace(/\s+/g,' ');
 const result=EA.run(ex.id,invalid);
 assert.equal(result.accepted,false,ex.id+' strict connector');
 const analysis=W.analyze(ex.id,invalid,result);
 assert.equal(analysis.category,'conector-omitido',ex.id);
}
assert.equal(W.analyze('h-orden-1','El protege hielo la puerta.',EA.run('h-orden-1','El protege hielo la puerta.')).category,'orden-palabras');
assert.equal(W.analyze('h-palabras-1','La maga la puerta.',EA.run('h-palabras-1','La maga la puerta.')).category,'palabras-omitidas');
assert.equal(W.analyze('f-conector-1','El guardián retrocede aunque el hielo enfría sus manos.',EA.run('f-conector-1','El guardián retrocede aunque el hielo enfría sus manos.')).category,'conector-incorrecto');
// Repetir el mismo ejercicio no debe considerarse patrón recurrente.
for(let i=0;i<5;i++)P.evaluate('h-coma-1','Si el hielo se derrite podremos entrar.');
assert.equal(T.overview().length,0);
const lives=G.state.lives,progress=[...G.state.progress],attempts=G.state.attempts;
for(const id of ['h-coma-2','h-coma-3']){const ex=R.get(id);P.evaluate(id,ex.answer.replace(',',''));}
assert(T.overview().some(x=>x.category==='coma-omitida'));
const rec=T.recommendation();assert(rec&&rec.category==='coma-omitida');
assert.equal(T.recommendation(),null,'Avoid repeating immediate notices');
L.toggleRecommendations(false);assert.equal(T.recommendation(),null);
L.toggleRecommendations(true);
const good=P.evaluate('h-coma-1',R.get('h-coma-1').answer);
assert.equal(good.kind,'correct');
assert.equal(good.damage,0);assert.equal(G.state.lives,lives);assert.deepEqual([...G.state.progress],progress);assert.equal(G.state.attempts,attempts);
P.hint('f-conector-1');assert.equal(L.stats().help,1);
assert(L.stats().corrections>=1);
const before=JSON.stringify({difficult:G.state.difficulty,plan:G.state.plans,progress:G.state.progress,lives:G.state.lives});
G.save();const storedV3=store.get('spellscript-v3-save');assert(storedV3);
assert(!JSON.stringify(L.getAttempts()).includes('Si el hielo'), 'Learning history cannot store raw input text');
ctx=boot();assert(ctx.SpellLearningProgress.stats().attempts>=8,'V4 learning history restored');
assert(ctx.SpellGame.state.difficulty===G.state.difficulty,'V3 campaign restored');
ctx.SpellLearningProgress.clear();assert.equal(ctx.SpellLearningProgress.stats().attempts,0);
assert.equal(store.get('spellscript-v3-save'),storedV3,'Clearing learning history must not affect V3 campaign');
assert.equal(ctx.SpellLearningProgress.stats().completed,0);
console.log(JSON.stringify({result:'PASS',classicSpells:27,classicRiddles:45,educationalExercises:R.exercises.length,strictCommas:true,strictConnectors:true,variantsAccepted:true,classifiedErrors:true,recurrentMinDifferentExercises:3,suggestions:true,noLifeLoss:true,learningPersistence:true,keepsV3Save:true,retainsOriginalGame:true},null,2));
