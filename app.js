'use strict';
const $=id=>document.getElementById(id);
const normal=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const cards=Array.from(document.querySelectorAll('.card'));
function filter(){const q=normal($('search').value.trim());let candidates=0,approved=0,queued=0;cards.forEach(c=>{c.hidden=!normal(c.dataset.search).includes(q);if(!c.hidden){if(c.closest('#approved-cards'))approved++;else candidates++}});document.querySelectorAll('.queued-item').forEach(c=>{c.hidden=!normal(c.dataset.search).includes(q);if(!c.hidden)queued++});$('result-count').textContent=`${approved} approved · ${candidates} awaiting QC · ${queued} queued`;$('no-results').hidden=approved+candidates+queued>0;}
function reset(){ $('search').value='';filter();$('search').focus(); }
$('search').addEventListener('input',filter);$('clear').addEventListener('click',reset);$('reset').addEventListener('click',reset);
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{$('search').value=b.dataset.filter;filter()}));document.querySelectorAll('.scene-link').forEach(a=>a.addEventListener('click',()=>{$('search').value='';filter()}));

filter();
