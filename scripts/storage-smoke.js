/** Real browser IndexedDB tests without starting a graphics device. */
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync,readFileSync,statSync,writeFileSync,copyFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright-core';
import {RouteGeometry} from '../src/core/geometry.js';
import {RailwaySimulation} from '../src/core/simulation.js';
const dir=resolve('work/storage-fixture');mkdirSync(dir,{recursive:true});
writeFileSync(resolve(dir,'index.html'),'<!doctype html><meta charset="utf-8"><title>Journey storage fixture</title>');copyFileSync('src/core/save.js',resolve(dir,'save.js'));
const sim=new RailwaySimulation(new RouteGeometry(JSON.parse(readFileSync('public/data/route.json'))));sim.player.s=12345;sim.player.controller=-.6;sim.aws.brake=true;sim.crossings[0].state='closing';sim.crossings[0].blend=.4;writeFileSync(resolve(dir,'snapshot.json'),JSON.stringify(sim.snapshot()));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json'},server=createServer((request,response)=>{const path=resolve(dir,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname)),file=path===dir?resolve(dir,'index.html'):path;if(!file.startsWith(dir+'/')||!existsSync(file)||!statSync(file).isFile()){response.writeHead(404);response.end();return;}response.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});createReadStream(file).pipe(response);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const report={method:'Real JourneyStore JavaScript module; Chromium IndexedDB; no graphics device',sourceHash:createHash('sha256').update(readFileSync('src/core/save.js')).digest('hex'),checks:{},errors:[]};let browser;
try{
 browser=await chromium.launch({executablePath:process.env.RAILWAY_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});report.browser=browser.version();const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/`);
 report.checks.write=await page.evaluate(async()=>{const {JourneyStore}=await import('./save.js'),store=new JourneyStore('journey-quota-fixture'),s=await(await fetch('./snapshot.json')).json();s.roadTraffic={quotaProbe:'x'.repeat(6*1024*1024)};let quotaRejected=false;try{localStorage.setItem('quota-probe',s.roadTraffic.quotaProbe);}catch(e){quotaRejected=e.name==='QuotaExceededError';}localStorage.removeItem('quota-probe');await store.put(s);const read=await store.get();return {indexedDBRoundTrip:JSON.stringify(s)===JSON.stringify(read),payloadBytes:read.roadTraffic.quotaProbe.length,localStorageRejectedSamePayload:quotaRejected};});
 await page.reload();report.checks.reload=await page.evaluate(async()=>{const {JourneyStore}=await import('./save.js'),s=await new JourneyStore('journey-quota-fixture').get();return {payloadRetained:s.roadTraffic.quotaProbe.length===6*1024*1024,positionRetained:s.player.s===12345,controllerRetained:s.player.controller===-.6,brakeRetained:s.aws.brake===true,crossingRetained:s.crossings[0].state==='closing'&&s.crossings[0].blend===.4};});
 report.checks.legacyMigration=await page.evaluate(async()=>{const {JourneyStore}=await import('./save.js'),s=await(await fetch('./snapshot.json')).json();localStorage.setItem('fixture-legacy',JSON.stringify(s));const read=await new JourneyStore('journey-legacy-fixture','fixture-legacy').get();return JSON.stringify(s)===JSON.stringify(read)&&localStorage.getItem('fixture-legacy')===null;});
 if(!report.checks.write.indexedDBRoundTrip||!Object.values(report.checks.reload).every(Boolean)||!report.checks.legacyMigration)throw Error('Storage regression');
}catch(error){report.errors.push(String(error?.stack||error));console.error(error);process.exitCode=1;}
finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));writeFileSync('docs/reports/storage-browser-js.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
