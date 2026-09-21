import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
test('Thinking root routes to its list; article and folder routes retain their section',async()=>{
 const main={innerHTML:'',classList:{remove(){},add(){}},querySelector(){return null}};
 const document={querySelector(s){return s==='#main'?main:{classList:{remove(){}},setAttribute(){}}},querySelectorAll(){return []}};
 const window={PORTFOLIO:{profile:{},projects:[],analyses:[],analysisFolders:[],thinking:[{id:'note',parent:'',order:0,date:'',title:'Thought',summary:'',type:'随想',tags:[],toc:[],html:'<p>Text</p>'}],thinkingFolders:[{id:'nested',parent:'',order:0,date:'',title:'Nested',summary:'',tags:[],articleCount:0,kind:'folder'}],about:{html:''}}};
 const location={hash:'#/thinking'};
 const source=(await readFile('src/app.js','utf8')).split("document.querySelectorAll('[data-orbit]')")[0];
 const render=vm.runInNewContext(source+';setupReadingView=()=>{};render',{window,document,location});
 render();assert.match(main.innerHTML,/THINKING/);assert.doesNotMatch(main.innerHTML,/404 \/ NOT FOUND/);
 location.hash='#/thought/note';render();assert.match(main.innerHTML,/返回随想/);
 location.hash='#/thinking-folder/nested';render();assert.match(main.innerHTML,/Nested/);assert.match(main.innerHTML,/href="#\/thinking"/);
});
