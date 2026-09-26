'use strict';
const $=id=>document.getElementById(id);
const normal=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const cards=Array.from(document.querySelectorAll('.card'));
function filter(){const q=normal($('search').value.trim());let candidates=0,approved=0,queued=0;cards.forEach(c=>{c.hidden=!normal(c.dataset.search).includes(q);if(!c.hidden){if(c.closest('#approved-cards'))approved++;else candidates++}});document.querySelectorAll('.queued-item').forEach(c=>{c.hidden=!normal(c.dataset.search).includes(q);if(!c.hidden)queued++});$('result-count').textContent=`${approved} approved · ${candidates} awaiting QC · ${queued} queued`;var nr=$('no-results');if(nr)nr.hidden=approved+candidates+queued>0;}
function reset(){ $('search').value='';filter();$('search').focus(); }
$('search').addEventListener('input',filter);$('clear').addEventListener('click',reset);var r=$('reset');if(r)r.addEventListener('click',reset);
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{$('search').value=b.dataset.filter;filter()}));document.querySelectorAll('.scene-link').forEach(a=>a.addEventListener('click',()=>{$('search').value='';filter()}));

filter();

/* Section 16: 16:9 / 4:5 format tab switching per card. */
document.querySelectorAll('.card').forEach(card=>{
  const tabs=card.querySelectorAll('.fmt-tab');
  const link=card.querySelector('a.thumb');
  const img=link&&link.querySelector('img');
  tabs.forEach(tab=>tab.addEventListener('click',e=>{
    e.preventDefault();
    const fmt=tab.dataset.format;
    tabs.forEach(t=>t.classList.toggle('is-active',t===tab));
    if(!img||!link)return;
    const dtab0=card.querySelector('.day-tab.is-active');
    const useDay=dtab0&&dtab0.getAttribute('data-daynight')==='day';
    const next=fmt==='4x5'?(useDay&&img.getAttribute('data-src-45-day'))||img.getAttribute('data-src-45'):(useDay&&img.getAttribute('data-src-16-day'))||img.getAttribute('data-src-16');
    if(next){img.src=next;link.href=next;}
    link.classList.toggle('tall',fmt==='4x5');
  }));
});

/* Daylight toggle: one button per card, rendered only where day-variant masters
   exist. Night is the default; toggles image, downloads, and scenario caption. */
document.querySelectorAll('.card').forEach(card=>{
  const dtab=card.querySelector('.day-tab');
  if(!dtab)return;
  const dlink=card.querySelector('a.thumb');
  const dimg=dlink&&dlink.querySelector('img');
  dtab.addEventListener('click',e=>{
    e.preventDefault();
    const isDay=!dtab.classList.contains('is-active');
    dtab.classList.toggle('is-active',isDay);
    dtab.setAttribute('aria-pressed',isDay?'true':'false');
    dtab.setAttribute('data-daynight',isDay?'day':'night');
    const ftab=card.querySelector('.fmt-tab.is-active');
    const dfmt=ftab?ftab.getAttribute('data-format'):'16x9';
    if(dimg&&dlink){
      const dkey=dfmt==='4x5'?(isDay?'data-src-45-day':'data-src-45'):(isDay?'data-src-16-day':'data-src-16');
      const dnext=dimg.getAttribute(dkey);
      if(dnext){dimg.src=dnext;dlink.href=dnext;}
    }
    if(dimg)card.querySelectorAll('a.download').forEach(a=>{
      const href=a.getAttribute('href');
      const f=(href===dimg.getAttribute('data-src-45')||href===dimg.getAttribute('data-src-45-day'))?'4x5':'16x9';
      const dk=f==='4x5'?(isDay?'data-src-45-day':'data-src-45'):(isDay?'data-src-16-day':'data-src-16');
      const u=dimg.getAttribute(dk);
      if(u)a.href=u;
    });
    const sc=card.querySelector('p.scenario');
    if(sc){
      if(!sc.getAttribute('data-scenario'))sc.setAttribute('data-scenario',sc.textContent);
      sc.textContent=isDay?'\u2600 Daylight variant \u00b7 derived from the night interpretation':sc.getAttribute('data-scenario');
    }
  });
});
