(() => {
 const burger=document.querySelector('.burger'),menu=document.querySelector('#mobile-menu');
 if(burger&&menu){
  const open=()=>{menu.hidden=false;menu.classList.add('open');burger.setAttribute('aria-expanded','true');burger.setAttribute('aria-label','Close menu');document.body.classList.add('menu-open')};
  const close=()=>{menu.classList.remove('open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Open menu');document.body.classList.remove('menu-open');menu.hidden=true};
  burger.addEventListener('click',()=>burger.getAttribute('aria-expanded')==='true'?close():open());
  menu.querySelector('[data-close-menu]')?.addEventListener('click',close);
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  window.addEventListener('resize',()=>{if(innerWidth>720)close()});
 }
 const stats=[...document.querySelectorAll('.stat[data-target]')];
 function count(stat,i){if(stat.dataset.counted)return;stat.dataset.counted='1';const target=Number(stat.dataset.target),dec=Number(stat.dataset.decimals||0),suffix=stat.dataset.suffix||'',el=stat.querySelector('.stat-value'),start=performance.now()+480+i*90,duration=1500+i*80;
  const tick=now=>{if(now<start){requestAnimationFrame(tick);return}const t=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-t,3);el.textContent=(target*eased).toFixed(dec)+suffix;if(t<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)}
 if('IntersectionObserver'in window&&stats.length){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){count(e.target,stats.indexOf(e.target));observer.unobserve(e.target)}}),{threshold:.25});stats.forEach(s=>observer.observe(s))}else stats.forEach(count);
})();