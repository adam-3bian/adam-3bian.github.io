#!/usr/bin/env python3
"""Build dated, source-connected reconstruction controls. No network at build time.

Plan geometry comes from the archived OSM extracts; profile lengths are digitised
approximately from the SVR's 2001 gradient diagram. They are not a railhead survey.
"""
import json, math, heapq
from pathlib import Path
from collections import defaultdict
import numpy as np
from scipy.spatial import cKDTree
from pyproj import Transformer

ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'references/location-reference-manifest.json').read_text())
assert manifest['era']==2026
route=json.loads((ROOT/'public/data/route.json').read_text())
services=json.loads((ROOT/'public/data/adjacent-services.json').read_text())['services']
transform=Transformer.from_crs(4326,27700,always_xy=True)
nodes={};ways={}
for filename in ['svr-osm.json','urban-osm.json','svr-land-osm.json','galton-access-osm.json','duddeston-osm.json']:
 p=ROOT/'references/geography'/filename
 if not p.exists():continue
 for e in json.loads(p.read_text())['elements']:
  if e['type']=='node':nodes[e['id']]={**nodes.get(e['id'],{}),**e}
  elif e['type']=='way':ways[e['id']]=e
xy={}
for id,n in nodes.items():
 x,y=transform.transform(n['lon'],n['lat']);xy[id]=np.array([x-400000,280000-y])
main=np.array(route['points']);main_tree=cKDTree(main[:,[0,2]])
stations={s['id']:s for s in route['stations']}
galton=next(s for s in services if s['id']=='galton-crossing-emu');low=np.array(galton['points']);low_tree=cKDTree(low[:,[0,2]])
def main_y(p):return float(main[main_tree.query(p)[1],1])
def centre(w):return np.mean([xy[n] for n in w['nodes']],axis=0)
def coords(w):return np.array([xy[n] for n in w['nodes']])
svrways=[w for w in ways.values() if w.get('tags',{}).get('railway')=='rail' and w.get('tags',{}).get('railway:preserved')=='yes' and w.get('tags',{}).get('operator')=='Severn Valley Railway']
graph=defaultdict(list)
for w in svrways:
 for a,b in zip(w['nodes'],w['nodes'][1:]):
  d=float(np.linalg.norm(xy[a]-xy[b]));graph[a].append((b,d));graph[b].append((a,d))
svr_nodes=list(graph);svr_tree=cKDTree([xy[n] for n in svr_nodes])
station_ids={'Kidderminster Town':'KDT','Bewdley':'BEW','Northwood Halt':'NWH','Arley':'ARL','Highley':'HIG','Country Park Halt':'CPH','Hampton Loade':'HLD','Eardington':'EAR','Bridgnorth':'BRG'}
source_stations=[n for n in nodes.values() if n.get('tags',{}).get('name') in station_ids and n.get('tags',{}).get('railway') in ['station','halt']]
start=ways[4016362]['nodes'][-1]
def distances(start):
 dist={start:0};prev={};queue=[(0,start)]
 while queue:
  d,n=heapq.heappop(queue)
  if d!=dist[n]:continue
  for m,l in graph[n]:
   nd=d+l
   if nd<dist.get(m,math.inf):dist[m]=nd;prev[m]=n;heapq.heappush(queue,(nd,m))
 return dist,prev
dist,prev=distances(start)
station_nodes={station_ids[n['tags']['name']]:svr_nodes[svr_tree.query(xy[n['id']])[1]] for n in source_stations}
end=station_nodes['BRG'];path=[end]
while path[-1]!=start:path.append(prev[path[-1]])
path.reverse();length=dist[end];bew=dist[station_nodes['BEW']]
# Gradient break proportions traced from the published diagram. Signed gradients
# themselves are retained; absolute datum and approximate break chainages declared.
south=[(58,-112),(23,0),(39,115),(6,0),(80,-100),(18,0),(35,-188),(10,-200),(22,0)]
north=[(16,105),(65,0),(31,145),(12,0),(16,-145),(20,0),(15,200),(39,0),(24,-150),(20,0),(16,160),(8,0),(23,-145),(13,0),(56,180),(7,0),(39,-225),(75,0),(48,143),(12,0),(12,145),(12,0),(28,100),(8,0),(62,-100),(7,0),(46,-135),(44,0),(16,-280),(26,145),(38,0),(32,-200),(82,0),(53,100),(10,200),(80,100),(7,0),(31,-100),(17,0),(18,-100),(17,-175),(27,0),(19,-100),(14,0)]
breaks=[0.];heights=[58.625]
for sections,total in [(south,bew),(north,length-bew)]:
 scale=total/sum(w for w,g in sections)
 for width,grade in sections:
  d=width*scale;breaks.append(breaks[-1]+d);heights.append(heights[-1]+(d/grade if grade else 0))
