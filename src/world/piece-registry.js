/** OpenLoco-inspired construction families. Dimensions here are project-scale
 * approximations, not copies of OpenLoco's coordinates or sprite definitions.
 * The resulting grid anchors are authoritative; geometry stays smooth. */
import {GRID,anchor,position,piece} from './grid.js';
import {CurvePath} from '../core/geometry.js';

const railRows=[
 ['Straight','straight'],['Diagonal straight','diagonal'],
 ['Very small left curve','arc',.5,-1],['Very small right curve','arc',.5,1],
 ['Small left curve','arc',1.5,-1],['Small right curve','arc',1.5,1],
 ['Normal left curve','arc',2.5,-1],['Normal right curve','arc',2.5,1],
 ['Large left curve','arc',3.5,-1],['Large right curve','arc',3.5,1],
 ['Diagonal large left curve','diagonalArc',3.5,-1],['Diagonal large right curve','diagonalArc',3.5,1],
 ['Left S-bend','s',0,-1],['Right S-bend','s',0,1],
 ['Straight slope up','straight',0,0,1],['Straight slope down','straight',0,0,-1],
 ['Straight steep slope up','straight',0,0,2],['Straight steep slope down','straight',0,0,-2],
 ['Small left curve uphill','arc',1.5,-1,1],['Small right curve uphill','arc',1.5,1,1],
 ['Small left curve downhill','arc',1.5,-1,-1],['Small right curve downhill','arc',1.5,1,-1],
 ['Small left curve steep uphill','arc',1.5,-1,2],['Small right curve steep uphill','arc',1.5,1,2],
 ['Small left curve steep downhill','arc',1.5,-1,-2],['Small right curve steep downhill','arc',1.5,1,-2],
 ['Straight left side','sideStraight',0,0,0,-1,-1],['Straight right side','sideStraight',0,0,0,1,1],
 ['Very small left curve inner','sideArc',.375,-1,0,-1,-1],['Very small left curve outer','sideArc',.625,-1,0,1,1],
 ['Very small right curve outer','sideArc',.625,1,0,-1,-1],['Very small right curve inner','sideArc',.375,1,0,1,1],
 ['S-bend left side to right side','sideS',0,0,0,-1,1],['S-bend right side to left side','sideS',0,0,0,1,-1],
 ['Left-side straight steep uphill','sideStraight',0,0,2,-1,-1],['Right-side straight steep uphill','sideStraight',0,0,2,1,1],
 ['Left-side straight steep downhill','sideStraight',0,0,-2,-1,-1],['Right-side straight steep downhill','sideStraight',0,0,-2,1,1],
 ['S-bend single to left side','sideS',0,0,0,0,-1],['S-bend single to right side','sideS',0,0,0,0,1],
 ['S-bend left side to single','sideS',0,0,0,-1,0],['S-bend right side to single','sideS',0,0,0,1,0],
 ['Clockwise turnaround','turnaround',.5,1],['Anticlockwise turnaround','turnaround',.5,-1],
];
const roadRows=[['Straight','straight'],['Very small left curve','arc',.5,-1],['Very small right curve','arc',.5,1],['Small left curve','arc',1.5,-1],['Small right curve','arc',1.5,1],['Straight slope up','straight',0,0,1],['Straight slope down','straight',0,0,-1],['Straight steep slope up','straight',0,0,2],['Straight steep slope down','straight',0,0,-2],['Turnaround','turnaround',.5,1]];
function catalogue(rows,mode){return Object.freeze(rows.map(([name,family,radiusTiles=0,turn=0,slope=0,sideStart=0,sideEnd=0],id)=>Object.freeze({id,name,mode,family,radiusTiles:radiusTiles||null,turn,nominalGrade:slope/16,sideStart,sideEnd,oneSided:family.startsWith('side')})));}
export const RAIL_PIECES=catalogue(railRows,'rail');
export const ROAD_PIECES=catalogue(roadRows,'road');
export function referencePiece(mode,id){const definition=(mode==='rail'?RAIL_PIECES:mode==='road'?ROAD_PIECES:[])[id];if(!definition)throw new Error(`Unknown ${mode} reference piece ${id}`);return definition;}
const smooth=t=>t*t*(3-2*t),unit=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
const rotate=(x,z,a)=>[x*Math.cos(a)-z*Math.sin(a),x*Math.sin(a)+z*Math.cos(a)];

