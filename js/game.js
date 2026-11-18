/* Motor independiente de la interfaz; tres salas y desafíos por dificultad. */
(function(){
 'use strict';
 const D=window.SpellData;
 const state={difficulty:'normal',currentRoom:0,lives:5,solved:[false,false,false],progress:[0,0,0],attempts:0,syntaxErrors:0,puzzleErrors:0,restartCount:0,lastResult:null,started:false,tutorialSeen:false};
 const SAVE_KEY='spellscript-v2-save';
 const validModes=Object.keys(D.difficulty);
 const maxLives=()=>D.difficulty[state.difficulty].lives;
 const totalChallenges=()=>D.difficulty[state.difficulty].riddles;
 const currentPuzzle=()=>D.rooms[state.currentRoom].puzzles[Math.min(state.progress[state.currentRoom],totalChallenges()-1)];
 function save(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify({...state,lastResult:null}));}catch(e){}
 }
 function restore(){
  try{
   const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
   if(!saved||!validModes.includes(saved.difficulty)||!Array.isArray(saved.progress)||saved.progress.length!==3)return false;
   state.difficulty=saved.difficulty;
   state.progress=saved.progress.map(n=>Math.max(0,Math.min(totalChallenges(),Number.isInteger(n)?n:0)));
   state.solved=state.progress.map(n=>n>=totalChallenges());
   state.currentRoom=Math.max(0,Math.min(2,Number(saved.currentRoom)||0));
   state.lives=Math.max(1,Math.min(maxLives(),Number(saved.lives)||maxLives()));
   for(const k of ['attempts','syntaxErrors','puzzleErrors','restartCount'])state[k]=Math.max(0,Number(saved[k])||0);
   state.started=Boolean(saved.started);state.tutorialSeen=Boolean(saved.tutorialSeen);
   return true;
  }catch(e){return false;}
 }
 function resetGame(mode=state.difficulty,preserveTutorial=true){
  state.difficulty=validModes.includes(mode)?mode:'normal';state.currentRoom=0;state.lives=maxLives();
  state.progress=[0,0,0];state.solved=[false,false,false];state.attempts=0;state.syntaxErrors=0;state.puzzleErrors=0;state.restartCount=0;state.lastResult=null;state.started=false;
  if(!preserveTutorial)state.tutorialSeen=false;
  save();
 }
 function setDifficulty(mode){
  if(!validModes.includes(mode))return false;
  // Cambiar el número de pruebas altera la ruta de progresión: iniciar una partida nueva.
  resetGame(mode,true);return true;
 }
 function start(){state.started=true;save();}
 function seenTutorial(){state.tutorialSeen=true;save();}
 function selectRoom(index){
  if(!Number.isInteger(index)||index<0||index>2)return false;
  if(index>0&&!state.solved[index-1])return false;
  if(state.currentRoom!==index){state.currentRoom=index;state.lastResult=null;state.lives=maxLives();save();}
  return true;
 }
 function nextRoom(){return selectRoom(state.currentRoom+1);}
 function cast(raw){
  const input=String(raw??'');
  if(!input.trim())return {kind:'empty',damage:0,message:'Escribe primero tu conjuro. No perderás vidas.'};
  const roomIndex=state.currentRoom,room=D.rooms[roomIndex];
  if(state.solved[roomIndex])return {kind:'already-solved',damage:0,message:'Ya superaste esta habitación. Avanza a la siguiente sala.'};
  const dfa=window.SpellAFD.run(input);
  state.attempts++;
  let result={dfa,text:input,roomIndex,challengeIndex:state.progress[roomIndex],damage:0};
  if(!dfa.accepted){
   state.syntaxErrors++;result.kind='syntax-error';result.damage=1;state.lives=Math.max(0,state.lives-1);
   result.message=dfa.firstError.kind==='incomplete'?'Faltan palabras para completar el conjuro. El AFD rechaza la sintaxis (−1 PV).':`El AFD no reconoce la secuencia cerca de la posición ${dfa.firstError.index} (−1 PV). Consulta el grimorio.`;
  }else{
   const solution=currentPuzzle().solution;
   const {invocation,circle,action}=dfa.spell;
   if(invocation===solution.invocation&&circle===solution.circle&&action===solution.action){
    result.kind='correct';state.progress[roomIndex]++;
    result.completedRoom=state.progress[roomIndex]===totalChallenges();
    if(result.completedRoom)state.solved[roomIndex]=true;
    result.message=result.completedRoom?`¡Último sello superado! Has completado ${room.name}.`:`¡Conjuro aceptado! Enigma ${state.progress[roomIndex]} de ${totalChallenges()} superado. La magia responde a tus palabras.`;
    result.nextIndex=state.progress[roomIndex];
   }else{
    state.puzzleErrors++;result.kind='wrong-choice';result.damage=2;state.lives=Math.max(0,state.lives-2);
    result.message='La frase es válida para el AFD, pero no resuelve este acertijo (−2 PV). Relee los símbolos del altar.';
   }
  }
  if(state.lives===0){
   state.restartCount++;state.lives=maxLives();state.progress[roomIndex]=0;state.solved[roomIndex]=false;
   result.restarted=true;result.completedRoom=false;
   result.message+=` Has agotado las vidas: reinicias esta habitación con ${maxLives()} PV y sus acertijos desde el primero.`;
  }
  state.lastResult=result;save();return result;
 }
 restore();
 window.SpellGame={state,maxLives,totalChallenges,currentPuzzle,cast,resetGame,setDifficulty,restore,save,start,seenTutorial,selectRoom,nextRoom};
})();
