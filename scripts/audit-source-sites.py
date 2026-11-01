"""Check all station pins and exported civil footprints against uploaded maps."""
import json,hashlib,xml.etree.ElementTree as ET
from pathlib import Path
import numpy as np
from build_route import paths,title,SVG
ROOT=Path(__file__).resolve().parents[1]
def main():
 d=json.loads((ROOT/'public/data/route.json').read_text());overview=ET.parse(ROOT/'references/atlas/maps/dorridge-kidderminster-overview.svg').getroot();stations=next(g for g in overview.iter(SVG+'g') if g.get('data-layer')=='stations');pins={title(c):np.array([float(c.get('cx')),float(c.get('cy'))]) for c in stations.findall(SVG+'circle')}
 station_rows=[]
 for s in d['stations']:
  p=pins.get(s['name']);stored=np.array(s['sourcePosition']);position=np.array(s['position'])[[0,2]]
  station_rows.append({'id':s['id'],'name':s['name'],'source_pin_error_m':float(np.linalg.norm(stored-p)) if p is not None else None,'generated_rail_control_offset_m':float(np.linalg.norm(position-p)) if p is not None else None,'status':'source pin retained; layout and photography require separate review','note':'A station pin is not a running-rail centreline; do not move correct track to it.'})
 civils=ET.parse(ROOT/'references/atlas/maps/dorridge-snow-hill-civils.svg').getroot();polys={}
 for g in civils.findall(SVG+'g'):
  label=title(g);p=g.find(SVG+'path')
  if 'source ways' in label and p is not None:
   pp=paths(p.get('d',''))
   if pp:polys[label.split(' · ')[0]]=pp[0]
 civil_rows=[]
 for s in d['structures']:
  if s['type']=='tunnel':continue
  p=polys.get(s['id']);q=np.asarray(s.get('footprint',[]));error=None
  if p is not None and p.shape==q.shape:error=float(np.linalg.norm(p-q,axis=1).max())
  civil_rows.append({'id':s['id'],'type':s['type'],'source_footprint_error_m':error,'status':'source plan retained; emitted geometry, levels, supports and photo match unaccepted' if error is not None and error<=.01 else 'missing or changed source footprint'})
 tunnel_rows=[{'id':s['id'],'status':'unverified portal/level controls; photographs and maps must be reconciled','reference_folder':'references/by-location/'+('old-hill-tunnel' if 'old-hill' in s['id'] else 'snow-hill-tunnel' if 'snow' in s['id'] else 'hockley-tunnels'),'note':'A source interval/inferred bore is not a georeferenced portal/height survey.'} for s in d['tunnels']]
 inputs=['scripts/audit-source-sites.py','scripts/build_route.py','public/data/route.json','references/atlas/maps/dorridge-kidderminster-overview.svg','references/atlas/maps/dorridge-snow-hill-civils.svg']
 failures=sum(v['source_pin_error_m'] is None or v['source_pin_error_m']>.01 for v in station_rows)+sum(v['source_footprint_error_m'] is None or v['source_footprint_error_m']>.01 for v in civil_rows)
 r={'scope':'All original station source pins and exported bridge/footbridge footprints compared with uploaded SVG controls. Same-source plan fidelity only; emitted 3D geometry, western absent structures, operation and photographs are not certified.','sourceHashes':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in inputs},'source_civil_footprints':len(polys),'omitted_source_civils':sorted(set(polys)-{v['id'] for v in civil_rows}),'stations':station_rows,'civil_structures':civil_rows,'tunnels':tunnel_rows,'source_plan_failures':failures,'site_acceptance':'incomplete'}
 (ROOT/'docs/reports/site-source-map-comparison.json').write_text(json.dumps(r,indent=2)+'\n');print({'stations':len(station_rows),'civil_structures':len(civil_rows),'tunnels':len(tunnel_rows),'source_plan_failures':failures,'tunnel_controls_verified':0})
 if failures:raise SystemExit(1)
if __name__=='__main__':main()