/** Instantiate one physical path, with optional quarter/half or curved clips.
 * Ports point into the piece. Node identities are supplied by the builder; a
 * plan crossing alone cannot create a connection. */
export function instantiatePiece({id,mode='rail',referenceId,origin=[0,0,0],rotation=0,headingStep=0,reverse=false,nodes,range=[0,1],radiusMetres,grade,clearance}={}){
 const d=referencePiece(mode,referenceId),[from,to]=range;
 if(!id||!Array.isArray(origin)||origin.length!==3||!origin.every(Number.isFinite)||!Number.isInteger(rotation)||rotation<0||rotation>3||!Number.isInteger(headingStep)||headingStep<0||headingStep>7||!(from>=0&&to<=1&&to>from))throw new Error('Invalid piece placement');
 const size=GRID.cellSize,sideWidth=size/8,heading=rotation*Math.PI/2+headingStep*Math.PI/4+(d.family==='diagonal'||d.family==='diagonalArc'?Math.PI/4:0),slope=grade??d.nominalGrade;
 const radius=radiusMetres??(d.radiusTiles?d.radiusTiles*size:0);
 if(!Number.isFinite(slope)||!Number.isFinite(radius)||radius<0||((d.family.includes('Arc')||d.family==='arc'||d.family==='diagonalArc'||d.family==='turnaround')&&radius<=0))throw new Error('Invalid radius or grade');
 const bend=d.family==='turnaround'?Math.PI:d.family==='diagonalArc'?Math.PI/4:Math.PI/2;
 const curved=['arc','diagonalArc','sideArc','turnaround'].includes(d.family),length=curved?radius*bend:(d.family==='s'||d.family==='sideS'?size*2:size);
 const source=t=>{
  let x,z,dx,dz;
  if(curved){const a=bend*t*d.turn;x=radius*Math.sin(bend*t);z=d.turn*radius*(1-Math.cos(bend*t))+d.sideStart*sideWidth;dx=radius*bend*Math.cos(a);dz=radius*bend*Math.sin(a);}
  else if(d.family==='s'||d.family==='sideS'){
   const a=d.family==='s'?0:d.sideStart*sideWidth,b=d.family==='s'?d.turn*size:d.sideEnd*sideWidth;
   x=length*t;z=a+(b-a)*smooth(t);dx=length;dz=(b-a)*6*t*(1-t);
  }else{x=length*t;z=d.sideStart*sideWidth;dx=length;dz=0;}
  const [rx,rz]=rotate(x,z,heading),[vx,vz]=rotate(dx,dz,heading);
  return {point:[origin[0]+rx,origin[1]+slope*length*t,origin[2]+rz],tangent:unit([vx,slope*length,vz])};
 };
 const count=Math.max(4,Math.ceil((to-from)*Math.max(length/2,16))),raw=Array.from({length:count+1},(_,i)=>source(from+(to-from)*i/count));
 if(reverse)raw.reverse();
 const points=raw.map(q=>position(anchor(q.point))),start=raw[0].tangent.map(v=>v*(reverse?-1:1)),end=raw.at(-1).tangent.map(v=>v*(reverse?1:-1));
 const ports=nodes||[`${id}/start`,`${id}/end`],result=piece(id,points,reverse?[ports[1],ports[0]]:ports,mode);
 result.ports[0].vector=start;result.ports[1].vector=end;
 result.template=`${mode}/reference/${referenceId}`;result.referenceId=referenceId;result.name=d.name;result.rotation=rotation;result.headingStep=headingStep;result.reverse=reverse;result.range=[from,to];
 result.clearance=clearance||{lateral:mode==='rail'?2.2:3.5,vertical:mode==='rail'?6:5};
 result.assets=mode==='rail'?{bed:'existing/rail-bed',sleepers:'existing/sleepers',rails:'existing/rails'}:{surface:'existing/road-surface'};
 result.occupancy=occupiedQuarters(points,result.clearance.lateral);
 return result;
}

