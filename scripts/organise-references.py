"""Create named location views without rewriting the uploaded source files."""
import csv,hashlib,json,shutil,html
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];REF=ROOT/'references';OUT=REF/'by-location'
# Original five-second anchors visually screened on six contact sheets. Ranges
# locate a station/corridor only: no time-to-distance or precise camera claim.
RANGES=[(17,27,'kidderminster','station'),(28,32,'route-maps','map'),(33,37,'kidderminster','station'),(38,88,'kidderminster-to-blakedown','corridor'),(89,97,'blakedown','station'),(98,129,'blakedown-to-hagley','corridor'),(130,139,'hagley','station'),(140,175,'hagley-to-stourbridge-junction','corridor'),(176,193,'stourbridge-junction','station'),(194,228,'stourbridge-junction-to-lye','corridor'),(229,230,'lye','station'),(231,245,'lye-to-cradley-heath','corridor'),(246,248,'cradley-heath','station'),(249,270,'cradley-heath-to-old-hill','corridor'),(271,273,'old-hill','station'),(274,277,'old-hill-tunnel-approach','corridor'),(278,280,'old-hill-tunnel','tunnel'),(281,286,'old-hill-to-rowley-regis','corridor'),(287,296,'rowley-regis','station'),(297,321,'rowley-regis-to-langley-green','corridor'),(322,323,'langley-green','station-sequence-candidate'),(324,343,'langley-green-to-galton-bridge','corridor'),(344,347,'smethwick-galton-bridge','station'),(348,359,'galton-bridge-to-the-hawthorns','corridor'),(360,362,'the-hawthorns','station'),(363,395,'the-hawthorns-to-jewellery-quarter','corridor'),(396,398,'jewellery-quarter','station'),(399,407,'hockley-tunnels','tunnel'),(408,418,'jewellery-quarter-to-snow-hill','corridor'),(419,435,'birmingham-snow-hill','station'),(436,437,'snow-hill-tunnel','tunnel'),(438,439,'non-railway-inserts','insert'),(440,441,'snow-hill-tunnel','tunnel'),(442,458,'birmingham-moor-street','station'),(459,486,'moor-street-to-small-heath','corridor'),(487,488,'small-heath','station'),(489,510,'small-heath-tyseley-acocks-green-corridor','corridor'),(511,513,'olton','station'),(514,539,'olton-to-solihull','corridor'),(540,550,'solihull','station'),(551,564,'solihull-widney-manor-dorridge-corridor','corridor'),(565,569,'bentley-heath-crossing-candidate','crossing-candidate'),(570,571,'dorridge-area-station-candidate','station-candidate'),(572,598,'unlocated-or-beyond-dorridge','unlocated'),(599,600,'hatton-north-outside-route','outside-route')]
def classify(n):
 for a,b,place,kind in RANGES:
  if a<=n<=b:return place,kind
 return 'unlocated','unlocated'
