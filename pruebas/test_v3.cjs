'use strict';
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const backing=new Map();
function boot(){
 const storage={getItem:key=>backing.get(key)||null,setItem:(key,value)=>backing.set(key,value)};
 const ctx={localStorage:storage,Date,Math};ctx.window=ctx;vm.createContext(ctx);
 for(const name of ['data','afd','game'])vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),ctx,{filename:name+'.js'});
 return ctx;
}
let ctx=boot();const D=ctx.SpellData,A=ctx.SpellAFD,G=ctx.SpellGame;
assert.equal(D.rooms.length,3);
assert.equal(D.spells.length,27);
assert.equal(A.validSpells,27);
assert(D.rooms.every(r=>r.puzzles.length>=15));
D.spells.forEach(({text})=>assert.equal(A.run(text).accepted,true,text));
assert.equal(A.run('¡Zephira Ventus, despierta en el tercer círculo y dispersa la niebla!'.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[!,¡]/g,'')).accepted,true);
let initial=G.state.plans.map(x=>[...x]);
G.resetGame();let next=G.state.plans.map(x=>[...x]);
for(let i=0;i<3;i++)assert.equal(initial[i].filter(n=>next[i].includes(n)).length,0,'Rotation must not repeat before exhausting bank');
for(const difficulty of ['facil','normal','dificil']){
 G.setDifficulty(difficulty);G.start();
 const n=G.totalChallenges();
 const plans=G.state.plans.map(x=>[...x]);
 assert(plans.every(list=>list.length===n&&new Set(list).size===n));
 const failed=G.cast('texto irreconocible');assert.equal(failed.kind,'syntax-error');assert.equal(failed.damage,1);
 for(let room=0;room<3;room++){
  for(let j=0;j<n;j++){
   const p=G.currentPuzzle();assert.equal(p.id,D.rooms[room].puzzles[plans[room][j]].id);
   const input=D.formulate(p.solution.invocation,p.solution.circle,p.solution.action).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[!,¡]/g,'');
   const r=G.cast(input);assert.equal(r.kind,'correct');assert.equal(r.completedRoom,j===n-1);
  }
  assert.equal(G.state.solved[room],true);
  const archive=G.roomArchive(room);assert.equal(archive.length,n);
  const lives=G.state.lives,progress=[...G.state.progress],lastResult=G.state.lastResult;
  for(const entry of archive){
   assert.equal(entry.source,'jugador');
   const replay=G.replayEntry(entry);
   assert.equal(replay.dfa.accepted,true);
   assert.equal(replay.dfa.spell.text,D.formulate(D.rooms[room].puzzles[plans[room][entry.challengeIndex]].solution.invocation,D.rooms[room].puzzles[plans[room][entry.challengeIndex]].solution.circle,D.rooms[room].puzzles[plans[room][entry.challengeIndex]].solution.action));
  }
  assert.equal(G.state.lives,lives);assert.deepEqual([...G.state.progress],progress);assert.equal(G.state.lastResult,lastResult);
  if(room<2)assert.equal(G.nextRoom(),true);
 }
 assert.equal(G.state.solved.every(Boolean),true);
 G.save();ctx=boot();assert.equal(ctx.SpellGame.state.solved.every(Boolean),true);assert.equal(ctx.SpellGame.roomArchive(0).length,n);
}
G.resetGame('facil');G.start();
G.state.progress=[3,0,0];G.state.solved=[true,false,false];G.selectRoom(1);
const prior=G.roomArchive(0).length;
for(let i=0;i<7;i++)G.cast('invalid');
assert.equal(G.state.lives,7);
assert.equal(G.state.progress[1],0);
assert.equal(G.roomArchive(0).length,prior);
assert.equal(G.state.solved[0],true);
console.log(JSON.stringify({status:'PASS',modeTests:3,roomTests:9,puzzleBankPerRoom:D.rooms.map(r=>r.puzzles.length),acceptedSpells:27,randomRotation:true,historyReplay:true,historySurvivesRefresh:true,lifeReset:true},null,2));
