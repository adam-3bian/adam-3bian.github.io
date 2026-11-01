import './style.css';
import type {RouteData,Direction} from './core/types';
import {RouteGeometry,clamp} from './core/geometry';
import {RailwaySimulation,type InputState,type Snapshot} from './core/simulation';
import {RailwayRenderer} from './render/renderer';
import {RailwayAudio} from './core/audio';
import {JourneyStore} from './core/save';
import {routeResourceUrl} from './core/resource-url';
import {endpointContext} from './world/build';

const railIcon='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h10l2 11-3 4H8l-3-4L7 3Z" stroke="currentColor" stroke-width="1.5"/><path d="M7 10h10M9 6h6M8 18l-3 4m11-4 3 4M7 21h10" stroke="currentColor" stroke-width="1.5"/><circle cx="8.5" cy="14" r="1" fill="currentColor"/><circle cx="15.5" cy="14" r="1" fill="currentColor"/></svg>';
const externalArrow='<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7" stroke="currentColor" stroke-width="1.3"/></svg>';
const pauseIcon='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 7v10M15 7v10" stroke="currentColor" stroke-width="2"/></svg>';
const arrow='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg>';
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<main class="simulator">
  <div id="viewport" role="img" aria-label="Front view along the Snow Hill railway"></div>
  <div class="vignette" aria-hidden="true"></div>
  <header class="topbar"><a class="brand" href="#" aria-label="Snow Hill Lines home">${railIcon}<span>SNOW HILL<span class="brand-sub">L I N E S</span></span></a><div class="journey-title" id="journey-title">KIDDERMINSTER <span>—</span> DORRIDGE</div><div class="top-actions"><span class="clock" id="clock">08:12:00</span><button id="pause" class="icon-button" aria-label="Pause journey">${pauseIcon}</button></div></header>
  <section id="menu" class="menu" aria-label="Journey setup"><div class="menu-panel">
    <div class="eyebrow"><i></i> THE WEST MIDLANDS, REIMAGINED</div>
    <h1>Drive the<br>Snow Hill lines.</h1>
    <p class="intro">From Worcestershire's open countryside to the heart of Birmingham. Take the front seat on the Snow Hill lines.</p>
    <div class="route-summary"><span class="route-dot"></span><div><strong>Kidderminster</strong><small>WORCESTERSHIRE</small></div><span class="route-rule"></span><div><strong>Dorridge</strong><small>WEST MIDLANDS</small></div><span class="route-dot end"></span></div>
    <div class="journey-facts"><span><strong>47.3</strong> km of railway</span><span><strong>22</strong> stations</span><span><strong>172</strong> your train</span></div>
    <div class="form-row"><label>JOURNEY<select id="direction"><option value="1">Kidderminster → Dorridge</option><option value="-1">Dorridge → Kidderminster</option></select></label></div>
    <div class="form-row"><label>DEPART FROM<select id="start-station" aria-label="Departure station"><option>Preparing stations…</option></select></label></div>
    <button id="begin" class="primary" disabled><span id="begin-label">Preparing your journey…</span>${arrow}</button>
    <button id="resume-save" class="secondary" hidden>Continue saved journey ${arrow}</button>
    <div class="menu-bottom"><span class="gpu-badge" id="gpu-state"><i></i> PREPARING THE LINE</span><button id="settings-open" class="text-button">Settings ${externalArrow}</button></div>
  </div><div class="scene-caption"><span>THE SNOW HILL LINES</span><p>Familiar places.<br>A new perspective.</p><small>Procedural scenery · Solid colours · WebGL 2</small></div></section>
  <section id="hud" class="hud" hidden aria-label="Driving instruments">
    <div class="notice" id="notice" role="status">Hold A to release the brake.</div>
    <div class="dashboard"><div class="instrument speed"><span class="instrument-label">SPEED</span><div><strong id="speed">0</strong><span>mph</span></div><small>LIMIT <b id="limit">65</b></small></div>
    <div class="instrument next-stop"><span class="instrument-label">NEXT STATION</span><strong id="next-stop">Blakedown</strong><div><span id="distance">5.1 km</span><span id="doors">Doors secured</span></div><div class="distance-line"><i id="stop-progress"></i></div></div>
    <div class="instrument controller"><span class="instrument-label">POWER / BRAKE</span><strong id="controller-state">Full service brake</strong><div class="control-track"><span class="brake-zone"></span><i id="controller-pointer"></i></div><small><span>BRAKE</span><span id="reverser">FORWARD</span><span>POWER</span></small></div>
    <button class="instrument aws" id="aws" aria-label="AWS acknowledge"><span class="instrument-label">AWS</span><span class="aws-lamp" id="aws-lamp"><i></i></span><span id="aws-state">Clear</span><kbd>Q</kbd></button></div>
    <div class="controls-strip"><span><kbd>A</kbd> Power / release</span><span><kbd>D</kbd> Brake</span><span><kbd>Q</kbd> Acknowledge</span><span><kbd>SPACE</kbd> Horn</span><span><kbd>W</kbd><kbd>S</kbd> Direction</span><button id="stops-open" class="text-button">Route & stops ${externalArrow}</button><button id="save" class="text-button">Save</button></div>
    <button id="tpws-reset" class="tpws-reset" hidden>TPWS brake demand · stop, then reset</button>
    <div class="touch-controls"><button data-drive="d" aria-label="Apply brakes">D · Brake</button><button data-drive="a" aria-label="Release brake and add power">A · Power</button><button data-drive="horn" aria-label="Horn">Horn</button></div>
  </section>
  <section id="pause-panel" class="dialog" hidden><div class="dialog-card"><span class="eyebrow">A MOMENT BETWEEN STATIONS</span><h2>Journey paused.</h2><p id="pause-detail">Your train and traffic are safely paused.</p><button id="continue" class="primary">Continue journey ${arrow}</button><button id="save-paused" class="secondary">Save journey</button><button id="new-journey" class="text-button">Choose a new journey</button></div></section>
  <section id="settings" class="dialog" hidden><div class="dialog-card"><button class="dialog-close" data-close="settings" aria-label="Close settings">×</button><span class="eyebrow">MAKE YOURSELF AT HOME</span><h2>Your preferences.</h2><label>SCENERY QUALITY<select id="quality"><option value="low">Light</option><option value="balanced" selected>Balanced</option><option value="high">Detailed</option></select></label><label>SOUND LEVEL<input id="volume" type="range" min="0" max="1" step=".01" value=".35" /></label><p class="setting-note">A / D control power and braking. Q acknowledges AWS. Hold Space for the horn. W / S select direction at standstill. T is unassigned.</p></div></section>
  <section id="stops" class="stops-panel" hidden><button class="dialog-close" data-close="stops" aria-label="Close route">×</button><span class="eyebrow">YOUR JOURNEY</span><h2>The line ahead.</h2><div id="stop-list"></div><small>Representative all-stations service</small></section>
  <section id="error" class="dialog" hidden><div class="dialog-card"><span class="eyebrow">JOURNEY UNAVAILABLE</span><h2 id="error-title">The line needs a moment.</h2><p id="error-text"></p><button id="reload" class="primary">Try again ${arrow}</button></div></section>
  <footer class="credit">© OpenStreetMap contributors · Environment Agency ground data</footer>
