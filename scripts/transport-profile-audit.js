/** Read-only polynomial extrema of the same cubic Hermite curves used by the
 * simulator. Sampling alone can miss a local gradient peak. */
const trim=a=>{while(a.length>1&&Math.abs(a.at(-1))<1e-13)a.pop();return a;};
const add=(a,b,scale=1)=>trim(Array.from({length:Math.max(a.length,b.length)},(_,i)=>(a[i]||0)+scale*(b[i]||0)));
const multiply=(a,b)=>{const c=Array(a.length+b.length-1).fill(0);a.forEach((x,i)=>b.forEach((y,j)=>c[i+j]+=x*y));return trim(c);};
const derivative=a=>a.slice(1).map((n,i)=>n*(i+1));
const value=(a,x)=>a.reduceRight((sum,n)=>sum*x+n,0);
export function polynomialRoots(coefficients,low=0,high=1){
 const a=trim([...coefficients]),scale=Math.max(...a.map(Math.abs),1),epsilon=scale*1e-11;if(a.length<=1)return[];if(a.length===2){const root=-a[0]/a[1];return root>=low&&root<=high?[root]:[];}
 const boundaries=[low,...polynomialRoots(derivative(a),low,high),high],roots=[];
 for(const x of boundaries)if(Math.abs(value(a,x))<epsilon)roots.push(x);
 for(let i=1;i<boundaries.length;i++){let left=boundaries[i-1],right=boundaries[i],fl=value(a,left),fr=value(a,right);if(fl*fr>=0)continue;for(let n=0;n<70;n++){const mid=(left+right)/2,fm=value(a,mid);if(fl*fm<=0){right=mid;fr=fm;}else{left=mid;fl=fm;}}roots.push((left+right)/2);}
 return roots.sort((a,b)=>a-b).filter((x,i,a)=>!i||Math.abs(x-a[i-1])>1e-8);
}
export function profileExtrema(path){
 let maximum=0,at=0,minimumHorizontalSpeed=Infinity;const segments=[];
 if(!path.derivatives){for(let i=1;i<path.points.length;i++){const a=path.points[i-1],b=path.points[i],horizontal=Math.hypot(b[0]-a[0],b[2]-a[2]),grade=horizontal>1e-10?Math.abs((b[1]-a[1])/horizontal):Math.abs(b[1]-a[1])<1e-10?0:Infinity;if(grade>maximum){maximum=grade;at=(path.lengths[i-1]+path.lengths[i])/2;}segments.push({start:path.lengths[i-1],end:path.lengths[i],maximum:grade});}return{maximum,at,segments,method:'Exact piecewise-linear surface segment gradients'};}
 for(let i=0;i<path.points.length-1;i++){
  const a=path.points[i],b=path.points[i+1],span=path.lengths[i+1]-path.lengths[i];if(span<1e-9)continue;const u=path.derivatives[i],w=path.derivatives[i+1];
  const d=a.map((n,k)=>[span*u[k],6*(b[k]-n)-span*(4*u[k]+2*w[k]),6*(n-b[k])+3*span*(u[k]+w[k])]);
  const q=add(multiply(d[0],d[0]),multiply(d[2],d[2])),extrema=add(multiply(derivative(d[1]),q),multiply(d[1],derivative(q)),-.5),candidates=[0,1,...polynomialRoots(extrema)];
  let segmentMaximum=0;for(const t of candidates){const speed=Math.sqrt(Math.max(0,value(q,t))),grade=speed>1e-10?Math.abs(value(d[1],t)/speed):Infinity;minimumHorizontalSpeed=Math.min(minimumHorizontalSpeed,speed/span);if(grade>maximum){maximum=grade;at=path.lengths[i]+span*t;}segmentMaximum=Math.max(segmentMaximum,grade);}
  segments.push({start:path.lengths[i],end:path.lengths[i+1],maximum:segmentMaximum});
 }
 return {maximum,at,minimumHorizontalSpeed,segments};
}
