(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();const ct=(i,e,t)=>Math.max(e,Math.min(t,i)),St=(i,e,t)=>i+(e-i)*t,wh=i=>i*2.2369362921,ys=i=>i/2.2369362921;function Nn(i){let e=2166136261;for(const t of String(i))e^=t.charCodeAt(0),e=Math.imul(e,16777619);return e>>>0}function Ni(i){const e=i.right,t=i.tangent,n=[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]],s=Math.hypot(...n)||1,r=Math.cos(i.bank),a=Math.sin(i.bank);return[e[0]*r+n[0]/s*a,e[1]*r+n[1]/s*a,e[2]*r+n[2]/s*a]}function rc(i){const e=Ni(i),t=i.tangent,n=[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]],s=Math.hypot(...n)||1;return n.map(r=>r/s)}class At{constructor(e){if(this.points=e,e.length<2)throw new Error("A path needs at least two points");this.lengths=new Float64Array(e.length);for(let t=1;t<e.length;t++)this.lengths[t]=this.lengths[t-1]+Math.hypot(...e[t].map((n,s)=>n-e[t-1][s]));this.length=this.lengths[this.lengths.length-1],this.frames=new Float64Array(e.length*4);for(let t=0;t<e.length-1;t++){const n=e[t],s=e[t+1],r=e[Math.max(0,t-1)],a=e[Math.min(e.length-1,t+2)],o=a[0]-r[0],l=a[1]-r[1],c=a[2]-r[2],h=Math.hypot(o,c)||1,f=e[Math.max(0,t-3)],d=e[Math.min(e.length-1,t+4)],p=n[0]-f[0],u=n[2]-f[2],_=d[0]-s[0],m=d[2]-s[2],g=Math.hypot(p,u)*Math.hypot(_,m);this.frames.set([o/h,l/h,c/h,g>1?ct(-(p*m-u*_)/g*.12,-.075,.075):0],t*4)}this.frames.set(this.frames.subarray((e.length-2)*4,(e.length-1)*4),(e.length-1)*4)}points;lengths;length;frames;segment(e){let t=0,n=this.points.length-2;for(;t<n;){const s=t+n+1>>1;this.lengths[s]<=e?t=s:n=s-1}return t}sample(e,t=0){const n=ct(e,0,this.length),s=this.segment(n),r=this.points[s],a=this.points[s+1],o=this.lengths[s+1]-this.lengths[s],l=o?(n-this.lengths[s])/o:0,c=St(this.frames[s*4],this.frames[(s+1)*4],l),h=St(this.frames[s*4+1],this.frames[(s+1)*4+1],l),f=St(this.frames[s*4+2],this.frames[(s+1)*4+2],l),d=Math.hypot(c,f)||1,p=[c/d,h/d,f/d],u=[-p[2],0,p[0]],_=St(this.frames[s*4+3],this.frames[(s+1)*4+3],l),m=e-n;return{position:[St(r[0],a[0],l)+u[0]*t+p[0]*m,St(r[1],a[1],l)+p[1]*m,St(r[2],a[2],l)+u[2]*t+p[2]*m],tangent:p,right:u,grade:h/d,yaw:Math.atan2(-p[0],-p[2]),pitch:Math.atan2(h,d),bank:_,s:e}}nearest(e,t,n){let s=0,r=this.points.length-1;n!==void 0&&(s=this.segment(Math.max(0,n-150)),r=Math.min(r,this.segment(n+150)+2));let a=1/0,o=0,l=0;for(let c=s;c<r;c++){const h=this.points[c],f=this.points[c+1],d=f[0]-h[0],p=f[2]-h[2],u=ct(((e-h[0])*d+(t-h[2])*p)/(d*d+p*p||1),0,1),_=h[0]+u*d,m=h[2]+u*p,g=Math.hypot(e-_,t-m);g<a&&(a=g,o=St(this.lengths[c],this.lengths[c+1],u),l=((e-_)*-p+(t-m)*d)/Math.hypot(d,p))}return{s:o,distance:a,side:l}}}class Th extends At{constructor(e){super(e.points),this.data=e,this.fingerprint=Nn(JSON.stringify({simulation:"2026-v3",points:e.points,opposing:e.opposingOffsets||null,stations:e.stations.map(n=>[n.id,n.s]),network:e.network,crossings:e.crossings,structures:e.structures})).toString(16);const t=e.opposingTrack?.points;t?.length===e.points.length&&(this.opposingPath=new At(t)),this.stations=e.stations.map(n=>({...n,s:Number.isFinite(n.s)?this.sourceS(n.s):this.nearest(n.position[0],n.position[2]).s,length:n.length||150,platformCount:n.platformCount||2})).sort((n,s)=>n.s-s.s);for(let n=0;n<this.points.length-1;n++){const s=this.points[n],r=`${Math.floor(s[0]/100)},${Math.floor(s[2]/100)}`,a=this.buckets.get(r)||[];a.push(n),this.buckets.set(r,a)}}data;stations;fingerprint;opposingPath;endpointPaths=new Map;buckets=new Map;sourceS(e){const t=this.data.chainages;if(!t)return e;let n=0,s=t.length-2;for(;n<s;){const r=n+s+1>>1;t[r]<=e?n=r:s=r-1}return St(this.lengths[n],this.lengths[n+1],ct((e-t[n])/(t[n+1]-t[n]||1),0,1))}laneOffset(e,t){if(t===0)return 0;const n=this.data.opposingOffsets;if(!n||n.length!==this.points.length)return t;const s=this.segment(ct(e,0,this.length)),r=ct((e-this.lengths[s])/(this.lengths[s+1]-this.lengths[s]||1),0,1);return St(n[s],n[s+1],r)}setEndpointContext(e){for(const t of e){const n=t.metadata;n?.contextOnly&&this.endpointPaths.set(`${n.lane}/${n.atEnd}`,{path:t.path||new At(t.points),right:n.endpointRight,bank:Number(n.endpointBank)||0})}}laneArc(e,t){if(t===0||!this.opposingPath||e<0)return e;if(e>this.length)return this.opposingPath.length+e-this.length;const n=this.segment(e),s=(e-this.lengths[n])/(this.lengths[n+1]-this.lengths[n]||1);return St(this.opposingPath.lengths[n],this.opposingPath.lengths[n+1],s)}travel(e,t,n){if(n===0||!this.opposingPath)return e+t;const s=this.laneArc(e,n)+t;if(s<0)return s;if(s>this.opposingPath.length)return this.length+s-this.opposingPath.length;const r=this.opposingPath.segment(s),a=(s-this.opposingPath.lengths[r])/(this.opposingPath.lengths[r+1]-this.opposingPath.lengths[r]||1);return St(this.lengths[r],this.lengths[r+1],a)}laneDistance(e,t,n){return this.laneArc(t,n)-this.laneArc(e,n)}lanePose(e,t){if(e<0||e>this.length){const n=e>this.length,s=this.endpointPaths.get(`${t}/${n}`);if(s){const r=n?e-this.length:-e,a=s.path.sample(r),o=ct(r/25,0,1),l=n?1:-1;if(s.right){const c=St(s.right[0],a.right[0],o),h=St(s.right[2],a.right[2],o),f=Math.hypot(c,h)||1;a.right=[c/f,0,h/f],a.bank=St(s.bank,a.bank,o)}return a.tangent=a.tangent.map(c=>c*l),a.right=a.right.map(c=>c*l),a.bank*=l,a.grade*=l,a.yaw=Math.atan2(-a.tangent[0],-a.tangent[2]),a.pitch=Math.atan2(a.grade,1),a.s=e,a}}if(t!==0&&this.opposingPath){const n=this.opposingPath.sample(this.laneArc(e,t));return n.s=e,n}return this.sample(e,t===0?0:this.laneOffset(e,t))}railPosition(e,t,n){const s=this.lanePose(e,t),r=Ni(s);return s.position.map((a,o)=>a+r[o]*n)}project(e,t,n=150){const s=Math.floor(e/100),r=Math.floor(t/100);let a=1/0,o=0,l=0;const c=Math.ceil(n/100);for(let h=-c;h<=c;h++)for(let f=-c;f<=c;f++)for(const d of this.buckets.get(`${s+h},${r+f}`)||[]){const p=this.points[d],u=this.points[d+1],_=u[0]-p[0],m=u[2]-p[2],g=ct(((e-p[0])*_+(t-p[2])*m)/(_*_+m*m||1),0,1),x=e-p[0]-_*g,y=t-p[2]-m*g,S=Math.hypot(x,y);S<a&&(a=S,o=St(this.lengths[d],this.lengths[d+1],g),l=(x*-m+y*_)/(Math.hypot(_,m)||1))}return{s:o,distance:a,side:l}}limit(e){const t=this.stations.find(r=>Math.abs(r.s-e)<400);if(t?.id==="BSW"||t?.id==="BMO")return 25;const n=this.stations.find(r=>r.id==="BSW")?.s||this.length*.6,s=this.stations.find(r=>r.id==="SBJ")?.s||1e4;return Math.abs(e-n)<1400?30:e<s?65:e<n?55:70}tunnelAt(e){return(this.data.tunnels||[]).find(t=>e>this.sourceS(t.start)&&e<this.sourceS(t.end))}}const Za="187",Ah=0,Go=1,Rh=2,Zs=1,Ch=2,Ji=3,hi=0,Jt=1,Sn=2,Di=0,ts=1,Ho=2,Vo=3,Wo=4,Ph=5,Ri=100,Lh=101,Dh=102,Ih=103,Nh=104,Uh=200,Fh=201,Oh=202,Bh=203,ac=204,oc=205,zh=206,kh=207,Gh=208,Hh=209,Vh=210,Wh=211,Xh=212,qh=213,Yh=214,ia=0,sa=1,ra=2,os=3,aa=4,oa=5,la=6,ca=7,lc=0,$h=1,Kh=2,On=0,cc=1,hc=2,uc=3,Ja=4,dc=5,fc=6,pc=7,mc=300,Ui=301,ls=302,Mr=303,Sr=304,ha=1e3,Un=1001,ua=1002,Ot=1003,Zh=1004,Es=1005,Zt=1006,yr=1007,Zn=1008,tn=1009,gc=1010,_c=1011,cs=1012,Qa=1013,wn=1014,yn=1015,Tn=1016,ja=1017,eo=1018,Fi=1020,vc=35902,xc=35899,Mc=1021,Sc=1022,En=1023,jn=1026,Jn=1027,yc=1028,to=1029,ui=1030,no=1031,io=1033,Js=33776,Qs=33777,js=33778,er=33779,da=35840,fa=35841,pa=35842,ma=35843,ga=36196,_a=37492,va=37496,xa=37488,Ma=37489,sr=37490,Sa=37491,ya=37808,Ea=37809,ba=37810,wa=37811,Ta=37812,Aa=37813,Ra=37814,Ca=37815,Pa=37816,La=37817,Da=37818,Ia=37819,Na=37820,Ua=37821,Fa=36492,Oa=36494,Ba=36495,za=36283,ka=36284,rr=36285,Ga=36286,Jh=3200,Ha=0,Qh=1,Kn="",an="srgb",ar="srgb-linear",or="linear",ut="srgb",Er=7680,jh=519,eu=512,tu=513,nu=514,Ec=515,iu=516,su=517,bc=518,wc=519,ru=35044,Xo="300 es",mn=2e3,hs=2001;function au(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function lr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function ou(){const i=lr("canvas");return i.style.display="block",i}const qo={};function Yo(...i){const e="THREE."+i.shift();console.log(e,...i)}function Tc(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function He(...i){i=Tc(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function ot(...i){i=Tc(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function tr(...i){const e=i.join(" ");e in qo||(qo[e]=!0,He(...i))}function lu(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const cu={[ia]:ia,[ra]:la,[aa]:aa,[os]:oa,[sa]:sa,[la]:ra,[ca]:ca,[oa]:os};class pi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const Vt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let $o=1234567;const ns=Math.PI/180,us=180/Math.PI;function mi(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Vt[i&255]+Vt[i>>8&255]+Vt[i>>16&255]+Vt[i>>24&255]+"-"+Vt[e&255]+Vt[e>>8&255]+"-"+Vt[e>>16&15|64]+Vt[e>>24&255]+"-"+Vt[t&63|128]+Vt[t>>8&255]+"-"+Vt[t>>16&255]+Vt[t>>24&255]+Vt[n&255]+Vt[n>>8&255]+Vt[n>>16&255]+Vt[n>>24&255]).toLowerCase()}function nt(i,e,t){return Math.max(e,Math.min(t,i))}function so(i,e){return(i%e+e)%e}function hu(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function uu(i,e,t){return i!==e?(t-i)/(e-i):0}function is(i,e,t){return(1-t)*i+t*e}function du(i,e,t,n){return is(i,e,1-Math.exp(-t*n))}function fu(i,e=1){return e-Math.abs(so(i,e*2)-e)}function pu(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function mu(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function gu(i,e){return i+Math.floor(Math.random()*(e-i+1))}function _u(i,e){return i+Math.random()*(e-i)}function vu(i){return i*(.5-Math.random())}function xu(i){i!==void 0&&($o=i);let e=$o+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Mu(i){return i*ns}function Su(i){return i*us}function yu(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Eu(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Ac(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function bu(i,e,t,n,s){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),h=a((e+n)/2),f=r((e-n)/2),d=a((e-n)/2),p=r((n-e)/2),u=a((n-e)/2);switch(s){case"XYX":i.set(o*h,l*f,l*d,o*c);break;case"YZY":i.set(l*d,o*h,l*f,o*c);break;case"ZXZ":i.set(l*f,l*d,o*h,o*c);break;case"XZX":i.set(o*h,l*u,l*p,o*c);break;case"YXY":i.set(l*p,o*h,l*u,o*c);break;case"ZYZ":i.set(l*u,l*p,o*h,o*c);break;default:He("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function ro(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Rc(i,e){if(e.constructor===Float32Array)return i;const t=ro(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function Cc(i,e){if(e.constructor===Float32Array)return i;const t=ro(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}const Pc={DEG2RAD:ns,RAD2DEG:us,generateUUID:mi,clamp:nt,euclideanModulo:so,mapLinear:hu,inverseLerp:uu,lerp:is,damp:du,pingpong:fu,smoothstep:pu,smootherstep:mu,randInt:gu,randFloat:_u,randFloatSpread:vu,seededRandom:xu,degToRad:Mu,radToDeg:Su,isPowerOfTwo:yu,ceilPowerOfTwo:Eu,floorPowerOfTwo:Ac,setQuaternionFromProperEuler:bu,normalize:Cc,denormalize:Rc},To=class To{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};To.prototype.isVector2=!0;let Se=To;class Gi{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],h=n[s+2],f=n[s+3],d=r[a+0],p=r[a+1],u=r[a+2],_=r[a+3];if(f!==_||l!==d||c!==p||h!==u){let m=l*d+c*p+h*u+f*_;m<0&&(d=-d,p=-p,u=-u,_=-_,m=-m);let g=1-o;if(m<.9995){const x=Math.acos(m),y=Math.sin(x);g=Math.sin(g*x)/y,o=Math.sin(o*x)/y,l=l*g+d*o,c=c*g+p*o,h=h*g+u*o,f=f*g+_*o}else{l=l*g+d*o,c=c*g+p*o,h=h*g+u*o,f=f*g+_*o;const x=1/Math.sqrt(l*l+c*c+h*h+f*f);l*=x,c*=x,h*=x,f*=x}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=f}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],l=n[s+1],c=n[s+2],h=n[s+3],f=r[a],d=r[a+1],p=r[a+2],u=r[a+3];return e[t]=o*u+h*f+l*p-c*d,e[t+1]=l*u+h*d+c*f-o*p,e[t+2]=c*u+h*p+o*d-l*f,e[t+3]=h*u-o*f-l*d-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(s/2),f=o(r/2),d=l(n/2),p=l(s/2),u=l(r/2);switch(a){case"XYZ":this._x=d*h*f+c*p*u,this._y=c*p*f-d*h*u,this._z=c*h*u+d*p*f,this._w=c*h*f-d*p*u;break;case"YXZ":this._x=d*h*f+c*p*u,this._y=c*p*f-d*h*u,this._z=c*h*u-d*p*f,this._w=c*h*f+d*p*u;break;case"ZXY":this._x=d*h*f-c*p*u,this._y=c*p*f+d*h*u,this._z=c*h*u+d*p*f,this._w=c*h*f-d*p*u;break;case"ZYX":this._x=d*h*f-c*p*u,this._y=c*p*f+d*h*u,this._z=c*h*u-d*p*f,this._w=c*h*f+d*p*u;break;case"YZX":this._x=d*h*f+c*p*u,this._y=c*p*f+d*h*u,this._z=c*h*u-d*p*f,this._w=c*h*f-d*p*u;break;case"XZY":this._x=d*h*f-c*p*u,this._y=c*p*f-d*h*u,this._z=c*h*u+d*p*f,this._w=c*h*f+d*p*u;break;default:He("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],f=t[10],d=n+o+f;if(d>0){const p=.5/Math.sqrt(d+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>f){const p=2*Math.sqrt(1+n-o-f);this._w=(h-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>f){const p=2*Math.sqrt(1+o-n-f);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+h)/p}else{const p=2*Math.sqrt(1+f-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(nt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-s*o,this._w=a*h-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){const c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Ao=class Ao{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ko.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ko.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),h=2*(o*t-r*s),f=2*(r*n-a*t);return this.x=t+l*c+a*f-o*h,this.y=n+l*h+o*c-r*f,this.z=s+l*f+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return br.copy(this).projectOnVector(e),this.sub(br)}reflect(e){return this.sub(br.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(nt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Ao.prototype.isVector3=!0;let O=Ao;const br=new O,Ko=new Gi,Ro=class Ro{constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){const h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],f=n[7],d=n[2],p=n[5],u=n[8],_=s[0],m=s[3],g=s[6],x=s[1],y=s[4],S=s[7],T=s[2],w=s[5],v=s[8];return r[0]=a*_+o*x+l*T,r[3]=a*m+o*y+l*w,r[6]=a*g+o*S+l*v,r[1]=c*_+h*x+f*T,r[4]=c*m+h*y+f*w,r[7]=c*g+h*S+f*v,r[2]=d*_+p*x+u*T,r[5]=d*m+p*y+u*w,r[8]=d*g+p*S+u*v,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+s*r*c-s*a*l}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],f=h*a-o*c,d=o*l-h*r,p=c*r-a*l,u=t*f+n*d+s*p;if(u===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/u;return e[0]=f*_,e[1]=(s*c-h*n)*_,e[2]=(o*n-s*a)*_,e[3]=d*_,e[4]=(h*t-s*l)*_,e[5]=(s*r-o*t)*_,e[6]=p*_,e[7]=(n*l-c*t)*_,e[8]=(a*t-n*r)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return tr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(wr.makeScale(e,t)),this}rotate(e){return tr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(wr.makeRotation(-e)),this}translate(e,t){return tr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(wr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Ro.prototype.isMatrix3=!0;let Xe=Ro;const wr=new Xe,Zo=new Xe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Jo=new Xe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function wu(){const i={enabled:!0,workingColorSpace:ar,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===ut&&(s.r=Bn(s.r),s.g=Bn(s.g),s.b=Bn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===ut&&(s.r=Ii(s.r),s.g=Ii(s.g),s.b=Ii(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Kn?or:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[ar]:{primaries:e,whitePoint:n,transfer:or,toXYZ:Zo,fromXYZ:Jo,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:an},outputColorSpaceConfig:{drawingBufferColorSpace:an}},[an]:{primaries:e,whitePoint:n,transfer:ut,toXYZ:Zo,fromXYZ:Jo,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:an}}}),i}const rt=wu();function Bn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ii(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let gi;class Tu{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{gi===void 0&&(gi=lr("canvas")),gi.width=e.width,gi.height=e.height;const s=gi.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=gi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=lr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Bn(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Bn(t[n]/255)*255):t[n]=Bn(t[n]);return{data:t,width:e.width,height:e.height}}else return He("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Au=0;class ao{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Au++}),this.uuid=mi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Tr(s[a].image)):r.push(Tr(s[a]))}else r=Tr(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Tr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Tu.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(He("Texture: Unable to serialize Texture."),{})}let Ru=0;const Ar=new O;class Kt extends pi{constructor(e=Kt.DEFAULT_IMAGE,t=Kt.DEFAULT_MAPPING,n=Un,s=Un,r=Zt,a=Zn,o=En,l=tn,c=Kt.DEFAULT_ANISOTROPY,h=Kn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ru++}),this.uuid=mi(),this.name="",this.source=new ao(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Se(0,0),this.repeat=new Se(1,1),this.center=new Se(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Xe,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Ar).x}get height(){return this.source.getSize(Ar).y}get depth(){return this.source.getSize(Ar).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){He(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){He(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==mc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ha:e.x=e.x-Math.floor(e.x);break;case Un:e.x=e.x<0?0:1;break;case ua:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ha:e.y=e.y-Math.floor(e.y);break;case Un:e.y=e.y<0?0:1;break;case ua:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Kt.DEFAULT_IMAGE=null;Kt.DEFAULT_MAPPING=mc;Kt.DEFAULT_ANISOTROPY=1;const Co=class Co{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const l=e.elements,c=l[0],h=l[4],f=l[8],d=l[1],p=l[5],u=l[9],_=l[2],m=l[6],g=l[10];if(Math.abs(h-d)<.01&&Math.abs(f-_)<.01&&Math.abs(u-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(f+_)<.1&&Math.abs(u+m)<.1&&Math.abs(c+p+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const y=(c+1)/2,S=(p+1)/2,T=(g+1)/2,w=(h+d)/4,v=(f+_)/4,b=(u+m)/4;return y>S&&y>T?y<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(y),s=w/n,r=v/n):S>T?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=w/s,r=b/s):T<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),n=v/r,s=b/r),this.set(n,s,r,t),this}let x=Math.sqrt((m-u)*(m-u)+(f-_)*(f-_)+(d-h)*(d-h));return Math.abs(x)<.001&&(x=1),this.x=(m-u)/x,this.y=(f-_)/x,this.z=(d-h)/x,this.w=Math.acos((c+p+g-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=nt(this.x,e.x,t.x),this.y=nt(this.y,e.y,t.y),this.z=nt(this.z,e.z,t.z),this.w=nt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=nt(this.x,e,t),this.y=nt(this.y,e,t),this.z=nt(this.z,e,t),this.w=nt(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(nt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Co.prototype.isVector4=!0;let yt=Co;class Cu extends pi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Zt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new yt(0,0,e,t),this.scissorTest=!1,this.viewport=new yt(0,0,e,t),this.textures=[];const s=n.count;for(let r=0;r<s;r++)this.textures[r]=new Kt({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:Zt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new ao(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class bn extends Cu{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Lc extends Kt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=Un,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Pu extends Kt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ot,this.minFilter=Ot,this.wrapR=Un,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}const ur=class ur{constructor(e,t,n,s,r,a,o,l,c,h,f,d,p,u,_,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,h,f,d,p,u,_,m)}set(e,t,n,s,r,a,o,l,c,h,f,d,p,u,_,m){const g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=l,g[2]=c,g[6]=h,g[10]=f,g[14]=d,g[3]=p,g[7]=u,g[11]=_,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ur().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,s=1/_i.setFromMatrixColumn(e,0).length(),r=1/_i.setFromMatrixColumn(e,1).length(),a=1/_i.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){const d=a*h,p=a*f,u=o*h,_=o*f;t[0]=l*h,t[4]=-l*f,t[8]=c,t[1]=p+u*c,t[5]=d-_*c,t[9]=-o*l,t[2]=_-d*c,t[6]=u+p*c,t[10]=a*l}else if(e.order==="YXZ"){const d=l*h,p=l*f,u=c*h,_=c*f;t[0]=d+_*o,t[4]=u*o-p,t[8]=a*c,t[1]=a*f,t[5]=a*h,t[9]=-o,t[2]=p*o-u,t[6]=_+d*o,t[10]=a*l}else if(e.order==="ZXY"){const d=l*h,p=l*f,u=c*h,_=c*f;t[0]=d-_*o,t[4]=-a*f,t[8]=u+p*o,t[1]=p+u*o,t[5]=a*h,t[9]=_-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const d=a*h,p=a*f,u=o*h,_=o*f;t[0]=l*h,t[4]=u*c-p,t[8]=d*c+_,t[1]=l*f,t[5]=_*c+d,t[9]=p*c-u,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const d=a*l,p=a*c,u=o*l,_=o*c;t[0]=l*h,t[4]=_-d*f,t[8]=u*f+p,t[1]=f,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=p*f+u,t[10]=d-_*f}else if(e.order==="XZY"){const d=a*l,p=a*c,u=o*l,_=o*c;t[0]=l*h,t[4]=-f,t[8]=c*h,t[1]=d*f+_,t[5]=a*h,t[9]=p*f-u,t[2]=u*f-p,t[6]=o*h,t[10]=_*f+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Lu,e,Du)}lookAt(e,t,n){const s=this.elements;return jt.subVectors(e,t),jt.lengthSq()===0&&(jt.z=1),jt.normalize(),Vn.crossVectors(n,jt),Vn.lengthSq()===0&&(Math.abs(n.z)===1?jt.x+=1e-4:jt.z+=1e-4,jt.normalize(),Vn.crossVectors(n,jt)),Vn.normalize(),bs.crossVectors(jt,Vn),s[0]=Vn.x,s[4]=bs.x,s[8]=jt.x,s[1]=Vn.y,s[5]=bs.y,s[9]=jt.y,s[2]=Vn.z,s[6]=bs.z,s[10]=jt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],f=n[5],d=n[9],p=n[13],u=n[2],_=n[6],m=n[10],g=n[14],x=n[3],y=n[7],S=n[11],T=n[15],w=s[0],v=s[4],b=s[8],P=s[12],R=s[1],C=s[5],F=s[9],W=s[13],L=s[2],k=s[6],X=s[10],z=s[14],se=s[3],$=s[7],ee=s[11],ie=s[15];return r[0]=a*w+o*R+l*L+c*se,r[4]=a*v+o*C+l*k+c*$,r[8]=a*b+o*F+l*X+c*ee,r[12]=a*P+o*W+l*z+c*ie,r[1]=h*w+f*R+d*L+p*se,r[5]=h*v+f*C+d*k+p*$,r[9]=h*b+f*F+d*X+p*ee,r[13]=h*P+f*W+d*z+p*ie,r[2]=u*w+_*R+m*L+g*se,r[6]=u*v+_*C+m*k+g*$,r[10]=u*b+_*F+m*X+g*ee,r[14]=u*P+_*W+m*z+g*ie,r[3]=x*w+y*R+S*L+T*se,r[7]=x*v+y*C+S*k+T*$,r[11]=x*b+y*F+S*X+T*ee,r[15]=x*P+y*W+S*z+T*ie,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],f=e[6],d=e[10],p=e[14],u=e[3],_=e[7],m=e[11],g=e[15],x=l*p-c*d,y=o*p-c*f,S=o*d-l*f,T=a*p-c*h,w=a*d-l*h,v=a*f-o*h;return t*(_*x-m*y+g*S)-n*(u*x-m*T+g*w)+s*(u*y-_*T+g*v)-r*(u*S-_*w+m*v)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],h=e[10];return t*(a*h-o*c)-n*(r*h-o*l)+s*(r*c-a*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],f=e[9],d=e[10],p=e[11],u=e[12],_=e[13],m=e[14],g=e[15],x=t*o-n*a,y=t*l-s*a,S=t*c-r*a,T=n*l-s*o,w=n*c-r*o,v=s*c-r*l,b=h*_-f*u,P=h*m-d*u,R=h*g-p*u,C=f*m-d*_,F=f*g-p*_,W=d*g-p*m,L=x*W-y*F+S*C+T*R-w*P+v*b;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const k=1/L;return e[0]=(o*W-l*F+c*C)*k,e[1]=(s*F-n*W-r*C)*k,e[2]=(_*v-m*w+g*T)*k,e[3]=(d*w-f*v-p*T)*k,e[4]=(l*R-a*W-c*P)*k,e[5]=(t*W-s*R+r*P)*k,e[6]=(m*S-u*v-g*y)*k,e[7]=(h*v-d*S+p*y)*k,e[8]=(a*F-o*R+c*b)*k,e[9]=(n*R-t*F-r*b)*k,e[10]=(u*w-_*S+g*x)*k,e[11]=(f*S-h*w-p*x)*k,e[12]=(o*P-a*C-l*b)*k,e[13]=(t*C-n*P+s*b)*k,e[14]=(_*y-u*T-m*x)*k,e[15]=(h*T-f*y+d*x)*k,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+n,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,f=o+o,d=r*c,p=r*h,u=r*f,_=a*h,m=a*f,g=o*f,x=l*c,y=l*h,S=l*f,T=n.x,w=n.y,v=n.z;return s[0]=(1-(_+g))*T,s[1]=(p+S)*T,s[2]=(u-y)*T,s[3]=0,s[4]=(p-S)*w,s[5]=(1-(d+g))*w,s[6]=(m+x)*w,s[7]=0,s[8]=(u+y)*v,s[9]=(m-x)*v,s[10]=(1-(d+_))*v,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=_i.set(s[0],s[1],s[2]).length();const o=_i.set(s[4],s[5],s[6]).length(),l=_i.set(s[8],s[9],s[10]).length();r<0&&(a=-a),cn.copy(this);const c=1/a,h=1/o,f=1/l;return cn.elements[0]*=c,cn.elements[1]*=c,cn.elements[2]*=c,cn.elements[4]*=h,cn.elements[5]*=h,cn.elements[6]*=h,cn.elements[8]*=f,cn.elements[9]*=f,cn.elements[10]*=f,t.setFromRotationMatrix(cn),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=mn,l=!1){const c=this.elements,h=2*r/(t-e),f=2*r/(n-s),d=(t+e)/(t-e),p=(n+s)/(n-s);let u,_;if(l)u=r/(a-r),_=a*r/(a-r);else if(o===mn)u=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===hs)u=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=f,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=u,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=mn,l=!1){const c=this.elements,h=2/(t-e),f=2/(n-s),d=-(t+e)/(t-e),p=-(n+s)/(n-s);let u,_;if(l)u=1/(a-r),_=a/(a-r);else if(o===mn)u=-2/(a-r),_=-(a+r)/(a-r);else if(o===hs)u=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=f,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=u,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};ur.prototype.isMatrix4=!0;let _t=ur;const _i=new O,cn=new _t,Lu=new O(0,0,0),Du=new O(1,1,1),Vn=new O,bs=new O,jt=new O,Qo=new _t,jo=new Gi;class ei{constructor(e=0,t=0,n=0,s=ei.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],f=s[2],d=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(nt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-nt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(nt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-f,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-nt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(d,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(nt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-nt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:He("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Qo.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Qo,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return jo.setFromEuler(this),this.setFromQuaternion(jo,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ei.DEFAULT_ORDER="XYZ";class Dc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Iu=0;const el=new O,vi=new Gi,Cn=new _t,ws=new O,Wi=new O,Nu=new O,Uu=new Gi,tl=new O(1,0,0),nl=new O(0,1,0),il=new O(0,0,1),sl={type:"added"},Fu={type:"removed"},xi={type:"childadded",child:null},Rr={type:"childremoved",child:null};class Bt extends pi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Iu++}),this.uuid=mi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Bt.DEFAULT_UP.clone();const e=new O,t=new ei,n=new Gi,s=new O(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new _t},normalMatrix:{value:new Xe}}),this.matrix=new _t,this.matrixWorld=new _t,this.matrixAutoUpdate=Bt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Dc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return vi.setFromAxisAngle(e,t),this.quaternion.multiply(vi),this}rotateOnWorldAxis(e,t){return vi.setFromAxisAngle(e,t),this.quaternion.premultiply(vi),this}rotateX(e){return this.rotateOnAxis(tl,e)}rotateY(e){return this.rotateOnAxis(nl,e)}rotateZ(e){return this.rotateOnAxis(il,e)}translateOnAxis(e,t){return el.copy(e).applyQuaternion(this.quaternion),this.position.add(el.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(tl,e)}translateY(e){return this.translateOnAxis(nl,e)}translateZ(e){return this.translateOnAxis(il,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Cn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ws.copy(e):ws.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Wi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Cn.lookAt(Wi,ws,this.up):Cn.lookAt(ws,Wi,this.up),this.quaternion.setFromRotationMatrix(Cn),s&&(Cn.extractRotation(s.matrixWorld),vi.setFromRotationMatrix(Cn),this.quaternion.premultiply(vi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ot("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(sl),xi.child=e,this.dispatchEvent(xi),xi.child=null):ot("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Fu),Rr.child=e,this.dispatchEvent(Rr),Rr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Cn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Cn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Cn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(sl),xi.child=e,this.dispatchEvent(xi),xi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Wi,e,Nu),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Wi,Uu,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const f=l[c];r(e.shapes,f)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),f=a(e.shapes),d=a(e.skeletons),p=a(e.animations),u=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),f.length>0&&(n.shapes=f),d.length>0&&(n.skeletons=d),p.length>0&&(n.animations=p),u.length>0&&(n.nodes=u)}return n.object=s,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Bt.DEFAULT_UP=new O(0,1,0);Bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Tt extends Bt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Ou={type:"move"};class Cr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Tt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Tt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Tt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,n),g=this._getHandJoint(c,_);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.quaternion,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}const h=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],d=h.position.distanceTo(f.position),p=.02,u=.005;c.inputState.pinching&&d>p+u?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=p-u&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.quaternion,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Ou)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Tt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const Ic={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Wn={h:0,s:0,l:0},Ts={h:0,s:0,l:0};function Pr(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ve{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=an){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,rt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=rt.workingColorSpace){return this.r=e,this.g=t,this.b=n,rt.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=rt.workingColorSpace){if(e=so(e,1),t=nt(t,0,1),n=nt(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Pr(a,r,e+1/3),this.g=Pr(a,r,e),this.b=Pr(a,r,e-1/3)}return rt.colorSpaceToWorking(this,s),this}setStyle(e,t=an){function n(r){r!==void 0&&parseFloat(r)<1&&He("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:He("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);He("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=an){const n=Ic[e.toLowerCase()];return n!==void 0?this.setHex(n,t):He("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Bn(e.r),this.g=Bn(e.g),this.b=Bn(e.b),this}copyLinearToSRGB(e){return this.r=Ii(e.r),this.g=Ii(e.g),this.b=Ii(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=an){return rt.workingToColorSpace(Wt.copy(this),e),Math.round(nt(Wt.r*255,0,255))*65536+Math.round(nt(Wt.g*255,0,255))*256+Math.round(nt(Wt.b*255,0,255))}getHexString(e=an){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=rt.workingColorSpace){rt.workingToColorSpace(Wt.copy(this),t);const n=Wt.r,s=Wt.g,r=Wt.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const f=a-o;switch(c=h<=.5?f/(a+o):f/(2-a-o),a){case n:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-n)/f+2;break;case r:l=(n-s)/f+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=rt.workingColorSpace){return rt.workingToColorSpace(Wt.copy(this),t),e.r=Wt.r,e.g=Wt.g,e.b=Wt.b,e}getStyle(e=an){rt.workingToColorSpace(Wt.copy(this),e);const t=Wt.r,n=Wt.g,s=Wt.b;return e!==an?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Wn),this.setHSL(Wn.h+e,Wn.s+t,Wn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Wn),e.getHSL(Ts);const n=is(Wn.h,Ts.h,t),s=is(Wn.s,Ts.s,t),r=is(Wn.l,Ts.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Wt=new Ve;Ve.NAMES=Ic;class oo{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ve(e),this.near=t,this.far=n}clone(){return new oo(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Bu extends Bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ei,this.environmentIntensity=1,this.environmentRotation=new ei,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}}const hn=new O,Pn=new O,Lr=new O,Ln=new O,Mi=new O,Si=new O,rl=new O,Dr=new O,Ir=new O,Nr=new O,Ur=new yt,Fr=new yt,Or=new yt;class fn{constructor(e=new O,t=new O,n=new O){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),hn.subVectors(e,t),s.cross(hn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){hn.subVectors(s,t),Pn.subVectors(n,t),Lr.subVectors(e,t);const a=hn.dot(hn),o=hn.dot(Pn),l=hn.dot(Lr),c=Pn.dot(Pn),h=Pn.dot(Lr),f=a*c-o*o;if(f===0)return r.set(0,0,0),null;const d=1/f,p=(c*l-o*h)*d,u=(a*h-o*l)*d;return r.set(1-p-u,u,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Ln)===null?!1:Ln.x>=0&&Ln.y>=0&&Ln.x+Ln.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Ln)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ln.x),l.addScaledVector(a,Ln.y),l.addScaledVector(o,Ln.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return Ur.setScalar(0),Fr.setScalar(0),Or.setScalar(0),Ur.fromBufferAttribute(e,t),Fr.fromBufferAttribute(e,n),Or.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Ur,r.x),a.addScaledVector(Fr,r.y),a.addScaledVector(Or,r.z),a}static isFrontFacing(e,t,n,s){return hn.subVectors(n,t),Pn.subVectors(e,t),hn.cross(Pn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return hn.subVectors(this.c,this.b),Pn.subVectors(this.a,this.b),hn.cross(Pn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return fn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return fn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return fn.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return fn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return fn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;Mi.subVectors(s,n),Si.subVectors(r,n),Dr.subVectors(e,n);const l=Mi.dot(Dr),c=Si.dot(Dr);if(l<=0&&c<=0)return t.copy(n);Ir.subVectors(e,s);const h=Mi.dot(Ir),f=Si.dot(Ir);if(h>=0&&f<=h)return t.copy(s);const d=l*f-h*c;if(d<=0&&l>=0&&h<=0&&l-h>0)return a=l/(l-h),t.copy(n).addScaledVector(Mi,a);Nr.subVectors(e,r);const p=Mi.dot(Nr),u=Si.dot(Nr);if(u>=0&&p<=u)return t.copy(r);const _=p*c-l*u;if(_<=0&&c>=0&&u<=0)return o=c/(c-u),t.copy(n).addScaledVector(Si,o);const m=h*u-p*f;if(m<=0&&f-h>=0&&p-u>=0)return rl.subVectors(r,s),o=(f-h)/(f-h+(p-u)),t.copy(s).addScaledVector(rl,o);const g=1/(m+_+d);return a=_*g,o=d*g,t.copy(n).addScaledVector(Mi,a).addScaledVector(Si,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class ti{constructor(e=new O(1/0,1/0,1/0),t=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(un.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(un.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=un.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,un):un.fromBufferAttribute(r,a),un.applyMatrix4(e.matrixWorld),this.expandByPoint(un);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),As.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),As.copy(n.boundingBox)),As.applyMatrix4(e.matrixWorld),this.union(As)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,un),un.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Xi),Rs.subVectors(this.max,Xi),yi.subVectors(e.a,Xi),Ei.subVectors(e.b,Xi),bi.subVectors(e.c,Xi),Xn.subVectors(Ei,yi),qn.subVectors(bi,Ei),ri.subVectors(yi,bi);let t=[0,-Xn.z,Xn.y,0,-qn.z,qn.y,0,-ri.z,ri.y,Xn.z,0,-Xn.x,qn.z,0,-qn.x,ri.z,0,-ri.x,-Xn.y,Xn.x,0,-qn.y,qn.x,0,-ri.y,ri.x,0];return!Br(t,yi,Ei,bi,Rs)||(t=[1,0,0,0,1,0,0,0,1],!Br(t,yi,Ei,bi,Rs))?!1:(Cs.crossVectors(Xn,qn),t=[Cs.x,Cs.y,Cs.z],Br(t,yi,Ei,bi,Rs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,un).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(un).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Dn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Dn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Dn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Dn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Dn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Dn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Dn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Dn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Dn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Dn=[new O,new O,new O,new O,new O,new O,new O,new O],un=new O,As=new ti,yi=new O,Ei=new O,bi=new O,Xn=new O,qn=new O,ri=new O,Xi=new O,Rs=new O,Cs=new O,ai=new O;function Br(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){ai.fromArray(i,r);const o=s.x*Math.abs(ai.x)+s.y*Math.abs(ai.y)+s.z*Math.abs(ai.z),l=e.dot(ai),c=t.dot(ai),h=n.dot(ai);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const Ct=new O,Ps=new Se;let zu=0;class gn extends pi{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:zu++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=ru,this.updateRanges=[],this.gpuType=yn,this.version=0,this._normalizationScale=e!==void 0?ro(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ps.fromBufferAttribute(this,t),Ps.applyMatrix3(e),this.setXY(t,Ps.x,Ps.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix3(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix4(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyNormalMatrix(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.transformDirection(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){const t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):Rc(e,this.array)}_normalize(e){const t=this._normalizationScale;return t!==void 0?Math.round(e*t):Cc(e,this.array)}}class Nc extends gn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class Uc extends gn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class bt extends gn{constructor(e,t,n){super(new Float32Array(e),t,n)}}const ku=new ti,qi=new O,zr=new O;class lo{constructor(e=new O,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):ku.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;qi.subVectors(e,this.center);const t=qi.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(qi,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(zr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(qi.copy(e.center).add(zr)),this.expandByPoint(qi.copy(e.center).sub(zr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Gu=0;const sn=new _t,kr=new Bt,wi=new O,en=new ti,Yi=new ti,Nt=new O;class qt extends pi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Gu++}),this.uuid=mi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(au(e)?Uc:Nc)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Xe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return sn.makeRotationFromQuaternion(e),this.applyMatrix4(sn),this}rotateX(e){return sn.makeRotationX(e),this.applyMatrix4(sn),this}rotateY(e){return sn.makeRotationY(e),this.applyMatrix4(sn),this}rotateZ(e){return sn.makeRotationZ(e),this.applyMatrix4(sn),this}translate(e,t,n){return sn.makeTranslation(e,t,n),this.applyMatrix4(sn),this}scale(e,t,n){return sn.makeScale(e,t,n),this.applyMatrix4(sn),this}lookAt(e){return kr.lookAt(e),kr.updateMatrix(),this.applyMatrix4(kr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(wi).negate(),this.translate(wi.x,wi.y,wi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new bt(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&He("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ti);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ot("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];en.setFromBufferAttribute(r),this.morphTargetsRelative?(Nt.addVectors(this.boundingBox.min,en.min),this.boundingBox.expandByPoint(Nt),Nt.addVectors(this.boundingBox.max,en.max),this.boundingBox.expandByPoint(Nt)):(this.boundingBox.expandByPoint(en.min),this.boundingBox.expandByPoint(en.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ot('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new lo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ot("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(e){const n=this.boundingSphere.center;if(en.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];Yi.setFromBufferAttribute(o),this.morphTargetsRelative?(Nt.addVectors(en.min,Yi.min),en.expandByPoint(Nt),Nt.addVectors(en.max,Yi.max),en.expandByPoint(Nt)):(en.expandByPoint(Yi.min),en.expandByPoint(Yi.max))}en.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Nt.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Nt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Nt.fromBufferAttribute(o,c),l&&(wi.fromBufferAttribute(e,c),Nt.add(wi)),s=Math.max(s,n.distanceToSquared(Nt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ot('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ot("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;let a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new gn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));const o=[],l=[],c=new Uint8Array(n.count);for(let P=0;P<n.count;P++)o[P]=new O,l[P]=new O;const h=new O,f=new O,d=new O,p=new Se,u=new Se,_=new Se,m=new O,g=new O;function x(P,R,C){c[P]=c[R]=c[C]=1,h.fromBufferAttribute(n,P),f.fromBufferAttribute(n,R),d.fromBufferAttribute(n,C),p.fromBufferAttribute(r,P),u.fromBufferAttribute(r,R),_.fromBufferAttribute(r,C),f.sub(h),d.sub(h),u.sub(p),_.sub(p);const F=1/(u.x*_.y-_.x*u.y);isFinite(F)&&(m.copy(f).multiplyScalar(_.y).addScaledVector(d,-u.y).multiplyScalar(F),g.copy(d).multiplyScalar(u.x).addScaledVector(f,-_.x).multiplyScalar(F),o[P].add(m),o[R].add(m),o[C].add(m),l[P].add(g),l[R].add(g),l[C].add(g))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let P=0,R=y.length;P<R;++P){const C=y[P],F=C.start,W=C.count;for(let L=F,k=F+W;L<k;L+=3)x(e.getX(L+0),e.getX(L+1),e.getX(L+2))}const S=new O,T=new O,w=new O,v=new O;function b(P){w.fromBufferAttribute(s,P),v.copy(w);const R=o[P];S.copy(R),S.sub(w.multiplyScalar(w.dot(R))).normalize(),T.crossVectors(v,R);const F=T.dot(l[P])<0?-1:1;a.setXYZW(P,S.x,S.y,S.z,F)}for(let P=0,R=n.count;P<R;++P)c[P]&&b(P);this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new gn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,p=n.count;d<p;d++)n.setXYZ(d,0,0,0);const s=new O,r=new O,a=new O,o=new O,l=new O,c=new O,h=new O,f=new O;if(e)for(let d=0,p=e.count;d<p;d+=3){const u=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,u),r.fromBufferAttribute(t,_),a.fromBufferAttribute(t,m),h.subVectors(a,r),f.subVectors(s,r),h.cross(f),o.fromBufferAttribute(n,u),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(u,o.x,o.y,o.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,p=t.count;d<p;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),f.subVectors(s,r),h.cross(f),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Nt.fromBufferAttribute(e,t),Nt.normalize(),e.setXYZ(t,Nt.x,Nt.y,Nt.z)}toNonIndexed(){function e(o,l){const c=o.array,h=o.itemSize,f=o.normalized,d=new c.constructor(l.length*h);let p=0,u=0;for(let _=0,m=l.length;_<m;_++){o.isInterleavedBufferAttribute?p=l[_]*o.data.stride+o.offset:p=l[_]*h;for(let g=0;g<h;g++)d[u++]=c[p++]}return new gn(d,h,f)}if(this.index===null)return He("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new qt,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,f=c.length;h<f;h++){const d=c[h],p=e(d,n);l.push(p)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let f=0,d=c.length;f<d;f++){const p=c[f];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],f=r[c];for(let d=0,p=f.length;d<p;d++)h.push(f[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,h=a.length;c<h;c++){const f=a[c];this.addGroup(f.start,f.count,f.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Gr=new O,Hu=new O,Vu=new Xe;class $n{constructor(e=new O(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=Gr.subVectors(n,t).cross(Hu.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const s=e.delta(Gr),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Vu.getNormalMatrix(e),s=this.coplanarPoint(Gr).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let Wu=0;class _s extends pi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Wu++}),this.uuid=mi(),this.name="",this.type="Material",this.blending=ts,this.side=hi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ac,this.blendDst=oc,this.blendEquation=Ri,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ve(0,0,0),this.blendAlpha=0,this.depthFunc=os,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=jh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Er,this.stencilZFail=Er,this.stencilZPass=Er,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){He(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){He(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ve().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new $n().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Se().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Se().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const In=new O,Hr=new O,Ls=new O,Ds=new O;class Xu{constructor(e=new O,t=new O(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,In)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=In.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(In.copy(this.origin).addScaledVector(this.direction,t),In.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Hr.copy(e).add(t).multiplyScalar(.5),Ls.copy(t).sub(e).normalize(),Ds.copy(this.origin).sub(Hr);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Ls),o=Ds.dot(this.direction),l=-Ds.dot(Ls),c=Ds.lengthSq(),h=Math.abs(1-a*a);let f,d,p,u;if(h>0)if(f=a*l-o,d=a*o-l,u=r*h,f>=0)if(d>=-u)if(d<=u){const _=1/h;f*=_,d*=_,p=f*(f+a*d+2*o)+d*(a*f+d+2*l)+c}else d=r,f=Math.max(0,-(a*d+o)),p=-f*f+d*(d+2*l)+c;else d=-r,f=Math.max(0,-(a*d+o)),p=-f*f+d*(d+2*l)+c;else d<=-u?(f=Math.max(0,-(-a*r+o)),d=f>0?-r:Math.min(Math.max(-r,-l),r),p=-f*f+d*(d+2*l)+c):d<=u?(f=0,d=Math.min(Math.max(-r,-l),r),p=d*(d+2*l)+c):(f=Math.max(0,-(a*r+o)),d=f>0?r:Math.min(Math.max(-r,-l),r),p=-f*f+d*(d+2*l)+c);else d=a>0?-r:r,f=Math.max(0,-(a*d+o)),p=-f*f+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Hr).addScaledVector(Ls,d),p}intersectSphere(e,t){if(e.radius<0)return null;In.subVectors(e.center,this.origin);const n=In.dot(this.direction),s=In.dot(In)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(e.min.z-d.z)*f,l=(e.max.z-d.z)*f):(o=(e.max.z-d.z)*f,l=(e.min.z-d.z)*f),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,In)!==null}intersectTriangle(e,t,n,s,r){const a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,f=e.x-a.x,d=e.y-a.y,p=e.z-a.z,u=t.x-a.x,_=t.y-a.y,m=t.z-a.z,g=n.x-a.x,x=n.y-a.y,y=n.z-a.z,S=Math.abs(l),T=Math.abs(c),w=Math.abs(h);let v,b,P,R,C,F,W,L,k,X,z,se;if(S>=T&&S>=w?(P=l,F=f,k=u,se=g,l>=0?(v=c,b=h,R=d,C=p,W=_,L=m,X=x,z=y):(v=h,b=c,R=p,C=d,W=m,L=_,X=y,z=x)):T>=w?(P=c,F=d,k=_,se=x,c>=0?(v=h,b=l,R=p,C=f,W=m,L=u,X=y,z=g):(v=l,b=h,R=f,C=p,W=u,L=m,X=g,z=y)):(P=h,F=p,k=m,se=y,h>=0?(v=l,b=c,R=f,C=d,W=u,L=_,X=g,z=x):(v=c,b=l,R=d,C=f,W=_,L=u,X=x,z=g)),P===0)return null;const $=v/P,ee=b/P,ie=1/P,we=R-$*F,Fe=C-ee*F,K=W-$*k,ge=L-ee*k,Te=X-$*se,Ue=z-ee*se,Me=Te*ge-Ue*K,Oe=we*Ue-Fe*Te,dt=K*Fe-ge*we;if(s){if(Me<0||Oe<0||dt<0)return null}else if((Me<0||Oe<0||dt<0)&&(Me>0||Oe>0||dt>0))return null;const ke=Me+Oe+dt;if(ke===0)return null;const Ye=ie*(Me*F+Oe*k+dt*se);return(ke>0?Ye<0:Ye>0)?null:this.at(Ye/ke,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class qu extends _s{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ei,this.combine=lc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const al=new _t,oi=new Xu,Is=new lo,ol=new O,Ns=new O,Us=new O,Fs=new O,Vr=new O,Os=new O,ll=new O,Bs=new O;class zt extends Bt{constructor(e=new qt,t=new qu){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){Os.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],f=r[l];h!==0&&(Vr.fromBufferAttribute(f,e),a?Os.addScaledVector(Vr,h):Os.addScaledVector(Vr.sub(t),h))}t.add(Os)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Is.copy(n.boundingSphere),Is.applyMatrix4(r),oi.copy(e.ray).recast(e.near),!(Is.containsPoint(oi.origin)===!1&&(oi.intersectSphere(Is,ol)===null||oi.origin.distanceToSquared(ol)>(e.far-e.near)**2))&&(al.copy(r).invert(),oi.copy(e.ray).applyMatrix4(al),!(n.boundingBox!==null&&oi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,oi)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,f=r.attributes.normal,d=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let u=0,_=d.length;u<_;u++){const m=d[u],g=a[m.materialIndex],x=Math.max(m.start,p.start),y=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let S=x,T=y;S<T;S+=3){const w=o.getX(S),v=o.getX(S+1),b=o.getX(S+2);s=zs(this,g,e,n,c,h,f,w,v,b),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const u=Math.max(0,p.start),_=Math.min(o.count,p.start+p.count);for(let m=u,g=_;m<g;m+=3){const x=o.getX(m),y=o.getX(m+1),S=o.getX(m+2);s=zs(this,a,e,n,c,h,f,x,y,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let u=0,_=d.length;u<_;u++){const m=d[u],g=a[m.materialIndex],x=Math.max(m.start,p.start),y=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let S=x,T=y;S<T;S+=3){const w=S,v=S+1,b=S+2;s=zs(this,g,e,n,c,h,f,w,v,b),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const u=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=u,g=_;m<g;m+=3){const x=m,y=m+1,S=m+2;s=zs(this,a,e,n,c,h,f,x,y,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function Yu(i,e,t,n,s,r,a,o){let l;if(e.side===Jt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===hi,o),l===null)return null;Bs.copy(o),Bs.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Bs);return c<t.near||c>t.far?null:{distance:c,point:Bs.clone(),object:i}}function zs(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Ns),i.getVertexPosition(l,Us),i.getVertexPosition(c,Fs);const h=Yu(i,e,t,n,Ns,Us,Fs,ll);if(h){const f=new O;fn.getBarycoord(ll,Ns,Us,Fs,f),s&&(h.uv=fn.getInterpolatedAttribute(s,o,l,c,f,new Se)),r&&(h.uv1=fn.getInterpolatedAttribute(r,o,l,c,f,new Se)),a&&(h.normal=fn.getInterpolatedAttribute(a,o,l,c,f,new O),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a:o,b:l,c,normal:new O,materialIndex:0};fn.getNormal(Ns,Us,Fs,d.normal),h.face=d,h.barycoord=f}return h}class $u extends Kt{constructor(e=null,t=1,n=1,s,r,a,o,l,c=Ot,h=Ot,f,d){super(null,a,o,l,c,h,s,r,f,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const li=new lo,Ku=new Se(.5,.5),ks=new O;class ds{constructor(e=new $n,t=new $n,n=new $n,s=new $n,r=new $n,a=new $n){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=mn,n=!1){const s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],f=r[5],d=r[6],p=r[7],u=r[8],_=r[9],m=r[10],g=r[11],x=r[12],y=r[13],S=r[14],T=r[15];if(s[0].setComponents(c-a,p-h,g-u,T-x).normalize(),s[1].setComponents(c+a,p+h,g+u,T+x).normalize(),s[2].setComponents(c+o,p+f,g+_,T+y).normalize(),s[3].setComponents(c-o,p-f,g-_,T-y).normalize(),n)s[4].setComponents(l,d,m,S).normalize(),s[5].setComponents(c-l,p-d,g-m,T-S).normalize();else if(s[4].setComponents(c-l,p-d,g-m,T-S).normalize(),t===mn)s[5].setComponents(c+l,p+d,g+m,T+S).normalize();else if(t===hs)s[5].setComponents(l,d,m,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),li.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),li.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(li)}intersectsSprite(e){li.center.set(0,0,0);const t=Ku.distanceTo(e.center);return li.radius=.7071067811865476+t,li.applyMatrix4(e.matrixWorld),this.intersectsSphere(li)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(ks.x=s.normal.x>0?e.max.x:e.min.x,ks.y=s.normal.y>0?e.max.y:e.min.y,ks.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(ks)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const cl=new _t;class co{constructor(){this.coordinateSystem=mn,this._frustums=[],this._count=0}setFromArrayCamera(e){const t=e.cameras,n=this._frustums;for(let s=0;s<t.length;s++){const r=t[s];cl.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new ds),n[s].setFromProjectionMatrix(cl,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;const t=this._frustums,n=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new ds),t[s].copy(n[s]);return this._count=e._count,this}clone(){return new co().copy(this)}}class Fc extends Kt{constructor(e=[],t=Ui,n,s,r,a,o,l,c,h){super(e,t,n,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Oi extends Kt{constructor(e,t,n=wn,s,r,a,o=Ot,l=Ot,c,h=jn,f=1){if(h!==jn&&h!==Jn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:f};super(d,s,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ao(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}}class Oc extends Oi{constructor(e,t=wn,n=Ui,s,r,a=Ot,o=Ot,l,c=jn){const h={width:e,height:e,depth:1},f=[h,h,h,h,h,h];super(e,e,t,n,s,r,a,o,l,c),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Bc extends Kt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class zn extends qt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],f=[];let d=0,p=0;u("z","y","x",-1,-1,n,t,e,a,r,0),u("z","y","x",1,-1,n,t,-e,a,r,1),u("x","z","y",1,1,e,n,t,s,a,2),u("x","z","y",1,-1,e,n,-t,s,a,3),u("x","y","z",1,-1,e,t,n,s,r,4),u("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new bt(c,3)),this.setAttribute("normal",new bt(h,3)),this.setAttribute("uv",new bt(f,2));function u(_,m,g,x,y,S,T,w,v,b,P){const R=S/v,C=T/b,F=S/2,W=T/2,L=w/2,k=v+1,X=b+1;let z=0,se=0;const $=new O;for(let ee=0;ee<X;ee++){const ie=ee*C-W;for(let we=0;we<k;we++){const Fe=we*R-F;$[_]=Fe*x,$[m]=ie*y,$[g]=L,c.push($.x,$.y,$.z),$[_]=0,$[m]=0,$[g]=w>0?1:-1,h.push($.x,$.y,$.z),f.push(we/v),f.push(1-ee/b),z+=1}}for(let ee=0;ee<b;ee++)for(let ie=0;ie<v;ie++){const we=d+ie+k*ee,Fe=d+ie+k*(ee+1),K=d+(ie+1)+k*(ee+1),ge=d+(ie+1)+k*ee;l.push(we,Fe,ge),l.push(Fe,K,ge),se+=6}o.addGroup(p,se,P),p+=se,d+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new zn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class dr extends qt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const h=[],f=[],d=[],p=[];let u=0;const _=[],m=n/2;let g=0;x(),a===!1&&(e>0&&y(!0),t>0&&y(!1)),this.setIndex(h),this.setAttribute("position",new bt(f,3)),this.setAttribute("normal",new bt(d,3)),this.setAttribute("uv",new bt(p,2));function x(){const S=new O,T=new O;let w=0;const v=(t-e)/n;for(let b=0;b<=r;b++){const P=[],R=b/r,C=R*(t-e)+e;for(let F=0;F<=s;F++){const W=F/s,L=W*l+o,k=Math.sin(L),X=Math.cos(L);T.x=C*k,T.y=-R*n+m,T.z=C*X,f.push(T.x,T.y,T.z),S.set(k,v,X).normalize(),d.push(S.x,S.y,S.z),p.push(W,1-R),P.push(u++)}_.push(P)}for(let b=0;b<s;b++)for(let P=0;P<r;P++){const R=_[P][b],C=_[P+1][b],F=_[P+1][b+1],W=_[P][b+1];(e>0||P!==0)&&(h.push(R,C,W),w+=3),(t>0||P!==r-1)&&(h.push(C,F,W),w+=3)}c.addGroup(g,w,0),g+=w}function y(S){const T=u,w=new Se,v=new O;let b=0;const P=S===!0?e:t,R=S===!0?1:-1;for(let F=1;F<=s;F++)f.push(0,m*R,0),d.push(0,R,0),p.push(.5,.5),u++;const C=u;for(let F=0;F<=s;F++){const L=F/s*l+o,k=Math.cos(L),X=Math.sin(L);v.x=P*X,v.y=m*R,v.z=P*k,f.push(v.x,v.y,v.z),d.push(0,R,0),w.x=k*.5+.5,w.y=X*.5*R+.5,p.push(w.x,w.y),u++}for(let F=0;F<s;F++){const W=T+F,L=C+F;S===!0?h.push(L,L+1,W):h.push(L+1,L,W),b+=3}c.addGroup(g,b,S===!0?1:2),g+=b}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new dr(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ho extends dr{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new ho(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class uo extends qt{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};const r=[],a=[];o(s),c(n),h(),this.setAttribute("position",new bt(r,3)),this.setAttribute("normal",new bt(r.slice(),3)),this.setAttribute("uv",new bt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(x){const y=new O,S=new O,T=new O;for(let w=0;w<t.length;w+=3)p(t[w+0],y),p(t[w+1],S),p(t[w+2],T),l(y,S,T,x)}function l(x,y,S,T){const w=T+1,v=[];for(let b=0;b<=w;b++){v[b]=[];const P=x.clone().lerp(S,b/w),R=y.clone().lerp(S,b/w),C=w-b;for(let F=0;F<=C;F++)F===0&&b===w?v[b][F]=P:v[b][F]=P.clone().lerp(R,F/C)}for(let b=0;b<w;b++)for(let P=0;P<2*(w-b)-1;P++){const R=Math.floor(P/2);P%2===0?(d(v[b][R+1]),d(v[b+1][R]),d(v[b][R])):(d(v[b][R+1]),d(v[b+1][R+1]),d(v[b+1][R]))}}function c(x){const y=new O;for(let S=0;S<r.length;S+=3)y.x=r[S+0],y.y=r[S+1],y.z=r[S+2],y.normalize().multiplyScalar(x),r[S+0]=y.x,r[S+1]=y.y,r[S+2]=y.z}function h(){const x=new O;for(let y=0;y<r.length;y+=3){x.x=r[y+0],x.y=r[y+1],x.z=r[y+2];const S=m(x)/2/Math.PI+.5,T=g(x)/Math.PI+.5;a.push(S,1-T)}u(),f()}function f(){for(let x=0;x<a.length;x+=6){const y=a[x+0],S=a[x+2],T=a[x+4],w=Math.max(y,S,T),v=Math.min(y,S,T);w>.9&&v<.1&&(y<.2&&(a[x+0]+=1),S<.2&&(a[x+2]+=1),T<.2&&(a[x+4]+=1))}}function d(x){r.push(x.x,x.y,x.z)}function p(x,y){const S=x*3;y.x=e[S+0],y.y=e[S+1],y.z=e[S+2]}function u(){const x=new O,y=new O,S=new O,T=new O,w=new Se,v=new Se,b=new Se;for(let P=0,R=0;P<r.length;P+=9,R+=6){x.set(r[P+0],r[P+1],r[P+2]),y.set(r[P+3],r[P+4],r[P+5]),S.set(r[P+6],r[P+7],r[P+8]),w.set(a[R+0],a[R+1]),v.set(a[R+2],a[R+3]),b.set(a[R+4],a[R+5]),T.copy(x).add(y).add(S).divideScalar(3);const C=m(T);_(w,R+0,x,C),_(v,R+2,y,C),_(b,R+4,S,C)}}function _(x,y,S,T){T<0&&x.x===1&&(a[y]=x.x-1),S.x===0&&S.z===0&&(a[y]=T/2/Math.PI+.5)}function m(x){return Math.atan2(x.z,-x.x)}function g(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new uo(e.vertices,e.indices,e.radius,e.detail)}}class An{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){He("Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let s=0;const r=n.length;let a;t?a=t:a=e*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);const h=n[s],d=n[s+1]-h,p=(a-h)/d;return(s+p)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new Se:new O);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new O,s=[],r=[],a=[],o=new O,l=new _t;for(let p=0;p<=e;p++){const u=p/e;s[p]=this.getTangentAt(u,new O)}r[0]=new O,a[0]=new O;let c=Number.MAX_VALUE;const h=Math.abs(s[0].x),f=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),f<=c&&(c=f,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),a[p]=a[p-1].clone(),o.crossVectors(s[p-1],s[p]),o.length()>Number.EPSILON){o.normalize();const u=Math.acos(nt(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(o,u))}a[p].crossVectors(s[p],r[p])}if(t===!0){let p=Math.acos(nt(r[0].dot(r[e]),-1,1));p/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(p=-p);for(let u=1;u<=e;u++)r[u].applyMatrix4(l.makeRotationAxis(s[u],p*u)),a[u].crossVectors(s[u],r[u])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}}class fo extends An{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new Se){const n=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);const o=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),f=Math.sin(this.aRotation),d=l-this.aX,p=c-this.aY;l=d*h-p*f+this.aX,c=d*f+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Zu extends fo{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function po(){let i=0,e=0,t=0,n=0;function s(r,a,o,l){i=r,e=o,t=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,f){let d=(a-r)/c-(o-r)/(c+h)+(o-a)/h,p=(o-a)/h-(l-a)/(h+f)+(l-o)/f;d*=h,p*=h,s(a,o,d,p)},calc:function(r){const a=r*r,o=a*r;return i+e*r+t*a+n*o}}}const hl=new O,ul=new O,Wr=new po,Xr=new po,qr=new po;class Ju extends An{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new O){const n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(ul.subVectors(s[0],s[1]).add(s[0]),c=ul);const f=s[o%r],d=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(hl.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=hl),this.curveType==="centripetal"||this.curveType==="chordal"){const p=this.curveType==="chordal"?.5:.25;let u=Math.pow(c.distanceToSquared(f),p),_=Math.pow(f.distanceToSquared(d),p),m=Math.pow(d.distanceToSquared(h),p);_<1e-4&&(_=1),u<1e-4&&(u=_),m<1e-4&&(m=_),Wr.initNonuniformCatmullRom(c.x,f.x,d.x,h.x,u,_,m),Xr.initNonuniformCatmullRom(c.y,f.y,d.y,h.y,u,_,m),qr.initNonuniformCatmullRom(c.z,f.z,d.z,h.z,u,_,m)}else this.curveType==="catmullrom"&&(Wr.initCatmullRom(c.x,f.x,d.x,h.x,this.tension),Xr.initCatmullRom(c.y,f.y,d.y,h.y,this.tension),qr.initCatmullRom(c.z,f.z,d.z,h.z,this.tension));return n.set(Wr.calc(l),Xr.calc(l),qr.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new O().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function dl(i,e,t,n,s){const r=(n-e)*.5,a=(s-t)*.5,o=i*i,l=i*o;return(2*t-2*n+r+a)*l+(-3*t+3*n-2*r-a)*o+r*i+t}function Qu(i,e){const t=1-i;return t*t*e}function ju(i,e){return 2*(1-i)*i*e}function ed(i,e){return i*i*e}function ss(i,e,t,n){return Qu(i,e)+ju(i,t)+ed(i,n)}function td(i,e){const t=1-i;return t*t*t*e}function nd(i,e){const t=1-i;return 3*t*t*i*e}function id(i,e){return 3*(1-i)*i*i*e}function sd(i,e){return i*i*i*e}function rs(i,e,t,n,s){return td(i,e)+nd(i,t)+id(i,n)+sd(i,s)}class zc extends An{constructor(e=new Se,t=new Se,n=new Se,s=new Se){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new Se){const n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(rs(e,s.x,r.x,a.x,o.x),rs(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class rd extends An{constructor(e=new O,t=new O,n=new O,s=new O){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new O){const n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(rs(e,s.x,r.x,a.x,o.x),rs(e,s.y,r.y,a.y,o.y),rs(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class kc extends An{constructor(e=new Se,t=new Se){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Se){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Se){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class ad extends An{constructor(e=new O,t=new O){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new O){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new O){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Gc extends An{constructor(e=new Se,t=new Se,n=new Se){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Se){const n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(ss(e,s.x,r.x,a.x),ss(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class od extends An{constructor(e=new O,t=new O,n=new O){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new O){const n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(ss(e,s.x,r.x,a.x),ss(e,s.y,r.y,a.y),ss(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Hc extends An{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Se){const n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],f=s[a>s.length-3?s.length-1:a+2];return n.set(dl(o,l.x,c.x,h.x,f.x),dl(o,l.y,c.y,h.y,f.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new Se().fromArray(s))}return this}}var Va=Object.freeze({__proto__:null,ArcCurve:Zu,CatmullRomCurve3:Ju,CubicBezierCurve:zc,CubicBezierCurve3:rd,EllipseCurve:fo,LineCurve:kc,LineCurve3:ad,QuadraticBezierCurve:Gc,QuadraticBezierCurve3:od,SplineCurve:Hc});class ld extends An{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Va[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this.cacheLengths=null,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(new Va[s.type]().fromJSON(s))}return this.cacheLengths=null,this}}class Wa extends ld{constructor(e){super(),this.type="Path",this.currentPoint=new Se,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new kc(this.currentPoint.clone(),new Se(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){const r=new Gc(this.currentPoint.clone(),new Se(e,t),new Se(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,a){const o=new zc(this.currentPoint.clone(),new Se(e,t),new Se(n,s),new Se(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new Hc(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,n,s,r,a),this}absarc(e,t,n,s,r,a){return this.absellipse(e,t,n,n,s,r,a),this}ellipse(e,t,n,s,r,a,o,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,s,r,a,o,l),this}absellipse(e,t,n,s,r,a,o,l){const c=new fo(e,t,n,s,r,a,o,l);if(this.curves.length>0){const f=c.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class mo extends Wa{constructor(e){super(e),this.uuid=mi(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(new Wa().fromJSON(s))}return this}}function cd(i,e,t=2){const n=e&&e.length,s=n?e[0]*t:i.length;let r=Vc(i,0,s,t,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(n&&(r=pd(i,e,r,t)),i.length>80*t){o=i[0],l=i[1];let h=o,f=l;for(let d=t;d<s;d+=t){const p=i[d],u=i[d+1];p<o&&(o=p),u<l&&(l=u),p>h&&(h=p),u>f&&(f=u)}c=Math.max(h-o,f-l),c=c!==0?32767/c:0}return fs(r,a,t,o,l,c,0),a}function Vc(i,e,t,n,s){let r;if(s===wd(i,e,t,n)>0)for(let a=e;a<t;a+=n)r=fl(a/n|0,i[a],i[a+1],r);else for(let a=t-n;a>=e;a-=n)r=fl(a/n|0,i[a],i[a+1],r);return r&&Bi(r,r.next)&&(ms(r),r=r.next),r}function di(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Bi(t,t.next)||Et(t.prev,t,t.next)===0)){if(ms(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function fs(i,e,t,n,s,r,a){if(!i)return;!a&&r&&xd(i,n,s,r);let o=i;for(;i.prev!==i.next;){const l=i.prev,c=i.next;if(r?ud(i,n,s,r):hd(i)){e.push(l.i,i.i,c.i),ms(i),i=c.next,o=c.next;continue}if(i=c,i===o){a?a===1?(i=dd(di(i),e),fs(i,e,t,n,s,r,2)):a===2&&fd(i,e,t,n,s,r):fs(di(i),e,t,n,s,r,1);break}}}function hd(i){const e=i.prev,t=i,n=i.next;if(Et(e,t,n)>=0)return!1;const s=e.x,r=t.x,a=n.x,o=e.y,l=t.y,c=n.y,h=Math.min(s,r,a),f=Math.min(o,l,c),d=Math.max(s,r,a),p=Math.max(o,l,c);let u=n.next;for(;u!==e;){if(u.x>=h&&u.x<=d&&u.y>=f&&u.y<=p&&Qi(s,o,r,l,a,c,u.x,u.y)&&Et(u.prev,u,u.next)>=0)return!1;u=u.next}return!0}function ud(i,e,t,n){const s=i.prev,r=i,a=i.next;if(Et(s,r,a)>=0)return!1;const o=s.x,l=r.x,c=a.x,h=s.y,f=r.y,d=a.y,p=Math.min(o,l,c),u=Math.min(h,f,d),_=Math.max(o,l,c),m=Math.max(h,f,d),g=Xa(p,u,e,t,n),x=Xa(_,m,e,t,n);let y=i.prevZ,S=i.nextZ;for(;y&&y.z>=g&&S&&S.z<=x;){if(y.x>=p&&y.x<=_&&y.y>=u&&y.y<=m&&y!==s&&y!==a&&Qi(o,h,l,f,c,d,y.x,y.y)&&Et(y.prev,y,y.next)>=0||(y=y.prevZ,S.x>=p&&S.x<=_&&S.y>=u&&S.y<=m&&S!==s&&S!==a&&Qi(o,h,l,f,c,d,S.x,S.y)&&Et(S.prev,S,S.next)>=0))return!1;S=S.nextZ}for(;y&&y.z>=g;){if(y.x>=p&&y.x<=_&&y.y>=u&&y.y<=m&&y!==s&&y!==a&&Qi(o,h,l,f,c,d,y.x,y.y)&&Et(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;S&&S.z<=x;){if(S.x>=p&&S.x<=_&&S.y>=u&&S.y<=m&&S!==s&&S!==a&&Qi(o,h,l,f,c,d,S.x,S.y)&&Et(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function dd(i,e){let t=i;do{const n=t.prev,s=t.next.next;!Bi(n,s)&&Xc(n,t,t.next,s)&&ps(n,s)&&ps(s,n)&&(e.push(n.i,t.i,s.i),ms(t),ms(t.next),t=i=s),t=t.next}while(t!==i);return di(t)}function fd(i,e,t,n,s,r){let a=i;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&yd(a,o)){let l=qc(a,o);a=di(a,a.next),l=di(l,l.next),fs(a,e,t,n,s,r,0),fs(l,e,t,n,s,r,0);return}o=o.next}a=a.next}while(a!==i)}function pd(i,e,t,n){const s=[];for(let r=0,a=e.length;r<a;r++){const o=e[r]*n,l=r<a-1?e[r+1]*n:i.length,c=Vc(i,o,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Sd(c))}s.sort(md);for(let r=0;r<s.length;r++)t=gd(s[r],t);return t}function md(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function gd(i,e){const t=_d(i,e);if(!t)return e;const n=qc(t,i);return di(n,n.next),di(t,t.next)}function _d(i,e){let t=e;const n=i.x,s=i.y;let r=-1/0,a;if(Bi(i,t))return t;do{if(Bi(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){const f=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(f<=n&&f>r&&(r=f,a=t.x<t.next.x?t:t.next,f===n))return a}t=t.next}while(t!==e);if(!a)return null;const o=a,l=a.x,c=a.y;let h=1/0;t=a;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Wc(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){const f=Math.abs(s-t.y)/(n-t.x);ps(t,i)&&(f<h||f===h&&(t.x>a.x||t.x===a.x&&vd(a,t)))&&(a=t,h=f)}t=t.next}while(t!==o);return a}function vd(i,e){return Et(i.prev,i,e.prev)<0&&Et(e.next,i,i.next)<0}function xd(i,e,t,n){let s=i;do s.z===0&&(s.z=Xa(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Md(s)}function Md(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let a=n,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||n.z<=a.z)?(s=n,n=n.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=a}r.nextZ=null,t*=2}while(e>1);return i}function Xa(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function Sd(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Wc(i,e,t,n,s,r,a,o){return(s-a)*(e-o)>=(i-a)*(r-o)&&(i-a)*(n-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(n-o)}function Qi(i,e,t,n,s,r,a,o){return!(i===a&&e===o)&&Wc(i,e,t,n,s,r,a,o)}function yd(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Ed(i,e)&&(ps(i,e)&&ps(e,i)&&bd(i,e)&&(Et(i.prev,i,e.prev)||Et(i,e.prev,e))||Bi(i,e)&&Et(i.prev,i,i.next)>0&&Et(e.prev,e,e.next)>0)}function Et(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Bi(i,e){return i.x===e.x&&i.y===e.y}function Xc(i,e,t,n){const s=Hs(Et(i,e,t)),r=Hs(Et(i,e,n)),a=Hs(Et(t,n,i)),o=Hs(Et(t,n,e));return!!(s!==r&&a!==o||s===0&&Gs(i,t,e)||r===0&&Gs(i,n,e)||a===0&&Gs(t,i,n)||o===0&&Gs(t,e,n))}function Gs(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Hs(i){return i>0?1:i<0?-1:0}function Ed(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Xc(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function ps(i,e){return Et(i.prev,i,i.next)<0?Et(i,e,i.next)>=0&&Et(i,i.prev,e)>=0:Et(i,e,i.prev)<0||Et(i,i.next,e)<0}function bd(i,e){let t=i,n=!1;const s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function qc(i,e){const t=qa(i.i,i.x,i.y),n=qa(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function fl(i,e,t,n){const s=qa(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function ms(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function qa(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function wd(i,e,t,n){let s=0;for(let r=e,a=t-n;r<t;r+=n)s+=(i[a]-i[r])*(i[r+1]+i[a+1]),a=r;return s}class Td{static triangulate(e,t,n=2){return cd(e,t,n)}}class Li{static area(e){const t=e.length;let n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return Li.area(e)<0}static triangulateShape(e,t){const n=[],s=[],r=[];pl(e),ml(n,e);let a=e.length;t.forEach(pl);for(let l=0;l<t.length;l++)s.push(a),a+=t[l].length,ml(n,t[l]);const o=Td.triangulate(n,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function pl(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function ml(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class fr extends qt{constructor(e=new mo([new Se(.5,.5),new Se(-.5,.5),new Se(-.5,-.5),new Se(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,s=[],r=[];for(let o=0,l=e.length;o<l;o++){const c=e[o];a(c)}this.setAttribute("position",new bt(s,3)),this.setAttribute("uv",new bt(r,2)),this.computeVertexNormals();function a(o){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,f=t.depth!==void 0?t.depth:1;let d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,p=t.bevelThickness!==void 0?t.bevelThickness:.2,u=t.bevelSize!==void 0?t.bevelSize:p-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3;const g=t.extrudePath,x=t.UVGenerator!==void 0?t.UVGenerator:Ad;let y,S=!1,T,w,v,b;if(g){y=g.getSpacedPoints(h),S=!0,d=!1;const te=g.isCatmullRomCurve3?g.closed:!1;T=g.computeFrenetFrames(h,te),w=new O,v=new O,b=new O}d||(m=0,p=0,u=0,_=0);const P=o.extractPoints(c);let R=P.shape;const C=P.holes;if(!Li.isClockWise(R)){R=R.reverse();for(let te=0,he=C.length;te<he;te++){const q=C[te];Li.isClockWise(q)&&(C[te]=q.reverse())}}function W(te){const q=10000000000000001e-36;let ae=te[0];for(let re=1;re<=te.length;re++){const Be=re%te.length,Ae=te[Be],$e=Ae.x-ae.x,Je=Ae.y-ae.y,et=$e*$e+Je*Je,U=Math.max(Math.abs(Ae.x),Math.abs(Ae.y),Math.abs(ae.x),Math.abs(ae.y)),xt=q*U*U;if(et<=xt){te.splice(Be,1),re--;continue}ae=Ae}}W(R),C.forEach(W);const L=C.length,k=R;for(let te=0;te<L;te++){const he=C[te];R=R.concat(he)}function X(te,he,q){return he||ot("ExtrudeGeometry: vec does not exist"),te.clone().addScaledVector(he,q)}const z=R.length;function se(te,he,q){let ae,re,Be;const Ae=te.x-he.x,$e=te.y-he.y,Je=q.x-te.x,et=q.y-te.y,U=Ae*Ae+$e*$e,xt=Ae*et-$e*Je;if(Math.abs(xt)>Number.EPSILON){const tt=Math.sqrt(U),ft=Math.sqrt(Je*Je+et*et),_e=he.x-$e/tt,wt=he.y+Ae/tt,Ge=q.x-et/ft,We=q.y+Je/ft,A=((Ge-_e)*et-(We-wt)*Je)/(Ae*et-$e*Je);ae=_e+Ae*A-te.x,re=wt+$e*A-te.y;const M=ae*ae+re*re;if(M<=2)return new Se(ae,re);Be=Math.sqrt(M/2)}else{let tt=!1;Ae>Number.EPSILON?Je>Number.EPSILON&&(tt=!0):Ae<-Number.EPSILON?Je<-Number.EPSILON&&(tt=!0):Math.sign($e)===Math.sign(et)&&(tt=!0),tt?(ae=-$e,re=Ae,Be=Math.sqrt(U)):(ae=Ae,re=$e,Be=Math.sqrt(U/2))}return new Se(ae/Be,re/Be)}const $=[];for(let te=0,he=k.length,q=he-1,ae=te+1;te<he;te++,q++,ae++)q===he&&(q=0),ae===he&&(ae=0),$[te]=se(k[te],k[q],k[ae]);const ee=[];let ie,we=$.concat();for(let te=0,he=L;te<he;te++){const q=C[te];ie=[];for(let ae=0,re=q.length,Be=re-1,Ae=ae+1;ae<re;ae++,Be++,Ae++)Be===re&&(Be=0),Ae===re&&(Ae=0),ie[ae]=se(q[ae],q[Be],q[Ae]);ee.push(ie),we=we.concat(ie)}let Fe;if(m===0)Fe=Li.triangulateShape(k,C);else{const te=[],he=[];for(let q=0;q<m;q++){const ae=q/m,re=p*Math.cos(ae*Math.PI/2),Be=u*Math.sin(ae*Math.PI/2)+_;for(let Ae=0,$e=k.length;Ae<$e;Ae++){const Je=X(k[Ae],$[Ae],Be);Oe(Je.x,Je.y,-re),ae===0&&te.push(Je)}for(let Ae=0,$e=L;Ae<$e;Ae++){const Je=C[Ae];ie=ee[Ae];const et=[];for(let U=0,xt=Je.length;U<xt;U++){const tt=X(Je[U],ie[U],Be);Oe(tt.x,tt.y,-re),ae===0&&et.push(tt)}ae===0&&he.push(et)}}Fe=Li.triangulateShape(te,he)}const K=Fe.length,ge=u+_;for(let te=0;te<z;te++){const he=d?X(R[te],we[te],ge):R[te];S?(v.copy(T.normals[0]).multiplyScalar(he.x),w.copy(T.binormals[0]).multiplyScalar(he.y),b.copy(y[0]).add(v).add(w),Oe(b.x,b.y,b.z)):Oe(he.x,he.y,0)}for(let te=1;te<=h;te++)for(let he=0;he<z;he++){const q=d?X(R[he],we[he],ge):R[he];S?(v.copy(T.normals[te]).multiplyScalar(q.x),w.copy(T.binormals[te]).multiplyScalar(q.y),b.copy(y[te]).add(v).add(w),Oe(b.x,b.y,b.z)):Oe(q.x,q.y,f/h*te)}for(let te=m-1;te>=0;te--){const he=te/m,q=p*Math.cos(he*Math.PI/2),ae=u*Math.sin(he*Math.PI/2)+_;for(let re=0,Be=k.length;re<Be;re++){const Ae=X(k[re],$[re],ae);Oe(Ae.x,Ae.y,f+q)}for(let re=0,Be=C.length;re<Be;re++){const Ae=C[re];ie=ee[re];for(let $e=0,Je=Ae.length;$e<Je;$e++){const et=X(Ae[$e],ie[$e],ae);S?Oe(et.x,et.y+y[h-1].y,y[h-1].x+q):Oe(et.x,et.y,f+q)}}}Te(),Ue();function Te(){const te=s.length/3;if(d){let he=0,q=z*he;for(let ae=0;ae<K;ae++){const re=Fe[ae];dt(re[2]+q,re[1]+q,re[0]+q)}he=h+m*2,q=z*he;for(let ae=0;ae<K;ae++){const re=Fe[ae];dt(re[0]+q,re[1]+q,re[2]+q)}}else{for(let he=0;he<K;he++){const q=Fe[he];dt(q[2],q[1],q[0])}for(let he=0;he<K;he++){const q=Fe[he];dt(q[0]+z*h,q[1]+z*h,q[2]+z*h)}}n.addGroup(te,s.length/3-te,0)}function Ue(){const te=s.length/3;let he=0;Me(k,he),he+=k.length;for(let q=0,ae=C.length;q<ae;q++){const re=C[q];Me(re,he),he+=re.length}n.addGroup(te,s.length/3-te,1)}function Me(te,he){let q=te.length;for(;--q>=0;){const ae=q;let re=q-1;re<0&&(re=te.length-1);for(let Be=0,Ae=h+m*2;Be<Ae;Be++){const $e=z*Be,Je=z*(Be+1),et=he+ae+$e,U=he+re+$e,xt=he+re+Je,tt=he+ae+Je;ke(et,U,xt,tt)}}}function Oe(te,he,q){l.push(te),l.push(he),l.push(q)}function dt(te,he,q){Ye(te),Ye(he),Ye(q);const ae=s.length/3,re=x.generateTopUV(n,s,ae-3,ae-2,ae-1);Ke(re[0]),Ke(re[1]),Ke(re[2])}function ke(te,he,q,ae){Ye(te),Ye(he),Ye(ae),Ye(he),Ye(q),Ye(ae);const re=s.length/3,Be=x.generateSideWallUV(n,s,re-6,re-3,re-2,re-1);Ke(Be[0]),Ke(Be[1]),Ke(Be[3]),Ke(Be[1]),Ke(Be[2]),Ke(Be[3])}function Ye(te){s.push(l[te*3+0]),s.push(l[te*3+1]),s.push(l[te*3+2])}function Ke(te){r.push(te.x),r.push(te.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Rd(t,n,e)}static fromJSON(e,t){const n=[];for(let r=0,a=e.shapes.length;r<a;r++){const o=t[e.shapes[r]];n.push(o)}const s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new Va[s.type]().fromJSON(s)),new fr(n,e.options)}}const Ad={generateTopUV:function(i,e,t,n,s){const r=e[t*3],a=e[t*3+1],o=e[n*3],l=e[n*3+1],c=e[s*3],h=e[s*3+1];return[new Se(r,a),new Se(o,l),new Se(c,h)]},generateSideWallUV:function(i,e,t,n,s,r){const a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[n*3],h=e[n*3+1],f=e[n*3+2],d=e[s*3],p=e[s*3+1],u=e[s*3+2],_=e[r*3],m=e[r*3+1],g=e[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new Se(a,1-l),new Se(c,1-f),new Se(d,1-u),new Se(_,1-g)]:[new Se(o,1-l),new Se(h,1-f),new Se(p,1-u),new Se(m,1-g)]}};function Rd(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){const r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class go extends uo{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new go(e.radius,e.detail)}}class pr extends qt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,h=l+1,f=e/o,d=t/l,p=[],u=[],_=[],m=[];for(let g=0;g<h;g++){const x=g*d-a;for(let y=0;y<c;y++){const S=y*f-r;u.push(S,-x,0),_.push(0,0,1),m.push(y/o),m.push(1-g/l)}}for(let g=0;g<l;g++)for(let x=0;x<o;x++){const y=x+c*g,S=x+c*(g+1),T=x+1+c*(g+1),w=x+1+c*g;p.push(y,S,w),p.push(S,T,w)}this.setIndex(p),this.setAttribute("position",new bt(u,3)),this.setAttribute("normal",new bt(_,3)),this.setAttribute("uv",new bt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new pr(e.width,e.height,e.widthSegments,e.heightSegments)}}function zi(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];if(gl(s))s.isRenderTargetTexture?(He("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(gl(s[0])){const r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function $t(i){const e={};for(let t=0;t<i.length;t++){const n=zi(i[t]);for(const s in n)e[s]=n[s]}return e}function gl(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Cd(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Yc(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:rt.workingColorSpace}const Pd={clone:zi,merge:$t};var Ld=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Dd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class fi extends _s{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ld,this.fragmentShader=Dd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=zi(e.uniforms),this.uniformsGroups=Cd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ve().setHex(s.value);break;case"v2":this.uniforms[n].value=new Se().fromArray(s.value);break;case"v3":this.uniforms[n].value=new O().fromArray(s.value);break;case"v4":this.uniforms[n].value=new yt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Xe().fromArray(s.value);break;case"m4":this.uniforms[n].value=new _t().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class Id extends fi{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class _n extends _s{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ve(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ha,this.normalScale=new Se(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ei,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Nd extends _s{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Jh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Ud extends _s{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class $c extends Bt{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ve(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class Fd extends $c{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ve(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const Yr=new _t,_l=new O,vl=new O;class Od{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Se(512,512),this.mapType=tn,this.map=null,this.mapPass=null,this.matrix=new _t,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ds,this._frameExtents=new Se(1,1),this._viewportCount=1,this._viewports=[new yt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera;_l.setFromMatrixPosition(e.matrixWorld),t.position.copy(_l),vl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(vl),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){Yr.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Yr,e.coordinateSystem,e.reversedDepth);const r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===hs||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Yr)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Vs=new O,Ws=new Gi,vn=new O;class Kc extends Bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new _t,this.projectionMatrix=new _t,this.projectionMatrixInverse=new _t,this.coordinateSystem=mn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Vs,Ws,vn),vn.x===1&&vn.y===1&&vn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Vs,Ws,vn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Vs,Ws,vn),vn.x===1&&vn.y===1&&vn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Vs,Ws,vn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Yn=new O,xl=new Se,Ml=new Se;class dn extends Kc{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=us*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ns*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return us*2*Math.atan(Math.tan(ns*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Yn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Yn.x,Yn.y).multiplyScalar(-e/Yn.z),Yn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Yn.x,Yn.y).multiplyScalar(-e/Yn.z)}getViewSize(e,t){return this.getViewBounds(e,xl,Ml),t.subVectors(Ml,xl)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ns*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class Zc extends Kc{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Bd extends Od{constructor(){super(new Zc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class zd extends $c{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Bt.DEFAULT_UP),this.updateMatrix(),this.target=new Bt,this.shadow=new Bd}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}const Ti=-90,Ai=1;class Ya extends Bt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new dn(Ti,Ai,e,t);s.layers=this.layers,this.add(s);const r=new dn(Ti,Ai,e,t);r.layers=this.layers,this.add(r);const a=new dn(Ti,Ai,e,t);a.layers=this.layers,this.add(a);const o=new dn(Ti,Ai,e,t);o.layers=this.layers,this.add(o);const l=new dn(Ti,Ai,e,t);l.layers=this.layers,this.add(l);const c=new dn(Ti,Ai,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===mn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===hs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,f=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),u=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=_,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(f,d,p),e.xr.enabled=u,n.texture.needsPMREMUpdate=!0}}class kd extends dn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}}function Sl(i,e,t,n){const s=Gd(n);switch(t){case Mc:return i*e;case yc:return i*e/s.components*s.byteLength;case to:return i*e/s.components*s.byteLength;case ui:return i*e*2/s.components*s.byteLength;case no:return i*e*2/s.components*s.byteLength;case Sc:return i*e*3/s.components*s.byteLength;case En:return i*e*4/s.components*s.byteLength;case io:return i*e*4/s.components*s.byteLength;case Js:case Qs:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case js:case er:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case fa:case ma:return Math.max(i,16)*Math.max(e,8)/4;case da:case pa:return Math.max(i,8)*Math.max(e,8)/2;case ga:case _a:case xa:case Ma:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case va:case sr:case Sa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ya:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ea:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case ba:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case wa:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Ta:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Aa:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ra:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Ca:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Pa:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case La:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Da:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Ia:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Na:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Ua:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Fa:case Oa:case Ba:return Math.ceil(i/4)*Math.ceil(e/4)*16;case za:case ka:return Math.ceil(i/4)*Math.ceil(e/4)*8;case rr:case Ga:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Gd(i){switch(i){case tn:case gc:return{byteLength:1,components:1};case cs:case _c:case Tn:return{byteLength:2,components:1};case ja:case eo:return{byteLength:2,components:4};case wn:case Qa:case yn:return{byteLength:4,components:1};case vc:case xc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Za}}));typeof window<"u"&&(window.__THREE__?He("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Za);function Jc(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Hd(i){const e=new WeakMap;function t(o,l){const c=o.array,h=o.usage,f=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,l,c){const h=l.array,f=l.updateRanges;if(i.bindBuffer(c,o),f.length===0)i.bufferSubData(c,0,h);else{f.sort((p,u)=>p.start-u.start);let d=0;for(let p=1;p<f.length;p++){const u=f[d],_=f[p];_.start<=u.start+u.count+1?u.count=Math.max(u.count,_.start+_.count-u.start):(++d,f[d]=_)}f.length=d+1;for(let p=0,u=f.length;p<u;p++){const _=f[p];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Vd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Wd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Xd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,qd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Yd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,$d=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Kd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Zd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Jd=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Qd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,jd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,ef=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,tf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,nf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,sf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,rf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,af=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,of=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,lf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,cf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,hf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,uf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,df=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,ff=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,pf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,mf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,gf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,_f=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,vf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,xf="gl_FragColor = linearToOutputTexel( gl_FragColor );",Mf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Sf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,yf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Ef=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,bf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,wf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Tf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Af=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Rf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Cf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Pf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Lf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Df=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,If=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Nf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Uf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Ff=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Of=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Bf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,zf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,kf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Gf=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Hf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Vf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Wf=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Xf=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,qf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Yf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,$f=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Kf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Zf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Jf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Qf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,jf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ep=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,tp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,np=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ip=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,sp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,rp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,ap=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,op=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,lp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,cp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,hp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,up=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,dp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,fp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,pp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,mp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,gp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,_p=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,vp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,xp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Mp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Sp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,yp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Ep=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,bp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,wp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Tp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Ap=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Rp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Cp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Pp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Lp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Dp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Ip=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Np=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Up=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Fp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Op=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Bp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,zp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,kp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Gp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Hp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Vp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Wp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Xp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,qp=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Yp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,$p=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Zp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Jp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Qp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,jp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,e0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,t0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,n0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,i0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,s0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,r0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,a0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,o0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,l0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,c0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,h0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,u0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,d0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,f0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,p0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,m0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,g0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,v0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,x0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,M0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,S0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,y0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,je={alphahash_fragment:Vd,alphahash_pars_fragment:Wd,alphamap_fragment:Xd,alphamap_pars_fragment:qd,alphatest_fragment:Yd,alphatest_pars_fragment:$d,aomap_fragment:Kd,aomap_pars_fragment:Zd,batching_pars_vertex:Jd,batching_vertex:Qd,begin_vertex:jd,beginnormal_vertex:ef,bsdfs:tf,iridescence_fragment:nf,bumpmap_pars_fragment:sf,clipping_planes_fragment:rf,clipping_planes_pars_fragment:af,clipping_planes_pars_vertex:of,clipping_planes_vertex:lf,color_fragment:cf,color_pars_fragment:hf,color_pars_vertex:uf,color_vertex:df,common:ff,defaultnormal_vertex:pf,displacementmap_pars_vertex:mf,displacementmap_vertex:gf,emissivemap_fragment:_f,emissivemap_pars_fragment:vf,colorspace_fragment:xf,colorspace_pars_fragment:Mf,envmap_fragment:Sf,envmap_common_pars_fragment:yf,envmap_pars_fragment:Ef,envmap_pars_vertex:bf,envmap_physical_pars_fragment:Uf,envmap_vertex:wf,fog_vertex:Tf,fog_pars_vertex:Af,fog_fragment:Rf,fog_pars_fragment:Cf,gradientmap_pars_fragment:Pf,lightmap_pars_fragment:Lf,lights_lambert_fragment:Df,lights_lambert_pars_fragment:If,lights_pars_begin:Nf,lights_toon_fragment:Ff,lights_toon_pars_fragment:Of,lights_phong_fragment:Bf,lights_phong_pars_fragment:zf,lights_physical_fragment:kf,lights_physical_pars_fragment:Gf,lights_fragment_begin:Hf,lights_fragment_maps:Vf,lights_fragment_end:Wf,lightprobes_pars_fragment:Xf,logdepthbuf_fragment:qf,logdepthbuf_pars_fragment:Yf,logdepthbuf_pars_vertex:$f,logdepthbuf_vertex:Kf,map_fragment:Zf,map_pars_fragment:Jf,map_particle_fragment:Qf,map_particle_pars_fragment:jf,metalnessmap_fragment:ep,metalnessmap_pars_fragment:tp,morphinstance_vertex:np,morphcolor_vertex:ip,morphnormal_vertex:sp,morphtarget_pars_vertex:rp,morphtarget_vertex:ap,normal_fragment_begin:op,normal_fragment_maps:lp,normal_pars_fragment:cp,normal_pars_vertex:hp,normal_vertex:up,normalmap_pars_fragment:dp,clearcoat_normal_fragment_begin:fp,clearcoat_normal_fragment_maps:pp,clearcoat_pars_fragment:mp,iridescence_pars_fragment:gp,opaque_fragment:_p,packing:vp,premultiplied_alpha_fragment:xp,project_vertex:Mp,dithering_fragment:Sp,dithering_pars_fragment:yp,roughnessmap_fragment:Ep,roughnessmap_pars_fragment:bp,shadowmap_pars_fragment:wp,shadowmap_pars_vertex:Tp,shadowmap_vertex:Ap,shadowmask_pars_fragment:Rp,skinbase_vertex:Cp,skinning_pars_vertex:Pp,skinning_vertex:Lp,skinnormal_vertex:Dp,specularmap_fragment:Ip,specularmap_pars_fragment:Np,tonemapping_fragment:Up,tonemapping_pars_fragment:Fp,transmission_fragment:Op,transmission_pars_fragment:Bp,uv_pars_fragment:zp,uv_pars_vertex:kp,uv_vertex:Gp,worldpos_vertex:Hp,background_vert:Vp,background_frag:Wp,backgroundCube_vert:Xp,backgroundCube_frag:qp,cube_vert:Yp,cube_frag:$p,depth_vert:Kp,depth_frag:Zp,distance_vert:Jp,distance_frag:Qp,equirect_vert:jp,equirect_frag:e0,linedashed_vert:t0,linedashed_frag:n0,meshbasic_vert:i0,meshbasic_frag:s0,meshlambert_vert:r0,meshlambert_frag:a0,meshmatcap_vert:o0,meshmatcap_frag:l0,meshnormal_vert:c0,meshnormal_frag:h0,meshphong_vert:u0,meshphong_frag:d0,meshphysical_vert:f0,meshphysical_frag:p0,meshtoon_vert:m0,meshtoon_frag:g0,points_vert:_0,points_frag:v0,shadow_vert:x0,shadow_frag:M0,sprite_vert:S0,sprite_frag:y0},Ee={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Xe}},envmap:{envMap:{value:null},envMapRotation:{value:new Xe},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Xe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Xe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Xe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Xe},normalScale:{value:new Se(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Xe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Xe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Xe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Xe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0},uvTransform:{value:new Xe}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new Se(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}}},Mn={basic:{uniforms:$t([Ee.common,Ee.specularmap,Ee.envmap,Ee.aomap,Ee.lightmap,Ee.fog]),vertexShader:je.meshbasic_vert,fragmentShader:je.meshbasic_frag},lambert:{uniforms:$t([Ee.common,Ee.specularmap,Ee.envmap,Ee.aomap,Ee.lightmap,Ee.emissivemap,Ee.bumpmap,Ee.normalmap,Ee.displacementmap,Ee.fog,Ee.lights,{emissive:{value:new Ve(0)},envMapIntensity:{value:1}}]),vertexShader:je.meshlambert_vert,fragmentShader:je.meshlambert_frag},phong:{uniforms:$t([Ee.common,Ee.specularmap,Ee.envmap,Ee.aomap,Ee.lightmap,Ee.emissivemap,Ee.bumpmap,Ee.normalmap,Ee.displacementmap,Ee.fog,Ee.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:je.meshphong_vert,fragmentShader:je.meshphong_frag},standard:{uniforms:$t([Ee.common,Ee.envmap,Ee.aomap,Ee.lightmap,Ee.emissivemap,Ee.bumpmap,Ee.normalmap,Ee.displacementmap,Ee.roughnessmap,Ee.metalnessmap,Ee.fog,Ee.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag},toon:{uniforms:$t([Ee.common,Ee.aomap,Ee.lightmap,Ee.emissivemap,Ee.bumpmap,Ee.normalmap,Ee.displacementmap,Ee.gradientmap,Ee.fog,Ee.lights,{emissive:{value:new Ve(0)}}]),vertexShader:je.meshtoon_vert,fragmentShader:je.meshtoon_frag},matcap:{uniforms:$t([Ee.common,Ee.bumpmap,Ee.normalmap,Ee.displacementmap,Ee.fog,{matcap:{value:null}}]),vertexShader:je.meshmatcap_vert,fragmentShader:je.meshmatcap_frag},points:{uniforms:$t([Ee.points,Ee.fog]),vertexShader:je.points_vert,fragmentShader:je.points_frag},dashed:{uniforms:$t([Ee.common,Ee.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:je.linedashed_vert,fragmentShader:je.linedashed_frag},depth:{uniforms:$t([Ee.common,Ee.displacementmap]),vertexShader:je.depth_vert,fragmentShader:je.depth_frag},normal:{uniforms:$t([Ee.common,Ee.bumpmap,Ee.normalmap,Ee.displacementmap,{opacity:{value:1}}]),vertexShader:je.meshnormal_vert,fragmentShader:je.meshnormal_frag},sprite:{uniforms:$t([Ee.sprite,Ee.fog]),vertexShader:je.sprite_vert,fragmentShader:je.sprite_frag},background:{uniforms:{uvTransform:{value:new Xe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:je.background_vert,fragmentShader:je.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Xe}},vertexShader:je.backgroundCube_vert,fragmentShader:je.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:je.cube_vert,fragmentShader:je.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:je.equirect_vert,fragmentShader:je.equirect_frag},distance:{uniforms:$t([Ee.common,Ee.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:je.distance_vert,fragmentShader:je.distance_frag},shadow:{uniforms:$t([Ee.lights,Ee.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:je.shadow_vert,fragmentShader:je.shadow_frag}};Mn.physical={uniforms:$t([Mn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Xe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Xe},clearcoatNormalScale:{value:new Se(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Xe},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Xe},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Xe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Xe},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Xe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Xe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Xe},transmissionSamplerSize:{value:new Se},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Xe},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Xe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Xe},anisotropyVector:{value:new Se},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Xe}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag};const Xs={r:0,b:0,g:0},E0=new _t,Qc=new Xe;Qc.set(-1,0,0,0,1,0,0,0,1);function b0(i,e,t,n,s,r){const a=new Ve(0);let o=s===!0?0:1,l,c,h=null,f=0,d=null;function p(x){let y=x.isScene===!0?x.background:null;if(y&&y.isTexture){const S=x.backgroundBlurriness>0;y=e.get(y,S)}return y}function u(x){let y=!1;const S=p(x);S===null?m(a,o):S&&S.isColor&&(m(S,1),y=!0);const T=i.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||y)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function _(x,y){const S=p(y);S&&S.isCubeTexture?(c===void 0&&(c=new zt(new zn(1,1,1),new fi({name:"BackgroundCubeMaterial",uniforms:zi(Mn.backgroundCube.uniforms),vertexShader:Mn.backgroundCube.vertexShader,fragmentShader:Mn.backgroundCube.fragmentShader,side:Jt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(T,w,v){this.matrixWorld.copyPosition(v.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=S,c.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(E0.makeRotationFromEuler(y.backgroundRotation)).transpose(),S.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Qc),c.material.toneMapped=rt.getTransfer(S.colorSpace)!==ut,(h!==S||f!==S.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=S,f=S.version,d=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)):S&&S.isTexture&&(l===void 0&&(l=new zt(new pr(2,2),new fi({name:"BackgroundMaterial",uniforms:zi(Mn.background.uniforms),vertexShader:Mn.background.vertexShader,fragmentShader:Mn.background.fragmentShader,side:hi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=S,l.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,l.material.toneMapped=rt.getTransfer(S.colorSpace)!==ut,S.matrixAutoUpdate===!0&&S.updateMatrix(),l.material.uniforms.uvTransform.value.copy(S.matrix),(h!==S||f!==S.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,h=S,f=S.version,d=i.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function m(x,y){x.getRGB(Xs,Yc(i)),t.buffers.color.setClear(Xs.r,Xs.g,Xs.b,y,r)}function g(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(x,y=1){a.set(x),o=y,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(x){o=x,m(a,o)},render:u,addToRenderList:_,dispose:g}}function w0(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,a=!1;function o(C,F,W,L,k){let X=!1;const z=f(C,L,W,F);r!==z&&(r=z,c(r.object)),X=p(C,L,W,k),X&&u(C,L,W,k),k!==null&&e.update(k,i.ELEMENT_ARRAY_BUFFER),(X||a)&&(a=!1,S(C,F,W,L),k!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function l(){return i.createVertexArray()}function c(C){return i.bindVertexArray(C)}function h(C){return i.deleteVertexArray(C)}function f(C,F,W,L){const k=L.wireframe===!0;let X=n[F.id];X===void 0&&(X={},n[F.id]=X);const z=C.isInstancedMesh===!0?C.id:0;let se=X[z];se===void 0&&(se={},X[z]=se);let $=se[W.id];$===void 0&&($={},se[W.id]=$);let ee=$[k];return ee===void 0&&(ee=d(l()),$[k]=ee),ee}function d(C){const F=[],W=[],L=[];for(let k=0;k<t;k++)F[k]=0,W[k]=0,L[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:W,attributeDivisors:L,object:C,attributes:{},index:null}}function p(C,F,W,L){const k=r.attributes,X=F.attributes;let z=0;const se=W.getAttributes();for(const $ in se)if(se[$].location>=0){const ie=k[$];let we=X[$];if(we===void 0&&($==="instanceMatrix"&&C.instanceMatrix&&(we=C.instanceMatrix),$==="instanceColor"&&C.instanceColor&&(we=C.instanceColor)),ie===void 0||ie.attribute!==we||we&&ie.data!==we.data)return!0;z++}return r.attributesNum!==z||r.index!==L}function u(C,F,W,L){const k={},X=F.attributes;let z=0;const se=W.getAttributes();for(const $ in se)if(se[$].location>=0){let ie=X[$];ie===void 0&&($==="instanceMatrix"&&C.instanceMatrix&&(ie=C.instanceMatrix),$==="instanceColor"&&C.instanceColor&&(ie=C.instanceColor));const we={};we.attribute=ie,ie&&ie.data&&(we.data=ie.data),k[$]=we,z++}r.attributes=k,r.attributesNum=z,r.index=L}function _(){const C=r.newAttributes;for(let F=0,W=C.length;F<W;F++)C[F]=0}function m(C){g(C,0)}function g(C,F){const W=r.newAttributes,L=r.enabledAttributes,k=r.attributeDivisors;W[C]=1,L[C]===0&&(i.enableVertexAttribArray(C),L[C]=1),k[C]!==F&&(i.vertexAttribDivisor(C,F),k[C]=F)}function x(){const C=r.newAttributes,F=r.enabledAttributes;for(let W=0,L=F.length;W<L;W++)F[W]!==C[W]&&(i.disableVertexAttribArray(W),F[W]=0)}function y(C,F,W,L,k,X,z){z===!0?i.vertexAttribIPointer(C,F,W,k,X):i.vertexAttribPointer(C,F,W,L,k,X)}function S(C,F,W,L){_();const k=L.attributes,X=W.getAttributes(),z=F.defaultAttributeValues;for(const se in X){const $=X[se];if($.location>=0){let ee=k[se];if(ee===void 0&&(se==="instanceMatrix"&&C.instanceMatrix&&(ee=C.instanceMatrix),se==="instanceColor"&&C.instanceColor&&(ee=C.instanceColor)),ee!==void 0){const ie=ee.normalized,we=ee.itemSize,Fe=e.get(ee);if(Fe===void 0)continue;const K=Fe.buffer,ge=Fe.type,Te=Fe.bytesPerElement,Ue=ge===i.INT||ge===i.UNSIGNED_INT||ee.gpuType===Qa;if(ee.isInterleavedBufferAttribute){const Me=ee.data,Oe=Me.isInterleavedBuffer===!0?Me.stride:Me.itemSize,dt=ee.offset;if(Me.isInstancedInterleavedBuffer||Me.isInstancedBufferAttribute){for(let ke=0;ke<$.locationSize;ke++)g($.location+ke,Me.meshPerAttribute);C.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=Me.meshPerAttribute*Me.count)}else for(let ke=0;ke<$.locationSize;ke++)m($.location+ke);i.bindBuffer(i.ARRAY_BUFFER,K);for(let ke=0;ke<$.locationSize;ke++)y($.location+ke,we/$.locationSize,ge,ie,Oe*Te,(dt+we/$.locationSize*ke)*Te,Ue)}else{if(ee.isInstancedBufferAttribute){for(let Me=0;Me<$.locationSize;Me++)g($.location+Me,ee.meshPerAttribute);C.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let Me=0;Me<$.locationSize;Me++)m($.location+Me);i.bindBuffer(i.ARRAY_BUFFER,K);for(let Me=0;Me<$.locationSize;Me++)y($.location+Me,we/$.locationSize,ge,ie,we*Te,we/$.locationSize*Me*Te,Ue)}}else if(z!==void 0){const ie=z[se];if(ie!==void 0)switch(ie.length){case 2:i.vertexAttrib2fv($.location,ie);break;case 3:i.vertexAttrib3fv($.location,ie);break;case 4:i.vertexAttrib4fv($.location,ie);break;default:i.vertexAttrib1fv($.location,ie)}}}}x()}function T(){P();for(const C in n){const F=n[C];for(const W in F){const L=F[W];for(const k in L){const X=L[k];for(const z in X)h(X[z].object),delete X[z];delete L[k]}}delete n[C]}}function w(C){if(n[C.id]===void 0)return;const F=n[C.id];for(const W in F){const L=F[W];for(const k in L){const X=L[k];for(const z in X)h(X[z].object),delete X[z];delete L[k]}}delete n[C.id]}function v(C){for(const F in n){const W=n[F];for(const L in W){const k=W[L];if(k[C.id]===void 0)continue;const X=k[C.id];for(const z in X)h(X[z].object),delete X[z];delete k[C.id]}}}function b(C){for(const F in n){const W=n[F],L=C.isInstancedMesh===!0?C.id:0,k=W[L];if(k!==void 0){for(const X in k){const z=k[X];for(const se in z)h(z[se].object),delete z[se];delete k[X]}delete W[L],Object.keys(W).length===0&&delete n[F]}}}function P(){R(),a=!0,r!==s&&(r=s,c(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:P,resetDefaultState:R,dispose:T,releaseStatesOfGeometry:w,releaseStatesOfObject:b,releaseStatesOfProgram:v,initAttributes:_,enableAttribute:m,disableUnusedAttributes:x}}function T0(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),t.update(c,n,h))}function o(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let d=0;for(let p=0;p<h;p++)d+=c[p];t.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function A0(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const v=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(v.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(v){return!(v!==En&&n.convert(v)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(v){const b=v===Tn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(v!==tn&&v!==yn&&!b&&n.convert(v)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(v){if(v==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";v="mediump"}return v==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(He("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),d=t.logarithmicDepthBuffer===!0&&f===!1;t.reversedDepthBuffer===!0&&f===!1&&He("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&f===!0&&He("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),u=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),y=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),w=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:u,maxTextureSize:_,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:x,maxVaryings:y,maxFragmentUniforms:S,maxSamples:T,samples:w}}function R0(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new $n,o=new Xe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,d){const p=f.length!==0||d||n!==0||s;return s=d,n=f.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,d){t=h(f,d,0)},this.setState=function(f,d,p){const u=f.clippingPlanes,_=f.clipIntersection,m=f.clipShadows,g=i.get(f);if(!s||u===null||u.length===0||r&&!m)r?h(null):c();else{const x=r?0:n,y=x*4;let S=g.clippingState||null;l.value=S,S=h(u,d,y,p);for(let T=0;T!==y;++T)S[T]=t[T];g.clippingState=S,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(f,d,p,u){const _=f!==null?f.length:0;let m=null;if(_!==0){if(m=l.value,u!==!0||m===null){const g=p+_*4,x=d.matrixWorldInverse;o.getNormalMatrix(x),(m===null||m.length<g)&&(m=new Float32Array(g));for(let y=0,S=p;y!==_;++y,S+=4)a.copy(f[y]).applyMatrix4(x,o),a.normal.toArray(m,S),m[S+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}class _o extends bn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Fc(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new zn(5,5,5),r=new fi({name:"CubemapFromEquirect",uniforms:zi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Jt,blending:Di});r.uniforms.tEquirect.value=t;const a=new zt(s,r),o=t.minFilter;return t.minFilter===Zn&&(t.minFilter=Zt),new Ya(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}const yl=256,C0=3,P0=20,jc=256,eh=16,L0=3,D0=new O,I0=new Ve;class cr{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Ya(1,10,null),this._boxMesh=new zt(new zn(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){const{size:a=256,position:o=D0}=r,l=this._renderer;this._setSize(a);const c=this._allocateTarget(),h=this._getSourceTarget(!0);t>0&&(h.texture.mipmapsAutoUpdate=!1);const f=l.autoClear,d=l.autoClearColor,p=l.autoClearDepth,u=l.autoClearStencil,_=e.background;l.autoClear=!0,l.autoClearColor=!0,l.autoClearDepth=!0,l.autoClearStencil=!0,_===null&&(e.background=l.getClearColor(I0));const m=new Ya(n,s,h);return m.position.copy(o),m.update(l,e),l.autoClear=f,l.autoClearColor=d,l.autoClearDepth=p,l.autoClearStencil=u,e.background=_,t>0&&(h.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=wl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=bl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(yl,Ac(e))}_fromTexture(e,t){e.mapping===Ui||e.mapping===ls?this._setSize(e.image.length===0?yl:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);const n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){const e=this._cubeSize,t=El(e,!1,!1),n=Math.log2(e)-C0;for(let s=0;s<=n;s++)t.texture.mipmaps.push({width:e>>s,height:e>>s});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){const t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=El(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){const s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=e,r.activeMipmapLevel=t;const a=e.width>>t;e.viewport.set(0,0,a,a),r.update(this._renderer,s),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===Ui||e.mapping===ls?(this._cubemapMaterial===null&&(this._cubemapMaterial=wl()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=bl()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=N0(),this._integrationMaterial=U0());const t=this._cubeSize,n=e.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;const r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/eh);for(let a=0;a<=n;a++){const o=cr.lodToRoughness(a,n);if(a>n-L0)r.roughness.value=o,this._renderCube(e,a,this._integrationMaterial);else{const l=o>0?Math.log2(t)+.5*Math.log2(6/(jc*Math.pow(o,4)))+.5:0;s.roughness.value=o,s.lodBias.value=l,this._renderCube(e,a,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=F0());const n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(e,0,n),s.envMap.value=e.texture,this._renderCube(r,0,n)}}function El(i,e,t){return new _o(i,{minFilter:Zn,generateMipmaps:e,type:Tn,colorSpace:ar,depthBuffer:t})}function vs(i,e,t){return new fi({name:i,uniforms:e,vertexShader:je.cube_vert,fragmentShader:t,side:Jt,blending:Di,depthTest:!1,depthWrite:!1})}function N0(){return vs("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${jc}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function U0(){return vs("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:eh}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function F0(){return vs("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${P0}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function bl(){return vs("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function wl(){return vs("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function O0(i){let e=new WeakMap,t=new WeakMap,n=null;function s(d,p=!1){return d==null?null:p?a(d):r(d)}function r(d){if(d&&d.isTexture){const p=d.mapping;if(p===Mr||p===Sr)if(e.has(d)){const u=e.get(d).texture;return o(u,d.mapping)}else{const u=d.image;if(u&&u.height>0){const _=new _o(u.height);return _.fromEquirectangularTexture(i,d),e.set(d,_),d.addEventListener("dispose",c),o(_.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture&&d.isPMREMTexture!==!0){const p=d.mapping,u=p===Mr||p===Sr,_=p===Ui||p===ls;if(u||_){let m=t.get(d);const g=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==g)return n===null&&(n=new cr(i)),m=u?n.fromEquirectangular(d,m):n.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),m.texture;if(m!==void 0)return m.texture;{const x=d.image;return u&&x&&x.height>0||_&&x&&l(x)?(n===null&&(n=new cr(i)),m=u?n.fromEquirectangular(d):n.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),d.addEventListener("dispose",h),m.texture):null}}}return d}function o(d,p){return p===Mr?d.mapping=Ui:p===Sr&&(d.mapping=ls),d}function l(d){let p=0;const u=6;for(let _=0;_<u;_++)d[_]!==void 0&&p++;return p===u}function c(d){const p=d.target;p.removeEventListener("dispose",c);const u=e.get(p);u!==void 0&&(e.delete(p),u.dispose())}function h(d){const p=d.target;p.removeEventListener("dispose",h);const u=t.get(p);u!==void 0&&(t.delete(p),u.dispose())}function f(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function B0(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&tr("WebGLRenderer: "+n+" extension not supported."),s}}}function z0(i,e,t,n){const s={},r=new WeakMap,a=new FinalizationRegistry(u=>delete s[u]);function o(u){l(u.target)}function l(u){u.index!==null&&e.remove(u.index);for(const m in u.attributes)e.remove(u.attributes[m]);u.removeEventListener("dispose",o),delete s[u.id],a.unregister(u);const _=r.get(u);_&&(e.remove(_),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function c(u,_){return s[_.id]!==void 0||(_.addEventListener("dispose",o),s[_.id]=new WeakRef(_),a.register(_,_.id,_),t.memory.geometries++),_}function h(u){const _=u.attributes;for(const m in _)e.update(_[m],i.ARRAY_BUFFER)}function f(u){const _=u.index,m=u.attributes.position;let g=0;if(m===void 0)return;const x=_!==null?_.array.length:m.array.length/3-1,y=m.count>=65535?Uc:Nc,S=new y(Math.ceil(x/3)*6,1),T=S.array;if(_!==null){const v=_.array;g=_.version;for(let b=0,P=0;b<x;b+=3){const R=v[b+0],C=v[b+1],F=v[b+2];T[P++]=R,T[P++]=C,T[P++]=C,T[P++]=F,T[P++]=F,T[P++]=R}}else{g=m.version;for(let v=0,b=0;v<x;v+=3){const P=v+0,R=v+1,C=v+2;T[b++]=P,T[b++]=R,T[b++]=R,T[b++]=C,T[b++]=C,T[b++]=P}}S.version=g;const w=r.get(u);w&&e.remove(w),r.set(u,S)}function d(u){const _=r.get(u);if(_){const m=u.index;m!==null&&_.version<m.version&&f(u)}else f(u);return r.get(u)}function p(){for(const u in s){const _=s[u].deref();_!==void 0&&l(_)}}return{get:c,update:h,getWireframeAttribute:d,dispose:p}}function k0(i,e,t){let n;function s(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,d){i.drawElements(n,d,r,f*a),t.update(d,n,1)}function c(f,d,p){p!==0&&(i.drawElementsInstanced(n,d,r,f*a,p),t.update(d,n,p))}function h(f,d,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,f,0,p);let _=0;for(let m=0;m<p;m++)_+=d[m];t.update(_,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function G0(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:ot("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function H0(i,e,t){const n=new WeakMap,s=new yt;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=h!==void 0?h.length:0;let d=n.get(o);if(d===void 0||d.count!==f){let P=function(){v.dispose(),n.delete(o),o.removeEventListener("dispose",P)};d!==void 0&&d.texture.dispose();const p=o.morphAttributes.position!==void 0,u=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],x=o.morphAttributes.color||[];let y=0;p===!0&&(y=1),u===!0&&(y=2),_===!0&&(y=3);let S=o.attributes.position.count*y,T=1;S>e.maxTextureSize&&(T=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);const w=new Float32Array(S*T*4*f),v=new Lc(w,S,T,f);v.type=yn,v.needsUpdate=!0;const b=y*4;for(let R=0;R<f;R++){const C=m[R],F=g[R],W=x[R],L=S*T*4*R;for(let k=0;k<C.count;k++){const X=k*b;p===!0&&(s.fromBufferAttribute(C,k),w[L+X+0]=s.x,w[L+X+1]=s.y,w[L+X+2]=s.z,w[L+X+3]=0),u===!0&&(s.fromBufferAttribute(F,k),w[L+X+4]=s.x,w[L+X+5]=s.y,w[L+X+6]=s.z,w[L+X+7]=0),_===!0&&(s.fromBufferAttribute(W,k),w[L+X+8]=s.x,w[L+X+9]=s.y,w[L+X+10]=s.z,w[L+X+11]=W.itemSize===4?s.w:1)}}d={count:f,texture:v,size:new Se(S,T)},n.set(o,d),o.addEventListener("dispose",P)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let p=0;for(let _=0;_<c.length;_++)p+=c[_];const u=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",u),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function V0(i,e,t,n,s){let r=new WeakMap;function a(c){const h=s.render.frame,f=c.geometry,d=e.get(c,f);if(r.get(d)!==h&&(e.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){const p=c.skeleton;r.get(p)!==h&&(p.update(),r.set(p,h))}return d}function o(){r=new WeakMap}function l(c){const h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}const W0={[cc]:"LINEAR_TONE_MAPPING",[hc]:"REINHARD_TONE_MAPPING",[uc]:"CINEON_TONE_MAPPING",[Ja]:"ACES_FILMIC_TONE_MAPPING",[fc]:"AGX_TONE_MAPPING",[pc]:"NEUTRAL_TONE_MAPPING",[dc]:"CUSTOM_TONE_MAPPING"};function X0(i,e,t,n,s,r){const a=new bn(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let o=null,l=null,c=null;const h=new qt;h.setAttribute("position",new bt([-1,3,0,-1,-1,0,3,-1,0],3)),h.setAttribute("uv",new bt([0,2,0,0,2,0],2));const f=new Id({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new zt(h,f),p=new Zc(-1,1,1,-1,0,1);let u=null,_=null,m=!1,g,x=null,y=[],S=!1;this.setSize=function(T,w){a.setSize(T,w),o!==null&&o.setSize(T,w),l!==null&&l.setSize(T,w);for(let v=0;v<y.length;v++){const b=y[v];b.setSize&&b.setSize(T,w)}},this.setEffects=function(T){y=T,S=y.length>0&&y[0].isRenderPass===!0;const w=a.width,v=a.height;y.length>0&&o===null&&(o=new bn(w,v,{type:Tn,depthBuffer:!1,stencilBuffer:!1}),l=new bn(w,v,{type:Tn,depthBuffer:!1,stencilBuffer:!1}));const b=s===!0&&y.some(P=>P.needsDepthTexture===!0);b!==(a.depthTexture!==null)&&(b===!0&&c===null&&(c=new Oi(w,v),r===!0&&(c.format=Jn,c.type=Fi)),a.dispose(),a.depthTexture=b?c:null,a.resolveDepthBuffer=b,a.storeMultisampledDepthBuffer=b);for(let P=0;P<y.length;P++){const R=y[P];R.setSize&&R.setSize(w,v),b&&R.needsDepthTexture===!0&&R.setDepthTexture&&R.setDepthTexture(c)}},this.begin=function(T,w){if(m||T.toneMapping===On&&y.length===0)return!1;if(x=w,w!==null){const v=w.width,b=w.height;(a.width!==v||a.height!==b)&&this.setSize(v,b)}return S===!1&&T.setRenderTarget(a),g=T.toneMapping,T.toneMapping=On,!0},this.hasRenderPass=function(){return S},this.end=function(T,w){T.toneMapping=g,m=!0;let v=a,b=o;for(let P=0;P<y.length;P++){const R=y[P];R.enabled!==!1&&(R.render(T,b,v,w),R.needsSwap!==!1&&(v=b,b=b===o?l:o))}if(u!==T.outputColorSpace||_!==T.toneMapping){u=T.outputColorSpace,_=T.toneMapping,f.defines={},rt.getTransfer(u)===ut&&(f.defines.SRGB_TRANSFER="");const P=W0[_];P&&(f.defines[P]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=v.texture,T.setRenderTarget(x),T.render(d,p),x=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),h.dispose(),f.dispose()}}const th=new Kt,nh=new Oi(1,1),ih=new Oc(1),sh=new Lc,rh=new Pu,ah=new Fc,Tl=[],Al=[],Rl=new Float32Array(16),Cl=new Float32Array(9),Pl=new Float32Array(4);function Hi(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=Tl[s];if(r===void 0&&(r=new Float32Array(s),Tl[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Pt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Lt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function mr(i,e){let t=Al[e];t===void 0&&(t=new Int32Array(e),Al[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function q0(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Y0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;i.uniform2fv(this.addr,e),Lt(t,e)}}function $0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Pt(t,e))return;i.uniform3fv(this.addr,e),Lt(t,e)}}function K0(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;i.uniform4fv(this.addr,e),Lt(t,e)}}function Z0(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Lt(t,e)}else{if(Pt(t,n))return;Pl.set(n),i.uniformMatrix2fv(this.addr,!1,Pl),Lt(t,n)}}function J0(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Lt(t,e)}else{if(Pt(t,n))return;Cl.set(n),i.uniformMatrix3fv(this.addr,!1,Cl),Lt(t,n)}}function Q0(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Pt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Lt(t,e)}else{if(Pt(t,n))return;Rl.set(n),i.uniformMatrix4fv(this.addr,!1,Rl),Lt(t,n)}}function j0(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function em(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;i.uniform2iv(this.addr,e),Lt(t,e)}}function tm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Pt(t,e))return;i.uniform3iv(this.addr,e),Lt(t,e)}}function nm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;i.uniform4iv(this.addr,e),Lt(t,e)}}function im(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function sm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Pt(t,e))return;i.uniform2uiv(this.addr,e),Lt(t,e)}}function rm(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Pt(t,e))return;i.uniform3uiv(this.addr,e),Lt(t,e)}}function am(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Pt(t,e))return;i.uniform4uiv(this.addr,e),Lt(t,e)}}function gr(i){return i.version===0&&(i.compareFunction=wc,i.needsUpdate=!0),i}function om(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=gr(nh):r=th,t.setTexture2D(e||r,s)}function lm(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||rh,s)}function cm(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=gr(ih):r=ah,t.setTextureCube(e||r,s)}function hm(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||sh,s)}function um(i){switch(i){case 5126:return q0;case 35664:return Y0;case 35665:return $0;case 35666:return K0;case 35674:return Z0;case 35675:return J0;case 35676:return Q0;case 5124:case 35670:return j0;case 35667:case 35671:return em;case 35668:case 35672:return tm;case 35669:case 35673:return nm;case 5125:return im;case 36294:return sm;case 36295:return rm;case 36296:return am;case 35678:case 36198:case 36298:case 36306:case 35682:return om;case 35679:case 36299:case 36307:return lm;case 35680:case 36300:case 36308:case 36293:return cm;case 36289:case 36303:case 36311:case 36292:return hm}}function dm(i,e){i.uniform1fv(this.addr,e)}function fm(i,e){const t=Hi(e,this.size,2);i.uniform2fv(this.addr,t)}function pm(i,e){const t=Hi(e,this.size,3);i.uniform3fv(this.addr,t)}function mm(i,e){const t=Hi(e,this.size,4);i.uniform4fv(this.addr,t)}function gm(i,e){const t=Hi(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function _m(i,e){const t=Hi(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function vm(i,e){const t=Hi(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function xm(i,e){i.uniform1iv(this.addr,e)}function Mm(i,e){i.uniform2iv(this.addr,e)}function Sm(i,e){i.uniform3iv(this.addr,e)}function ym(i,e){i.uniform4iv(this.addr,e)}function Em(i,e){i.uniform1uiv(this.addr,e)}function bm(i,e){i.uniform2uiv(this.addr,e)}function wm(i,e){i.uniform3uiv(this.addr,e)}function Tm(i,e){i.uniform4uiv(this.addr,e)}function Am(i,e,t){const n=this.cache,s=e.length,r=mr(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=gr(nh):a=th;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function Rm(i,e,t){const n=this.cache,s=e.length,r=mr(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||rh,r[a])}function Cm(i,e,t){const n=this.cache,s=e.length,r=mr(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));let a;this.type===i.SAMPLER_CUBE_SHADOW?a=gr(ih):a=ah;for(let o=0;o!==s;++o)t.setTextureCube(e[o]||a,r[o])}function Pm(i,e,t){const n=this.cache,s=e.length,r=mr(t,s);Pt(n,r)||(i.uniform1iv(this.addr,r),Lt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||sh,r[a])}function Lm(i){switch(i){case 5126:return dm;case 35664:return fm;case 35665:return pm;case 35666:return mm;case 35674:return gm;case 35675:return _m;case 35676:return vm;case 5124:case 35670:return xm;case 35667:case 35671:return Mm;case 35668:case 35672:return Sm;case 35669:case 35673:return ym;case 5125:return Em;case 36294:return bm;case 36295:return wm;case 36296:return Tm;case 35678:case 36198:case 36298:case 36306:case 35682:return Am;case 35679:case 36299:case 36307:return Rm;case 35680:case 36300:case 36308:case 36293:return Cm;case 36289:case 36303:case 36311:case 36292:return Pm}}class Dm{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=um(t.type)}}class Im{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Lm(t.type)}}class Nm{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const $r=/(\w+)(\])?(\[|\.)?/g;function Ll(i,e){i.seq.push(e),i.map[e.id]=e}function Um(i,e,t){const n=i.name,s=n.length;for($r.lastIndex=0;;){const r=$r.exec(n),a=$r.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Ll(t,c===void 0?new Dm(o,i,e):new Im(o,i,e));break}else{let f=t.map[o];f===void 0&&(f=new Nm(o),Ll(t,f)),t=f}}}class nr{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){const o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);Um(o,l,this)}const s=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function Dl(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Fm=37297;let Om=0;function Bm(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const Il=new Xe;function zm(i){rt._getMatrix(Il,rt.workingColorSpace,i);const e=`mat3( ${Il.elements.map(t=>t.toFixed(4))} )`;switch(rt.getTransfer(i)){case or:return[e,"LinearTransferOETF"];case ut:return[e,"sRGBTransferOETF"];default:return He("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Nl(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+Bm(i.getShaderSource(e),o)}else return r}function km(i,e){const t=zm(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const Gm={[cc]:"Linear",[hc]:"Reinhard",[uc]:"Cineon",[Ja]:"ACESFilmic",[fc]:"AgX",[pc]:"Neutral",[dc]:"Custom"};function Hm(i,e){const t=Gm[e];return t===void 0?(He("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const qs=new O;function Vm(){rt.getLuminanceCoefficients(qs);const i=qs.x.toFixed(4),e=qs.y.toFixed(4),t=qs.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Wm(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ji).join(`
`)}function Xm(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function qm(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function ji(i){return i!==""}function Ul(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function Fl(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Ym=/^[ \t]*#include +<([\w\d./]+)>/gm;function $a(i){return i.replace(Ym,$m)}function $m(i,e){const t=je[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return $a(t)}const Km=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ol(i){return i.replace(Km,Zm)}function Zm(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Bl(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const Jm={[Zs]:"SHADOWMAP_TYPE_PCF",[Ji]:"SHADOWMAP_TYPE_VSM"};function Qm(i){return Jm[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const jm={[ls]:"ENVMAP_MODE_REFRACTION"};function eg(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":jm[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const tg={[lc]:"ENVMAP_BLENDING_MULTIPLY",[$h]:"ENVMAP_BLENDING_MIX",[Kh]:"ENVMAP_BLENDING_ADD"};function ng(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":tg[i.combine]||"ENVMAP_BLENDING_NONE"}function ig(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=Qm(t),c=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",h=eg(t),f=ng(t),d=Wm(t),p=Xm(r),u=s.createProgram();let _,m,g=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(ji).join(`
`),_.length>0&&(_+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter(ji).join(`
`),m.length>0&&(m+=`
`)):(_=[Bl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ji).join(`
`),m=[Bl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+f:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==On?"#define TONE_MAPPING":"",t.toneMapping!==On?je.tonemapping_pars_fragment:"",t.toneMapping!==On?Hm("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",je.colorspace_pars_fragment,km("linearToOutputTexel",t.outputColorSpace),Vm(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ji).join(`
`)),a=$a(a),a=Ul(a,t),a=Fl(a,t),o=$a(o),o=Ul(o,t),o=Fl(o,t),a=Ol(a),o=Ol(o),t.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,_=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,m=["#define varying in",t.glslVersion===Xo?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Xo?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const x=g+_+a,y=g+m+o,S=Dl(s,s.VERTEX_SHADER,x),T=Dl(s,s.FRAGMENT_SHADER,y);s.attachShader(u,S),s.attachShader(u,T),t.index0AttributeName!==void 0?s.bindAttribLocation(u,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(u,0,"position"),s.linkProgram(u);function w(R){if(i.debug.checkShaderErrors){const C=s.getProgramInfoLog(u)||"",F=s.getShaderInfoLog(S)||"",W=s.getShaderInfoLog(T)||"",L=C.trim(),k=F.trim(),X=W.trim();let z=!0,se=!0;if(s.getProgramParameter(u,s.LINK_STATUS)===!1)if(z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,u,S,T);else{const $=Nl(s,S,"vertex"),ee=Nl(s,T,"fragment");ot("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(u,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+L+`
`+$+`
`+ee)}else L!==""?He("WebGLProgram: Program Info Log:",L):(k===""||X==="")&&(se=!1);se&&(R.diagnostics={runnable:z,programLog:L,vertexShader:{log:k,prefix:_},fragmentShader:{log:X,prefix:m}})}s.deleteShader(S),s.deleteShader(T),v=new nr(s,u),b=qm(s,u)}let v;this.getUniforms=function(){return v===void 0&&w(this),v};let b;this.getAttributes=function(){return b===void 0&&w(this),b};let P=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(u,Fm)),P},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(u),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Om++,this.cacheKey=e,this.usedTimes=1,this.program=u,this.vertexShader=S,this.fragmentShader=T,this}let sg=0;class rg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new ag(e),t.set(e,n)),n}}class ag{constructor(e){this.id=sg++,this.code=e,this.usedTimes=0}}function og(i){return i===ui||i===sr||i===rr}function lg(i,e,t,n,s,r){const a=new Dc,o=new rg,l=new Set,c=[],h=new Map,f=n.logarithmicDepthBuffer,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(v){return l.add(v),v===0?"uv":`uv${v}`}function u(v,b,P,R,C,F){const W=R.fog,L=C.geometry,k=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?R.environment:null,X=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,z=e.get(v.envMap||k,X),se=d[v.type];let $=n.precision;v.precision!==null&&($=n.getMaxPrecision(v.precision),$!==v.precision&&He("WebGLProgram.getParameters:",v.precision,"not supported, using",$,"instead."));const ee=L.morphAttributes.position||L.morphAttributes.normal||L.morphAttributes.color,ie=ee!==void 0?ee.length:0;let we=0;L.morphAttributes.position!==void 0&&(we=1),L.morphAttributes.normal!==void 0&&(we=2),L.morphAttributes.color!==void 0&&(we=3);let Fe,K,ge,Te;if(se){const ye=Mn[se];Fe=ye.vertexShader,K=ye.fragmentShader}else{Fe=v.vertexShader,K=v.fragmentShader;const ye=o.getVertexShaderStage(v),ht=o.getFragmentShaderStage(v);o.update(v,ye,ht),ge=ye.id,Te=ht.id}const Ue=i.getRenderTarget(),Me=i.state.buffers.depth.getReversed(),Oe=C.isInstancedMesh===!0,dt=C.isBatchedMesh===!0,ke=!!v.map,Ye=!!v.matcap,Ke=!!z,te=Ke&&z.isPMREMTexture===!0,he=!!v.aoMap,q=!!v.lightMap,ae=!!v.bumpMap&&v.wireframe===!1,re=!!v.normalMap,Be=!!v.displacementMap,Ae=!!v.emissiveMap,$e=!!v.metalnessMap,Je=!!v.roughnessMap,et=v.anisotropy>0,U=v.clearcoat>0,xt=v.diffuseRoughness>0,tt=v.dispersion>0,ft=v.retroreflectivity>0,_e=v.iridescence>0,wt=v.sheen>0,Ge=v.transmission>0,We=et&&!!v.anisotropyMap,A=U&&!!v.clearcoatMap,M=U&&!!v.clearcoatNormalMap,H=U&&!!v.clearcoatRoughnessMap,oe=xt&&!!v.diffuseRoughnessMap,ne=_e&&!!v.iridescenceMap,ue=_e&&!!v.iridescenceThicknessMap,ve=wt&&!!v.sheenColorMap,J=wt&&!!v.sheenRoughnessMap,Q=!!v.specularMap,fe=!!v.specularColorMap,I=!!v.specularIntensityMap,j=Ge&&!!v.transmissionMap,Z=Ge&&!!v.thicknessMap,pe=!!v.gradientMap,ce=!!v.alphaMap,de=v.alphaTest>0,Ne=!!v.alphaHash,Qe=!!v.extensions;let le=On;v.toneMapped&&(Ue===null||Ue.isXRRenderTarget===!0)&&(le=i.toneMapping);const ze=te?z.isCompressedCubeTexture?z.image[0].mipmaps:z.mipmaps:null,Ze={shaderID:se,shaderType:v.type,shaderName:v.name,vertexShader:Fe,fragmentShader:K,defines:v.defines,customVertexShaderID:ge,customFragmentShaderID:Te,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:$,batching:dt,batchingColor:dt&&C._colorsTexture!==null,instancing:Oe,instancingColor:Oe&&C.instanceColor!==null,instancingMorph:Oe&&C.morphTexture!==null,outputColorSpace:Ue===null?i.outputColorSpace:Ue.isXRRenderTarget===!0?Ue.texture.colorSpace:rt.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:ke,matcap:Ye,envMap:Ke,envMapMode:Ke&&z.mapping,envMapPMREM:te,envMapMaxLod:te?ze.length-1:null,envMapSize:te?ze[0].width:null,aoMap:he,lightMap:q,bumpMap:ae,normalMap:re,displacementMap:Be,emissiveMap:Ae,normalMapObjectSpace:re&&v.normalMapType===Qh,normalMapTangentSpace:re&&v.normalMapType===Ha,packedNormalMap:re&&v.normalMapType===Ha&&og(v.normalMap.format),metalnessMap:$e,roughnessMap:Je,anisotropy:et,anisotropyMap:We,clearcoat:U,clearcoatMap:A,clearcoatNormalMap:M,clearcoatRoughnessMap:H,diffuseRoughness:xt,diffuseRoughnessMap:oe,dispersion:tt,retroreflection:ft,iridescence:_e,iridescenceMap:ne,iridescenceThicknessMap:ue,sheen:wt,sheenColorMap:ve,sheenRoughnessMap:J,specularMap:Q,specularColorMap:fe,specularIntensityMap:I,transmission:Ge,transmissionMap:j,thicknessMap:Z,gradientMap:pe,opaque:v.transparent===!1&&v.blending===ts&&v.alphaToCoverage===!1,alphaMap:ce,alphaTest:de,alphaHash:Ne,combine:v.combine,mapUv:ke&&p(v.map.channel),aoMapUv:he&&p(v.aoMap.channel),lightMapUv:q&&p(v.lightMap.channel),bumpMapUv:ae&&p(v.bumpMap.channel),normalMapUv:re&&p(v.normalMap.channel),displacementMapUv:Be&&p(v.displacementMap.channel),emissiveMapUv:Ae&&p(v.emissiveMap.channel),metalnessMapUv:$e&&p(v.metalnessMap.channel),roughnessMapUv:Je&&p(v.roughnessMap.channel),anisotropyMapUv:We&&p(v.anisotropyMap.channel),clearcoatMapUv:A&&p(v.clearcoatMap.channel),clearcoatNormalMapUv:M&&p(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:H&&p(v.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:oe&&p(v.diffuseRoughnessMap.channel),iridescenceMapUv:ne&&p(v.iridescenceMap.channel),iridescenceThicknessMapUv:ue&&p(v.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&p(v.sheenColorMap.channel),sheenRoughnessMapUv:J&&p(v.sheenRoughnessMap.channel),specularMapUv:Q&&p(v.specularMap.channel),specularColorMapUv:fe&&p(v.specularColorMap.channel),specularIntensityMapUv:I&&p(v.specularIntensityMap.channel),transmissionMapUv:j&&p(v.transmissionMap.channel),thicknessMapUv:Z&&p(v.thicknessMap.channel),alphaMapUv:ce&&p(v.alphaMap.channel),vertexTangents:!!L.attributes.tangent&&(re||et),vertexNormals:!!L.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!L.attributes.color&&L.attributes.color.itemSize===4,pointsUvs:C.isPoints===!0&&!!L.attributes.uv&&(ke||ce),fog:!!W,useFog:v.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||L.attributes.normal===void 0&&re===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:Me,skinning:C.isSkinnedMesh===!0,hasPositionAttribute:L.attributes.position!==void 0,morphTargets:L.morphAttributes.position!==void 0,morphNormals:L.morphAttributes.normal!==void 0,morphColors:L.morphAttributes.color!==void 0,morphTargetsCount:ie,morphTextureStride:we,numSunLights:b.sun.length,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numSunLightShadows:b.sunShadowMap.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numLightProbeGrids:F.filter(ye=>ye.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:le,decodeVideoTexture:ke&&v.map.isVideoTexture===!0&&rt.getTransfer(v.map.colorSpace)===ut,decodeVideoTextureEmissive:Ae&&v.emissiveMap.isVideoTexture===!0&&rt.getTransfer(v.emissiveMap.colorSpace)===ut,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Sn,flipSided:v.side===Jt,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:Qe&&v.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Qe&&v.extensions.multiDraw===!0||dt)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Ze.vertexUv1s=l.has(1),Ze.vertexUv2s=l.has(2),Ze.vertexUv3s=l.has(3),l.clear(),Ze}function _(v){const b=[];if(v.shaderID?b.push(v.shaderID):(b.push(v.customVertexShaderID),b.push(v.customFragmentShaderID)),v.defines!==void 0)for(const P in v.defines)b.push(P),b.push(v.defines[P]);return v.isRawShaderMaterial===!1&&(m(b,v),g(b,v),b.push(i.outputColorSpace)),b.push(v.customProgramCacheKey),b.join()}function m(v,b){v.push(b.precision),v.push(b.outputColorSpace),v.push(b.envMapMode),v.push(b.envMapPMREM),v.push(b.envMapMaxLod),v.push(b.envMapSize),v.push(b.mapUv),v.push(b.alphaMapUv),v.push(b.lightMapUv),v.push(b.aoMapUv),v.push(b.bumpMapUv),v.push(b.normalMapUv),v.push(b.displacementMapUv),v.push(b.emissiveMapUv),v.push(b.metalnessMapUv),v.push(b.roughnessMapUv),v.push(b.anisotropyMapUv),v.push(b.clearcoatMapUv),v.push(b.clearcoatNormalMapUv),v.push(b.clearcoatRoughnessMapUv),v.push(b.diffuseRoughnessMapUv),v.push(b.iridescenceMapUv),v.push(b.iridescenceThicknessMapUv),v.push(b.sheenColorMapUv),v.push(b.sheenRoughnessMapUv),v.push(b.specularMapUv),v.push(b.specularColorMapUv),v.push(b.specularIntensityMapUv),v.push(b.transmissionMapUv),v.push(b.thicknessMapUv),v.push(b.combine),v.push(b.fogExp2),v.push(b.sizeAttenuation),v.push(b.morphTargetsCount),v.push(b.numSunLights),v.push(b.numDirLights),v.push(b.numPointLights),v.push(b.numSpotLights),v.push(b.numSpotLightMaps),v.push(b.numHemiLights),v.push(b.numRectAreaLights),v.push(b.numSunLightShadows),v.push(b.numDirLightShadows),v.push(b.numPointLightShadows),v.push(b.numSpotLightShadows),v.push(b.numSpotLightShadowsWithMaps),v.push(b.numLightProbes),v.push(b.numLightProbeGrids),v.push(b.shadowMapType),v.push(b.toneMapping),v.push(b.numClippingPlanes),v.push(b.numClipIntersection),v.push(b.depthPacking)}function g(v,b){a.disableAll(),b.instancing&&a.enable(0),b.instancingColor&&a.enable(1),b.instancingMorph&&a.enable(2),b.matcap&&a.enable(3),b.envMap&&a.enable(4),b.normalMapObjectSpace&&a.enable(5),b.normalMapTangentSpace&&a.enable(6),b.clearcoat&&a.enable(7),b.iridescence&&a.enable(8),b.alphaTest&&a.enable(9),b.vertexColors&&a.enable(10),b.vertexAlphas&&a.enable(11),b.vertexUv1s&&a.enable(12),b.vertexUv2s&&a.enable(13),b.vertexUv3s&&a.enable(14),b.vertexTangents&&a.enable(15),b.anisotropy&&a.enable(16),b.alphaHash&&a.enable(17),b.batching&&a.enable(18),b.dispersion&&a.enable(19),b.retroreflection&&a.enable(24),b.diffuseRoughness&&a.enable(25),b.batchingColor&&a.enable(20),b.gradientMap&&a.enable(21),b.packedNormalMap&&a.enable(22),b.vertexNormals&&a.enable(23),v.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reversedDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.decodeVideoTextureEmissive&&a.enable(20),b.alphaToCoverage&&a.enable(21),b.numLightProbeGrids>0&&a.enable(22),b.hasPositionAttribute&&a.enable(23),v.push(a.mask)}function x(v){const b=d[v.type];let P;if(b){const R=Mn[b];P=Pd.clone(R.uniforms)}else P=v.uniforms;return P}function y(v,b){let P=h.get(b);return P!==void 0?++P.usedTimes:(P=new ig(i,b,v,s),c.push(P),h.set(b,P)),P}function S(v){if(--v.usedTimes===0){const b=c.indexOf(v);c[b]=c[c.length-1],c.pop(),h.delete(v.cacheKey),v.destroy()}}function T(v){o.remove(v)}function w(){o.dispose()}return{getParameters:u,getProgramCacheKey:_,getUniforms:x,acquireProgram:y,releaseProgram:S,releaseShaderCache:T,programs:c,dispose:w}}function cg(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function hg(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function zl(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function kl(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(d){let p=0;return d.isInstancedMesh&&(p+=2),d.isSkinnedMesh&&(p+=1),p}function o(d,p,u,_,m,g){let x=i[e];return x===void 0?(x={id:d.id,object:d,geometry:p,material:u,materialVariant:a(d),groupOrder:_,renderOrder:d.renderOrder,z:m,group:g},i[e]=x):(x.id=d.id,x.object=d,x.geometry=p,x.material=u,x.materialVariant=a(d),x.groupOrder=_,x.renderOrder=d.renderOrder,x.z=m,x.group=g),e++,x}function l(d,p,u,_,m,g,x){x.reversedDepth===!0&&(m=-m);const y=o(d,p,u,_,m,g);u.transmission>0?n.push(y):u.transparent===!0?s.push(y):t.push(y)}function c(d,p,u,_,m,g){const x=o(d,p,u,_,m,g);u.transmission>0?n.unshift(x):u.transparent===!0?s.unshift(x):t.unshift(x)}function h(d,p){t.length>1&&t.sort(d||hg),n.length>1&&n.sort(p||zl),s.length>1&&s.sort(p||zl)}function f(){for(let d=e,p=i.length;d<p;d++){const u=i[d];if(u.id===null)break;u.id=null,u.object=null,u.geometry=null,u.material=null,u.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:f,sort:h}}function ug(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new kl,i.set(n,[a])):s>=r.length?(a=new kl,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function dg(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new O,color:new Ve};break;case"SpotLight":t={position:new O,direction:new O,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new O,color:new Ve,distance:0,decay:0};break;case"HemisphereLight":t={direction:new O,skyColor:new Ve,groundColor:new Ve};break;case"RectAreaLight":t={color:new Ve,position:new O,halfWidth:new O,halfHeight:new O};break}return i[e.id]=t,t}}}function fg(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Se};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Se};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Se,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let pg=0;function mg(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function gg(i){const e=new dg,t=fg(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new O);const s=new O,r=new _t,a=new _t;function o(c){let h=0,f=0,d=0;for(let F=0;F<9;F++)n.probe[F].set(0,0,0);let p=0,u=0,_=0,m=0,g=0,x=0,y=0,S=0,T=0,w=0,v=0,b=0,P=0,R=0;c.sort(mg);for(let F=0,W=c.length;F<W;F++){const L=c[F],k=L.color,X=L.intensity,z=L.distance;let se=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===ui?se=L.shadow.map.texture:se=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)h+=k.r*X,f+=k.g*X,d+=k.b*X;else if(L.isLightProbe){for(let $=0;$<9;$++)n.probe[$].addScaledVector(L.sh.coefficients[$],X);R++}else if(L.isSunLight){const $=e.get(L);if($.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const ee=L.shadow,ie=t.get(L);ie.shadowIntensity=ee.intensity,ie.shadowBias=ee.bias,ie.shadowNormalBias=ee.normalBias,ie.shadowRadius=ee.radius,ie.shadowMapSize.copy(ee.mapSize).multiply(ee.getFrameExtents()),n.sunShadow[u]=ie,n.sunShadowMap[u]=se;const we=ee.getViewportCount();for(let Fe=0;Fe<we;Fe++)n.sunShadowMatrix[_+Fe]=ee.getMatrix(Fe),n.sunShadowCascade[_+Fe]=ee._cascadeData[Fe];_+=we,u++}n.sun[p]=$,p++}else if(L.isDirectionalLight){const $=e.get(L);if($.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const ee=L.shadow,ie=t.get(L);ie.shadowIntensity=ee.intensity,ie.shadowBias=ee.bias,ie.shadowNormalBias=ee.normalBias,ie.shadowRadius=ee.radius,ie.shadowMapSize=ee.mapSize,n.directionalShadow[m]=ie,n.directionalShadowMap[m]=se,n.directionalShadowMatrix[m]=L.shadow.matrix,T++}n.directional[m]=$,m++}else if(L.isSpotLight){const $=e.get(L);$.position.setFromMatrixPosition(L.matrixWorld),$.color.copy(k).multiplyScalar(X),$.distance=z,$.coneCos=Math.cos(L.angle),$.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),$.decay=L.decay,n.spot[x]=$;const ee=L.shadow;if(L.map&&(n.spotLightMap[b]=L.map,b++,ee.updateMatrices(L),L.castShadow&&P++),n.spotLightMatrix[x]=ee.matrix,L.castShadow){const ie=t.get(L);ie.shadowIntensity=ee.intensity,ie.shadowBias=ee.bias,ie.shadowNormalBias=ee.normalBias,ie.shadowRadius=ee.radius,ie.shadowMapSize=ee.mapSize,n.spotShadow[x]=ie,n.spotShadowMap[x]=se,v++}x++}else if(L.isRectAreaLight){const $=e.get(L);$.color.copy(k).multiplyScalar(X),$.halfWidth.set(L.width*.5,0,0),$.halfHeight.set(0,L.height*.5,0),n.rectArea[y]=$,y++}else if(L.isPointLight){const $=e.get(L);if($.color.copy(L.color).multiplyScalar(L.intensity),$.distance=L.distance,$.decay=L.decay,L.castShadow){const ee=L.shadow,ie=t.get(L);ie.shadowIntensity=ee.intensity,ie.shadowBias=ee.bias,ie.shadowNormalBias=ee.normalBias,ie.shadowRadius=ee.radius,ie.shadowMapSize=ee.mapSize,ie.shadowCameraNear=ee.camera.near,ie.shadowCameraFar=ee.camera.far,n.pointShadow[g]=ie,n.pointShadowMap[g]=se,n.pointShadowMatrix[g]=L.shadow.matrix,w++}n.point[g]=$,g++}else if(L.isHemisphereLight){const $=e.get(L);$.skyColor.copy(L.color).multiplyScalar(X),$.groundColor.copy(L.groundColor).multiplyScalar(X),n.hemi[S]=$,S++}}y>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ee.LTC_FLOAT_1,n.rectAreaLTC2=Ee.LTC_FLOAT_2):(n.rectAreaLTC1=Ee.LTC_HALF_1,n.rectAreaLTC2=Ee.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=f,n.ambient[2]=d;const C=n.hash;(C.sunLength!==p||C.directionalLength!==m||C.pointLength!==g||C.spotLength!==x||C.rectAreaLength!==y||C.hemiLength!==S||C.numSunShadows!==u||C.numDirectionalShadows!==T||C.numPointShadows!==w||C.numSpotShadows!==v||C.numSpotMaps!==b||C.numLightProbes!==R)&&(n.sun.length=p,n.directional.length=m,n.spot.length=x,n.rectArea.length=y,n.point.length=g,n.hemi.length=S,n.sunShadow.length=u,n.sunShadowMap.length=u,n.sunShadowMatrix.length=_,n.sunShadowCascade.length=_,n.directionalShadow.length=T,n.directionalShadowMap.length=T,n.directionalShadowMatrix.length=T,n.pointShadow.length=w,n.pointShadowMap.length=w,n.pointShadowMatrix.length=w,n.spotShadow.length=v,n.spotShadowMap.length=v,n.spotLightMatrix.length=v+b-P,n.spotLightMap.length=b,n.numSpotLightShadowsWithMaps=P,n.numLightProbes=R,C.sunLength=p,C.directionalLength=m,C.pointLength=g,C.spotLength=x,C.rectAreaLength=y,C.hemiLength=S,C.numSunShadows=u,C.numDirectionalShadows=T,C.numPointShadows=w,C.numSpotShadows=v,C.numSpotMaps=b,C.numLightProbes=R,n.version=pg++)}function l(c,h){let f=0,d=0,p=0,u=0,_=0,m=0;const g=h.matrixWorldInverse;for(let x=0,y=c.length;x<y;x++){const S=c[x];if(S.isSunLight){const T=n.sun[f];T.direction.setFromMatrixPosition(S.matrixWorld),T.direction.transformDirection(g),f++}else if(S.isDirectionalLight){const T=n.directional[d];T.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(g),d++}else if(S.isSpotLight){const T=n.spot[u];T.position.setFromMatrixPosition(S.matrixWorld),T.position.applyMatrix4(g),T.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(g),u++}else if(S.isRectAreaLight){const T=n.rectArea[_];T.position.setFromMatrixPosition(S.matrixWorld),T.position.applyMatrix4(g),a.identity(),r.copy(S.matrixWorld),r.premultiply(g),a.extractRotation(r),T.halfWidth.set(S.width*.5,0,0),T.halfHeight.set(0,S.height*.5,0),T.halfWidth.applyMatrix4(a),T.halfHeight.applyMatrix4(a),_++}else if(S.isPointLight){const T=n.point[p];T.position.setFromMatrixPosition(S.matrixWorld),T.position.applyMatrix4(g),p++}else if(S.isHemisphereLight){const T=n.hemi[m];T.direction.setFromMatrixPosition(S.matrixWorld),T.direction.transformDirection(g),m++}}}return{setup:o,setupView:l,state:n}}function Gl(i){const e=new gg(i),t=[],n=[],s=[];function r(f){h.camera=f,t.length=0,n.length=0,s.length=0}function a(f){f.isLightProbeGrid?s.push(f):t.push(f)}function o(f){n.push(f)}function l(){e.setup(t),s.sort((f,d)=>f.priority-d.priority||f.id-d.id)}function c(f){e.setupView(t,f)}const h={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:l,setupLightsView:c,pushLight:a,pushShadow:o}}function _g(i){let e=new WeakMap;function t(s,r=0){const a=e.get(s);let o;return a===void 0?(o=new Gl(i),e.set(s,[o])):r>=a.length?(o=new Gl(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const vg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,xg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Mg=[new O(1,0,0),new O(-1,0,0),new O(0,1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1)],Sg=[new O(0,-1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1),new O(0,-1,0),new O(0,-1,0)],Hl=new _t,$i=new O,Kr=new O;function yg(i,e,t){let n=new ds;const s=new Se,r=new Se,a=new yt,o=new Nd,l=new Ud,c={},h=t.maxTextureSize,f={[hi]:Jt,[Jt]:hi,[Sn]:Sn},d=new fi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Se},radius:{value:4}},vertexShader:vg,fragmentShader:xg}),p=d.clone();p.defines.HORIZONTAL_PASS=1;const u=new qt;u.setAttribute("position",new gn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new zt(u,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Zs;let g=this.type;this.render=function(w,v,b){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;this.type===Ch&&(He("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Zs);const P=i.getRenderTarget(),R=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),F=i.state;F.setBlending(Di),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);const W=g!==this.type;W&&v.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(k=>k.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,k=w.length;L<k;L++){const X=w[L],z=X.shadow;if(z===void 0){He("WebGLShadowMap:",X,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;s.copy(z.mapSize);const se=z.getFrameExtents();s.multiply(se),r.copy(z.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/se.x),s.x=r.x*se.x,z.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/se.y),s.y=r.y*se.y,z.mapSize.y=r.y));const $=i.state.buffers.depth.getReversed();if(z.camera._reversedDepth=$,z.map===null||W===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===Ji){if(X.isPointLight){He("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new bn(s.x,s.y,{format:ui,type:Tn,minFilter:Zt,magFilter:Zt,generateMipmaps:!1}),z.map.texture.name=X.name+".shadowMap",z.map.depthTexture=new Oi(s.x,s.y,yn),z.map.depthTexture.name=X.name+".shadowMapDepth",z.map.depthTexture.format=jn,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Ot,z.map.depthTexture.magFilter=Ot}else X.isPointLight?(z.map=new _o(s.x),z.map.depthTexture=new Oc(s.x,wn)):(z.map=new bn(s.x,s.y),z.map.depthTexture=new Oi(s.x,s.y,wn)),z.map.depthTexture.name=X.name+".shadowMap",z.map.depthTexture.format=jn,this.type===Zs?(z.map.depthTexture.compareFunction=$?bc:Ec,z.map.depthTexture.minFilter=Zt,z.map.depthTexture.magFilter=Zt):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Ot,z.map.depthTexture.magFilter=Ot);z.camera.updateProjectionMatrix()}z.map.isWebGLCubeRenderTarget!==!0&&(z.map.width!==s.x||z.map.height!==s.y)&&z.map.setSize(s.x,s.y);const ee=z.map.isWebGLCubeRenderTarget?6:z.getViewportCount();X.isPointLight!==!0&&z.updateMatrices(X,b);const ie=(z.camera.layers.mask&4294967294)!==0?z.camera.layers:b.layers;for(let we=0;we<ee;we++){const Fe=z.getCamera(we);if(X.isPointLight){const K=z.camera,ge=z.matrix,Te=X.distance||K.far;Te!==K.far&&(K.far=Te,K.updateProjectionMatrix()),$i.setFromMatrixPosition(X.matrixWorld),K.position.copy($i),Kr.copy(K.position),Kr.add(Mg[we]),K.up.copy(Sg[we]),K.lookAt(Kr),K.updateMatrixWorld(),ge.makeTranslation(-$i.x,-$i.y,-$i.z),Hl.multiplyMatrices(K.projectionMatrix,K.matrixWorldInverse),z._frustum.setFromProjectionMatrix(Hl,K.coordinateSystem,K.reversedDepth)}if(z.map.isWebGLCubeRenderTarget)i.setRenderTarget(z.map,we),i.clear();else{we===0&&(i.setRenderTarget(z.map),i.clear());const K=z.getViewport(we);a.set(r.x*K.x,r.y*K.y,r.x*K.z,r.y*K.w),F.viewport(a)}n=z.getFrustum(we),S(v,b,Fe,X,ie,this.type)}z.isPointLightShadow!==!0&&this.type===Ji&&x(z,b),z.needsUpdate=!1}g=this.type,m.needsUpdate=!1,i.setRenderTarget(P,R,C)};function x(w,v){const b=e.update(_);d.defines.VSM_SAMPLES!==w.blurSamples&&(d.defines.VSM_SAMPLES=w.blurSamples,p.defines.VSM_SAMPLES=w.blurSamples,d.needsUpdate=!0,p.needsUpdate=!0),w.mapPass===null?w.mapPass=new bn(s.x,s.y,{format:ui,type:Tn}):(w.mapPass.width!==w.map.width||w.mapPass.height!==w.map.height)&&w.mapPass.setSize(w.map.width,w.map.height),d.uniforms.shadow_pass.value=w.map.depthTexture,d.uniforms.resolution.value.set(w.map.width,w.map.height),d.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(v,null,b,d,_,null),p.uniforms.shadow_pass.value=w.mapPass.texture,p.uniforms.resolution.value.set(w.map.width,w.map.height),p.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(v,null,b,p,_,null)}function y(w,v,b,P){let R=null;const C=b.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(C!==void 0)R=C;else if(R=b.isPointLight===!0?l:o,i.localClippingEnabled&&v.clipShadows===!0&&Array.isArray(v.clippingPlanes)&&v.clippingPlanes.length!==0||v.displacementMap&&v.displacementScale!==0||v.alphaMap&&v.alphaTest>0||v.map&&v.alphaTest>0||v.alphaToCoverage===!0){const F=R.uuid,W=v.uuid;let L=c[F];L===void 0&&(L={},c[F]=L);let k=L[W];k===void 0&&(k=R.clone(),L[W]=k,v.addEventListener("dispose",T)),R=k}if(R.visible=v.visible,R.wireframe=v.wireframe,P===Ji?R.side=v.shadowSide!==null?v.shadowSide:v.side:R.side=v.shadowSide!==null?v.shadowSide:f[v.side],R.alphaMap=v.alphaMap,R.alphaTest=v.alphaToCoverage===!0?.5:v.alphaTest,R.map=v.map,R.clipShadows=v.clipShadows,R.clippingPlanes=v.clippingPlanes,R.clipIntersection=v.clipIntersection,R.displacementMap=v.displacementMap,R.displacementScale=v.displacementScale,R.displacementBias=v.displacementBias,R.wireframeLinewidth=v.wireframeLinewidth,R.linewidth=v.linewidth,b.isPointLight===!0&&R.isMeshDistanceMaterial===!0){const F=i.properties.get(R);F.light=b}return R}function S(w,v,b,P,R,C){if(w.visible===!1)return;if(w.layers.test(R)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&C===Ji)&&(!w.frustumCulled||w.intersectsFrustum(n))){w.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,w.matrixWorld);const L=e.update(w),k=w.material;if(Array.isArray(k)){const X=L.groups;for(let z=0,se=X.length;z<se;z++){const $=X[z],ee=k[$.materialIndex];if(ee&&ee.visible){const ie=y(w,ee,P,C);w.onBeforeShadow(i,w,v,b,L,ie,$),i.renderBufferDirect(b,null,L,ie,w,$),w.onAfterShadow(i,w,v,b,L,ie,$)}}}else if(k.visible){const X=y(w,k,P,C);w.onBeforeShadow(i,w,v,b,L,X,null),i.renderBufferDirect(b,null,L,X,w,null),w.onAfterShadow(i,w,v,b,L,X,null)}}const W=w.children;for(let L=0,k=W.length;L<k;L++)S(W[L],v,b,P,R,C)}function T(w){w.target.removeEventListener("dispose",T);for(const b in c){const P=c[b],R=w.target.uuid;R in P&&(P[R].dispose(),delete P[R])}}}function Eg(i,e){function t(){let I=!1;const j=new yt;let Z=null;const pe=new yt(0,0,0,0);return{setMask:function(ce){Z!==ce&&!I&&(i.colorMask(ce,ce,ce,ce),Z=ce)},setLocked:function(ce){I=ce},setClear:function(ce,de,Ne,Qe,le){le===!0&&(ce*=Qe,de*=Qe,Ne*=Qe),j.set(ce,de,Ne,Qe),pe.equals(j)===!1&&(i.clearColor(ce,de,Ne,Qe),pe.copy(j))},reset:function(){I=!1,Z=null,pe.set(-1,0,0,0)}}}function n(){let I=!1,j=!1,Z=null,pe=null,ce=null;return{setReversed:function(de){if(j!==de){const Ne=e.get("EXT_clip_control");de?Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.ZERO_TO_ONE_EXT):Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.NEGATIVE_ONE_TO_ONE_EXT),j=de;const Qe=ce;ce=null,this.setClear(Qe)}},getReversed:function(){return j},setTest:function(de){de?Me(i.DEPTH_TEST):Oe(i.DEPTH_TEST)},setMask:function(de){Z!==de&&!I&&(i.depthMask(de),Z=de)},setFunc:function(de){if(j&&(de=cu[de]),pe!==de){switch(de){case ia:i.depthFunc(i.NEVER);break;case sa:i.depthFunc(i.ALWAYS);break;case ra:i.depthFunc(i.LESS);break;case os:i.depthFunc(i.LEQUAL);break;case aa:i.depthFunc(i.EQUAL);break;case oa:i.depthFunc(i.GEQUAL);break;case la:i.depthFunc(i.GREATER);break;case ca:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}pe=de}},setLocked:function(de){I=de},setClear:function(de){ce!==de&&(ce=de,j&&(de=1-de),i.clearDepth(de))},reset:function(){I=!1,Z=null,pe=null,ce=null,j=!1}}}function s(){let I=!1,j=null,Z=null,pe=null,ce=null,de=null,Ne=null,Qe=null,le=null;return{setTest:function(ze){I||(ze?Me(i.STENCIL_TEST):Oe(i.STENCIL_TEST))},setMask:function(ze){j!==ze&&!I&&(i.stencilMask(ze),j=ze)},setFunc:function(ze,Ze,ye){(Z!==ze||pe!==Ze||ce!==ye)&&(i.stencilFunc(ze,Ze,ye),Z=ze,pe=Ze,ce=ye)},setOp:function(ze,Ze,ye){(de!==ze||Ne!==Ze||Qe!==ye)&&(i.stencilOp(ze,Ze,ye),de=ze,Ne=Ze,Qe=ye)},setLocked:function(ze){I=ze},setClear:function(ze){le!==ze&&(i.clearStencil(ze),le=ze)},reset:function(){I=!1,j=null,Z=null,pe=null,ce=null,de=null,Ne=null,Qe=null,le=null}}}const r=new t,a=new n,o=new s;let l={};const c=new WeakMap;let h={},f={},d={},p=new WeakMap,u=[],_=null,m=!1,g=null,x=null,y=null,S=null,T=null,w=null,v=null,b=new Ve(0,0,0),P=0,R=!1,C=null,F=null,W=null,L=null,k=null;const X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let z=!1,se=0;const $=i.getParameter(i.VERSION);$.indexOf("WebGL")!==-1?(se=parseFloat(/^WebGL (\d)/.exec($)[1]),z=se>=1):$.indexOf("OpenGL ES")!==-1&&(se=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),z=se>=2);let ee=null,ie={};const we=i.getParameter(i.SCISSOR_BOX),Fe=i.getParameter(i.VIEWPORT),K=new yt().fromArray(we),ge=new yt().fromArray(Fe);function Te(I,j,Z,pe){const ce=new Uint8Array(4),de=i.createTexture();i.bindTexture(I,de),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ne=0;Ne<Z;Ne++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(j,0,i.RGBA,1,1,pe,0,i.RGBA,i.UNSIGNED_BYTE,ce):i.texImage2D(j+Ne,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ce);return de}const Ue={};Ue[i.TEXTURE_2D]=Te(i.TEXTURE_2D,i.TEXTURE_2D,1),Ue[i.TEXTURE_CUBE_MAP]=Te(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ue[i.TEXTURE_2D_ARRAY]=Te(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Ue[i.TEXTURE_3D]=Te(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),Me(i.DEPTH_TEST),a.setFunc(os),ae(!1),re(Go),Me(i.CULL_FACE),he(Di);function Me(I){h[I]!==!0&&(i.enable(I),h[I]=!0)}function Oe(I){h[I]!==!1&&(i.disable(I),h[I]=!1)}function dt(I,j){return d[I]!==j?(i.bindFramebuffer(I,j),d[I]=j,I===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=j),I===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=j),!0):!1}function ke(I,j){let Z=u,pe=!1;if(I){Z=p.get(j),Z===void 0&&(Z=[],p.set(j,Z));const ce=I.textures;if(Z.length!==ce.length||Z[0]!==i.COLOR_ATTACHMENT0){for(let de=0,Ne=ce.length;de<Ne;de++)Z[de]=i.COLOR_ATTACHMENT0+de;Z.length=ce.length,pe=!0}}else Z[0]!==i.BACK&&(Z[0]=i.BACK,pe=!0);pe&&i.drawBuffers(Z)}function Ye(I){return _!==I?(i.useProgram(I),_=I,!0):!1}const Ke={[Ri]:i.FUNC_ADD,[Lh]:i.FUNC_SUBTRACT,[Dh]:i.FUNC_REVERSE_SUBTRACT};Ke[Ih]=i.MIN,Ke[Nh]=i.MAX;const te={[Uh]:i.ZERO,[Fh]:i.ONE,[Oh]:i.SRC_COLOR,[ac]:i.SRC_ALPHA,[Vh]:i.SRC_ALPHA_SATURATE,[Gh]:i.DST_COLOR,[zh]:i.DST_ALPHA,[Bh]:i.ONE_MINUS_SRC_COLOR,[oc]:i.ONE_MINUS_SRC_ALPHA,[Hh]:i.ONE_MINUS_DST_COLOR,[kh]:i.ONE_MINUS_DST_ALPHA,[Wh]:i.CONSTANT_COLOR,[Xh]:i.ONE_MINUS_CONSTANT_COLOR,[qh]:i.CONSTANT_ALPHA,[Yh]:i.ONE_MINUS_CONSTANT_ALPHA};function he(I,j,Z,pe,ce,de,Ne,Qe,le,ze){if(I===Di){m===!0&&(Oe(i.BLEND),m=!1);return}if(m===!1&&(Me(i.BLEND),m=!0),I!==Ph){if(I!==g||ze!==R){if((x!==Ri||T!==Ri)&&(i.blendEquation(i.FUNC_ADD),x=Ri,T=Ri),ze)switch(I){case ts:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ho:i.blendFunc(i.ONE,i.ONE);break;case Vo:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Wo:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:ot("WebGLState: Invalid blending: ",I);break}else switch(I){case ts:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ho:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Vo:ot("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Wo:ot("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ot("WebGLState: Invalid blending: ",I);break}y=null,S=null,w=null,v=null,b.set(0,0,0),P=0,g=I,R=ze}return}ce=ce||j,de=de||Z,Ne=Ne||pe,(j!==x||ce!==T)&&(i.blendEquationSeparate(Ke[j],Ke[ce]),x=j,T=ce),(Z!==y||pe!==S||de!==w||Ne!==v)&&(i.blendFuncSeparate(te[Z],te[pe],te[de],te[Ne]),y=Z,S=pe,w=de,v=Ne),(Qe.equals(b)===!1||le!==P)&&(i.blendColor(Qe.r,Qe.g,Qe.b,le),b.copy(Qe),P=le),g=I,R=!1}function q(I,j){I.side===Sn?Oe(i.CULL_FACE):Me(i.CULL_FACE);let Z=I.side===Jt;j&&(Z=!Z),ae(Z),I.blending===ts&&I.transparent===!1?he(Di):he(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),r.setMask(I.colorWrite);const pe=I.stencilWrite;o.setTest(pe),pe&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Ae(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?Me(i.SAMPLE_ALPHA_TO_COVERAGE):Oe(i.SAMPLE_ALPHA_TO_COVERAGE)}function ae(I){C!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),C=I)}function re(I){I!==Ah?(Me(i.CULL_FACE),I!==F&&(I===Go?i.cullFace(i.BACK):I===Rh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Oe(i.CULL_FACE),F=I}function Be(I){I!==W&&(z&&i.lineWidth(I),W=I)}function Ae(I,j,Z){I?(Me(i.POLYGON_OFFSET_FILL),(L!==j||k!==Z)&&(L=j,k=Z,a.getReversed()&&(j=-j,Z=-Z),i.polygonOffset(j,Z))):Oe(i.POLYGON_OFFSET_FILL)}function $e(I){I?Me(i.SCISSOR_TEST):Oe(i.SCISSOR_TEST)}function Je(I){I===void 0&&(I=i.TEXTURE0+X-1),ee!==I&&(i.activeTexture(I),ee=I)}function et(I,j,Z){Z===void 0&&(ee===null?Z=i.TEXTURE0+X-1:Z=ee);let pe=ie[Z];pe===void 0&&(pe={type:void 0,texture:void 0},ie[Z]=pe),(pe.type!==I||pe.texture!==j)&&(ee!==Z&&(i.activeTexture(Z),ee=Z),i.bindTexture(I,j||Ue[I]),pe.type=I,pe.texture=j)}function U(){const I=ie[ee];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function xt(){try{i.compressedTexImage2D(...arguments)}catch(I){ot("WebGLState:",I)}}function tt(){try{i.compressedTexImage3D(...arguments)}catch(I){ot("WebGLState:",I)}}function ft(){try{i.texSubImage2D(...arguments)}catch(I){ot("WebGLState:",I)}}function _e(){try{i.texSubImage3D(...arguments)}catch(I){ot("WebGLState:",I)}}function wt(){try{i.compressedTexSubImage2D(...arguments)}catch(I){ot("WebGLState:",I)}}function Ge(){try{i.compressedTexSubImage3D(...arguments)}catch(I){ot("WebGLState:",I)}}function We(){try{i.texStorage2D(...arguments)}catch(I){ot("WebGLState:",I)}}function A(){try{i.texStorage3D(...arguments)}catch(I){ot("WebGLState:",I)}}function M(){try{i.texImage2D(...arguments)}catch(I){ot("WebGLState:",I)}}function H(){try{i.texImage3D(...arguments)}catch(I){ot("WebGLState:",I)}}function oe(I){return f[I]!==void 0?f[I]:i.getParameter(I)}function ne(I,j){f[I]!==j&&(i.pixelStorei(I,j),f[I]=j)}function ue(I){K.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),K.copy(I))}function ve(I){ge.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),ge.copy(I))}function J(I,j){let Z=c.get(j);Z===void 0&&(Z=new WeakMap,c.set(j,Z));let pe=Z.get(I);pe===void 0&&(pe=i.getUniformBlockIndex(j,I.name),i.uniformBlockBinding(j,pe,pe),Z.set(I,pe))}function Q(I,j,Z){const ce=c.get(j).get(I);l[ce]!==Z&&(i.bindBufferBase(i.UNIFORM_BUFFER,ce,Z),l[ce]=Z)}function fe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},f={},ee=null,ie={},d={},l={},p=new WeakMap,u=[],_=null,m=!1,g=null,x=null,y=null,S=null,T=null,w=null,v=null,b=new Ve(0,0,0),P=0,R=!1,C=null,F=null,W=null,L=null,k=null,K.set(0,0,i.canvas.width,i.canvas.height),ge.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:Me,disable:Oe,bindFramebuffer:dt,drawBuffers:ke,useProgram:Ye,setBlending:he,setMaterial:q,setFlipSided:ae,setCullFace:re,setLineWidth:Be,setPolygonOffset:Ae,setScissorTest:$e,activeTexture:Je,bindTexture:et,unbindTexture:U,compressedTexImage2D:xt,compressedTexImage3D:tt,texImage2D:M,texImage3D:H,pixelStorei:ne,getParameter:oe,updateUBOMapping:J,uniformBlockBinding:Q,texStorage2D:We,texStorage3D:A,texSubImage2D:ft,texSubImage3D:_e,compressedTexSubImage2D:wt,compressedTexSubImage3D:Ge,scissor:ue,viewport:ve,reset:fe}}function bg(i,e,t,n,s,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Se,h=new WeakMap,f=new Set;let d;const p=new WeakMap,u=new Set,_=new FinalizationRegistry(A=>u.delete(A));let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,M){return m?new OffscreenCanvas(A,M):lr("canvas")}function x(A,M,H){let oe=1;const ne=We(A);if((ne.width>H||ne.height>H)&&(oe=H/Math.max(ne.width,ne.height)),oe<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){const ue=Math.floor(oe*ne.width),ve=Math.floor(oe*ne.height);d===void 0&&(d=g(ue,ve));const J=M?g(ue,ve):d;return J.width=ue,J.height=ve,J.getContext("2d").drawImage(A,0,0,ue,ve),He("WebGLRenderer: Texture has been resized from ("+ne.width+"x"+ne.height+") to ("+ue+"x"+ve+")."),J}else return"data"in A&&He("WebGLRenderer: Image in DataTexture is too big ("+ne.width+"x"+ne.height+")."),A;return A}function y(A){return A.generateMipmaps}function S(A){i.generateMipmap(A)}function T(A){return A.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?i.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function w(A,M,H,oe,ne,ue=!1){if(A!==null){if(i[A]!==void 0)return i[A];He("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let ve;oe&&(ve=e.get("EXT_texture_norm16"),ve||He("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=M;if(M===i.RED&&(H===i.FLOAT&&(J=i.R32F),H===i.HALF_FLOAT&&(J=i.R16F),H===i.UNSIGNED_BYTE&&(J=i.R8),H===i.UNSIGNED_SHORT&&ve&&(J=ve.R16_EXT),H===i.SHORT&&ve&&(J=ve.R16_SNORM_EXT)),M===i.RED_INTEGER&&(H===i.UNSIGNED_BYTE&&(J=i.R8UI),H===i.UNSIGNED_SHORT&&(J=i.R16UI),H===i.UNSIGNED_INT&&(J=i.R32UI),H===i.BYTE&&(J=i.R8I),H===i.SHORT&&(J=i.R16I),H===i.INT&&(J=i.R32I)),M===i.RG&&(H===i.FLOAT&&(J=i.RG32F),H===i.HALF_FLOAT&&(J=i.RG16F),H===i.UNSIGNED_BYTE&&(J=i.RG8),H===i.UNSIGNED_SHORT&&ve&&(J=ve.RG16_EXT),H===i.SHORT&&ve&&(J=ve.RG16_SNORM_EXT)),M===i.RG_INTEGER&&(H===i.UNSIGNED_BYTE&&(J=i.RG8UI),H===i.UNSIGNED_SHORT&&(J=i.RG16UI),H===i.UNSIGNED_INT&&(J=i.RG32UI),H===i.BYTE&&(J=i.RG8I),H===i.SHORT&&(J=i.RG16I),H===i.INT&&(J=i.RG32I)),M===i.RGB_INTEGER&&(H===i.UNSIGNED_BYTE&&(J=i.RGB8UI),H===i.UNSIGNED_SHORT&&(J=i.RGB16UI),H===i.UNSIGNED_INT&&(J=i.RGB32UI),H===i.BYTE&&(J=i.RGB8I),H===i.SHORT&&(J=i.RGB16I),H===i.INT&&(J=i.RGB32I)),M===i.RGBA_INTEGER&&(H===i.UNSIGNED_BYTE&&(J=i.RGBA8UI),H===i.UNSIGNED_SHORT&&(J=i.RGBA16UI),H===i.UNSIGNED_INT&&(J=i.RGBA32UI),H===i.BYTE&&(J=i.RGBA8I),H===i.SHORT&&(J=i.RGBA16I),H===i.INT&&(J=i.RGBA32I)),M===i.RGB&&(H===i.UNSIGNED_SHORT&&ve&&(J=ve.RGB16_EXT),H===i.SHORT&&ve&&(J=ve.RGB16_SNORM_EXT),H===i.UNSIGNED_INT_5_9_9_9_REV&&(J=i.RGB9_E5),H===i.UNSIGNED_INT_10F_11F_11F_REV&&(J=i.R11F_G11F_B10F)),M===i.RGBA){const Q=ue?or:rt.getTransfer(ne);H===i.FLOAT&&(J=i.RGBA32F),H===i.HALF_FLOAT&&(J=i.RGBA16F),H===i.UNSIGNED_BYTE&&(J=Q===ut?i.SRGB8_ALPHA8:i.RGBA8),H===i.UNSIGNED_SHORT&&ve&&(J=ve.RGBA16_EXT),H===i.SHORT&&ve&&(J=ve.RGBA16_SNORM_EXT),H===i.UNSIGNED_SHORT_4_4_4_4&&(J=i.RGBA4),H===i.UNSIGNED_SHORT_5_5_5_1&&(J=i.RGB5_A1)}return(J===i.R16F||J===i.R32F||J===i.RG16F||J===i.RG32F||J===i.RGBA16F||J===i.RGBA32F)&&e.get("EXT_color_buffer_float"),J}function v(A,M){let H;return A?M===null||M===wn||M===Fi?H=i.DEPTH24_STENCIL8:M===yn?H=i.DEPTH32F_STENCIL8:M===cs&&(H=i.DEPTH24_STENCIL8,He("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===wn||M===Fi?H=i.DEPTH_COMPONENT24:M===yn?H=i.DEPTH_COMPONENT32F:M===cs&&(H=i.DEPTH_COMPONENT16),H}function b(A,M){return y(A)===!0||A.isFramebufferTexture&&A.minFilter!==Ot&&A.minFilter!==Zt?Math.log2(Math.max(M.width,M.height))+1:A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?M.mipmaps.length:1}function P(A){const M=new WeakRef(A);n.get(A).__ref=M,u.add(M),_.register(A,M,M)}function R(A){const M=n.get(A).__ref;M!==void 0&&(u.delete(M),_.unregister(M))}function C(A){W(A.target)}function F(A){L(A.target)}function W(A){A.removeEventListener("dispose",C),R(A),X(A),A.isVideoTexture&&h.delete(A),A.isHTMLTexture&&f.delete(A)}function L(A){A.removeEventListener("dispose",F),R(A),se(A)}function k(){for(const A of u){const M=A.deref();M!==void 0&&(M.isRenderTarget===!0?L(M):W(M))}u.clear(),f.clear()}function X(A){const M=n.get(A);if(M.__webglInit===void 0)return;const H=A.source,oe=p.get(H);if(oe){const ne=oe[M.__cacheKey];ne.usedTimes--,ne.usedTimes===0&&z(A),Object.keys(oe).length===0&&p.delete(H)}n.remove(A)}function z(A){const M=n.get(A);i.deleteTexture(M.__webglTexture);const H=A.source,oe=p.get(H);delete oe[M.__cacheKey],a.memory.textures--}function se(A){const M=n.get(A);M.__depthDisposeCallback&&M.__depthDisposeCallback();const H=A.depthTexture;if(H&&H.renderTarget===A&&W(H),A.isWebGLCubeRenderTarget)for(let ne=0;ne<6;ne++){if(Array.isArray(M.__webglFramebuffer[ne]))for(let ue=0;ue<M.__webglFramebuffer[ne].length;ue++)i.deleteFramebuffer(M.__webglFramebuffer[ne][ue]);else i.deleteFramebuffer(M.__webglFramebuffer[ne]);M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer[ne])}else{if(Array.isArray(M.__webglFramebuffer))for(let ne=0;ne<M.__webglFramebuffer.length;ne++)i.deleteFramebuffer(M.__webglFramebuffer[ne]);else i.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&i.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let ne=0;ne<M.__webglColorRenderbuffer.length;ne++)M.__webglColorRenderbuffer[ne]&&i.deleteRenderbuffer(M.__webglColorRenderbuffer[ne]);M.__webglDepthRenderbuffer&&i.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const oe=A.textures;for(let ne=0,ue=oe.length;ne<ue;ne++){const ve=n.get(oe[ne]);ve.__webglTexture&&(i.deleteTexture(ve.__webglTexture),a.memory.textures--),n.remove(oe[ne])}n.remove(A)}let $=0;function ee(){$=0}function ie(){return $}function we(A){$=A}function Fe(){const A=$;return A>=s.maxTextures&&He("WebGLTextures: Trying to use "+(A+1)+" texture units while this GPU supports only "+s.maxTextures),$+=1,A}function K(A){const M=[];return M.push(A.wrapS),M.push(A.wrapT),M.push(A.wrapR||0),M.push(A.magFilter),M.push(A.minFilter),M.push(A.anisotropy),M.push(A.internalFormat),M.push(A.format),M.push(A.type),M.push(A.generateMipmaps),M.push(A.mipmapsAutoUpdate),M.push(A.premultiplyAlpha),M.push(A.flipY),M.push(A.unpackAlignment),M.push(A.colorSpace),M.join()}function ge(A,M){const H=n.get(A);if(A.isVideoTexture&&wt(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&H.__version!==A.version){const oe=A.image;if(oe===null)He("WebGLRenderer: Texture marked for update but no image data found.");else if(oe.complete===!1)He("WebGLRenderer: Texture marked for update but image is incomplete");else{q(H,A,M);return}}else A.isExternalTexture&&(H.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,H.__webglTexture,i.TEXTURE0+M)}function Te(A,M){const H=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&H.__version!==A.version){q(H,A,M);return}else A.isExternalTexture&&(H.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,H.__webglTexture,i.TEXTURE0+M)}function Ue(A,M){const H=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&H.__version!==A.version){q(H,A,M);return}t.bindTexture(i.TEXTURE_3D,H.__webglTexture,i.TEXTURE0+M)}function Me(A,M){const H=n.get(A);if(A.version>0&&H.__version!==A.version){ae(H,A,M);return}t.bindTexture(i.TEXTURE_CUBE_MAP,H.__webglTexture,i.TEXTURE0+M)}const Oe={[ha]:i.REPEAT,[Un]:i.CLAMP_TO_EDGE,[ua]:i.MIRRORED_REPEAT},dt={[Ot]:i.NEAREST,[Zh]:i.NEAREST_MIPMAP_NEAREST,[Es]:i.NEAREST_MIPMAP_LINEAR,[Zt]:i.LINEAR,[yr]:i.LINEAR_MIPMAP_NEAREST,[Zn]:i.LINEAR_MIPMAP_LINEAR},ke={[eu]:i.NEVER,[wc]:i.ALWAYS,[tu]:i.LESS,[Ec]:i.LEQUAL,[nu]:i.EQUAL,[bc]:i.GEQUAL,[iu]:i.GREATER,[su]:i.NOTEQUAL};function Ye(A,M){if(M.type===yn&&e.has("OES_texture_float_linear")===!1&&(M.magFilter===Zt||M.magFilter===yr||M.magFilter===Es||M.magFilter===Zn||M.minFilter===Zt||M.minFilter===yr||M.minFilter===Es||M.minFilter===Zn)&&He("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(A,i.TEXTURE_WRAP_S,Oe[M.wrapS]),i.texParameteri(A,i.TEXTURE_WRAP_T,Oe[M.wrapT]),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,Oe[M.wrapR]),i.texParameteri(A,i.TEXTURE_MAG_FILTER,dt[M.magFilter]),i.texParameteri(A,i.TEXTURE_MIN_FILTER,dt[M.minFilter]),M.compareFunction&&(i.texParameteri(A,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(A,i.TEXTURE_COMPARE_FUNC,ke[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===Ot||M.minFilter!==Es&&M.minFilter!==Zn||M.type===yn&&e.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){const H=e.get("EXT_texture_filter_anisotropic");i.texParameterf(A,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,s.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function Ke(A,M){let H=!1;A.__webglInit===void 0&&(A.__webglInit=!0,M.addEventListener("dispose",C),P(M));const oe=M.source;let ne=p.get(oe);ne===void 0&&(ne={},p.set(oe,ne));const ue=K(M);if(ue!==A.__cacheKey){ne[ue]===void 0&&(ne[ue]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,H=!0),ne[ue].usedTimes++;const ve=ne[A.__cacheKey];ve!==void 0&&(ne[A.__cacheKey].usedTimes--,ve.usedTimes===0&&z(M)),A.__cacheKey=ue,A.__webglTexture=ne[ue].texture}return H}function te(A,M,H){return Math.floor(Math.floor(A/H)/M)}function he(A,M,H,oe){const ue=A.updateRanges;if(ue.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,M.width,M.height,H,oe,M.data);else{ue.sort((I,j)=>I.start-j.start);let ve=0;for(let I=1;I<ue.length;I++){const j=ue[ve],Z=ue[I],pe=j.start+j.count,ce=te(Z.start,M.width,4),de=te(j.start,M.width,4);Z.start<=pe+1&&ce===de&&te(Z.start+Z.count-1,M.width,4)===ce?j.count=Math.max(j.count,Z.start+Z.count-j.start):(++ve,ue[ve]=Z)}ue.length=ve+1;const J=t.getParameter(i.UNPACK_ROW_LENGTH),Q=t.getParameter(i.UNPACK_SKIP_PIXELS),fe=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,M.width);for(let I=0,j=ue.length;I<j;I++){const Z=ue[I],pe=Math.floor(Z.start/4),ce=Math.ceil(Z.count/4),de=pe%M.width,Ne=Math.floor(pe/M.width),Qe=ce,le=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,de),t.pixelStorei(i.UNPACK_SKIP_ROWS,Ne),t.texSubImage2D(i.TEXTURE_2D,0,de,Ne,Qe,le,H,oe,M.data)}A.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,J),t.pixelStorei(i.UNPACK_SKIP_PIXELS,Q),t.pixelStorei(i.UNPACK_SKIP_ROWS,fe)}}function q(A,M,H){let oe=i.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(oe=i.TEXTURE_2D_ARRAY),M.isData3DTexture&&(oe=i.TEXTURE_3D);const ne=Ke(A,M),ue=M.source;t.bindTexture(oe,A.__webglTexture,i.TEXTURE0+H);const ve=n.get(ue);if(ue.version!==ve.__version||ne===!0){if(t.activeTexture(i.TEXTURE0+H),(typeof ImageBitmap<"u"&&M.image instanceof ImageBitmap)===!1){const le=rt.getPrimaries(rt.workingColorSpace),ze=M.colorSpace===Kn?null:rt.getPrimaries(M.colorSpace),Ze=M.colorSpace===Kn||le===ze?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ze)}t.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment);let Q=x(M.image,!1,s.maxTextureSize);Q=Ge(M,Q);const fe=r.convert(M.format,M.colorSpace),I=r.convert(M.type);let j=w(M.internalFormat,fe,I,M.normalized,M.colorSpace,M.isVideoTexture);Ye(oe,M);let Z;const pe=M.mipmaps,ce=M.isVideoTexture!==!0,de=ve.__version===void 0||ne===!0,Ne=ue.dataReady,Qe=b(M,Q);if(M.isDepthTexture)j=v(M.format===Jn,M.type),de&&(ce?t.texStorage2D(i.TEXTURE_2D,1,j,Q.width,Q.height):t.texImage2D(i.TEXTURE_2D,0,j,Q.width,Q.height,0,fe,I,null));else if(M.isDataTexture)if(pe.length>0){ce&&de&&t.texStorage2D(i.TEXTURE_2D,Qe,j,pe[0].width,pe[0].height);for(let le=0,ze=pe.length;le<ze;le++)Z=pe[le],ce?Ne&&t.texSubImage2D(i.TEXTURE_2D,le,0,0,Z.width,Z.height,fe,I,Z.data):t.texImage2D(i.TEXTURE_2D,le,j,Z.width,Z.height,0,fe,I,Z.data);M.generateMipmaps=!1}else ce?(de&&t.texStorage2D(i.TEXTURE_2D,Qe,j,Q.width,Q.height),Ne&&he(M,Q,fe,I)):t.texImage2D(i.TEXTURE_2D,0,j,Q.width,Q.height,0,fe,I,Q.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){ce&&de&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Qe,j,pe[0].width,pe[0].height,Q.depth);for(let le=0,ze=pe.length;le<ze;le++)if(Z=pe[le],M.format!==En)if(fe!==null)if(ce){if(Ne)if(M.layerUpdates.size>0){const Ze=Sl(Z.width,Z.height,M.format,M.type);for(const ye of M.layerUpdates){const ht=Z.data.subarray(ye*Ze/Z.data.BYTES_PER_ELEMENT,(ye+1)*Ze/Z.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,le,0,0,ye,Z.width,Z.height,1,fe,ht)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,le,0,0,0,Z.width,Z.height,Q.depth,fe,Z.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,le,j,Z.width,Z.height,Q.depth,0,Z.data,0,0);else He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ce?Ne&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,le,0,0,0,Z.width,Z.height,Q.depth,fe,I,Z.data):t.texImage3D(i.TEXTURE_2D_ARRAY,le,j,Z.width,Z.height,Q.depth,0,fe,I,Z.data);M.layerUpdates.size>0&&M.clearLayerUpdates()}else{ce&&de&&t.texStorage2D(i.TEXTURE_2D,Qe,j,pe[0].width,pe[0].height);for(let le=0,ze=pe.length;le<ze;le++)Z=pe[le],M.format!==En?fe!==null?ce?Ne&&t.compressedTexSubImage2D(i.TEXTURE_2D,le,0,0,Z.width,Z.height,fe,Z.data):t.compressedTexImage2D(i.TEXTURE_2D,le,j,Z.width,Z.height,0,Z.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ce?Ne&&t.texSubImage2D(i.TEXTURE_2D,le,0,0,Z.width,Z.height,fe,I,Z.data):t.texImage2D(i.TEXTURE_2D,le,j,Z.width,Z.height,0,fe,I,Z.data)}else if(M.isDataArrayTexture)if(ce){if(de&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Qe,j,Q.width,Q.height,Q.depth),Ne)if(M.layerUpdates.size>0){const le=Sl(Q.width,Q.height,M.format,M.type);for(const ze of M.layerUpdates){const Ze=Q.data.subarray(ze*le/Q.data.BYTES_PER_ELEMENT,(ze+1)*le/Q.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,ze,Q.width,Q.height,1,fe,I,Ze)}M.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,fe,I,Q.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,j,Q.width,Q.height,Q.depth,0,fe,I,Q.data);else if(M.isData3DTexture)ce?(de&&t.texStorage3D(i.TEXTURE_3D,Qe,j,Q.width,Q.height,Q.depth),Ne&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,fe,I,Q.data)):t.texImage3D(i.TEXTURE_3D,0,j,Q.width,Q.height,Q.depth,0,fe,I,Q.data);else if(M.isFramebufferTexture){if(de)if(ce)t.texStorage2D(i.TEXTURE_2D,Qe,j,Q.width,Q.height);else{let le=Q.width,ze=Q.height;for(let Ze=0;Ze<Qe;Ze++)t.texImage2D(i.TEXTURE_2D,Ze,j,le,ze,0,fe,I,null),le>>=1,ze>>=1}}else if(M.isHTMLTexture){if("texElementImage2D"in i){const le=i.canvas;if(le.hasAttribute("layoutsubtree")||le.setAttribute("layoutsubtree","true"),Q.parentNode!==le){le.appendChild(Q),f.add(M),le.onpaint=ze=>{const Ze=ze.changedElements;for(const ye of f)Ze.includes(ye.image)&&(ye.needsUpdate=!0)},le.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,Q);else{const Ze=i.RGBA,ye=i.RGBA,ht=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Ze,ye,ht,Q)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(pe.length>0){if(ce&&de){const le=We(pe[0]);t.texStorage2D(i.TEXTURE_2D,Qe,j,le.width,le.height)}for(let le=0,ze=pe.length;le<ze;le++)Z=pe[le],ce?Ne&&t.texSubImage2D(i.TEXTURE_2D,le,0,0,fe,I,Z):t.texImage2D(i.TEXTURE_2D,le,j,fe,I,Z);M.generateMipmaps=!1}else if(ce){if(de){const le=We(Q);t.texStorage2D(i.TEXTURE_2D,Qe,j,le.width,le.height)}Ne&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,fe,I,Q)}else t.texImage2D(i.TEXTURE_2D,0,j,fe,I,Q);y(M)&&M.mipmapsAutoUpdate===!0&&S(oe),ve.__version=ue.version,M.onUpdate&&M.onUpdate(M)}A.__version=M.version}function ae(A,M,H){if(M.image.length!==6)return;const oe=Ke(A,M),ne=M.source;t.bindTexture(i.TEXTURE_CUBE_MAP,A.__webglTexture,i.TEXTURE0+H);const ue=n.get(ne);if(ne.version!==ue.__version||oe===!0){t.activeTexture(i.TEXTURE0+H);const ve=rt.getPrimaries(rt.workingColorSpace),J=M.colorSpace===Kn?null:rt.getPrimaries(M.colorSpace),Q=M.colorSpace===Kn||ve===J?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Q);const fe=M.isCompressedTexture||M.image[0].isCompressedTexture,I=M.image[0]&&M.image[0].isDataTexture,j=[];for(let ye=0;ye<6;ye++)!fe&&!I?j[ye]=x(M.image[ye],!0,s.maxCubemapSize):j[ye]=I?M.image[ye].image:M.image[ye],j[ye]=Ge(M,j[ye]);const Z=j[0],pe=r.convert(M.format,M.colorSpace),ce=r.convert(M.type);let de=w(M.internalFormat,pe,ce,M.normalized,M.colorSpace);const Ne=M.isVideoTexture!==!0,Qe=ue.__version===void 0||oe===!0,le=ne.dataReady;let ze=b(M,Z);Ye(i.TEXTURE_CUBE_MAP,M);let Ze;if(M.isDepthTexture){if(de=v(M.format===Jn,M.type),Qe)if(Ne)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,de,Z.width,Z.height);else for(let ye=0;ye<6;ye++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,de,Z.width,Z.height,0,pe,ce,null)}else if(fe){Ne&&Qe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,ze,de,Z.width,Z.height);for(let ye=0;ye<6;ye++){Ze=j[ye].mipmaps;for(let ht=0;ht<Ze.length;ht++){const Dt=Ze[ht];M.format!==En?pe!==null?Ne?le&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ht,0,0,Dt.width,Dt.height,pe,Dt.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ht,de,Dt.width,Dt.height,0,Dt.data):He("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ne?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ht,0,0,Dt.width,Dt.height,pe,ce,Dt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ht,de,Dt.width,Dt.height,0,pe,ce,Dt.data)}}}else{if(Ze=M.mipmaps,Ne&&Qe){Ze.length>0&&ze++;const ye=We(j[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,ze,de,ye.width,ye.height)}for(let ye=0;ye<6;ye++)if(I){Ne?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,j[ye].width,j[ye].height,pe,ce,j[ye].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,de,j[ye].width,j[ye].height,0,pe,ce,j[ye].data);for(let ht=0;ht<Ze.length;ht++){const Gn=Ze[ht].image[ye].image;Ne?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ht+1,0,0,Gn.width,Gn.height,pe,ce,Gn.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ht+1,de,Gn.width,Gn.height,0,pe,ce,Gn.data)}}else{Ne?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,pe,ce,j[ye]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,de,pe,ce,j[ye]);for(let ht=0;ht<Ze.length;ht++){const Dt=Ze[ht];Ne?le&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ht+1,0,0,pe,ce,Dt.image[ye]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ye,ht+1,de,pe,ce,Dt.image[ye])}}}y(M)&&M.mipmapsAutoUpdate===!0&&S(i.TEXTURE_CUBE_MAP),ue.__version=ne.version,M.onUpdate&&M.onUpdate(M)}A.__version=M.version}function re(A,M,H,oe,ne,ue){const ve=r.convert(H.format,H.colorSpace),J=r.convert(H.type),Q=w(H.internalFormat,ve,J,H.normalized,H.colorSpace),fe=n.get(M),I=n.get(H);if(I.__renderTarget=M,!fe.__hasExternalTextures){const j=Math.max(1,M.width>>ue),Z=Math.max(1,M.height>>ue);ne===i.TEXTURE_3D||ne===i.TEXTURE_2D_ARRAY?t.texImage3D(ne,ue,Q,j,Z,M.depth,0,ve,J,null):t.texImage2D(ne,ue,Q,j,Z,0,ve,J,null)}t.bindFramebuffer(i.FRAMEBUFFER,A),_e(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,oe,ne,I.__webglTexture,0,ft(M)):(ne===i.TEXTURE_2D||ne>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ne<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,oe,ne,I.__webglTexture,ue),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Be(A,M,H){if(i.bindRenderbuffer(i.RENDERBUFFER,A),M.depthBuffer){const oe=M.depthTexture,ne=oe&&oe.isDepthTexture?oe.type:null,ue=v(M.stencilBuffer,ne),ve=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;_e(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ft(M),ue,M.width,M.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,ft(M),ue,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,ue,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ve,i.RENDERBUFFER,A)}else{const oe=M.textures;for(let ne=0;ne<oe.length;ne++){const ue=oe[ne],ve=r.convert(ue.format,ue.colorSpace),J=r.convert(ue.type),Q=w(ue.internalFormat,ve,J,ue.normalized,ue.colorSpace);_e(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ft(M),Q,M.width,M.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,ft(M),Q,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,Q,M.width,M.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ae(A,M,H){const oe=M.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,A),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const ne=n.get(M.depthTexture);ne.__renderTarget=M;const ue=oe?M.depthTexture.image[0]:M.depthTexture.image;(!ne.__webglTexture||ue.width!==M.width||ue.height!==M.height)&&(ue.width=M.width,ue.height=M.height,M.depthTexture.needsUpdate=!0),oe?Me(M.depthTexture,0):ge(M.depthTexture,0);const ve=ne.__webglTexture,J=ft(M),Q=oe?i.TEXTURE_CUBE_MAP_POSITIVE_X+H:i.TEXTURE_2D,fe=M.depthTexture.format===Jn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(M.depthTexture.format===jn)_e(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,fe,Q,ve,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,fe,Q,ve,0);else if(M.depthTexture.format===Jn)_e(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,fe,Q,ve,0,J):i.framebufferTexture2D(i.FRAMEBUFFER,fe,Q,ve,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function $e(A){const M=n.get(A),H=A.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==A.depthTexture){const oe=A.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),oe){const ne=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,oe.removeEventListener("dispose",ne)};oe.addEventListener("dispose",ne),M.__depthDisposeCallback=ne}M.__boundDepthTexture=oe}if(A.depthTexture&&!M.__autoAllocateDepthBuffer)if(H)for(let oe=0;oe<6;oe++)Ae(M.__webglFramebuffer[oe],A,oe);else A.texture.mipmaps.length>0?Ae(M.__webglFramebuffer[0],A,0):Ae(M.__webglFramebuffer,A,0);else if(H){M.__webglDepthbuffer=[];for(let oe=0;oe<6;oe++)if(t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[oe]),M.__webglDepthbuffer[oe]===void 0)M.__webglDepthbuffer[oe]=i.createRenderbuffer(),Be(M.__webglDepthbuffer[oe],A,!1);else{const ne=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ue=M.__webglDepthbuffer[oe];i.bindRenderbuffer(i.RENDERBUFFER,ue),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,ue)}}else if(A.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=i.createRenderbuffer(),Be(M.__webglDepthbuffer,A,!1);else{const ne=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ue=M.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ue),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,ue)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Je(A,M,H){const oe=n.get(A);M!==void 0&&re(oe.__webglFramebuffer,A,A.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),H!==void 0&&$e(A)}function et(A){const M=A.texture,H=n.get(A),oe=n.get(M);A.addEventListener("dispose",F),P(A);const ne=A.textures,ue=A.isWebGLCubeRenderTarget===!0,ve=ne.length>1;if(ve||(oe.__webglTexture===void 0&&(oe.__webglTexture=i.createTexture()),oe.__version=M.version,a.memory.textures++),ue){H.__webglFramebuffer=[];for(let J=0;J<6;J++)if(M.mipmaps.length>0){H.__webglFramebuffer[J]=[];for(let Q=0;Q<M.mipmaps.length;Q++)H.__webglFramebuffer[J][Q]=i.createFramebuffer()}else H.__webglFramebuffer[J]=i.createFramebuffer()}else{if(M.mipmaps.length>0){H.__webglFramebuffer=[];for(let J=0;J<M.mipmaps.length;J++)H.__webglFramebuffer[J]=i.createFramebuffer()}else H.__webglFramebuffer=i.createFramebuffer();if(ve)for(let J=0,Q=ne.length;J<Q;J++){const fe=n.get(ne[J]);fe.__webglTexture===void 0&&(fe.__webglTexture=i.createTexture(),a.memory.textures++)}if(A.samples>0&&_e(A)===!1){H.__webglMultisampledFramebuffer=i.createFramebuffer(),H.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let J=0;J<ne.length;J++){const Q=ne[J];H.__webglColorRenderbuffer[J]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,H.__webglColorRenderbuffer[J]);const fe=r.convert(Q.format,Q.colorSpace),I=r.convert(Q.type),j=w(Q.internalFormat,fe,I,Q.normalized,Q.colorSpace,A.isXRRenderTarget===!0),Z=ft(A);i.renderbufferStorageMultisample(i.RENDERBUFFER,Z,j,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+J,i.RENDERBUFFER,H.__webglColorRenderbuffer[J])}i.bindRenderbuffer(i.RENDERBUFFER,null),A.depthBuffer&&(H.__webglDepthRenderbuffer=i.createRenderbuffer(),Be(H.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ue){t.bindTexture(i.TEXTURE_CUBE_MAP,oe.__webglTexture),Ye(i.TEXTURE_CUBE_MAP,M);for(let J=0;J<6;J++)if(M.mipmaps.length>0)for(let Q=0;Q<M.mipmaps.length;Q++)re(H.__webglFramebuffer[J][Q],A,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,Q);else re(H.__webglFramebuffer[J],A,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);y(M)?S(i.TEXTURE_CUBE_MAP):M.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,M.mipmaps.length-1),t.unbindTexture()}else if(ve){for(let J=0,Q=ne.length;J<Q;J++){const fe=ne[J],I=n.get(fe);let j=i.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(j=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(j,I.__webglTexture),Ye(j,fe),re(H.__webglFramebuffer,A,fe,i.COLOR_ATTACHMENT0+J,j,0),y(fe)&&S(j)}t.unbindTexture()}else{let J=i.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(J=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(J,oe.__webglTexture),Ye(J,M),M.mipmaps.length>0)for(let Q=0;Q<M.mipmaps.length;Q++)re(H.__webglFramebuffer[Q],A,M,i.COLOR_ATTACHMENT0,J,Q);else re(H.__webglFramebuffer,A,M,i.COLOR_ATTACHMENT0,J,0);y(M)?S(J):M.mipmaps.length>0&&i.texParameteri(J,i.TEXTURE_MAX_LEVEL,M.mipmaps.length-1),t.unbindTexture()}A.depthBuffer&&$e(A)}function U(A){const M=A.textures;for(let H=0,oe=M.length;H<oe;H++){const ne=M[H];if(y(ne)&&ne.mipmapsAutoUpdate===!0){const ue=T(A),ve=n.get(ne).__webglTexture;t.bindTexture(ue,ve),S(ue),t.unbindTexture()}}}const xt=[];function tt(A){if(A.samples>0){if(_e(A)===!1){const M=A.textures,H=A.width,oe=A.height;let ne=i.COLOR_BUFFER_BIT;const ue=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ve=n.get(A),J=M.length>1;if(J)for(let fe=0;fe<M.length;fe++)t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ve.__webglMultisampledFramebuffer),A.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglFramebuffer);for(let fe=0;fe<M.length;fe++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(ne|=i.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(ne|=i.STENCIL_BUFFER_BIT)),J){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ve.__webglColorRenderbuffer[fe]);const I=n.get(M[fe]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,I,0)}i.blitFramebuffer(0,0,H,oe,0,0,H,oe,ne,i.NEAREST),l===!0&&(xt.length=0,xt.push(i.COLOR_ATTACHMENT0+fe),A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&xt.push(ue),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,xt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),J)for(let fe=0;fe<M.length;fe++){t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,ve.__webglColorRenderbuffer[fe]);const I=n.get(M[fe]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ve.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.TEXTURE_2D,I,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ve.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&l){const M=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[M])}}}function ft(A){return Math.min(s.maxSamples,A.samples)}function _e(A){const M=n.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function wt(A){const M=a.render.frame;h.get(A)!==M&&(h.set(A,M),A.update())}function Ge(A,M){const H=A.colorSpace,oe=A.format,ne=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||H!==ar&&H!==Kn&&(rt.getTransfer(H)===ut?(oe!==En||ne!==tn)&&He("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ot("WebGLTextures: Unsupported texture color space:",H)),M}function We(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=Fe,this.resetTextureUnits=ee,this.getTextureUnits=ie,this.setTextureUnits=we,this.setTexture2D=ge,this.setTexture2DArray=Te,this.setTexture3D=Ue,this.setTextureCube=Me,this.rebindTextures=Je,this.setupRenderTarget=et,this.updateRenderTargetMipmap=U,this.updateMultisampleRenderTarget=tt,this.setupDepthRenderbuffer=$e,this.setupFrameBufferTexture=re,this.useMultisampledRTT=_e,this.dispose=k}function wg(i,e){function t(n,s=Kn){let r;const a=rt.getTransfer(s);if(n===tn)return i.UNSIGNED_BYTE;if(n===ja)return i.UNSIGNED_SHORT_4_4_4_4;if(n===eo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===vc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===xc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===gc)return i.BYTE;if(n===_c)return i.SHORT;if(n===cs)return i.UNSIGNED_SHORT;if(n===Qa)return i.INT;if(n===wn)return i.UNSIGNED_INT;if(n===yn)return i.FLOAT;if(n===Tn)return i.HALF_FLOAT;if(n===Mc)return i.ALPHA;if(n===Sc)return i.RGB;if(n===En)return i.RGBA;if(n===jn)return i.DEPTH_COMPONENT;if(n===Jn)return i.DEPTH_STENCIL;if(n===yc)return i.RED;if(n===to)return i.RED_INTEGER;if(n===ui)return i.RG;if(n===no)return i.RG_INTEGER;if(n===io)return i.RGBA_INTEGER;if(n===Js||n===Qs||n===js||n===er)if(a===ut)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Js)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Qs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===js)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===er)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Js)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Qs)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===js)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===er)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===da||n===fa||n===pa||n===ma)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===da)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===fa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===pa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ma)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ga||n===_a||n===va||n===xa||n===Ma||n===sr||n===Sa)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ga||n===_a)return a===ut?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===va)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===xa)return r.COMPRESSED_R11_EAC;if(n===Ma)return r.COMPRESSED_SIGNED_R11_EAC;if(n===sr)return r.COMPRESSED_RG11_EAC;if(n===Sa)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===ya||n===Ea||n===ba||n===wa||n===Ta||n===Aa||n===Ra||n===Ca||n===Pa||n===La||n===Da||n===Ia||n===Na||n===Ua)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ya)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ea)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===ba)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===wa)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ta)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Aa)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ra)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ca)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Pa)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===La)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Da)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ia)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Na)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ua)return a===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Fa||n===Oa||n===Ba)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Fa)return a===ut?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Oa)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ba)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===za||n===ka||n===rr||n===Ga)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===za)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ka)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===rr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ga)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Fi?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const Tg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ag=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Rg{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Bc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new fi({vertexShader:Tg,fragmentShader:Ag,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new zt(new pr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Cg extends pi{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,f=null,d=null,p=null,u=null;const _=typeof XRWebGLBinding<"u",m=new Rg,g={},x=t.getContextAttributes();let y=null,S=null;const T=[],w=[],v=new Se;let b=null,P=null;const R=new dn;R.viewport=new yt;const C=new dn;C.viewport=new yt;const F=[R,C],W=new kd;let L=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let ge=T[K];return ge===void 0&&(ge=new Cr,T[K]=ge),ge.getTargetRaySpace()},this.getControllerGrip=function(K){let ge=T[K];return ge===void 0&&(ge=new Cr,T[K]=ge),ge.getGripSpace()},this.getHand=function(K){let ge=T[K];return ge===void 0&&(ge=new Cr,T[K]=ge),ge.getHandSpace()};function X(K){const ge=w.indexOf(K.inputSource);if(ge===-1)return;const Te=T[ge];Te!==void 0&&(Te.update(K.inputSource,K.frame,c||a),Te.dispatchEvent({type:K.type,data:K.inputSource}))}function z(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",z),s.removeEventListener("inputsourceschange",se);for(let K=0;K<T.length;K++){const ge=w[K];ge!==null&&(w[K]=null,T[K].disconnect(ge))}L=null,k=null,m.reset();for(const K in g)delete g[K];if(e.setRenderTarget(y),p=null,d=null,f=null,s=null,S=null,Fe.stop(),n.isPresenting=!1,e.setPixelRatio(b),e.setSize(v.width,v.height,!1),P!==null){const K=P.camera;K.fov=P.fov,K.zoom=P.zoom,K.updateProjectionMatrix(),P=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,n.isPresenting===!0&&He("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){o=K,n.isPresenting===!0&&He("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return d!==null?d:p},this.getBinding=function(){return f===null&&_&&(f=new XRWebGLBinding(s,t)),f},this.getFrame=function(){return u},this.getSession=function(){return s},this.setSession=async function(K){if(s=K,s!==null){if(y=e.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",z),s.addEventListener("inputsourceschange",se),x.xrCompatible!==!0&&await t.makeXRCompatible(),b=e.getPixelRatio(),e.getSize(v),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let Te=null,Ue=null,Me=null;x.depth&&(Me=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Te=x.stencil?Jn:jn,Ue=x.stencil?Fi:wn);const Oe={colorFormat:t.RGBA8,depthFormat:Me,scaleFactor:r};f=this.getBinding(),d=f.createProjectionLayer(Oe),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),S=new bn(d.textureWidth,d.textureHeight,{format:En,type:tn,depthTexture:new Oi(d.textureWidth,d.textureHeight,Ue,void 0,void 0,void 0,void 0,void 0,void 0,Te),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{const Te={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,Te),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new bn(p.framebufferWidth,p.framebufferHeight,{format:En,type:tn,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Fe.setContext(s),Fe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function se(K){for(let ge=0;ge<K.removed.length;ge++){const Te=K.removed[ge],Ue=w.indexOf(Te);Ue>=0&&(w[Ue]=null,T[Ue].disconnect(Te))}for(let ge=0;ge<K.added.length;ge++){const Te=K.added[ge];let Ue=w.indexOf(Te);if(Ue===-1){for(let Oe=0;Oe<T.length;Oe++)if(Oe>=w.length){w.push(Te),Ue=Oe;break}else if(w[Oe]===null){w[Oe]=Te,Ue=Oe;break}if(Ue===-1)break}const Me=T[Ue];Me&&Me.connect(Te)}}function $(K,ge){ge===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(ge.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(s===null)return;let ge=K.near,Te=K.far;m.texture!==null&&(m.depthNear>0&&(ge=m.depthNear),m.depthFar>0&&(Te=m.depthFar)),W.near=C.near=R.near=ge,W.far=C.far=R.far=Te,(L!==W.near||k!==W.far)&&(s.updateRenderState({depthNear:W.near,depthFar:W.far}),L=W.near,k=W.far),W.layers.mask=K.layers.mask|6,R.layers.mask=W.layers.mask&-5,C.layers.mask=W.layers.mask&-3;const Ue=K.parent,Me=W.cameras;$(W,Ue);for(let Oe=0;Oe<Me.length;Oe++)$(Me[Oe],Ue);W.projectionMatrix.copy(R.projectionMatrix),W.projectionMatrixInverse.copy(R.projectionMatrixInverse),P===null&&K.isPerspectiveCamera&&(P={camera:K,fov:K.fov,zoom:K.zoom}),ee(K,W,Ue)};function ee(K,ge,Te){Te===null?K.matrix.copy(ge.matrixWorld):(K.matrix.copy(Te.matrixWorld),K.matrix.invert(),K.matrix.multiply(ge.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(ge.projectionMatrix),K.projectionMatrixInverse.copy(ge.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=us*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return W},this.getFoveation=function(){if(!(d===null&&p===null))return l},this.setFoveation=function(K){l=K,d!==null&&(d.fixedFoveation=K),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=K)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(W)},this.getCameraTexture=function(K){return g[K]};let ie=null;function we(K,ge){if(h=ge.getViewerPose(c||a),u=ge,h!==null){const Te=h.views;p!==null&&(e.setRenderTargetFramebuffer(S,p.framebuffer),e.setRenderTarget(S));let Ue=!1;Te.length!==W.cameras.length&&(W.cameras.length=0,Ue=!0);for(let ke=0;ke<Te.length;ke++){const Ye=Te[ke];let Ke=null;if(p!==null)Ke=p.getViewport(Ye);else{const he=f.getViewSubImage(d,Ye);Ke=he.viewport,ke===0&&(e.setRenderTargetTextures(S,he.colorTexture,he.depthStencilTexture),e.setRenderTarget(S))}let te=F[ke];te===void 0&&(te=new dn,te.layers.enable(ke),te.viewport=new yt,F[ke]=te),te.matrix.fromArray(Ye.transform.matrix),te.matrix.decompose(te.position,te.quaternion,te.scale),te.projectionMatrix.fromArray(Ye.projectionMatrix),te.projectionMatrixInverse.copy(te.projectionMatrix).invert(),te.viewport.set(Ke.x,Ke.y,Ke.width,Ke.height),ke===0&&(W.matrix.copy(te.matrix),W.matrix.decompose(W.position,W.quaternion,W.scale)),Ue===!0&&W.cameras.push(te)}const Me=s.enabledFeatures;if(Me&&Me.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){f=n.getBinding();const ke=f.getDepthInformation(Te[0]);ke&&ke.isValid&&ke.texture&&m.init(ke,s.renderState)}if(Me&&Me.includes("camera-access")&&_){e.state.unbindTexture(),f=n.getBinding();for(let ke=0;ke<Te.length;ke++){const Ye=Te[ke].camera;if(Ye){let Ke=g[Ye];Ke||(Ke=new Bc,g[Ye]=Ke);const te=f.getCameraImage(Ye);Ke.sourceTexture=te}}}}for(let Te=0;Te<T.length;Te++){const Ue=w[Te],Me=T[Te];Ue!==null&&Me!==void 0&&Me.update(Ue,ge,c||a)}ie&&ie(K,ge),ge.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ge}),u=null}const Fe=new Jc;Fe.setAnimationLoop(we),this.setAnimationLoop=function(K){ie=K},this.dispose=function(){}}}const Pg=new _t,oh=new Xe;oh.set(-1,0,0,0,1,0,0,0,1);function Lg(i,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function n(m,g){g.color.getRGB(m.fogColor.value,Yc(i)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function s(m,g,x,y,S){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(m,g):g.isMeshLambertMaterial?(r(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(m,g),f(m,g)):g.isMeshPhongMaterial?(r(m,g),h(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(m,g),d(m,g),g.isMeshPhysicalMaterial&&p(m,g,S)):g.isMeshMatcapMaterial?(r(m,g),u(m,g)):g.isMeshDepthMaterial?r(m,g):g.isMeshDistanceMaterial?(r(m,g),_(m,g)):g.isMeshNormalMaterial?r(m,g):g.isLineBasicMaterial?(a(m,g),g.isLineDashedMaterial&&o(m,g)):g.isPointsMaterial?l(m,g,x,y):g.isSpriteMaterial?c(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===Jt&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===Jt&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);const x=e.get(g),y=x.envMap,S=x.envMapRotation;y&&(m.envMap.value=y,m.envMapRotation.value.setFromMatrix4(Pg.makeRotationFromEuler(S)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(oh),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function a(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function o(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function l(m,g,x,y){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*x,m.scale.value=y*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function c(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function h(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function f(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function d(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function p(m,g,x){m.ior.value=g.ior,g.diffuseRoughness>0&&(m.diffuseRoughness.value=g.diffuseRoughness,g.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=g.diffuseRoughnessMap,t(g.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Jt&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=g.iridescenceThicknessMaximum,g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function u(m,g){g.matcap&&(m.matcap.value=g.matcap)}function _(m,g){const x=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Dg(i,e,t,n){let s={},r={};function a(x,y){const S=y.program;n.uniformBlockBinding(x,S,s[x.id])}function o(x,y){let S=s[x.id];S===void 0&&(u(x),S=l(x),s[x.id]=S,x.addEventListener("dispose",m));const T=y.program;n.updateUBOMapping(x,T);const w=e.render.frame;r[x.id]!==w&&(c(x),r[x.id]=w)}function l(x){const y=i.createBuffer(),S=x.__size,T=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,S,T),i.bindBuffer(i.UNIFORM_BUFFER,null),y}function c(x){const y=s[x.id],S=x.uniforms,T=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,y);for(let w=0,v=S.length;w<v;w++){const b=S[w];if(Array.isArray(b))for(let P=0,R=b.length;P<R;P++)h(b[P],w,P,T);else h(b,w,0,T)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function h(x,y,S,T){if(d(x,y,S,T)===!0){const w=x.__offset,v=x.value;if(Array.isArray(v)){let b=0;for(let P=0;P<v.length;P++){const R=v[P],C=_(R,!0);f(R,x.__data,b),b+=C.storage/Float32Array.BYTES_PER_ELEMENT}}else f(v,x.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,w,x.__data)}}function f(x,y,S){typeof x=="number"||typeof x=="boolean"?y[S]=x:x.isMatrix3?(y[S]=x.elements[0],y[S+1]=x.elements[1],y[S+2]=x.elements[2],y[S+3]=0,y[S+4]=x.elements[3],y[S+5]=x.elements[4],y[S+6]=x.elements[5],y[S+7]=0,y[S+8]=x.elements[6],y[S+9]=x.elements[7],y[S+10]=x.elements[8],y[S+11]=0):ArrayBuffer.isView(x)?y.set(x.subarray(0,y.length-S),S):x.toArray(y,S)}function d(x,y,S,T){const w=x.value,v=y+"_"+S;if(Array.isArray(w)){T[v]===void 0&&(T[v]=[]);const b=T[v];let P=!1;for(let R=0;R<w.length;R++)p(w[R],b,R)===!0&&(P=!0);return P}return p(w,T,v)}function p(x,y,S){if(y[S]===void 0)return typeof x=="number"||typeof x=="boolean"?y[S]=x:ArrayBuffer.isView(x)?y[S]=x.slice():y[S]=x.clone(),!0;{const T=y[S];if(typeof x=="number"||typeof x=="boolean"){if(T!==x)return y[S]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(T.equals(x)===!1)return T.copy(x),!0}}return!1}function u(x){const y=x.uniforms;let S=0;const T=16;for(let v=0,b=y.length;v<b;v++){const P=Array.isArray(y[v])?y[v]:[y[v]];for(let R=0,C=P.length;R<C;R++){const F=P[R],W=Array.isArray(F.value)?F.value:[F.value],L=Array.isArray(y[v])||Array.isArray(F.value);let k=S;for(let z=0,se=W.length;z<se;z++){const $=W[z],ee=_($,L),ie=S%T,we=ie%ee.boundary,Fe=ie+we;S+=we,Fe!==0&&T-Fe<ee.storage&&(S+=T-Fe),z===0&&(k=S),S+=ee.storage}const X=F.type==="int"?Int32Array:F.type==="uint"?Uint32Array:Float32Array;F.__data=new X((S-k)/Float32Array.BYTES_PER_ELEMENT),F.__offset=k}}const w=S%T;return w>0&&(S+=T-w),x.__size=S,x.__cache={},this}function _(x,y){const S={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(S.boundary=4,S.storage=4):x.isVector2?(S.boundary=8,S.storage=8):x.isVector3||x.isColor?(S.boundary=16,S.storage=12):x.isVector4?(S.boundary=16,S.storage=16):x.isMatrix3?(S.boundary=16,S.storage=48):x.isMatrix4?(S.boundary=16,S.storage=64):x.isTexture?He("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(S.boundary=16,S.storage=x.byteLength):He("WebGLRenderer: Unsupported uniform value type.",x),y===!0&&(S.boundary=16,S.storage=Math.ceil(S.storage/16)*16),S}function m(x){const y=x.target;y.removeEventListener("dispose",m),i.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function g(){for(const x in s)i.deleteBuffer(s[x]);s={},r={}}return{bind:a,update:o,dispose:g}}const Ig=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let xn=null;function Ng(){return xn===null&&(xn=new $u(Ig,16,16,ui,Tn),xn.name="DFG_LUT",xn.minFilter=Zt,xn.magFilter=Zt,xn.wrapS=Un,xn.wrapT=Un,xn.generateMipmaps=!1,xn.needsUpdate=!0),xn}class Ug{constructor(e={}){const{canvas:t=ou(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:d=!1,outputBufferType:p=tn}=e;this.isWebGLRenderer=!0;let u;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");u=n.getContextAttributes().alpha}else u=a;const _=p,m=new Set([io,no,to]),g=new Set([tn,wn,cs,Fi,ja,eo]),x=new Uint32Array(4),y=new Int32Array(4),S={textures:[],min:[],max:[],resolution:[]};let T=null,w=null;const v=[],b=[];let P=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=On,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const R=this;let C=!1,F=null,W=null,L=null,k=null;this._outputColorSpace=an;let X=0,z=0,se=null,$=-1,ee=null;const ie=new yt,we=new yt;let Fe=null;const K=new Ve(0);let ge=0,Te=t.width,Ue=t.height,Me=1,Oe=null,dt=null;const ke=new yt(0,0,Te,Ue),Ye=new yt(0,0,Te,Ue);let Ke=!1;const te=new ds,he=new co;let q=!1,ae=!1;const re=new _t,Be=new O,Ae=new yt,$e={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Je=!1;function et(){return se===null?Me:1}let U=n;function xt(E,N){return t.getContext(E,N)}let tt,ft,_e,wt,Ge,We,A,M,H,oe,ne,ue,ve,J,Q,fe,I,j,Z,pe,ce,de,Ne;try{const E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Za}`),t.addEventListener("webglcontextlost",ze,!1),t.addEventListener("webglcontextrestored",Ze,!1),t.addEventListener("webglcontextcreationerror",ye,!1),U===null){const N="webgl2";if(U=xt(N,E),U===null)throw xt(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Qe()}catch(E){throw t.removeEventListener("webglcontextlost",ze,!1),t.removeEventListener("webglcontextrestored",Ze,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),ot("WebGLRenderer: "+E.message),E}function Qe(){tt=new B0(U),tt.init(),ce=new wg(U,tt),ft=new A0(U,tt,e,ce),_e=new Eg(U,tt),ft.reversedDepthBuffer&&d&&_e.buffers.depth.setReversed(!0),W=U.createFramebuffer(),L=U.createFramebuffer(),k=U.createFramebuffer(),wt=new G0(U),Ge=new cg,We=new bg(U,tt,_e,Ge,ft,ce,wt),A=new O0(R),M=new Hd(U),de=new w0(U,M),H=new z0(U,M,wt,de),oe=new V0(U,H,M,de,wt),j=new H0(U,ft,We),Q=new R0(Ge),ne=new lg(R,A,tt,ft,de,Q),ue=new Lg(R,Ge),ve=new ug,J=new _g(tt),I=new b0(R,A,_e,oe,u,l),fe=new yg(R,oe,ft),Ne=new Dg(U,wt,ft,_e),Z=new T0(U,tt,wt),pe=new k0(U,tt,wt),wt.programs=ne.programs,R.capabilities=ft,R.extensions=tt,R.properties=Ge,R.renderLists=ve,R.shadowMap=fe,R.state=_e,R.info=wt}_!==tn&&(P=new X0(_,t.width,t.height,o,s,r));const le=new Cg(R,U);this.xr=le,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const E=tt.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=tt.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return Me},this.setPixelRatio=function(E){E!==void 0&&(Me=E,this.setSize(Te,Ue,!1))},this.getSize=function(E){return E.set(Te,Ue)},this.setSize=function(E,N,Y=!0){if(le.isPresenting){He("WebGLRenderer: Can't change size while VR device is presenting.");return}Te=E,Ue=N,t.width=Math.floor(E*Me),t.height=Math.floor(N*Me),Y===!0&&(t.style.width=E+"px",t.style.height=N+"px"),P!==null&&P.setSize(t.width,t.height),this.setViewport(0,0,E,N)},this.getDrawingBufferSize=function(E){return E.set(Te*Me,Ue*Me).floor()},this.setDrawingBufferSize=function(E,N,Y){Te=E,Ue=N,Me=Y,t.width=Math.floor(E*Y),t.height=Math.floor(N*Y),this.setViewport(0,0,E,N)},this.setEffects=function(E){if(_===tn){ot("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(E){for(let N=0;N<E.length;N++)if(E[N].isOutputPass===!0){He("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}P.setEffects(E||[])},this.getCurrentViewport=function(E){return E.copy(ie)},this.getViewport=function(E){return E.copy(ke)},this.setViewport=function(E,N,Y,G){E.isVector4?ke.set(E.x,E.y,E.z,E.w):ke.set(E,N,Y,G),_e.viewport(ie.copy(ke).multiplyScalar(et()).round())},this.getScissor=function(E){return E.copy(Ye)},this.setScissor=function(E,N,Y,G){E.isVector4?Ye.set(E.x,E.y,E.z,E.w):Ye.set(E,N,Y,G),_e.scissor(we.copy(Ye).multiplyScalar(et()).round())},this.getScissorTest=function(){return Ke},this.setScissorTest=function(E){_e.setScissorTest(Ke=E)},this.setOpaqueSort=function(E){Oe=E},this.setTransparentSort=function(E){dt=E},this.getClearColor=function(E){return E.copy(I.getClearColor())},this.setClearColor=function(){I.setClearColor(...arguments)},this.getClearAlpha=function(){return I.getClearAlpha()},this.setClearAlpha=function(){I.setClearAlpha(...arguments)},this.clear=function(E=!0,N=!0,Y=!0){let G=0;if(E){let V=!1;if(se!==null){const xe=se.texture.format;V=m.has(xe)}if(V){const xe=se.texture.type,Ce=g.has(xe),me=I.getClearColor(),be=I.getClearAlpha(),De=me.r,qe=me.g,it=me.b;Ce?(x[0]=De,x[1]=qe,x[2]=it,x[3]=be,U.clearBufferuiv(U.COLOR,0,x)):(y[0]=De,y[1]=qe,y[2]=it,y[3]=be,U.clearBufferiv(U.COLOR,0,y))}else G|=U.COLOR_BUFFER_BIT}N&&(G|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(G|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&U.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),F=E},this.dispose=function(){t.removeEventListener("webglcontextlost",ze,!1),t.removeEventListener("webglcontextrestored",Ze,!1),t.removeEventListener("webglcontextcreationerror",ye,!1),I.dispose(),ve.dispose(),J.dispose(),We.dispose(),Ge.dispose(),A.dispose(),oe.dispose(),H.dispose(),de.dispose(),Ne.dispose(),ne.dispose(),le.dispose(),le.removeEventListener("sessionstart",Lo),le.removeEventListener("sessionend",Do),ni.stop()};function ze(E){E.preventDefault(),Yo("WebGLRenderer: Context Lost."),C=!0}function Ze(){Yo("WebGLRenderer: Context Restored."),C=!1;const E=wt.autoReset,N=fe.enabled,Y=fe.autoUpdate,G=fe.needsUpdate,V=fe.type;Qe(),wt.autoReset=E,fe.enabled=N,fe.autoUpdate=Y,fe.needsUpdate=G,fe.type=V}function ye(E){ot("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function ht(E){const N=E.target;N.removeEventListener("dispose",ht),Dt(N)}function Dt(E){Gn(E),Ge.remove(E)}function Gn(E){const N=Ge.get(E).programs;N!==void 0&&(N.forEach(function(Y){ne.releaseProgram(Y)}),E.isShaderMaterial&&ne.releaseShaderCache(E))}this.renderBufferDirect=function(E,N,Y,G,V,xe){N===null&&(N=$e);const Ce=V.isMesh&&V.matrixWorld.determinantAffine()<0,me=yh(E,N,Y,G,V);_e.setMaterial(G,Ce);let be=Y.index,De=1;if(G.wireframe===!0){if(be=H.getWireframeAttribute(Y),be===void 0)return;De=2}const qe=Y.drawRange,it=Y.attributes.position;let Pe=qe.start*De,st=(qe.start+qe.count)*De;xe!==null&&(Pe=Math.max(Pe,xe.start*De),st=Math.min(st,(xe.start+xe.count)*De)),be!==null?(Pe=Math.max(Pe,0),st=Math.min(st,be.count)):it!=null&&(Pe=Math.max(Pe,0),st=Math.min(st,it.count));const Rt=st-Pe;if(Rt<0||Rt===1/0)return;de.setup(V,G,me,Y,be);let vt,pt=Z;if(be!==null&&(vt=M.get(be),pt=pe,pt.setIndex(vt)),V.isMesh)G.wireframe===!0?(_e.setLineWidth(G.wireframeLinewidth*et()),pt.setMode(U.LINES)):pt.setMode(U.TRIANGLES);else if(V.isLine){let Gt=G.linewidth;Gt===void 0&&(Gt=1),_e.setLineWidth(Gt*et()),V.isLineSegments?pt.setMode(U.LINES):V.isLineLoop?pt.setMode(U.LINE_LOOP):pt.setMode(U.LINE_STRIP)}else V.isPoints?pt.setMode(U.POINTS):V.isSprite&&pt.setMode(U.TRIANGLES);if(V.isBatchedMesh)if(tt.get("WEBGL_multi_draw"))pt.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{const Gt=V._multiDrawStarts,Le=V._multiDrawCounts,Yt=V._multiDrawCount,lt=be?M.get(be).bytesPerElement:1,ii=Ge.get(G).currentProgram.getUniforms();for(let Ht=0;Ht<Yt;Ht++)ii.setValue(U,"_gl_DrawID",Ht),pt.render(Gt[Ht]/lt,Le[Ht])}else if(V.isInstancedMesh)pt.renderInstances(Pe,Rt,V.count);else if(Y.isInstancedBufferGeometry){const Gt=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,Le=Math.min(Y.instanceCount,Gt);pt.renderInstances(Pe,Rt,Le)}else pt.render(Pe,Rt)};function Po(E,N,Y,G){F!==null&&E.isNodeMaterial&&F.setObject(G,E),q===!0&&Q.setState(E,Y,!1),E.transparent===!0&&E.side===Sn&&E.forceSinglePass===!1?(E.side=Jt,E.needsUpdate=!0,Vi(E,N,G),E.side=hi,E.needsUpdate=!0,Vi(E,N,G),E.side=Sn):Vi(E,N,G)}this.compile=function(E,N,Y=null){Y===null&&(Y=E),F!==null&&F.renderStart(E,N,Y),w=J.get(Y),w.init(N),b.push(w),Y.traverseVisible(function(V){V.isLight&&V.layers.test(N.layers)&&(w.pushLight(V),V.castShadow&&w.pushShadow(V))}),E!==Y&&E.traverseVisible(function(V){V.isLight&&V.layers.test(N.layers)&&(w.pushLight(V),V.castShadow&&w.pushShadow(V))}),w.setupLights(),F!==null&&F.updateLights(w.state.lightsArray),ae=this.localClippingEnabled,q=Q.init(this.clippingPlanes,ae),q===!0&&Q.setGlobalState(this.clippingPlanes,N),F!==null&&fe.render(w.state.shadowsArray,Y,N);const G=new Set;return E.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;const xe=V.material;if(xe)if(Array.isArray(xe))for(let Ce=0;Ce<xe.length;Ce++){const me=xe[Ce];Po(me,Y,N,V),G.add(me)}else Po(xe,Y,N,V),G.add(xe)}),w=b.pop(),F!==null&&F.renderEnd(),G},this.compileAsync=function(E,N,Y=null){const G=this.compile(E,N,Y);return new Promise(V=>{function xe(){if(G.forEach(function(Ce){const be=Ge.get(Ce).currentProgram;(be===void 0||be.isReady())&&G.delete(Ce)}),G.size===0){V(E);return}setTimeout(xe,10)}tt.get("KHR_parallel_shader_compile")!==null?xe():setTimeout(xe,10)})};let vr=null;function Mh(E){vr&&vr(E)}function Lo(){ni.stop()}function Do(){ni.start()}const ni=new Jc;ni.setAnimationLoop(Mh),typeof self<"u"&&ni.setContext(self),this.setAnimationLoop=function(E){vr=E,le.setAnimationLoop(E),E===null?ni.stop():ni.start()},le.addEventListener("sessionstart",Lo),le.addEventListener("sessionend",Do),this.render=function(E,N){if(N!==void 0&&N.isCamera!==!0){ot("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;F!==null&&F.renderStart(E,N);const Y=le.enabled===!0&&le.isPresenting===!0,G=P!==null&&(se===null||Y)&&P.begin(R,se);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),le.enabled===!0&&le.isPresenting===!0&&(P===null||P.isCompositing()===!1)&&(le.cameraAutoUpdate===!0&&le.updateCamera(N),N=le.getCamera()),E.isScene===!0&&E.onBeforeRender(R,E,N,se),w=J.get(E,b.length),w.init(N),w.state.textureUnits=We.getTextureUnits(),b.push(w),re.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),N.isArrayCamera?he.setFromArrayCamera(N):te.setFromProjectionMatrix(re,mn,N.reversedDepth),ae=this.localClippingEnabled,q=Q.init(this.clippingPlanes,ae),T=ve.get(E,v.length),T.init(),v.push(T),this.info.render.frame++,le.enabled===!0&&le.isPresenting===!0){const Ce=R.xr.getDepthSensingMesh();Ce!==null&&xr(Ce,N,-1/0,R.sortObjects)}xr(E,N,0,R.sortObjects),T.finish(),F!==null&&F.updateLights(w.state.lightsArray),R.sortObjects===!0&&T.sort(Oe,dt),Je=le.enabled===!1||le.isPresenting===!1||le.hasDepthSensing()===!1,Je&&I.addToRenderList(T,E),this.info.autoReset===!0&&this.info.reset(),q===!0&&Q.beginShadows();const V=w.state.shadowsArray;if(fe.render(V,E,N),q===!0&&Q.endShadows(),(G&&P.hasRenderPass())===!1){const Ce=T.opaque,me=T.transmissive;if(w.setupLights(),N.isArrayCamera){const be=N.cameras;if(me.length>0)for(let De=0,qe=be.length;De<qe;De++){const it=be[De];No(Ce,me,E,it)}Je&&I.render(E);for(let De=0,qe=be.length;De<qe;De++){const it=be[De];Io(T,E,it,it.viewport)}}else me.length>0&&No(Ce,me,E,N),Je&&I.render(E),Io(T,E,N)}se!==null&&z===0&&(We.updateMultisampleRenderTarget(se),We.updateRenderTargetMipmap(se)),G&&P.end(R),E.isScene===!0&&E.onAfterRender(R,E,N),de.resetDefaultState(),$=-1,ee=null,b.pop(),b.length>0?(w=b[b.length-1],We.setTextureUnits(w.state.textureUnits),q===!0&&Q.setGlobalState(R.clippingPlanes,w.state.camera)):w=null,v.pop(),v.length>0?T=v[v.length-1]:T=null,F!==null&&F.renderEnd()};function xr(E,N,Y,G){if(E.visible===!1)return;if(E.layers.test(N.layers)){if(E.isGroup)Y=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(N);else if(E.isLight)w.pushLight(E),E.castShadow&&w.pushShadow(E);else if(E.isSprite){const Ce=N.isArrayCamera?he:te;if(!E.frustumCulled||E.intersectsFrustum(Ce)){G&&Ae.setFromMatrixPosition(E.matrixWorld).applyMatrix4(re);const me=oe.update(E),be=E.material;be.visible&&T.push(E,me,be,Y,Ae.z,null,N)}}else if(E.isMesh||E.isLine||E.isPoints){const Ce=N.isArrayCamera?he:te;if(!E.frustumCulled||E.intersectsFrustum(Ce)){const me=oe.update(E),be=E.material;if(G&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Ae.copy(E.boundingSphere.center)):(me.boundingSphere===null&&me.computeBoundingSphere(),Ae.copy(me.boundingSphere.center)),Ae.applyMatrix4(E.matrixWorld).applyMatrix4(re)),Array.isArray(be)){const De=me.groups;for(let qe=0,it=De.length;qe<it;qe++){const Pe=De[qe],st=be[Pe.materialIndex];st&&st.visible&&T.push(E,me,st,Y,Ae.z,Pe,N)}}else be.visible&&T.push(E,me,be,Y,Ae.z,null,N)}}}const xe=E.children;for(let Ce=0,me=xe.length;Ce<me;Ce++)xr(xe[Ce],N,Y,G)}function Io(E,N,Y,G){const{opaque:V,transmissive:xe,transparent:Ce}=E;w.setupLightsView(Y),q===!0&&Q.setGlobalState(R.clippingPlanes,Y),G&&_e.viewport(ie.copy(G)),V.length>0&&Ms(V,N,Y),xe.length>0&&Ms(xe,N,Y),Ce.length>0&&Ms(Ce,N,Y),_e.buffers.depth.setTest(!0),_e.buffers.depth.setMask(!0),_e.buffers.color.setMask(!0),_e.setPolygonOffset(!1)}function No(E,N,Y,G){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[G.id]===void 0){const Pe=tt.has("EXT_color_buffer_half_float")||tt.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[G.id]=new bn(1,1,{generateMipmaps:!0,type:Pe?Tn:tn,minFilter:Zn,samples:Math.max(4,ft.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:rt.workingColorSpace})}const xe=w.state.transmissionRenderTarget[G.id],Ce=G.viewport||ie;xe.setSize(Ce.z*R.transmissionResolutionScale,Ce.w*R.transmissionResolutionScale);const me=R.getRenderTarget(),be=R.getActiveCubeFace(),De=R.getActiveMipmapLevel();R.setRenderTarget(xe),R.getClearColor(K),ge=R.getClearAlpha(),ge<1&&R.setClearColor(16777215,.5),R.clear(),Je&&I.render(Y);const qe=R.toneMapping;R.toneMapping=On;const it=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),w.setupLightsView(G),q===!0&&Q.setGlobalState(R.clippingPlanes,G),Ms(E,Y,G),We.updateMultisampleRenderTarget(xe),We.updateRenderTargetMipmap(xe),tt.has("WEBGL_multisampled_render_to_texture")===!1){let Pe=!1;for(let st=0,Rt=N.length;st<Rt;st++){const vt=N[st],{object:pt,geometry:Gt,material:Le,group:Yt}=vt;if(Le.side===Sn&&pt.layers.test(G.layers)){const lt=Le.side;Le.side=Jt,Le.needsUpdate=!0,Uo(pt,Y,G,Gt,Le,Yt),Le.side=lt,Le.needsUpdate=!0,Pe=!0}}Pe===!0&&(We.updateMultisampleRenderTarget(xe),We.updateRenderTargetMipmap(xe))}R.setRenderTarget(me,be,De),R.setClearColor(K,ge),it!==void 0&&(G.viewport=it),R.toneMapping=qe}function Ms(E,N,Y){const G=N.isScene===!0?N.overrideMaterial:null;for(let V=0,xe=E.length;V<xe;V++){const Ce=E[V],{object:me,geometry:be,group:De}=Ce;let qe=Ce.material;qe.allowOverride===!0&&G!==null&&(qe=G),me.layers.test(Y.layers)&&Uo(me,N,Y,be,qe,De)}}function Uo(E,N,Y,G,V,xe){F!==null&&V.isNodeMaterial&&F.setObject(E,V),E.onBeforeRender(R,N,Y,G,V,xe),E.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),V.onBeforeRender(R,N,Y,G,E,xe),V.transparent===!0&&V.side===Sn&&V.forceSinglePass===!1?(V.side=Jt,V.needsUpdate=!0,R.renderBufferDirect(Y,N,G,V,E,xe),V.side=hi,V.needsUpdate=!0,R.renderBufferDirect(Y,N,G,V,E,xe),V.side=Sn):R.renderBufferDirect(Y,N,G,V,E,xe),E.onAfterRender(R,N,Y,G,V,xe)}function Fo(E){let N=0;for(const Y of E)Y.texture!==null&&N++;return N}function Vi(E,N,Y){N.isScene!==!0&&(N=$e);const G=Ge.get(E),V=w.state.lights,xe=w.state.shadowsArray,Ce=V.state.version,me=ne.getParameters(E,V.state,xe,N,Y,w.state.lightProbeGridArray),be=ne.getProgramCacheKey(me);let De=G.programs;G.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?N.environment:null,G.fog=N.fog;const qe=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;G.envMap=A.get(E.envMap||G.environment,qe),G.envMapRotation=G.environment!==null&&E.envMap===null?N.environmentRotation:E.envMapRotation,De===void 0&&(E.addEventListener("dispose",ht),De=new Map,G.programs=De,G.programVariants=new Map);let it=De.get(be);if(it!==void 0){if(G.currentProgram===it&&G.lightsStateVersion===Ce)return Bo(E,me),it}else me.uniforms=ne.getUniforms(E),F!==null&&E.isNodeMaterial&&F.build(E,Y,me),E.onBeforeCompile(me,R),it=ne.acquireProgram(me,be),De.set(be,it),G.uniforms=me.uniforms;const Pe=G.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Pe.clippingPlanes=Q.uniform),Bo(E,me),G.needsLights=bh(E),G.lightsStateVersion=Ce,G.needsLights&&(Pe.ambientLightColor.value=V.state.ambient,Pe.lightProbe.value=V.state.probe,Pe.sunLights.value=V.state.sun,Pe.sunLightShadows.value=V.state.sunShadow,Pe.directionalLights.value=V.state.directional,Pe.directionalLightShadows.value=V.state.directionalShadow,Pe.spotLights.value=V.state.spot,Pe.spotLightShadows.value=V.state.spotShadow,Pe.rectAreaLights.value=V.state.rectArea,Pe.ltc_1.value=V.state.rectAreaLTC1,Pe.ltc_2.value=V.state.rectAreaLTC2,Pe.pointLights.value=V.state.point,Pe.pointLightShadows.value=V.state.pointShadow,Pe.hemisphereLights.value=V.state.hemi,Pe.sunShadowMatrix.value=V.state.sunShadowMatrix,Pe.sunShadowCascade.value=V.state.sunShadowCascade,Pe.directionalShadowMatrix.value=V.state.directionalShadowMatrix,Pe.spotLightMatrix.value=V.state.spotLightMatrix,Pe.spotLightMap.value=V.state.spotLightMap,Pe.pointShadowMatrix.value=V.state.pointShadowMatrix),G.numLightProbeGrids=Fo(w.state.lightProbeGridArray),G.currentProgram=it,G.uniformsList=null,it}function Sh(E,N,Y,G,V){const xe=Ge.get(E),Ce=xe.currentProgram.id+","+G+","+V;let me=xe.programVariants.get(Ce);return me===void 0?(me=Vi(E,N,Y),xe.programVariants.set(Ce,me)):(xe.currentProgram=me,xe.uniformsList=null,xe.outputColorSpace=G,xe.toneMapping=V),me}function Oo(E){if(E.uniformsList===null){const N=E.currentProgram.getUniforms();E.uniformsList=nr.seqWithValue(N.seq,E.uniforms)}return E.uniformsList}function Bo(E,N){const Y=Ge.get(E);Y.outputColorSpace=N.outputColorSpace,Y.batching=N.batching,Y.batchingColor=N.batchingColor,Y.instancing=N.instancing,Y.instancingColor=N.instancingColor,Y.instancingMorph=N.instancingMorph,Y.skinning=N.skinning,Y.morphTargets=N.morphTargets,Y.morphNormals=N.morphNormals,Y.morphColors=N.morphColors,Y.morphTargetsCount=N.morphTargetsCount,Y.numClippingPlanes=N.numClippingPlanes,Y.numIntersection=N.numClipIntersection,Y.vertexAlphas=N.vertexAlphas,Y.vertexTangents=N.vertexTangents,Y.toneMapping=N.toneMapping}function yh(E,N,Y,G,V){N.isScene!==!0&&(N=$e),We.resetTextureUnits();const xe=N.fog,Ce=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?N.environment:null,me=se===null?R.outputColorSpace:se.isXRRenderTarget===!0?se.texture.colorSpace:rt.workingColorSpace,be=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,De=A.get(G.envMap||Ce,be),qe=G.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,it=!!Y.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Pe=!!Y.morphAttributes.position,st=!!Y.morphAttributes.normal,Rt=!!Y.morphAttributes.color;let vt=On;G.toneMapped&&(se===null||se.isXRRenderTarget===!0)&&(vt=R.toneMapping);const pt=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Gt=pt!==void 0?pt.length:0,Le=Ge.get(G),Yt=w.state.lights;if(q===!0&&(ae===!0||E!==ee)){const Mt=E===ee&&G.id===$;Q.setState(G,E,Mt)}let lt=!1,ii=!1;G.version===Le.__version?Le.needsLights&&Le.lightsStateVersion!==Yt.state.version||V.isBatchedMesh&&Le.batching===!1||!V.isBatchedMesh&&Le.batching===!0||V.isBatchedMesh&&Le.batchingColor===!0&&V._colorsTexture===null||V.isBatchedMesh&&Le.batchingColor===!1&&V._colorsTexture!==null||V.isInstancedMesh&&Le.instancing===!1||!V.isInstancedMesh&&Le.instancing===!0||V.isSkinnedMesh&&Le.skinning===!1||!V.isSkinnedMesh&&Le.skinning===!0||V.isInstancedMesh&&Le.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&Le.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&Le.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&Le.instancingMorph===!1&&V.morphTexture!==null||Le.envMap!==De||G.fog===!0&&Le.fog!==xe||Le.numClippingPlanes!==void 0&&(Le.numClippingPlanes!==Q.numPlanes||Le.numIntersection!==Q.numIntersection)||Le.vertexAlphas!==qe||Le.vertexTangents!==it||Le.morphTargets!==Pe||Le.morphNormals!==st||Le.morphColors!==Rt||Le.morphTargetsCount!==Gt||Le.numLightProbeGrids!==Fo(w.state.lightProbeGridArray)?lt=!0:(Le.outputColorSpace!==me||Le.toneMapping!==vt)&&(ii=!0):(lt=!0,Le.__version=G.version);let Ht=Le.currentProgram;(lt===!0||ii===!0)&&(Ht=ii===!0?Sh(G,N,V,me,vt):Vi(G,N,V),F&&G.isNodeMaterial&&F.onUpdateProgram(G,Ht,Le));let Ss=!1,Hn=!1,si=!1;const at=Ht.getUniforms(),Ut=Le.uniforms;if(_e.useProgram(Ht.program)&&(Ss=!0,Hn=!0,si=!0),G.id!==$&&($=G.id,Hn=!0),Ss||ee!==E){_e.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),at.setValue(U,"projectionMatrix",E.projectionMatrix),at.setValue(U,"viewMatrix",E.matrixWorldInverse);const It=at.map.cameraPosition;It!==void 0&&It.setValue(U,Be.setFromMatrixPosition(E.matrixWorld)),ft.logarithmicDepthBuffer&&at.setValue(U,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&at.setValue(U,"isOrthographic",E.isOrthographicCamera===!0),ee!==E&&(ee=E,Hn=!0,si=!0)}if(Le.needsLights&&(Yt.state.sunShadowMap.length>0&&at.setValue(U,"sunShadowMap",Yt.state.sunShadowMap,We),Yt.state.directionalShadowMap.length>0&&at.setValue(U,"directionalShadowMap",Yt.state.directionalShadowMap,We),Yt.state.spotShadowMap.length>0&&at.setValue(U,"spotShadowMap",Yt.state.spotShadowMap,We),Yt.state.pointShadowMap.length>0&&at.setValue(U,"pointShadowMap",Yt.state.pointShadowMap,We)),V.isSkinnedMesh){at.setOptional(U,V,"bindMatrix"),at.setOptional(U,V,"bindMatrixInverse");const Mt=V.skeleton;Mt&&(Mt.boneTexture===null&&Mt.computeBoneTexture(),at.setValue(U,"boneTexture",Mt.boneTexture,We))}V.isBatchedMesh&&(at.setOptional(U,V,"batchingTexture"),at.setValue(U,"batchingTexture",V._matricesTexture,We),at.setOptional(U,V,"batchingIdTexture"),at.setValue(U,"batchingIdTexture",V._indirectTexture,We),at.setOptional(U,V,"batchingColorTexture"),V._colorsTexture!==null&&at.setValue(U,"batchingColorTexture",V._colorsTexture,We));const ln=Y.morphAttributes;if((ln.position!==void 0||ln.normal!==void 0||ln.color!==void 0)&&j.update(V,Y,Ht),(Hn||Le.receiveShadow!==V.receiveShadow)&&(Le.receiveShadow=V.receiveShadow,at.setValue(U,"receiveShadow",V.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&N.environment!==null&&(Ut.envMapIntensity.value=N.environmentIntensity),Ut.dfgLUT!==void 0&&(Ut.dfgLUT.value=Ng()),Hn){if(at.setValue(U,"toneMappingExposure",R.toneMappingExposure),Le.needsLights&&Eh(Ut,si),xe&&G.fog===!0&&ue.refreshFogUniforms(Ut,xe),ue.refreshMaterialUniforms(Ut,G,Me,Ue,w.state.transmissionRenderTarget[E.id]),Le.needsLights&&Le.numLightProbeGrids>0){const Mt=S;let It=0;for(const Rn of w.state.lightProbeGridArray)Rn.texture!==null&&(Mt.textures[It]=Rn.texture,Mt.min[It]=Rn.boundingBox.min,Mt.max[It]=Rn.boundingBox.max,Mt.resolution[It]=Rn.resolution,It++);for(const Rn in Mt)Mt[Rn].length=It;Ut.probesSH.value=Mt.textures,Ut.probesMin.value=Mt.min,Ut.probesMax.value=Mt.max,Ut.probesResolution.value=Mt.resolution}nr.upload(U,Oo(Le),Ut,We)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(nr.upload(U,Oo(Le),Ut,We),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&at.setValue(U,"center",V.center),at.setValue(U,"modelViewMatrix",V.modelViewMatrix),at.setValue(U,"normalMatrix",V.normalMatrix),at.setValue(U,"modelMatrix",V.matrixWorld),G.uniformsGroups!==void 0){const Mt=G.uniformsGroups;for(let It=0,Rn=Mt.length;It<Rn;It++){const ko=Mt[It];Ne.update(ko,Ht),Ne.bind(ko,Ht)}}return Ht}function Eh(E,N){E.ambientLightColor.needsUpdate=N,E.lightProbe.needsUpdate=N,E.sunLights.needsUpdate=N,E.sunLightShadows.needsUpdate=N,E.directionalLights.needsUpdate=N,E.directionalLightShadows.needsUpdate=N,E.pointLights.needsUpdate=N,E.pointLightShadows.needsUpdate=N,E.spotLights.needsUpdate=N,E.spotLightShadows.needsUpdate=N,E.rectAreaLights.needsUpdate=N,E.hemisphereLights.needsUpdate=N}function bh(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return se},this.setRenderTargetTextures=function(E,N,Y){const G=Ge.get(E);G.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),Ge.get(E.texture).__webglTexture=N,Ge.get(E.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:Y,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,N){const Y=Ge.get(E);Y.__webglFramebuffer=N,Y.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(E,N=0,Y=0){se=E,X=N,z=Y;let G=null,V=!1,xe=!1;if(E){const me=Ge.get(E);if(me.__useDefaultFramebuffer!==void 0){_e.bindFramebuffer(U.FRAMEBUFFER,me.__webglFramebuffer),ie.copy(E.viewport),we.copy(E.scissor),Fe=E.scissorTest,_e.viewport(ie),_e.scissor(we),_e.setScissorTest(Fe),$=-1;return}else if(me.__webglFramebuffer===void 0)We.setupRenderTarget(E);else if(me.__hasExternalTextures)We.rebindTextures(E,Ge.get(E.texture).__webglTexture,Ge.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const qe=E.depthTexture;if(me.__boundDepthTexture!==qe){if(qe!==null&&Ge.has(qe)&&(E.width!==qe.image.width||E.height!==qe.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");We.setupDepthRenderbuffer(E)}}const be=E.texture;(be.isData3DTexture||be.isDataArrayTexture||be.isCompressedArrayTexture)&&(xe=!0);const De=Ge.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(De[N])?G=De[N][Y]:G=De[N],V=!0):E.samples>0&&We.useMultisampledRTT(E)===!1?G=Ge.get(E).__webglMultisampledFramebuffer:Array.isArray(De)?G=De[Y]:G=De,ie.copy(E.viewport),we.copy(E.scissor),Fe=E.scissorTest}else ie.copy(ke).multiplyScalar(Me).floor(),we.copy(Ye).multiplyScalar(Me).floor(),Fe=Ke;if(Y!==0&&(G=W),_e.bindFramebuffer(U.FRAMEBUFFER,G)&&_e.drawBuffers(E,G),_e.viewport(ie),_e.scissor(we),_e.setScissorTest(Fe),V){const me=Ge.get(E.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+N,me.__webglTexture,Y)}else if(xe){const me=N;for(let be=0;be<E.textures.length;be++){const De=Ge.get(E.textures[be]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+be,De.__webglTexture,Y,me)}}else if(E!==null&&Y!==0){const me=Ge.get(E.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,me.__webglTexture,Y)}$=-1};function zo(E){const N=Ge.get(E);return(N.__readFormat!==E.format||N.__readType!==E.type)&&(N.__readFormat=E.format,N.__readType=E.type,N.__formatReadable=ft.textureFormatReadable(E.format),N.__typeReadable=ft.textureTypeReadable(E.type)),N}this.readRenderTargetPixels=function(E,N,Y,G,V,xe,Ce,me=0){if(!(E&&E.isWebGLRenderTarget)){ot("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let be=Ge.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Ce!==void 0&&(be=be[Ce],Array.isArray(be)&&(be=be[0])),be){_e.bindFramebuffer(U.FRAMEBUFFER,be);try{const De=E.textures[me],qe=De.format,it=De.type;E.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+me);const Pe=zo(De);if(Pe.__formatReadable===!1){ot("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Pe.__typeReadable===!1){ot("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=E.width-G&&Y>=0&&Y<=E.height-V&&U.readPixels(N,Y,G,V,ce.convert(qe),ce.convert(it),xe)}finally{const De=se!==null?Ge.get(se).__webglFramebuffer:null;_e.bindFramebuffer(U.FRAMEBUFFER,De)}}},this.readRenderTargetPixelsAsync=async function(E,N,Y,G,V,xe,Ce,me=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let be=Ge.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Ce!==void 0&&(be=be[Ce],Array.isArray(be)&&(be=be[0])),be)if(N>=0&&N<=E.width-G&&Y>=0&&Y<=E.height-V){_e.bindFramebuffer(U.FRAMEBUFFER,be);const De=E.textures[me],qe=De.format,it=De.type;E.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+me);const Pe=zo(De);if(Pe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Pe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const st=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,st),U.bufferData(U.PIXEL_PACK_BUFFER,xe.byteLength,U.STREAM_READ),U.readPixels(N,Y,G,V,ce.convert(qe),ce.convert(it),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);const Rt=se!==null?Ge.get(se).__webglFramebuffer:null;_e.bindFramebuffer(U.FRAMEBUFFER,Rt);const vt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await lu(U,vt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,st),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,xe),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer(st),U.deleteSync(vt),xe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,N=null,Y=0){const G=Math.pow(2,-Y),V=Math.floor(E.image.width*G),xe=Math.floor(E.image.height*G),Ce=N!==null?N.x:0,me=N!==null?N.y:0;We.setTexture2D(E,0),U.copyTexSubImage2D(U.TEXTURE_2D,Y,0,0,Ce,me,V,xe),_e.unbindTexture()},this.copyTextureToTexture=function(E,N,Y=null,G=null,V=0,xe=0){let Ce,me,be,De,qe,it,Pe,st,Rt;const vt=E.isCompressedTexture?E.mipmaps[xe]:E.image;if(Y!==null)Ce=Y.max.x-Y.min.x,me=Y.max.y-Y.min.y,be=Y.isBox3?Y.max.z-Y.min.z:1,De=Y.min.x,qe=Y.min.y,it=Y.isBox3?Y.min.z:0;else{const at=Math.pow(2,-V);Ce=Math.floor(vt.width*at),me=Math.floor(vt.height*at),E.isDataArrayTexture?be=vt.depth:E.isData3DTexture?be=Math.floor(vt.depth*at):be=1,De=0,qe=0,it=0}G!==null?(Pe=G.x,st=G.y,Rt=G.z):(Pe=0,st=0,Rt=0);const pt=ce.convert(N.format),Gt=ce.convert(N.type);let Le;N.isData3DTexture?(We.setTexture3D(N,0),Le=U.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(We.setTexture2DArray(N,0),Le=U.TEXTURE_2D_ARRAY):(We.setTexture2D(N,0),Le=U.TEXTURE_2D),_e.activeTexture(U.TEXTURE0),_e.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,N.flipY),_e.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),_e.pixelStorei(U.UNPACK_ALIGNMENT,N.unpackAlignment);const Yt=_e.getParameter(U.UNPACK_ROW_LENGTH),lt=_e.getParameter(U.UNPACK_IMAGE_HEIGHT),ii=_e.getParameter(U.UNPACK_SKIP_PIXELS),Ht=_e.getParameter(U.UNPACK_SKIP_ROWS),Ss=_e.getParameter(U.UNPACK_SKIP_IMAGES);_e.pixelStorei(U.UNPACK_ROW_LENGTH,vt.width),_e.pixelStorei(U.UNPACK_IMAGE_HEIGHT,vt.height),_e.pixelStorei(U.UNPACK_SKIP_PIXELS,De),_e.pixelStorei(U.UNPACK_SKIP_ROWS,qe),_e.pixelStorei(U.UNPACK_SKIP_IMAGES,it);const Hn=E.isDataArrayTexture||E.isData3DTexture,si=N.isDataArrayTexture||N.isData3DTexture;if(E.isDepthTexture){const at=Ge.get(E),Ut=Ge.get(N),ln=Ge.get(at.__renderTarget),Mt=Ge.get(Ut.__renderTarget);_e.bindFramebuffer(U.READ_FRAMEBUFFER,ln.__webglFramebuffer),_e.bindFramebuffer(U.DRAW_FRAMEBUFFER,Mt.__webglFramebuffer);for(let It=0;It<be;It++)Hn&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ge.get(E).__webglTexture,V,it+It),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ge.get(N).__webglTexture,xe,Rt+It)),U.blitFramebuffer(De,qe,De+Ce,qe+me,Pe,st,Pe+Ce,st+me,U.DEPTH_BUFFER_BIT,U.NEAREST);_e.bindFramebuffer(U.READ_FRAMEBUFFER,null),_e.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(V!==0||E.isRenderTargetTexture||Ge.has(E)){const at=Ge.get(E),Ut=Ge.get(N);_e.bindFramebuffer(U.READ_FRAMEBUFFER,L),_e.bindFramebuffer(U.DRAW_FRAMEBUFFER,k);for(let ln=0;ln<be;ln++)Hn?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,at.__webglTexture,V,it+ln):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,at.__webglTexture,V),si?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ut.__webglTexture,xe,Rt+ln):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Ut.__webglTexture,xe),V!==0?U.blitFramebuffer(De,qe,De+Ce,qe+me,Pe,st,Pe+Ce,st+me,U.COLOR_BUFFER_BIT,U.NEAREST):si?U.copyTexSubImage3D(Le,xe,Pe,st,Rt+ln,De,qe,Ce,me):U.copyTexSubImage2D(Le,xe,Pe,st,De,qe,Ce,me);_e.bindFramebuffer(U.READ_FRAMEBUFFER,null),_e.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else si?E.isDataTexture||E.isData3DTexture?U.texSubImage3D(Le,xe,Pe,st,Rt,Ce,me,be,pt,Gt,vt.data):N.isCompressedArrayTexture?U.compressedTexSubImage3D(Le,xe,Pe,st,Rt,Ce,me,be,pt,vt.data):U.texSubImage3D(Le,xe,Pe,st,Rt,Ce,me,be,pt,Gt,vt):E.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,xe,Pe,st,Ce,me,pt,Gt,vt.data):E.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,xe,Pe,st,vt.width,vt.height,pt,vt.data):U.texSubImage2D(U.TEXTURE_2D,xe,Pe,st,Ce,me,pt,Gt,vt);_e.pixelStorei(U.UNPACK_ROW_LENGTH,Yt),_e.pixelStorei(U.UNPACK_IMAGE_HEIGHT,lt),_e.pixelStorei(U.UNPACK_SKIP_PIXELS,ii),_e.pixelStorei(U.UNPACK_SKIP_ROWS,Ht),_e.pixelStorei(U.UNPACK_SKIP_IMAGES,Ss),xe===0&&N.generateMipmaps===!0&&N.mipmapsAutoUpdate===!0&&U.generateMipmap(Le),_e.unbindTexture()},this.initRenderTarget=function(E){Ge.get(E).__webglFramebuffer===void 0&&We.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?We.setTextureCube(E,0):E.isData3DTexture?We.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?We.setTexture2DArray(E,0):We.setTexture2D(E,0),_e.unbindTexture()},this.resetState=function(){X=0,z=0,se=null,_e.reset(),de.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return mn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=rt._getDrawingBufferColorSpace(e),t.unpackColorSpace=rt._getUnpackColorSpace()}}class Fg{positions=[];normals=[];colors=[];indices=[];add(e){e.updateMatrixWorld(!0),e.traverse(t=>{if(!t.isMesh)return;const n=t,s=n.geometry,r=s.getAttribute("position"),a=s.getAttribute("normal");if(!r)return;const o=new Xe().getNormalMatrix(n.matrixWorld),c=(Array.isArray(n.material)?n.material[0]:n.material).color||new Ve(16777215),h=this.positions.length/3,f=new O,d=new O;for(let p=0;p<r.count;p++){f.fromBufferAttribute(r,p).applyMatrix4(n.matrixWorld),this.positions.push(f.x,f.y,f.z),a?d.fromBufferAttribute(a,p).applyMatrix3(o).normalize():d.set(0,1,0),this.normals.push(d.x,d.y,d.z);const u=s.getAttribute("color");this.colors.push(c.r*(u?u.getX(p):1),c.g*(u?u.getY(p):1),c.b*(u?u.getZ(p):1))}if(s.index)for(let p=0;p<s.index.count;p++)this.indices.push(h+s.index.getX(p));else for(let p=0;p<r.count;p++)this.indices.push(h+p)})}triangle(e,t,n,s){const r=this.positions.length/3,a=new O(t[0]-e[0],t[1]-e[1],t[2]-e[2]),o=new O(n[0]-e[0],n[1]-e[1],n[2]-e[2]),l=a.cross(o).normalize();for(const c of[e,t,n])this.positions.push(...c),this.normals.push(l.x,l.y,l.z),this.colors.push(s.r,s.g,s.b);this.indices.push(r,r+1,r+2)}packet(){return{position:new Float32Array(this.positions),normal:new Float32Array(this.normals),color:new Float32Array(this.colors),index:new Uint32Array(this.indices)}}}function lh(i){const e=new qt;return e.setAttribute("position",new gn(i.position,3)),e.setAttribute("normal",new gn(i.normal,3)),e.setAttribute("color",new gn(i.color,3)),e.setIndex(new gn(i.index,1)),e.computeBoundingSphere(),e}const vo=1.435,xo=.075,Qn=(vo+xo)/2,Zr=(i,e)=>Math.hypot(i[0]-e[0],i[2]-e[2]),Vl=(i,e)=>{const t=Math.hypot(e[0]-i[0],e[2]-i[2])||1;return[(e[0]-i[0])/t,0,(e[2]-i[2])/t]},Ys=(i,e)=>i[0]*e[0]+i[2]*e[2],Wl=(i,e)=>i.from===e?i.points:i.points.slice().reverse(),Xl=i=>{const e=ct(i,0,1);return e*e*(3-2*e)},Mo=i=>{const e=Math.hypot(...i)||1;return i.map(t=>t/e)},Jr=(i,e)=>({gaugeRight:Ni(i).map(t=>t*e),unitUp:rc(i)}),ch=(i,e)=>{const t=i.reduce((n,s,r)=>n+s*e[r],0);return Mo(i.map((n,s)=>n-t*e[s]))};function So(i,e,t){const n=i.segment(ct(t,0,i.length)),s=ct((t-i.lengths[n])/(i.lengths[n+1]-i.lengths[n]||1),0,1),r=e[n],a=e[n+1],o=Mo(r.gaugeRight.map((l,c)=>St(l,a.gaugeRight[c],s)));return{gaugeRight:o,unitUp:ch(r.unitUp.map((l,c)=>St(l,a.unitUp[c],s)),o)}}function Fn(i,e,t,n,s=0){const r=i.sample(t),a=So(i,e,t);return r.position.map((o,l)=>o+a.gaugeRight[l]*n-a.unitUp[l]*s)}function Og(i){const e=new At(i.normalPath),t=new At(i.branchPath),n=e.lengths[i.toeIndex];return e.points.map((s,r)=>{const a=e.lengths[r],o=e.sample(a),l=t.sample(Math.max(0,a-n)),c=So(e,i.normalFrames,a),h=l.position.reduce((p,u,_)=>p+(u-o.position[_])*c.gaugeRight[_],0),f=Math.min(0,h)-1.63,d=Math.max(0,h)+1.63;return{topLeft:Fn(e,i.normalFrames,a,f,.29),topRight:Fn(e,i.normalFrames,a,d,.29),bottomLeft:Fn(e,i.normalFrames,a,f-.35,.64),bottomRight:Fn(e,i.normalFrames,a,d+.35,.64)}})}function Bg(i){const e=i.data.network;if(!e?.nodes||!e.edges)return{switches:[],gaps:["No source-node rail graph was supplied."]};const t=new Map(e.edges.map(o=>[o.id,o])),n=new Map(e.nodes.map(o=>[o.id,o])),s=[],r=[],a=e.nodes.filter(o=>o.edges.length===3).sort((o,l)=>o.id.localeCompare(l.id));for(const o of a){const l=o.edges.map(q=>t.get(q)).filter(q=>!!q&&q.points.length>=2);if(l.length!==3)continue;const c=i.project(o.position[0],o.position[2],100);if(!Number.isFinite(c.s)||c.distance>30)continue;let h=0,f=c.s,d=c.distance;if(i.opposingPath){const q=i.opposingPath.nearest(o.position[0],o.position[2]);q.distance<d&&(h=4.2,f=i.travel(0,q.s,4.2),d=q.distance)}if(d>1.8){r.push(`${o.id}: mapped junction is ${d.toFixed(2)} m from the modelled running paths; retained as source graph, not an invented operating switch.`);continue}const p=l.map(q=>Wl(q,o.id)),u=p.map(q=>{const ae=new At(q);return Vl(q[0],ae.sample(Math.min(8,ae.length)).position)});let _=[0,1],m=-1/0;for(const q of[[0,1],[0,2],[1,2]]){const ae=Ys(u[q[0]],u[q[1]]);ae>m&&(m=ae,_=q)}const g=[0,1,2].find(q=>!_.includes(q));if(m<.65||_.some(q=>Ys(u[q],u[g])>-.65)){r.push(`${o.id}: graph branch is not a supported simple turnout geometry.`);continue}const x=i.lanePose(f,h),y=Ys(u[_[0]],x.tangent)>0?1:-1,S=q=>{const ae=new At(p[q]);let re=0;for(const Be of[6,12,20]){const Ae=ae.sample(Math.min(Be,ae.length)).position,$e=i.travel(f,y*Math.min(Be,ae.length),h);re+=Zr(Ae,i.lanePose($e,h).position)}return re},T=S(_[0])<=S(_[1])?_[0]:_[1],w=_.find(q=>q!==T);if(S(T)>9){r.push(`${o.id}: neither outgoing edge continues the modelled running line closely enough for a proved normal route.`);continue}const v=[l[w]];let b=p[w].map(q=>[...q]),P=l[w].from===o.id?l[w].to:l[w].from,R=new At(b).length;const C=new Set([l[w].id]);for(;R<42;){const q=n.get(P);if(!q||q.edges.length!==2)break;const ae=q.edges.find(Ae=>!C.has(Ae)),re=ae&&t.get(ae);if(!re)break;C.add(re.id);const Be=Wl(re,P);if(Zr(b.at(-1),Be[0])>.1)break;b.push(...Be.slice(1)),v.push(re),P=re.from===P?re.to:re.from,R=new At(b).length}if(R<18){r.push(`${o.id}: reverse edge ends at another unresolved junction before a complete switch can fit.`);continue}const F=new At(b),W=Math.min(52,F.length),L=F.sample(W).position,k=i.lanePose(f,h).position,X=k.map((q,ae)=>q-b[0][ae]),z=[];for(let q=0;q<W;q+=1){const ae=F.sample(q).position,re=1-Xl(q/Math.min(20,W));z.push(ae.map((Be,Ae)=>Be+X[Ae]*re))}z.push(L);const se=i.lanePose(i.travel(f,y*W,h),h).position;if(Ys(Vl(k,se),x.tangent)*y<.5)continue;const ee=L.map((q,ae)=>q-se[ae]),ie=ee[0]*x.right[0]+ee[2]*x.right[2];if(Math.abs(ie)<Qn*2){r.push(`${o.id}: mapped routes do not separate enough to build a complete frog before their next junction.`);continue}const we=ie*y>0?1:-1,Fe=14,K=[],ge=[],Te=[];for(let q=-Fe;q<=W;q+=1){const ae=i.lanePose(i.travel(f,y*q,h),h);K.push(ae.position),ge.push(Jr(ae,y)),q<0&&Te.push(ae.position)}Zr(K.at(-1),se)>.01&&(K.push(se),ge.push(Jr(i.lanePose(i.travel(f,y*W,h),h),y)));const Ue=new At(z),Me=Jr(x,y),Oe=z.map((q,ae)=>{const re=Math.min(ae,W),Be=re>=20?F.sample(re):Ue.sample(Ue.lengths[ae]),Ae=Xl(re/20),$e=Ni(Be),Je=rc(Be),et=Mo(Me.gaugeRight.map((U,xt)=>St(U,$e[xt],Ae)));return{gaugeRight:et,unitUp:ch(Me.unitUp.map((U,xt)=>St(U,Je[xt],Ae)),et)}}),dt=[...Te,...z],ke=Te.length;let Ye=-1;for(let q=1;q<z.length;q++){const ae=i.lanePose(i.travel(f,y*Math.min(q,W),h),h),re=Ni(ae),Ae=z[q].reduce(($e,Je,et)=>$e+(Je-ae.position[et])*re[et],0);if(Math.abs(Ae)>=Qn*2){Ye=q;break}}if(Ye<5){r.push(`${o.id}: unresolved or excessively tight crossing geometry; reverse route is not fabricated.`);continue}const Ke=i.travel(f,-y*Fe,h),te=i.travel(f,y*W,h);if(s.some(q=>q.lane===h&&Math.max(q.startS,Math.min(Ke,te))<Math.min(q.endS,Math.max(Ke,te)))){r.push(`${o.id}: overlaps a neighbouring simple-switch envelope; compound trackwork requires authoring.`);continue}const he={id:`SW-${o.id}`,s:f,lane:h,sourceNode:o.id,direction:y,normalEdgeIds:[l[g].id,l[T].id],reverseEdgeIds:[l[g].id,l[w].id],branchEdgeIds:v.map(q=>q.id),sourceWayIds:[...new Set([...l,...v].flatMap(q=>q.sourceWayIds||[]))],normalPath:K,normalFrames:ge,reversePath:dt,branchPath:z,branchFrames:Oe,formationSections:[],startS:Math.min(Ke,te),endS:Math.max(Ke,te),toeIndex:ke,hand:we,frogIndex:Ye,sourcePosition:o.position,position:k,sourceFitAdjustment:Math.hypot(...X),sourceEndpoint:L,supportPaths:[K,z],gauge:vo,replaceRunningRailWithinSpan:!0,source:"Retained source-node graph in the supplied rail SVG; normal path shares the runtime rail alignment; reverse rejoins its actual mapped edge.",confidence:"Source connectivity retained; blade, frog, bearer dimensions and exact operational permissions are simulator authoring, not surveyed switch/interlocking proof."};he.formationSections=Og(he),s.push(he)}return s.sort((o,l)=>o.s-l.s||o.lane-l.lane),s.length&&s[0].s>i.length*.5&&r.unshift("The retained node graph supplies eastern junctions only. Western switch topology is not replaced by fictional station-anchor points."),s.length||r.push("No source junction satisfied all simple-turnout connectivity and runtime alignment checks."),{switches:s,gaps:r}}const hh=new _n({color:10726053,roughness:.55,metalness:.35,flatShading:!0}),zg=new _n({color:6643024,roughness:1,flatShading:!0}),kg=new _n({color:9144444,roughness:1,flatShading:!0}),Gg=new _n({color:6846060,roughness:.9,flatShading:!0}),ql=new zn(1,1,1),Yl=i=>new O(...i);function Qr(i,e,t,n,s,r,a,o,l=0){const c=[];for(const d of[n,s])for(const p of[l,l+o])for(const u of[-1,1])c.push(...Fn(e,t,d,r+u*a/2,p));const h=new qt;h.setAttribute("position",new bt(c,3)),h.setIndex([0,5,4,0,1,5,2,7,3,2,6,7,0,6,2,0,4,6,1,7,5,1,3,7,0,3,1,0,2,3,4,7,6,4,5,7]),h.computeVertexNormals();const f=new zt(h,hh);return f.castShadow=!0,f.receiveShadow=!0,i.add(f),f}function ir(i,e,t,n,s,r){Qr(i,e,t,n,s,r,xo,.045),Qr(i,e,t,n,s,r,.025,.07,.045),Qr(i,e,t,n,s,r,.14,.025,.115)}function Hg(i,e){const t=[],n=[];for(let a=1;a<e.length;a++){const o=e[a-1],l=e[a],c=t.length/3;for(const h of[o.topLeft,o.topRight,o.bottomLeft,o.bottomRight,l.topLeft,l.topRight,l.bottomLeft,l.bottomRight])t.push(...h);n.push(...[0,5,4,0,1,5,2,7,3,2,6,7,0,6,2,0,4,6,1,7,5,1,3,7,0,3,1,0,2,3,4,7,6,4,5,7].map(h=>h+c))}const s=new qt;s.setAttribute("position",new bt(t,3)),s.setIndex(n),s.computeVertexNormals();const r=new zt(s,kg);r.receiveShadow=!0,i.add(r)}function $l(i,e,t,n={}){const s=new At(e);for(const r of[-1,1])for(let a=0;a<s.length;a+=1){let o=[[a,Math.min(a+1,s.length)]];for(const l of n.gaps??[])if(l.side===r){const{start:c,end:h}=l;o=o.flatMap(([f,d])=>d<=c||f>=h?[[f,d]]:[[f,Math.min(d,c)],[Math.max(f,h),d]].filter(([p,u])=>u-p>.001))}for(const[l,c]of o)ir(i,s,t,l,c,r*Qn)}}function Kl(i,e,t,n){const s=[],r=[],a=[],o=[];for(let h=0;h<=8;h++){const f=h/8,d=t+.1+f*7,p=St(.008,.04,f),u=Fn(i,e,d,0),_=Fn(i,e,d,1),m=_.map((g,x)=>g-u[x]);for(const[g,x]of[[-p/2,0],[p/2,0],[-p/2,.14],[p/2,.14]]){const y=n*Qn+g,S=Fn(i,e,d,y,x);s.push(...S),r.push(...m),a.push(1-f)}}for(let h=0;h<8;h++){const f=h*4,d=f+4;o.push(f,f+1,d+1,f,d+1,d,f+2,d+2,d+3,f+2,d+3,f+3,f,d,d+2,f,d+2,f+2,f+1,f+3,d+3,f+1,d+3,d+1)}o.push(0,2,3,0,3,1,32,33,35,32,35,34);const l=new qt;l.setAttribute("position",new bt(s,3)),l.setIndex(o),l.computeVertexNormals();const c=new zt(l,hh);return c.userData.basePositions=new Float32Array(s),c.userData.rights=new Float32Array(r),c.userData.weights=new Float32Array(a),c.userData.side=n,c.castShadow=!0,c}function Vg(i,e={}){const t=new Tt;t.name=i.id;const n=new At(i.normalPath),s=new At(i.branchPath),r=n.lengths[Math.min(i.toeIndex,n.points.length-1)],a=s.lengths[Math.min(i.frogIndex,s.points.length-1)],o=s.sample(a),l=n.nearest(o.position[0],o.position[2]),c=l.s;e.includeBallast!==!1&&Hg(t,i.formationSections),$l(t,i.normalPath,i.normalFrames,{gaps:[{start:r,end:r+7.1,side:i.hand},{start:c-.35,end:c+.35,side:i.hand}]}),$l(t,i.branchPath,i.branchFrames,{gaps:[{start:0,end:7.1,side:-i.hand},{start:a-.35,end:a+.35,side:-i.hand}]});for(let y=-12;y<s.length;y+=.72){const S=n.sample(r+y),T=s.sample(Math.max(0,y)),w=Math.min(0,(T.position[0]-S.position[0])*S.right[0]+(T.position[2]-S.position[2])*S.right[2])-.98,v=Math.max(0,(T.position[0]-S.position[0])*S.right[0]+(T.position[2]-S.position[2])*S.right[2])+.98,b=So(n,i.normalFrames,r+y),P=Yl(b.gaugeRight),R=Yl(b.unitUp),C=R.clone().cross(P).normalize(),F=new zt(ql,zg);F.position.fromArray(Fn(n,i.normalFrames,r+y,(w+v)/2,.215)),F.scale.set(.24,.15,v-w),F.quaternion.setFromRotationMatrix(new _t().makeBasis(C,R,P)),F.castShadow=!0,F.receiveShadow=!0,t.add(F)}const h=Kl(n,i.normalFrames,r,i.hand),f=Kl(s,i.branchFrames,0,-i.hand);h.userData.closesFor="normal",f.userData.closesFor="reverse";for(const y of[h,f])y.name=`${i.id}:blade:${y.userData.closesFor}`,y.userData.id=y.name;const d=[h,f];ir(t,n,i.normalFrames,c-.65,c+.9,i.hand*Qn),ir(t,n,i.normalFrames,c-1.6,c+1.6,-i.hand*(Qn-.16)),ir(t,s,i.branchFrames,Math.max(0,a-1.7),Math.min(s.length,a+1.7),-i.hand*Qn);const p=n.sample(r+4,-i.hand*1.75),u=new zt(ql,Gg);u.position.fromArray(p.position),u.position.y-=.1,u.scale.set(.65,.32,.9),u.rotation.y=p.yaw,t.add(u);const _=new Fg;_.add(t);const m=lh(_.packet());t.clear();const g=new zt(m,new _n({vertexColors:!0,roughness:.8,metalness:.2,flatShading:!0}));g.name=`${i.id}:fixed`,g.userData.id=g.name,g.castShadow=!0,g.receiveShadow=!0,t.add(g,...d),Object.assign(t.userData,{id:i.id,family:"source-connected-turnout",sourceNode:i.sourceNode,normalEdgeIds:i.normalEdgeIds,reverseEdgeIds:i.reverseEdgeIds,source:i.source,confidence:i.confidence,gauge:vo,railHeadWidth:xo,railCentreSpacing:Qn*2,blades:d,hand:i.hand,definition:i,supportPaths:i.supportPaths,replaceRunningRailWithinSpan:!0}),t.updateMatrixWorld(!0);const x=new ti().setFromObject(t);return t.userData.bounds={min:x.min.toArray(),max:x.max.toArray()},uh(t,0),t}function uh(i,e){const t=ct(e,0,1),n=i.userData.blades;if(n){for(const s of n){const r=s.userData.side,a=s.userData.closesFor==="normal"?1-t:t,o=s.userData.basePositions,l=s.userData.rights,c=s.userData.weights,h=s.geometry.getAttribute("position");for(let f=0;f<h.count;f++){const d=-r*(.044+(1-a)*.18)*c[f];h.setXYZ(f,o[f*3]+l[f*3]*d,o[f*3+1]+l[f*3+1]*d,o[f*3+2]+l[f*3+2]*d)}h.needsUpdate=!0,s.geometry.computeVertexNormals(),s.geometry.computeBoundingSphere()}i.userData.blend=t,i.userData.proved=t===0?"normal":t===1?"reverse":"moving",i.userData.selectedSourceEdges=t===0?i.userData.normalEdgeIds:t===1?i.userData.reverseEdgeIds:null}}class Wg{constructor(e){this.route=e,this.trackwork=Bg(e),e.data.trackwork=this.trackwork.switches;for(const t of e.stations)for(const n of[1,-1])for(const[s,r]of[-t.length/2-170,t.length/2+85].entries()){const a=t.s+n*r;a>10&&a<e.length-10&&this.signals.push({id:`SH-${t.id}-${n===1?"U":"D"}${s+1}`,s:a,direction:n,lane:n===1?4.2:0,aspects:s===0?4:3,source:"Designed simulator block; exact signal plan unavailable"})}this.signals.sort((t,n)=>t.s-n.s);for(const t of[1,-1]){const n=this.signals.filter(s=>s.direction===t);for(let s=1;s<n.length;s++){const r=n[s].s-n[s-1].s;if(r<1900)continue;const a=Math.floor(r/1400);for(let o=1;o<=a;o++){const l=n[s-1].s+r*o/(a+1);this.signals.push({id:`SH-SEC-${t}-${s}-${o}`,s:l,direction:t,lane:t===1?4.2:0,aspects:4,source:"Designed intermediate simulator block"})}}}this.signals.sort((t,n)=>t.s-n.s);for(const t of[1,-1]){const n=this.signals.filter(s=>s.direction===t).sort((s,r)=>(s.s-r.s)*t);this.signalGroups.set(t,n),n.forEach((s,r)=>this.signalIndex.set(s.id,r))}this.points=this.trackwork.switches.map(t=>({id:t.id,s:t.s,lane:t.lane,state:"normal",target:"normal",blend:0,lockedBy:null}));for(const t of e.data.crossings||[])this.crossings.push({id:t.id,s:e.sourceS(t.s),state:"open",blend:0,timer:0,held:!1});this.start(1,0)}route;player;ai=[];signals=[];points=[];crossings=[];events=[];calls=[];clock=8*3600+720;elapsed=0;paused=!0;timeScale=1;aws={pending:!1,deadline:0,indicator:!1,brake:!1,lastSignal:"",acknowledged:0};tpws={active:!1,reason:"",stoppedAt:-1,ossEntries:{},tssEntries:{}};stats={spads:0,aiSpads:0,collisions:0,stops:0,awsMissed:0,tpwsInterventions:0,distance:0};sound;onEvent;roadCrossingClear;signalGroups=new Map;signalIndex=new Map;trackwork;log(e,t){const n={time:this.clock,type:e,message:t};this.events.push(n),this.events.length>200&&this.events.shift(),this.onEvent?.(n)}start(e,t=e===1?0:this.route.stations.length-1){this.clock=8*3600+720;const n=this.route.stations[t];this.player={id:"player",s:ct(n.s+e*34,4,this.route.length-4),speed:0,direction:e,lane:e===1?4.2:0,length:70.3,cars:3,kind:"172",nextStop:t+e,dwell:0,doors:!1,controller:-1,arrived:!1},this.calls=[],this.aws={pending:!1,deadline:0,indicator:!1,brake:!1,lastSignal:"",acknowledged:0},this.tpws={active:!1,reason:"",stoppedAt:-1,ossEntries:{},tssEntries:{}},this.ai=[],this.elapsed=0,this.events=[],this.stats={spads:0,aiSpads:0,collisions:0,stops:0,awsMissed:0,tpwsInterventions:0,distance:0};for(const s of[1,-1])for(let r=0;r<8;r++){let a=1100+r*(this.route.length-2200)/7+(s===-1?850:0);a=ct(a,200,this.route.length-200),s===e&&Math.abs(a-this.player.s)<1200&&(a=ct(a+e*1700,150,this.route.length-150));const o=this.route.stations.findIndex(c=>c.s>a),l=s===1?r===0:r===7;this.ai.push({id:`AI-${s}-${r}`,s:a,speed:ys(32),direction:s,lane:s===1?4.2:0,length:l?93.95:70.3,cars:l?4:3,kind:l?"168":"172",nextStop:s===1?o<0?this.route.stations.length:o:o<0?this.route.stations.length-1:o-1,dwell:0,doors:!1,controller:.5,arrived:!1})}for(const s of this.points)s.state="normal",s.target="normal",s.blend=0,s.lockedBy=null;for(const s of this.crossings)s.state="open",s.blend=0,s.timer=0,s.held=!1;this.paused=!0,this.log("journey",`Ready at ${n.name}. Hold A to release the brake.`)}allTrains(){return[this.player,...this.ai.filter(e=>e.portalWaitUntil===void 0)]}interval(e,t=0){const n=this.route.travel(e.s,-e.direction*e.length,e.lane);return[this.route.travel(Math.min(e.s,n),-t,e.lane),this.route.travel(Math.max(e.s,n),t,e.lane)]}occupied(e,t,n,s){const r=Math.min(e,t),a=Math.max(e,t);return this.allTrains().some(o=>{if(o.id===s||Math.abs(o.lane-n)>1)return!1;const[l,c]=this.interval(o);return c>=r&&l<=a})}pointOccupied(e){return this.allTrains().some(t=>{const[n,s]=this.interval(t,18);return e.s>=n&&e.s<=s})}requestPoint(e,t){const n=this.points.find(r=>r.id===e);if(!n)return!1;const s=this.allTrains().some(r=>Math.abs(r.s-n.s)<Math.max(100,r.speed*r.speed/1.2+60));return n.lockedBy||this.pointOccupied(n)||s?(this.log("points",`${e} is locked by an occupied or approaching route.`),!1):(n.target=t,n.state="moving",this.log("points",`${e} requested ${t}.`),!0)}nextSignal(e=this.player){const t=this.signalGroups.get(e.direction)||[];let n=0,s=t.length;for(;n<s;){const a=n+s>>1;(t[a].s-e.s)*e.direction>=-.1?s=a:n=a+1}const r=t[n];return r&&Math.abs(r.lane-e.lane)<1?r:void 0}aspect(e,t="player"){const n=this.signalGroups.get(e.direction)||[],s=this.signalIndex.get(e.id)??-1;if(s<0)return"red";for(let r=0;r<3;r++){const a=n[s+r],o=n[s+r+1];if(!a)break;const l=o?.s??(e.direction===1?this.route.length+100:-100),c=this.points.some(f=>(f.lane===void 0||f.lane===e.lane)&&(f.s-a.s)*e.direction>=0&&(l-f.s)*e.direction>=0&&(f.state==="moving"||f.state==="reverse")),h=this.crossings.some(f=>(f.s-a.s)*e.direction>=0&&(l-f.s)*e.direction>=0&&f.blend<.99);if(this.occupied(a.s+e.direction*3,l+e.direction*90,e.lane,t)||c||h)return r===0?"red":r===1?"yellow":e.aspects===4?"double-yellow":"green"}return"green"}acknowledge(){this.aws.pending&&(this.aws.pending=!1,this.aws.acknowledged++,this.sound?.("ack"),this.log("aws","AWS warning acknowledged.")),this.aws.brake&&this.player.speed<.05&&(this.aws.brake=!1,this.log("aws","AWS brake released at standstill."))}resetTPWS(){return this.tpws.active?this.player.speed>.05||this.tpws.stoppedAt<0||this.clock-this.tpws.stoppedAt<5?(this.log("tpws","Stop the train and wait five seconds before resetting TPWS."),!1):(this.tpws.active=!1,this.tpws.reason="",this.player.controller=-1,this.log("tpws","TPWS reset. Service brake remains applied."),!0):!0}setDirection(e){const t=this.player;if(e===t.direction)return!0;if(t.speed>.05||t.controller>0||t.doors)return this.log("direction","Stop, close doors and select idle/brake before changing direction."),!1;const n=this.route.stations.find(o=>(o.id==="KID"||o.id==="DDG")&&Math.abs(o.s-t.s)<180);if(!n)return this.log("direction","No reverse movement authority at this location."),!1;const s=this.route.travel(t.s,-t.direction*t.length,t.lane),r=this.route.travel(s,e*300,t.lane);if(this.occupied(s,r,t.lane,t.id))return this.log("direction","Reverse route occupied."),!1;t.s=s,t.direction=e;const a=e===1?4.2:0;return t.reverseAuthority=t.lane===a?void 0:{min:n.s-150,max:n.s+150},t.nextStop=this.route.stations.findIndex(o=>o.s>t.s),e===-1&&(t.nextStop=(t.nextStop<0?this.route.stations.length:t.nextStop)-1),t.arrived=!1,this.log("direction",t.reverseAuthority?"Station reversal authorised, maximum 10 mph. Physical consist unchanged.":e===1?"Forward selected.":"Reverse selected."),!0}targetStation(e=this.player){return this.route.stations[e.nextStop]}stopPosition(e,t){return ct(e.s+t*Math.min(40,e.length/2-8),3,this.route.length-3)}distanceToStop(e=this.player){const t=this.targetStation(e);return t?this.route.laneDistance(e.s,this.stopPosition(t,e.direction),e.lane)*e.direction:0}triggerTPWS(e){this.tpws.active||(this.tpws={active:!0,reason:e,stoppedAt:-1,ossEntries:{},tssEntries:{}},this.stats.tpwsInterventions++,this.sound?.("tpws"),this.log("tpws",e))}update(e,t){if(this.paused)return;this.clock+=e,this.elapsed+=e;const n=this.player;t.a!==t.d&&(n.controller=ct(n.controller+(t.a?.45:-.45)*e,-1,1));for(const u of this.points){const _=this.allTrains().find(m=>(u.s-m.s)*m.direction>-m.length-30&&(u.s-m.s)*m.direction<Math.max(100,m.speed*12));u.lockedBy=_?.id??null,u.state==="moving"&&!this.pointOccupied(u)&&(u.blend=ct(u.blend+(u.target==="reverse"?1:-1)*e/2.5,0,1),(u.blend===0||u.blend===1)&&(u.state=u.target))}for(const u of this.crossings){const _=this.allTrains().some(m=>{const g=(u.s-m.s)*m.direction;return g>-m.length-35&&g<Math.max(1e3,m.speed*45)});u.held=_,_&&(u.state==="open"||u.state==="opening")&&(u.state="warning",u.timer=0),u.state==="warning"&&(u.timer+=e)>3&&(this.roadCrossingClear?.(u.s)??!0)&&(u.state="closing"),u.state==="closing"&&(u.blend=ct(u.blend+e/3,0,1),u.blend===1&&(u.state="closed")),!_&&u.state==="closed"?(u.timer+=e,u.timer>5&&(u.state="opening")):_&&u.state==="closed"&&(u.timer=0),u.state==="opening"&&(u.blend=ct(u.blend-e/3,0,1),u.blend===0&&(u.state="open"))}const s=n.s;n.doors&&(n.dwell-=e,n.dwell<=0&&(n.doors=!1,this.sound?.("doors"),this.log("station","Doors closed. Ready to depart."))),this.aws.pending&&this.clock>this.aws.deadline&&(this.aws.pending=!1,this.aws.brake=!0,this.stats.awsMissed++,this.sound?.("tpws"),this.log("aws","AWS missed. Brake demand. Stop and acknowledge."));const r=n.controller>0?Math.min(.95,6.7/Math.max(5,n.speed))*n.controller:0,a=n.reverseAuthority?this.route.laneDistance(n.s,n.direction===1?n.reverseAuthority.max:n.reverseAuthority.min,n.lane)*n.direction:1/0,o=Math.min(ys(10),Math.sqrt(Math.max(0,2*.65*(a-7))));n.authorityBrake=!!n.reverseAuthority&&(a<=7||n.speed>o);const l=n.controller<0?-.95*n.controller:0,c=this.aws.brake||this.tpws.active?1.25:n.authorityBrake?1.05:0,h=this.route.lanePose(n.s,n.lane),f=.012+2e-4*n.speed*n.speed,d=(n.doors||this.aws.brake||this.tpws.active||n.authorityBrake?0:r)-Math.max(l,c)-f-h.grade*9.81*n.direction;if(n.speed=Math.max(0,n.speed+d*e),n.doors&&(n.speed=0),n.s=this.route.travel(n.s,n.direction*n.speed*e,n.lane),this.stats.distance+=Math.abs(this.route.laneDistance(s,n.s,n.lane)),n.s<0||n.s>this.route.length+2){n.speed=0,n.controller=-1,this.paused=!0,this.log("boundary","You have passed the modelled route boundary. Restart or load a saved journey.");return}for(const u of this.signals){if(u.direction!==n.direction||Math.abs(u.lane-n.lane)>1)continue;const _=this.route.laneDistance(s,u.s,n.lane)*n.direction,m=this.route.laneDistance(n.s,u.s,n.lane)*n.direction,g=this.aspect(u);_>200&&m<=200&&(this.aws.lastSignal=u.id,this.aws.indicator=g!=="green",g==="green"?this.sound?.("clear"):(this.aws.pending=!0,this.aws.deadline=this.clock+2.7,this.sound?.("aws"),this.log("aws",`AWS: ${u.id}, ${g}. Acknowledge with Q.`)));const x=this.tpws.ossEntries??(this.tpws.ossEntries={}),y=T=>this.clock-e+e*ct((_-T)/(_-m||1),0,1);if(_>74&&m<=74&&g==="red"&&(x[u.id]={time:y(74),direction:n.direction,lane:n.lane}),_>70&&m<=70){const T=x[u.id];T&&T.direction===n.direction&&T.lane===n.lane&&g==="red"&&y(70)-T.time<4/Math.sqrt(2*.8*55)&&this.triggerTPWS(`TPWS overspeed intervention at ${u.id}.`),delete x[u.id]}const S=this.tpws.tssEntries??(this.tpws.tssEntries={});if(_>1.2&&m<=1.2&&g==="red"&&(S[u.id]={time:y(1.2),direction:n.direction,lane:n.lane}),_>0&&m<=0){if(g==="red"){this.stats.spads++;const T=S[u.id];T&&T.direction===n.direction&&T.lane===n.lane&&y(0)-T.time<1.1&&this.triggerTPWS(`TPWS train-stop intervention at ${u.id}.`)}delete S[u.id]}}const p=this.targetStation();if(p){const u=this.distanceToStop();Math.abs(u)<20&&n.speed<.25&&!this.calls.includes(p.id)?(n.speed=0,n.controller=-1,n.doors=!0,n.dwell=18,this.calls.push(p.id),this.stats.stops++,this.sound?.("doors"),this.log("station",`${p.name}. Doors released; 18 second dwell.`),n.nextStop+=n.direction,(n.nextStop<0||n.nextStop>=this.route.stations.length)&&(n.arrived=!0,this.log("complete","Journey complete."))):u<-100&&!this.calls.includes(p.id)&&(this.log("station",`${p.name} passed.`),n.nextStop+=n.direction)}this.tpws.active&&n.speed<.05&&this.tpws.stoppedAt<0&&(this.tpws.stoppedAt=this.clock);for(const u of this.ai)this.driveAI(u,e);this.checkCollisions()}driveAI(e,t){if(e.portalWaitUntil!==void 0){if(this.clock<e.portalWaitUntil)return;const l=e.direction===1?-220:this.route.length+220;if(Math.abs(l-this.player.s)<1400||this.occupied(l-e.direction*e.length,l+e.direction*100,e.lane,e.id))return;e.portalWaitUntil=void 0,e.s=l,e.speed=0,e.nextStop=e.direction===1?0:this.route.stations.length-1}if(e.dwell>0){e.dwell-=t,e.speed=0,e.doors=!0,e.dwell<=0&&(e.doors=!1,e.nextStop+=e.direction);return}if(e.kind==="168")for(;this.targetStation(e)&&!["KID","SBJ","SGB","BSW","BMO","SOL","DDG"].includes(this.targetStation(e).id);)e.nextStop+=e.direction;const n=this.nextSignal(e),s=n?this.aspect(n,e.id):"green";let r=ys(this.route.limit(e.s)-(e.kind==="168"?0:5));if(n&&s==="red"){const l=this.route.laneDistance(e.s,n.s,e.lane)*e.direction-10;r=Math.min(r,Math.sqrt(Math.max(0,2*.68*l)))}n&&s==="yellow"&&(r=Math.min(r,ys(35)));const a=this.targetStation(e);if(a){const l=this.distanceToStop(e);if(l>-20){if(r=Math.min(r,Math.sqrt(Math.max(0,2*.68*(l-1)))),l<2&&e.speed<.4){e.speed=0,e.dwell=18+Nn(e.id+a.id)%12,e.doors=!0;return}}else e.nextStop+=e.direction}for(const l of this.allTrains()){if(l.id===e.id||Math.abs(l.lane-e.lane)>1)continue;const[c,h]=this.interval(l),f=e.direction===1?c-e.s:e.s-h;f>0&&(r=Math.min(r,Math.sqrt(Math.max(0,2*.7*(f-40)))))}const o=e.s;e.speed=Math.max(0,e.speed+ct(r-e.speed,-.9*t,.65*t)),e.s=this.route.travel(e.s,e.direction*e.speed*t,e.lane),n&&(n.s-o)*e.direction>0&&(n.s-e.s)*e.direction<=0&&s==="red"&&this.stats.aiSpads++,(e.s>this.route.length+200||e.s<-200)&&(e.portalWaitUntil=this.clock+45,e.speed=0)}checkCollisions(){const e=this.allTrains();for(let t=0;t<e.length;t++)for(let n=t+1;n<e.length;n++){const s=e[t],r=e[n];if(Math.abs(s.lane-r.lane)>1)continue;const[a,o]=this.interval(s),[l,c]=this.interval(r);if(Math.min(o,c)-Math.max(a,l)>2){s.speed=0,r.speed=0,this.stats.collisions++,this.paused=!0,this.log("collision",`Movement stopped: conflicting occupation ${s.id}/${r.id}.`);return}}}snapshot(){return JSON.parse(JSON.stringify({version:2,worldHash:String(this.route.data.worldHash||this.route.fingerprint),routeFingerprint:this.route.fingerprint,routeLength:this.route.length,clock:this.clock,player:this.player,ai:this.ai,points:this.points,crossings:this.crossings,aws:this.aws,tpws:this.tpws,calls:this.calls,stats:this.stats,timeScale:this.timeScale}))}restore(e){if(e.version!==2||e.worldHash!==String(this.route.data.worldHash||this.route.fingerprint)||e.routeFingerprint!==this.route.fingerprint||Math.abs(e.routeLength-this.route.length)>1)throw new Error("This save belongs to another route version. Start a new journey.");this.clock=e.clock,this.player=e.player,this.ai=e.ai,this.points=e.points,this.crossings=e.crossings,this.aws=e.aws,this.tpws=e.tpws,this.calls=e.calls,this.stats=e.stats,this.timeScale=e.timeScale,this.paused=!0,this.log("save","Journey restored, paused.")}clockText(){return new Date(this.clock*1e3).toISOString().slice(11,19)}get speedMph(){return wh(this.player.speed)}}const D={steel:6712169,dark:2370862,rail:10265505,sleeper:6708303,brick:10312773,brown:7885897,cream:15260865,stone:11774624,roof:5396053,white:15329500,glass:3954272,purple:6510454,yellow:15387468,orange:12876853,green:3892818,leaf:6651211,red:12865091,ballast:9144444,concrete:11052698,black:1515811},Xg=new zn(1,1,1),Ci=new dr(1,1,1,8),qg=new ho(1,1,6),$s=new go(1,0),pn=.915,Zl=new Map;function dh(i,e=!1){const t=`${i}/${e}`;let n=Zl.get(t);return n||(n=new _n({color:i,roughness:.86,metalness:.04,flatShading:!0,emissive:e?i:0,emissiveIntensity:e?.9:0}),Zl.set(t,n)),n}function Ft(i,e,t,n,s,r,a=1,o=1,l=1,c=!1){const h=new zt(i,dh(e,c));return h.position.set(n,s,r),h.scale.set(a,o,l),h.castShadow=!0,h.receiveShadow=!0,t.add(h),h}function B(i,e,t,n,s,r,a,o,l=!1){return Ft(Xg,e,i,t,n,s,r,a,o,l)}function mt(i,e,t,n,s,r,a){return Ft(Ci,e,i,t,n,s,r,a,r)}function on(i,e,t,n,s,r=s){const a=n.clone().sub(t),o=B(i,e,(t.x+n.x)/2,(t.y+n.y)/2,(t.z+n.z)/2,s,a.length(),r);return o.quaternion.setFromUnitVectors(new O(0,1,0),a.normalize()),o}const gt=(i,e,t)=>new O(i,e,t);function Jl(i){let e=i|0;return()=>(e=Math.imul(e^e>>>15,1|e),e^=e+Math.imul(e^e>>>7,61|e),((e^e>>>14)>>>0)/4294967296)}function rn(i,e,t,n=[[0,0,0]]){i.updateMatrixWorld(!0);const s=new ti().setFromObject(i),r=String(t.id??`${e}/prototype/${t.seed??1}`);let a=0;return i.traverse(o=>{o!==i&&(o.userData.componentId=`${r}/component/${a++}`,o.userData.instanceRootId=r)}),Object.assign(i.userData,{family:e,generator:"procedural-assets-v1",id:r,requiresWorldInstanceId:t.id===void 0,seed:t.seed??1,source:t.source??"parameterised approximation; see route manifest",confidence:t.confidence??"inferred form",bounds:{min:s.min.toArray(),max:s.max.toArray()},supportAnchors:n,collision:"compound bounds; route clearance is authoritative",textureCount:0}),i}const fh=(()=>{const i=new mo;i.moveTo(-.5,0),i.lineTo(.5,0),i.lineTo(0,1),i.closePath();const e=new fr(i,{depth:1,bevelEnabled:!1,steps:1});return e.translate(0,0,-.5),e})(),Yg=(()=>{const i=new qt;i.setAttribute("position",new bt([-.5,0,-.5,.5,0,-.5,-.5,0,.5,.5,0,.5,-.5,1,-.5,.5,1,-.5],3)),i.setIndex([0,1,5,0,5,4,0,2,3,0,3,1,4,5,3,4,3,2,0,4,2,1,3,5]);const e=i.toNonIndexed();return e.computeVertexNormals(),i.dispose(),e})(),$g={A:["01110","10001","10001","11111","10001","10001","10001"],B:["11110","10001","10001","11110","10001","10001","11110"],C:["01111","10000","10000","10000","10000","10000","01111"],D:["11110","10001","10001","10001","10001","10001","11110"],E:["11111","10000","10000","11110","10000","10000","11111"],F:["11111","10000","10000","11110","10000","10000","10000"],G:["01111","10000","10000","10111","10001","10001","01111"],H:["10001","10001","10001","11111","10001","10001","10001"],I:["11111","00100","00100","00100","00100","00100","11111"],J:["00111","00010","00010","00010","10010","10010","01100"],K:["10001","10010","10100","11000","10100","10010","10001"],L:["10000","10000","10000","10000","10000","10000","11111"],M:["10001","11011","10101","10101","10001","10001","10001"],N:["10001","11001","10101","10011","10001","10001","10001"],O:["01110","10001","10001","10001","10001","10001","01110"],P:["11110","10001","10001","11110","10000","10000","10000"],Q:["01110","10001","10001","10001","10101","10010","01101"],R:["11110","10001","10001","11110","10100","10010","10001"],S:["01111","10000","10000","01110","00001","00001","11110"],T:["11111","00100","00100","00100","00100","00100","00100"],U:["10001","10001","10001","10001","10001","10001","01110"],V:["10001","10001","10001","10001","10001","01010","00100"],W:["10001","10001","10001","10101","10101","10101","01010"],X:["10001","10001","01010","00100","01010","10001","10001"],Y:["10001","10001","01010","00100","00100","00100","00100"],Z:["11111","00001","00010","00100","01000","10000","11111"],0:["01110","10011","10101","10101","10101","11001","01110"],1:["00100","01100","00100","00100","00100","00100","01110"],2:["01110","10001","00001","00010","00100","01000","11111"],3:["11110","00001","00001","01110","00001","00001","11110"],4:["00010","00110","01010","10010","11111","00010","00010"],5:["11111","10000","10000","11110","00001","00001","11110"],6:["01110","10000","10000","11110","10001","10001","01110"],7:["11111","00001","00010","00100","01000","01000","01000"],8:["01110","10001","10001","01110","10001","10001","01110"],9:["01110","10001","10001","01111","00001","00001","01110"],"-":["00000","00000","00000","11111","00000","00000","00000"],".":["00000","00000","00000","00000","00000","00100","00100"]};function Ki(i,e=.25,t=D.white){const n=[],s=[],r=e/7,a=i.toUpperCase(),o=-a.length*6*r/2;for(let h=0;h<a.length;h++){const f=$g[a[h]];if(f){for(let d=0;d<7;d++)for(let p=0;p<5;p++)if(f[d][p]==="1"){const u=o+(h*6+p)*r,_=(6-d)*r,m=r*.92;n.push(u,_,0,u+m,_,0,u+m,_+m,0,u,_,0,u+m,_+m,0,u,_+m,0);for(let g=0;g<6;g++)s.push(0,0,1)}}}const l=new qt;l.setAttribute("position",new bt(n,3)),l.setAttribute("normal",new bt(s,3));const c=new zt(l,dh(t));return c.userData.geometricLettering=!0,c}function Ql(i,e,t=D.rail){for(let n=1;n<e.length;n++){const s=e[n-1],r=e[n],a=r.clone().sub(s).normalize(),o=new O(a.z,0,-a.x).normalize(),l=a.clone().cross(o).normalize(),c=new _t().makeBasis(o,l,a),h=s.clone().add(r).multiplyScalar(.5);for(const[f,d,p,u]of[["head",.075,0,.045],["web",.025,-.045,.07],["foot",.14,-.115,.025]]){const _=h.clone().addScaledVector(l,p-u/2),m=B(i,t,_.x,_.y,_.z,d,u,s.distanceTo(r));m.quaternion.setFromRotationMatrix(c),m.userData.railProfile=f}}}function jr(i,e,t,n,s=!1){const r=new Tt;r.userData.trackPlatform={x:e,width:t,length:n,heritage:s},i.add(r),i=r,B(i,s?D.brick:D.concrete,e,.375,0,t,1.03,n),B(i,6448996,e,.9,0,t,.03,n);const a=e>0?e-t/2:e+t/2;B(i,D.cream,a,.908,0,.34,.035,n),B(i,D.yellow,a+(e>0?.46:-.46),.922,0,.1,.012,n-3),B(i,12104090,a+(e>0?.7:-.7),.92,0,.24,.025,n-3);for(const o of[-1,1]){const l=Ft(Yg,s?D.brick:D.concrete,i,e,0,o*(n/2+2.3),t,pn,4.6);o<0&&(l.rotation.y=Math.PI)}}function jl(i,e,t,n,s,r){B(i,D.roof,e,4+.12,t,n,.24,s),B(i,r?D.cream:11975088,e,4-.06,t,n,.1,s);for(const l of[-1,1])B(i,r?D.cream:D.steel,e+l*(n/2-.08),4-.15,t,.13,.35,s);const o=Math.max(2,Math.floor(s/7));for(let l=0;l<=o;l++){const c=t-s/2+l*s/o;mt(i,r?D.purple:D.steel,e,(4+pn)/2,c,.065,4-pn),on(i,r?D.purple:D.steel,gt(e,3.1,c),gt(e-n*.38,3.86,c),.065),on(i,r?D.purple:D.steel,gt(e,3.1,c),gt(e+n*.38,3.86,c),.065),B(i,D.cream,e,4-.22,c,n-.1,.16,.16)}for(const l of[-1,1])B(i,D.dark,e+l*n/2,4-.02,t,.11,.14,s),mt(i,D.dark,e+l*n/2,2.35,t-s/2+.15,.045,3.15)}function Kg(i,e,t,n=16){const a=n/2-.7;B(i,t?D.purple:D.steel,0,6.2,e,n,.35,2.2);for(const o of[-1,1])if(t?(B(i,D.purple,0,6.2+.17,e+o*2.2/2,n,.13,.12),B(i,D.purple,0,6.2+1.18,e+o*2.2/2,n,.13,.12)):B(i,D.steel,0,6.2+.65,e+o*2.2/2,n,1.25,.12),t)for(let l=0;l<Math.ceil(n/.75);l++){const c=-n/2+l*.75;on(i,D.cream,gt(c,6.2+.17,e+o*2.2/2),gt(c+.72,6.2+1.14,e+o*2.2/2),.045),on(i,D.cream,gt(c,6.2+1.14,e+o*2.2/2),gt(c+.72,6.2+.17,e+o*2.2/2),.045)}for(const o of[-a,a]){for(const f of[e-.85,e+.85])B(i,t?D.purple:D.steel,o,3.45,f,.24,5.3,.24);const l=8.2,c=22,h=e+1.1;for(let f=0;f<c;f++){const d=pn+(f+1)*(6.2-pn)/c;B(i,t?D.purple:D.concrete,o,d/2,h+l-f*l/c,1.7,d,l/c+.01)}for(const f of[-.86,.86]){on(i,t?D.cream:D.steel,gt(o+f,1.8,h+l),gt(o+f,6.2+.95,h),.065);for(let d=0;d<=5;d++){const p=d/5;B(i,t?D.cream:D.steel,o+f,1.34+p*(6.2-pn),h+l*(1-p),.06,.95,.06)}}}t&&Ft(fh,D.roof,i,0,6.2+1.6,e,n+.5,.65,2.2+.5)}class Zg{station(e){const t=new Tt;t.name=`station-${e.id??"unknown"}`;const n=String(e.id??"").toUpperCase(),s=String(e.name??n),r=Math.max(70,e.length??165),a=/HAG|HAGLEY|BMO|MOOR|DDG|DORRIDGE/.test(n+" "+s.toUpperCase()),o=/BSW|SNOW/.test(n+" "+s.toUpperCase()),l=/SGB|GALTON/.test(n+" "+s.toUpperCase()),c=o?5:4.1,h=e.trackSpacing??4.2,f=h/2+1.7,d=f+c/2;jr(t,-d,c,r,a),jr(t,d,c,r,a);const p=Math.min(r*.56,a?80:65);for(const u of[-1,1]){jl(t,u*(d+.15),-10,c+.5,o?r:p,a);const _=this.building({width:3.5,depth:a?16:10,height:a?3.2:2.8,style:a?"historic":"station",seed:13});_.position.set(u*(f+c+1.6),pn,-15),t.add(_);for(let g=-r/2+15;g<r/2;g+=24){const x=this.furniture("lamp");x.position.set(u*(f+c-.65),pn,g),t.add(x);const y=this.furniture("bench");y.position.set(u*(d+.6),pn,g+3),y.rotation.y=u>0?-Math.PI/2:Math.PI/2,t.add(y)}const m=Math.min(6.8,Math.max(2.9,s.length*.15));B(t,a?D.purple:D.green,u*d,2.3,r*.28,m,.62,.12);for(const g of[-m*.4,m*.4])B(t,D.steel,u*d+g,1.57,r*.28,.06,1.45,.06);for(const g of[-1,1]){const x=Ki(s,Math.min(.25,m/(Math.max(s.length,1)*.9)),D.white);x.position.set(u*d,2.16,r*.28+g*.065),g<0&&(x.rotation.y=Math.PI),t.add(x)}}if(e.footbridge!==!1&&!/BKD|BLAKEDOWN/.test(n+" "+s.toUpperCase())&&Kg(t,-Math.min(48,r*.24),/HAG|HAGLEY/.test(n+" "+s.toUpperCase()),2*(d+1)),(/SBJ|STOURBRIDGE/.test(n+" "+s.toUpperCase())||e.platformCount>=3)&&(jr(t,-d-5.9,2.5,85,a),B(t,D.concrete,-d-4.35,.22,38,1.1,.5,1.3)),o){B(t,D.concrete,0,8.4,0,2*(d+c),1.25,r*.86);for(const u of[-d-1,d+1])for(let _=-r*.43;_<r*.43;_+=12)B(t,D.concrete,u,4.8,_,.7,8,.7);for(const u of[-d-5,d+5])B(t,7502974,u,13,-25,7,10,28)}if(l){B(t,D.concrete,0,7.5,-30,29,.85,8.5);for(const u of[-12,12])B(t,D.concrete,u,4,-30,1.2,7.8,7);for(const u of[-1,1])B(t,9349794,u*8,5,-48,2.3,8,3.5)}if(/DDG|DORRIDGE/.test(n+" "+s.toUpperCase())){const u=this.building({width:8,depth:22,height:5.1,style:"historic",seed:21});u.position.set(d+6,pn,-38),t.add(u)}if(/KID|KIDDERMINSTER/.test(n+" "+s.toUpperCase())){const u=this.building({width:9,depth:35,height:4.2,style:"historic",seed:11});u.position.set(-d-15,0,-8),t.add(u),jl(t,-d-12,-5,7,42,!0)}return t.userData.platformEdges=[-f,f],t.userData.platformLength=r,t.userData.platformHeight=pn,rn(t,"station",e,[[-d,0,-r/2],[d,0,r/2]])}building(e){const t=new Tt,n=Math.max(1,e.width??7),s=Math.max(1,e.depth??9),r=Math.max(1.2,e.height??6),a=Jl(e.seed??1),o=/industrial|warehouse|shed/.test(e.style??""),l=/historic|terrace|brick/.test(e.style??""),c=[D.brick,D.brown,10976347,11770747,12891803][Math.floor(a()*5)];B(t,D.concrete,0,.1,0,n+.15,.2,s+.15),B(t,o?10264986:c,0,r/2+.15,0,n,r,s),o||e.roof==="flat"?(B(t,D.roof,0,r+.25,0,n+.3,.22,s+.3),B(t,D.steel,0,r+.4,0,n*.25,.15,s*.5)):(Ft(fh,l?6904662:D.roof,t,0,r+.15,0,n+.42,Math.min(n*.38,2.7),s+.4),B(t,c,n*.26,r+Math.min(n*.38,2.7)+.15,-s*.25,.55,1.05,.7),B(t,D.cream,n*.26,r+Math.min(n*.38,2.7)+.73,-s*.25,.65,.14,.8));const h=Math.min(5,Math.max(1,Math.floor(r/2.9))),f=Math.min(8,Math.max(1,Math.floor(n/2.5)));for(const p of[-1,1]){for(let _=0;_<h;_++)for(let m=0;m<f;m++){const g=-n/2+(m+.5)*n/f,x=1.6+_*Math.min(3.05,r/h);B(t,D.cream,g,x,p*(s/2+.012),Math.min(1.12,n/f*.58),1.2,.065),B(t,D.glass,g,x,p*(s/2+.052),Math.min(.94,n/f*.46),1.04,.035)}const u=p*(s/2+.04);B(t,l?D.green:D.dark,-n*.26,1.16,u,.9,2,.09),B(t,D.concrete,-n*.26,.14,u+p*.22,1.15,.26,.55)}const d=Math.min(7,Math.max(1,Math.floor(s/3)));for(const p of[-1,1])for(let u=0;u<d;u++)for(let _=0;_<h;_++)B(t,D.glass,p*(n/2+.024),1.6+_*Math.min(3.05,r/h),-s/2+(u+.5)*s/d,.05,1.03,1);for(const p of[-1,1])B(t,D.dark,p*(n/2+.12),r+.08,0,.12,.12,s+.35),mt(t,D.dark,p*(n/2+.12),r/2,s/2-.12,.045,r);return rn(t,"building",e,[[-n/2,0,-s/2],[n/2,0,-s/2],[-n/2,0,s/2],[n/2,0,s/2]])}tree(e={}){const t=new Tt,n=e.height??6+(e.seed??1)%6,s=Jl(e.seed??7);if(mt(t,6443333,0,n*.36,0,n*.037,n*.72),e.type==="conifer")for(let r=0;r<3;r++)Ft(qg,4349770,t,0,n*(.48+r*.17),0,n*(.26-r*.045),n*.55,n*(.26-r*.045));else{Ft($s,[D.leaf,7963211,10263388,5729865][(e.seed??1)%4],t,0,n*.7,0,n*.31,n*.34,n*.29);for(let r=0;r<2;r++)Ft($s,r?7570254:5467208,t,(s()-.5)*n*.33,n*(.56+s()*.22),(s()-.5)*n*.3,n*.24,n*.26,n*.23)}return rn(t,"vegetation",e,[[0,0,0]])}signal(e={}){const t=new Tt,n=e.height??4.6;if(e.gantry){for(const l of[-1,1])B(t,D.steel,l*6.5,n*.6,0,.28,n*1.2,.28);B(t,D.steel,0,n*1.2,0,13.4,.32,.5);for(let l=-6;l<6;l+=1.3)on(t,D.steel,gt(l,n*1.2-.3,0),gt(l+1.3,n*1.2+.3,0),.08)}else{mt(t,D.steel,0,n/2-.35,0,.075,n-.7),B(t,D.concrete,0,-.08,0,.55,.25,.55);for(let l=.35;l<n-.8;l+=.38)B(t,D.steel,.21,l,-.12,.3,.032,.06);for(const l of[.07,.36])B(t,D.steel,l,(n-.7)/2,-.12,.035,n-.7,.035)}const s=n-.35;B(t,D.black,0,s,0,.58,1.3,.23);const r={red:[],yellow:[],green:[],doubleYellow:[]},a=[["red",s-.42,15746098],["yellow",s-.08,16761641],["green",s+.26,5036939]];(e.aspects===4||e.fourAspect)&&a.push(["doubleYellow",s+.6,16761641]);for(const[l,c,h]of a){const f=Ft(Ci,h,t,0,c,.145,.105,.055,.105,!0);f.rotation.x=Math.PI/2,f.material=new _n({color:1516834,emissive:h,emissiveIntensity:0,roughness:.4}),r[l].push(f),B(t,D.black,0,c+.115,.18,.29,.045,.3)}B(t,D.white,0,n-1.54,.12,.48,.28,.03);const o=Ki(String(e.id??"S").slice(-5),.115,D.black);if(o.position.set(0,n-1.6,.14),t.add(o),e.indicator){B(t,D.black,.35,n+.65,0,.9,.25,.2);for(let l=0;l<5;l++)Ft(Ci,D.white,t,-.01+l*.15,n+.65+l*.09,.15,.035,.035,.035,!0).rotation.x=Math.PI/2}return t.userData.lenses=r,ph(t,e.aspect??"red"),rn(t,"signal",e)}turnout(e={}){const t=new Tt,n=e.length??32,s=e.hand==="left"?-1:typeof e.hand=="number"?e.hand:1,r=1.435,a=.075,o=(r+a)/2;for(let f=0;f<=Math.ceil(n/.64);f++){const d=Math.min(n,f*.64),p=d/n,u=s*3.8*p*p;B(t,D.ballast,u/2,-.465,-d,3.65+Math.abs(u),.35,.88),B(t,D.sleeper,u/2,-.215,-d,2.65+Math.abs(u),.15,.24)}for(const f of[-1,1])Ql(t,[gt(f*o,0,0),gt(f*o,0,-n)]);for(const f of[-1,1]){const d=[];for(let p=5;p<=32;p++){const u=p/32,_=s*7.6*u,m=Math.hypot(n,_);d.push(gt(s*3.8*u*u+f*o*n/m,0,-n*u+f*o*_/m))}Ql(t,d)}const l=[];for(const f of[-1,1]){const d=f*(r/2-.0225),p=B(t,D.rail,d,-.06,-5,.045,.12,9.6);p.userData.side=f,p.userData.baseX=d,p.userData.stockCentreX=f*o,l.push(p)}const c=Math.sqrt((r+a)/3.8),h=B(t,D.rail,s*o,-.07,-n*c,.1,.14,1.9);h.rotation.y=-s*Math.atan(7.6*c/n);for(const f of[-.65,.65])B(t,D.rail,f,-.06,-n*c,.055,.12,3.7);return B(t,D.dark,s*1.8,-.02,-3,.7,.3,.45),B(t,D.steel,s*.5,-.06,-3,2.4,.055,.06),t.userData.blades=l,t.userData.gauge=r,t.userData.railHeadWidth=a,t.userData.stockRailCentres=[-o,o],t.userData.hand=s,t.userData.routeEnds={normal:[0,0,-n],reverse:[s*3.8,0,-n]},Jg(t,e.state==="reverse"?1:0),rn(t,"turnout",e)}bridge(e={}){const t=new Tt,n=e.width??9,s=e.length??18,r=e.height??6,a=String(e.type??"road");B(t,a==="masonry"?D.brick:D.concrete,0,r-.42,0,n,.84,s),B(t,a==="rail"?D.ballast:6843239,0,r+.01,0,n-.45,.1,s);for(const o of[-1,1]){B(t,a==="masonry"?D.brick:D.steel,o*(n/2-.13),r+.55,0,.28,1.2,s),B(t,D.stone,o*(n/2-.13),r+1.18,0,.35,.13,s),B(t,a==="masonry"?D.brick:D.concrete,0,(r-.84)/2,o*(s/2-.65),n+1,r-.84,1.3);for(const l of[-n/2,n/2])B(t,D.concrete,l,(r-.84)/2,o*(s/2+.8),.7,r-.84,2.6)}if(a==="rail"||a==="girder")for(const o of[-n/2+.5,n/2-.5]){B(t,D.steel,o,r-.9,0,.28,.9,s-2);for(let l=0;l<s-2;l+=2)on(t,D.steel,gt(o,r-1.3,-s/2+1+l),gt(o,r-.5,-s/2+3+l),.07)}return t.userData.deckHeight=r,t.userData.opening={width:n-1,height:r-.84,length:s-2.6},rn(t,"bridge",e,[[0,0,-s/2],[0,0,s/2]])}tunnel(e={}){const t=new Tt,n=e.width??8.6,s=e.height??6.5,r=e.length??60,a=.5,o=(l,c,h,f)=>{const d=l/2,p=c-d,u=new mo;u.moveTo(-d-h,-.7),u.lineTo(d+h,-.7),u.lineTo(d+h,p),u.absarc(0,p,d+h,0,Math.PI,!1),u.closePath();const _=new Wa;_.moveTo(-d,-.45),_.lineTo(-d,p),_.absarc(0,p,d,Math.PI,0,!0),_.lineTo(d,-.45),_.closePath(),u.holes.push(_);const m=new fr(u,{depth:f,steps:1,bevelEnabled:!1,curveSegments:10});return m.translate(0,0,-f/2),m};Ft(o(n,s,a,r),7104607,t,0,0,0);for(const l of[-1,1]){Ft(o(n,s,1.4,1.2),D.brick,t,0,0,l*r/2),B(t,D.stone,0,s+1.18,l*r/2,n+3.2,.22,1.55);for(const c of[-n/2-1.3,n/2+1.3])B(t,D.brick,c,2.7,l*r/2,1.5,6.8,1.5)}for(const l of[-1,1])B(t,7829100,l*(n/2-.3),-.28,0,.34,.25,r);return t.userData.clearOpening={width:n,height:s,length:r},rn(t,"tunnel",e,[[-n/2,0,0],[n/2,0,0]])}roadVehicle(e={}){const t=new Tt,n=String(e.kind??"car").toLowerCase(),s=/bus|coach/.test(n),r=/lorry|truck|hgv/.test(n),a=n==="van";if(r){const p=e.color??13815999;B(t,D.dark,0,.59,0,2.05,.32,9.8),B(t,p,0,1.72,-3.64,2.42,2.02,2.72),B(t,D.roof,0,2.82,-3.64,2.44,.2,2.74),B(t,13027518,0,2.11,1.2,2.45,2.7,7.4),B(t,D.steel,0,.76,1.2,2.5,.16,7.5),B(t,D.glass,0,2.2,-5.018,2.08,.9,.045),B(t,D.dark,0,1.21,-5.025,1.6,.34,.06);for(const m of[-1,1])B(t,D.glass,m*1.225,2.18,-3.7,.035,.87,1.9),B(t,D.dark,m*1.43,2.12,-4.75,.15,.28,.14),B(t,15525576,m*.87,1.03,-5.04,.34,.22,.045,!0),B(t,12864323,m*.94,.92,4.94,.28,.18,.04,!0),B(t,D.steel,m*.59,2.08,4.915,1.14,2.42,.025),B(t,D.dark,m*.1,1.9,4.94,.045,.75,.035);for(const m of[-3.6,2.85,4.02])for(const g of[-1.1,1.1]){const x=mt(t,D.black,g,.48,m,.48,.28);x.rotation.z=Math.PI/2;const y=mt(t,D.steel,g*1.02,.48,m,.24,.29);y.rotation.z=Math.PI/2}B(t,D.steel,0,.63,-5.05,2.46,.24,.22),B(t,D.yellow,0,.94,4.94,.45,.14,.035);const u=rn(t,"road-vehicle",{...e}),_=u.userData.bounds;return u.userData.vehicleDimensions={length:_.max[2]-_.min[2],width:_.max[0]-_.min[0],height:_.max[1]},u}const o=s?10.8:r?10:a?5.4:4.5,l=s||r?2.45:1.8,c=s?3.05:r?3.5:a?2.5:1.55,h=e.color??[10770504,6783115,11909033,15657436,4279121][(e.seed??1)%5];B(t,D.dark,0,.45,0,l*.86,.25,o*.85),B(t,h,0,c*.48+.17,0,l,c*.55,o),B(t,h,0,c*.8,r?1.5:.15,l*.92,c*.4,o*.7),r&&B(t,13158329,0,2.25,1.2,2.42,2.6,6.9);const f=r?1.5:.15;B(t,D.glass,0,c*.82,f-o*.35-.025,l*.85,c*.29,.05),B(t,D.glass,0,c*.82,f+o*.35+.025,l*.85,c*.25,.05);for(const p of[-1,1])for(let u=0;u<(s?6:r?1:2);u++)B(t,D.glass,p*(l*.46+.012),c*.8,-o*.29+u*o*(s?.12:.31),.035,c*.29,o*(s?.09:.23));const d=s||r?.43:.32;for(const p of[-l*.46,l*.46])for(const u of[-o*.32,o*.32]){const _=mt(t,D.black,p,d,u,d,.22);_.rotation.z=Math.PI/2;const m=mt(t,D.steel,p*1.02,d,u,d*.5,.24);m.rotation.z=Math.PI/2}for(const p of[-1,1])B(t,16116944,p*l*.31,.7,-o/2-.015,.3,.17,.035,!0),B(t,13191743,p*l*.31,.7,o/2+.015,.26,.17,.035,!0);if(n==="taxi"){B(t,15129e3,0,c+.12,.05,.6,.2,.28);const p=Ki("TAXI",.12,D.black);p.position.set(0,c+.055,-.097),p.rotation.y=Math.PI,t.add(p)}return t.userData.vehicleDimensions={length:o,width:l,height:c},rn(t,"road-vehicle",e,[[-l*.46,0,-o*.32],[l*.46,0,o*.32]])}train(e={kind:"172"}){const t=new Tt,n=String(e.kind??"172"),s=n==="139",r=n==="metro",a=n==="emu",o=n==="heritage",l=Math.max(1,e.cars??(s?1:r?3:a?4:3)),c=s?9.6:r?10.5:a?20.4:23,h=r?2.65:2.75,f=n==="168"?13224125:s?15130567:r?12962245:a?13225680:o?8081729:14209724,d=[],p=[],u=[],_=[];for(let m=0;m<l;m++){const g=new Tt;g.position.z=m*(c+.65)+c/2,t.add(g),d.push(g),B(g,D.dark,0,.77,0,h*.75,.65,c*.91),B(g,f,0,2.28,0,h,2.45,c-.35),B(g,o?D.brown:D.purple,0,1.14,0,h+.02,.35,c-.3),B(g,n==="172"?D.orange:r?10241915:a?3496314:o?D.cream:3690860,0,1.5,0,h+.025,.23,c-.35),B(g,D.roof,0,3.61,0,h*.92,.27,c-.7);for(const x of[-c*.29,c*.29]){B(g,D.dark,0,.64,x,1.85,.38,2.5);for(const y of[-1.05,1.05])for(const S of[-.755,.755]){const T=mt(g,D.dark,S,.4,x+y,.4,.16);T.rotation.z=Math.PI/2}}for(const x of[-1,1]){for(let y=0;y<(s?4:8);y++)B(g,D.glass,x*(h/2+.012),2.65,-c*.36+y*c*(s?.23:.105),.04,.88,s?1.15:1.55);for(const y of[-c*.33,c*.33]){const S=B(g,n==="172"?D.purple:D.steel,x*(h/2+.035),2.16,y,.045,2.05,1.15);p.push(S),B(g,D.glass,x*(h/2+.065),2.68,y,.035,.75,.8)}}for(const x of[-1,1]){const y=m===0&&x===-1||m===l-1&&x===1;B(g,D.steel,0,.73,x*(c/2-(y?.25:0)),.35,.22,y?.5:.65)}for(const x of[-1,1]){const y=m===0&&x===-1||m===l-1&&x===1;if(B(g,y?r?12962245:D.yellow:D.dark,0,2.1,x*(c/2-.1),h*.91,2.52,.16),B(g,D.glass,0,2.95,x*(c/2-.026),h*.8,.77,.045),y)for(const S of[-.88,.88]){const T=B(g,x===-1?16183241:15293259,S,1.75,x*(c/2-.031),.22,.22,.05,!0);(x===-1?u:_).push(T)}}if(B(g,D.steel,0,3.86,0,h*.54,.26,2.3),(r||a)&&m===Math.min(1,l-1)){B(g,D.dark,0,4.03,0,1.2,.15,1.75);for(const x of[-.4,.4])on(g,D.dark,gt(x,4.1,-.7),gt(x,4.75,.65),.045),on(g,D.dark,gt(x,4.75,.65),gt(x,5.43,0),.045),on(g,D.dark,gt(x,4.1,.7),gt(x,4.75,-.65),.045),on(g,D.dark,gt(x,4.75,-.65),gt(x,5.43,0),.045);B(g,D.dark,0,5.46,0,1.35,.08,.12)}}return t.userData.cars=d,t.userData.doors=p,t.userData.frontLights=u,t.userData.rearLights=_,t.userData.totalLength=l*c+(l-1)*.65,t.userData.carLength=c,t.userData.couplerGap=.65,t.userData.firstCarCentreDistance=c/2,t.userData.noseOffset=0,t.userData.carCentreDistances=Array.from({length:l},(m,g)=>c/2+g*(c+.65)),t.userData.originConvention="front nose at z=0, consist extends in +Z",rn(t,"rolling-stock",e)}crossing(e={}){const t=new Tt,n=e.width??7,s=e.tracks??2,r=e.trackSpacing??4.2,a=[];for(let h=0;h<s;h++){const f=(h-(s-1)/2)*r;a.push(f-.755,f+.755)}const o=[-s*r/2-1,...a.flatMap(h=>[h-.1,h+.1]),s*r/2+1];for(let h=0;h<o.length-1;h+=2)B(t,7501677,(o[h]+o[h+1])/2,-.09,0,o[h+1]-o[h],.17,n);const l=[],c=[];for(const h of[-1,1]){const f=h*(s*r/2+1.4),d=h*(n/2+.8);B(t,D.concrete,f,-.12,d,.9,.25,.9),B(t,D.white,f,.7,d,.5,1.4,.5);const p=new Tt;p.position.set(f,1.2,d),p.rotation.y=h>0?Math.PI:0,t.add(p);const u=s*r/2+2;for(let m=0;m<Math.ceil(u/.55);m++)B(p,m%2?D.red:D.white,.275+m*.55,0,0,.55,.2,.14);B(p,D.dark,-.28,0,0,.65,.38,.46),l.push({pivot:p,upSign:1});const _=d+h*1.1;B(t,D.black,f,2,_,.85,.65,.18),mt(t,D.steel,f,.95,_,.065,1.9);for(const m of[-.22,.22]){const g=Ft(Ci,D.red,t,f+m,2.12,_+h*.11,.13,.05,.13,!0);g.rotation.x=Math.PI/2,g.material=new _n({color:3153181,emissive:16726059,emissiveIntensity:0}),c.push(g)}B(t,D.yellow,f,1.86,_+h*.11,.2,.16,.04)}return t.userData.barriers=l,t.userData.warningLights=c,mh(t,e.closed?1:0,0),rn(t,"level-crossing",e)}furniture(e,t={}){const n=new Tt;e=e.toLowerCase().replace(/[-_ ]/g,"");const s=(r,a,o,l,c=.1,h=D.white)=>{const f=Ki(r,c,h);return f.position.set(a,o,l),n.add(f),f};if(e==="bench"){B(n,D.brown,0,.48,0,1.8,.12,.52),B(n,D.brown,0,.85,.22,1.8,.63,.08);for(const r of[-.65,.65])B(n,D.steel,r,.23,0,.08,.46,.45),B(n,D.steel,r,.62,0,.09,.1,.63)}else if(e==="lamp")mt(n,D.steel,0,2.5,0,.065,5),B(n,D.concrete,0,-.08,0,.38,.17,.38),B(n,D.dark,0,5,0,.55,.13,.8),B(n,D.white,0,4.91,0,.48,.035,.72,!0);else if(e==="ticketmachine"){B(n,D.concrete,0,.06,0,.85,.12,.65),B(n,4352866,0,.99,0,.65,1.86,.46),B(n,D.dark,0,1.36,.245,.45,.4,.035),B(n,10202784,0,1.36,.267,.35,.29,.025),B(n,D.black,0,.94,.245,.23,.025,.035),B(n,D.dark,0,.7,.27,.3,.08,.1);for(const r of[-.12,0,.12])B(n,D.steel,r,1.05,.255,.065,.065,.025);s("TICKETS",0,1.73,.245,.085),n.userData.facility="ticket-machine"}else if(e==="helppoint"){B(n,D.concrete,0,.045,0,.45,.09,.45),mt(n,D.steel,0,1.1,0,.055,2.2),B(n,4683621,0,1.36,.03,.37,.78,.23),B(n,D.dark,0,1.57,.157,.22,.11,.025);const r=Ft(Ci,13874760,n,0,1.26,.165,.075,.025,.075);r.rotation.x=Math.PI/2,s("HELP",0,1.69,.158,.07),n.userData.facility="help-point"}else if(e==="cctv")mt(n,D.steel,0,2.5,0,.06,5),B(n,D.concrete,0,.04,0,.36,.08,.36),B(n,D.steel,.22,4.72,0,.45,.09,.1),B(n,13225153,.46,4.72,-.12,.22,.2,.5),B(n,D.black,.46,4.72,-.378,.14,.13,.025),B(n,D.steel,.46,4.86,-.13,.3,.055,.58),B(n,12237998,0,3.9,.05,.36,.24,.035),s("CCTV",0,3.84,.075,.065,D.dark),n.userData.facility="cctv";else if(e==="clock"){mt(n,D.steel,0,1.45,0,.06,2.9);const r=mt(n,D.dark,0,2.95,0,.38,.13);r.rotation.x=Math.PI/2;const a=mt(n,D.cream,0,2.95,.076,.335,.025);a.rotation.x=Math.PI/2;for(let c=0;c<12;c++){const h=c*Math.PI/6,f=B(n,D.dark,Math.sin(h)*.28,2.95+Math.cos(h)*.28,.097,.018,.055,.014);f.rotation.z=-h}const o=new Tt;o.position.set(0,2.95,.111),o.rotation.z=-(Number(t.hour??10)%12+Number(t.minute??10)/60)*Math.PI/6,B(o,D.dark,0,.085,0,.025,.17,.016),n.add(o);const l=new Tt;l.position.set(0,2.95,.118),l.rotation.z=-Number(t.minute??10)*Math.PI/30,B(l,D.dark,0,.12,0,.016,.24,.014),n.add(l),n.userData.hands={hour:o,minute:l}}else if(e==="cyclerack")for(const r of[-.65,0,.65]){for(const a of[-.3,.3])mt(n,D.steel,r,.4,a,.035,.8);B(n,D.steel,r,.8,0,.07,.07,.6);for(const a of[-.3,.3])B(n,D.steel,r,.018,a,.2,.035,.15)}else if(e==="planter"){B(n,D.brick,0,.23,0,1.4,.46,.62),B(n,5852988,0,.465,0,1.22,.035,.45);for(let r=0;r<5;r++){const a=-.48+r*.24;mt(n,D.green,a,.56,0,.018,.18),Ft($s,r%2?12480901:12888932,n,a,.7,0,.12,.1,.11)}}else if(e==="departureboard"){for(const r of[-.68,.68])mt(n,D.steel,r,1.15,0,.045,2.3),B(n,D.concrete,r,.03,0,.22,.06,.22);B(n,D.black,0,2.38,0,1.8,.65,.16),s("DEPARTURES",0,2.52,.09,.115,14136940),t.text&&s(String(t.text).slice(0,19),0,2.24,.09,.09,14136940),n.userData.display={text:t.text??"",binding:"station departures"}}else if(e==="busstop")mt(n,D.steel,0,1.35,0,.045,2.7),B(n,D.concrete,0,.025,0,.24,.05,.24),B(n,D.white,0,2.45,0,.46,.61,.08),B(n,D.red,0,2.61,.049,.4,.2,.025),s("BUS",0,2.55,.065,.085),B(n,D.dark,0,1.38,.04,.29,.65,.08),B(n,D.cream,0,1.38,.089,.25,.59,.018),s("TIMES",0,1.56,.101,.045,D.dark);else if(e==="trafficlight"){mt(n,D.steel,0,1.35,0,.055,2.7),B(n,D.concrete,0,.035,0,.3,.07,.3),B(n,D.black,0,2.86,0,.38,1.08,.2);const r={red:[],yellow:[],green:[]};for(const[a,o,l]of[["red",3.16,15156277],["yellow",2.86,15318339],["green",2.56,5094014]]){const c=Ft(Ci,l,n,0,o,.12,.1,.04,.1);c.rotation.x=Math.PI/2,c.material=new _n({color:1516834,emissive:l,emissiveIntensity:a===(t.aspect??"red")?1.1:0}),r[a].push(c),B(n,D.black,0,o+.11,.15,.28,.035,.22)}n.userData.lenses=r,n.userData.aspect=t.aspect??"red"}else if(e==="roadsign"){mt(n,D.steel,0,1,0,.045,2);const r=mt(n,D.red,0,1.95,0,.34,.075);r.rotation.x=Math.PI/2;const a=mt(n,D.white,0,1.95,.045,.28,.025);a.rotation.x=Math.PI/2,s(String(t.text??"30"),0,1.82,.065,.25,D.dark)}else if(e==="gate"){const r=t.width??3;for(const o of[-r/2,r/2])B(n,D.steel,o,.85,0,.12,1.7,.12),B(n,D.concrete,o,.02,0,.3,.04,.3);const a=new Tt;a.position.set(-r/2,0,0),n.add(a);for(const o of[.3,1.45])B(a,D.steel,r/2,o,0,r-.16,.08,.08);for(let o=.16;o<r-.1;o+=.2)B(a,D.steel,o,.87,0,.035,1.2,.035);n.userData.hinge=a}else if(e==="fence"){const r=t.length??3,a=t.height??1.6;for(const o of[-r/2,r/2])B(n,D.steel,0,a/2,o,.07,a,.07);for(const o of[.3,a-.2])B(n,D.steel,0,o,0,.045,.05,r);for(let o=-r/2;o<=r/2;o+=.2)B(n,D.steel,0,a/2,o,.035,a,.035)}else if(e==="aws"){B(n,D.yellow,0,.07,0,.47,.15,.58),B(n,D.dark,0,.16,0,.37,.05,.44);for(const r of[-.31,.31])B(n,D.steel,r,-.02,0,.17,.1,.65)}else if(e==="tpws"){for(const r of[-.5,.5])B(n,D.yellow,r,.04,0,.045,.08,1);for(const r of[-.5,.5])B(n,D.yellow,0,.04,r,1,.08,.045)}else if(e==="buffer"){for(const r of[-.755,.755])on(n,D.steel,gt(r,0,.9),gt(r,.9,0),.16),B(n,D.steel,r,.9,0,.18,.22,.5);B(n,D.red,0,.95,-.1,2.5,.4,.3)}else if(e==="person"||e==="staff"){for(const r of[-.13,.13])B(n,3161675,r,.425,0,.18,.85,.22);if(B(n,t.color??(e==="staff"?D.orange:D.purple),0,1.1,0,.48,.62,.28),Ft($s,13148805,n,0,1.61,0,.18,.23,.18),e==="staff")for(const r of[1,1.22])B(n,D.yellow,0,r,.15,.48,.055,.025);for(const r of[-.32,.32])B(n,t.color??D.orange,r,1.08,0,.13,.6,.16)}else if(e==="sign"){mt(n,D.steel,0,.95,0,.045,1.9),B(n,D.white,0,1.8,0,.62,.55,.06);const r=Ki(String(t.text??"75"),.28,D.black);r.position.set(0,1.65,.04),n.add(r)}else if(e==="drainage")B(n,D.concrete,0,-.12,0,.48,.2,t.length??3),B(n,D.dark,0,-.01,0,.25,.025,t.length??3);else if(e==="bin")mt(n,D.dark,0,.48,0,.25,.95),B(n,D.steel,0,.94,0,.52,.08,.5),B(n,D.black,0,.8,.255,.23,.075,.025);else if(e==="stairs")for(let r=0;r<10;r++)B(n,D.concrete,0,(r+1)*.09,-r*.3,1.8,(r+1)*.18,.3);else B(n,D.concrete,0,.05,0,.85,.1,.65),B(n,e==="cabinet"?10990756:D.steel,0,.7,0,.68,1.3,.45),B(n,D.dark,.2,.75,.235,.035,.23,.035);return rn(n,e,t)}}function ph(i,e){const t=i.userData.lenses;if(!t)return;const n=e==="doubleYellow"?["yellow","doubleYellow"]:[e];for(const[s,r]of Object.entries(t))for(const a of r){const o=a.material,l=n.includes(s);o.color.setHex(l?s==="red"?15746098:s==="green"?5036939:16761641:1516834),o.emissiveIntensity=l?1.3:0}i.userData.aspect=e}function Jg(i,e){const t=Pc.clamp(e,0,1),n=i.userData.blades;if(n)for(const s of n){const r=s.userData.side,a=r<0?1-t:t;s.position.x=s.userData.baseX-r*(1-a)*.17,s.rotation.y=r*(1-a)*.012}i.userData.blend=t,i.userData.proved=t===0?"normal":t===1?"reverse":"moving"}function mh(i,e,t=0,n=e>.01){const s=Pc.clamp(e,0,1),r=i.userData.barriers;if(r)for(const o of r)o.pivot.rotation.z=(1-s)*Math.PI/2;const a=i.userData.warningLights;a&&a.forEach((o,l)=>{const c=o.material;c.emissiveIntensity=n&&Math.floor(t*2.8+l)%2===0?1.5:0}),i.userData.closedBlend=s}const ea=i=>{const e=Math.hypot(...i)||1;return i.map(t=>t/e)},ec=(i,e)=>[i[1]*e[2]-i[2]*e[1],i[2]*e[0]-i[0]*e[2],i[0]*e[1]-i[1]*e[0]];function ci(i,e=1,t){const n=ea(t??i.tangent.map(o=>o*e)),s=Ni(i).map(o=>o*e),r=ea(ec(s,n));return{right:ea(ec(n,r)),up:r,forward:n}}function Qg(i,e,t){return ci({tangent:[-Math.sin(i)*Math.cos(e),Math.sin(e),-Math.cos(i)*Math.cos(e)],right:[Math.cos(i),0,-Math.sin(i)],bank:t})}function Pi(i,e){const t=i.replace(/^\/+/,""),n=t.split("/");if(n.length<2||n[0]!=="data"||n.some(s=>!/^[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(s)))throw new Error(`Invalid local route data path: ${i}`);return new URL(t,e).href}class jg{roads=new Map;cars=new Map;nodes=new Map;reservations=new Map;spawnPlan;setSpawnPlan(e){const t=new Map;for(const n of e){if(n.width<4.5||n.points.length<2||["path","steps","pedestrian","footway","cycleway","service"].includes(n.kind)||Nn(n.id)%4!==0)continue;const s=new At(n.points);if(s.length<65)continue;const r=s.sample(s.length*.5).position,a=`${Math.floor(r[0]/1e3)},${Math.floor(r[2]/1e3)}`,o=t.get(a)||[];o.push({id:n.id,rank:Nn(`population/${n.id}`)}),t.set(a,o)}this.spawnPlan=new Set([...t.values()].flatMap(n=>n.sort((s,r)=>s.rank-r.rank||s.id.localeCompare(r.id)).slice(0,8).map(s=>s.id)))}addRoads(e){for(const t of e){if(this.roads.has(t.id)||t.width<4.5||t.points.length<2||["path","steps","pedestrian","footway","cycleway","service"].includes(t.kind))continue;const n=new At(t.points);this.roads.set(t.id,{...t,path:n});for(const s of[0,1]){const r=t.points[s===0?0:t.points.length-1],a=this.key(r),o=this.nodes.get(a)||[];o.push({id:t.id,end:s}),this.nodes.set(a,o)}if(!(n.length<65||Nn(t.id)%4!==0||(this.spawnPlan?!this.spawnPlan.has(t.id):this.cars.size>=150)))for(const s of[1,-1]){const r=`car-${t.id}-${s}`;let a=n.length*(.18+Nn(r)%60/100);t.mode==="crossing"&&t.crossingS!==void 0&&Math.abs(a-t.crossingS)<40&&(a=ct(t.crossingS-s*(40+Nn(r)%15),2,n.length-2));const o=n.sample(a,-s*t.width*.23),l=Nn(r)%24,c=t.width>=7&&l<2?"lorry":t.width>=6.3&&l<4?"bus":t.width>=5.3&&l<7?"van":l===8?"taxi":"car";this.cars.set(r,{id:r,road:t.id,s:a,direction:s,speed:0,kind:c,position:o.position,yaw:o.yaw+(s<0?Math.PI:0),pitch:o.pitch*s,bank:t.mode==="crossing"?0:.07/t.width,length:c==="bus"?10:c==="lorry"?12:c==="van"?5.5:4.5})}}}key(e){return`${Math.round(e[0]/4)},${Math.round(e[1]/2)},${Math.round(e[2]/4)}`}snapshot(){return{roads:[...this.roads.values()].map(({path:e,...t})=>t),cars:[...this.cars.values()].map(e=>({...e,transition:e.transition?{...e.transition,path:e.transition.path.points}:void 0})),reservations:[...this.reservations],spawnPlan:this.spawnPlan?[...this.spawnPlan].sort():void 0}}reset(){const e=[...this.roads.values()].map(({path:t,...n})=>n);this.roads.clear(),this.nodes.clear(),this.cars.clear(),this.reservations.clear(),this.addRoads(e)}restore(e){this.roads.clear(),this.nodes.clear(),this.cars.clear(),this.reservations.clear(),e.spawnPlan&&(this.spawnPlan=new Set(e.spawnPlan)),this.addRoads(e.roads),this.cars.clear();for(const t of e.cars)t.transition&&(t.transition.path=new At(t.transition.path)),this.cars.set(t.id,t);for(const[t,n]of e.reservations)this.reservations.set(t,n)}crossingClear(e){for(const t of this.cars.values()){const n=this.roads.get(t.road);if(n?.mode!=="crossing"||n.routeS===void 0||n.crossingS===void 0||Math.abs(n.routeS-e)>220)continue;const s=(n.crossingS-t.s)*t.direction,r=16+t.length/2;if(s>-r&&(s<r||s>0&&s<r+t.speed*t.speed/3.6))return!1}return!0}update(e,t,n,s){for(const[o,l]of this.reservations)l.until<t&&this.reservations.delete(o);const r=new Map,a=new Map;for(const o of this.cars.values()){const l=`${o.road}/${o.direction}`,c=r.get(l)||[];c.push(o),r.set(l,c)}for(const o of r.values()){o.sort((l,c)=>(l.s-c.s)*l.direction);for(let l=0;l<o.length-1;l++)a.set(o[l].id,o[l+1])}for(const o of this.cars.values()){if(o.transition){const p=o.transition;o.speed=Math.min(5,o.speed+.7*e),p.s+=o.speed*e;const u=p.path.sample(p.s);o.position=u.position,o.yaw=u.yaw,o.pitch=u.pitch,p.s>=p.path.length&&(o.road=p.next,o.direction=p.direction,o.s=p.nextS,o.transition=void 0);continue}const l=this.roads.get(o.road);if(!l)continue;let c=l.kind==="primary"||l.kind==="secondary"?12:9;const h=o.direction===1?l.path.length-o.s:o.s,f=a.get(o.id);if(f){const p=(f.s-o.s)*o.direction;p>0&&(c=Math.min(c,Math.sqrt(Math.max(0,2*1.8*(p-(o.length+f.length)/2-3.5)))))}if(l.mode==="crossing"&&l.routeS!==void 0&&l.crossingS!==void 0){const p=n.find(m=>Math.abs(m.s-l.routeS)<220),u=(l.crossingS-o.s)*o.direction;u<-(16+o.length/2)&&(o.crossingCommitted=void 0),p&&p.state==="warning"&&u>0&&u<o.length/2+12+o.speed*o.speed/4.6&&(o.crossingCommitted=p.id);const _=(r.get(`${o.road}/${o.direction}`)||[]).some(m=>m.id!==o.id&&(m.s-l.crossingS)*o.direction>0&&(m.s-l.crossingS)*o.direction<26+o.length+m.length/2);u>0&&!(p&&o.crossingCommitted===p.id)&&(p&&p.state!=="open"||_)&&(c=Math.min(c,Math.sqrt(Math.max(0,2*2.3*(u-o.length/2-18)))))}if(h<30){const p=l.points[o.direction===1?l.points.length-1:0],u=this.key(p),_=(this.nodes.get(u)||[]).filter(x=>x.id!==l.id),m=_.length?_[Nn(o.id+u)%_.length]:void 0,g=this.reservations.get(u);if(!m||g&&g.car!==o.id)c=Math.min(c,Math.sqrt(Math.max(0,2*1.7*(h-8))));else if(c=Math.min(c,5),h<12){const x=this.roads.get(m.id),y=m.end===0?1:-1,S=y===1?12:x.path.length-12,T=x.path.sample(S,-y*x.width*.23);if(T.position[1]+=(x.mode==="crossing"?-.005:.035)*.54,(r.get(`${x.id}/${y}`)||[]).some(v=>v.id!==o.id&&Math.abs(v.s-S)<(o.length+v.length)/2+8))c=0;else{const v=l.path.sample(o.s,-o.direction*l.width*.23).position;v[1]+=(l.mode==="crossing"?-.005:.035)*.54;const b=[p[0],St(v[1],T.position[1],.5),p[2]],P=[];for(let R=0;R<=12;R++){const C=R/12,F=1-C;P.push([F*F*v[0]+2*F*C*b[0]+C*C*T.position[0],St(v[1],T.position[1],C),F*F*v[2]+2*F*C*b[2]+C*C*T.position[2]])}o.transition={path:new At(P),s:0,next:x.id,direction:y,nextS:S,node:u},this.reservations.set(u,{car:o.id,until:t+8});continue}}}o.speed=Math.max(0,o.speed+ct(c-o.speed,-2.5*e,1.1*e)),o.s=ct(o.s+o.direction*o.speed*e,2,l.path.length-2);const d=l.path.sample(o.s,-o.direction*l.width*.23);o.position=d.position,o.position[1]+=(l.mode==="crossing"?-.005:.035)*.54,o.yaw=d.yaw+(o.direction<0?Math.PI:0),o.pitch=d.pitch*o.direction,o.bank=l.mode==="crossing"?0:.07/l.width}}}class e_{constructor(e,t,n,s){this.container=e,this.data=t,this.route=n,this.sim=s;const r=document.createElement("canvas");let a=null;try{a=r.getContext("webgl2",{antialias:!0,alpha:!1,powerPreference:"high-performance"})}catch{}if(!a)throw new Error("WebGL 2 is unavailable. Enable hardware acceleration or use a current browser with WebGL 2 support.");this.renderer=new Ug({canvas:r,context:a,antialias:!0,alpha:!1,powerPreference:"high-performance"}),r.addEventListener("webglcontextlost",this.contextLost),this.gpuInfo=String(a.getParameter(a.RENDERER)||"WebGL 2"),this.renderer.setPixelRatio(.5),this.renderer.setClearColor(13489868),this.renderer.toneMapping=Ja,this.renderer.toneMappingExposure=1,this.renderer.shadowMap.enabled=!0,this.scene.background=new Ve(13489868),this.scene.fog=this.fog,this.scene.add(this.ambient,this.sun),this.sun.position.set(-140,250,-80),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(1024,1024),Object.assign(this.sun.shadow.camera,{left:-95,right:95,top:95,bottom:-95,near:1,far:650}),this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.12,this.sun.shadow.camera.updateProjectionMatrix(),this.scene.add(this.sun.target),this.container.appendChild(this.renderer.domElement),this.renderer.domElement.setAttribute("aria-label","View from the front of the train"),this.worker=new Worker(new URL(""+new URL("world.worker-BJp70N7g.js",import.meta.url).href,import.meta.url),{type:"module"}),this.worker.onmessage=o=>this.onWorker(o.data),this.worker.onerror=o=>this.onError?.(new Error(o.message)),window.addEventListener("resize",()=>this.resize()),this.resize()}container;data;route;sim;scene=new Bu;camera=new dn(62,1,.2,2400);factory=new Zg;roadTraffic=new jg;loopFootGeometry=new zn(.18,.25,.18);loopFootMaterial=new _n({color:5397332,roughness:.95});renderer;worker;ready=!1;loaded=new Map;requested=new Set;tileRetries=new Map;disposed=!1;adjacent=[];walkers=new Map;signalModels=new Map;pointModels=new Map;crossingModels=new Map;trainModels=new Map;carModels=new Map;fog=new oo(13489868,450,1700);sun=new zd(16772559,3);ambient=new Fd(14083564,7964251,2.7);gpuInfo="WebGL 2";tileCount=0;triangles=0;placements=0;failures=[];frameTimes=[];onProgress;onError;contextLost=e=>{if(e.preventDefault(),this.disposed)return;const t=new Error("Graphics context lost. Reload to reconnect graphics.");this.failures.push(t.message),this.sim.paused=!0,this.onError?.(t)};quality="balanced";lastS=-1/0;lastTraffic=0;previousCamera=new O;firstFrame=!0;warmFrames=0;async init(){if(this.renderer.getContext().isContextLost())throw new Error("The WebGL 2 context was lost. Reload to reconnect graphics.");const e=await fetch(Pi("data/adjacent-services.json",document.baseURI));if(e.ok){const a=await e.json();this.data.adjacentServices=a.services;for(const o of a.services){const l=o.kind==="shuttle"?"139":o.kind==="tram"?"metro":o.kind==="heritage"?"heritage":"emu",c=this.factory.train({id:o.id,kind:l,cars:o.cars});this.scene.add(c),this.adjacent.push({data:o,path:new At(o.points),model:c})}}const t=await fetch(Pi("data/road-surfaces.json",document.baseURI));if(!t.ok)throw new Error("The shared road support manifest could not be loaded.");this.data.surfaceRoads=(await t.json()).roads,this.roadTraffic.setSpawnPlan(this.data.surfaceRoads),this.sim.roadCrossingClear=a=>this.roadTraffic.crossingClear(a);const n=await fetch(Pi("data/land-surfaces.json",document.baseURI));if(!n.ok)throw new Error("The shared water support manifest could not be loaded.");this.data.surfaceWater=(await n.json()).water;const s=await fetch(Pi(this.data.terrain.url,document.baseURI));if(!s.ok)throw new Error("Terrain data could not be loaded.");const r=await s.arrayBuffer();this.worker.postMessage({type:"init",route:this.data,terrain:r},[r]),this.makeInfrastructure()}onWorker(e){if(e.type==="ready"){this.ready=!0,this.updateTiles(!0);return}if(e.type==="error"){const a=e.error||e.message||"World generation failed.";e.id?this.tileFailed(e.id,a):(this.failures.push(a),this.onError?.(new Error(a)));return}if(e.type!=="tile")return;const t=e.mesh||e.result?.mesh;if(!t){e.id&&this.tileFailed(e.id,"Worker returned no geometry");return}if(!(t.position instanceof Float32Array)||!(t.normal instanceof Float32Array)||!(t.color instanceof Float32Array)||!(t.index instanceof Uint32Array)||!t.position.length||t.position.length%3!==0||t.normal.length!==t.position.length||t.color.length!==t.position.length||!t.index.length||t.index.length%3!==0){e.id&&this.tileFailed(e.id,"Worker returned malformed geometry");return}let n;try{n=lh(t)}catch(a){e.id&&this.tileFailed(e.id,`Invalid geometry: ${a instanceof Error?a.message:String(a)}`);return}this.tileRetries.delete(e.id);const s=new _n({vertexColors:!0,roughness:.94,metalness:0,side:Sn,flatShading:!0}),r=new zt(n,s);r.receiveShadow=!0,r.castShadow=!0,r.name=`tile:${e.id}`,this.scene.add(r),this.loaded.set(e.id,{mesh:r,used:performance.now()}),this.tileCount=this.loaded.size,this.triangles+=t.index.length/3,this.placements+=(e.placements||[]).length,this.roadTraffic.addRoads(e.roads||[]);for(const a of e.pedestrianPaths||[]){if(this.walkers.has(a.id))continue;const o=this.factory.furniture("person",{id:a.id,color:a.role==="staff"?13673292:6386570});this.scene.add(o),this.walkers.set(a.id,{path:new At(a.points),model:o,speed:a.speed||.7,phase:ta(a.id)%20})}this.evictInactiveTiles(),this.onProgress?.()}tileFailed(e,t){this.requested.delete(e);const n=(this.tileRetries.get(e)?.attempts??0)+1,s=performance.now()+Math.min(4e3,250*2**(n-1));if(this.tileRetries.set(e,{attempts:n,next:s}),n>=4){const r=`Scenery tile ${e} failed after ${n} attempts: ${t}`;this.failures.push(r),this.onError?.(new Error(r));return}window.setTimeout(()=>{this.disposed||this.updateTiles(!0)},Math.max(1,Math.ceil(s-performance.now())+1))}resize(){const e=this.container.clientWidth||innerWidth,t=this.container.clientHeight||innerHeight;this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.renderer.setSize(e,t)}setQuality(e){this.quality=e,this.renderer.shadowMap.enabled=e!=="low",this.updateTiles(!0)}setRenderScale(e){this.renderer.setPixelRatio(Number.isFinite(e)?Math.max(.5,Math.min(1,e)):.5),this.resize()}synchronizeClock(){this.lastTraffic=this.sim.clock}resetTraffic(){this.roadTraffic.reset();for(const e of this.carModels.values())this.scene.remove(e);this.carModels.clear(),this.synchronizeClock()}async preparePosition(){this.updateTiles(!0);const e=this.route.lanePose(this.sim.player.s,this.sim.player.lane).position,t=this.data.tiles.filter(n=>Math.hypot(Math.max(n.bounds[0]-e[0],0,e[0]-n.bounds[2]),Math.max(n.bounds[1]-e[2],0,e[2]-n.bounds[3]))<250).map(n=>n.id);await new Promise((n,s)=>{const r=performance.now(),a=()=>{t.every(o=>this.loaded.has(o))?n():performance.now()-r>9e4?s(new Error("The departure scenery could not be prepared. Reload and try again.")):setTimeout(a,150)};a()})}place(e,t,n=0,s=!1){const r=this.route.sample(t,n);e.position.fromArray(r.position),e.rotation.set(r.pitch,r.yaw+(s?Math.PI:0),-r.bank),this.scene.add(e)}placeOnLane(e,t,n,s=0,r=0,a=!1){const o=this.route.lanePose(t,n);e.position.set(o.position[0]+o.right[0]*s,o.position[1]+r,o.position[2]+o.right[2]*s),e.rotation.y=o.yaw+(a?Math.PI:0),this.scene.add(e)}placeRailDevice(e,t,n,s,r){const a=this.route.lanePose(t,n),o=ci(a,r);e.position.set(...a.position).addScaledVector(new O(...o.up),s),Zi(e,o),this.scene.add(e)}makeInfrastructure(){for(const e of this.sim.signals){const t=this.factory.signal({id:e.id,aspect:"red",aspects:e.aspects});this.placeOnLane(t,e.s,e.lane,-e.direction*2.1,-.4,e.direction===-1),this.signalModels.set(e.id,t);for(const n of[200,74,70,1.2,0]){const s=this.factory.furniture(n===200?"aws":"tpws",{id:`${e.id}/${n===200?"aws":"tpws-"+n}`,source:e.source});if(n!==200){const a=[];for(const l of[-.5,.5])for(const c of[-.42,.42]){const h=new zt(this.loopFootGeometry,this.loopFootMaterial);h.position.set(l,-.12,c),h.userData.componentId=`${s.userData.id}/bed-mount/${l}/${c}`,h.castShadow=!0,h.receiveShadow=!0,s.add(h),a.push([l,-.245,c])}s.userData.supportAnchors=a,s.userData.parentSupport="rail-bed",s.userData.intentionalIntersections="Footings extend 45 mm into nominal ballast, allowing for local grade.",s.updateMatrixWorld(!0);const o=new ti().setFromObject(s);s.userData.bounds={min:o.min.toArray(),max:o.max.toArray()}}const r=this.route.travel(e.s,-e.direction*n,e.lane);this.placeRailDevice(s,r,e.lane,n===200?-.22:-.09,e.direction)}}for(const e of this.sim.trackwork.switches){const t=Vg(e);this.scene.add(t),this.pointModels.set(e.id,t)}for(const e of this.sim.crossings){const t=Math.abs(this.route.laneOffset(e.s,4.2)),n=this.factory.crossing({id:e.id,width:7,tracks:2,trackSpacing:t});this.place(n,e.s,this.route.laneOffset(e.s,4.2)/2),this.crossingModels.set(e.id,n)}}async updateTiles(e=!1){if(!this.ready)return;const t=this.sim.player.s;if(!e&&Math.abs(t-this.lastS)<100)return;this.lastS=t;const n=this.route.sample(t).position,s=this.quality==="high"?1750:this.quality==="low"?900:1300,r=performance.now(),a=this.data.tiles.map(l=>{const c=l.bounds,h=Math.hypot(Math.max(c[0]-n[0],0,n[0]-c[2]),Math.max(c[1]-n[2],0,n[2]-c[3]));return{tile:l,d:h}}).filter(l=>l.d<s).sort((l,c)=>l.d-c.d),o=new Set(a.map(l=>l.tile.id));for(const{tile:l}of a){const c=this.loaded.get(l.id);if(c){c.used=r;continue}if(this.requested.has(l.id))continue;const h=this.tileRetries.get(l.id);if(!(h&&(h.attempts>=4||r<h.next))){this.requested.add(l.id);try{const f=await fetch(Pi(l.url,document.baseURI));if(!f.ok)throw new Error(`Could not load route tile ${l.id}`);const d=await f.json();this.worker.postMessage({type:"build",tile:d})}catch(f){this.tileFailed(l.id,f instanceof Error?f.message:String(f))}}}this.evictInactiveTiles(o)}evictInactiveTiles(e){if(this.loaded.size>25){if(!e){const t=this.route.lanePose(this.sim.player.s,this.sim.player.lane).position,n=this.quality==="high"?1750:this.quality==="low"?900:1300;e=new Set(this.data.tiles.filter(s=>Math.hypot(Math.max(s.bounds[0]-t[0],0,t[0]-s.bounds[2]),Math.max(s.bounds[1]-t[2],0,t[2]-s.bounds[3]))<n).map(s=>s.id))}for(const[t,n]of[...this.loaded].sort((s,r)=>s[1].used-r[1].used)){if(this.loaded.size<=22)break;e.has(t)||(this.triangles-=n.mesh.geometry.index.count/3,this.scene.remove(n.mesh),n.mesh.geometry.dispose(),n.mesh.material.dispose(),this.loaded.delete(t),this.requested.delete(t))}}this.tileCount=this.loaded.size}draw(e){const t=performance.now();this.updateTiles();const n=this.sim.player,s=this.route.lanePose(n.s,n.lane),r=n.direction,a=ci(s,r),o=new O(...s.position).addScaledVector(new O(...a.up),2.45),l=this.route.lanePose(this.route.travel(n.s,r*38,n.lane),n.lane),c=new O(...l.position);c.addScaledVector(new O(...ci(l,r).up),2.25),this.firstFrame||this.previousCamera.distanceTo(o)>30?(this.camera.position.copy(o),this.firstFrame=!1):this.camera.position.lerp(o,1-Math.exp(-e*18)),this.previousCamera.copy(o),this.camera.up.fromArray(a.up),this.camera.lookAt(c);const h=this.route.tunnelAt(n.s),f=h?.78:1.1;this.renderer.toneMappingExposure+=(f-this.renderer.toneMappingExposure)*Math.min(1,e*2),this.ambient.intensity=h?1.1:2.7,this.sun.position.copy(o).add(new O(-140,250,-80)),this.sun.target.position.copy(o),this.sun.target.updateMatrixWorld();for(const u of this.sim.signals){const _=this.signalModels.get(u.id);_.visible=Math.abs(u.s-n.s)<1900,_.visible&&ph(_,this.sim.aspect(u).replace("double-yellow","doubleYellow"))}for(const u of this.sim.points){const _=this.pointModels.get(u.id);_&&(_.visible=Math.abs(u.s-n.s)<1500,_.visible&&_.userData.blend!==u.blend&&uh(_,u.blend))}for(const u of this.sim.crossings){const _=this.crossingModels.get(u.id);_.visible=Math.abs(u.s-n.s)<1500,_.visible&&mh(_,u.blend,this.sim.clock,u.state!=="open")}for(const u of this.sim.ai){let _=this.trainModels.get(u.id);const[m,g]=this.sim.interval(u);if(u.portalWaitUntil!==void 0||g<0||m>this.route.length||Math.abs(u.s-n.s)>1800){_&&(_.visible=!1);continue}_||(_=this.factory.train({id:u.id,kind:u.kind,cars:u.cars}),this.trainModels.set(u.id,_),this.scene.add(_)),_.visible=!0;const x=_.userData.cars;if(x){_.position.set(0,0,0),_.rotation.set(0,0,0);const y=Number(_.userData.carLength)||23,S=Number(_.userData.couplerGap)||.65;x.forEach((T,w)=>{const v=this.route.travel(u.s,-u.direction*(y/2+w*(y+S)),u.lane),b=this.route.lanePose(this.route.travel(v,u.direction*y*.29,u.lane),u.lane),P=this.route.lanePose(this.route.travel(v,-u.direction*y*.29,u.lane),u.lane),R=b.position.map((C,F)=>C-P.position[F]);T.position.set((b.position[0]+P.position[0])/2,(b.position[1]+P.position[1])/2,(b.position[2]+P.position[2])/2),Zi(T,ci(this.route.lanePose(v,u.lane),u.direction,R))})}else{const y=this.route.lanePose(u.s,u.lane);_.position.fromArray(y.position),Zi(_,ci(y,u.direction))}}for(const u of this.adjacent){const{data:_,path:m,model:g}=u,x=Number(g.userData.totalLength)||70,y=Number(_.cycleSeconds)||240,S=this.sim.clock%y/y,T=_.metadata?.static?!0:S<.5,w=ct((T?S:1-S)*2*1.2-.1,0,1),v=_.metadata?.static?m.length*.55:t_(x/2,m.length-x/2,w),b=v,P=m.sample(b).position;if(g.visible=Math.hypot(P[0]-o.x,P[2]-o.z)<1600,!g.visible)continue;r_(g,T?1:-1,!!_.metadata?.static),g.userData.cars?.forEach((F,W)=>{const L=m.sample(v+x/2-(Number(g.userData.firstCarCentreDistance)+W*(Number(g.userData.carLength)+.65)));F.position.fromArray(L.position),Zi(F,ci(L,1))})}for(const u of this.walkers.values()){const _=(this.sim.clock+u.phase)*u.speed%(u.path.length*2),m=_<=u.path.length,g=m?_:u.path.length*2-_,x=u.path.sample(g);u.model.visible=Math.hypot(x.position[0]-o.x,x.position[2]-o.z)<350,u.model.visible&&(u.model.position.fromArray(x.position),u.model.rotation.y=x.yaw+(m?0:Math.PI))}this.lastTraffic===0&&(this.lastTraffic=this.sim.clock);let d=0;for(;this.sim.clock-this.lastTraffic>=1/20&&d++<40;)this.lastTraffic+=1/20,this.roadTraffic.update(1/20,this.lastTraffic,this.sim.crossings,s.position);for(const u of this.roadTraffic.cars.values()){let _=this.carModels.get(u.id);if(Math.hypot(u.position[0]-o.x,u.position[2]-o.z)>950){_&&(_.visible=!1);continue}_||(_=this.factory.roadVehicle({kind:u.kind,id:u.id,seed:ta(u.id),color:[15328469,5466997,10183246,5594452][ta(u.id)%4]}),this.carModels.set(u.id,_),this.scene.add(_)),_.visible=!0,_.position.fromArray(u.position),Zi(_,Qg(u.yaw,u.pitch||0,u.bank||0))}this.renderer.render(this.scene,this.camera);const p=performance.now()-t;this.warmFrames++>60&&(this.frameTimes.push(p),this.frameTimes.length>600&&this.frameTimes.shift())}async finishFrame(){this.renderer.getContext().finish()}stats(){return{backend:this.renderer.getContext().isContextLost()?"unavailable":"WebGL2",adapter:this.gpuInfo,tiles:this.tileCount,triangles:this.triangles,placements:this.placements,gpuErrors:this.failures,drawCalls:this.renderer.info.render.calls,memory:this.renderer.info.memory}}dispose(){this.disposed=!0,this.renderer.domElement.removeEventListener("webglcontextlost",this.contextLost),this.worker.terminate(),this.renderer.dispose()}}function t_(i,e,t){return i+(e-i)*t}function ta(i){let e=0;for(const t of i)e=Math.imul(e,31)+t.charCodeAt(0);return e>>>0}const tc=new _t,n_=new O,i_=new O,s_=new O;function Zi(i,e){tc.makeBasis(n_.fromArray(e.right),i_.fromArray(e.up),s_.fromArray(e.forward).negate()),i.quaternion.setFromRotationMatrix(tc)}function r_(i,e,t=!1){if(!(i.userData.lightDirection===e&&i.userData.parkedLights===t)){for(const[n,s]of[[1,i.userData.frontLights],[-1,i.userData.rearLights]])for(const r of s||[]){r.userData.ownLampMaterial||(r.material=r.material.clone(),r.userData.ownLampMaterial=!0),r.visible=!t;const a=r.material,o=n===e?16183241:15293259;a.color.setHex(o),a.emissive.setHex(o)}i.userData.lightDirection=e,i.userData.parkedLights=t}}class a_{context;master;traction;tractionGain;horn;warning;rolling;brake;ambience;crossing;reverb;volume=.35;async init(){if(this.context){await this.context.resume();return}const e=new AudioContext;this.context=e,this.master=e.createGain(),this.master.gain.value=this.volume,this.master.connect(e.destination);const t=e.createBuffer(2,e.sampleRate*1.2,e.sampleRate);let n=172;const s=()=>(n=Math.imul(n,1664525)+1013904223|0,(n>>>0)/2147483648-1);for(let d=0;d<2;d++){const p=t.getChannelData(d);for(let u=0;u<p.length;u++)p[u]=s()*(1-u/p.length)**2*.28}const r=e.createConvolver();r.buffer=t,this.reverb=e.createGain(),this.reverb.gain.value=0,this.master.connect(r),r.connect(this.reverb),this.reverb.connect(e.destination),this.tractionGain=e.createGain(),this.tractionGain.gain.value=0;const a=e.createBiquadFilter();a.type="lowpass",a.frequency.value=250,this.tractionGain.connect(a),a.connect(this.master),this.traction=e.createOscillator(),this.traction.type="sawtooth",this.traction.frequency.value=38,this.traction.connect(this.tractionGain),this.traction.start();const o=e.createBuffer(1,e.sampleRate*2,e.sampleRate),l=o.getChannelData(0);for(let d=0;d<l.length;d++)l[d]=s();const c=(d,p)=>{const u=e.createBufferSource();u.buffer=o,u.loop=!0;const _=e.createBiquadFilter();_.type="bandpass",_.frequency.value=d,_.Q.value=p;const m=e.createGain();return m.gain.value=0,u.connect(_),_.connect(m),m.connect(this.master),u.start(),m};this.rolling=c(580,.65),this.brake=c(1900,3),this.ambience=c(370,.4),this.horn=e.createGain(),this.horn.gain.value=0,this.horn.connect(this.master);for(const d of[370,440]){const p=e.createOscillator();p.type="triangle",p.frequency.value=d,p.connect(this.horn),p.start()}this.warning=e.createGain(),this.warning.gain.value=0,this.warning.connect(this.master);const h=e.createOscillator();h.type="sine",h.frequency.value=880,h.connect(this.warning),h.start(),this.crossing=e.createGain(),this.crossing.gain.value=0,this.crossing.connect(this.master);const f=e.createOscillator();f.type="sine",f.frequency.value=1020,f.connect(this.crossing),f.start(),await e.resume()}setVolume(e){this.volume=e,this.master&&this.master.gain.setTargetAtTime(e,this.context.currentTime,.05)}event(e){const t=this.context;if(!t||!this.master)return;const n=e==="clear"?[940,1254]:e==="doors"?[660,880]:e==="tpws"?[220,440]:e==="ack"?[520]:[];for(const[s,r]of n.entries()){const a=t.createOscillator(),o=t.createGain();a.type=e==="tpws"?"square":"sine",a.frequency.value=r,o.gain.setValueAtTime(.05,t.currentTime+s*.09),o.gain.exponentialRampToValueAtTime(.001,t.currentTime+.7+s*.09),a.connect(o),o.connect(this.master),a.start(t.currentTime+s*.09),a.stop(t.currentTime+1+s*.09)}}update(e,t){if(!this.context)return;const n=this.context.currentTime,s=e.paused,r=e.player.speed,a=!!e.route.tunnelAt(e.player.s);this.traction?.frequency.setTargetAtTime(34+r*2.1+Math.max(0,e.player.controller)*35,n,.15),this.tractionGain?.gain.setTargetAtTime(s?0:.012+Math.max(0,e.player.controller)*.025+r*4e-4,n,.12),this.rolling?.gain.setTargetAtTime(s?0:Math.min(.13,r*.004),n,.12),this.brake?.gain.setTargetAtTime(!s&&r>1?Math.max(0,-e.player.controller)*.025:0,n,.1),this.ambience?.gain.setTargetAtTime(s?0:a?.002:.008,n,.3),this.reverb?.gain.setTargetAtTime(!s&&a?this.volume*.38:0,n,.25),this.horn?.gain.setTargetAtTime(!s&&t?.09:0,n,.025),this.warning?.gain.setTargetAtTime(!s&&(e.aws.pending||e.tpws.active)&&Math.floor(n*5)%2===0?.07:0,n,.015);const o=e.crossings.find(c=>c.state!=="open"&&Math.abs(c.s-e.player.s)<240),l=o?Math.abs(o.s-e.player.s):240;this.crossing?.gain.setTargetAtTime(!s&&o&&Math.floor(e.clock*4)%2===0?.025*(1-l/240):0,n,.015)}}class o_{constructor(e="snow-hill-lines",t="snow-hill-lines-save-v1"){this.name=e,this.legacyKey=t}name;legacyKey;database;open(){return this.database??=new Promise((e,t)=>{const n=indexedDB.open(this.name,1);n.onupgradeneeded=()=>{n.result.objectStoreNames.contains("journeys")||n.result.createObjectStore("journeys")},n.onsuccess=()=>e(n.result),n.onerror=()=>{this.database=void 0,t(n.error||new Error("Journey storage could not be opened."))},n.onblocked=()=>{this.database=void 0,t(new Error("Close other older Snow Hill Lines tabs, then save again."))}})}async put(e){const t=await this.open();await new Promise((n,s)=>{const r=t.transaction("journeys","readwrite");r.objectStore("journeys").put(e,"active"),r.oncomplete=()=>n(),r.onerror=()=>s(r.error||new Error("Journey storage failed.")),r.onabort=()=>s(r.error||new Error("Journey storage was interrupted."))})}async get(){const e=await this.open(),t=await new Promise((r,a)=>{const o=e.transaction("journeys","readonly").objectStore("journeys").get("active");o.onsuccess=()=>r(o.result),o.onerror=()=>a(o.error)});if(t)return t;const n=localStorage.getItem(this.legacyKey);if(!n)return;const s=JSON.parse(n);return await this.put(s),localStorage.removeItem(this.legacyKey),s}}new Ve(8294246),new Ve(9207909),new Ve(9144444),new Ve(10660517),new Ve(6511181),new Ve(6843496),new Ve(11908005),new Ve(14539984),new Ve(10316629),new Ve(7828331),new Ve(7179925);new zn(1,1,1);function l_(i,e,t,n){const s=n[0]-t[0],r=n[2]-t[2],a=ct(((i-t[0])*s+(e-t[2])*r)/(s*s+r*r||1),0,1);return{distance:Math.hypot(i-t[0]-a*s,e-t[2]-a*r),t:a}}const nc=new WeakMap;function c_(i){const e=nc.get(i);if(e)return e;const t=[],n=new Map,s=a=>`${a[0].toFixed(2)},${a[2].toFixed(2)}`;for(const a of i.data.tracks)for(let o=1;o<(a.points?.length||0);o++){const l={a:a.points[o-1],b:a.points[o],id:a.id,index:o};t.push(l);for(const c of[l.a,l.b]){const h=s(c),f=n.get(h)||[];f.push(l),n.set(h,f)}}const r=[];for(const a of[!1,!0])for(const o of[0,4.2]){const l=a?1:-1,c=i.lanePose(a?i.length:0,o),h=c.tangent.map(P=>P*l);let f;for(const P of t){const R=l_(c.position[0],c.position[2],P.a,P.b);if(R.distance>4.5)continue;const C=P.b[0]-P.a[0],F=P.b[2]-P.a[2],W=Math.hypot(C,F),L=(C*h[0]+F*h[2])/(W||1),k=L>0?1:-1;if(Math.abs(L)<.82||(k>0?1-R.t:R.t)*W<.05)continue;const X=R.distance+(1-Math.abs(L))*2;(!f||X<f.score)&&(f={segment:P,t:R.t,direction:k,score:X})}if(!f)continue;let d=f.segment,p=f.direction;const u=d.a.map((P,R)=>P+(d.b[R]-P)*f.t),_=[u,p>0?d.b:d.a],m=new Set([d]),g=new Set([d.id]);let x=Math.hypot(_[1][0]-_[0][0],_[1][2]-_[0][2]);for(;x<180;){const P=_.at(-1),R=_.at(-2),C=P[0]-R[0],F=P[2]-R[2],W=Math.hypot(C,F)||1,L=/^way\/\d+/.exec(d.id)?.[0],k=(n.get(s(P))||[]).filter(z=>!m.has(z)).map(z=>{const se=s(z.a)===s(P)?z.b:z.a,$=se[0]-P[0],ee=se[2]-P[2],ie=Math.hypot($,ee),we=($*C+ee*F)/(ie*W||1);return{segment:z,target:se,d:ie,dot:we,same:L!==void 0&&z.id.startsWith(`${L}/`)}}).filter(z=>z.d>.05&&z.dot>.75).sort((z,se)=>Number(se.same)-Number(z.same)||se.dot-z.dot||z.segment.id.localeCompare(se.segment.id));if(!k.length)break;const X=k[0];if(k[1]&&!X.same&&X.dot-k[1].dot<.02)break;_.push(X.target),x+=X.d,d=X.segment,m.add(d),g.add(d.id)}if(x<20)continue;const y=new At(_),S=Math.min(180,y.length),T=Math.min(25,S),w=y.sample(T),v=[],b=P=>{const R=y.sample(P).position,C=ct(P/T,0,1),F=2*C*C*C-3*C*C+1,W=C*C*C-2*C*C+C,L=-2*C*C*C+3*C*C,k=C*C*C-C*C,X=P<T?F*c.position[0]+W*T*h[0]+L*w.position[0]+k*T*w.tangent[0]:R[0],z=P<T?F*c.position[2]+W*T*h[2]+L*w.position[2]+k*T*w.tangent[2]:R[2];v.push([X,c.position[1]+c.grade*l*P,z])};for(let P=0;P<S;P+=2)b(P);b(S),r.push({id:`context/${a?"DDG":"KID"}/${o}`,points:v,path:new At(v),overhead:!1,source:"Connected mapped source rail segments; engineered endpoint grade continued",metadata:{contextOnly:!0,playable:!1,lane:o,atEnd:a,extent:S,sourceIds:[...g],sourceFitDistance:f.score,endpointRight:c.right.map(P=>P*l),endpointBank:c.bank*l}})}return nc.set(i,r),r}const h_='<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7" stroke="currentColor" stroke-width="1.3"/></svg>',u_='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 7v10M15 7v10" stroke="currentColor" stroke-width="2"/></svg>',Ks='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg>',d_=document.querySelector("#app");d_.innerHTML=`<main class="simulator">
  <div id="viewport" role="img" aria-label="Front view of the Kidderminster to Dorridge railway"></div>
  <div class="vignette" aria-hidden="true"></div>
  <header class="topbar"><span class="brand">RAILWAY DEMO</span><div class="journey-title" id="journey-title">KIDDERMINSTER <span>—</span> DORRIDGE</div><div class="top-actions"><span class="clock" id="clock">08:12:00</span><button id="pause" class="icon-button" aria-label="Pause journey">${u_}</button></div></header>
  <section id="menu" class="menu" aria-label="Journey setup"><div class="menu-panel">
    <h1>Railway demo</h1>
    <p class="intro">Choose a direction and departure station.</p>
    <div class="form-row"><label>Direction<select id="direction"><option value="1">Kidderminster → Dorridge</option><option value="-1">Dorridge → Kidderminster</option></select></label></div>
    <div class="form-row"><label>Depart from<select id="start-station" aria-label="Departure station"><option>Loading stations…</option></select></label></div>
    <button id="begin" class="primary" disabled><span id="begin-label">Loading…</span>${Ks}</button>
    <button id="resume-save" class="secondary" hidden>Continue saved journey ${Ks}</button>
    <div class="menu-bottom"><span class="gpu-badge" id="gpu-state"><i></i> LOADING</span><button id="settings-open" class="text-button">Settings</button></div>
  </div></section>
  <section id="hud" class="hud" hidden aria-label="Driving instruments">
    <div class="notice" id="notice" role="status">Hold A to release the brake.</div>
    <div class="dashboard"><div class="instrument speed"><span class="instrument-label">SPEED</span><div><strong id="speed">0</strong><span>mph</span></div><small>LIMIT <b id="limit">65</b></small></div>
    <div class="instrument next-stop"><span class="instrument-label">NEXT STATION</span><strong id="next-stop">Blakedown</strong><div><span id="distance">5.1 km</span><span id="doors">Doors secured</span></div><div class="distance-line"><i id="stop-progress"></i></div></div>
    <div class="instrument controller"><span class="instrument-label">POWER / BRAKE</span><strong id="controller-state">Full service brake</strong><div class="control-track"><span class="brake-zone"></span><i id="controller-pointer"></i></div><small><span>BRAKE</span><span id="reverser">FORWARD</span><span>POWER</span></small></div>
    <button class="instrument aws" id="aws" aria-label="AWS acknowledge"><span class="instrument-label">AWS</span><span class="aws-lamp" id="aws-lamp"><i></i></span><span id="aws-state">Clear</span><kbd>Q</kbd></button></div>
    <div class="controls-strip"><span><kbd>A</kbd> Power / release</span><span><kbd>D</kbd> Brake</span><span><kbd>Q</kbd> Acknowledge</span><span><kbd>SPACE</kbd> Horn</span><span><kbd>W</kbd><kbd>S</kbd> Direction</span><button id="stops-open" class="text-button">Route & stops ${h_}</button><button id="save" class="text-button">Save</button></div>
    <button id="tpws-reset" class="tpws-reset" hidden>TPWS brake demand · stop, then reset</button>
    <div class="touch-controls"><button data-drive="d" aria-label="Apply brakes">D · Brake</button><button data-drive="a" aria-label="Release brake and add power">A · Power</button><button data-drive="horn" aria-label="Horn">Horn</button></div>
  </section>
  <section id="pause-panel" class="dialog" hidden><div class="dialog-card"><h2>Paused</h2><p id="pause-detail">Your train and traffic are paused.</p><button id="continue" class="primary">Continue ${Ks}</button><button id="save-paused" class="secondary">Save journey</button><button id="settings-paused" class="secondary">Settings</button><button id="new-journey" class="text-button">Choose a new journey</button></div></section>
  <section id="settings" class="dialog" hidden><div class="dialog-card"><button class="dialog-close" data-close="settings" aria-label="Close settings">×</button><h2>Settings</h2><label>Render resolution<select id="render-scale"><option value="0.5" selected>50% — faster</option><option value="0.75">75%</option><option value="1">100% — sharper</option></select></label><p class="resolution-note">Scales the 3D view; the controls stay sharp. 50% uses one quarter of the pixels.</p><label>Scenery quality<select id="quality"><option value="low">Light — fewer distant tiles, no shadows</option><option value="balanced" selected>Balanced</option><option value="high">Detailed — more distant scenery</option></select></label><label>Sound level<input id="volume" type="range" min="0" max="1" step=".01" value=".35" /></label><p class="setting-note">A / D: power and brake · Q: AWS · Space: horn · W / S: direction · T: unassigned</p></div></section>
  <section id="stops" class="stops-panel" hidden><button class="dialog-close" data-close="stops" aria-label="Close route">×</button><span class="eyebrow">YOUR JOURNEY</span><h2>The line ahead.</h2><div id="stop-list"></div><small>Representative all-stations service</small></section>
  <section id="error" class="dialog" hidden><div class="dialog-card"><h2 id="error-title">Unable to start</h2><p id="error-text"></p><button id="reload" class="primary">Reload ${Ks}</button></div></section>
  <footer class="credit">© OpenStreetMap contributors · Environment Agency ground data</footer>
</main>`;const Re=i=>document.getElementById(i),Qt={a:!1,d:!1,horn:!1},ki=new a_;let Ie,Xt,nn,kn=!1,hr=!1,es=0,Ka=performance.now(),ic=0,sc=0,gh=0;const yo=new o_;let na=!1;const _h="railway-demo-preferences-v1";function f_(){try{const i=JSON.parse(localStorage.getItem(_h)||"null");["0.5","0.75","1"].includes(i?.renderScale)&&(Re("render-scale").value=i.renderScale),["low","balanced","high"].includes(i?.quality)&&(Re("quality").value=i.quality),typeof i?.volume=="number"&&Number.isFinite(i.volume)&&(Re("volume").value=String(ct(i.volume,0,1)))}catch{}ki.setVolume(Number(Re("volume").value))}function Eo(){try{localStorage.setItem(_h,JSON.stringify({renderScale:Re("render-scale").value,quality:Re("quality").value,volume:Number(Re("volume").value)}))}catch{}}f_();function kt(i,e){Re(i).hidden=!e}function gs(i,e=!1){Re("notice").textContent=i,Re("notice").classList.toggle("important",e),gh=performance.now()+(e?1e4:6500)}function vh(){Qt.a=!1,Qt.d=!1,Qt.horn=!1}function _r(){!kn||!Ie||(Ie.paused=!0,vh(),kt("pause-panel",!0),ki.update(Ie,!1),xs(!1))}function bo(){!hr||!Ie||(Ie.paused=!1,kt("pause-panel",!1),ki.init(),Ka=performance.now(),es=0)}async function xs(i=!0){if(!Ie||!kn)return!1;try{const e=Ie.snapshot();return e.roadTraffic=Xt.roadTraffic.snapshot(),await yo.put(e),na=!1,i&&gs(`Journey saved at ${Ie.clockText()}.`),!0}catch{return(i||!na)&&gs("This browser could not store the journey."),na=!0,!1}}function as(i){Re("error").hidden&&(console.error(i),Ie&&(Ie.paused=!0),Re("error-text").textContent=i.message,kt("error",!0),vh(),kn&&xs(!1).then(e=>{Re("error-text").textContent=i.message+(e?" Your paused journey was saved. Reload, then choose Continue saved journey.":" Saving failed. Reloading may lose unsaved progress.")}))}function xh(i){const e=Re("start-station"),t=i===1?nn.stations:[...nn.stations].reverse();e.innerHTML=t.map(n=>{const s=n.id===(i===1?"DDG":"KID");return`<option value="${n.id}" ${s?"disabled":""}>${n.name}${s?" · end of route":""}</option>`}).join("")}function p_(){Re("journey-title").innerHTML=Ie.player.direction===1?"KIDDERMINSTER <span>—</span> DORRIDGE":"DORRIDGE <span>—</span> KIDDERMINSTER"}function wo(){const i=Re("stop-list");i.innerHTML=(Ie.player.direction===1?nn.stations:[...nn.stations].reverse()).map(e=>`<div class="stop-item ${Ie.calls.includes(e.id)?"visited":""} ${Ie.targetStation()?.id===e.id?"next":""}"><i></i><span>${e.name}</span><small>${Ie.calls.includes(e.id)?"✓":e.id}</small></div>`).join("")}async function m_(){if(!hr)return;const i=Number(Re("direction").value),e=nn.stations.findIndex(t=>t.id===Re("start-station").value);if(e<0||e+i<0||e+i>=nn.stations.length){Re("begin-label").textContent="Choose a departure with a station ahead";return}Ie.start(i,e),Xt.resetTraffic(),Re("begin").disabled=!0,Re("begin-label").textContent="Preparing departure…";try{await Xt.preparePosition(),kn=!0,kt("menu",!1),kt("hud",!0),Re("journey-title").innerHTML=i===1?"KIDDERMINSTER <span>—</span> DORRIDGE":"DORRIDGE <span>—</span> KIDDERMINSTER",bo(),wo(),gs("Hold A to release the service brake, then add power.")}catch(t){as(t)}finally{Re("begin").disabled=!1,Re("begin-label").textContent="Begin journey"}}function g_(i){if(!Ie||(Re("clock").textContent=Ie.clockText(),!kn))return;Re("speed").textContent=Math.round(Ie.speedMph).toString(),Re("limit").textContent=String(nn.limit(Ie.player.s)),Re("speed").classList.toggle("overspeed",Ie.speedMph>nn.limit(Ie.player.s)+2);const e=Ie.targetStation(),t=Math.max(0,Ie.distanceToStop());Re("next-stop").textContent=e?.name||(Ie.player.arrived?"Journey complete":"End of line"),Re("distance").textContent=t>=1e3?`${(t/1e3).toFixed(1)} km`:`${Math.round(t)} m`,Re("doors").textContent=Ie.player.doors?`Doors open · ${Math.ceil(Ie.player.dwell)}s`:"Doors secured",Re("doors").classList.toggle("open",Ie.player.doors);const n=Ie.player.controller;Re("controller-state").textContent=Ie.aws.brake||Ie.tpws.active||Ie.player.authorityBrake?"Safety brake demand":n<-.02?`${Math.round(-n*100)}% service brake`:n>.02?`${Math.round(n*100)}% power`:"Coasting",Re("controller-pointer").style.left=`${(n+1)*50}%`,Re("reverser").textContent=Ie.player.reverseAuthority?"REVERSAL · 10 MPH":Ie.player.direction===1?"FORWARD":"REVERSE",Re("aws-lamp").classList.toggle("warning",Ie.aws.indicator),Re("aws").classList.toggle("pending",Ie.aws.pending),Re("aws-state").textContent=Ie.aws.pending?"Acknowledge":Ie.aws.brake?"Brake demand":Ie.aws.indicator?"Acknowledged":"Clear",kt("tpws-reset",Ie.tpws.active),Re("tpws-reset").textContent=Ie.tpws.active?`${Ie.tpws.reason} · Reset when stopped`:"",Re("stop-progress").style.width=`${ct(1-t/5e3,0,1)*100}%`,i>gh&&!Ie.aws.pending&&!Ie.tpws.active?Re("notice").classList.add("quiet"):Re("notice").classList.remove("quiet")}Re("begin").addEventListener("click",m_);Re("pause").addEventListener("click",_r);Re("continue").addEventListener("click",bo);Re("aws").addEventListener("click",()=>Ie?.acknowledge());Re("tpws-reset").addEventListener("click",()=>Ie?.resetTPWS());Re("save").addEventListener("click",()=>xs());Re("save-paused").addEventListener("click",()=>xs());Re("reload").addEventListener("click",()=>location.reload());Re("new-journey").addEventListener("click",()=>{Ie.paused=!0,kn=!1,kt("pause-panel",!1),kt("hud",!1),kt("menu",!0)});Re("settings-open").addEventListener("click",()=>kt("settings",!0));Re("settings-paused").addEventListener("click",()=>kt("settings",!0));Re("stops-open").addEventListener("click",()=>{wo(),kt("stops",!0)});document.querySelectorAll("[data-close]").forEach(i=>i.addEventListener("click",()=>kt(i.dataset.close,!1)));Re("direction").addEventListener("change",()=>xh(Number(Re("direction").value)));Re("quality").addEventListener("change",()=>{Xt?.setQuality(Re("quality").value),Eo()});Re("render-scale").addEventListener("change",()=>{Xt?.setRenderScale(Number(Re("render-scale").value)),Eo()});Re("volume").addEventListener("input",()=>{ki.setVolume(Number(Re("volume").value)),Eo()});Re("resume-save").addEventListener("click",async()=>{try{const i=await yo.get();if(!i)throw new Error("No saved journey was found.");Ie.restore(i),i.roadTraffic&&Xt.roadTraffic.restore(i.roadTraffic),Xt.synchronizeClock(),await Xt.preparePosition(),kn=!0,kt("menu",!1),kt("hud",!0),p_(),wo(),bo(),gs("Saved journey restored.")}catch(i){as(i)}});document.querySelectorAll("[data-drive]").forEach(i=>{const e=i.dataset.drive;i.addEventListener("pointerdown",t=>{Qt[e]=!0,i.setPointerCapture(t.pointerId)}),i.addEventListener("pointerup",()=>Qt[e]=!1),i.addEventListener("pointercancel",()=>Qt[e]=!1)});window.addEventListener("keydown",i=>{if(!kn||Ie.paused||["SELECT","INPUT","TEXTAREA"].includes(i.target?.tagName))return;const e=i.code;["KeyA","KeyD","KeyQ","KeyW","KeyS","Space"].includes(e)&&i.preventDefault(),e==="KeyA"&&(Qt.a=!0),e==="KeyD"&&(Qt.d=!0),e==="Space"&&(Qt.horn=!0),i.repeat||(e==="KeyQ"&&Ie.acknowledge(),e==="KeyW"&&Ie.setDirection(1),e==="KeyS"&&Ie.setDirection(-1),e==="Escape"&&_r())});window.addEventListener("keyup",i=>{i.code==="KeyA"&&(Qt.a=!1),i.code==="KeyD"&&(Qt.d=!1),i.code==="Space"&&(Qt.horn=!1)});window.addEventListener("blur",_r);document.addEventListener("visibilitychange",()=>{document.hidden&&_r()});async function __(){try{let i=function(n){try{const s=Math.min(1,(n-Ka)/1e3);if(Ka=n,es+=s,Ie.paused)es=0;else for(;es>=.016666666666666666;)Ie.update(.016666666666666666,Qt),es-=.016666666666666666;ki.update(Ie,Qt.horn),Xt.draw(s),n-ic>100&&(g_(n),ic=n),kn&&!Ie.paused&&n-sc>1e4&&(xs(!1),sc=n),requestAnimationFrame(i)}catch(s){as(s)}};const e=await fetch(Pi("data/route.json",document.baseURI));if(!e.ok)throw new Error("Route data is missing. Check that the website’s data folder was copied in full.");const t=await e.json();t.worldHash="989d7fb12e8be65cd86777c07ee04ca536985df5169ed062819647b6b19d8631",nn=new Th(t),nn.setEndpointContext(c_(nn)),Ie=new Wg(nn),Ie.sound=n=>ki.event(n),Ie.onEvent=n=>{(n.type==="aws"||n.type==="tpws"||n.type==="station"||n.type==="direction"||n.type==="complete")&&gs(n.message,n.type==="tpws"||n.type==="aws")},xh(1),Xt=new e_(Re("viewport"),t,nn,Ie),Xt.setRenderScale(Number(Re("render-scale").value)),Xt.setQuality(Re("quality").value),Xt.onError=as,Xt.onProgress=()=>{!hr&&Xt.tileCount>=3&&(hr=!0,Re("begin").disabled=!1,Re("begin-label").textContent="Begin journey",Re("gpu-state").innerHTML="<i></i> WEBGL 2 READY",yo.get().then(n=>kt("resume-save",!!n)).catch(()=>kt("resume-save",!1)))},await Xt.init(),requestAnimationFrame(i)}catch(i){as(i)}}__();
