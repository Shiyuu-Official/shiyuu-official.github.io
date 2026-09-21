import http from 'node:http';
import {readFile,readdir,stat,realpath} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {resolve,extname,sep,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from './scripts/build.mjs';

const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.avif':'image/avif','.mp4':'video/mp4','.webm':'video/webm','.mp3':'audio/mpeg','.wav':'audio/wav','.pdf':'application/pdf','.zip':'application/zip','.woff2':'font/woff2'};
async function signature(directory){
 let entries;try{entries=await readdir(directory,{withFileTypes:true})}catch(e){if(e.code==='ENOENT')return '';throw e;}
 const values=[];
 for(const entry of entries.sort((a,b)=>a.name.localeCompare(b.name))){
  if(entry.name.startsWith('.'))continue;
  const full=join(directory,entry.name);
  if(entry.isDirectory())values.push(full,await signature(full));
  else if(entry.isFile()){const info=await stat(full);values.push(full,info.mtimeMs,info.size);}
 }
 return values.join('|');
}
function liveScript(version){
 return '<script>(()=>{let version='+version+';let busy=false;setInterval(async()=>{if(busy)return;busy=true;try{const state=await fetch("/__dev/state",{cache:"no-store"}).then(r=>r.json());let box=document.querySelector(".dev-error");if(state.error){if(!box){box=document.createElement("pre");box.className="dev-error";box.setAttribute("role","alert");document.body.appendChild(box)}box.textContent="Markdown 构建失败（保留上次可用页面）\\n"+state.error}else{box?.remove();if(state.version!==version)location.reload()}}catch{}finally{busy=false}},900)})()</script>';
}
export async function startServer({root=process.cwd(),port=4173,watch=true,host='127.0.0.1'}={}){
 root=resolve(root);const output=join(root,'dist');
 if(watch)await build({root});
 let version=Date.now(),error='',busy=false,closed=false;
 let previous=watch?await signature(join(root,'content'))+await signature(join(root,'src')):'';
 const timer=watch?setInterval(async()=>{
  if(busy||closed)return;busy=true;
  try{const next=await signature(join(root,'content'))+await signature(join(root,'src'));
   if(next!==previous){previous=next;try{await build({root});version++;error='';console.log('Content updated.');}catch(e){error=e.message;console.error(error)}}
  }catch(e){error=e.message}finally{busy=false}
 },600):null;
 const sockets=new Set();
 const server=http.createServer(async(req,res)=>{
  try{
   const url=new URL(req.url,'http://localhost');
   if(watch&&url.pathname==='/__dev/state'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({version,error}));return;}
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
   const decoded=decodeURIComponent(url.pathname);
   const requested=resolve(output,'.'+(decoded==='/'?'/index.html':decoded));
   if(!requested.startsWith(output+sep)){res.writeHead(403);res.end();return;}
   const file=await realpath(requested);
   if(!file.startsWith(output+sep)){res.writeHead(403);res.end();return;}
   const info=await stat(file);if(!info.isFile()){res.writeHead(404);res.end();return;}
   const type=mime[extname(file).toLowerCase()]||'application/octet-stream';
   if(watch&&file===join(output,'index.html')){
    const html=(await readFile(file,'utf8')).replace('</body>',liveScript(version)+'</body>');
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(req.method==='HEAD'?'':html);return;
   }
   const headers={'Content-Type':type,'Cache-Control':'no-store','Accept-Ranges':'bytes'};
   const range=req.headers.range;
   if(range){
    const match=/^bytes=(\d*)-(\d*)$/.exec(range);
    let start=match&&match[1]?Number(match[1]):0,end=match&&match[2]?Number(match[2]):info.size-1;
    if(match&&!match[1]&&match[2]){start=Math.max(0,info.size-Number(match[2]));end=info.size-1;}
    end=Math.min(end,info.size-1);
    if(!match||(!match[1]&&!match[2])||start>end||start>=info.size){res.writeHead(416,{'Content-Range':'bytes */'+info.size});res.end();return;}
    res.writeHead(206,{...headers,'Content-Range':'bytes '+start+'-'+end+'/'+info.size,'Content-Length':end-start+1});
    if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);return;
   }
   res.writeHead(200,{...headers,'Content-Length':info.size});
   if(req.method==='HEAD')res.end();else createReadStream(file).on('error',()=>res.destroy()).pipe(res);
  }catch(e){if(!res.headersSent)res.writeHead(e.code==='ENOENT'?404:400,{'Content-Type':'text/plain; charset=utf-8'});res.end(e.code==='ENOENT'?'Not found':'Invalid request');}
 });
 server.on('connection',socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket))});
 await new Promise((yes,no)=>{server.once('error',no);server.listen(port,host,yes)});
 return {server,url:'http://'+host+':'+server.address().port,close:async()=>{closed=true;if(timer)clearInterval(timer);while(busy)await new Promise(r=>setTimeout(r,20));for(const socket of sockets)socket.destroy();await new Promise(r=>server.close(r));}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const watch=!process.argv.includes('--preview');
 try{const app=await startServer({watch});console.log('Local: '+app.url+(watch?' (watching Markdown and assets)':' (built files only)'));for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{await app.close();process.exit(0)});}
 catch(e){console.error(e.message);process.exitCode=1;}
}
