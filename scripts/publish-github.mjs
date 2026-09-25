import {cpSync,existsSync,mkdirSync,mkdtempSync,readdirSync,readFileSync,lstatSync} from 'node:fs';
import {resolve,join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const repo='https://github.com/Shiyuu-Official/shiyuu-official.github.io.git';
const git=existsSync('D:/App/Git/cmd/git.exe')?'D:/App/Git/cmd/git.exe':'git';
const dirs=['src','content','scripts','tests','templates','docs','.github'];
const files=['package.json','pnpm-lock.yaml','server.mjs','.gitignore','README.md','一键推送GitHub.cmd','启动预览.cmd','生成网站.cmd'];
function run(command,args,cwd=root,capture=false){
 const r=spawnSync(command,args,{cwd,encoding:'utf8',stdio:capture?'pipe':'inherit',windowsHide:true});
 if(r.error)throw r.error;
 if(r.status!==0)throw Error((capture?r.stderr:'')||'命令失败：'+command+' '+args.join(' '));
 return (r.stdout||'').trim();
}
function inventory(folder,prefix=''){
 return readdirSync(folder,{withFileTypes:true}).flatMap(e=>{
  const rel=prefix?prefix+'/'+e.name:e.name,full=join(folder,e.name);
  if(lstatSync(full).isSymbolicLink())throw Error('请移除符号链接后重试：'+full);
  return e.isDirectory()?inventory(full,rel):[rel];
 });
}
try{
 mkdirSync(join(root,'.sites-runtime'),{recursive:true});
 const snapshot=mkdtempSync(join(root,'.sites-runtime','publish-'));
 for(const name of [...dirs,...files])if(existsSync(join(root,name)))cpSync(join(root,name),join(snapshot,name),{recursive:true});
 for(const d of dirs)if(existsSync(join(snapshot,d)))inventory(join(snapshot,d));
 // Build in isolation: never race with the local preview's dist directory.
 // Dependencies resolve from the parent project node_modules directory.
 console.log('\n[1/4] 检查当前内容（独立构建，不影响本地预览）');
 run(process.execPath,['scripts/build.mjs'],snapshot);
 const tests=inventory(join(snapshot,'tests')).filter(p=>p.endsWith('.test.mjs')).map(p=>'tests/'+p);
 run(process.execPath,['--test',...tests],snapshot);
 if(process.argv.includes('--check')){
  console.log('\n检查通过。没有提交或推送。检查目录：'+snapshot);
  process.exit(0);
 }
 console.log('\n[2/4] 获取 GitHub 最新版本');
 const checkout=join(snapshot,'repository');
 run(git,['clone','--branch','main','--single-branch',repo,checkout]);
 const tracked=run(git,['ls-files','-z'],checkout,true).split('\0').filter(Boolean);
 const managed=p=>dirs.some(d=>p.startsWith(d+'/'))||files.includes(p);
 // Remove only known managed files absent locally. Git receives literal pathspecs.
 for(const p of tracked.filter(managed)){
  if(!existsSync(join(snapshot,p)))run(git,['--literal-pathspecs','rm','--',p],checkout);
 }
 for(const name of [...dirs,...files])if(existsSync(join(snapshot,name)))cpSync(join(snapshot,name),join(checkout,name),{recursive:true});
 console.log('\n[3/4] 提交当前内容');
 run(git,['add','--all'],checkout);
 if(run(git,['status','--porcelain'],checkout,true)){
  run(git,['diff','--cached','--stat'],checkout);
  run(git,['-c','user.name=Shiyuu-Official','-c','user.email=Shiyuu-Official@users.noreply.github.com','commit','-m','Update portfolio content '+new Date().toISOString()],checkout);
 }else console.log('内容与 GitHub 一致，无需新增提交。');
 console.log('\n[4/4] 推送 GitHub');
 run(git,['push','origin','main'],checkout);
 console.log('\n推送成功！GitHub 将自动构建发布，通常需要几分钟。');
 console.log('网站：https://shiyuu-official.github.io/');
 console.log('发布进度：https://github.com/Shiyuu-Official/shiyuu-official.github.io/actions');
}catch(error){
 console.error('\n推送未完成：'+error.message);
 console.error('请解决以上错误后重新运行。脚本不会强制推送，也不会修改旧博客仓库。');
 process.exitCode=1;
}
