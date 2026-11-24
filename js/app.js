/* SpellScript 2: orquestación, tutorial, narrativa y visualización del AFD. */
(function(){
 'use strict';
 const $=selector=>document.querySelector(selector);
 const $$=selector=>[...document.querySelectorAll(selector)];
 const {state}=window.SpellGame;
 const D=window.SpellData;
 const G=window.SpellGame;
 const M=window.SpellMusic;
 const N=window.SpellNatural,T=window.SpellAdventureTutor;
 let tutorAdvice=null, tutorPuzzle=null;const cinemaSeen=new Set();
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let route='inicio',previousRoute='aventura',reducedMotion=window.SpellGraphics.get()!=='full';
 let busy=false,toastTimer=null,transitionTimer=null,visitedGrimoire=false,tutorialStep=0,tutorialOpen=false,returnFromTutorial=false;
 let reviewRoomIndex=null,reviewChallengeIndex=0,archiveResult=null,doorOpening=false;
 let practiceRoom=0,educationResult=null,selectedPracticeId=null,tutorialPracticeDone=false;
 const shownRoomIndex=()=>reviewRoomIndex===null?state.currentRoom:reviewRoomIndex;
 const isReviewing=()=>reviewRoomIndex!==null;
 const modeInfo=()=>D.difficulty[state.difficulty];
 const hearts=()=>Array.from({length:G.maxLives()},(_,i)=>`<span class="${i<state.lives?'':'lost'}" aria-hidden="true">♥</span>`).join(' ');
 const hints={facil:'Las pistas pueden indicar elemento, fuerza y acción.',normal:'Las pistas explican el significado, sin dar la frase exacta.',dificil:'Los acertijos se expresan con metáforas y la pista es más críptica.'};
 function toast(text){const e=$('#toast');e.textContent=text;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),3000);}
 function openModal(title,html){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;$('#modalBackdrop').hidden=false;$('#modalClose').focus();}
 function closeModal(){$('#modalBackdrop').hidden=true;}
 function playSound(kind,element){M.spell(kind,element);}
 function updateAudio(){const on=M.isEnabled();$('#audioButton').classList.toggle('is-on',on);$('#audioButton').textContent=on?'♫':'♩';$('#audioButton').setAttribute('aria-label',on?'Desactivar música y efectos':'Activar música suave y efectos');$('#audioButton').title=on?'Silenciar música ambiental':'Activar música ambiental';}
 function navigate(target){
  if(!$('#view-'+target))return;
  if((busy||doorOpening)&&target!==route){toast('✧ Espera a que el conjuro termine su animación.');return;}
  if(target==='grimorio'&&route!=='grimorio')previousRoute=route;
  if(route==='validacion'&&target!=='validacion')window.SpellAFDView.pause();
  route=target;
  $$('.view').forEach(view=>view.classList.toggle('active',view.id==='view-'+route));
  $$('.main-nav .nav-item').forEach(el=>el.classList.toggle('active',el.dataset.go===route||(route==='validacion'&&el.dataset.go==='aventura')));
  $('#headerLives').hidden=!(route==='aventura'||route==='validacion');
  if(route==='aventura'){renderRoom();if(state.started&&!isReviewing()&&state.currentRoom===1&&!cinemaSeen.has('fuego')){cinemaSeen.add('fuego');window.SpellCinema.play('fuego');}}
  if(route==='validacion')renderValidation();
  if(route==='progreso')renderProgress();
  if(route==='practica')renderPractice();
  if(route==='grimorio'){renderLearningStats();renderBook();}
  M.setTheme(route==='aventura'||route==='validacion'?D.rooms[shownRoomIndex()].id:route==='practica'?D.rooms[practiceRoom].id:'inicio');
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
 function openArchive(index){
  if(busy||doorOpening)return;
  if(!state.solved[index]){toast('Termina esa habitación para abrir su archivo.');return;}
  reviewRoomIndex=index;reviewChallengeIndex=0;
  const archive=G.roomArchive(index);
  archiveResult=G.replayEntry(archive[0]);
  $('#archiveChallenge').innerHTML=archive.map((entry,i)=>`<option value="${i}">✧ ${i+1}. ${safe(entry.title)}</option>`).join('');
  $('#archiveChallenge').value='0';
  navigate('aventura');
  toast('✧ Archivo abierto. Puedes consultar los recorridos sin perder vidas.');
 }
 function closeArchive(){
  if(busy||doorOpening)return;
  reviewRoomIndex=null;archiveResult=null;reviewChallengeIndex=0;
  $('#spellInput').value='';$('#spellCount').textContent='0/180';
  navigate('aventura');
  setStatus('neutral','Has regresado a tu partida. No perdiste vidas ni avances.');
 }
 function selectAdventureRoom(index){
  if(busy||doorOpening)return;
  if(state.solved[index]){openArchive(index);return;}
  if(G.selectRoom(index)){
   reviewRoomIndex=null;archiveResult=null;
   $('#spellInput').value='';$('#spellCount').textContent='0/180';
   navigate('aventura');
  } else toast('Debes superar primero la habitación anterior.');
 }
 function askDifficulty(mode){
  if(mode===state.difficulty)return;
  const next=D.difficulty[mode];
  if(!next)return;
  if(hasProgress()){
   openModal('⚔ Cambiar de dificultad',`<p>¿Cambiar a <strong>${safe(next.label)}</strong>? El número de acertijos cambia, por lo que se reiniciará <strong>toda la aventura</strong>. Esto no afecta a los archivos originales.</p><p class="modal-note">También puedes cambiarla después desde Ajustes.</p><div class="modal-extra-buttons"><button type="button" class="arcane-button primary" id="confirmDifficulty" data-mode="${mode}">Cambiar y reiniciar</button><button type="button" class="arcane-button secondary" id="cancelDifficulty">Cancelar</button></div>`);
  }else{reviewRoomIndex=null;archiveResult=null;G.setDifficulty(mode);updateDifficultyUI();renderProgress();renderRoom();toast(`Dificultad: ${next.label}`);}
 }
 function beginAdventure(){
  if(!state.tutorialSeen){tutorialStep=0;visitedGrimoire=false;showTutorial();}
  else {const first=!state.started;G.start();navigate('aventura');if(first&&!cinemaSeen.has('inicio')){cinemaSeen.add('inicio');window.SpellCinema.play('inicio');}}
 }
 const tutorialPages=[
  {icon:'✧',title:'Bienvenido al Torreón',eyebrow:'01 · LA MISIÓN',body:'En SpellScript no basta con escribir cualquier hechizo: deberás <strong>resolver varios acertijos por habitación</strong> utilizando un lenguaje regular. Visitarás el hielo, el fuego y la niebla.'},
  {icon:'▣',title:'Consulta tu grimorio',eyebrow:'02 · EL MANUAL MÁGICO',body:'Antes de invocar nada, abre el <strong>grimorio real del juego</strong>. Allí conocerás las tres invocaciones, los círculos y las acciones. Después vuelve a este tutorial.'},
  {icon:'✦',title:'Construye un conjuro',eyebrow:'03 · EL LENGUAJE REGULAR',body:'Elige <strong>elemento, intensidad y acción</strong>. Usa una de las fórmulas del grimorio. En Fácil: <div class="tutorial-spell">Que el fuego despierte con un soplo de poder y rompa el sello que guarda este lugar.</div> En Intermedio, une acciones con «y»; en Difícil, usa una condición inicial con coma.'},
  {icon:'◇',title:'El AFD y tus vidas',eyebrow:'04 · CÓMO GANAR',body:'Un AFD lee el conjuro carácter por carácter después de normalizarlo. Si la sintaxis falla, pierdes <strong>1 vida</strong>. Si el hechizo es válido pero no resuelve el enigma, pierdes <strong>2 vidas</strong>. Si aciertas, avanzas al siguiente acertijo.'},
  {icon:'✎',title:'Comas y conectores',eyebrow:'05 · ESCRITURA EN ESPAÑOL',body:'Los conectores son obligatorios cuando la fórmula los necesita. En Difícil la condición inicial exige coma. Aether te acompaña cuando tropiezas. Por ejemplo, «Si el hielo se derrite, podremos entrar» lleva coma después de la condición inicial.'},
  {icon:'◇',title:'Aprende de los errores',eyebrow:'06 · TUTOR DEL AFD',body:'En el panel del autómata verás de dónde sale una transición, <strong>qué símbolo lee</strong>, a qué estado llega y cómo corregir el error. Aether te ayuda dentro de la aventura. El grimorio incluye <strong>Mi progreso como escritor</strong> y recomendaciones basadas en tus intentos de aventura y entrenamiento.'},
  {icon:'✦',title:'Una práctica antes de salir',eyebrow:'07 · PRÁCTICA INTERACTIVA',body:'Completa la frase del taller escribiendo una coma: <strong>«Si hay hielo, caminaremos despacio.»</strong><div class="tutorial-mini"><label for="tutorialMiniInput">Completa: «Si hay hielo caminaremos despacio.»</label><input id="tutorialMiniInput" type="text" placeholder="Escribe aquí la oración corregida" autocomplete="off"><button type="button" id="tutorialMiniCheck" class="arcane-button secondary small">✓ Comprobar sin perder vidas</button><p id="tutorialMiniMessage" role="status">Practicar es opcional, pero te prepara para el AFD educativo.</p></div>'},
  {icon:'⚔',title:'¡Ya puedes comenzar!',eyebrow:'08 · LISTO PARA LANZAR',body:'Lee el acertijo, consulta el grimorio y utiliza pistas sin penalización. Los desafíos siguen intactos y el entrenamiento arcano es opcional. ¡Abre el primer sello!'}
 ];
 function showTutorial(step=tutorialStep){
  tutorialStep=Math.max(0,Math.min(tutorialPages.length-1,step));tutorialOpen=true;
  const item=tutorialPages[tutorialStep];
  $('#tutorialBackdrop').hidden=false;
  $('#tutorialHeading').textContent=item.title;
  $('#tutorialPageNumber').textContent=`${tutorialStep+1} / ${tutorialPages.length}`;
  $('#tutorialTrack').innerHTML=tutorialPages.map((_,i)=>`<span class="${i<=tutorialStep?'active':''}"></span>`).join('');
  $('#tutorialContent').innerHTML=`<div class="tutorial-glyph">${item.icon}</div><p class="tutorial-eyebrow">${item.eyebrow}</p><div class="tutorial-copy">${item.body}</div>`;
  $('#tutorialNext').textContent=tutorialStep===tutorialPages.length-1?'▶ Entrar a la aventura':'Continuar →';
  $('#tutorialNext').disabled=tutorialStep===1&&!visitedGrimoire;
  $('#tutorialVisit').hidden=tutorialStep!==1;
  $('#tutorialSkip').textContent='Saltar tutorial';
 }
 function finishTutorial(){tutorialOpen=false;$('#tutorialBackdrop').hidden=true;returnFromTutorial=false;G.seenTutorial();G.start();updateDifficultyUI();navigate('aventura');toast('✧ ¡Tu aventura comienza!');if(!cinemaSeen.has('inicio')){cinemaSeen.add('inicio');window.SpellCinema.play('inicio');}}
 function renderHearts(){
  $('#roomHearts').innerHTML=hearts();$('#headerLives').innerHTML=hearts();
  $('#roomHearts').setAttribute('aria-label',`${state.lives} de ${G.maxLives()} puntos de vida`);
  $('#headerLives').setAttribute('aria-label',`${state.lives} de ${G.maxLives()} puntos de vida`);
 }
 function moveAether(){const card=$('#aetherCard');const target=window.innerWidth>1050?$('#aetherSceneDock'):$('#aetherMobileDock');if(card.parentElement!==target)target.appendChild(card);}
 function renderEncounter(room,step,won){const total=G.totalChallenges(),done=won?total:Math.min(step,total),remaining=total-done;
  $('#encounterTitle').textContent=['SELLOS DE HIELO','RESISTENCIA DEL GUARDIÁN','SECRETOS EN LA NIEBLA'][room];
  $('#encounterValue').textContent=room===1?`${Math.round(remaining/total*100)}%`:`${done} / ${total}`;
  $('#encounterMeter').style.width=`${(room===1?remaining:done)/total*100}%`;
  $('#encounterRunes').innerHTML=Array.from({length:total},(_,i)=>`<span class="encounter-rune ${i<done?'lit':''}">${i<done?'✦':room===0?'❄':room===1?'◈':'◇'}</span>`).join('');
  $('#encounterUI').dataset.kind=D.rooms[room].id;$('#roomScreen').style.setProperty('--room-reveal',done/total);$('#inspectRune').disabled=won;
  $('#inspectRune').textContent=['✧ Examinar cristal','✧ Estudiar al guardián','✧ Revelar inscripción'][room];
 }
 function showAether(advice){if(!advice?.show){if(advice?.kind==='error'){tutorAdvice=null;$('#aetherMood').textContent='GUÍA ARCANO';$('#aetherMessage').textContent='Consulta las pistas de la escena o el recorrido del autómata.';$('#aetherApply').hidden=true;}return;}tutorAdvice=advice;$('#aetherMood').textContent=advice.kind==='success'?'¡MAGIA DESPIERTA!':'CONSEJO ARCANO';$('#aetherMessage').textContent=advice.message+(advice.gain?' +'+advice.gain+' XP':'');$('#aetherBuild').hidden=!(state.difficulty==='facil'&&(advice.guide||advice.kind!=='success'));$('#aetherApply').hidden=!advice.suggestion||state.difficulty!=='facil';const card=$('#aetherCard');card.classList.remove('aether-react');void card.offsetWidth;card.classList.add('aether-react');}
 function buildSpell(){const b=$('#spellBuilder');b.hidden=false;b.innerHTML=`<p>Elige las tres piezas de tu conjuro:</p><div class="builder-fields"><label>Elemento<select id="buildElement">${N.elements.map((v,i)=>`<option value="${i}">${v}</option>`).join('')}</select></label><label>Acción<select id="buildAction">${N.verbs.map((v,i)=>`<option value="${i}">${v}</option>`).join('')}</select></label><label>Fuerza<select id="buildForce">${N.forces.map((v,i)=>`<option value="${i}">${v}</option>`).join('')}</select></label></div><button type="button" id="buildInsert" class="arcane-button secondary small">Preparar conjuro</button>`;$('#buildInsert').onclick=()=>{if(busy)return;const solution={invocation:D.invocations[+$('#buildElement').value],action:D.actions[+$('#buildAction').value],circle:D.circles[+$('#buildForce').value]};$('#spellInput').value=N.example(solution,state.difficulty);$('#spellInput').dispatchEvent(new Event('input'));b.hidden=true;$('#spellInput').focus();};}
 function renderBook(){const mode=state.difficulty;$('#bookNaturalFormula').textContent=N.describe(mode);const sample={invocation:D.invocations[0],circle:D.circles[1],action:D.actions[0]};$('#spellVariants').innerHTML=`<h3>✦ Fórmulas del ${safe(modeInfo().label)}</h3><p>Distintas expresiones pueden producir el mismo efecto. Cambia elemento, acción e intensidad según el enigma. Intensidad: «con un soplo de poder» (leve), «con renovada fuerza» (media), «con todo su poder» (máxima).</p>${(T.stats().xp>=450?[0,1,2]:T.stats().xp>=180?[0,1]:[0]).map(i=>`<div class="spell-example">${safe(N.example(sample,mode,i))}</div>`).join('')}<p>Rango ${safe(T.rank())}. ${T.stats().xp>=180?'Has desbloqueado el folio de fórmulas alternativas: ': 'Al alcanzar Invocador (180 XP) desbloquearás el folio de fórmulas alternativas.'}${T.stats().xp>=180?safe(N.example(sample,mode,1)) : ''} Ningún hechizo necesario está bloqueado.</p><div class="spell-example">Acciones: ${N.epicActions.map(safe).join(" · ")}</div>`;}
 function renderRewards(){const r=T.stats(),rank=T.rank(),next=r.xp<180?180:r.xp<450?450:r.xp<900?900:900;$('#journeyRewards').innerHTML=`<div class="reward-rank"><span class="rank-emblem">${rank==='Archimago'?'♛':rank==='Hechicero'?'✵':'✦'}</span><div><strong>${safe(rank)}</strong><p>${r.xp} XP · ${r.xp>=900?'Rango máximo':next+' XP para el siguiente rango'}</p><div class="xp-track"><i style="width:${Math.min(100,r.xp/next*100)}%"></i></div></div></div><div class="reward-stats"><span>✦ ${r.unlocked} retos únicos</span><span>◇ ${r.discovered} secretos</span><span>⚡ ${r.best} mejor racha</span><span>✓ ${r.corrections} correcciones</span></div>`;}
 function renderIntuitive(r){const box=$('#intuitiveAFD');if(!r?.dfa){box.innerHTML='<h3>El lenguaje de la magia</h3><p>Lanza un conjuro para explorar su recorrido.</p>';return;}
  const d=r.dfa, fault=d.firstError,marks=d.natural?N.segment(d):[{label:'Expresión',end:d.trace.length}];let previous=0;const segments=marks.map(m=>{const start=previous;previous=m.end;const rejected=fault&&fault.index<=m.end;const later=fault&&fault.index<=start;const status=later?'pending':rejected?'bad':'ok';return `<div class="intuitive-segment ${status}"><span>${later?'·':rejected?'×':'✓'}</span><strong>${safe(m.label)}</strong><small>${safe(d.normalized.slice(start,m.end).trim())}</small><small>${safe(d.trace[start]?.from||'q0')} → ${safe(d.trace[m.end-1]?.to||'q0')}</small></div>`;}).join('')+(fault?.kind==='incomplete'?'<div class="intuitive-segment bad"><span>×</span><strong>Falta completar</strong><small>La cadena terminó antes del estado final.</small><small>'+safe(d.endState)+'</small></div>':'');
  const explanation=window.SpellAFDTutor.review(r);box.innerHTML=`<div class="intuitive-title"><img src="assets/characters/aether/illustrated.webp" alt=""><div><span class="chapter-label">AETHER · RECONOCIMIENTO</span><h3>${d.accepted?'La magia reconoce tus palabras':'El conjuro necesita un ajuste'}</h3></div></div><p class="intuitive-phrase">${safe(r.text)}</p><div class="intuitive-flow">${segments}</div><p class="intuitive-feedback">${safe(explanation.message)}</p>${explanation.suggestion&&!d.accepted?`<p class="intuitive-correction">Modelo formal: ${safe(explanation.suggestion)}</p>`:''}<small>Los bloques agrupan transiciones reales; el recorrido académico muestra cada carácter y su estado. ${!d.accepted?'La corrección no consume vidas hasta que vuelvas a lanzar.':''}</small>`;}
 function renderRoom(){
  const roomIndex=shownRoomIndex(),room=D.rooms[roomIndex],reviewing=isReviewing();
  const step=reviewing?reviewChallengeIndex:state.progress[roomIndex];
  const won=state.solved[roomIndex],puzzle=reviewing?G.getPuzzle(roomIndex,step):G.currentPuzzle();
  const stage=$('#roomScreen');
  stage.dataset.room=room.id;
  stage.classList.toggle('reviewing',reviewing);
  stage.classList.toggle('completed',won&&!doorOpening&&!reviewing);
  $('#adventureSectionLabel').textContent=reviewing?'✧ ARCHIVO ARCANO · SALA COMPLETADA':'AVENTURA PRINCIPAL';
  $('#archiveToolbar').hidden=!reviewing;
  if(reviewing){
   $('#archiveChallenge').value=String(reviewChallengeIndex);
   $('#archiveTraceButton').disabled=!archiveResult;
  }
  $('#adventureChapter').textContent=`Capítulo ${['I','II','III'][roomIndex]} · ${room.stage}`;
  $('#adventureTitle').textContent=room.name;
  $('#roomPanelTitle').textContent=`${room.symbol}  ${room.name}`;
  $('#roomElement').textContent=room.symbol;
  $('#roomElement').className=`element-icon ${room.id==='fuego'?'fire':room.id==='niebla'?'wind':'ice'}`;
  $('#roomAmbient').textContent=room.ambient;
  $('#roomLevelPill').textContent=`NIVEL ${String(roomIndex+1).padStart(2,'0')} · ${room.id.toUpperCase()}`;
  $('#roomChapterLabel').textContent=reviewing?'✧ HISTORIAL DE CONJUROS':`HABITACIÓN ${roomIndex+1} DE 3`;
  $('#scenarioTag').textContent=`✧ ${room.stage} ✧`;
  $('#riddleCounter').textContent=reviewing?`Revisión ${step+1} de ${G.totalChallenges()}`:won?'Todos los enigmas superados':`Acertijo ${step+1} de ${G.totalChallenges()}`;
  $('#riddlePips').innerHTML=Array.from({length:G.totalChallenges()},(_,i)=>`<i class="${reviewing?(i===step?'current':'solved'):(i<step?'solved':i===step?'current':'')}"></i>`).join('');
  $('#roomDifficulty').textContent=modeInfo().label;
  $('#puzzleTitle').innerHTML=`<span>✥</span> ${safe(puzzle.title)}`;
  $('#puzzleStory').textContent=puzzle.story;
  $('#puzzlePoem').textContent=puzzle.poem;
  $('#spellLabel').textContent=reviewing?'CONJURO DEL HISTORIAL':'ESCRIBE TU CONJURO';
  $('#spellInput').disabled=reviewing||won||busy;
  $('#castButton').disabled=reviewing||won||busy;
  $('#castButton').hidden=reviewing;
  $('#inputHelp').textContent=reviewing?'Una lectura guardada del AFD; no se gastan vidas.':state.difficulty==='dificil'?'La coma de la condición es obligatoria.':'Tildes y mayúsculas opcionales.';
  $('#naturalFormula').textContent=N.describe(state.difficulty);$('#quickFormula').textContent=N.describe(state.difficulty);moveAether();$('#naturalRules').textContent=(state.difficulty==='dificil'?'La coma tras la condición es obligatoria. ':'Usa el conector de la fórmula. ')+'Intensidad: un soplo de poder (leve), renovada fuerza (media), todo su poder (máxima).';
  $('#spellInput').placeholder=state.difficulty==='dificil'?'Aunque el camino esté cerrado, que…':state.difficulty==='normal'?'Que el … despierte y …':'Que el …';
  $('#aetherCard').hidden=reviewing;$('#encounterUI').hidden=reviewing;
  if(tutorPuzzle!==puzzle.id){tutorPuzzle=puzzle.id;$('#aetherMessage').textContent='Examina la escena. ¿Qué elemento, fuerza y acción necesitas?';$('#aetherMood').textContent='GUÍA ARCANO';$('#spellBuilder').hidden=true;$('#aetherBuild').hidden=state.difficulty!=='facil';$('#aetherApply').hidden=true;$('#encounterClue').hidden=true;tutorAdvice=null;}
  renderEncounter(roomIndex,step,won);window.SpellScenes.render(room.id,reviewing?G.totalChallenges():step,G.totalChallenges());
  if(reviewing){
   $('#spellInput').value=archiveResult?.text||'';
   $('#spellCount').textContent=`${[...$('#spellInput').value].length}/180`;
   $('#spellStatus').className='status-box success';
   $('#spellStatus').textContent=archiveResult?.source==='ejemplo'
    ?'Este progreso proviene de una partida anterior: se muestra un ejemplo canónico, no un intento guardado.'
    :'Conjuro superado en tu partida. Abre el AFD para consultar cada transición.';
  }
  $('#roomSuccess').hidden=reviewing||!won||doorOpening;
  $('#nextRoomButton').hidden=reviewing||!won||doorOpening;
  $('#nextRoomButton').textContent=roomIndex===2?'✧ Ver tu victoria final →':'Continuar a la siguiente sala →';
  $('#validationButton').disabled=reviewing?!archiveResult:!state.lastResult;
  renderHearts();
  if(reviewing){
   $('#roomHearts').textContent='✧ REVISIÓN';
   $('#roomHearts').setAttribute('aria-label','Modo revisión; sin penalizaciones');
   $('#headerLives').textContent='✧ ARCHIVO';
  }
  for(let i=0;i<3;i++){
   const el=$(`#sidebarRoom${i}`),available=state.solved[i]||i===state.currentRoom||i>0&&state.solved[i-1];
   el.disabled=!available;
   el.classList.toggle('disabled',!available);
   el.classList.toggle('selected-archive-room',reviewing&&i===roomIndex);
   el.innerHTML=`<span class="room-dot ${i===roomIndex?'active':''}">${state.solved[i]?'✓':i===roomIndex?'✦':'♧'}</span> ${i===roomIndex?'<strong>':''}Habitación ${i+1}${i===roomIndex?'</strong>':''} <span>${state.solved[i]?'↶':!available?'🔒':String(i+1).padStart(2,'0')}</span>`;
   el.title=state.solved[i]?'Revisar archivo de esta sala':available?'Entrar a esta sala':'Sala bloqueada';
  }
  // Ambient canvas owns the scene particles.
 }
 function setStatus(kind,message){const e=$('#spellStatus');e.className='status-box'+(kind==='correct'?' success':kind==='syntax-error'?' error':kind==='wrong-choice'?' warning':'');e.textContent=message;}
 function clearCasting(){
  const stage=$('#roomScreen');
  stage.classList.remove('casting','failed','cast-fire','cast-ice','cast-wind','spell-charging');
  $('#spellSparkField').replaceChildren();void stage.offsetWidth;
 }
 function elementOf(result){const invocation=result?.dfa?.spell?.invocation;return invocation==='Aethra Ignis'?'fire':invocation==='Nivara Glacies'?'ice':'wind';}
 function makeSpellSparks(){
  const field=$('#spellSparkField');field.replaceChildren();
  if(reducedMotion)return;
  const sparkCount=window.innerWidth<=720?18:30;
  for(let i=0;i<sparkCount;i++){
   const spark=document.createElement('i');spark.className='spell-spark';
   const angle=(i*137.5)*Math.PI/180;
   const radius=45+(i%7)*22;
   spark.style.setProperty('--dx',`${Math.cos(angle)*radius}px`);
   spark.style.setProperty('--dy',`${Math.sin(angle)*radius}px`);
   spark.style.setProperty('--delay',`${(i%8)*32}ms`);
   spark.style.setProperty('--size',`${2+(i%4)*2}px`);
   field.appendChild(spark);
  }
 }
 function showRiddleCelebration(){
  const banner=$('#riddleCelebration');banner.hidden=false;
  banner.classList.remove('burst');void banner.offsetWidth;banner.classList.add('burst');
  setTimeout(()=>{banner.hidden=true;banner.classList.remove('burst');},reducedMotion?450:1700);
 }
 function openDoorCeremony(result){
  doorOpening=true;
  const room=D.rooms[result.roomIndex],stage=$('#roomScreen');
  renderRoom();
  const portal=$('#roomPortal');portal.hidden=false;
  stage.classList.remove('completed');stage.classList.add('opening-door');
  M.reward('door',room.id);
  setStatus('correct',`✧ ¡${room.name} completada! El portal arcano se está abriendo...`);
  transitionTimer=setTimeout(()=>{
   stage.classList.remove('opening-door');portal.hidden=true;doorOpening=false;
   renderRoom();
   setStatus('correct',`✧ ¡El portal de ${room.name} se abrió! Puedes continuar o revisar los recorridos en Progreso.`);
   toast(`✦ ${room.name} superada · portal abierto`);
   if(result.roomIndex===2){
    M.reward('victory',room.id);window.SpellCinema.play('niebla');
    // La victoria se muestra solo cuando el jugador pulse el botón: primero ve abrirse la puerta.
   }
  },reducedMotion?500:3100);
 }
 function cast(){
  if(busy||isReviewing())return;
  const puzzle=G.currentPuzzle();const result=G.cast($('#spellInput').value);
  const advice=T.consume(result,puzzle,state.difficulty);
  if(result.kind==='empty'){setStatus('neutral',result.message);$('#spellInput').focus();return;}
  if(result.kind==='already-solved'){toast(result.message);return;}
  $('#riddleCelebration').hidden=true;
  busy=true;clearCasting();
  const stage=$('#roomScreen'),element=elementOf(result);
  stage.classList.add(element==='fire'?'cast-fire':element==='ice'?'cast-ice':'cast-wind');
  stage.classList.add(result.dfa.accepted?'casting':'failed');
  stage.classList.toggle('spell-charging',result.dfa.accepted);
  // V7 effects are rendered by the shared frame clock.
  const spellMark=result.dfa.accepted?(element==='fire'?'♨':element==='ice'?'❄':'≋'):'✕';
  $('#castEffect').textContent=spellMark;
  $('#castButton').disabled=true;$('#spellInput').disabled=true;
  setStatus(result.kind,result.dfa.accepted?'✧ El círculo arcano cobra vida...':result.message);
  $('#validationButton').disabled=true;
  clearTimeout(transitionTimer);
  const finishCast=()=>{
   clearCasting();busy=false;renderRoom();
   setStatus(result.kind,result.message);$('#validationButton').disabled=false;
   if(advice)showAether(advice);
   if(result.kind==='correct'){
    $('#spellInput').value='';$('#spellCount').textContent='0/180';
    if(result.completedRoom){openDoorCeremony(result);}
    else{
     M.reward('riddle',D.rooms[result.roomIndex].id);
     showRiddleCelebration();
     toast(`✦ Acertijo superado: ${state.progress[state.currentRoom]} de ${G.totalChallenges()}`);
    }
   }else if(result.restarted){
    $('#spellInput').value='';$('#spellCount').textContent='0/180';
    openModal('✧ El poder se ha agotado',`<p>Esta sala ha reiniciado sus acertijos y tienes otra oportunidad con <strong>${G.maxLives()} puntos de vida</strong>.</p><p class="modal-note">El progreso de las habitaciones anteriores se ha conservado.</p>`);
   }else toast(result.kind==='wrong-choice'?'Conjuro válido, elección equivocada: −2 PV':'Cadena no reconocida: −1 PV');
  };
  window.SpellEffects.launch(element,result,finishCast);
 }
 function celebrateVictory(){
  const suffix=state.difficulty==='dificil'?'como un auténtico archimago':'con valentía y sabiduría';
  openModal('✦ ¡Has conquistado el Torreón!',`<p>Has resuelto los <strong>${G.totalChallenges()*3} acertijos</strong> de hielo, fuego y niebla ${suffix}.</p><p class="modal-note">Modo ${modeInfo().label} · ${state.attempts} conjuros lanzados · ${state.syntaxErrors} errores del AFD.</p><p>Abre el mapa para contemplar tus tres habitaciones completadas o cambia la dificultad para comenzar una aventura nueva.</p><div class="modal-extra-buttons"><button id="showVictoryMap" type="button" class="arcane-button primary">✦ Ver mi progreso</button></div>`);
 }
 function nextRoom(){
  if(busy||doorOpening||isReviewing())return;
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
  const r=educationResult||(isReviewing()?archiveResult:state.lastResult);
  renderIntuitive(r);$('#academicAFD').hidden=true;$('#academicToggle').setAttribute('aria-expanded','false');$('#academicToggle').textContent='◇ Abrir recorrido académico';
  $('#archiveValidationNote').hidden=!isReviewing()&&!educationResult;
  if(educationResult)$('#archiveValidationNote').textContent='✎ Taller de escritura · Reconocimiento didáctico sin puntos de vida';
  if(isReviewing()&&!educationResult)$('#archiveValidationNote').textContent=archiveResult?.source==='ejemplo'
   ?'✧ Ejemplo de referencia de una partida antigua · Sin consumir vidas'
   :'✧ Archivo de '+D.rooms[reviewRoomIndex].name+' · Conjuro guardado · Sin gastar vidas';
  if(!r?.dfa){$('#reviewSpell').textContent='Primero lanza un conjuro desde una habitación o realiza una práctica.';$('#normalizedSpell').hidden=true;$('#dfaChain').innerHTML=summarizeNodes(null);$('#transitionCount').textContent='0 transiciones';$('#validationReport').textContent='El registro comienza tras un intento de conjuro.';$('#afdCompare').hidden=true;window.SpellAFDView.render(null);return;}
  $('#reviewSpell').textContent=r.text;
  $('#normalizedSpell').hidden=false;
  $('#normalizedSpell').textContent='Forma normalizada que leyó el AFD: '+r.dfa.normalized;
  $('#dfaChain').innerHTML=summarizeNodes(r);
  $('#transitionCount').textContent=`${r.dfa.trace.length} transiciones`;
  $('#traceScroller').innerHTML=r.dfa.trace.map(step=>`<div class="trace-row ${step.rejected?'rejected':''}"><span>#${step.position}</span><span class="char">${safe(step.symbol===' '?'␣ espacio':step.symbol)}</span><span>${safe(step.from)}</span><span>→ ${safe(step.to)}</span></div>`).join('');
  if(r.dfa.accepted){verdict($('#syntaxVerdict'),'ok','Sintaxis aceptada','La cadena normalizada pertenece al lenguaje regular.');verdict($('#puzzleVerdict'),r.kind==='correct'?'ok':'bad',r.educational?'¡Práctica correcta!':r.kind==='correct'?'¡Acertijo resuelto!':'Conjuro inadecuado',r.educational?'La expresión respeta la estructura configurada en el AFD educativo.':r.kind==='correct'?'El AFD aceptó y las reglas del enigma coinciden.':'El AFD aceptó, pero la combinación no corresponde al enigma.');}
  else{verdict($('#syntaxVerdict'),'bad','Sintaxis rechazada',r.dfa.firstError.kind==='incomplete'?'La frase está incompleta.':`No se reconoce el carácter en la posición ${r.dfa.firstError.index}.`);verdict($('#puzzleVerdict'),'neutral',r.educational?'Ejercicio sin completar':'Acertijo no evaluado',r.educational?'Lee la corrección del tutor del AFD y vuelve a practicar.':'Primero debes superar el reconocimiento formal.');}
  $('#validationReport').textContent=`Estado: ${r.dfa.endState} · AFD: ${r.dfa.accepted?'ACEPTA':'RECHAZA'} · Comprobación independiente: ${r.dfa.byRegex?'ACEPTA':'RECHAZA'} · Coinciden: ${r.dfa.accepted===r.dfa.byRegex?'SÍ':'NO'} · Daño: ${r.damage} PV.`;
  $('#continueFromValidation').textContent=r.educational?'← Volver a la práctica':isReviewing()?'← Volver a la sala revisada':state.solved[state.currentRoom]?'Ver progreso →':'Continuar aventura →';
  $('#afdCompare').hidden=!r.educational;$('#afdComparison').hidden=true;
  window.SpellAFDView.render(r);
 }
 function renderProgress(){
  const total=G.totalChallenges()*3,completed=state.progress.reduce((a,b)=>a+b,0),won=state.solved.filter(Boolean).length;
  $('#progressBar').style.width=`${Math.round(completed/total*100)}%`;
  $('#progressText').textContent=`${completed} de ${total} acertijos · ${won}/3 salas`;
  $('#progressHeadingDetail').textContent=`Tres habitaciones · ${G.totalChallenges()} acertijos por sala · Modo ${modeInfo().label}.`;
  $('#progressMode').textContent=modeInfo().label;
  renderRewards();
  $('#totalAttempts').textContent=state.attempts;$('#syntaxErrors').textContent=state.syntaxErrors;$('#puzzleErrors').textContent=state.puzzleErrors;
  for(let i=0;i<3;i++){
   const unlocked=i===0||state.solved[i-1],won=state.solved[i];
   const card=$(`#levelCard${i}`),button=i===0?$('#playFromProgress'):$(`#playRoom${i}`);
   card.classList.toggle('locked',!unlocked);card.classList.toggle('unlocked',unlocked);card.classList.toggle('finished',won);
   button.disabled=!unlocked;button.textContent=!unlocked?'🔒 Bloqueada':won?'◇ Revisar archivo AFD':state.progress[i]>0?'▶ Continuar':'▶ Jugar';
   $(`#levelProgress${i}`).textContent=`${state.progress[i]} de ${G.totalChallenges()} acertijos superados${won?' · Habitación completada.':''}`;
  }
  updateDifficultyUI();
 }
 function makeAmbientEffects(){
  const container=$('#snowfall');container.replaceChildren();if(reducedMotion)return;
  const room=D.rooms[shownRoomIndex()];
  const ambientCount=window.innerWidth<=720?18:29;
  for(let i=0;i<ambientCount;i++){
   const particle=document.createElement('span');particle.className=`snowflake atmosphere-${room.id}`;
   particle.textContent=room.id==='hielo'?(i%3===0?'❄':'·'):room.id==='fuego'?(i%5===0?'✦':'•'):(i%4===0?'✧':'·');
   particle.style.setProperty('--x',((i*41+12)%100)+'%');particle.style.setProperty('--size',(8+i%9)+'px');particle.style.setProperty('--speed',(7+i%7)+'s');particle.style.setProperty('--delay',(-i*1.23)+'s');particle.style.setProperty('--wind',((i%2?-1:1)*(23+i%50))+'px');container.appendChild(particle);
  }
 }
 function makeParticles(){const container=$('#particles');container.replaceChildren();if(reducedMotion)return;const count=window.innerWidth<=720?16:27;for(let i=0;i<count;i++){const el=document.createElement('i');el.className='particle';el.style.left=((i*37+13)%99)+'%';el.style.top=((i*29+17)%98)+'%';el.style.setProperty('--duration',(8+i%9)+'s');el.style.setProperty('--delay',(-i*.7)+'s');el.style.setProperty('--drift',(-28+i%8*9)+'px');container.appendChild(el);}}
 function setReducedMotion(value){window.SpellGraphics.set(value?'reduced':'full');}function updateGraphics(){reducedMotion=window.SpellGraphics.get()!=='full';makeParticles();}document.addEventListener('spellgraphics',updateGraphics);document.addEventListener('visibilitychange',()=>document.body.classList.toggle('v6-paused',document.hidden));

 function renderLearningStats(){
  const stats=window.SpellLearningProgress.stats(),slots=$('#learningStats');if(!slots)return;
  const skills=['estructura','conectores','puntuación'];
  slots.innerHTML=`<div class="learning-kpis"><div><strong>${stats.attempts}</strong><span>Intentos de escritura</span></div><div><strong>${stats.completed}</strong><span>Ejercicios diferentes resueltos</span></div><div><strong>${stats.corrections}</strong><span>Correcciones tras un error</span></div><div><strong>${stats.help}</strong><span>Pistas consultadas</span></div></div><div class="learning-skills">${skills.map(skill=>{const s=stats.skills[skill];return `<div><span>${safe(skill)}</span><strong>${s.correct} / ${s.attempts} respuestas correctas</strong><div class="learning-meter"><i style="width:${s.attempts?Math.round(s.correct/s.attempts*100):0}%"></i></div></div>`;}).join('')}</div>`;
  const completed=window.SpellLearningProgress.getAttempts().filter(a=>a.accepted).map(a=>a.id);
  const seen=new Set(completed),conns=['porque','aunque','por eso'];
  $('#learningConnectors').innerHTML='<strong>Conectores practicados:</strong> '+conns.map(conn=>{const list=window.SpellWritingRules.exercises.filter(ex=>seen.has(ex.id)&&new RegExp('(?:^|\\s)'+conn+'(?:$|\\s)').test(window.SpellWritingRules.normalize(ex.answer)));return `<span class="connector-pill">${safe(conn)} · ${list.length}</span>`;}).join(' ');
  const rec=window.SpellAdaptiveTutor.overview(),box=$('#learningSuggestions');
  box.innerHTML=!window.SpellLearningProgress.enabled()?'<p>Las recomendaciones personalizadas están desactivadas desde Configuración. Las prácticas siguen disponibles.</p>':rec.length?rec.map(item=>`<div class="learning-recommendation"><strong>${safe(item.skill)}</strong><p>${safe(item.recommendation)}</p><small>Fundamento: ${item.count} errores de esta categoría en ${item.unique} ejercicios diferentes del registro reciente.</small><button type="button" class="tutor-practice-link" data-recommended-exercise="${safe(item.exercise||'')}">✎ Practicar esta habilidad →</button></div>`).join(''):'<p>✧ Completa distintas prácticas para que aparezcan recomendaciones basadas en resultados reales. Un error aislado no constituye una dificultad recurrente.</p>';
 }
 function renderPractice(){
  if(!$('#view-practica'))return;
  $$('[data-practice-room]').forEach(b=>b.classList.toggle('active',Number(b.dataset.practiceRoom)===practiceRoom));
  const list=window.SpellPractice.forRoom(practiceRoom);if(!list.some(e=>e.id===selectedPracticeId))selectedPracticeId=list[0]?.id;
  const select=$('#practiceExercise');select.innerHTML=list.map(ex=>`<option value="${safe(ex.id)}" ${ex.id===selectedPracticeId?'selected':''}>${safe(ex.title)} · ${safe(ex.skill)}</option>`).join('');
  const ex=window.SpellWritingRules.get(selectedPracticeId);if(!ex)return;
  $('#practiceRoomLabel').textContent=D.rooms[practiceRoom].stage;
  $('#practiceExerciseTitle').textContent=ex.title;
  $('#practiceScene').textContent=ex.scene;
  $('#practiceTask').textContent=ex.task;
  $('#practiceRule').textContent=state.difficulty==='facil'?`${ex.rule} ${ex.tip}`:state.difficulty==='normal'?`Pista conceptual: ${ex.tip}`:'Consulta el texto y analiza los conectores y signos esperados. La regla se explicará tras validar.';
  $('#practiceResult').className='practice-result';$('#practiceResult').textContent='Escribe tu expresión; no perderás vidas si te equivocas.';
  $('#practiceInspect').hidden=true;$('#practiceAdaptiveAdvice').hidden=true;
  educationResult=null;
 }
 function practiceNavigate(room){practiceRoom=Math.max(0,Math.min(2,room));selectedPracticeId=null;$('#practiceInput').value='';navigate('practica');}
 function checkPractice(){
  const ex=window.SpellWritingRules.get(selectedPracticeId),text=$('#practiceInput').value;
  if(!text.trim()){$('#practiceResult').textContent='Escribe una oración antes de comprobarla. No se registra ningún error.';return;}
  const result=window.SpellPractice.evaluate(ex.id,text);educationResult=result;
  const box=$('#practiceResult');box.className='practice-result '+(result.dfa.accepted?'success':'error');
  box.textContent=result.analysis.message+' '+(result.dfa.accepted?'Estado final aceptado.':'No se alcanzó un estado final.');
  $('#practiceInspect').hidden=false;
  const suggestion=window.SpellAdaptiveTutor.recommendation();const tutor=$('#practiceAdaptiveAdvice');
  if(suggestion){tutor.hidden=false;tutor.textContent='✧ Tutor: '+suggestion.recommendation;}else tutor.hidden=true;
  renderLearningStats();
 }

 function showSettings(){
  openModal('⚙ Configuración del aprendiz',`<div class="settings-fields"><label class="settings-row">Dificultad <select id="difficultyInSettings"><option value="facil" ${state.difficulty==='facil'?'selected':''}>Fácil · Aprendiz</option><option value="normal" ${state.difficulty==='normal'?'selected':''}>Intermedio · Aventurero</option><option value="dificil" ${state.difficulty==='dificil'?'selected':''}>Difícil · Archimago</option></select></label><p class="modal-note">Cambiar la dificultad después de comenzar reinicia la partida porque modifica el número de enigmas.</p><div class="settings-row"><span>♫ Música ambiental</span><button type="button" id="settingsAudioButton" class="arcane-button secondary small">${M.isEnabled()?'Desactivar':'Activar'}</button></div><label class="settings-row">Volumen <input type="range" id="volumeRange" min="0" max="100" value="${Math.round(M.getVolume()*100)}" aria-label="Volumen de la música"/><span id="volumeValue">${Math.round(M.getVolume()*100)}%</span></label><label class="settings-row">Animaciones <select id="graphicsMode"><option value="full" ${window.SpellGraphics.get()==='full'?'selected':''}>Completas (predeterminado)</option><option value="reduced" ${window.SpellGraphics.get()==='reduced'?'selected':''}>Reducidas</option><option value="off" ${window.SpellGraphics.get()==='off'?'selected':''}>Sin animaciones</option></select></label><label class="settings-row">Recomendaciones personalizadas <input type="checkbox" id="learningRecommendations" ${window.SpellLearningProgress.enabled()?'checked':''}/></label><button type="button" class="arcane-button secondary" id="clearLearningButton">✎ Borrar solo el historial de aprendizaje</button><button type="button" class="arcane-button secondary" id="replayTutorial">✧ Repetir tutorial</button><button type="button" class="arcane-button secondary" id="resetGameButton">↻ Reiniciar partida</button></div>`);
 }
 /* Navegación */
 $$('.nav-link').forEach(el=>el.addEventListener('click',()=>el.dataset.go==='aventura'&&!state.started?beginAdventure():navigate(el.dataset.go)));
 $$('[data-go]').filter(el=>!el.classList.contains('nav-link')).forEach(el=>el.addEventListener('click',()=>el.dataset.go==='aventura'&&!state.started?beginAdventure():navigate(el.dataset.go)));
 $('#startButton').addEventListener('click',beginAdventure);
 $('#tutorialReplayHome').addEventListener('click',()=>{tutorialStep=0;visitedGrimoire=false;showTutorial();});
 $('#tutorialSkip').addEventListener('click',finishTutorial);
 $('#tutorialNext').addEventListener('click',()=>{if(tutorialStep===tutorialPages.length-1){finishTutorial();return;}if(tutorialStep===1&&!visitedGrimoire)return;showTutorial(tutorialStep+1);});
 $('#tutorialContent').addEventListener('click',event=>{if(event.target.id!=='tutorialMiniCheck')return;const val=$('#tutorialMiniInput').value;const ok=window.SpellWritingRules.normalize(val)===window.SpellWritingRules.normalize('Si hay hielo, caminaremos despacio.');$('#tutorialMiniMessage').textContent=ok?'✓ ¡Bien! El separador está en su lugar. Puedes continuar.':'Todavía falta algo: separa la condición inicial «Si hay hielo» con una coma y cierra con un punto.';tutorialPracticeDone=ok;});
 $('#tutorialVisit').addEventListener('click',()=>{returnFromTutorial=true;tutorialOpen=false;$('#tutorialBackdrop').hidden=true;navigate('grimorio');toast('Lee los elementos y la fórmula, luego pulsa «Volver»');});
 $('#returnFromGrimoire').addEventListener('click',()=>{if(returnFromTutorial){returnFromTutorial=false;visitedGrimoire=true;showTutorial(2);}else navigate(previousRoute==='inicio'?'inicio':'aventura');});
 $$('.difficulty-option').forEach(el=>el.addEventListener('click',()=>askDifficulty(el.dataset.difficulty)));
 $('#playFromProgress').addEventListener('click',()=>selectAdventureRoom(0));
 $('#playRoom1').addEventListener('click',()=>selectAdventureRoom(1));
 $('#playRoom2').addEventListener('click',()=>selectAdventureRoom(2));
 for(let i=0;i<3;i++)$(`#sidebarRoom${i}`).addEventListener('click',()=>{
  if(isReviewing()&&i===state.currentRoom)closeArchive();else selectAdventureRoom(i);
 });
 $('#archiveChallenge').addEventListener('change',event=>{
  if(!isReviewing())return;
  reviewChallengeIndex=Math.max(0,Math.min(G.roomArchive(reviewRoomIndex).length-1,Number(event.target.value)||0));
  archiveResult=G.replayEntry(G.roomArchive(reviewRoomIndex)[reviewChallengeIndex]);renderRoom();
 });
 $('#archiveReturnButton').addEventListener('click',closeArchive);
 $('#archiveTraceButton').addEventListener('click',()=>{if(archiveResult){educationResult=null;navigate('validacion');}});
 $('#nextRoomButton').addEventListener('click',nextRoom);
 $('#castButton').addEventListener('click',cast);
 $('#spellInput').addEventListener('input',()=>$('#spellCount').textContent=`${[...$('#spellInput').value].length}/180`);
 $('#spellInput').addEventListener('keydown',event=>{if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();cast();}});
 $('#openGrimoire').addEventListener('click',()=>navigate('grimorio'));
 $('#hintButton').addEventListener('click',()=>{const r=G.currentPuzzle();openModal(`✧ Pista: ${r.title}`,`<p>${safe(T.help(r,state.difficulty))}</p><p class="modal-note">Consultar pistas no gasta puntos de vida. Modo ${modeInfo().label}: ${safe(hints[state.difficulty])}</p>`);});
 $('#validationButton').addEventListener('click',()=>{educationResult=null;navigate('validacion');});
 $('#continueFromValidation').addEventListener('click',()=>navigate(educationResult?'practica':isReviewing()?'aventura':state.solved[state.currentRoom]?'progreso':'aventura'));
 $('#audioButton').addEventListener('click',()=>{const on=M.toggle();updateAudio();toast(on?`♫ Ambiente suave activado · ${D.rooms[state.currentRoom].music}`:'Música y sonidos desactivados');});
 $('#settingsButton').addEventListener('click',()=>{if(busy||doorOpening){toast('✧ Espera a que termine la secuencia mágica.');return;}showSettings();});
 $('#modalClose').addEventListener('click',closeModal);$('#modalOk').addEventListener('click',closeModal);
 $('#modalBackdrop').addEventListener('click',event=>{if(event.target===$('#modalBackdrop'))closeModal();});
 window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#modalBackdrop').hidden)closeModal();});
 $('#modalBody').addEventListener('click',event=>{
  const t=event.target;
  if(t.id==='resetGameButton'){reviewRoomIndex=null;archiveResult=null;doorOpening=false;G.resetGame();closeModal();updateDifficultyUI();renderProgress();renderRoom();setStatus('neutral','Partida reiniciada. ¡Elige de nuevo tus conjuros!');navigate('inicio');toast('Aventura reiniciada.');}
  if(t.id==='confirmDifficulty'){reviewRoomIndex=null;archiveResult=null;doorOpening=false;G.setDifficulty(t.dataset.mode);closeModal();renderProgress();renderRoom();setStatus('neutral','Nueva dificultad seleccionada.');navigate('inicio');toast(`Nuevo modo: ${modeInfo().label}`);}
  if(t.id==='cancelDifficulty')closeModal();
  if(t.id==='showVictoryMap'){closeModal();navigate('progreso');}
  if(t.id==='settingsAudioButton'){M.toggle();updateAudio();t.textContent=M.isEnabled()?'Desactivar':'Activar';toast(M.isEnabled()?'Música suave activada':'Audio desactivado');}
  if(t.id==='replayTutorial'){closeModal();tutorialStep=0;visitedGrimoire=false;showTutorial();}
  if(t.id==='clearLearningButton'){openModal('¿Borrar tus estadísticas de escritura?',`<p>Se eliminarán únicamente los registros de prácticas educativas de la V4. Tus habitaciones, vidas, archivos AFD y partida V3 permanecerán intactos.</p><button type="button" class="arcane-button primary" id="confirmClearLearning">Confirmar borrado de prácticas</button>`);}
  if(t.id==='confirmClearLearning'){window.SpellLearningProgress.clear();closeModal();renderLearningStats();toast('Historial educativo borrado; la campaña se conserva.');}
 });
 $('#modalBody').addEventListener('change',event=>{
  const el=event.target;
  if(el.id==='difficultyInSettings'){const choice=el.value;closeModal();askDifficulty(choice);}
  if(el.id==='graphicsMode')window.SpellGraphics.set(el.value);
  if(el.id==='learningRecommendations')window.SpellLearningProgress.toggleRecommendations(el.checked);
  if(el.id==='volumeRange'){M.setVolume(Number(el.value)/100);$('#volumeValue').textContent=el.value+'%';}
 });
 $('#modalBody').addEventListener('input',event=>{if(event.target.id==='volumeRange'){M.setVolume(Number(event.target.value)/100);$('#volumeValue').textContent=event.target.value+'%';}});
 $('#practiceFromRoom').addEventListener('click',()=>practiceNavigate(state.currentRoom));
 $('#practiceFromGrimoire').addEventListener('click',()=>practiceNavigate(state.currentRoom));
 $('#learningSuggestions').addEventListener('click',e=>{const button=e.target.closest('[data-recommended-exercise]');if(!button)return;const ex=window.SpellWritingRules.get(button.dataset.recommendedExercise);if(!ex)return;practiceRoom=ex.room;selectedPracticeId=ex.id;$('#practiceInput').value='';navigate('practica');});
 $$('[data-practice-room]').forEach(b=>b.addEventListener('click',()=>practiceNavigate(Number(b.dataset.practiceRoom))));
 $('#practiceExercise').addEventListener('change',e=>{selectedPracticeId=e.target.value;$('#practiceInput').value='';renderPractice();});
 $('#practiceHint').addEventListener('click',()=>{const tip=window.SpellPractice.hint(selectedPracticeId);openModal('✎ Una pista de escritura',`<p>${safe(state.difficulty==='dificil'?'Revisa la estructura del enunciado antes de consultar una pista explícita.':tip)}</p><p class="modal-note">Las pistas no descuentan vidas.</p>`);renderLearningStats();});
 $('#practiceCheck').addEventListener('click',checkPractice);
 $('#practiceInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();checkPractice();}});
 $('#practiceInspect').addEventListener('click',()=>{if(educationResult)navigate('validacion');});
 $('#academicToggle').addEventListener('click',()=>{const panel=$('#academicAFD');panel.hidden=!panel.hidden;$('#academicToggle').setAttribute('aria-expanded',String(!panel.hidden));$('#academicToggle').textContent=panel.hidden?'◇ Abrir recorrido académico':'Cerrar recorrido académico';if(panel.hidden)window.SpellAFDView.pause();});
 window.addEventListener('resize',moveAether);
 $('#aetherHelp').addEventListener('click',()=>{if(busy||isReviewing()||state.solved[state.currentRoom])return;showAether({show:true,message:T.help(G.currentPuzzle(),state.difficulty),guide:state.difficulty==='facil'});});
 $('#aetherBuild').addEventListener('click',()=>{if(busy||state.solved[state.currentRoom]||state.difficulty!=='facil')return;buildSpell();});
 $('#aetherApply').addEventListener('click',()=>{if(busy||state.solved[state.currentRoom]||!tutorAdvice?.suggestion)return;$('#spellInput').value=tutorAdvice.suggestion;$('#spellInput').dispatchEvent(new Event('input'));$('#spellInput').focus();});
 $('#inspectRune').addEventListener('click',()=>{if(busy||isReviewing()||state.solved[state.currentRoom])return;const p=G.currentPuzzle();T.inspect(p,state.currentRoom);$('#encounterClue').hidden=false;$('#encounterClue').textContent=T.help(p,state.difficulty);$('#encounterUI').classList.add('inspected');M.reward('riddle',D.rooms[state.currentRoom].id);});
 window.SpellAFDView.bind();renderLearningStats();
 $('#v7PerfButton').addEventListener('click',()=>{const p=$('#v7FPS');p.hidden=!p.hidden;});window.SpellScenes.init();window.SpellCompanion.init();window.SpellParticles.init();window.SpellCinema.init();updateDifficultyUI();renderRoom();renderProgress();makeParticles();updateAudio();
 window.SpellUI={navigate,renderRoom,renderProgress,renderValidation,showTutorial,setReducedMotion,cast,renderPractice,renderLearningStats};
})();
