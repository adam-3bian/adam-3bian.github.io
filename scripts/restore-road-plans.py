"""Restore every retained SVG plan vertex; keep inferred Y controls and owners."""
import json,hashlib,re,xml.etree.ElementTree as ET
from pathlib import Path
import numpy as np
from build_route import paths,join_subpaths,title,SVG,json_write,build_road_surfaces
ROOT=Path(__file__).resolve().parents[1]
def main():
 source=ROOT/'references/atlas/maps/dorridge-kidderminster-overview.svg';root=ET.parse(source).getroot();group=next(g for g in root.iter(SVG+'g') if g.get('data-layer')=='roads');original={}
 for el in group:
  key=re.search(r'way/\d+',title(el))
  if key:
   for i,p in enumerate(join_subpaths(paths(el.get('d','')))):original[f'{key.group()}/{i}']=p
 manifest=ROOT/'public/data/road-surfaces.json';old_hash=hashlib.sha256(manifest.read_bytes()).hexdigest();roads=json.loads(manifest.read_text())['roads'];proposed={};changes=[]
 for f in roads:
  source_xy=original[f['id']];q=np.asarray(f['points']);indexes=[];cursor=0
  for p in q:
   found=next((i for i in range(cursor,len(source_xy)) if np.linalg.norm(source_xy[i]-p[[0,2]])<.015),None)
   if found is None:raise RuntimeError(f"{f['id']}: cannot associate an existing height control with its ordered source path")
   indexes.append(found);cursor=found+1
  ss=np.r_[0,np.cumsum(np.linalg.norm(np.diff(source_xy,axis=0),axis=1))];height=np.interp(ss,ss[indexes],q[:,1]);points=np.round(np.column_stack([source_xy[:,0],height,source_xy[:,1]]),2).tolist()
  if points[0]!=f['points'][0] or points[-1]!=f['points'][-1]:raise RuntimeError(f"{f['id']}: endpoint changed")
  proposed[f['id']]=points
  if points!=f['points']:changes.append({'id':f['id'],'before_vertices':len(f['points']),'after_vertices':len(points)})
 # Validate all source associations before changing any tile. Each tile write is atomic.
 for file in sorted((ROOT/'public/data/tiles').glob('*.json')):
  tile=json.loads(file.read_text());changed=False
  for f in tile['roads']:
   points=proposed[f['id']]
   if points!=f['points']:f['points']=points;changed=True
  if changed:json_write(file,tile)
 build_road_surfaces()
 report={'scope':'Every road/path retained under the same ID and source tile owner. Restore omitted mapped X/Z vertices; interpolate only model Y between existing ordered controls. No road nodes, bridge layers, heights or source confidence are invented.','source_svg_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'prior_road_manifest_sha256':old_hash,'new_road_manifest_sha256':hashlib.sha256(manifest.read_bytes()).hexdigest(),'roads_retained':len(roads),'changed_paths':len(changes),'changes':changes}
 (ROOT/'docs/reports/road-plan-restoration.json').write_text(json.dumps(report,indent=2)+'\n');print({'retained':len(roads),'changed':len(changes)})
if __name__=='__main__':main()
