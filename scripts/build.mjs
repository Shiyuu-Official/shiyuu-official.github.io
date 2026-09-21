import {readFile,writeFile,readdir,mkdir,cp,rm,lstat,stat,access} from 'node:fs/promises';
import {resolve,join,relative,sep,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import MarkdownIt from 'markdown-it';
import {parse as parseYaml} from 'yaml';
import sanitizeHtml from 'sanitize-html';

const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inside=(parent,child)=>child===parent||child.startsWith(parent+sep);
const md=new MarkdownIt({html:true,linkify:true,typographer:false});
const defaults={name:'知序',alias:'SHIYUU',direction:'游戏策划 / 系统与关卡设计',placeholder:true};
function fail(file,message){throw new Error(file+': '+message);}
function textField(data,key,fallback,file){
 if(data[key]===undefined)return fallback;
 if(typeof data[key]!=='string')fail(file,key+' 必须是文本。');
 return data[key].trim();
}
function boolField(data,key,file){if(data[key]!==undefined&&typeof data[key]!=='boolean')fail(file,key+' 必须是 true 或 false。');return data[key]===true;}
function parseDocument(raw,file){
 const text=raw.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
 if(!text.startsWith('---\n'))return {data:{},body:text};
 const end=text.indexOf('\n---',4);
 if(end<0||!/^(\n|$)/.test(text.slice(end+4)))fail(file,'YAML 头部缺少独占一行的结束 ---。');
 let data;
 try{data=parseYaml(text.slice(4,end),{uniqueKeys:true,maxAliasCount:25})||{}}catch(e){fail(file,'YAML 解析失败：'+e.message)}
 if(typeof data!=='object'||Array.isArray(data))fail(file,'YAML 头部必须是字段列表。');
 return {data,body:text.slice(end+4).trim()};
}
async function filesUnder(directory){
 const out=[];
 for(const entry of await readdir(directory,{withFileTypes:true})){
  if(entry.name.startsWith('.'))continue;
  const full=join(directory,entry.name);
  if(entry.isSymbolicLink())throw new Error('内容目录不支持符号链接：'+full);
  if(entry.isDirectory())out.push(...await filesUnder(full));
  else if(entry.isFile())out.push(full);
 }
 return out;
}
function makeResolver(dir,prefix,available,file){
 return (raw,kind='link')=>{
  if(!raw)return '';
  const url=String(raw).trim();
  if(/[\u0000-\u001f\\]/.test(url))fail(file,'链接包含非法字符：'+url);
  if(url.startsWith('#'))return url;
  if(/^https?:\/\//i.test(url)){new URL(url);return url;}
  if(kind==='link'&&/^mailto:/i.test(url))return url;
  if(/^[a-z][a-z\d+.-]*:/i.test(url)||url.startsWith('//')||url.startsWith('/'))fail(file,'请使用同目录相对路径或完整 https 链接：'+url);
  const cut=url.search(/[?#]/),path=cut<0?url:url.slice(0,cut),suffix=cut<0?'':url.slice(cut);
  let decoded;
  try{decoded=decodeURIComponent(path)}catch{fail(file,'链接编码无效：'+url)}
  const target=resolve(dir,decoded);
  if(!inside(dir,target)||!available.has(target)||extname(target).toLowerCase()==='.md')fail(file,'附件不存在或超出当前文章目录：'+url);
  return prefix+'/'+relative(dir,target).split(sep).map(encodeURIComponent).join('/')+suffix;
 };
}
function renderMarkdown(body,resolveUrl){
 const tokens=md.parse(body,{});
 const toc=[];
 let sequence=0;
 const headingIds=new Set();
 for(let i=0;i<tokens.length;i++){
  const token=tokens[i];
  if(token.type==='heading_open'){
   const id='section-'+sequence++;
   token.attrSet('id',id);
   const title=tokens[i+1]?.children?.map(t=>t.type==='image'?t.content:t.type==='text'||t.type==='code_inline'?t.content:'').join('')||tokens[i+1]?.content||'';
   if(/^h[2-6]$/.test(token.tag))toc.push({id,title,level:Number(token.tag[1])});
   headingIds.add(id);
  }
 }
 const raw=md.renderer.render(tokens,md.options,{});
 const html=sanitizeHtml(raw,{
  allowedTags:[...sanitizeHtml.defaults.allowedTags,'img','video','audio','source','details','summary'],
  allowedAttributes:{
   a:['href','title','target','rel','data-section'],img:['src','alt','title','width','height','loading'],
   h1:['id'],h2:['id'],h3:['id'],h4:['id'],h5:['id'],h6:['id'],
   code:['class'],th:['align'],td:['align'],ol:['start'],
   video:['src','poster','controls','preload','width','height'],audio:['src','controls','preload'],source:['src','type'],details:['open']
  },
  allowedSchemes:['http','https','mailto'],allowProtocolRelative:false,
  transformTags:{
   a:(tag,attrs)=>{
    if(attrs.href)attrs.href=resolveUrl(attrs.href,'link');
    if(attrs.href&&/^https?:\/\//.test(attrs.href)){attrs.target='_blank';attrs.rel='noopener noreferrer';}
    if(attrs.href?.startsWith('#')&&headingIds.has(attrs.href.slice(1)))attrs['data-section']=attrs.href.slice(1);
    return {tagName:tag,attribs:attrs};
   },
   img:(tag,attrs)=>({tagName:tag,attribs:{...attrs,src:resolveUrl(attrs.src,'image'),loading:'lazy'}}),
   video:(tag,attrs)=>({tagName:tag,attribs:{...attrs,...(attrs.src?{src:resolveUrl(attrs.src,'media')}:{}),...(attrs.poster?{poster:resolveUrl(attrs.poster,'image')}:{}),controls:'',preload:'metadata'}}),
   audio:(tag,attrs)=>({tagName:tag,attribs:{...attrs,...(attrs.src?{src:resolveUrl(attrs.src,'media')}:{}),controls:'',preload:'metadata'}}),
   source:(tag,attrs)=>({tagName:tag,attribs:{...attrs,src:resolveUrl(attrs.src,'media')}})
  }
 });
 return {html,toc};
}
async function readEntry(root,collection,name){
 const dir=join(root,'content',collection,name),file=join(dir,'index.md');
 let raw;try{raw=await readFile(file,'utf8')}catch(e){if(e.code==='ENOENT')return null;throw e;}
 const {data,body}=parseDocument(raw,file);
 if(boolField(data,'draft',file))return null;
 const available=new Set(await filesUnder(dir));
 const prefix='content/'+collection+'/'+name.split('/').map(encodeURIComponent).join('/');
 const resolveUrl=makeResolver(dir,prefix,available,file);
 const tags=data.tags||[];
 if(!Array.isArray(tags)||tags.some(t=>typeof t!=='string'))fail(file,'tags 必须是文本数组。');
 const date=textField(data,'date','',file);
 if(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date))fail(file,'date 必须是有效的 YYYY-MM-DD 日期（建议加引号）。');
 if(data.order!==undefined&&(typeof data.order!=='number'||!Number.isFinite(data.order)))fail(file,'order 必须是数字。');
 const theme=textField(data,'theme','paper',file);
 if(!['paper','olive','ink'].includes(theme))fail(file,'theme 只能是 paper、olive 或 ink。');
 const title=textField(data,'title',body.match(/^# (.+)$/m)?.[1]||name,file);
 if(!title)fail(file,'title 不能为空。');
 const summary=textField(data,'summary','',file);
 const item={id:name,title,type:textField(data,'category',collection==='projects'?'项目':'拆解分析',file),summary,date,
   group:textField(data,'group','项目',file),period:textField(data,'period','',file),readingMinutes:Math.max(1,Math.ceil(body.replace(/\s/g,'').length/400)),
   order:data.order??1000,featured:boolField(data,'featured',file),placeholder:boolField(data,'placeholder',file),
   author:textField(data,'author','',file),role:textField(data,'role','',file),
   theme,diagram:textField(data,'diagram','loop',file),stack:tags.join(' · '),tags,
   ...renderMarkdown(body,resolveUrl)};
 for(const key of ['cover','demo','video','download'])item[key]=data[key]?resolveUrl(textField(data,key,'',file),key==='cover'?'image':'link'):'';
 return {item,dir,prefix,assets:[...available].filter(p=>extname(p).toLowerCase()!=='.md')};
}
async function collection(root,name){
 const dir=join(root,'content',name);let entries;try{entries=await readdir(dir,{withFileTypes:true})}catch(e){if(e.code==='ENOENT')return [];throw e;}
 const records=[];
 for(const entry of entries.sort((a,b)=>a.name.localeCompare(b.name,'en'))){
  if(entry.name.startsWith('_')||entry.name.startsWith('.'))continue;
  if(entry.isSymbolicLink())fail(dir,'不支持符号链接：'+entry.name);
  if(entry.isDirectory()){const record=await readEntry(root,name,entry.name);if(record)records.push(record);}
 }
 return records.sort((a,b)=>a.item.order-b.item.order||b.item.date.localeCompare(a.item.date)||a.item.id.localeCompare(b.item.id,'en'));
}

async function analysisTree(root,name='analyses'){
 const records=[],folders=[],folderAssets=[];
 const exists=async p=>{try{await access(p);return true}catch(e){if(e.code==='ENOENT')return false;throw e;}};
 async function walk(dir,parent=''){
  let entries;try{entries=await readdir(dir,{withFileTypes:true})}catch(e){if(e.code==='ENOENT')return [];throw e;}
  const children=[];
  for(const entry of entries.sort((a,b)=>a.name.localeCompare(b.name,'en'))){
   if(entry.name.startsWith('.')||entry.name.startsWith('_'))continue;
   if(entry.isSymbolicLink())fail(dir,'不支持符号链接：'+entry.name);
   if(!entry.isDirectory())continue;
   const id=parent?parent+'/'+entry.name:entry.name,childDir=join(dir,entry.name);
   const article=await exists(join(childDir,'index.md')),folderFile=join(childDir,'_folder.md'),explicit=await exists(folderFile);
   if(article&&explicit)fail(childDir,'index.md 与 _folder.md 不能同时存在。');
   if(article){
    const record=await readEntry(root,name,id);
    if(record){record.item.parent=parent;record.item.kind='article';records.push(record);children.push(record.item);}
    continue;
   }
   const {data}=explicit?parseDocument(await readFile(folderFile,'utf8'),folderFile):{data:{}};
   if(boolField(data,'draft',folderFile))continue;
   const nested=await walk(childDir,id);
   if(!explicit&&!nested.length)continue;
   if(data.order!==undefined&&(typeof data.order!=='number'||!Number.isFinite(data.order)))fail(folderFile,'order 必须是数字。');
   if(data.tags!==undefined&&(!Array.isArray(data.tags)||data.tags.some(t=>typeof t!=='string')))fail(folderFile,'tags 必须是文本数组。');
   const item={id,parent,kind:'folder',title:textField(data,'title',entry.name,folderFile),summary:textField(data,'summary','',folderFile),
    date:'',order:data.order??1000,type:'文件夹',placeholder:boolField(data,'placeholder',folderFile),
    tags:[...new Set([...(data.tags||[]),...nested.flatMap(n=>n.tags?.length?n.tags:[n.type])])],
    articleCount:nested.reduce((sum,n)=>sum+(n.kind==='folder'?n.articleCount:1),0)};
   if(data.cover){
    const prefix='content/'+name+'/'+id.split('/').map(encodeURIComponent).join('/');
    const available=new Set(await filesUnder(childDir));
    const raw=textField(data,'cover','',folderFile);
    item.cover=makeResolver(childDir,prefix,available,folderFile)(raw,'image');
    if(!item.cover.startsWith('http')&&!item.cover.startsWith('#')){
     const target=resolve(childDir,decodeURIComponent(raw.trim().split(/[?#]/)[0]));
     folderAssets.push({dir:childDir,prefix,assets:[target]});
    }
   }
   folders.push(item);children.push(item);
  }
  return children;
 }
 await walk(join(root,'content',name));
 const sort=(a,b)=>a.order-b.order||b.date.localeCompare(a.date)||a.id.localeCompare(b.id,'en');
 records.sort((a,b)=>sort(a.item,b.item));folders.sort(sort);
 return {records,folders,folderAssets};
}

export async function build({root=process.cwd(),outDir=join(root,'dist')}={}){
 root=resolve(root);outDir=resolve(outDir);
 if(outDir!==join(root,'dist'))throw new Error('构建输出只能是当前项目的 dist 目录。');
 const profile={...defaults,...JSON.parse(await readFile(join(root,'content/site.json'),'utf8'))};
 for(const key of ['name','alias','direction'])if(typeof profile[key]!=='string'||!profile[key].trim())throw new Error('content/site.json: '+key+' 必须是非空文本。');
 const [projects,tree,thinkingTree]=await Promise.all([collection(root,'projects'),analysisTree(root),analysisTree(root,'thinking')]);
 const analyses=tree.records;
 const aboutDir=join(root,'content/about'),aboutFile=join(aboutDir,'index.md');
 const aboutAssets=await filesUnder(aboutDir);
 const about=renderMarkdown(parseDocument(await readFile(aboutFile,'utf8'),aboutFile).body,makeResolver(aboutDir,'content/about',new Set(aboutAssets),aboutFile));
 const data={profile,projects:projects.map(r=>r.item),analyses:analyses.map(r=>r.item),analysisFolders:tree.folders,thinking:thinkingTree.records.map(r=>r.item),thinkingFolders:thinkingTree.folders,about};
 // Build a complete stage first; errors in Markdown never replace the last working output.
 const stage=join(root,'.sites-runtime','build-output');
 if(!inside(join(root,'.sites-runtime'),stage))throw new Error('Invalid stage path.');
 await rm(stage,{recursive:true,force:true});
 await mkdir(stage,{recursive:true});
 await cp(join(root,'src'),stage,{recursive:true});
 let index=await readFile(join(stage,'index.html'),'utf8');
 index=index.replace(/\{\{(name|alias)\}\}/g,(_,key)=>escapeHtml(profile[key]));
 await writeFile(join(stage,'index.html'),index);
 await writeFile(join(stage,'content.js'),'window.PORTFOLIO = '+JSON.stringify(data).replaceAll('<','\\u003c').replaceAll('\u2028','\\u2028').replaceAll('\u2029','\\u2029')+';\n');
 for(const record of [...projects,...analyses,...thinkingTree.records,...tree.folderAssets,...thinkingTree.folderAssets,{dir:aboutDir,prefix:'content/about',assets:aboutAssets.filter(p=>extname(p).toLowerCase()!=='.md')}]){
  for(const asset of record.assets){
   // Decode the URL path for its on-disk equivalent (Unicode names remain intact).
   const destination=join(stage,...record.prefix.split('/').map(decodeURIComponent),relative(record.dir,asset));
   await mkdir(resolve(destination,'..'),{recursive:true});
   await cp(asset,destination);
  }
 }
 // Explicit resolved guards prevent any recursive write/delete outside this project.
 if(outDir!==join(root,'dist')||!inside(root,outDir))throw new Error('Invalid output path.');
 const existing=await lstat(outDir).catch(e=>{if(e.code==='ENOENT')return null;throw e;});
 if(existing?.isSymbolicLink())throw new Error('dist 不得是符号链接。');
 await rm(outDir,{recursive:true,force:true});
 await cp(stage,outDir,{recursive:true});
 return data;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{const result=await build();console.log('Built '+result.projects.length+' projects, '+result.analyses.length+' analyses → dist/');}
 catch(e){console.error('Build failed: '+e.message);process.exitCode=1;}
}
