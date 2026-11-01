/** Real Chromium check of loading, resolution, the new scenery and offline save. */
import {createServer} from 'node:http';
import {createReadStream,existsSync,mkdirSync,readFileSync,statSync,writeFileSync} from 'node:fs';
import {resolve,extname,join} from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright-core';
const base=resolve('work/qa-dist'),captures='docs/captures/landscape',output='docs/reports/landscape-browser.json';mkdirSync(captures,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.bin':'application/octet-stream','.woff2':'font/woff2','.png':'image/png'};
const server=createServer((request,response)=>{const path=resolve(base,'.'+decodeURIComponent(new URL(request.url,'http://localhost').pathname)),file=path===base?join(base,'index.html'):path;if(!file.startsWith(base+'/')||!existsSync(file)||!statSync(file).isFile()){response.writeHead(404);response.end();return;}response.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':statSync(file).size,'Cache-Control':'no-store'});createReadStream(file).pipe(response);});
await new Promise(resolve=>server.listen(4179,'127.0.0.1',resolve));
const report={scope:'Chromium SwiftShader; fixed views and loading/persistence regression, not a hardware benchmark',checks:{},captures:[],errors:[]};
const save=()=>writeFileSync(output,JSON.stringify(report,null,2)+'\n');
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.RAILWAY_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu-watchdog','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:960,height:600}});page.setDefaultTimeout(180000);page.on('pageerror',e=>report.errors.push(String(e)));
 let delayed=true;await page.route('**/data/grid/world.json',async route=>{if(delayed){delayed=false;await new Promise(resolve=>setTimeout(resolve,1600));}await route.continue();});
 await page.goto('http://127.0.0.1:4179/',{waitUntil:'domcontentloaded'});
 await page.waitForSelector('#loading:not([hidden])');report.checks.loadingVisible=await page.locator('#loading').isVisible();
 await page.waitForFunction('document.getElementById("loading-progress")?.hasAttribute("value") && document.getElementById("loading-progress").value>0',null,{timeout:240000});report.checks.progressAdvanced=await page.locator('#loading-progress').evaluate(p=>p.value);
 await page.waitForFunction('window.__railway && document.getElementById("loading").hidden && !document.getElementById("begin").disabled || !document.getElementById("error").hidden',null,{timeout:240000});
 if(await page.locator('#error').isVisible())throw new Error(await page.locator('#error-text').innerText());
 await page.evaluate('__railway.stopAnimation();__railway.sim.paused=true;__railway.view.setQuality("low")');
 await page.locator('#settings-open').click();await page.locator('#render-scale').focus();await page.locator('#render-scale').press('Home');
 const setting=await page.evaluate(()=>({label:document.getElementById('render-scale-value').textContent,scale:JSON.parse(localStorage.getItem('railway-demo-preferences-v1')).renderScale,canvas:[document.querySelector('canvas').width,document.querySelector('canvas').height],viewport:[document.getElementById('viewport').clientWidth,document.getElementById('viewport').clientHeight]}));
 if(setting.label!=='25%'||Number(setting.scale)!==.25||Math.abs(setting.canvas[0]-setting.viewport[0]*.25)>1)throw new Error('25% resolution did not reach the drawing buffer');
 report.checks.resolution25=setting;await page.locator('[data-close="settings"]').click();await page.evaluate('__railway.view.setRenderScale(.5)');
 for(const fixture of [{id:'KID',direction:1,offset:-45,name:'kid-bridge-approach'},{id:'KID',direction:-1,offset:105,name:'kid-bridge-reverse'},{id:'SGB',direction:1,offset:-60,name:'galton'},{id:'BKD',direction:1,offset:0,name:'blakedown-crossing',crossing:'blakedown-crossing'},{id:'HAG',direction:1,offset:-45,name:'hagley'},{id:'SBJ',direction:1,offset:-45,name:'stourbridge-junction'},{id:'THW',direction:1,offset:-45,name:'hawthorns'},{id:'JEQ',direction:1,offset:-45,name:'jewellery-quarter'},{id:'BSW',direction:1,offset:-45,name:'snow-hill'},{id:'BMO',direction:1,offset:-45,name:'moor-street'},{id:'TYS',direction:1,offset:-45,name:'tyseley'},{id:'LGG',direction:1,offset:0,name:'langley-crossing',crossing:'langley-crossing'},{id:'DDG',direction:1,offset:0,name:'bentley-heath-crossing',crossing:'bentley-heath-crossing'}]){
  console.log('CAPTURE',fixture.name);await page.evaluate(({id,direction,offset,crossing})=>{const r=window.__railway;r.startAt(id,direction);const st=r.route.stations.find(s=>s.id===id);r.sim.player.s=st.s+offset;r.sim.paused=true;document.getElementById('hud').hidden=true;document.getElementById('pause-panel').hidden=true;if(crossing){const c=r.sim.crossings.find(c=>c.id===crossing);if(!c)throw new Error(`Missing crossing ${crossing}`);r.sim.player.s=c.s-42;c.blend=1;c.state='closed';}},fixture);
  await page.evaluate('__railway.view.preparePosition()');await page.evaluate('__railway.view.firstFrame=true;__railway.render();__railway.view.finishFrame()');
  const path=`${captures}/${fixture.name}.png`;await page.screenshot({path});const state=await page.evaluate(()=>({position:__railway.view.camera.position.toArray(),s:__railway.sim.player.s,stats:__railway.stats(),revision:__railway.world.document.revision,worldHash:__railway.route.data.worldHash}));report.captures.push({fixture:fixture.name,path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex'),state});save();
  if(fixture.name==='kid-bridge-approach'){
   const debug=await page.evaluate(async()=>{const r=__railway,d=await r.debug(),p=r.route.sample(r.sim.player.s).position;d.show(p[0],p[2],3);const inspected=d.inspect(p[0],p[2]),shown=!!r.view.scene.getObjectByName('developer-grid');d.hide();return {shown,hidden:!r.view.scene.getObjectByName('developer-grid'),cell:inspected.cell,pieces:inspected.pieces.length,terrain:inspected.terrainHeight};});
   if(!debug.shown||!debug.hidden||!debug.pieces||!Number.isFinite(debug.terrain))throw new Error('Developer grid inspector failed');report.checks.developerGrid=debug;
   await page.evaluate(()=>{const r=__railway,st=r.route.stations.find(s=>s.id==='KID'),q=r.route.sample(st.s-130,150),target=r.route.sample(st.s,-20),v=r.view;v.camera.position.set(q.position[0],q.position[1]+95,q.position[2]);v.camera.up.set(0,1,0);v.camera.lookAt(...target.position);v.ambient.intensity=2.7;v.renderer.render(v.scene,v.camera);v.finishFrame();});
   const p=`${captures}/kid-context.png`;await page.screenshot({path:p});report.captures.push({fixture:'kid-context',path:p,sha256:createHash('sha256').update(readFileSync(p)).digest('hex')});save();
  }
  if(['galton','hawthorns','jewellery-quarter','tyseley'].includes(fixture.name)){
   await page.evaluate(id=>{const r=__railway,st=r.route.stations.find(s=>s.id===id),q=r.route.sample(st.s-100,150),target=r.route.sample(st.s,-10),v=r.view;v.camera.position.set(q.position[0],q.position[1]+95,q.position[2]);v.camera.up.set(0,1,0);v.camera.lookAt(...target.position);v.renderer.render(v.scene,v.camera);v.finishFrame();},fixture.id);
   const p=`${captures}/${fixture.name}-context.png`;await page.screenshot({path:p});report.captures.push({fixture:`${fixture.name}-context`,path:p,sha256:createHash('sha256').update(readFileSync(p)).digest('hex')});save();
  }
 }
 console.log('SAVE WORLD');await page.evaluate(async()=>{await __railway.storage.put({worldHash:'previous-qa-world',marker:'prior journey'},{document:{revision:'previous'},tiles:{},terrain:new ArrayBuffer(0)});__railway.startAt('KID',1);__railway.sim.paused=true;});if(!await page.evaluate('__railway.save(false)'))throw new Error('World save failed');
 const backup=await page.evaluate(async()=>({journeys:await __railway.storage.getBackups(),world:await __railway.storage.getWorld('previous-qa-world')}));if(!backup.journeys.some(x=>x.snapshot.marker==='prior journey')||backup.world?.document.revision!=='previous')throw new Error('Previous incompatible journey was not preserved');report.checks.previousWorldPreserved=true;
 const before=await page.evaluate(async()=>{const r=__railway,w=await r.storage.getWorld(r.route.data.worldHash);return {s:r.sim.player.s,revision:w.document.revision,tileCount:Object.keys(w.tiles).length,terrainBytes:w.terrain.byteLength,expected:r.world.document.tiles.length};});
 if(before.tileCount!==before.expected)throw new Error('Saved world is missing tiles');
 await page.route('**/data/**',route=>route.abort());await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction('window.__railway && document.getElementById("loading").hidden && !document.getElementById("begin").disabled',null,{timeout:240000});
 await page.evaluate('__railway.stopAnimation();__railway.sim.paused=true');
 const restoredScale=await page.locator('#render-scale').inputValue();if(restoredScale!=='25')throw new Error('Resolution preference was not restored');
 await page.evaluate('document.getElementById("resume-save").click()');await page.waitForFunction('document.getElementById("menu").hidden',null,{timeout:240000});await page.evaluate('__railway.sim.paused=true;__railway.render();__railway.view.finishFrame()');
 const after=await page.evaluate(()=>({s:__railway.sim.player.s,revision:__railway.world.document.revision,webglError:__railway.view.renderer.getContext().getError()}));
 if(before.revision!==after.revision||Math.abs(before.s-after.s)>.01||after.webglError!==0)throw new Error('Offline world reload changed the scene');
 if(report.errors.length)throw new Error(`Browser page errors: ${report.errors.join('; ')}`);
 report.checks.offlineReload={before,after};report.checks.resolutionRestored=restoredScale;save();console.log('OFFLINE RELOAD PASSED');
}catch(error){report.errors.push(String(error?.stack||error));console.error(error);process.exitCode=1;}
finally{save();if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
