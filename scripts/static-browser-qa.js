/** Exercise the production static files at a nested URL and repository root. */
import {createServer} from 'node:http';
import {createReadStream,existsSync,readFileSync,statSync,writeFileSync} from 'node:fs';
import {resolve,join,extname} from 'node:path';
import {chromium} from 'playwright-core';
const root=resolve('.'),site=resolve('site'),types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.bin':'application/octet-stream','.woff2':'font/woff2','.png':'image/png'};
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let base=site,relative=path;
 if(path.startsWith('/nested/railway/'))relative=path.slice('/nested/railway/'.length);
 else if(path==='/wrapper/'||path==='/wrapper/index.html'){base=root;relative='index.html';}
 else if(path.startsWith('/wrapper/site/'))relative=path.slice('/wrapper/site/'.length);
 else relative=path.replace(/^\//,'');
 const file=resolve(base,relative||'index.html');if(!file.startsWith(base+'/')||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':statSync(file).size,'Cache-Control':'no-store'});createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${server.address().port}`,report={scope:'Production static JavaScript site in headless Chromium/SwiftShader; nested and root entry URLs.',scenarios:[],errors:[]};let browser;
try{
 browser=await chromium.launch({executablePath:process.env.RAILWAY_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu-watchdog','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const [name,path,prefix] of [['nested','/nested/railway/','/nested/railway/'],['repository-root','/wrapper/','/wrapper/site/']]){
  console.log('STATIC',name);const context=await browser.newContext({viewport:{width:960,height:600}}),requests=[],httpErrors=[],pageErrors=[],external=[];
  await context.addInitScript(()=>{Object.defineProperty(Navigator.prototype,'gpu',{get:()=>undefined,configurable:true});localStorage.setItem('railway-demo-preferences-v1',JSON.stringify({renderScale:'0.25',quality:'low',volume:0}));});
  await context.route('**/*',route=>{if(route.request().url().startsWith(origin+'/'))return route.continue();external.push(route.request().url());return route.abort();});
  const page=await context.newPage();page.setDefaultTimeout(180000);page.on('request',r=>requests.push(r.url()));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))httpErrors.push(`${r.status()} ${r.url()}`);});page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(origin+path,{waitUntil:'domcontentloaded'});await page.waitForFunction('document.getElementById("begin") && (!document.getElementById("begin").disabled || !document.getElementById("error").hidden)',null,{timeout:240000});
  if(await page.locator('#error').isVisible())throw Error(`${name}: ${await page.locator('#error-text').innerText()}`);
  const state=await page.evaluate(()=>{const gl=document.querySelector('#viewport canvas').getContext('webgl2');return {base:document.baseURI,qaApi:typeof window.__railway,renderer:gl?.getParameter(gl.VERSION),error:gl?.getError()};});
  if(state.qaApi!=='undefined'||!state.renderer?.includes('WebGL 2')||state.error!==0)throw Error(`${name}: production graphics or QA isolation failed`);
  await page.locator('#begin').click();await page.waitForFunction('document.getElementById("menu").hidden || !document.getElementById("error").hidden',null,{timeout:240000});
  if(await page.locator('#error').isVisible())throw Error(`${name}: ${await page.locator('#error-text').innerText()}`);
  await page.locator('#pause').click();if(!await page.locator('#pause-panel').isVisible())throw Error(`${name}: pause controls did not open`);
  const urls=requests.filter(u=>u.startsWith(origin+'/')).map(u=>new URL(u).pathname);
  if(!urls.some(u=>u.startsWith(prefix)&&u.endsWith('/data/grid/world.json'))||!urls.some(u=>u.startsWith(prefix)&&u.includes('/data/grid/tiles/'))||httpErrors.length||pageErrors.length||external.length)throw Error(`${name}: resource or page errors ${JSON.stringify({httpErrors,pageErrors,external})}`);
  report.scenarios.push({name,base:state.base,webgl:state.renderer,qaApiAbsent:true,worldAndTilesLocal:true,journeyStarted:true,pauseControls:true});await context.close();
 }
 const unsupported=await browser.newContext();await unsupported.addInitScript(()=>{Object.defineProperty(Navigator.prototype,'gpu',{get:()=>undefined,configurable:true});const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:original.call(this,type,...args);};});
 const page=await unsupported.newPage();await page.goto(origin+'/nested/railway/',{waitUntil:'domcontentloaded'});await page.waitForFunction('document.getElementById("error") && !document.getElementById("error").hidden',null,{timeout:180000});const message=await page.locator('#error-text').innerText();if(!message.includes('WebGL 2'))throw Error('Unsupported graphics device message is missing');report.unsupportedDeviceMessage=message;await unsupported.close();
}catch(error){report.errors.push(String(error?.stack||error));console.error(error);process.exitCode=1;}
finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));writeFileSync('docs/reports/static-js-browser.json',JSON.stringify(report,null,2)+'\n');}
