/* Reproductor de transiciones del AFD: origen, símbolo, destino y explicación.
   No reemplaza ni calcula la aceptación; consume la traza del reconocedor real. */
(function(){
 'use strict';
 const $=s=>document.querySelector(s);
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let result=null,index=0,playing=false,timer=null,mode='segmentos';
 const charText=c=>c===' '?'␣ espacio':c===','?'coma (,)':c===';'?'punto y coma (;)':c==='.'?'punto (.)':c==='\n'?'salto de línea':c;
 function pause(){playing=false;clearTimeout(timer);timer=null;const btn=$('#afdPlay');if(btn)btn.textContent='▶ Reproducir';}
 function jump(next){if(!result?.dfa)return;index=Math.max(0,Math.min(next,result.dfa.trace.length));draw();}
 function segmentFor(charIndex,normalized,educational){
  if(educational)return result.exercise?.skill||'escritura';
  if(result?.dfa?.natural)return window.SpellNatural.segment(result.dfa).find(m=>m.end>=charIndex)?.label||'Expresión';
  const prefix=normalized.slice(0,charIndex),words=prefix.trim().split(/\s+/).length;
  if(words<=2)return 'Invocación';if(words<=5)return 'Fórmula fija';if(words<=8)return 'Círculo';return 'Acción';
 }
 function draw(){
  const el=$('#afdStepNumber');if(!el)return;
  const dfa=result?.dfa, trace=dfa?.trace||[];const current=trace[index-1];
  el.textContent=`${index} / ${trace.length} caracteres`;
  $('#afdFrom').textContent=current?.from||'q0';
  $('#afdTo').textContent=current?.to||'q0';
  $('#afdSymbol').textContent=current?charText(current.symbol):'Inicio';
  $('#afdFormula').textContent=current?`δ(${current.from}, ${current.symbol===' '?'␣':current.symbol}) = ${current.to}`:'Estado inicial: q0';
  $('#afdStepTrack').value=index;$('#afdStepTrack').max=Math.max(1,trace.length);
  $('#afdStepTrack').disabled=!dfa||!trace.length;
  $('#afdPrev').disabled=!dfa||index===0;
  $('#afdNext').disabled=!dfa||index===trace.length;
  $('#afdPlay').disabled=!dfa||!trace.length;
  $('#afdTo').classList.toggle('is-rejected',Boolean(current?.rejected));
  const exp=window.SpellAFDTutor.explainStep(result,index);
  $('#afdExplanationTitle').textContent=exp.heading;$('#afdExplanation').textContent=exp.message;
  $('#afdCurrentSegment').textContent=index===0?'Preparación':segmentFor(index,dfa?.normalized||'',Boolean(result?.educational));
  const txt=dfa?.normalized||'';
  const symbols=[...txt],highlightAt=Math.max(0,index-1);
  $('#afdCharacters').innerHTML=txt
   ? `<span class="afd-read">${safe(symbols.slice(0,highlightAt).join(''))}</span><mark class="afd-active-char">${safe(symbols[highlightAt])}</mark><span class="afd-unread">${safe(symbols.slice(highlightAt+1).join(''))}</span>${index===symbols.length&&dfa.accepted?' <span class="afd-final-check">✓ Estado final</span>':''}`
   : '<span class="afd-unread">La cadena aparecerá aquí cuando lances una expresión.</span>';
  const target=$('#afdTo');target.classList.remove('afd-state-pop');
  if(index>0&&!(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)){void target.offsetWidth;target.classList.add('afd-state-pop');}
  $$('.trace-row').forEach((row,i)=>row.classList.toggle('trace-selected',i===index-1));
  if(index>0){const selected=$('#traceScroller .trace-selected');selected?.scrollIntoView({block:'nearest',behavior:'auto'});}
 }
 const $$=s=>[...document.querySelectorAll(s)];
 function auto(){if(!playing)return;if(!result?.dfa||index>=result.dfa.trace.length){pause();return;}
  jump(index+1);const ms=Number($('#afdSpeed')?.value)||220;timer=setTimeout(auto,ms);
 }
 function groupTrace(dfa){
  if(!dfa?.trace?.length)return '';
  if(mode==='caracteres')return dfa.trace.map((s,i)=>`<button type="button" class="trace-row ${s.rejected?'rejected':''}" data-jump="${i+1}"><span>#${s.position}</span><span class="char">${safe(charText(s.symbol))}</span><span>${safe(s.from)}</span><span>→ ${safe(s.to)}</span></button>`).join('');
  // Agrupación legible por bloques de texto sin perder referencias a estados reales.
  const groups=[];let chunk=[];
  for(const step of dfa.trace){chunk.push(step);if(step.symbol===' '||',.;:'.includes(step.symbol)||step.rejected){groups.push(chunk);chunk=[];}}
  if(chunk.length)groups.push(chunk);
  return groups.map(g=>{const last=g[g.length-1],start=g[0];return `<button type="button" class="trace-row trace-group ${last.rejected?'rejected':''}" data-jump="${last.position}"><span>${start.position}-${last.position}</span><span class="char">${safe(g.map(s=>s.symbol).join(''))||'␣'}</span><span>${safe(start.from)}</span><span>→ ${safe(last.to)}</span></button>`;}).join('');
 }
 function render(input){pause();result=input?.dfa?input:null;index=result?.dfa?.firstError?Math.min(result.dfa.trace.length,result.dfa.firstError.index):0;const t=$('#traceScroller');
  if(t){t.innerHTML=result?groupTrace(result.dfa):'<p>Aún no hay transiciones.</p>';}
  const tutor=$('#afdTutorBox');
  if(tutor){const info=window.SpellAFDTutor.review(result);
   $('#afdTutorHeading').textContent=info.title;
   $('#afdTutorMessage').textContent=info.message;
   $('#afdTutorRule').textContent=info.rule||'';
   $('#afdTutorCorrection').hidden=!(result?.educational||result?.dfa?.natural)||info.accepted||!info.suggestion;
   if((result?.educational||result?.dfa?.natural)&&!info.accepted)$('#afdTutorCorrectionText').textContent=info.suggestion||'';
   $('#afdTutorBox').classList.toggle('afd-tutor-ok',Boolean(info.accepted));
  }
  $('#afdModeButton').textContent=mode==='segmentos'?'Ver caracteres':'Agrupar segmentos';
  draw();
 }
 function bind(){
  $('#afdPrev')?.addEventListener('click',()=>{pause();jump(index-1)});
  $('#afdNext')?.addEventListener('click',()=>{pause();jump(index+1)});
  $('#afdPlay')?.addEventListener('click',()=>{if(playing){pause();return;}if(index===result?.dfa?.trace.length)index=0;playing=true;$('#afdPlay').textContent='⏸ Pausar';auto();});
  $('#afdRestart')?.addEventListener('click',()=>{pause();jump(0)});
  $('#afdStepTrack')?.addEventListener('input',e=>{pause();jump(Number(e.target.value))});
  $('#afdModeButton')?.addEventListener('click',()=>{mode=mode==='segmentos'?'caracteres':'segmentos';const previous=index;render(result);jump(previous)});
  $('#traceScroller')?.addEventListener('click',e=>{const row=e.target.closest('[data-jump]');if(row){pause();jump(Number(row.dataset.jump));}});
  $('#afdCompare')?.addEventListener('click',()=>{
   if(!result?.educational)return;
   const display=$('#afdComparison');display.hidden=false;
   const ex=result.exercise,canonical=ex.answer;
   display.innerHTML=`<p><strong>Tu intento:</strong> ${safe(result.text)}</p><p><strong>Modelo del ejercicio:</strong> ${safe(canonical)}</p><p>AFD del intento: <strong>${result.dfa.accepted?'ACEPTA':'RECHAZA'}</strong>. Modelo: <strong>ACEPTA</strong>.</p><p class="small-muted">La comparación no cambia vidas, respuestas ni progreso.</p>`;
  });
 }
 window.SpellAFDView={render,bind,pause,getStep:()=>index};
})();
