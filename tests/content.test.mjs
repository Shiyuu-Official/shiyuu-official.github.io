import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build} from '../scripts/build.mjs';
import {startServer} from '../server.mjs';
async function fixture(){
 const root=await mkdtemp(join(tmpdir(),'portfolio-md-test-'));
 await mkdir(join(root,'src'),{recursive:true});await mkdir(join(root,'content/about'),{recursive:true});
 await writeFile(join(root,'src/index.html'),'<html><head><title>{{name}}</title></head><body>{{alias}}</body></html>');
 await writeFile(join(root,'content/site.json'),JSON.stringify({name:'<设计者>',alias:'TEST',direction:'策划',placeholder:false}));
 await writeFile(join(root,'content/about/index.md'),'## 关于\n\n个人介绍。');
 return root;
}
async function entry(root,name,text,collection='projects'){
 const dir=join(root,'content',collection,name);await mkdir(dir,{recursive:true});await writeFile(join(dir,'index.md'),text);return dir;
}
const exists=async p=>{try{await access(p);return true}catch{return false}};
async function until(fn,message){
 const end=Date.now()+8000;
 while(Date.now()<end){if(await fn())return;await new Promise(r=>setTimeout(r,100));}
 throw new Error(message);
}
test('Markdown renders documents and assets; drafts are excluded and removed assets disappear',async t=>{
 const root=await fixture();t.after(()=>rm(root,{recursive:true,force:true}));
 const fence=String.fromCharCode(96).repeat(3);
 const dir=await entry(root,'中文项目',[
 '---','title: "中文项目 <标题>"','date: "2026-09-20"','order: 1','featured: true',
 'tags: ["关卡", "Unity"]','cover: "./assets/封面 图.svg"','download: "./assets/design.pdf"','---',
 '## 设计目标','','**粗体**与[附件](./assets/design.pdf)','','### 验证','','- 目标一','- 目标二','',
 '| 参数 | 数值 |','| --- | --- |','| A | 1 |','',
 '![配图](<./assets/封面 图.svg>)','',
 '<video src="./assets/demo.mp4" onerror="alert(1)"></video>','',
 '<script>alert("xss")</script>','',fence+'js','const score = 1;',fence
 ].join('\n'));
 await mkdir(join(dir,'assets'));
 await writeFile(join(dir,'assets/封面 图.svg'),'<svg xmlns="http://www.w3.org/2000/svg"/>');
 await writeFile(join(dir,'assets/design.pdf'),'PDF attachment');
 await writeFile(join(dir,'assets/demo.mp4'),'0123456789');
 const draft=await entry(root,'private','---\ntitle: "草稿"\ndraft: true\n---\n![missing](missing.png)');
 await writeFile(join(draft,'private.pdf'),'secret');
 await entry(root,'second','---\ntitle: "第二篇"\norder: 2\n---\n## 正文');
 await entry(root,'note','# 普通 Markdown\n\n不需要配置也能显示。','analyses');
 const data=await build({root});
 assert.deepEqual(data.projects.map(p=>p.id),['中文项目','second']);
 assert.equal(data.analyses[0].title,'普通 Markdown');
 assert.equal(data.projects[0].toc.length,2);
 assert.match(data.projects[0].html,/<table>/);
 assert.match(data.projects[0].html,/<strong>粗体<\/strong>/);
 assert.match(data.projects[0].html,/<pre><code class="language-js">/);
 assert.match(data.projects[0].html,/controls/);
 assert.doesNotMatch(data.projects[0].html,/onerror|<script|alert\(/);
 assert.match(data.projects[0].cover,/content\/projects\/%E4/);
 assert.equal(await exists(join(root,'dist/content/projects/中文项目/assets/封面 图.svg')),true);
 assert.equal(await exists(join(root,'dist/content/projects/private')),false);
 assert.equal(await exists(join(root,'dist/content/projects/中文项目/index.md')),false);
 assert.match(await readFile(join(root,'dist/index.html'),'utf8'),/&lt;设计者&gt;/);
 assert.doesNotMatch(await readFile(join(root,'dist/content.js'),'utf8'),/<script/);
 await writeFile(join(dir,'index.md'),'---\ndraft: true\n---\n');
 await rm(join(root,'content/projects/second'),{recursive:true});
 const after=await build({root});
 assert.equal(after.projects.length,0);
 assert.equal(await exists(join(root,'dist/content/projects/中文项目')),false);
});
test('Invalid YAML and broken or escaping attachments preserve last valid output',async t=>{
 const root=await fixture();t.after(()=>rm(root,{recursive:true,force:true}));
 const dir=await entry(root,'demo','---\ntitle: "正常"\n---\n## 正文');
 await build({root});const original=await readFile(join(root,'dist/content.js'),'utf8');
 for(const content of ['---\ntitle: [broken\n---\n','---\ntitle: "Test"\ndraft: "false"\n---\n','---\ntitle: "Test"\n---\n![缺失图片](missing.png)','---\ntitle: "Test"\n---\n[越界](../about/index.md)']){
  await writeFile(join(dir,'index.md'),content);await assert.rejects(build({root}),/index.md/);
  assert.equal(await readFile(join(root,'dist/content.js'),'utf8'),original);
 }
});
test('Dev server watches additions, edits and deletions; reports errors; supports media ranges',async t=>{
 const root=await fixture();const app=await startServer({root,port:0});
 t.after(async()=>{await app.close();await rm(root,{recursive:true,force:true})});
 const state=()=>fetch(app.url+'/__dev/state').then(r=>r.json());
 const before=await state();
 const dir=await entry(root,'new-demo','---\ntitle: "新增项目"\n---\n## 核心机制');
 await writeFile(join(dir,'demo.mp4'),'0123456789');
 await until(async()=> (await state()).version>before.version,'new folder not detected');
 assert.match(await fetch(app.url+'/content.js').then(r=>r.text()),/新增项目/);
 const ranged=await fetch(app.url+'/content/projects/new-demo/demo.mp4',{headers:{Range:'bytes=2-5'}});
 assert.equal(ranged.status,206);assert.equal(await ranged.text(),'2345');
 assert.match(await fetch(app.url).then(r=>r.text()),/__dev\/state/);
 await writeFile(join(dir,'index.md'),'---\ntitle: [bad\n---');
 await until(async()=>Boolean((await state()).error),'build error not surfaced');
 assert.match(await fetch(app.url+'/content.js').then(r=>r.text()),/新增项目/);
 await writeFile(join(dir,'index.md'),'---\ntitle: "已修复"\n---\n## 新章节');
 await until(async()=>!(await state()).error&&(await fetch(app.url+'/content.js').then(r=>r.text())).includes('已修复'),'fixed document not rebuilt');
 await rm(dir,{recursive:true});
 await until(async()=>!(await fetch(app.url+'/content.js').then(r=>r.text())).includes('已修复'),'deleted folder not removed');
 assert.equal((await fetch(app.url+'/content/projects/new-demo/demo.mp4')).status,404);
});

test('Nested folders count descendants, isolate same-name articles and exclude draft subtrees',async t=>{
 const root=await fixture();t.after(()=>rm(root,{recursive:true,force:true}));
 const folder=join(root,'content/analyses/专题');
 await mkdir(folder,{recursive:true});
 await writeFile(join(folder,'_folder.md'),'---\ntitle: "专题"\n---');
 const a=await entry(root,'专题/一层/同名','## 第一篇','analyses');
 const b=await entry(root,'专题/二层/同名','## 第二篇','analyses');
 await writeFile(join(a,'asset.txt'),'first');await writeFile(join(b,'asset.txt'),'second');
 const hidden=join(folder,'草稿专题');
 await mkdir(hidden,{recursive:true});await writeFile(join(hidden,'_folder.md'),'---\ndraft: true\n---');
 const hiddenArticle=await entry(root,'专题/草稿专题/secret','## Hidden','analyses');
 await writeFile(join(hiddenArticle,'secret.txt'),'secret');
 await entry(root,'专题/草稿文章','---\ndraft: true\n---\n','analyses');
 await mkdir(join(folder,'空文件夹'));await writeFile(join(folder,'空文件夹/_folder.md'),'---\ntitle: "空文件夹"\n---');
 let data=await build({root});
 assert.equal(data.analyses.length,2);
 assert.equal(data.analysisFolders.find(f=>f.id==='专题').articleCount,2);
 assert.equal(data.analysisFolders.find(f=>f.id==='专题/一层').articleCount,1);
 assert.equal(data.analysisFolders.find(f=>f.id==='专题/空文件夹').articleCount,0);
 assert.equal(data.analyses.find(a=>a.id==='专题/一层/同名').parent,'专题/一层');
 assert.equal(await exists(join(root,'dist/content/analyses/专题/草稿专题')),false);
 assert.equal(await readFile(join(root,'dist/content/analyses/专题/一层/同名/asset.txt'),'utf8'),'first');
 await writeFile(join(folder,'_folder.md'),'---\ndraft: true\n---');
 data=await build({root});assert.equal(data.analyses.length,0);assert.equal(data.analysisFolders.length,0);
 assert.equal(await exists(join(root,'dist/content/analyses/专题')),false);
});