def svr_y(n):return float(np.interp(dist.get(n,0),breaks,heights))
node_y={n:svr_y(n) for n in graph}
aux=[];topology=[]
selected=[]
for w in ways.values():
 t=w.get('tags',{});kind=t.get('railway');c=centre(w);near,idx=main_tree.query(c)
 if kind not in ['rail','tram']:continue
 heritage=w in svrways
 kid=kind=='rail' and -16450<c[0]<-15900 and 3450<c[1]<4700
 metro=kind=='tram' and 1600<c[0]<6700 and -10200<c[1]<-7600
 lower=kind=='rail' and t.get('name')=='Rugby-Birmingham-Stafford Line' and np.linalg.norm(c-np.array(stations['SGB']['position'])[[0,2]])<950
 tyseley=kind=='rail' and 10200<c[0]<11300 and -5000<c[1]<-3700 and (t.get('service') in ['siding','yard','spur'] or 'Yard' in t.get('name','') or t.get('railway:preserved')=='yes')
 if not (heritage or kid or metro or lower or tyseley):continue
 selected.append((w,heritage,kid,metro,lower,tyseley))
 for n in w['nodes']:
  if n in node_y:continue
  p=xy[n]
  node_y[n]=float(low[low_tree.query(p)[1],1]) if lower else main_y(p)-(.2 if tyseley else 0)
 # The source Kidderminster connection shares exact OSM nodes with both graphs.
for w,heritage,kid,metro,lower,tyseley in selected:
 if heritage:
  w={**w,'nodes':[n for n in w['nodes'] if dist.get(n,math.inf)<=2400]}
  if len(w['nodes'])<2:continue
 ps=[[round(xy[n][0],2),round(node_y[n]*32)/32,round(xy[n][1],2)] for n in w['nodes']]
 c=centre(w);t=w['tags'];region='svr' if heritage else 'kidderminster' if kid else 'metro' if metro else 'galton' if lower else 'tyseley'
 id='osm/'+str(w['id']);metadata={'sceneryOnly':True,'region':region,'sourceWayIds':[str(w['id'])],'sourceNodeIds':[str(n) for n in w['nodes']],'independentNetwork':metro or lower,'mode':'tram' if metro else 'rail','bridge':t.get('bridge'),'tunnel':t.get('tunnel'),'name':t.get('tunnel:name') or t.get('bridge:name') or t.get('name'),'service':t.get('service'),'sourceTags':t}
 # Main-line continuation is rendered by endpointContext inside the driving area.
 render=heritage or metro or lower or tyseley or t.get('service') in ['siding','yard','spur','crossover']
 if kid and not heritage and render and main_tree.query(c)[0]<2.2:render=False
 metadata['renderStatic']=render
 aux.append({'id':id,'kind':'tram' if metro else 'heritage' if heritage else 'rail','points':ps,'overhead':t.get('electrified')=='contact_line','metadata':metadata,'source':'https://www.openstreetmap.org/way/'+str(w['id']),'confidence':'OSM 2026 plan/node topology; model profile is inferred'})
 for i,(a,b) in enumerate(zip(w['nodes'],w['nodes'][1:])):
  topology.append({'id':id+'/'+str(i),'from':str(a),'to':str(b),'points':[ps[i],ps[i+1]],'mode':'tram' if metro else 'rail','region':region,'sourceWayIds':[str(w['id'])]})

svr_points=[[round(xy[n][0],2),round(node_y[n]*32)/32,round(xy[n][1],2)] for n in path]
railway_stations=[]
for n in source_stations:
 if n['tags']['name']!='Kidderminster Town':continue
 sid=station_ids[n['tags']['name']];nd=station_nodes[sid];c=xy[n['id']]
 railway_stations.append({'id':sid,'name':n['tags']['name'],'s':round(dist.get(nd,0),2),'position':[round(c[0],2),round(node_y[nd]*32)/32,round(c[1],2)],'platformCount':int(n['tags'].get('platforms',1)),'length':220 if sid=='KDT' else 130,'style':'heritage','source':'https://www.svrwiki.com/Eardington' if sid=='EAR' else 'https://www.openstreetmap.org/node/'+str(n['id'])})
