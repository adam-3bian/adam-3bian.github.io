"""Compare every exported road plan with its actual supplied SVG source path."""
import json,hashlib,re,xml.etree.ElementTree as ET
from pathlib import Path
import numpy as np
from build_route import paths,join_subpaths,title,SVG
ROOT=Path(__file__).resolve().parents[1]
def distances(points,path):
 a=path[:-1];v=path[1:]-a;den=(v*v).sum(axis=1);best=[]
 for q in points:
  t=np.clip(((q-a)*v).sum(axis=1)/np.maximum(den,1e-12),0,1);best.append(float(np.sqrt(((q-a-t[:,None]*v)**2).sum(axis=1).min())))
 return max(best,default=0)
def main():
 source=ROOT/'references/atlas/maps/dorridge-kidderminster-overview.svg';root=ET.parse(source).getroot();group=next(g for g in root.iter(SVG+'g') if g.get('data-layer')=='roads');source_paths={}
 for e in group:
  match=re.search(r'way/\d+',title(e))
  if match:
   for i,p in enumerate(join_subpaths(paths(e.get('d','')))):source_paths[f'{match.group()}/{i}']=p
 rows=[]
 for f in json.loads((ROOT/'public/data/road-surfaces.json').read_text())['roads']:
  p=source_paths.get(f['id']);q=np.array([[v[0],v[2]] for v in f['points']]);error=None
  if p is not None and len(q)>1:
   # Source vertices expose bends omitted by simplification. Segment midpoints
   # expose shortcut chords across a source corner; this is finite plan QA.
   sample=np.vstack([q,(q[1:]+q[:-1])/2]);error=max(distances(p,q),distances(sample,p))
  rows.append({'id':f['id'],'source_path_present':p is not None,'plan_deviation_m':error,'status':'missing source path' if error is None else 'over 2 m; review source simplification' if error>2 else 'within 2 m at finite source/segment samples','vertical_profile':'inferred; not checked by 2D map audit'})
 paths_in=['scripts/audit-source-maps.py','scripts/build_route.py','references/atlas/maps/dorridge-kidderminster-overview.svg','public/data/road-surfaces.json'];report={'version':1,'scope':'Actual per-subpath SVG plan compared with runtime road/path centreline vertices and midpoints. Same-source consistency, not an independent survey, rendered-width/level/bridge-opening test or photograph review. The exporter parser is reused; parser faults are not independently ruled out.','sourceHashes':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in paths_in},'road_paths':len(rows),'source_subpaths':len(source_paths),'omitted_source_subpaths':sorted(set(source_paths)-{r['id'] for r in rows}),'missing_source_paths':sum(not r['source_path_present'] for r in rows),'over_2m':sum(r['plan_deviation_m'] is not None and r['plan_deviation_m']>2 for r in rows),'maximum_plan_deviation_m':max((r['plan_deviation_m'] or 0) for r in rows),'entries':rows}
 (ROOT/'docs/reports/road-source-map-comparison.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k not in ['sourceHashes','entries']},indent=2))
 if report['missing_source_paths'] or report['over_2m'] or report['omitted_source_subpaths']:raise SystemExit(1)
if __name__=='__main__':main()
