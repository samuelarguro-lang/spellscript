/* Controlador visual del prototipo SpellScript. Sin dependencias externas. */
(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const state = window.SpellGame.state;
  let route = 'inicio';
  let previousRoute = 'aventura';
  let soundEnabled = false;
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let audioContext = null;
  let toastTimeout;
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));

  function playSound(kind) {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioContext ||= new AudioContextClass();
      if (audioContext.state === 'suspended') audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = kind === 'wrong' ? 'sawtooth' : 'sine';
      oscillator.frequency.setValueAtTime(kind === 'wrong' ? 190 : 470, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(kind === 'wrong' ? 90 : 850, audioContext.currentTime + .24);
      gain.gain.setValueAtTime(.045, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .3);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + .3);
    } catch (error) { /* El sonido es opcional: el juego permanece funcional. */ }
  }
  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => element.classList.remove('show'), 2600);
  }
  function navigate(destination) {
    if (!$('#view-' + destination)) return;
    if (route !== 'grimorio' && destination === 'grimorio') previousRoute = route;
    route = destination;
    $$('.view').forEach(section => section.classList.toggle('active', section.id === 'view-' + route));
    $$('.main-nav .nav-item').forEach(button => button.classList.toggle('active', button.dataset.go === route || (route === 'validacion' && button.dataset.go === 'aventura')));
    $('#headerLives').hidden = !(route === 'aventura' || route === 'validacion');
    if (route === 'validacion') renderValidation();
    if (route === 'progreso') renderProgress();
    if (route === 'aventura') renderRoom();
    window.scrollTo({top:0,behavior:'instant'});
    $('#mainContent').focus({preventScroll:true});
    playSound('nav');
  }
  function showModal(title, html) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = html;
    $('#modalBackdrop').hidden = false;
    $('#modalClose').focus();
  }
  function hideModal() {
    $('#modalBackdrop').hidden = true;
    const activeView = $$('.view').find(view => view.classList.contains('active'));
    activeView?.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
  }
  function renderHearts() {
    const html = Array.from({length:5}, (_, i) => `<span class="${i < state.lives ? '' : 'lost'}" aria-hidden="true">♥</span>`).join(' ');
    $('#roomHearts').innerHTML = html;
    $('#roomHearts').setAttribute('aria-label', `${state.lives} de 5 puntos de vida`);
    $('#headerLives').innerHTML = html;
    $('#headerLives').setAttribute('aria-label', `${state.lives} de 5 puntos de vida`);
  }
  function renderRoom() {
    renderHearts();
    const solved = state.solved[0];
    $('#roomScreen').classList.toggle('completed', solved);
    $('#roomSuccess').hidden = !solved;
    $('#castButton').disabled = solved;
    $('#spellInput').disabled = solved;
    $('#validationButton').disabled = !state.lastResult;
    if (solved) {
      $('#spellStatus').className = 'status-box success';
      $('#spellStatus').textContent = '¡Puerta desbloqueada! Habitación 1 superada. Consulta tu AFD o el mapa de progreso.';
    }
  }
  function setStatus(kind, text) {
    const element = $('#spellStatus');
    element.className = 'status-box' + (kind === 'correct' ? ' success' : kind === 'syntax-error' ? ' error' : kind === 'wrong-choice' ? ' warning' : '');
    element.textContent = text;
  }
  function clearFx() {
    const stage = $('#roomScreen');
    stage.classList.remove('casting','failed');
    void stage.offsetWidth;
  }
  function cast() {
    const result = window.SpellGame.cast($('#spellInput').value);
    if (result.kind === 'empty') { setStatus(result.kind,result.message); $('#spellInput').focus(); return; }
    if (result.kind === 'already-solved') { toast(result.message); return; }
    clearFx();
    const stage = $('#roomScreen');
    if (result.kind === 'correct') {stage.classList.add('casting');playSound('correct');}
    else {stage.classList.add('failed');playSound('wrong');}
    setStatus(result.kind,result.message);
    renderRoom();
    $('#validationButton').disabled = false;
    if (result.restarted) {
      $('#spellInput').value = '';
      $('#spellCount').textContent = '0/150';
      showModal('✧ La magia se ha agotado', '<p>Los puntos de vida llegaron a cero. El sello no se rompió, pero tu aprendizaje continúa.</p><p class="modal-note">La <strong>habitación actual</strong> se reinició con cinco puntos de vida y las salas anteriores permanecen conservadas.</p>');
    }
    if (result.kind === 'correct') {
      toast('✦ ¡Sello roto! Has superado la primera habitación.');
    } else if (result.kind === 'wrong-choice') {
      toast('Sintaxis válida, pero elección equivocada: −2 PV');
    } else if (result.kind === 'syntax-error') {
      toast('El AFD rechazó la cadena: −1 PV');
    }
  }
  function summarizeNodes(result) {
    if (!result || !result.dfa) return '<span class="state-node first">q0</span><span class="state-arrow">→</span><span class="state-ellipsis">?</span>';
    const trace = result.dfa.trace;
    const selected = [];
    if (trace.length <= 6) {
      for (const step of trace) selected.push({kind:'node',label:step.to});
    } else {
      trace.slice(0,2).forEach(step => selected.push({kind:'node',label:step.to}));
      selected.push({kind:'ellipsis'});
      trace.slice(-3).forEach(step => selected.push({kind:'node',label:step.to}));
    }
    const root = '<span class="state-node first">q0</span>';
    const rest = selected.map((item,i) => item.kind === 'ellipsis'
      ? '<span class="state-arrow">→</span><span class="state-ellipsis">···</span>'
      : `<span class="state-arrow">→</span><span class="state-node ${item.label==='q⊥' ? 'reject' : (result.dfa.accepted && i === selected.length-1 ? 'accept' : '')}">${escapeHTML(item.label)}</span>`).join('');
    return root + rest;
  }
  function verdict(element, stateName, title, description) {
    const icons = {ok:'✓',bad:'✕',neutral:'!'};
    element.className = 'verdict-row ' + stateName;
    element.querySelector('.verdict-icon').textContent = icons[stateName];
    element.querySelector('strong').textContent = title;
    element.querySelector('p').textContent = description;
  }
  function renderValidation() {
    const result = state.lastResult;
    if (!result || !result.dfa) {
      $('#reviewSpell').textContent = 'Primero lanza un conjuro desde la puerta helada.';
      $('#dfaChain').innerHTML = summarizeNodes(null);
      $('#traceScroller').innerHTML = '<p>Aún no hay transiciones registradas.</p>';
      $('#transitionCount').textContent = '0 transiciones';
      $('#validationReport').textContent = 'La tabla aparecerá tras un intento no vacío.';
      return;
    }
    $('#reviewSpell').textContent = result.text;
    $('#dfaChain').innerHTML = summarizeNodes(result);
    $('#transitionCount').textContent = `${result.dfa.trace.length} transiciones`;
    $('#traceScroller').innerHTML = result.dfa.trace.map(item => `<div class="trace-row ${item.rejected ? 'rejected' : ''}"><span>#${item.position}</span><span class="char">${escapeHTML(item.symbol === ' ' ? '␣ espacio' : item.symbol)}</span><span>${escapeHTML(item.from)}</span><span>→ ${escapeHTML(item.to)}</span></div>`).join('') || '<p>Cadena vacía.</p>';
    if (result.dfa.accepted) {
      verdict($('#syntaxVerdict'),'ok','✓ Sintaxis aceptada','La cadena pertenece al lenguaje regular de 27 conjuros.');
      verdict($('#puzzleVerdict'),result.kind === 'correct' ? 'ok':'bad',result.kind === 'correct' ? '✓ Acertijo resuelto':'✕ Elección inadecuada',result.kind === 'correct' ? 'El elemento, círculo y acción abren la puerta.':'El AFD acepta la frase, pero la combinación no corresponde a la sala.');
    } else {
      verdict($('#syntaxVerdict'),'bad','✕ Sintaxis rechazada',result.dfa.firstError.kind === 'incomplete' ? 'Cadena incompleta: no terminó en estado de aceptación.' : `Primer carácter incorrecto en la posición ${result.dfa.firstError.index}.`);
      verdict($('#puzzleVerdict'),'neutral','Acertijo sin evaluar','Al rechazarse la sintaxis, las reglas de la sala no se ejecutan.');
    }
    const independent = result.dfa.accepted === result.dfa.byRegex;
    $('#validationReport').textContent = `Estado final: ${result.dfa.endState} · AFD: ${result.dfa.accepted ? 'ACEPTA' : 'RECHAZA'} · Expresión regular independiente: ${result.dfa.byRegex ? 'ACEPTA' : 'RECHAZA'} · Coincidencia: ${independent ? 'SÍ' : 'NO'} · Daño: ${result.damage} PV.${result.restarted ? ' Sala reiniciada al llegar a 0 PV.' : ''}`;
    $('#continueFromValidation').textContent = state.solved[0] ? 'Ver progreso →' : 'Continuar aventura →';
  }
  function renderProgress() {
    const count = state.solved.filter(Boolean).length;
    $('#progressBar').style.width = `${(count / 3) * 100}%`;
    $('#progressText').textContent = `${count} de 3 habitaciones`;
    $('#totalAttempts').textContent = String(state.attempts);
    $('#syntaxErrors').textContent = String(state.syntaxErrors);
    $('#puzzleErrors').textContent = String(state.puzzleErrors);
    $('#playFromProgress').textContent = state.solved[0] ? '✓ Sala superada' : '▶ Jugar';
    $('#playFromProgress').disabled = false;
  }
  function makeAmbientEffects() {
    if (reducedMotion) return;
    const container = $('#particles');
    for (let i=0;i<27;i++) {
      const part = document.createElement('i');part.className = 'particle';
      part.style.left = ((i*37+13)%99)+'%';part.style.top = ((i*29+17)%98)+'%';
      part.style.setProperty('--duration',(8+i%9)+'s');
      part.style.setProperty('--delay',(-i*.7)+'s');
      part.style.setProperty('--drift',(-28 + i%8*9)+'px');
      container.appendChild(part);
    }
    for (let i=0;i<22;i++) {
      const snow = document.createElement('span');snow.className='snowflake';snow.textContent=i%3===0?'❄':'·';
      snow.style.setProperty('--x',((i*41+12)%100)+'%');
      snow.style.setProperty('--size',(9+i%8)+'px');
      snow.style.setProperty('--speed',(7+i%6)+'s');
      snow.style.setProperty('--delay',(-i*1.27)+'s');
      snow.style.setProperty('--wind',(i%2?'-':'')+(22+i%40)+'px');
      $('#snowfall').appendChild(snow);
    }
  }
  function setReducedMotion(active) {
    reducedMotion = active;
    document.body.classList.toggle('reduce-motion',active);
    if (active) {$('#particles').replaceChildren();$('#snowfall').replaceChildren();}
    else if (!$('#particles').children.length) makeAmbientEffects();
  }
  $$('.nav-link').forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.go)));
  $$('[data-go]').filter(button=>!button.classList.contains('nav-link')).forEach(button=>button.addEventListener('click',()=>navigate(button.dataset.go)));
  $('#startButton').addEventListener('click',()=>navigate('aventura'));
  $('#playFromProgress').addEventListener('click',()=>navigate('aventura'));
  $('#castButton').addEventListener('click',cast);
  $('#spellInput').addEventListener('input',()=>$('#spellCount').textContent = `${[...$('#spellInput').value].length}/150`);
  $('#spellInput').addEventListener('keydown',event=>{if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();cast();}});
  $('#openGrimoire').addEventListener('click',()=>navigate('grimorio'));
  $('#returnFromGrimoire').addEventListener('click',()=>navigate(previousRoute==='inicio'?'inicio':'aventura'));
  $('#hintButton').addEventListener('click',()=>showModal('✦ Pista de la habitación',`<p>${escapeHTML(window.SpellData.rooms[0].clue)}</p><p class="modal-note">Consultar pistas no consume PV y no cuenta como intento.</p>`));
  $('#validationButton').addEventListener('click',()=>navigate('validacion'));
  $('#continueFromValidation').addEventListener('click',()=>navigate(state.solved[0]?'progreso':'aventura'));
  $('#modalClose').addEventListener('click',hideModal);
  $('#modalOk').addEventListener('click',hideModal);
  $('#modalBackdrop').addEventListener('click',event=>{if(event.target===$('#modalBackdrop'))hideModal();});
  window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('#modalBackdrop').hidden)hideModal();});
  $('#audioButton').addEventListener('click',()=>{soundEnabled=!soundEnabled;$('#audioButton').classList.toggle('is-on',soundEnabled);$('#audioButton').setAttribute('aria-label',soundEnabled?'Desactivar sonidos':'Activar sonidos');toast(soundEnabled?'Sonidos mágicos activados':'Sonidos desactivados');playSound('nav');});
  $('#settingsButton').addEventListener('click',()=>showModal('⚙ Ajustes del aprendiz',`<p>La experiencia es completamente local, sin cuentas ni conexión a Internet.</p><p><label><input type="checkbox" id="reducedMotionOption" ${reducedMotion ? 'checked' : ''}> Reducir las animaciones</label></p><p><button type="button" class="arcane-button secondary" id="resetGameButton">↻ Reiniciar toda la partida</button></p><p class="modal-note">Las partidas se mantienen en memoria; recargar la página también reinicia el progreso.</p>`));
  $('#modalBody').addEventListener('change',event=>{if(event.target.id==='reducedMotionOption')setReducedMotion(event.target.checked);});
  $('#modalBody').addEventListener('click',event=>{if(event.target.id==='resetGameButton'){window.SpellGame.resetGame();$('#spellInput').value='';$('#spellInput').disabled=false;$('#spellCount').textContent='0/150';$('#spellStatus').className='status-box';$('#spellStatus').textContent='La partida ha comenzado de nuevo. Escribe tu conjuro.';$('#roomScreen').classList.remove('completed');hideModal();navigate('inicio');toast('Progreso reiniciado.');}});
  makeAmbientEffects();renderHearts();renderProgress();
  window.SpellUI = { navigate, renderValidation, renderProgress, cast, setReducedMotion };
})();