/** Sample the exact same stored anchors and port tangents for a compositor or vehicle. */
export function piecePath(item){
 if(item.constructionProfile)return constructionPath(item);
 const points=item.anchors.map(position),path=new CurvePath(points);
 for(const [i,sign] of [[0,1],[1,-1]]){const v=item.ports[i].vector,h=Math.hypot(v[0],v[2])||1;path.derivatives[i?path.derivatives.length-1:0]=v.map(n=>sign*n/h);}
 return path;
}

/** Full-section construction geometry. The grade is a boundary-constrained
 * cubic over analytic horizontal arc distance, shared by rendering and travel.
 * Legacy imported paths keep their existing interpolation above. */
export function constructionPath(item){
 const c=item.constructionProfile,d=referencePiece(item.ports[0].mode,item.referenceId),radius=c.radiusMetres??d.radiusTiles*GRID.cellSize,curved=d.family==='arc';
 if(!['straight','arc'].includes(d.family))throw new Error(`Unsupported construction path ${item.id}`);
 const length=curved?radius*Math.PI/2:GRID.cellSize,origin=position(c.origin),heading=c.rotation*Math.PI/2,rise=c.riseTicks*GRID.heightStep;
 const a=length*(c.startGrade+c.endGrade)-2*rise,b=3*rise-length*(2*c.startGrade+c.endGrade),v=length*c.startGrade;
 return {length,sample(s,offset=0){
  const t=Math.max(0,Math.min(1,s/length)),theta=curved?t*Math.PI/2:0;
  const [x,z]=rotate(curved?radius*Math.sin(theta):t*length,curved?d.turn*radius*(1-Math.cos(theta)):0,heading);
  const [dx,dz]=rotate(Math.cos(theta),curved?d.turn*Math.sin(theta):0,heading),grade=(3*a*t*t+2*b*t+v)/length,right=[-dz,0,dx],tangent=[dx,grade,dz];
  return {s,position:[origin[0]+x+right[0]*offset,origin[1]+((a*t+b)*t+v)*t,origin[2]+z+right[2]*offset],right,tangent,grade,pitch:Math.atan(grade),yaw:Math.atan2(-dx,-dz)};
 }};
}
export function matchingPorts(a,b,cosine=.999){return a.mode===b.mode&&a.anchor.every((v,i)=>v===b.anchor[i])&&a.vector.reduce((sum,v,i)=>sum+v*b.vector[i],0)<=-cosine;}

/** Occupied quarter-cells, including the lateral clearance envelope. */
export function occupiedQuarters(points,halfWidth){
 const cells=new Map(),add=(x,z)=>{const cx=Math.floor(x/GRID.cellSize),cz=Math.floor(z/GRID.cellSize),qx=Math.floor((x-cx*GRID.cellSize)/(GRID.cellSize/2)),qz=Math.floor((z-cz*GRID.cellSize)/(GRID.cellSize/2)),key=`${cx},${cz}`;cells.set(key,(cells.get(key)||0)|(1<<(qz*2+qx)));};
 const across=Math.max(2,Math.ceil(halfWidth*2/(GRID.cellSize/4)));
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz)||1,n=Math.max(1,Math.ceil(len/2));for(let k=0;k<=n;k++){const t=k/n,x=a[0]+dx*t,z=a[2]+dz*t;for(let j=0;j<=across;j++){const side=-halfWidth+2*halfWidth*j/across;add(x-dz/len*side,z+dx/len*side);}}}
 return [...cells].sort(([a],[b])=>a.localeCompare(b)).map(([cell,quarters])=>[...cell.split(',').map(Number),quarters]);
}