platforms=[]
for w in ways.values():
 if w.get('tags',{}).get('railway')!='platform':continue
 c=centre(w);candidates=[(np.linalg.norm(c-np.array(s['position'])[[0,2]]),s) for s in [*stations.values(),*railway_stations]];distance,station=min(candidates,key=lambda a:a[0])
 if distance>260 or station['id'] not in ['KID','KDT','SGB','THW','JEQ','BEW','NWH','ARL','HIG','CPH','HLD','EAR','BRG']:continue
 ps=coords(w);closed=w['nodes'][0]==w['nodes'][-1]
 # A source platform edge is expanded into an explicitly inferred narrow surface
 # on its outer side; polygon sources are kept intact.
 if not closed:
  best=min(aux,key=lambda a:min(np.linalg.norm(c-np.array(p)[[0,2]]) for p in a['points']));q=np.array(min(best['points'],key=lambda p:np.linalg.norm(c-np.array(p)[[0,2]])))[[0,2]]
  outward=c-q;outward/=np.linalg.norm(outward) or 1;ps=np.vstack([ps,ps[::-1]+outward*2.6])
 elif np.linalg.norm(ps[0]-ps[-1])<.01:ps=ps[:-1]
 mode='tram' if w['tags'].get('tram')=='yes' or w['tags'].get('network')=='West Midlands Metro' else 'rail'
 eligible=[a for a in aux if a['metadata']['mode']==mode and a['metadata']['renderStatic']]
 # Explicit source-track binding prevents the two Galton levels or NR/SVR from
 # competing for a nearest surface after loading.
 def score(a):
  pts=np.array(a['points'])[:,[0,2]];v=ps[-1]-ps[0] if not closed else ps[np.argmax(np.linalg.norm(ps-c,axis=1))]-c;v/=np.linalg.norm(v) or 1
  d=min(np.linalg.norm(p-c) for p in pts);u=pts[-1]-pts[0];u/=np.linalg.norm(u) or 1
  return d+100*(1-abs(float(np.dot(u,v))))
 binding=min(eligible,key=score) if eligible else None
 # High-level Galton platforms are bound to mainline, lower ones to RBS2.
 if station['id']=='SGB' and w['id'] in [1386987064,1386987068]:binding=None
 if station['id']=='KID' or station['id'] in ['JEQ','THW'] and mode=='rail':binding=None
 if station['id']=='KDT':binding=next(a for a in aux if a['id']=='osm/4016362')
 platforms.append({'id':'way/'+str(w['id']),'station':station['id'],'footprint':np.round(ps,2).tolist(),'y':station['position'][1]+(.3 if mode=='tram' else .915),'platformHeight':.3 if mode=='tram' else .915,'mode':mode,'binding':binding['id'] if binding else 'mainline','source':'https://www.openstreetmap.org/way/'+str(w['id']),'confidence':'source outline; inferred width only for open edge; explicit track/level ownership'})

landmarks=[]
for w in ways.values():
 t=w.get('tags',{});name=t.get('name','');family=None
 if 'Rotunda'==name or 'The Rotunda'==name:family='rotunda'
 if name=='Selfridges':family='selfridges'
 if w['id']==21818384:family='tyseley-depot'
 if w['id']==40007187:family='tyseley-works'
 if w['id']==40432994:family='gwr-frontage'
 if w['id'] in [63712265,426635180,793516864]:family='carriage-works'
 if w['id']==793516865:family='gwr-signal-box'
 if t.get('railway')=='turntable' and 10200<centre(w)[0]<11300:family='turntable'
 if not family:continue
 c=centre(w);ps=coords(w);_,vec=np.linalg.eigh(np.cov((ps-c).T));axis=vec[:,-1];side=np.array([axis[1],-axis[0]]);width=float(np.ptp((ps-c)@side));depth=float(np.ptp((ps-c)@axis));angle=math.atan2(axis[0],axis[1])
 level=main_y(c)
 if c[0]<-15000:level=svr_y(svr_nodes[svr_tree.query(c)[1]])
 landmarks.append({'id':'landmark/'+family+'/'+str(w['id']),'family':family,'name':'KIDDERMINSTER TOWN' if w['id']==40432994 else name,'position':[round(c[0],2),level,round(c[1],2)],'angle':angle,'width':round(width,2),'depth':round(depth,2),'height':float(t.get('height',8)),'footprint':np.round(ps,2).tolist(),'source':'https://www.openstreetmap.org/way/'+str(w['id']),'confidence':'mapped footprint; simplified diagnostic silhouette'})
if not any(l['family']=='selfridges' for l in landmarks):
 x,y=transform.transform(-1.89357,52.47750);landmarks.append({'id':'landmark/selfridges','family':'selfridges','position':[round(x-400000,2),116,round(280000-y,2)],'width':85,'depth':60,'height':35,'source':manifest['sources']['selfridges']['url'],'confidence':'approximate map position and architect silhouette; dimensions inferred'})