</main>`;

const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const input:InputState={a:false,d:false,horn:false};const audio=new RailwayAudio();let sim:RailwaySimulation,view:RailwayRenderer,route:RouteGeometry;let started=false,loaded=false,accumulator=0,last=performance.now(),lastHUD=0,lastSave=0;let noticeUntil=0;
const journeySaves=new JourneyStore();let saveErrorReported=false;
function visible(id:string,show:boolean){$(id).hidden=!show;}
function notify(text:string,important=false){$('notice').textContent=text;$('notice').classList.toggle('important',important);noticeUntil=performance.now()+(important?10000:6500);}
function clearInputs(){input.a=false;input.d=false;input.horn=false;}
function pause(){if(!started||!sim)return;sim.paused=true;clearInputs();visible('pause-panel',true);audio.update(sim,false);save(false);}
function resume(){if(!loaded||!sim)return;sim.paused=false;visible('pause-panel',false);audio.init();last=performance.now();accumulator=0;}
async function save(notice=true){if(!sim||!started)return false;try{const snapshot=sim.snapshot();snapshot.roadTraffic=view.roadTraffic.snapshot();await journeySaves.put(snapshot);saveErrorReported=false;if(notice)notify(`Journey saved at ${sim.clockText()}.`);return true;}catch{if(notice||!saveErrorReported)notify('This browser could not store the journey.');saveErrorReported=true;return false;}}
function showError(error:Error){if(!$('error').hidden)return;console.error(error);if(sim)sim.paused=true;$('error-text').textContent=error.message;visible('error',true);clearInputs();if(started)save(false).then(saved=>{$('error-text').textContent=error.message+(saved?' Your paused journey was saved. Reload, then choose Continue saved journey.':' Saving failed. Reloading may lose unsaved progress.');});}
function stationOptions(direction:Direction){const select=$<HTMLSelectElement>('start-station');const stations=direction===1?route.stations:[...route.stations].reverse();select.innerHTML=stations.map(s=>{const terminal=s.id===(direction===1?'DDG':'KID');return `<option value="${s.id}" ${terminal?'disabled':''}>${s.name}${terminal?' · end of route':''}</option>`;}).join('');}
function updateJourneyTitle(){ $('journey-title').innerHTML=sim.player.direction===1?'KIDDERMINSTER <span>—</span> DORRIDGE':'DORRIDGE <span>—</span> KIDDERMINSTER';}
function updateStops(){const list=$('stop-list');list.innerHTML=(sim.player.direction===1?route.stations:[...route.stations].reverse()).map(s=>`<div class="stop-item ${sim.calls.includes(s.id)?'visited':''} ${sim.targetStation()?.id===s.id?'next':''}"><i></i><span>${s.name}</span><small>${sim.calls.includes(s.id)?'✓':s.id}</small></div>`).join('');}
async function begin(){if(!loaded)return;const direction=Number($<HTMLSelectElement>('direction').value) as Direction;const index=route.stations.findIndex(s=>s.id===$<HTMLSelectElement>('start-station').value);if(index<0||index+direction<0||index+direction>=route.stations.length){$('begin-label').textContent='Choose a departure with a station ahead';return;}sim.start(direction,index);view.resetTraffic();$<HTMLButtonElement>('begin').disabled=true;$('begin-label').textContent='Preparing departure…';try{await view.preparePosition();started=true;visible('menu',false);visible('hud',true);$('journey-title').innerHTML=direction===1?'KIDDERMINSTER <span>—</span> DORRIDGE':'DORRIDGE <span>—</span> KIDDERMINSTER';resume();updateStops();notify('Hold A to release the service brake, then add power.');}catch(e){showError(e as Error);}finally{$<HTMLButtonElement>('begin').disabled=false;$('begin-label').textContent='Begin journey';}}
function updateHUD(now:number){if(!sim)return;$('clock').textContent=sim.clockText();if(!started)return;
  $('speed').textContent=Math.round(sim.speedMph).toString();$('limit').textContent=String(route.limit(sim.player.s));$('speed').classList.toggle('overspeed',sim.speedMph>route.limit(sim.player.s)+2);
  const station=sim.targetStation(),distance=Math.max(0,sim.distanceToStop());$('next-stop').textContent=station?.name||(sim.player.arrived?'Journey complete':'End of line');$('distance').textContent=distance>=1000?`${(distance/1000).toFixed(1)} km`:`${Math.round(distance)} m`;$('doors').textContent=sim.player.doors?`Doors open · ${Math.ceil(sim.player.dwell)}s`:'Doors secured';$('doors').classList.toggle('open',sim.player.doors);
  const c=sim.player.controller;$('controller-state').textContent=sim.aws.brake||sim.tpws.active||sim.player.authorityBrake?'Safety brake demand':c<-.02?`${Math.round(-c*100)}% service brake`:c>.02?`${Math.round(c*100)}% power`:'Coasting';$('controller-pointer').style.left=`${(c+1)*50}%`;$('reverser').textContent=sim.player.reverseAuthority?'REVERSAL · 10 MPH':sim.player.direction===1?'FORWARD':'REVERSE';
  $('aws-lamp').classList.toggle('warning',sim.aws.indicator);$('aws').classList.toggle('pending',sim.aws.pending);$('aws-state').textContent=sim.aws.pending?'Acknowledge':sim.aws.brake?'Brake demand':sim.aws.indicator?'Acknowledged':'Clear';visible('tpws-reset',sim.tpws.active);$('tpws-reset').textContent=sim.tpws.active?`${sim.tpws.reason} · Reset when stopped`:'';
  $('stop-progress').style.width=`${clamp(1-distance/5000,0,1)*100}%`;if(now>noticeUntil&&!sim.aws.pending&&!sim.tpws.active)$('notice').classList.add('quiet');else $('notice').classList.remove('quiet');
}

$('begin').addEventListener('click',begin);$('pause').addEventListener('click',pause);$('continue').addEventListener('click',resume);$('aws').addEventListener('click',()=>sim?.acknowledge());$('tpws-reset').addEventListener('click',()=>sim?.resetTPWS());$('save').addEventListener('click',()=>save());$('save-paused').addEventListener('click',()=>save());$('reload').addEventListener('click',()=>location.reload());
$('new-journey').addEventListener('click',()=>{sim.paused=true;started=false;visible('pause-panel',false);visible('hud',false);visible('menu',true);});
$('settings-open').addEventListener('click',()=>visible('settings',true));$('stops-open').addEventListener('click',()=>{updateStops();visible('stops',true);});
document.querySelectorAll<HTMLElement>('[data-close]').forEach(el=>el.addEventListener('click',()=>visible(el.dataset.close!,false)));
$<HTMLSelectElement>('direction').addEventListener('change',()=>stationOptions(Number($<HTMLSelectElement>('direction').value) as Direction));
$<HTMLSelectElement>('quality').addEventListener('change',()=>view?.setQuality($<HTMLSelectElement>('quality').value as 'low'|'balanced'|'high'));
$<HTMLInputElement>('volume').addEventListener('input',()=>audio.setVolume(Number($<HTMLInputElement>('volume').value)));
$('resume-save').addEventListener('click',async()=>{try{const saved=await journeySaves.get();if(!saved)throw new Error('No saved journey was found.');sim.restore(saved);if(saved.roadTraffic)view.roadTraffic.restore(saved.roadTraffic);view.synchronizeClock();await view.preparePosition();started=true;visible('menu',false);visible('hud',true);updateJourneyTitle();updateStops();resume();notify('Saved journey restored.');}catch(e){showError(e as Error);}});
document.querySelectorAll<HTMLElement>('[data-drive]').forEach(button=>{const key=button.dataset.drive as keyof InputState;button.addEventListener('pointerdown',e=>{input[key]=true;button.setPointerCapture(e.pointerId);});button.addEventListener('pointerup',()=>input[key]=false);button.addEventListener('pointercancel',()=>input[key]=false);});
window.addEventListener('keydown',event=>{if(!started||sim.paused||['SELECT','INPUT','TEXTAREA'].includes((event.target as HTMLElement)?.tagName))return;const key=event.code;if(['KeyA','KeyD','KeyQ','KeyW','KeyS','Space'].includes(key))event.preventDefault();if(key==='KeyA')input.a=true;if(key==='KeyD')input.d=true;if(key==='Space')input.horn=true;if(!event.repeat){if(key==='KeyQ')sim.acknowledge();if(key==='KeyW')sim.setDirection(1);if(key==='KeyS')sim.setDirection(-1);if(key==='Escape')pause();}});
window.addEventListener('keyup',e=>{if(e.code==='KeyA')input.a=false;if(e.code==='KeyD')input.d=false;if(e.code==='Space')input.horn=false;});
window.addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});

async function init(){try{
  const response=await fetch(routeResourceUrl('data/route.json',document.baseURI));if(!response.ok)throw new Error('Route data is missing. Check that the website’s data folder was copied in full.');const data=await response.json() as RouteData;data.worldHash=__RAILWAY_WORLD_HASH__;route=new RouteGeometry(data);route.setEndpointContext(endpointContext(route));sim=new RailwaySimulation(route);sim.sound=name=>audio.event(name);sim.onEvent=e=>{if(e.type==='aws'||e.type==='tpws'||e.type==='station'||e.type==='direction'||e.type==='complete')notify(e.message,e.type==='tpws'||e.type==='aws');};stationOptions(1);
  view=new RailwayRenderer($('viewport'),data,route,sim);view.onError=showError;view.onProgress=()=>{if(!loaded&&view.tileCount>=3){loaded=true;$<HTMLButtonElement>('begin').disabled=false;$('begin-label').textContent='Begin journey';$('gpu-state').innerHTML='<i></i> WEBGL 2 READY';journeySaves.get().then(saved=>visible('resume-save',Boolean(saved))).catch(()=>visible('resume-save',false));}};
  await view.init();
  if(import.meta.env.DEV||import.meta.env.MODE==='qa')(window as any).__railway={sim,route,view,input,save,storage:journeySaves,begin,render:()=>view.draw(1/60),advance:(seconds:number,autoAck=false)=>{const paused=sim.paused;sim.paused=false;for(let i=0;i<seconds*60;i++){if(autoAck&&sim.aws.pending)sim.acknowledge();sim.update(1/60,input);}sim.paused=paused;updateHUD(performance.now());},startAt:(id:string,direction:Direction=1)=>{const index=route.stations.findIndex(s=>s.id===id);sim.start(direction,index);started=true;visible('menu',false);visible('hud',true);updateJourneyTitle();},stats:()=>view.stats()};
  function frame(now:number){try{const dt=Math.min(1,(now-last)/1000);last=now;accumulator+=dt;if(!sim.paused){while(accumulator>=1/60){sim.update(1/60,input);accumulator-=1/60;}}else accumulator=0;audio.update(sim,input.horn);view.draw(dt);if(now-lastHUD>100){updateHUD(now);lastHUD=now;}if(started&&!sim.paused&&now-lastSave>10000){save(false);lastSave=now;}requestAnimationFrame(frame);}catch(e){showError(e as Error);}}
  requestAnimationFrame(frame);
}catch(e){showError(e as Error);}}
init();
