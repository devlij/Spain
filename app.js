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
    const prev=card.querySelector('.fmt-tab.is-active');
    tabs.forEach(t=>t.classList.toggle('is-active',t===tab));
    if(!img||!link)return;
    const dtab0=card.querySelector('.day-tab.is-active');
    const useDay=dtab0&&dtab0.getAttribute('data-daynight')==='day';
    const next=fmt==='9x16'
      ?(useDay&&img.getAttribute('data-src-916-day'))||img.getAttribute('data-src-916')
      :fmt==='4x5'
      ?(useDay&&img.getAttribute('data-src-45-day'))||img.getAttribute('data-src-45')
      :(useDay&&img.getAttribute('data-src-16-day'))||img.getAttribute('data-src-16');
    if(fmt==='9x16'&&next&&!card.hasAttribute('data-916-ok')){
      // The 9:16 master lands with the label-bar backfill: probe it on first
      // click. If the file 404s, drop the 9:16 tab + download and revert.
      const probe=new Image();
      probe.onload=function(){card.setAttribute('data-916-ok','1');swap();};
      probe.onerror=function(){
        card.setAttribute('data-916-missing','1');
        tab.remove();
        const dl=card.querySelector('a.download[data-dl="9x16"]');if(dl)dl.remove();
        tabs.forEach(t=>t.classList.toggle('is-active',t===prev));
        link.classList.remove('tall916');
      };
      probe.src=next;
      return;
    }
    function swap(){
      img.src=next;link.href=next;
      link.classList.toggle('tall',fmt==='4x5');
      link.classList.toggle('tall916',fmt==='9x16');
    }
    if(next)swap();
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
    const t916=card.querySelector('.fmt-tab[data-format="9x16"]');
    if(t916){
      t916.disabled=isDay;
      t916.classList.toggle('is-disabled',isDay);
      if(isDay){
        const cur=card.querySelector('.fmt-tab.is-active');
        if(cur&&cur.getAttribute('data-format')==='9x16'){
          const t16=card.querySelector('.fmt-tab[data-format="16x9"]');
          if(t16)t16.click();
        }
      }
    }
    const ftab=card.querySelector('.fmt-tab.is-active');
    const dfmt=ftab?ftab.getAttribute('data-format'):'16x9';
    if(dimg&&dlink){
      const dkey=dfmt==='9x16'?(isDay?'data-src-916-day':'data-src-916'):dfmt==='4x5'?(isDay?'data-src-45-day':'data-src-45'):(isDay?'data-src-16-day':'data-src-16');
      const dnext=dimg.getAttribute(dkey);
      if(dnext){dimg.src=dnext;dlink.href=dnext;}
    }
    if(dimg)card.querySelectorAll('a.download').forEach(a=>{
      const href=a.getAttribute('href');
      const f=a.getAttribute('data-dl')||((href===dimg.getAttribute('data-src-45')||href===dimg.getAttribute('data-src-45-day'))?'4x5':'16x9');
      const dk=f==='9x16'?(isDay?'data-src-916-day':'data-src-916'):f==='4x5'?(isDay?'data-src-45-day':'data-src-45'):(isDay?'data-src-16-day':'data-src-16');
      const u=dimg.getAttribute(dk);
      if(u){a.href=u;a.setAttribute('download',u.split('/').pop());}
    });
    const sc=card.querySelector('p.scenario');
    if(sc){
      if(!sc.getAttribute('data-scenario'))sc.setAttribute('data-scenario',sc.textContent);
      sc.textContent=isDay?'\u2600 Daylight variant \u00b7 derived from the night interpretation':sc.getAttribute('data-scenario');
    }
  });
});

/* Word-of-day slim band rotation (2026-09-25, Jason directive) */
(function(){
  try{
    var data=JSON.parse(document.getElementById('wotd-data').textContent);
    if(!data||!data.length)return;
    var now=new Date();
    var doy=Math.floor((now-new Date(now.getFullYear(),0,0))/864e5); /* Jan 1 -> 1 */
    var e=data[(doy-1)%data.length];
    var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
    var h='<span class="word">'+esc(e.word)+'</span>';
    if(e.translit)h+=' <span class="translit">('+esc(e.translit)+')</span>';
    h+=' <span class="gloss">&ldquo;'+esc(e.word_en)+'&rdquo;</span> <span class="sep">&middot;</span> <span class="phrase">&ldquo;'+esc(e.phrase)+'&rdquo;</span>';
    if(e.phrase_translit)h+=' <span class="translit">('+esc(e.phrase_translit)+')</span>';
    h+=' <span class="gloss">&ldquo;'+esc(e.phrase_en)+'&rdquo;</span>';
    document.querySelector('#wotd .wotd-body').innerHTML=h;
    document.getElementById('wotd-day').textContent='Day '+doy+' of 365';
  }catch(err){}
})();
