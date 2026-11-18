/* SpellScript 2: orquestación, tutorial, narrativa y visualización del AFD. */
(function(){
 'use strict';
 const $=selector=>document.querySelector(selector);
 const $$=selector=>[...document.querySelectorAll(selector)];
 const {state}=window.SpellGame;
 const D=window.SpellData;
 const G=window.SpellGame;
 const M=window.SpellMusic;
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let route='inicio',previousRoute='aventura',reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let busy=false,toastTimer=null,transitionTimer=null,visitedGrimoire=false,tutorialStep=0,tutorialOpen=false,returnFromTutorial=false;
 const modeInfo=()=>D.difficulty[state.difficulty];
 const hearts=()=>Array.from({length:G.maxLives()},(_,i)=>`<span class="${i<state.lives?'':'lost'}" aria-hidden="true">♥</span>`).join(' ');
 const hints={facil:'Las pistas incluyen la combinación completa.',normal:'Las pistas explican el significado, sin dar la frase exacta.',dificil:'Los acertijos se expresan con metáforas y la pista es más críptica.'};
 function toast(text){const e=$('#toast');e.textContent=text;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),3000);}
 function openModal(title,html){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;$('#modalBackdrop').hidden=false;$('#modalClose').focus();}
 function closeModal(){$('#modalBackdrop').hidden=true;}
 function playSound(kind,element){M.spell(kind,element);}
 function updateAudio(){const on=M.isEnabled();$('#audioButton').classList.toggle('is-on',on);$('#audioButton').textContent=on?'♫':'♩';$('#audioButton').setAttribute('aria-label',on?'Desactivar música y efectos':'Activar música suave y efectos');$('#audioButton').title=on?'Silenciar música ambiental':'Activar música ambiental';}
 function navigate(target){
  if(!$('#view-'+target))return;
  if(target==='grimorio'&&route!=='grimorio')previousRoute=route;
  route=target;
  $$('.view').forEach(view=>view.classList.toggle('active',view.id==='view-'+route));
  $$('.main-nav .nav-item').forEach(el=>el.classList.toggle('active',el.dataset.go===route||(route==='validacion'&&el.dataset.go==='aventura')));
  $('#headerLives').hidden=!(route==='aventura'||route==='validacion');
  if(route==='aventura')renderRoom();
  if(route==='validacion')renderValidation();
  if(route==='progreso')renderProgress();
  M.setTheme(route==='aventura'||route==='validacion'?D.rooms[state.currentRoom].id:'inicio');
  window.scrollTo({top:0,behavior:'instant'});
  $('#mainContent').focus({preventScroll:true});
 }
 function updateDifficultyUI(){
  $$('.difficulty-option').forEach(el=>{const chosen=el.dataset.difficulty===state.difficulty;el.classList.toggle('active',chosen);el.setAttribute('aria-pressed',String(chosen));});
  $('#difficultyDescription').textContent=`${modeInfo().riddles} acertijos por sala · ${modeInfo().lives} vidas. ${modeInfo().description}`;
  $('#progressMode').textContent=modeInfo().label;
  $('#homeTitle').setAttribute('data-mode',modeInfo().label);
  $('#startButton').innerHTML=state.started?'▶ Continuar aventura':'▶ Comenzar aventura';
 }
 function hasProgress(){return state.started||state.attempts>0||state.progress.some(n=>n>0);}
 function askDifficulty(mode){
  if(mode===state.difficulty)return;
  const next=D.difficulty[mode];
  if(!next)return;
  if(hasProgress()){
   openModal('⚔ Cambiar de dificultad',`<p>¿Cambiar a <strong>${safe(next.label)}</strong>? El número de acertijos cambia, por lo que se reiniciará <strong>toda la aventura</strong>. Esto no afecta a los archivos originales.</p><p class="modal-note">También puedes cambiarla después desde Ajustes.</p><div class="modal-extra-buttons"><button type="button" class="arcane-button primary" id="confirmDifficulty" data-mode="${mode}">Cambiar y reiniciar</button><button type="button" class="arcane-button secondary" id="cancelDifficulty">Cancelar</button></div>`);
  }else{G.setDifficulty(mode);updateDifficultyUI();renderProgress();renderRoom();toast(`Dificultad: ${next.label}`);}
 }
 function beginAdventure(){
  if(!state.tutorialSeen){tutorialStep=0;visitedGrimoire=false;showTutorial();}
  else {G.start();navigate('aventura');}
 }
 const tutorialPages=[
  {icon:'✧',title:'Bienvenido al Torreón',eyebrow:'01 · LA MISIÓN',body:'En SpellScript no basta con escribir cualquier hechizo: deberás <strong>resolver varios acertijos por habitación</strong> utilizando un lenguaje regular. Visitarás el hielo, el fuego y la niebla.'},
  {icon:'▣',title:'Consulta tu grimorio',eyebrow:'02 · EL MANUAL MÁGICO',body:'Antes de invocar nada, abre el <strong>grimorio real del juego</strong>. Allí conocerás las tres invocaciones, los círculos y las acciones. Después vuelve a este tutorial.'},
  {icon:'✦',title:'Construye un conjuro',eyebrow:'03 · EL LENGUAJE REGULAR',body:'La estructura siempre tiene tres decisiones: <strong>elemento + círculo + acción</strong>. Ejemplo:<div class="tutorial-spell">¡Aethra Ignis, despierta en el segundo círculo y rompe el sello!</div>Es válido escribirlo <strong>sin tildes, sin signos o en minúsculas</strong>.'},
  {icon:'◇',title:'El AFD y tus vidas',eyebrow:'04 · CÓMO GANAR',body:'Un AFD lee el conjuro carácter por carácter después de normalizarlo. Si la sintaxis falla, pierdes <strong>1 vida</strong>. Si el hechizo es válido pero no resuelve el enigma, pierdes <strong>2 vidas</strong>. Si aciertas, avanzas al siguiente acertijo.'},
  {icon:'⚔',title:'¡Ya puedes comenzar!',eyebrow:'05 · LISTO PARA LANZAR',body:'Lee la escena, consulta pistas y prueba las invocaciones. Pulsa <strong>Grimorio</strong> siempre que lo necesites. El botón de música activa una banda sonora suave que cambia según la sala. ¡Abre el primer sello!'}
 ];
 function showTutorial(step=tutorialStep){
  tutorialStep=Math.max(0,Math.min(4,step));tutorialOpen=true;
  const item=tutorialPages[tutorialStep];
  $('#tutorialBackdrop').hidden=false;
  $('#tutorialHeading').textContent=item.title;
  $('#tutorialPageNumber').textContent=`${tutorialStep+1} / 5`;
  $('#tutorialTrack').innerHTML=tutorialPages.map((_,i)=>`<span class="${i<=tutorialStep?'active':''}"></span>`).join('');
  $('#tutorialContent').innerHTML=`<div class="tutorial-glyph">${item.icon}</div><p class="tutorial-eyebrow">${item.eyebrow}</p><div class="tutorial-copy">${item.body}</div>`;
  $('#tutorialNext').textContent=tutorialStep===4?'▶ Entrar a la aventura':'Continuar →';
  $('#tutorialNext').disabled=tutorialStep===1&&!visitedGrimoire;
  $('#tutorialVisit').hidden=tutorialStep!==1;
  $('#tutorialSkip').textContent='Saltar tutorial';
 }
 function finishTutorial(){tutorialOpen=false;$('#tutorialBackdrop').hidden=true;returnFromTutorial=false;G.seenTutorial();G.start();updateDifficultyUI();navigate('aventura');toast('✧ ¡Tu aventura comienza!');}
 function renderHearts(){
  $('#roomHearts').innerHTML=hearts();$('#headerLives').innerHTML=hearts();
  $('#roomHearts').setAttribute('aria-label',`${state.lives} de ${G.maxLives()} puntos de vida`);
  $('#headerLives').setAttribute('aria-label',`${state.lives} de ${G.maxLives()} puntos de vida`);
 }
 function renderRoom(){
  const room=D.rooms[state.currentRoom],step=state.progress[state.currentRoom],won=state.solved[state.currentRoom],puzzle=G.currentPuzzle();
  const stage=$('#roomScreen');stage.dataset.room=room.id;stage.classList.toggle('completed',won);
  $('#adventureChapter').textContent=`Capítulo ${['I','II','III'][state.currentRoom]} · ${room.stage}`;
  $('#adventureTitle').textContent=room.name;$('#roomPanelTitle').textContent=`${room.symbol}  ${room.name}`;
  $('#roomElement').textContent=room.symbol;$('#roomElement').className=`element-icon ${room.id==='fuego'?'fire':room.id==='niebla'?'wind':'ice'}`;
  $('#roomAmbient').textContent=room.ambient;$('#roomLevelPill').textContent=`NIVEL ${String(state.currentRoom+1).padStart(2,'0')} · ${room.id.toUpperCase()}`;
  $('#roomChapterLabel').textContent=`HABITACIÓN ${state.currentRoom+1} DE 3`;
  $('#scenarioTag').textContent=`✧ ${room.stage} ✧`;
  $('#riddleCounter').textContent=won?'Todos los enigmas superados':`Acertijo ${step+1} de ${G.totalChallenges()}`;
  $('#riddlePips').innerHTML=Array.from({length:G.totalChallenges()},(_,i)=>`<i class="${i<step?'solved':i===step?'current':''}"></i>`).join('');
  $('#roomDifficulty').textContent=modeInfo().label;
  $('#puzzleTitle').innerHTML=`<span>✥</span> ${safe(puzzle.title)}`;
  $('#puzzleStory').textContent=puzzle.story;
  $('#puzzlePoem').textContent=puzzle.poem;
  $('#spellInput').disabled=won||busy;$('#castButton').disabled=won||busy;
  $('#roomSuccess').hidden=!won;
  $('#nextRoomButton').hidden=!won;
  $('#nextRoomButton').textContent=state.currentRoom===2?'✧ Ver tu victoria final →':'Continuar a la siguiente sala →';
  $('#validationButton').disabled=!state.lastResult;
  renderHearts();
  for(let i=0;i<3;i++){
   const el=$(`#sidebarRoom${i}`);el.classList.toggle('disabled',i!==state.currentRoom&&!state.solved[i]);
   el.innerHTML=`<span class="room-dot ${i===state.currentRoom?'active':''}">${state.solved[i]?'✓':i===state.currentRoom?'✦':'♧'}</span> ${i===state.currentRoom?'<strong>':''}Habitación ${i+1}${i===state.currentRoom?'</strong>':''} <span>${state.solved[i]?'✓':i>state.currentRoom?'🔒':String(i+1).padStart(2,'0')}</span>`;
  }
  makeAmbientEffects();
 }
 function setStatus(kind,message){const e=$('#spellStatus');e.className='status-box'+(kind==='correct'?' success':kind==='syntax-error'?' error':kind==='wrong-choice'?' warning':'');e.textContent=message;}
 function clearCasting(){const scene=$('#roomScreen');scene.classList.remove('casting','failed','cast-fire','cast-ice','cast-wind');void scene.offsetWidth;}
 function elementOf(result){const invocation=result?.dfa?.spell?.invocation;return invocation==='Aethra Ignis'?'fire':invocation==='Nivara Glacies'?'ice':'wind';}
 function cast(){
  if(busy)return;
  const result=G.cast($('#spellInput').value);
  if(result.kind==='empty'){setStatus('neutral',result.message);$('#spellInput').focus();return;}
  if(result.kind==='already-solved'){toast(result.message);return;}
  busy=true;clearCasting();
  const stage=$('#roomScreen');const element=elementOf(result);
  stage.classList.add(element==='fire'?'cast-fire':element==='ice'?'cast-ice':'cast-wind');
  stage.classList.add(result.kind==='correct'?'casting':'failed');
  const spellMark=result.kind==='correct'?(element==='fire'?'♨':element==='ice'?'❄':'≋'):'✕';
  $('#castEffect').textContent=spellMark;
  M.spell(result.kind,element==='fire'?'fuego':element==='ice'?'hielo':'niebla');
  $('#castButton').disabled=true;$('#spellInput').disabled=true;
  setStatus(result.kind,result.kind==='correct'?'✦ El conjuro recorre los círculos arcanos...':result.message);
  $('#validationButton').disabled=true;
  clearTimeout(transitionTimer);
  transitionTimer=setTimeout(()=>{
   busy=false;stage.classList.remove('casting','failed');
   renderRoom();
   setStatus(result.kind,result.message);
   $('#validationButton').disabled=false;
   if(result.kind==='correct'){
    $('#spellInput').value='';$('#spellCount').textContent='0/180';
    if(result.completedRoom){
     toast(`✧ ¡${D.rooms[result.roomIndex].name} superada!`);
     if(result.roomIndex===2)celebrateVictory();
    }else toast(`✧ Acertijo superado: ${state.progress[state.currentRoom]} de ${G.totalChallenges()}`);
   }else if(result.restarted){
    $('#spellInput').value='';$('#spellCount').textContent='0/180';
    openModal('✧ El poder se ha agotado',`<p>Esta sala ha reiniciado sus acertijos y tienes otra oportunidad con <strong>${G.maxLives()} puntos de vida</strong>.</p><p class="modal-note">El progreso de las habitaciones anteriores se ha conservado.</p>`);
   }else toast(result.kind==='wrong-choice'?'Conjuro válido, elección equivocada: −2 PV':'Cadena no reconocida: −1 PV');
  },reducedMotion?170:1180);
 }
 function celebrateVictory(){
  const suffix=state.difficulty==='dificil'?'como un auténtico archimago':'con valentía y sabiduría';
  openModal('✦ ¡Has conquistado el Torreón!',`<p>Has resuelto los <strong>${G.totalChallenges()*3} acertijos</strong> de hielo, fuego y niebla ${suffix}.</p><p class="modal-note">Modo ${modeInfo().label} · ${state.attempts} conjuros lanzados · ${state.syntaxErrors} errores del AFD.</p><p>Abre el mapa para contemplar tus tres habitaciones completadas o cambia la dificultad para comenzar una aventura nueva.</p><div class="modal-extra-buttons"><button id="showVictoryMap" type="button" class="arcane-button primary">✦ Ver mi progreso</button></div>`);
 }
 function nextRoom(){
  if(state.currentRoom===2&&state.solved[2]){celebrateVictory();return;}
  if(G.nextRoom()){setStatus('neutral','Nuevo santuario: observa el acertijo y consulta el grimorio.');$('#spellInput').value='';$('#spellCount').textContent='0/180';navigate('aventura');toast(`Capítulo ${state.currentRoom+1} · ${D.rooms[state.currentRoom].name}`);}
 }
 function summarizeNodes(result){
  if(!result?.dfa)return '<span class="state-node first">q0</span><span class="state-arrow">→</span><span>?</span>';
  const tr=result.dfa.trace;const parts=tr.length>7?[...tr.slice(0,2),null,...tr.slice(-3)]:tr;
  return '<span class="state-node first">q0</span>'+parts.map((entry,i)=>entry===null?'<span class="state-arrow">→</span><span>···</span>':`<span class="state-arrow">→</span><span class="state-node ${entry.rejected?'reject':(result.dfa.accepted&&i===parts.length-1?'accept':'')}">${safe(entry.to)}</span>`).join('');
 }
 function verdict(element,type,title,desc){const icons={ok:'✓',bad:'✕',neutral:'!'};element.className='verdict-row '+type;element.querySelector('.verdict-icon').textContent=icons[type];element.querySelector('strong').textContent=title;element.querySelector('p').textContent=desc;}
 function renderValidation(){
  const r=state.lastResult;
  if(!r?.dfa){$('#reviewSpell').textContent='Primero lanza un conjuro desde una habitación.';$('#normalizedSpell').hidden=true;$('#dfaChain').innerHTML=summarizeNodes(null);$('#traceScroller').textContent='Todavía no hay transiciones.';$('#transitionCount').textContent='0 transiciones';$('#validationReport').textContent='El registro comienza tras un intento de conjuro.';return;}
  $('#reviewSpell').textContent=r.text;
  $('#normalizedSpell').hidden=false;
  $('#normalizedSpell').textContent='Forma normalizada que leyó el AFD: '+r.dfa.normalized;
  $('#dfaChain').innerHTML=summarizeNodes(r);
  $('#transitionCount').textContent=`${r.dfa.trace.length} transiciones`;
  $('#traceScroller').innerHTML=r.dfa.trace.map(step=>`<div class="trace-row ${step.rejected?'rejected':''}"><span>#${step.position}</span><span class="char">${safe(step.symbol===' '?'␣ espacio':step.symbol)}</span><span>${safe(step.from)}</span><span>→ ${safe(step.to)}</span></div>`).join('');
  if(r.dfa.accepted){verdict($('#syntaxVerdict'),'ok','Sintaxis aceptada','La cadena normalizada pertenece al lenguaje regular.');verdict($('#puzzleVerdict'),r.kind==='correct'?'ok':'bad',r.kind==='correct'?'¡Acertijo resuelto!':'Conjuro inadecuado',r.kind==='correct'?'El AFD aceptó y las reglas del enigma coinciden.':'El AFD aceptó, pero la combinación no corresponde al enigma.');}
  else{verdict($('#syntaxVerdict'),'bad','Sintaxis rechazada',r.dfa.firstError.kind==='incomplete'?'La frase está incompleta.':`No se reconoce el carácter en la posición ${r.dfa.firstError.index}.`);verdict($('#puzzleVerdict'),'neutral','Acertijo no evaluado','Primero debes superar el reconocimiento formal.');}
  $('#validationReport').textContent=`Estado: ${r.dfa.endState} · AFD: ${r.dfa.accepted?'ACEPTA':'RECHAZA'} · Comprobación independiente: ${r.dfa.byRegex?'ACEPTA':'RECHAZA'} · Coinciden: ${r.dfa.accepted===r.dfa.byRegex?'SÍ':'NO'} · Daño: ${r.damage} PV.`;
  $('#continueFromValidation').textContent=state.solved[state.currentRoom]?'Ver progreso →':'Continuar aventura →';
 }
 function renderProgress(){
  const total=G.totalChallenges()*3,completed=state.progress.reduce((a,b)=>a+b,0),won=state.solved.filter(Boolean).length;
  $('#progressBar').style.width=`${Math.round(completed/total*100)}%`;
  $('#progressText').textContent=`${completed} de ${total} acertijos · ${won}/3 salas`;
  $('#progressHeadingDetail').textContent=`Tres habitaciones · ${G.totalChallenges()} acertijos por sala · Modo ${modeInfo().label}.`;
  $('#progressMode').textContent=modeInfo().label;
  $('#totalAttempts').textContent=state.attempts;$('#syntaxErrors').textContent=state.syntaxErrors;$('#puzzleErrors').textContent=state.puzzleErrors;
  for(let i=0;i<3;i++){
   const unlocked=i===0||state.solved[i-1],won=state.solved[i];
   const card=$(`#levelCard${i}`),button=i===0?$('#playFromProgress'):$(`#playRoom${i}`);
   card.classList.toggle('locked',!unlocked);card.classList.toggle('unlocked',unlocked);card.classList.toggle('finished',won);
   button.disabled=!unlocked;button.textContent=!unlocked?'🔒 Bloqueada':won?'✓ Revisar sala':state.progress[i]>0?'▶ Continuar':'▶ Jugar';
   $(`#levelProgress${i}`).textContent=`${state.progress[i]} de ${G.totalChallenges()} acertijos superados${won?' · Habitación completada.':''}`;
  }
  updateDifficultyUI();
 }
 function makeAmbientEffects(){
  const container=$('#snowfall');container.replaceChildren();if(reducedMotion)return;
  const room=D.rooms[state.currentRoom];
  for(let i=0;i<29;i++){
   const particle=document.createElement('span');particle.className=`snowflake atmosphere-${room.id}`;
   particle.textContent=room.id==='hielo'?(i%3===0?'❄':'·'):room.id==='fuego'?(i%5===0?'✦':'•'):(i%4===0?'✧':'·');
   particle.style.setProperty('--x',((i*41+12)%100)+'%');particle.style.setProperty('--size',(8+i%9)+'px');particle.style.setProperty('--speed',(7+i%7)+'s');particle.style.setProperty('--delay',(-i*1.23)+'s');particle.style.setProperty('--wind',((i%2?-1:1)*(23+i%50))+'px');container.appendChild(particle);
  }
 }
 function makeParticles(){const container=$('#particles');container.replaceChildren();if(reducedMotion)return;for(let i=0;i<27;i++){const el=document.createElement('i');el.className='particle';el.style.left=((i*37+13)%99)+'%';el.style.top=((i*29+17)%98)+'%';el.style.setProperty('--duration',(8+i%9)+'s');el.style.setProperty('--delay',(-i*.7)+'s');el.style.setProperty('--drift',(-28+i%8*9)+'px');container.appendChild(el);}}
 function setReducedMotion(value){reducedMotion=Boolean(value);document.body.classList.toggle('reduce-motion',reducedMotion);makeParticles();makeAmbientEffects();}
 function showSettings(){
  openModal('⚙ Configuración del aprendiz',`<div class="settings-fields"><label class="settings-row">Dificultad <select id="difficultyInSettings"><option value="facil" ${state.difficulty==='facil'?'selected':''}>Fácil · Aprendiz</option><option value="normal" ${state.difficulty==='normal'?'selected':''}>Intermedio · Aventurero</option><option value="dificil" ${state.difficulty==='dificil'?'selected':''}>Difícil · Archimago</option></select></label><p class="modal-note">Cambiar la dificultad después de comenzar reinicia la partida porque modifica el número de enigmas.</p><div class="settings-row"><span>♫ Música ambiental</span><button type="button" id="settingsAudioButton" class="arcane-button secondary small">${M.isEnabled()?'Desactivar':'Activar'}</button></div><label class="settings-row">Volumen <input type="range" id="volumeRange" min="0" max="100" value="${Math.round(M.getVolume()*100)}" aria-label="Volumen de la música"/><span id="volumeValue">${Math.round(M.getVolume()*100)}%</span></label><label class="settings-row">Animaciones reducidas <input type="checkbox" id="reduceMotionOption" ${reducedMotion?'checked':''}/></label><button type="button" class="arcane-button secondary" id="replayTutorial">✧ Repetir tutorial</button><button type="button" class="arcane-button secondary" id="resetGameButton">↻ Reiniciar partida</button></div>`);
 }
 /* Navegación */
 $$('.nav-link').forEach(el=>el.addEventListener('click',()=>el.dataset.go==='aventura'&&!state.started?beginAdventure():navigate(el.dataset.go)));
 $$('[data-go]').filter(el=>!el.classList.contains('nav-link')).forEach(el=>el.addEventListener('click',()=>el.dataset.go==='aventura'&&!state.started?beginAdventure():navigate(el.dataset.go)));
 $('#startButton').addEventListener('click',beginAdventure);
 $('#tutorialReplayHome').addEventListener('click',()=>{tutorialStep=0;visitedGrimoire=false;showTutorial();});
 $('#tutorialSkip').addEventListener('click',finishTutorial);
 $('#tutorialNext').addEventListener('click',()=>{if(tutorialStep===4){finishTutorial();return;}if(tutorialStep===1&&!visitedGrimoire)return;showTutorial(tutorialStep+1);});
 $('#tutorialVisit').addEventListener('click',()=>{returnFromTutorial=true;tutorialOpen=false;$('#tutorialBackdrop').hidden=true;navigate('grimorio');toast('Lee los elementos y la fórmula, luego pulsa «Volver»');});
 $('#returnFromGrimoire').addEventListener('click',()=>{if(returnFromTutorial){returnFromTutorial=false;visitedGrimoire=true;showTutorial(2);}else navigate(previousRoute==='inicio'?'inicio':'aventura');});
 $$('.difficulty-option').forEach(el=>el.addEventListener('click',()=>askDifficulty(el.dataset.difficulty)));
 $('#playFromProgress').addEventListener('click',()=>{G.selectRoom(0);navigate('aventura');});
 $('#playRoom1').addEventListener('click',()=>{if(G.selectRoom(1))navigate('aventura');else toast('Debes superar la habitación anterior.');});
 $('#playRoom2').addEventListener('click',()=>{if(G.selectRoom(2))navigate('aventura');else toast('Debes superar la habitación anterior.');});
 $('#nextRoomButton').addEventListener('click',nextRoom);
 $('#castButton').addEventListener('click',cast);
 $('#spellInput').addEventListener('input',()=>$('#spellCount').textContent=`${[...$('#spellInput').value].length}/180`);
 $('#spellInput').addEventListener('keydown',event=>{if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();cast();}});
 $('#openGrimoire').addEventListener('click',()=>navigate('grimorio'));
 $('#hintButton').addEventListener('click',()=>{const r=G.currentPuzzle();openModal(`✧ Pista: ${r.title}`,`<p>${safe(r.hints[state.difficulty])}</p><p class="modal-note">Consultar pistas no gasta puntos de vida. Modo ${modeInfo().label}: ${safe(hints[state.difficulty])}</p>`);});
 $('#validationButton').addEventListener('click',()=>navigate('validacion'));
 $('#continueFromValidation').addEventListener('click',()=>navigate(state.solved[state.currentRoom]?'progreso':'aventura'));
 $('#audioButton').addEventListener('click',()=>{const on=M.toggle();updateAudio();toast(on?`♫ Ambiente suave activado · ${D.rooms[state.currentRoom].music}`:'Música y sonidos desactivados');});
 $('#settingsButton').addEventListener('click',showSettings);
 $('#modalClose').addEventListener('click',closeModal);$('#modalOk').addEventListener('click',closeModal);
 $('#modalBackdrop').addEventListener('click',event=>{if(event.target===$('#modalBackdrop'))closeModal();});
 window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#modalBackdrop').hidden)closeModal();});
 $('#modalBody').addEventListener('click',event=>{
  const t=event.target;
  if(t.id==='resetGameButton'){G.resetGame();closeModal();updateDifficultyUI();renderProgress();renderRoom();setStatus('neutral','Partida reiniciada. ¡Elige de nuevo tus conjuros!');navigate('inicio');toast('Aventura reiniciada.');}
  if(t.id==='confirmDifficulty'){G.setDifficulty(t.dataset.mode);closeModal();renderProgress();renderRoom();setStatus('neutral','Nueva dificultad seleccionada.');navigate('inicio');toast(`Nuevo modo: ${modeInfo().label}`);}
  if(t.id==='cancelDifficulty')closeModal();
  if(t.id==='showVictoryMap'){closeModal();navigate('progreso');}
  if(t.id==='settingsAudioButton'){M.toggle();updateAudio();t.textContent=M.isEnabled()?'Desactivar':'Activar';toast(M.isEnabled()?'Música suave activada':'Audio desactivado');}
  if(t.id==='replayTutorial'){closeModal();tutorialStep=0;visitedGrimoire=false;showTutorial();}
 });
 $('#modalBody').addEventListener('change',event=>{
  const el=event.target;
  if(el.id==='difficultyInSettings'){const choice=el.value;closeModal();askDifficulty(choice);}
  if(el.id==='reduceMotionOption')setReducedMotion(el.checked);
  if(el.id==='volumeRange'){M.setVolume(Number(el.value)/100);$('#volumeValue').textContent=el.value+'%';}
 });
 $('#modalBody').addEventListener('input',event=>{if(event.target.id==='volumeRange'){M.setVolume(Number(event.target.value)/100);$('#volumeValue').textContent=event.target.value+'%';}});
 updateDifficultyUI();renderRoom();renderProgress();makeParticles();updateAudio();
 window.SpellUI={navigate,renderRoom,renderProgress,renderValidation,showTutorial,setReducedMotion,cast};
})();
