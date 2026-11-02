/** Resume a real previous-release save against the current QA build offline.
 * Extract the old site with `git archive c4bfc49 site | tar -x -C work/previous-site`.
 * Optional RAILWAY_OLD_SITE and RAILWAY_NEW_SITE override the two site folders. */
import {createServer} from 'node:http';
import {createReadStream,existsSync,statSync,writeFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright-core';

const oldSite=resolve(process.env.RAILWAY_OLD_SITE||'work/previous-site/site');
const newSite=resolve(process.env.RAILWAY_NEW_SITE||'work/qa-dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.bin':'application/octet-stream','.woff2':'font/woff2'};
const server=createServer((req,res)=>{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),old=path.startsWith('/old/'),current=path.startsWith('/new/'),base=old?oldSite:newSite;
 if(!old&&!current){res.writeHead(404);res.end();return;}
 const file=resolve(base,path.slice(5)||'index.html');
 if(!file.startsWith(base+'/')||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':statSync(file).size,'Cache-Control':'no-store'});createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`,report={scope:'Actual previous production save and its world, resumed offline in current QA build; Chromium/SwiftShader.',errors:[]};let browser;
try{
 browser=await chromium.launch({executablePath:process.env.RAILWAY_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu-watchdog','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:960,height:600}});
 await context.addInitScript(()=>{localStorage.setItem('railway-demo-preferences-v1',JSON.stringify({renderScale:'0.25',quality:'low',volume:0}));});
 const page=await context.newPage();page.setDefaultTimeout(180000);page.on('pageerror',error=>report.errors.push(String(error)));
 console.log('Creating a journey with the previous production site');
 await page.goto(origin+'/old/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction('document.getElementById("begin") && (!document.getElementById("begin").disabled || !document.getElementById("error").hidden)',null,{timeout:240000});
 if(await page.locator('#error').isVisible())throw Error(await page.locator('#error-text').innerText());
 await page.locator('#begin').click();await page.waitForFunction('document.getElementById("menu").hidden || !document.getElementById("error").hidden',null,{timeout:240000});
 if(await page.locator('#error').isVisible())throw Error(await page.locator('#error-text').innerText());
 await page.locator('#pause').click();
 const before=await page.waitForFunction(async()=>{
  const db=await new Promise((resolve,reject)=>{const req=indexedDB.open('snow-hill-lines');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
  const get=(store,key)=>new Promise((resolve,reject)=>{const req=db.transaction(store).objectStore(store).get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
  const snapshot=await get('journeys','active');if(!snapshot){db.close();return false;}
  const world=await get('worlds',snapshot.worldHash);db.close();if(!world||Object.keys(world.tiles).length!==world.document.tiles.length)return false;
  return {hash:snapshot.worldHash,position:snapshot.player.s,revision:world.document.revision,tiles:Object.keys(world.tiles).length};
 },null,{timeout:240000}).then(handle=>handle.jsonValue());
 if(before.hash!=='75d16f9946ad6043c5ec6828e460c6db9f589513f7da46f6ad9d4396806fcc30')throw Error(`Unexpected previous build ${before.hash}`);
 console.log('Resuming that saved world with data requests blocked');
 await page.route('**/new/data/**',route=>route.abort());await page.goto(origin+'/new/',{waitUntil:'domcontentloaded'});
 await page.waitForFunction('window.__railway && (!document.getElementById("begin").disabled || !document.getElementById("error").hidden)',null,{timeout:240000});
 if(await page.locator('#error').isVisible())throw Error(await page.locator('#error-text').innerText());
 await page.waitForSelector('#resume-save:not([hidden])');await page.locator('#resume-save').click();
 await page.waitForFunction('document.getElementById("menu").hidden || !document.getElementById("error").hidden',null,{timeout:240000});
 if(await page.locator('#error').isVisible())throw Error(await page.locator('#error-text').innerText());
 const after=await page.evaluate(async()=>{
  const r=window.__railway;r.sim.paused=true;r.stopAnimation();if(!await r.save(false))throw Error('Unable to save the restored journey');
  const current=await r.storage.get(),world=await r.storage.getWorld(current.worldHash),old=await r.storage.getWorld('75d16f9946ad6043c5ec6828e460c6db9f589513f7da46f6ad9d4396806fcc30'),backups=await r.storage.getBackups();
  return {hash:current.worldHash,position:r.sim.player.s,revision:r.world.document.revision,tiles:Object.keys(world.tiles).length,oldRevision:old?.document.revision,backup:backups.some(item=>item.snapshot.worldHash==='75d16f9946ad6043c5ec6828e460c6db9f589513f7da46f6ad9d4396806fcc30')};
 });
 if(before.hash===after.hash||before.revision!==after.revision||before.revision!==after.oldRevision||before.tiles!==after.tiles||Math.abs(before.position-after.position)>.01||!after.backup)throw Error(`Saved world changed: ${JSON.stringify({before,after})}`);
 console.log('Starting a new journey while offline');
 await page.locator('#pause').click();await page.locator('#new-journey').click();await page.locator('#begin').click();
 await page.waitForFunction(()=>Boolean(window.__railway&&document.getElementById('menu')?.hidden&&document.getElementById('loading')?.hidden)||Boolean(document.getElementById('error')&&!document.getElementById('error').hidden),null,{timeout:240000});
 if(await page.locator('#error').isVisible())throw Error(await page.locator('#error-text').innerText());
 const offlineRevision=await page.evaluate('__railway.world.document.revision');if(offlineRevision!==before.revision)throw Error('The offline new journey did not use its saved world');
 console.log('Starting a new journey on the current map');
 await page.unroute('**/new/data/**');await page.locator('#pause').click();await page.locator('#new-journey').click();await page.locator('#begin').click();
 await page.waitForFunction(revision=>Boolean(window.__railway&&window.__railway.world.document.revision!==revision&&document.getElementById('menu')?.hidden&&document.getElementById('loading')?.hidden)||Boolean(document.getElementById('error')&&!document.getElementById('error').hidden),before.revision,{timeout:240000});
 if(await page.locator('#error').isVisible())throw Error(await page.locator('#error-text').innerText());
 const fresh=await page.evaluate(async({hash,revision})=>{const r=window.__railway;r.sim.paused=true;r.stopAnimation();if(!await r.save(false))throw Error('Unable to save the new journey');const key=`backup/${hash}/${revision}`,backups=await r.storage.getBackups(),oldWorld=await r.storage.getWorld(key);return {revision:r.world.document.revision,backup:backups.some(item=>item.key===key),oldRevision:oldWorld?.document.revision};},{hash:after.hash,revision:before.revision});
 if(fresh.revision===before.revision||!fresh.backup||fresh.oldRevision!==before.revision)throw Error(`New journey did not preserve the old world: ${JSON.stringify(fresh)}`);
 if(report.errors.length)throw Error(report.errors.join('; '));report.before=before;report.after=after;report.offlineResume=true;report.offlineNewJourney=true;report.newJourney=fresh;console.log(JSON.stringify(report,null,2));
 await context.close();
}catch(error){report.errors.push(String(error?.stack||error));console.error(error);process.exitCode=1;}
finally{writeFileSync('docs/reports/save-upgrade-browser.json',JSON.stringify(report,null,2)+'\n');if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
