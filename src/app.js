const { profile, projects, analyses, analysisFolders = [], thinking = [], thinkingFolders = [], about: aboutContent } = window.PORTFOLIO;
const esc=value=>String(value??"").replace(/[&<>"\x27]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\x27":"&#39;"}[c]));
const label=item=>item.placeholder?"内容待补充":item.date;
const orbit = `<svg class="rhine-orbit" viewBox="0 0 480 480" fill="none" aria-hidden="true"><circle cx="240" cy="240" r="210" stroke="currentColor" stroke-width="1.2" stroke-dasharray="1080 240" transform="rotate(38 240 240)"/><circle class="orbit-light" cx="240" cy="240" r="153" stroke-width="2.5" stroke-dasharray="760 202" transform="rotate(138 240 240)"/><circle cx="240" cy="240" r="58" stroke="currentColor" stroke-dasharray="122 60" transform="rotate(-50 240 240)"/><circle cx="405" cy="370" r="12" fill="currentColor"/><circle class="orbit-light" cx="126" cy="342" r="5"/><circle class="orbit-signal" cx="190" cy="198" r="3.5"/><circle class="orbit-signal" cx="288" cy="277" r="3.5"/><path d="M234 240h12M240 234v12" stroke="currentColor"/></svg>`;
const diagrams = {
 loop:`<svg viewBox="0 0 420 220" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.2"><circle cx="210" cy="110" r="82"/><circle cx="210" cy="110" r="59" stroke-dasharray="3 6"/><path d="M128 110H68M292 110h60M210 28V8M210 192v20M154 54l112 112M266 54 154 166" opacity=".4"/><path d="m210 28 10-7-10-7M292 110l7 10 7-10M210 192l-10 7 10 7"/><rect x="192" y="92" width="36" height="36" transform="rotate(45 210 110)"/><circle cx="128" cy="110" r="6" fill="currentColor"/><circle cx="292" cy="110" r="6" fill="currentColor"/></g></svg>`,
 level:`<svg viewBox="0 0 420 220" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.2"><path d="M78 162 182 102l104 60-104 60ZM182 102V25l104 60v77M182 25 78 85v77M78 85l104 60 104-60M182 145v77" transform="translate(27 -14)"/><path d="m123 145 51-29 52 29 51-29" stroke-width="3"/><path d="M61 185H349M61 182v6M349 182v6" opacity=".4"/><circle cx="123" cy="145" r="5" fill="currentColor"/><circle cx="277" cy="116" r="5" fill="currentColor"/></g></svg>`
};
const main = document.querySelector('#main');
function card(p,i){
 const picture=p.cover?'<img class="work-cover" src="'+esc(p.cover)+'" alt="'+esc(p.title)+'" loading="lazy">':'<div class="diagram">'+(diagrams[p.diagram]||diagrams.loop)+'</div>';
 return '<a class="dossier-work-card" href="#/project/'+encodeURIComponent(p.id)+'"><div class="work-illustration '+(p.theme==='paper'?'':p.theme)+(p.cover?' has-cover':'')+'">'+picture+
 '<span class="work-index">'+String(i+1).padStart(2,'0')+' / '+esc(p.type)+'</span>'+(p.placeholder?'<span class="work-placeholder">项目占位</span>':'')+
 '<span class="work-medium">'+esc(p.date)+'</span></div><div class="work-card-caption"><div><h3>'+esc(p.title)+'</h3><p>'+esc(p.stack)+'</p></div><span class="work-arrow" aria-hidden="true">↗</span></div></a>';
}
function head(label,title,description){return '<header class="page-head"><p class="page-label">'+esc(label)+'</p><h1>'+esc(title)+'<span>.</span></h1><p>'+esc(description)+'</p></header>';}
function directoryHead(number,label,title,description){return '<header class="analysis-blog-heading directory-heading"><div><a class="analysis-breadcrumb" href="#/">← 首页 <span>/ '+esc(number)+'</span></a><h1>'+esc(label)+' <span>'+esc(title)+'</span></h1><p>'+esc(description)+'</p></div><div class="analysis-heading-orbit" aria-hidden="true">'+orbit+'<span>'+esc(number)+'</span></div></header>';}
function home(){return `<div class="dossier-home"><section class="dossier-intro"><div class="dossier-profile"><p class="dossier-eyebrow">GAME DESIGN / PROJECTS / ANALYSIS</p><h1 id="home-title"><span>${esc(profile.alias)}</span><span class="dossier-inverse">GAME DESIGN PORTFOLIO</span></h1><div class="dossier-bio"><p class="dossier-name">${esc(profile.name)}<span>${esc(profile.direction)}</span></p><p>南京大学软件工程智能化专业在读，关注游戏设计与行业发展，记录个人思考与创作，对游戏永远保有热情。<br>网站仍在施工中...偶有bug/未完成/测试遗留致歉</p></div><div class="dossier-actions"><a class="dossier-action-primary" href="#/projects">探索项目<span aria-hidden="true">↗</span></a><a href="#/about">关于我<span aria-hidden="true">→</span></a></div></div><div class="dossier-portrait"><div class="dossier-orbit">${orbit}</div><div class="portrait-frame"><img src="assets/avatar.jpg" alt="${esc(profile.name)}的头像" width="224" height="224" loading="eager"></div><span class="portrait-plus" aria-hidden="true">+</span><p class="portrait-caption">A PLAYER. A DESIGNER.<br><span>从体验出发 · 用设计回答</span></p></div></section><section><div class="dossier-section-heading"><div><p class="dossier-eyebrow">01 / SELECTED PROJECTS</p><h2>从想法到落地 <span>.</span></h2></div><a href="#/projects">全部项目<span aria-hidden="true">↗</span></a></div><div class="dossier-work-grid">${(projects.some(p=>p.featured)?projects.filter(p=>p.featured):projects).slice(0,2).map(card).join('')}</div></section><section class="dossier-notes"><div class="notes-heading"><p class="dossier-eyebrow">02 / DESIGN ANALYSIS</p><h2>体验，<br>思考 <span>.</span></h2><a href="#/analysis">全部分析<span aria-hidden="true">↗</span></a></div><ol class="notes-index">${analyses.map((a,i)=>`<li><a href="#/article/${encodeURIComponent(a.id)}"><span class="note-number">0${i+1}</span><div><span class="note-meta">${esc(a.type)} / ${esc(label(a))}</span><h3>${esc(a.title)}</h3></div><span class="note-arrow" aria-hidden="true">↗</span></a></li>`).join('')}</ol></section><div class="dossier-colophon"><span>PLAY. THINK. CREATE.<span class="colophon-square"></span></span><span>END OF INDEX / CONTINUE EXPLORING</span></div></div>`}
function projectPage(){return `${directoryHead('01','PROJECTS','项目','参与落地的项目，初步想法的Demo')}${projects.some(p=>p.placeholder)?'<p class="archive-notice">标注“项目占位”的档案尚待补充真实 Demo 与设计成果。</p>':""}<div class="archive-grid">${projects.length?projects.map(card).join(''):'<p class="archive-notice">项目整理中。</p>'}</div>`}
function analysisPage(selectedTag='',folderId='',isThinking=false){
 const analyses=isThinking?thinking:window.PORTFOLIO.analyses;
 const analysisFolders=isThinking?thinkingFolders:window.PORTFOLIO.analysisFolders||[];
 const section=isThinking?'thinking':'analysis', sectionTitle=isThinking?'随想':'分析', number=isThinking?'03':'02';
 const folderRoute=isThinking?'thinking-folder':'folder',articleRoute=isThinking?'thought':'article';
 const folder=analysisFolders.find(f=>f.id===folderId);

 if(folderId&&!folder)return head('404 / NOT FOUND','文件夹未找到','这个文件夹不存在或尚未公开。')+'<a class="back" href="#/'+section+'">← 返回'+sectionTitle+'</a>';
 const scope=folderId?'#/'+folderRoute+'/'+encodeURIComponent(folderId):'#/'+section;
 const entries=[...analyses.filter(a=>(a.parent||'')===folderId),...analysisFolders.filter(a=>a.parent===folderId)].sort((a,b)=>a.order-b.order||b.date.localeCompare(a.date)||a.id.localeCompare(b.id,'en'));
 const ancestors=folderId?folderId.split('/').map((_,i,parts)=>analysisFolders.find(f=>f.id===parts.slice(0,i+1).join('/'))).filter(Boolean):[];
 const crumbs='<a href="#/'+section+'">'+sectionTitle+'</a>'+ancestors.map(f=>'<span>/</span>'+(f.id===folderId?'<span aria-current="page">'+esc(f.title)+'</span>':'<a href="#/'+folderRoute+'/'+encodeURIComponent(f.id)+'">'+esc(f.title)+'</a>')).join('');
 const tags=[...new Set(entries.flatMap(a=>a.tags?.length?a.tags:[a.type]))];
 const filtered=selectedTag?entries.filter(a=>(a.tags?.length?a.tags:[a.type]).includes(selectedTag)):entries;
 const tagLink=(tag)=>'<a class="analysis-tag'+(tag===selectedTag?' selected':'')+'" href="'+scope+'/'+encodeURIComponent(tag)+'"'+(tag===selectedTag?' aria-current="true"':'')+'>'+esc(tag)+'</a>';
 const cards=filtered.map(a=>{
  const isFolder=a.kind==='folder';
  const date=a.date?new Date(a.date+'T00:00:00Z').toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}):'';
  return '<li><a class="analysis-post" href="#/'+(isFolder?folderRoute:articleRoute)+'/'+encodeURIComponent(a.id)+'">'+
   '<div class="analysis-post-art" aria-hidden="true">'+(a.cover?'<img src="'+esc(a.cover)+'" alt="" loading="lazy">':orbit)+'</div>'+
   '<div class="analysis-post-copy">'+(date?'<time datetime="'+esc(a.date)+'">'+esc(date)+'</time>':'')+'<h2>'+esc(a.title)+'</h2><p>'+esc(a.summary)+'</p>'+
   '<div class="analysis-post-meta">'+(isFolder?'<span>▱ '+a.articleCount+' 篇文章</span><span>文件夹</span>':'<span>◷ '+Math.max(1,a.readingMinutes||1)+' min</span><span>◎ zh-CN</span>')+
   (a.placeholder?'<span class="sample-label">示例内容</span>':'')+'</div>'+
   '<div class="analysis-post-tags">'+(a.tags?.length?a.tags:[a.type]).map(t=>'<span>'+esc(t)+'</span>').join('')+'</div></div><span class="analysis-post-arrow" aria-hidden="true">›</span></a></li>';
 }).join('');
 const back=folder?'<a class="analysis-breadcrumb" href="'+(folder.parent?'#/'+folderRoute+'/'+encodeURIComponent(folder.parent):'#/'+section)+'">← 返回上一级</a>':'<a class="analysis-breadcrumb" href="#/">← 首页 <span>/ 02</span></a>';
 return '<div class="analysis-blog">'+(folder?'<nav class="folder-breadcrumb" aria-label="文件夹路径">'+crumbs+'</nav>':'')+
 (folder?'<header class="analysis-blog-heading"><div>'+back+'<h1'+(folder?' class="folder-heading"':'')+'>'+(folder?esc(folder.title):'ANALYSIS')+' <span>'+(folder?'文件夹':'分析')+'</span></h1><p>'+(folder?esc(folder.summary):'游戏拆解、设计观察与思考记录')+'</p></div><div class="analysis-heading-orbit" aria-hidden="true">'+orbit+'<span>'+number+'</span></div></header>':directoryHead(number,isThinking?'THINKING':'ANALYSIS',sectionTitle,isThinking?'零散的念头、日常观察与思考记录':'游戏拆解、设计观察与思考记录'))+

 '<div class="analysis-blog-layout"><section class="analysis-feed" aria-label="'+sectionTitle+'文章"><p class="analysis-count" aria-live="polite">共 '+filtered.filter(a=>a.kind!=='folder').length+' 篇文章 · '+filtered.filter(a=>a.kind==='folder').length+' 个文件夹'+(selectedTag?' · '+esc(selectedTag):'')+'</p>'+
 (cards?'<ol class="analysis-posts">'+cards+'</ol>':'<p class="archive-notice">暂无内容。</p>')+
 '</section><aside class="analysis-tag-panel"><h2>◇ 标签</h2><nav aria-label="文章标签">'+tags.map(tagLink).join('')+'</nav><a class="analysis-show-all" href="'+scope+'">查看全部 →</a></aside></div></div>';
}
function detail(item,isProject,isThinking=false){
 const section=isThinking?'thinking':'analysis', sectionTitle=isThinking?'随想':'分析', folderRoute=isThinking?'thinking-folder':'folder';
 if(!item)return head('404 / NOT FOUND','文章未找到','这篇文章不存在或尚未公开。')+'<a class="back" href="#/'+section+'">← 返回'+sectionTitle+'</a>';
 const back=isProject?'#/projects':item.parent?'#/'+folderRoute+'/'+encodeURIComponent(item.parent):'#/'+section;
 const date=item.date?new Date(item.date+'T00:00:00Z').toLocaleDateString('zh-CN',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}):'';
 const toc=item.toc.map(s=>'<div class="reading-toc-item"><span class="toc-section-progress" aria-hidden="true"></span><a href="#'+s.id+'" data-section="'+s.id+'" data-depth="'+s.level+'">'+esc(s.title)+'</a></div>').join('');
 const cover=item.cover?'<div class="reading-hero"><img class="reading-cover-blur" src="'+esc(item.cover)+'" alt="" aria-hidden="true" fetchpriority="high"><img class="reading-cover" src="'+esc(item.cover)+'" alt="'+esc(item.title)+'" fetchpriority="high" loading="eager"></div>':'';
 const links=[['demo','体验项目 ↗'],['video','演示视频 ↗'],['download','下载附件 ↓']].filter(([key])=>item[key]).map(([key,title])=>'<a class="document-link" href="'+esc(item[key])+'" '+(key==='download'?'download':'target="_blank" rel="noopener noreferrer"')+'>'+title+'</a>').join('');
 return '<div class="reading-page"><a class="reading-back" href="'+back+'">‹ 返回'+(isProject?'项目':item.parent?'所在文件夹':sectionTitle)+'</a><div class="reading-layout">'+
 '<article class="reading-main">'+cover+'<header class="reading-header"><div class="reading-meta">'+(date?'<span>▦ <time datetime="'+esc(item.date)+'">'+esc(date)+'</time></span>':'')+
 '<span>◷ '+Math.max(1,item.readingMinutes||1)+' min</span><span>◎ zh-CN</span>'+
 (item.tags?.length?'<span class="reading-tags">＃ '+item.tags.map(t=>isProject?esc(t):'<a href="#/'+section+'/'+encodeURIComponent(t)+'">'+esc(t)+'</a>').join(' / ')+'</span>':'')+'</div>'+
 '<h1>'+esc(item.title)+'</h1><p class="reading-summary">'+esc(item.summary)+'</p>'+(item.placeholder?'<p class="reading-placeholder">示例文章 · 内容可替换</p>':'')+'<hr></header>'+
 '<div class="article markdown-body reading-body">'+item.html+'</div>'+(links?'<div class="document-links">'+links+'</div>':'')+'</article>'+
 (toc?'<aside class="reading-toc"><h2>TABLE OF CONTENTS</h2><nav aria-label="文章目录">'+toc+'</nav></aside>':'')+'</div><output class="reading-progress" aria-label="文章阅读进度">0%</output></div>';
}
function about(){
 return directoryHead('04','ABOUT','关于我','保持玩家的好奇，也保持设计者的追问。')+
 '<div class="about-grid"><div class="about-identity"><p class="page-label">'+esc(profile.alias)+' / GAME DESIGNER</p><h2>'+esc(profile.name)+'</h2><p>'+esc(profile.direction)+'</p>'+
 (profile.placeholder?'<span class="status-tag">个人资料为暂定内容</span>':'')+
 '</div><article class="article markdown-body">'+aboutContent.html+'</article></div>';
}
function credits(){return `${head('REFERENCE / ACKNOWLEDGEMENTS','设计致谢','保留灵感来源，也尊重创作与开源贡献。')}<div class="credits"><p>页面布局、纸灰与墨绿配色、轨道图形和开屏动效，基于 <a href="https://github.com/entropy622/entropy622.github.io" target="_blank" rel="noopener noreferrer">entropy622 / Aentro 博客</a> 改编。原项目采用 <a href="licenses/Entropy-Apache-2.0.txt">Apache-2.0 许可证</a>。本版本修改了内容、导航、详情结构、可访问性和响应式样式。</p><p>开屏的莱茵生命标志来自 <a href="https://github.com/LBEILC/RhineLabUI" target="_blank" rel="noopener noreferrer">LBEILC / RhineLabUI</a>，对应代码采用 <a href="licenses/RhineLabUI-MIT.txt">MIT 许可证</a>。相关品牌与美术标志的权利归原权利人所有，本作品集与官方无关联。</p><p>标记为“占位”或“内容待补充”的档案是展示结构，不代表已完成的项目或研究成果。</p></div>`}
function render(focus=false){disposeReadingView();const path=location.hash.slice(1)||'/';const parts=path.split('/').filter(Boolean).map(p=>{try{return decodeURIComponent(p)}catch{return p}});const page=parts[0]||'home';let html;let active=page;if(page==='home')html=home();else if(page==='projects')html=projectPage();else if(page==='analysis')html=analysisPage(parts[1]||'');else if(page==='folder'){html=analysisPage(parts[2]||'',parts[1]||'');active='analysis'}else if(page==='thinking')html=analysisPage(parts[1]||'','',true);else if(page==='thinking-folder'){html=analysisPage(parts[2]||'',parts[1]||'',true);active='thinking'}else if(page==='thought'){html=detail(thinking.find(a=>a.id===parts[1]),false,true);active='thinking'}else if(page==='about')html=about();else if(page==='credits')html=credits();else if(page==='project'){html=detail(projects.find(p=>p.id===parts[1]),true);active='projects'}else if(page==='article'){html=detail(analyses.find(a=>a.id===parts[1]),false);active='analysis'}else html=detail(null,false);main.innerHTML=html;setupReadingView();main.classList.remove('page-enter');void main.offsetWidth;main.classList.add('page-enter');document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});document.querySelector('#navigation').classList.remove('expanded');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false');document.title=`${main.querySelector('h1')?.textContent||'作品集'} · ${profile.name} ${profile.alias}`;if(focus){window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true})}}

