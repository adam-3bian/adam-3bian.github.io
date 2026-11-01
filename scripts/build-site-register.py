"""Inventory every source site; map-ID presence is not geometry/visual acceptance."""
import json,re,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads((ROOT/p).read_text())
def sha(p):return hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
def main():
 data=read('public/data/route.json');roads=read('public/data/road-surfaces.json')['roads'];locations=read('references/location-index.json');defs=read('src/world/site-definitions.json')
 maps=['references/atlas/maps/dorridge-kidderminster-overview.svg','references/atlas/maps/dorridge-snow-hill-roads.svg','references/atlas/maps/dorridge-snow-hill-civils.svg','references/atlas/maps/dorridge-snow-hill-rails.svg']
 ids={p:set(re.findall(r'(?:way|relation)/\d+',(ROOT/p).read_text())) for p in maps};site_report=read('docs/reports/site-source-map-comparison.json');station_reviews={s['id']:s for s in read('docs/station-review.json')['stations']};site_plans={v['id']:v for group in ['stations','civil_structures','tunnels'] for v in site_report[group]};entries=[];plan={r['id']:r for r in read('docs/reports/road-source-map-comparison.json')['entries']}
 for family,features in [('station',data['stations']),('road-or-path',roads),('civil-structure',[v for v in data['structures'] if v['type']!='tunnel']),('tunnel',data['tunnels']),('crossing',data.get('crossings',[]))]:
  for obj in features:
   source_ids=set(re.findall(r'(?:way|relation)/\d+',obj['id']))|{'way/'+str(x) for x in obj.get('sourceWayIds',[])}
   matches=[p for p,values in ids.items() if values&source_ids]
   station=next((s for s in locations['stations'] if s['id']==obj['id']),None)
   site=next((s for s in defs['access'] if obj['id']==s['deck']),None) or next((s for s in defs['roadBridges'] if obj['id']==s['span']),None)
   entries.append({'id':obj['id'],'family':family,'name':obj.get('name'),'source_geometry_sha256':hashlib.sha256(json.dumps(obj,sort_keys=True).encode()).hexdigest(),'source_map_id_matches':matches,'road_plan_comparison':plan.get(obj['id']) if family=='road-or-path' else None,'site_plan_comparison':site_plans.get(obj['id']) if family!='road-or-path' else None,'station_reference_folder':station['folder'] if station else None,'source_backed_special_asset':site['id'] if site else None,'expected_components_checked':'pending','geometry_reference_comparison':'unreviewed','photo_reference_comparison':station_reviews[obj['id']]['review_status'] if family=='station' else 'unreviewed','status':'not accepted'})
 paths=['scripts/build-site-register.py','public/data/route.json','public/data/road-surfaces.json','references/location-index.json','docs/station-review.json','src/world/site-definitions.json','docs/reports/road-source-map-comparison.json','docs/reports/site-source-map-comparison.json',*maps]
 out={'version':1,'scope':'Complete source census and exact source-ID lookup in supplied maps. Same-source map presence is not independent confirmation, positional matching, emitted-asset completeness or image review. Every instance remains in the denominator.','source_hashes':{p:sha(p) for p in paths},'counts':{family:sum(e['family']==family for e in entries) for family in sorted({e['family'] for e in entries})},'accepted':0,'entries':entries}
 (ROOT/'docs/route-site-register.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'counts':out['counts'],'accepted':0},indent=2))
if __name__=='__main__':main()
