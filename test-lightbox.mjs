import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const scenes=JSON.parse(fs.readFileSync(new URL('./data.json',import.meta.url),'utf8')).scenes;
const elements=new Map();
function element(id){
  if(!elements.has(id))elements.set(id,{
    attrs:{},events:{},value:'',open:false,textContent:'',
    setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k]??this[k]??null;},
    addEventListener(k,fn){this.events[k]=fn;},showModal(){this.open=true;},
    close(){this.open=false;this.events.close?.({target:this});},focus(){},
  });
  return elements.get(id);
}
element('scene-data').textContent=JSON.stringify(scenes);
const document={getElementById:element,querySelectorAll:()=>[],addEventListener(){}};
const context=vm.createContext({document});
vm.runInContext(fs.readFileSync(new URL('./app.js',import.meta.url),'utf8'),context);
for(const scene of scenes){
  for(const format of ['16x9','4x5']){
    context.sceneToTest=scene;context.formatToTest=format;
    vm.runInContext('showImage(sceneToTest,formatToTest)',context);
    const file=format==='16x9'?scene.file_16x9:scene.file_4x5;
    assert.equal(element('viewer-image').src,file);
    assert.equal(element('view-original').href,file);
    assert.equal(element('view-download').href,file);
    assert.equal(element('view-download').download,file.split('/').pop());
    assert.equal(element('view-wide').attrs['aria-pressed'],String(format==='16x9'));
    assert.equal(element('view-tall').attrs['aria-pressed'],String(format==='4x5'));
    assert.equal(element('viewer').open,true);
  }
}
const viewer=element('viewer'),image=element('viewer-image');
viewer.events.pointerdown({target:image});viewer.events.click({target:image});
assert.equal(viewer.open,true,'Image tap must not close');
viewer.events.pointerdown({target:image});viewer.events.click({target:viewer});
assert.equal(viewer.open,true,'Drag ending on backdrop must not close');
viewer.events.pointerdown({target:viewer});viewer.events.pointercancel({target:viewer});viewer.events.click({target:viewer});
assert.equal(viewer.open,true,'Cancelled gesture must not close');
viewer.events.pointerdown({target:viewer});viewer.events.click({target:viewer});
assert.equal(viewer.open,false,'Backdrop tap must close');
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
assert.match(html,/id="view-original" target="_blank" rel="noopener noreferrer"/);
assert.equal((html.match(/class="image-button"/g)||[]).length,scenes.length);
assert.equal((html.match(/class="portrait"/g)||[]).length,scenes.length);
console.log(`PASS: ${scenes.length*2} master mappings, active controls, backdrop/image/cancelled-gesture behavior, safe original link, single-frame cards`);
