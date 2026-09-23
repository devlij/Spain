'use strict';
const $=id=>document.getElementById(id);
const normal=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const scenes=JSON.parse($('scene-data').textContent);
const cards=Array.from(document.querySelectorAll('.card'));
let active=null;
function filter(){const q=normal($('search').value.trim());let candidates=0,approved=0,queued=0;cards.forEach(c=>{c.hidden=!normal(c.dataset.search).includes(q);if(!c.hidden){if(c.closest('#approved-cards'))approved++;else candidates++}});document.querySelectorAll('.queued-item').forEach(c=>{c.hidden=!normal(c.dataset.search).includes(q);if(!c.hidden)queued++});$('result-count').textContent=`${approved} approved · ${candidates} awaiting QC · ${queued} queued`;$('no-results').hidden=approved+candidates+queued>0;}
function reset(){ $('search').value='';filter();$('search').focus(); }
function showImage(scene,format){active=scene;const wide=format==='16x9';$('viewer-title').textContent=scene.caption;$('viewer-image').src=wide?scene.file_16x9:scene.file_4x5;$('viewer-image').alt=scene.alt_text;$('view-download').href=$('viewer-image').getAttribute('src');$('view-download').download=$('view-download').getAttribute('href').split('/').pop();$('view-wide').setAttribute('aria-pressed',String(wide));$('view-tall').setAttribute('aria-pressed',String(!wide));$('viewer-caption').textContent=`Scenario: ${scene.scenario_label} · ${scene.status} · AI-generated artistic interpretation · Not a photograph.`;if(!$('viewer').open)$('viewer').showModal();}
$('search').addEventListener('input',filter);$('clear').addEventListener('click',reset);$('reset').addEventListener('click',reset);
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{$('search').value=b.dataset.filter;filter()}));document.querySelectorAll('.scene-link').forEach(a=>a.addEventListener('click',()=>{$('search').value='';filter()}));
document.addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)showImage(scenes.find(s=>s.entry_id===b.dataset.id),b.dataset.format)});$('close-viewer').addEventListener('click',()=>$('viewer').close());$('view-wide').addEventListener('click',()=>showImage(active,'16x9'));$('view-tall').addEventListener('click',()=>showImage(active,'4x5'));

filter();
