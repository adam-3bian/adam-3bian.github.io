import {gaugeRight,type Pose} from './geometry';
import type {Direction,V3} from './types';
const unit=(v:V3):V3=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n) as V3;};
const cross=(a:V3,b:V3):V3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];

/** Local +X/right, +Y/up and -Z/forward remain tied to the physical track plane. */
export function trackBasis(pose:Pick<Pose,'tangent'|'right'|'bank'>,direction:Direction=1,forwardOverride?:V3){
  const forward=unit(forwardOverride??pose.tangent.map(x=>x*direction) as V3);
  const lateral=gaugeRight(pose).map(x=>x*direction) as V3;
  const up=unit(cross(lateral,forward)),right=unit(cross(forward,up));
  return {right,up,forward};
}
export function roadBasis(yaw:number,pitch:number,bank:number){return trackBasis({tangent:[-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch)],right:[Math.cos(yaw),0,-Math.sin(yaw)],bank});}