water=[]
for w in ways.values():
 t=w.get('tags',{})
 if t.get('waterway') not in ['river','canal']:continue
 ps=coords(w);width=24 if t.get('name')=='River Severn' else 8 if t.get('waterway')=='canal' else 9
 for i,(a,b) in enumerate(zip(ps,ps[1:])):
  if a[0]<-10000 and np.linalg.norm((a+b)/2-np.array(stations['KID']['position'])[[0,2]])>2400:continue
  v=b-a;norm=float(np.linalg.norm(v))
  if norm<.1:continue
  side=np.array([-v[1],v[0]])/norm*width/2
  level=30+max(0,min(1,(-float((a[1]+b[1])/2)-4000)/16000))*8 if t.get('name')=='River Severn' else (main_y((a+b)/2)-19 if a[0]<-15000 else float(low[low_tree.query((a+b)/2)[1],1])-2)
  water.append({'id':'water/'+str(w['id'])+'/'+str(i),'kind':'water','name':t.get('name'),'footprint':np.round([a+side,b+side,b-side,a-side],2).tolist(),'y':round(level*32)/32,'source':'https://www.openstreetmap.org/way/'+str(w['id']),'confidence':'source plan; approximate water datum'})
main_tunnels=[]
for id,ids in [('hockley-no1',[174697348,174697351]),('hockley-no2',[174697350,174697357])]:
 main_tunnels.append({'id':id,'points':[[round(xy[n][0],2),main_y(xy[n]),round(xy[n][1],2)] for way in ids for n in ways[way]['nodes']],'sourceWayIds':list(map(str,ids)),'sourceDate':'2026-11-01'})
access=[]
for e in json.loads((ROOT/'references/geography/galton-access-osm.json').read_text())['elements']:
 if e['type']!='way' or e.get('tags',{}).get('highway') not in ['corridor','steps','footway']:continue
 if e['tags'].get('highway')=='footway' and e['tags'].get('indoor')!='yes':continue
 layer=int(e['tags'].get('layer',0));base=stations['SGB']['position'][1]+6.3 if layer==2 else float(low[low_tree.query(centre(e))[1],1])+(6.3 if layer else .915)
 pts=coords(e);ys=np.full(len(pts),base)
 if e['tags'].get('highway')=='steps':
  top=stations['SGB']['position'][1]+6.3 if layer else float(low[low_tree.query(centre(e))[1],1])+6.3
  bottom=stations['SGB']['position'][1]+.915 if layer==2 else base
  ys=np.linspace(top,bottom,len(pts))
 access.append({'id':'way/'+str(e['id'])+'/0','kind':'steps' if e['tags'].get('highway')=='steps' else 'corridor','points':[[round(p[0],2),round(y*32)/32,round(p[1],2)] for p,y in zip(pts,ys)],'width':1.8,'elevationMode':'over','sourceTags':e['tags'],'source':'https://www.openstreetmap.org/way/'+str(e['id']),'confidence':'mapped indoor layers; inferred deck and stair elevations constrained by rail clearance'})
civils=[]
for id in [363476190,363476191,363476192]:
 w=ways[id];ps=coords(w);c=centre(w);_,vec=np.linalg.eigh(np.cov((ps-c).T));axis=vec[:,-1];side=np.array([axis[1],-axis[0]]);along=(ps-c)@axis;across=(ps-c)@side;line=[];widths=[]
 for z in np.linspace(min(along)+.05,max(along)-.05,max(3,math.ceil(np.ptp(along)/8))):
  hits=[]
  for i in range(len(ps)-1):
   a,b=along[i],along[i+1]
   if min(a,b)<=z<max(a,b):hits.append(across[i]+(across[i+1]-across[i])*(z-a)/(b-a))
  if len(hits)<2:continue
  width=max(hits)-min(hits);p=c+axis*z+side*(max(hits)+min(hits))/2;line.append([round(p[0],2),0,round(p[1],2)]);widths.append(width)
 civils.append({'id':'landmark/duddeston/'+str(id),'points':line,'height':8,'metadata':{'bridge':True,'masonry':True,'name':'Duddeston Viaduct','width':round(float(np.median(widths)),2),'unused':True},'source':'https://www.openstreetmap.org/way/'+str(id),'confidence':'mapped surviving footprint and 8 m source height; arch spacing and deck datum inferred; no operational track'})
out={'schema':1,'era':2026,'sourceDate':'2026-11-01','tracks':aux,'topology':topology,'stations':railway_stations,'platforms':platforms,'landmarks':landmarks,'water':water,'mainTunnels':main_tunnels,'access':access,'civils':civils,'kidderminsterHeritage':{'sceneryOnly':True,'extentMetres':2400,'points':[p for p,n in zip(svr_points,path) if dist[n]<=2400],'gradientBreaks':[(d,h) for d,h in zip(breaks,heights) if d<=2600],'profileSource':manifest['sources']['svr-gradient']['url'],'profileConfidence':'approximate digitised gradient break proportions; 58.625 m model datum; not surveyed heights'}}
(ROOT/'public/data/reconstruction.json').write_text(json.dumps(out,separators=(',',':'),default=lambda v:v.item())+'\n')
print('Reconstruction:',len(aux),'track ways,',len(topology),'connected edges,',len(platforms),'platforms, heritage scenery limited to 2400 m',len(railway_stations),'stations')
