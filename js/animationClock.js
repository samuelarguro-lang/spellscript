/* V7: monotonic frame clock. Pointer events only store targets; never restart the clock. */
(function(){'use strict';const jobs=new Set();let last=0,raf=0,elapsed=0,frames=[],start=0;
 function tick(now){raf=0;if(document.hidden){last=0;return;}const dt=last?Math.min(1,(now-last)/1000):0;const raw=last?(now-last):0;last=now;elapsed+=dt;if(raw>0){frames.push(raw);if(frames.length>180)frames.shift();}for(const fn of [...jobs]){try{fn(dt,elapsed);}catch(e){console.error('Animation callback',e);jobs.delete(fn);}}if(jobs.size)raf=requestAnimationFrame(tick);}
 function add(fn){jobs.add(fn);if(!raf&&!document.hidden){last=0;raf=requestAnimationFrame(tick);}return ()=>{jobs.delete(fn);if(!jobs.size&&raf){cancelAnimationFrame(raf);raf=0;last=0;}};}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else if(jobs.size&&!raf)raf=requestAnimationFrame(tick);});
 function metrics(){const a=[...frames].sort((x,y)=>x-y),avg=a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);return {fps:avg?1000/avg:0,averageMs:avg,p95Ms:a[Math.floor(a.length*.95)]||0,samples:a.length};}
 window.SpellClock={add,metrics,time:()=>elapsed};})();