let disposeReadingView=()=>{};
function setupReadingView(){
 const article=main.querySelector('.reading-main');
 if(!article)return;
 const body=article.querySelector('.reading-body'),blur=article.querySelector('.reading-cover-blur');
 const toc=main.querySelector('.reading-toc nav');
 const links=Array.from(main.querySelectorAll('.reading-toc [data-section]'));
 const headings=links.map(link=>document.getElementById(link.dataset.section));
 const progress=main.querySelector('.reading-progress');
 let frame=0,previousActive=-1;
 function update(){
  frame=0;
  const view=window.innerHeight,bodyBox=body.getBoundingClientRect(),bottom=bodyBox.bottom;
  const positions=headings.map(el=>el.getBoundingClientRect().top);
  const visible=positions.map((top,i)=>top<view-30&&(positions[i+1]??bottom)>85);
  let active=-1;
  for(let i=0;i<positions.length;i++)if(positions[i]<=110)active=i;
  if(active<0)active=visible.indexOf(true);
  if(window.scrollY+view>=document.documentElement.scrollHeight-3&&positions.length)active=positions.length-1;
  links.forEach((link,i)=>{
   const row=link.parentElement,bar=row.querySelector('.toc-section-progress');
   const end=positions[i+1]??bottom,length=Math.max(1,end-positions[i]);
   const amount=Math.max(0,Math.min(1,(view-positions[i])/length));
   link.classList.toggle('in-view',visible[i]);
   link.classList.toggle('range-start',visible[i]&&!visible[i-1]);
   link.classList.toggle('range-end',visible[i]&&!visible[i+1]);
   row.classList.toggle('is-read',end<=85);
   row.classList.toggle('in-view',visible[i]);
   bar.style.height=(amount*90)+'%';
   if(i===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
  if(toc&&active>=0&&active!==previousActive){
   const box=toc.getBoundingClientRect(),linkBox=links[active].getBoundingClientRect();
   if(linkBox.top<box.top+15)toc.scrollTop-=box.top+15-linkBox.top;
   else if(linkBox.bottom>box.bottom-15)toc.scrollTop+=linkBox.bottom-box.bottom+15;
  }
  previousActive=active;
  if(blur){
   const scrolled=Math.max(0,-article.getBoundingClientRect().top);
   blur.style.opacity=scrolled>=view/3?'.15':scrolled>=view*2/9?'.3':scrolled>=view/9?'.45':'.6';
  }
  const total=Math.max(1,bodyBox.height-view+100);
  progress.textContent=Math.round(Math.max(0,Math.min(1,(100-bodyBox.top)/total))*100)+'%';
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('resize',schedule);
 const resize=new ResizeObserver(schedule);resize.observe(article);
 schedule();
 disposeReadingView=()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);resize.disconnect();if(frame)cancelAnimationFrame(frame);disposeReadingView=()=>{}};
}

document.querySelectorAll('[data-orbit]').forEach(el=>el.innerHTML=orbit);
let openingTimer;function playOpening(){const opening=document.querySelector('#opening-sequence');clearTimeout(openingTimer);opening.classList.remove('is-playing');void opening.offsetWidth;opening.classList.add('is-playing');openingTimer=setTimeout(()=>opening.classList.remove('is-playing'),2400)}
try{if(localStorage.getItem('shiyuu-theme')==='dark')document.documentElement.classList.add('dark');if(!sessionStorage.getItem('shiyuu-opening-seen')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){playOpening();sessionStorage.setItem('shiyuu-opening-seen','1')}}catch{}
function syncTheme(){
 const dark=document.documentElement.classList.contains('dark');
 const button=document.querySelector('.theme-toggle');
 button.setAttribute('aria-label',dark?'切换浅色模式':'切换深色模式');
 button.setAttribute('title',dark?'切换浅色模式':'切换深色模式');
 button.setAttribute('aria-pressed',String(dark));
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#1b1e1a':'#e9e6e1');
}
document.querySelector('.theme-toggle').innerHTML='<svg class="theme-icon theme-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg><svg class="theme-icon theme-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/></svg>';
document.querySelector('.theme-toggle').addEventListener('click',()=>{
 const root=document.documentElement;
 root.classList.toggle('dark');
 try{localStorage.setItem('shiyuu-theme',root.classList.contains('dark')?'dark':'light')}catch{}
 syncTheme();
});
document.querySelector('.menu-toggle').addEventListener('click',()=>{const open=document.querySelector('#navigation').classList.toggle('expanded');document.querySelector('.menu-toggle').setAttribute('aria-expanded',String(open))});
document.querySelector('#replay').addEventListener('click',playOpening);
main.addEventListener('click',e=>{const link=e.target.closest('[data-section]');if(link){e.preventDefault();document.getElementById(link.dataset.section)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelector('#opening-sequence').classList.remove('is-playing');document.querySelector('#navigation').classList.remove('expanded');document.querySelector('.menu-toggle').setAttribute('aria-expanded','false')}});
window.addEventListener('hashchange',()=>render(true));document.querySelector('#year').textContent=new Date().getFullYear();syncTheme();render();

document.querySelector('.skip-link').addEventListener('click',e=>{e.preventDefault();main.focus();main.scrollIntoView()});
