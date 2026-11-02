import {createServer} from 'vite';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright-core';

const out='work/authoring/browser';mkdirSync(out,{recursive:true});
const source=process.argv[2]||'world-source/chunks/-17_3.json',content=readFileSync(source),compressed=gzipSync(content),hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(readFileSync('public/data/grid/world.json'));
Object.assign(manifest.tiles.find(t=>t.id==='-17_3'),{url:'data/grid/authored-first.json.gz',codec:'gzip-json',sha256:hash(compressed),contentSHA256:hash(content)});
const server=await createServer({mode:'qa',server:{host:'127.0.0.1',port:4185}});await server.listen();
const report={scope:'Actual Kidderminster source chunk, normal simulator renderer; optional input path selects an archived authoring fixture',source,sourceSHA256:hash(content),errors:[]};let browser;
try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:720}});page.setDefaultTimeout(180000);page.on('pageerror',e=>report.errors.push(String(e)));
 await page.route('**/data/grid/world.json',r=>r.fulfill({json:manifest}));
 await page.route('**/data/grid/authored-world.json',r=>r.fulfill({json:manifest}));
 await page.route('**/data/grid/authored-first.json.gz',r=>r.fulfill({body:compressed,contentType:'application/octet-stream'}));
 const start=performance.now();await page.goto('http://127.0.0.1:4185/app.html');
 await page.waitForFunction('window.__railway && document.getElementById("loading").hidden && !document.getElementById("begin").disabled || !document.getElementById("error").hidden');
 if(await page.locator('#error').isVisible())throw Error(await page.locator('#error-text').innerText());
 report.loadMs=performance.now()-start;
 report.actual=await page.evaluate(async()=>{const r=__railway;r.stopAnimation();r.startAt('KID',1);await r.view.preparePosition();const before=r.sim.player.s;r.input.a=true;r.advance(12,true);r.input.a=false;r.render();r.view.finishFrame();const gl=r.view.renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return {before,after:r.sim.player.s,speed:r.sim.player.speed,loaded:[...r.view.loaded.keys()],characters:[...r.view.walkers.values()].map(c=>({family:c.model.userData.family,role:c.model.userData.role,state:c.model.userData.animationState})),triangles:r.view.triangles,drawCalls:r.view.renderer.info.render.calls,gpu:gl.getParameter(ext.UNMASKED_RENDERER_WEBGL),webglError:gl.getError()};});
 if(!report.actual.loaded.includes('-17_3')||report.actual.after<=report.actual.before||report.actual.webglError||report.actual.characters.some(c=>c.family!=='anthropomorphic-cat'))throw Error('Actual-scene reconstruction or driving failed');
 await page.screenshot({path:`${out}/driver.png`});
 await page.evaluate(()=>{const r=__railway,p=r.route.sample(0).position;r.view.camera.position.set(p[0]-55,p[1]+45,p[2]+65);r.view.camera.lookAt(...p);r.view.renderer.render(r.view.scene,r.view.camera);});
 await page.screenshot({path:`${out}/context.png`});
 if(report.errors.length)throw Error(report.errors.join('; '));report.status='IMPLEMENTED_AND_VERIFIED';
}catch(e){report.status='FAILED';report.errors.push(String(e.stack||e));process.exitCode=1;}
finally{await browser?.close();await server.close();writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
