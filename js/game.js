/* SpellScript V3 — motor puro: retos variables, progreso e historial de AFD. */
(function () {
 'use strict';
 const D = window.SpellData;
 const SAVE_KEY = 'spellscript-v3-save';
 const LEGACY_KEY = 'spellscript-v2-save';
 const CYCLE_KEY = 'spellscript-v3-puzzle-rotation';
 const validModes = Object.keys(D.difficulty);
 const state = {
  difficulty:'normal', currentRoom:0, lives:5,
  solved:[false,false,false], progress:[0,0,0], plans:[[],[],[]],
  history:[[],[],[]], attempts:0, syntaxErrors:0, puzzleErrors:0,
  restartCount:0, lastResult:null, started:false, tutorialSeen:false
 };
 const maxLives = () => D.difficulty[state.difficulty].lives;
 const totalChallenges = () => D.difficulty[state.difficulty].riddles;
 const bounds = (num,min,max) => Math.max(min,Math.min(max,Number(num)||0));
 const readJson = key => { try { return JSON.parse(localStorage.getItem(key)||'null'); } catch (_) {return null;} };
 const save = () => {try {localStorage.setItem(SAVE_KEY,JSON.stringify({...state,lastResult:null}));} catch (_) { /* file:// private mode */ }};
 function shuffle(list) {
  const out = list.slice();
  for (let i=out.length-1;i>0;i--) {
   const j=Math.floor(Math.random()*(i+1));
   [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
 }
 function makePlans(){
  const memory=readJson(CYCLE_KEY)||{};
  const plans=D.rooms.map(room=>{
   const length=room.puzzles.length;
   const old=Array.isArray(memory[room.id])?memory[room.id].filter(v=>Number.isInteger(v)&&v>=0&&v<length):[];
   const unique=[...new Set(old)];
   let available=shuffle(Array.from({length},(_,i)=>i).filter(i=>!unique.includes(i)));
   // When a rotation runs out, start a new random cycle, not a fixed order.
   if(available.length<totalChallenges()) {available=shuffle(Array.from({length},(_,i)=>i));unique.length=0;}
   const chosen=[]; const solutions=new Set();
   while(chosen.length<totalChallenges()&&available.length){
    let i=available.findIndex(v=>{
     const s=room.puzzles[v].solution;
     return !solutions.has([s.invocation,s.circle,s.action].join('|'));
    });
    if(i===-1)i=0;
    const [candidate]=available.splice(i,1);
    chosen.push(candidate);
    const s=room.puzzles[candidate].solution;
    solutions.add([s.invocation,s.circle,s.action].join('|'));
   }
   memory[room.id]=[...unique,...chosen];
   return chosen;
  });
  try {localStorage.setItem(CYCLE_KEY,JSON.stringify(memory));}catch (_){}
  return plans;
 }
 function getPuzzle(roomIndex,stepIndex){
  const room=D.rooms[roomIndex];if(!room)return null;
  const step=bounds(stepIndex,0,totalChallenges()-1);
  const index=state.plans[roomIndex]?.[step];
  return room.puzzles[Number.isInteger(index)&&index>=0&&index<room.puzzles.length?index:step];
 }
 const currentPuzzle = () => getPuzzle(state.currentRoom,Math.min(state.progress[state.currentRoom],totalChallenges()-1));
 function resetGame(mode=state.difficulty,preserveTutorial=true){
  const previousTutorial=state.tutorialSeen;
  state.difficulty=validModes.includes(mode)?mode:'normal';
  state.currentRoom=0;state.lives=maxLives();state.solved=[false,false,false];state.progress=[0,0,0];
  state.history=[[],[],[]];state.plans=makePlans();state.attempts=0;state.syntaxErrors=0;state.puzzleErrors=0;
  state.restartCount=0;state.lastResult=null;state.started=false;
  state.tutorialSeen=preserveTutorial?previousTutorial:false;
  save();
 }
 function restore(){
  const saved=readJson(SAVE_KEY)||readJson(LEGACY_KEY);
  if(!saved||!validModes.includes(saved.difficulty)||!Array.isArray(saved.progress)||saved.progress.length!==3)return false;
  state.difficulty=saved.difficulty;
  state.progress=saved.progress.map(v=>bounds(Number.isInteger(v)?v:0,0,totalChallenges()));
  state.solved=state.progress.map(v=>v>=totalChallenges());
  state.currentRoom=bounds(saved.currentRoom,0,2);
  state.lives=bounds(saved.lives||maxLives(),1,maxLives());
  ['attempts','syntaxErrors','puzzleErrors','restartCount'].forEach(key=>state[key]=Math.max(0,Math.floor(Number(saved[key])||0)));
  state.started=Boolean(saved.started);state.tutorialSeen=Boolean(saved.tutorialSeen);
  const validPlan=plan=>Array.isArray(plan)&&plan.length===totalChallenges()&&plan.every(v=>Number.isInteger(v)&&v>=0&&v<D.rooms[0].puzzles.length);
  // For a saved V2 campaign preserve the exact first five riddles; the next new campaign is randomized.
  state.plans=Array.isArray(saved.plans)&&saved.plans.length===3&&saved.plans.every(validPlan)
   ?saved.plans.map(plan=>plan.slice())
   :D.rooms.map(()=>Array.from({length:totalChallenges()},(_,i)=>i));
  state.history=Array.isArray(saved.history)&&saved.history.length===3
   ?saved.history.map((list,room)=>Array.isArray(list)?list.filter(e=>e&&e.roomIndex===room&&typeof e.text==='string').slice(-100):[])
   :[[],[],[]];
  state.lastResult=null;save();return true;
 }
 const setDifficulty = mode => {if(!validModes.includes(mode))return false;resetGame(mode,true);return true;};
 const start = () => {state.started=true;save();};
 const seenTutorial = () => {state.tutorialSeen=true;save();};
 function selectRoom(index){
  if(!Number.isInteger(index)||index<0||index>2)return false;
  if(index>0&&!state.solved[index-1])return false;
  if(state.currentRoom!==index){state.currentRoom=index;state.lastResult=null;state.lives=maxLives();save();}
  return true;
 }
 const nextRoom = () => selectRoom(state.currentRoom+1);
 function roomArchive(roomIndex){
  if(!Number.isInteger(roomIndex)||roomIndex<0||roomIndex>=D.rooms.length)return [];
  return Array.from({length:state.progress[roomIndex]},(_,challengeIndex)=>{
   const puzzle=getPuzzle(roomIndex,challengeIndex);
   const found=[...state.history[roomIndex]].reverse().find(e=>e.kind==='correct'&&e.challengeIndex===challengeIndex&&e.puzzleId===puzzle.id);
   if(found)return {...found,challengeIndex,puzzleId:puzzle.id,title:puzzle.title,source:'jugador'};
   // Imported V2 saves lack historical attempts: show an explicitly identified canonical example.
   return {roomIndex,challengeIndex,puzzleId:puzzle.id,title:puzzle.title,
    text:D.formulate(puzzle.solution.invocation,puzzle.solution.circle,puzzle.solution.action),
    kind:'correct',damage:0,source:'ejemplo'};
  });
 }
 function replayEntry(entry){
  if(!entry||typeof entry.text!=='string')return null;
  const dfa=window.SpellAFD.run(entry.text);
  return {...entry,dfa,archive:true,roomIndex:entry.roomIndex,challengeIndex:entry.challengeIndex};
 }
 function cast(raw){
  const text=String(raw??'');
  if(!text.trim())return {kind:'empty',damage:0,message:'Escribe primero tu conjuro. No perderás vidas.'};
  const roomIndex=state.currentRoom,room=D.rooms[roomIndex];
  if(state.solved[roomIndex])return {kind:'already-solved',damage:0,message:'Ya superaste esta habitación. Consulta el archivo del AFD o continúa tu aventura.'};
  const challengeIndex=state.progress[roomIndex];
  const puzzle=currentPuzzle();
  const dfa=window.SpellAFD.run(text);
  state.attempts++;
  const result={dfa,text,roomIndex,challengeIndex,puzzleId:puzzle.id,damage:0};
  if(!dfa.accepted){
   state.syntaxErrors++;result.kind='syntax-error';result.damage=1;
   state.lives=Math.max(0,state.lives-1);
   result.message=dfa.firstError.kind==='incomplete'
    ?'Faltan palabras para completar el conjuro. El AFD rechaza la sintaxis (−1 PV).'
    :`El AFD no reconoce la secuencia cerca de la posición ${dfa.firstError.index} (−1 PV). Consulta el grimorio.`;
  }else{
   const solution=puzzle.solution,{invocation,circle,action}=dfa.spell;
   if(invocation===solution.invocation&&circle===solution.circle&&action===solution.action){
    result.kind='correct';state.progress[roomIndex]++;
    result.completedRoom=state.progress[roomIndex]===totalChallenges();
    if(result.completedRoom)state.solved[roomIndex]=true;
    result.message=result.completedRoom?`¡Último sello superado! Has completado ${room.name}.`:`¡Conjuro aceptado! Enigma ${state.progress[roomIndex]} de ${totalChallenges()} superado.`;
    result.nextIndex=state.progress[roomIndex];
   }else{
    state.puzzleErrors++;result.kind='wrong-choice';result.damage=2;
    state.lives=Math.max(0,state.lives-2);
    result.message='La frase es válida para el AFD, pero no resuelve este acertijo (−2 PV). Relee los símbolos del altar.';
   }
  }
  const entry={roomIndex,challengeIndex,puzzleId:puzzle.id,text:text.slice(0,180),kind:result.kind,damage:result.damage,time:Date.now()};
  state.history[roomIndex].push(entry);
  if(state.history[roomIndex].length>100)state.history[roomIndex].splice(0,state.history[roomIndex].length-100);
  if(state.lives===0){
   state.restartCount++;state.lives=maxLives();state.progress[roomIndex]=0;state.solved[roomIndex]=false;
   result.restarted=true;result.completedRoom=false;
   result.message+=` Has agotado las vidas: reinicias esta habitación con ${maxLives()} PV desde el primer acertijo.`;
  }
  state.lastResult=result;save();return result;
 }
 if(!restore())resetGame('normal',false);
 window.SpellGame={state,maxLives,totalChallenges,currentPuzzle,getPuzzle,roomArchive,replayEntry,cast,resetGame,setDifficulty,restore,save,start,seenTutorial,selectRoom,nextRoom};
})();