def slug(s):return s.lower().replace(' ','-')
def main():
 OUT.mkdir(exist_ok=True)
 originals=list(csv.DictReader((REF/'frame-index.csv').open()))
 # File names in the original index are also preserved in canonical_path.
 by_hash={r['sha256']:r for r in originals};by_original={int(r['frame_number']):r for r in originals}
 expanded=list(csv.DictReader((REF/'frame-index-expanded.csv').open()));records=[];folders={}
 for row in expanded:
  number=int(row['frame_number']);exact=(number+2)//5 if (number+2)%5==0 else None;exact_row=by_original.get(exact);match=exact_row if exact_row and exact_row['sha256']==row['sha256'] else by_hash.get(row['sha256']);original=int(match['frame_number']) if match else None
  if original is not None:location,kind=classify(original);basis='original contact-sheet location anchor or corridor context; not pose alignment'
  else:
   left=(number+2)//5;right=left+1
   if 17<=left and right<=600 and classify(left)==classify(right):location,kind=classify(left);basis='unreviewed one-second frame between matching location-context anchors'
   else:location,kind='unlocated','unlocated';basis='no supported location assignment'
  directory=OUT/location;directory.mkdir(exist_ok=True)
  label=f'{location}-original-{original:04d}.jpg' if original is not None else f'{location}-expanded-{number:04d}.jpg'
  if original==133:label='hagley-covered-footbridge-original-0133.jpg'
  if original==137:label='hagley-brake-lane-arch-original-0137.jpg'
  target=directory/label;source=REF/row['canonical_path']
  if hashlib.sha256(source.read_bytes()).hexdigest()!=row['sha256']:raise RuntimeError(f'Changed reference {source}')
  if not target.exists() or hashlib.sha256(target.read_bytes()).hexdigest()!=row['sha256']:shutil.copyfile(source,target)
  rec={'expanded_frame':number,'original_frame':exact if exact_row and exact_row['sha256']==row['sha256'] else None,'content_match_original_frame':original,'location':location,'classification':kind,'basis':basis,'canonical_path':row['canonical_path'],'named_path':str(target.relative_to(REF)),'sha256':row['sha256'],'precise_route_mapping':'unmapped','image_review':'same image content as contact-sheet-screened original' if original is not None else 'unreviewed'}
  records.append(rec);folders.setdefault(location,{})[label]=rec
 expected={REF/r['named_path'] for r in records}
 for old in OUT.rglob('*.jpg'):
  if old not in expected:old.unlink()
 data=json.loads((ROOT/'public/data/route.json').read_text());stations=[]
 for station in data['stations']:
  location=slug(station['name']);directory=OUT/location;directory.mkdir(exist_ok=True)
  count=len(folders.get(location,{}));supported=sum(r['classification']=='station' for r in folders.get(location,{}).values());stations.append({'id':station['id'],'name':station['name'],'folder':location,'map_focus':{'centre':station['sourcePosition'],'viewbox':[station['sourcePosition'][0]-300,station['sourcePosition'][1]-300,600,600]},'named_image_count':count,'supported_station_image_count':supported,'map':'atlas/maps/dorridge-kidderminster-overview.svg','detailed_map':'atlas/maps/dorridge-snow-hill-combined.svg' if station['id'] in ['BSW','BMO','BBS','SMA','TYS','ACG','OLT','SOL','WMR','DDG'] else None,'fidelity_status':'unaccepted; model needs location-specific comparison','source_gap':None if supported else 'No securely assigned station photograph yet; map control is available'})
  (directory/'README.md').write_text(f"# {station['name']}\n\n{count} named source images. Images are evidence, not instructions.\n\n"+('No securely located photograph has been assigned. Do not substitute a neighbouring station.\n' if not supported else 'Location/context labels do not establish exact chainage, camera pose or 2026 accuracy.\n'))
 for station in stations:
  if station['folder'] not in folders:
   (OUT/station['folder']/'index.html').write_text('<!doctype html><meta charset="utf-8"><h1>'+html.escape(station['name'])+'</h1><p>No securely assigned station photograph. Map and exact photo matching remain open.</p><a href="../../atlas/maps/dorridge-kidderminster-overview.svg">Source overview map</a>')
 for location,images in folders.items():
  station=next((s for s in stations if s['folder']==location),None)
  focus=','.join(str(v) for v in station['map_focus']['viewbox']) if station else ''
  map_link=f'<p><a href="../../atlas/maps/dorridge-kidderminster-overview.svg#svgView(viewBox({focus}))">Source map focused on {html.escape(station["name"])}</a></p>' if station else ''
  cards=''.join(f'<figure><a href="{html.escape(name)}"><img loading="lazy" src="{html.escape(name)}"></a><figcaption>{html.escape(name)}<br>{html.escape(r["basis"])}</figcaption></figure>' for name,r in sorted(images.items()))
  (OUT/location/'index.html').write_text('<!doctype html><meta charset="utf-8"><title>'+html.escape(location)+'</title><style>body{font:16px sans-serif}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}img{width:100%}figure{margin:0}</style><h1>'+html.escape(location)+'</h1>'+map_link+'<p>Source/context labels; precise route alignment remains open.</p><main>'+cards+'</main>')
 result={'version':1,'scope':'Derived named copies, source bytes preserved. Context assignment is distinct from direct image inspection, precise route alignment and game fidelity review. No original or expanded source index was rewritten.','source_hashes':{p:hashlib.sha256((REF/p).read_bytes()).hexdigest() for p in ['frame-index.csv','frame-index-expanded.csv','frame-alignment.csv']},'expanded_records':len(records),'unlocated_records':sum(r['classification']=='unlocated' for r in records),'stations':stations,'records':records}
 (REF/'location-index.json').write_text(json.dumps(result,indent=2)+'\n')
 (OUT/'index.html').write_text('<!doctype html><meta charset="utf-8"><title>Route references by location</title><h1>Route references by location</h1><p>Named copies retain original bytes. Corridor/sequence labels are provisional, not a surveyed match. Missing station photographs remain explicit.</p><ul>'+''.join(f'<li><a href="{html.escape(k)}/index.html">{html.escape(k)}</a>: {len(v)} images</li>' for k,v in sorted(folders.items()))+'</ul><h2>All stations</h2><ul>'+''.join(f'<li>{s["name"]}: {s["named_image_count"]} named images; {s["fidelity_status"]}</li>' for s in stations)+'</ul>')
 print(json.dumps({'records':len(records),'named_images':sum(len(v) for v in folders.values()),'unlocated':result['unlocated_records'],'stations_without_secure_photos':[s['name'] for s in stations if not s['supported_station_image_count']]},indent=2))
if __name__=='__main__':main()
