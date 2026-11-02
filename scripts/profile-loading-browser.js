/** Cold-load measurement with a fresh Chromium context. This is a software
 * rendering diagnostic, not a substitute for testing on real hardware.
 * RAILWAY_PROFILE_ROOT selects the static folder; argv[2] is CPU slowdown. */
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync,statSync,writeFileSync} from 'node:fs';
import {resolve,join,extname} from 'node:path';
import {chromium} from 'playwright-core';

const root=resolve(process.env.RAILWAY_PROFILE_ROOT||'work/qa-dist'),label=process.env.RAILWAY_PROFILE_LABEL||'current',rate=Number(process.argv[2]||1);
if(!Number.isFinite(rate)||rate<1)throw Error('CPU slowdown must be at least one');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.bin':'application/octet-stream','.woff2':'font/woff2'};
const server=createServer((request,response)=>{
 const path=resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname)),file=path===root?join(root,'index.html'):path;
 if(!file.startsWith(root+'/')||!existsSync(file)||!statSync(file).isFile()){response.writeHead(404);response.end();return;}
 response.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':statSync(file).size,'Cache-Control':'no-store'});createReadStream(file).pipe(response);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try{
 browser=await chromium.launch({executablePath:process.env.RAILWAY_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu-watchdog','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:960,height:600}}),client=await page.context().newCDPSession(page);
 await client.send('Performance.enable');await client.send('Emulation.setCPUThrottlingRate',{rate});
 await page.addInitScript(()=>{
  window.loadingTrace=[];
  new PerformanceObserver(list=>{for(const entry of list.getEntries())window.loadingTrace.push({kind:'longtask',start:Math.round(entry.startTime),duration:Math.round(entry.duration)});}).observe({type:'longtask',buffered:true});
  document.addEventListener('DOMContentLoaded',()=>{
   const capture=()=>{const stage=document.getElementById('loading-stage')?.textContent,progress=document.getElementById('loading-progress')?.value,hidden=document.getElementById('loading')?.hidden,error=document.querySelector('#error:not([hidden]) #error-text')?.textContent;if(!stage)return;const last=window.loadingTrace.at(-1);if(last?.kind!=='stage'||last.stage!==stage||last.value!==progress||last.hidden!==hidden||last.error!==error)window.loadingTrace.push({kind:'stage',time:Math.round(performance.now()),stage,value:progress,hidden,error});};
   new MutationObserver(capture).observe(document.body,{subtree:true,childList:true,attributes:true,characterData:true});capture();
  });
 });
 const errors=[];page.on('pageerror',error=>errors.push(String(error)));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 const start=Date.now();await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'domcontentloaded'});
 await page.waitForFunction('document.getElementById("begin") && (!document.getElementById("begin").disabled || !document.getElementById("error").hidden)',null,{timeout:240000});
 const state=await page.evaluate(()=>({trace:window.loadingTrace,ready:!document.getElementById('begin')?.disabled,error:document.getElementById('error-text')?.textContent}));
 const metrics=await client.send('Performance.getMetrics'),report={scope:'Fresh local Chromium/SwiftShader context, one run; CPU slowdown is an emulation, not a hardware benchmark.',rate,wall:Date.now()-start,...state,errors,metrics:Object.fromEntries(metrics.metrics.filter(entry=>['JSHeapUsedSize','JSHeapTotalSize','TaskDuration'].includes(entry.name)).map(entry=>[entry.name,entry.value]))};
 mkdirSync('work',{recursive:true});writeFileSync(`work/loading-profile-${label}.json`,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({rate,wall:report.wall,ready:report.ready,error:report.error,errors,stageChanges:state.trace.filter(item=>item.kind==='stage').length,metrics:report.metrics},null,2));
 if(!report.ready||report.error||errors.length)process.exitCode=1;
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
