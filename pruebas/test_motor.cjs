'use strict';
const vm = require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const memory=new Map();
function boot(){
 const localStorage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};
 const ctx={localStorage};ctx.window=ctx;vm.createContext(ctx);
 for(const name of ['data','afd','game'])vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),ctx,{filename:name+'.js'});
 return ctx;
}
let app=boot();const {SpellData:D,SpellAFD:A,SpellGame:G}=app;
assert.equal(A.validSpells,27);
let accepted=0;
for(const spell of D.spells){
 const test=A.run(spell.text.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[¡!,]/g,'').replace(/\s+/g,'  '));
 assert.equal(test.accepted,true,spell.text);assert.equal(test.byRegex,true,spell.text);accepted++;
}
for(const invalid of ['aethra ignis despierta en el cuarto circulo y rompe el sello','zephira ventuz despierta en el tercer circulo y dispersa la niebla','nivara glacies detiene el guardian','aethra ignis despierta en el segundo circulo y rompe el portal']){
 assert.equal(A.run(invalid).accepted,false,invalid);
}
for(const mode of ['facil','normal','dificil']){
 G.setDifficulty(mode);const cfg=D.difficulty[mode];
 assert.equal(G.maxLives(),cfg.lives);assert.equal(G.totalChallenges(),cfg.riddles);
 assert.equal(G.selectRoom(1),false,'room2 locked');
}
G.setDifficulty('normal');assert.equal(G.cast('  ').kind,'empty');assert.equal(G.state.attempts,0);
let r=G.cast('invalid');assert.equal(r.kind,'syntax-error');assert.equal(r.damage,1);assert.equal(G.state.lives,4);
r=G.cast(D.formulate('Zephira Ventus','tercer','dispersa la niebla'));
assert.equal(r.kind,'wrong-choice');assert.equal(r.damage,2);assert.equal(G.state.lives,2);
// Test complete campaign in each difficulty.
for(const mode of ['facil','normal','dificil']){
 G.setDifficulty(mode);G.start();
 const length=G.totalChallenges();
 for(let room=0;room<3;room++){
  assert.equal(G.state.currentRoom,room);
  for(let i=0;i<length;i++){
   const s=G.currentPuzzle().solution;
   const typed=D.formulate(s.invocation,s.circle,s.action).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[!,¡]/g,'');
   r=G.cast(typed);
   assert.equal(r.kind,'correct',typed);
   assert.equal(G.state.progress[room],i+1);
   assert.equal(r.completedRoom,i===length-1);
  }
  assert.equal(G.state.solved[room],true);
  if(room<2)assert.equal(G.nextRoom(),true);
 }
 assert.equal(G.state.solved.every(Boolean),true);
}
G.setDifficulty('facil');
G.state.progress=[3,0,0];G.state.solved=[true,false,false];assert.equal(G.selectRoom(1),true);
for(let i=0;i<7;i++)r=G.cast('invalid');
assert.equal(r.restarted,true);assert.equal(G.state.lives,7);assert.equal(G.state.progress[1],0);assert.equal(G.state.solved[0],true);
// Auto save/load: completed prior room must survive a browser refresh.
G.save();app=boot();assert.equal(app.SpellGame.state.solved[0],true);assert.equal(app.SpellGame.state.currentRoom,1);assert.equal(app.SpellGame.state.lives,7);
console.log(JSON.stringify({result:'PASS',validSpells:accepted,dfaStates:A.states.length,invalidRejected:true,campaignModes:['facil','normal','dificil'],rooms:3,lifeReset:true,progressPersists:true},null,2));
