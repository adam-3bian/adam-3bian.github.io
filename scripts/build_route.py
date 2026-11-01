#!/usr/bin/env python3
"""Deterministically recover the supplied geographic model into runtime assets.

This exports source/model reference geometry, not a surveyed operational railway.
All generated/inferred values carry a separate provenance/confidence declaration.
Run from any directory: python scripts/build_route.py
Requires numpy, scipy and Pillow; original references are read only.
"""
from __future__ import annotations

import hashlib
import json
import math
from collections import Counter, defaultdict
from pathlib import Path
import re
import xml.etree.ElementTree as ET

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d, percentile_filter
from scipy.spatial import cKDTree

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT / "references" / "atlas"
OUT = ROOT / "public" / "data"
SVG = "{http://www.w3.org/2000/svg}"
NUM = re.compile(r"[-+]?(?:\d*\.)?\d+(?:[eE][-+]?\d+)?")
ORIGIN = [400000, 280000]
TILE_SIZE = 1000
STATION_INFO = [
    ("KID", "Kidderminster", 2, 160, "modern-heritage"),
    ("BKD", "Blakedown", 2, 130, "village"),
    ("HAG", "Hagley", 2, 150, "heritage"),
    ("SBJ", "Stourbridge Junction", 3, 155, "junction"),
    ("LYE", "Lye", 2, 130, "industrial"),
    ("CRA", "Cradley Heath", 2, 145, "interchange"),
    ("OHL", "Old Hill", 2, 125, "cutting"),
    ("ROW", "Rowley Regis", 2, 184, "suburban"),
    ("LGG", "Langley Green", 2, 140, "industrial"),
    ("SGB", "Smethwick Galton Bridge", 4, 150, "two-level"),
    ("THW", "The Hawthorns", 2, 160, "metro"),
    ("JEQ", "Jewellery Quarter", 2, 150, "urban-cutting"),
    ("BSW", "Birmingham Snow Hill", 3, 200, "covered"),
    ("BMO", "Birmingham Moor Street", 4, 207, "heritage-terminal"),
    ("BBS", "Bordesley", 2, 120, "viaduct"),
    ("SMA", "Small Heath", 2, 150, "industrial"),
    ("TYS", "Tyseley", 4, 150, "depot"),
    ("ACG", "Acocks Green", 2, 150, "suburban"),
    ("OLT", "Olton", 2, 150, "suburban"),
    ("SOL", "Solihull", 2, 180, "urban"),
    ("WMR", "Widney Manor", 2, 150, "green"),
    ("DDG", "Dorridge", 3, 180, "heritage"),
]


def rounded(values, places=2):
    return np.round(values, places).tolist()


def title(element):
    return element.findtext(SVG + "title", "")


def paths(d):
    """The exported source uses absolute M/L/Z. Keep polygon rings separate."""
    out = []
    for sub in re.split(r"[Mm]", d):
        if not sub.strip():
            continue
        nums = [float(x) for x in NUM.findall(sub)]
        if len(nums) % 2 or len(nums) < 4:
            continue
        p = np.asarray(nums, dtype=float).reshape((-1, 2))
        keep = np.r_[True, np.linalg.norm(np.diff(p, axis=0), axis=1) > 0.005]
        p = p[keep]
        if len(p) > 1:
            out.append(p)
    return out


def join_subpaths(parts):
    out = []
    for p in parts:
        if out and np.linalg.norm(out[-1][-1] - p[0]) < 0.08:
            out[-1] = np.vstack([out[-1], p[1:]])
        else:
            out.append(p)
    return out


def resample(p, step=10.0):
    if len(p) < 2:
        return p
    s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(p, axis=0), axis=1))]
    if s[-1] < 0.02:
        return p[:1]
    target = np.arange(0, s[-1], step)
    # A source length almost divisible by step must not emit two endpoint
    # samples that collapse to the same centimetre after serialization.
    if len(target)>1 and s[-1]-target[-1]<min(step*.25,1.0):
        target[-1]=s[-1]
    else:
        target=np.r_[target,s[-1]]
    return np.column_stack([np.interp(target, s, p[:, i]) for i in range(2)])


def simplify(p, min_step=8.0):
    if len(p) <= 2:
        return p
    ix = [0]
    for i in range(1, len(p) - 1):
        if np.linalg.norm(p[i] - p[ix[-1]]) >= min_step:
            ix.append(i)
    if ix[-1] != len(p) - 1:
        ix.append(len(p) - 1)
    return p[ix]


def json_write(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary=path.with_suffix(path.suffix+".tmp")
    temporary.write_text(json.dumps(obj, separators=(",", ":"), ensure_ascii=False) + "\n")
    temporary.replace(path)


class Ground:
    def __init__(self):
        self.meta = json.loads((REF / "heightmaps/full-route-height.json").read_text())
        self.raw = np.asarray(Image.open(REF / "heightmaps/full-route-height-16bit.png"), dtype=np.uint16)
        self.origin = [self.meta["affine"][2] - ORIGIN[0] + 5, ORIGIN[1] - self.meta["affine"][5] + 5]

    def sample(self, p):
        p = np.asarray(p)
        original = p.ndim == 1
        p = np.atleast_2d(p)
        xx = (p[:, 0] - self.origin[0]) / 10
        zz = (p[:, 1] - self.origin[1]) / 10
        ix = np.clip(np.floor(xx).astype(int), 0, self.raw.shape[1] - 2)
        iz = np.clip(np.floor(zz).astype(int), 0, self.raw.shape[0] - 2)
        fx = np.clip(xx - ix, 0, 1)
        fz = np.clip(zz - iz, 0, 1)
        vals = np.column_stack([self.raw[iz, ix], self.raw[iz, ix + 1], self.raw[iz + 1, ix], self.raw[iz + 1, ix + 1]]).astype(float)
        # Full-route source has no holes; keep explicit handling for future inputs.
        weights = np.column_stack([(1-fx)*(1-fz), fx*(1-fz), (1-fx)*fz, fx*fz])
        weights[vals == 0] = 0
        total = weights.sum(axis=1)
        heights = 26 + (vals - 1) * .01
        y = np.divide((heights * weights).sum(axis=1), total, out=np.full(len(p), np.nan), where=total > 0)
        if np.any(~np.isfinite(y)):
            raise ValueError("Unresolved terrain nodata; refusing to generate zero-elevation objects")
        return float(y[0]) if original else y

    def write(self):
        # First sample is the original pixel centre. Downsampling does not invent a
        # 1 m precision claim. Runtime meshes conform independently to formations.
        a = self.raw[::2, ::2].astype("<u2")
        (OUT / "terrain.bin").write_bytes(a.tobytes())
        return {"url":"data/terrain.bin", "width":int(a.shape[1]), "height":int(a.shape[0]), "origin":self.origin,
                "step":20, "offset":26, "scale":.01, "nodata":0, "encoding":"uint16-le-row-major",
                "source":"references/atlas/heightmaps/full-route-height-16bit.png", "meaning":"bare-earth terrain, 20 m runtime samples; not railhead survey"}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    overview = ET.parse(REF / "maps/dorridge-kidderminster-overview.svg").getroot()
    groups = {g.get("data-layer"):g for g in overview.iter(SVG + "g") if g.get("data-layer")}
    source_route = next(x for x in groups["rail"] if x.get("stroke") == "#16816f")
    xy = paths(source_route.get("d"))[0][::-1]
    source_length = np.linalg.norm(np.diff(xy, axis=0), axis=1).sum()
    xy = resample(xy, 8)
    s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(xy, axis=0), axis=1))]
    tree = cKDTree(xy)
    ground = Ground()
    y_ground = ground.sample(xy)
    rail_y = gaussian_filter1d(percentile_filter(y_ground, percentile=60, size=11, mode="nearest"), sigma=3) + .28

    def project(p):
        dist, k = tree.query(p)
        return float(s[int(k)]), int(k), float(dist)

    stations = []
    station_lookup = {title(c):[float(c.get("cx")),float(c.get("cy"))] for c in groups["stations"].findall(SVG + "circle")}
    for sid, name, count, length, style in STATION_INFO:
        pin = station_lookup[name]
        chain, i, distance = project(pin)
        stations.append({"id":sid,"name":name,"s":round(chain,2),"position":[round(xy[i,0],2),round(rail_y[i],2),round(xy[i,1],2)],
                         "sourcePosition":pin,"referenceOffset":round(distance,2),"length":length,"platformCount":count,"style":style,
                         "source":"overview SVG station pin + selected driving curve","confidence":"mapped position; layout/length baseline requires station-plan verification"})
    station_by_id = {a["id"]:a for a in stations}
    if any(b["s"] <= a["s"] for a,b in zip(stations,stations[1:])):
        raise ValueError("Source route does not visit the required stations in order")

    # Preserve the supplied estimated Snow Hill rail profile; the chart is a
    # published model derivative and its absolute height/grade break is unverified.
    profile = ET.parse(REF / "maps/snow-hill-tunnel-profile.svg").getroot()
    curve = next(x for x in profile.iter(SVG + "path") if x.get("stroke") == "#187e73")
    chart = paths(curve.get("d"))[0]
    old_s = 15800 + (chart[:,0] - 84.82) * 100 / 110.18
    profile_s = source_length - old_s[::-1]
    profile_y = (106 + (435 - chart[:,1]) * 34 / 360)[::-1]
    mask = (s >= profile_s[0]) & (s <= profile_s[-1])
    rail_y[mask] = np.interp(s[mask], profile_s, profile_y)
    for edge, side in [(profile_s[0], -1),(profile_s[-1],1)]:
        ix = (s>=edge-450)&(s<edge) if side<0 else (s>edge)&(s<=edge+450)
        boundary = float(np.interp(edge, profile_s, profile_y))
        natural_boundary = float(np.interp(edge, s, gaussian_filter1d(y_ground,sigma=4)+.28))
        rail_y[ix] += (boundary-natural_boundary) * (1 - np.minimum(np.abs(s[ix]-edge)/450,1))

    tunnel_specs = [
        ("old-hill-tunnel", "Old Hill Tunnel", station_by_id["OHL"]["s"]+650, station_by_id["OHL"]["s"]+650+819.3, "portal positions inferred; approx. 896 yd historical length, not current portal survey"),
        ("hockley-no2", "Hockley No. 2", station_by_id["JEQ"]["s"]+65, station_by_id["JEQ"]["s"]+215, "inferred portal positions and approx.150m span; verify against detailed infrastructure records"),
        ("hockley-no1", "Hockley No. 1", station_by_id["JEQ"]["s"]+345, station_by_id["JEQ"]["s"]+470, "inferred portal positions and approx.125m span; verify against detailed infrastructure records"),
        ("snow-hill-tunnel", "Snow Hill Tunnel", source_length-16589.23, source_length-16005.62, "supplied source/model portals; estimated rail profile, not independent survey"),
    ]
    tunnels=[]
    for tid,name,a,b,confidence in tunnel_specs:
        if b<=a: raise ValueError("Invalid tunnel interval")
        tunnels.append({"id":tid,"name":name,"type":"tunnel","start":round(a,2),"end":round(b,2),"s":round((a+b)/2,2),"width":9.0,"clearHeight":5.8,"confidence":confidence,"source":"atlas overview/profile and reference appearance"})
    # Explicit 3% profile envelope: removes raster spikes without flattening terrain.
    # It is an engineering inference and is deliberately not described as survey.
    for _ in range(4):
        for indices in [range(1,len(rail_y)), range(len(rail_y)-2,-1,-1)]:
            for i in indices:
                j=i-1 if isinstance(indices,range) and indices.step>0 else i+1
                delta=.03*abs(s[i]-s[j]); rail_y[i]=np.clip(rail_y[i],rail_y[j]-delta,rail_y[j]+delta)
    rail_y=gaussian_filter1d(rail_y,sigma=1)
    # Tunnel hard constraints follow the broad ground-profile inference. Applying
    # a two-sided smoothing/clamp afterwards would reintroduce a terrain-following
    # crest inside a bore. A lowering-only Lipschitz envelope preserves straight
    # bore segments and removes overly steep approaches without lifting a bore.
    oldhill=tunnels[0]
    a,b=oldhill["start"],oldhill["end"]
    ia,ib=np.searchsorted(s,[a,b]);anchor_s=[station_by_id["OHL"]["s"],station_by_id["ROW"]["s"]]
    anchor_y=np.interp(anchor_s,s,rail_y)
    line=np.interp(s[ia:ib+1],anchor_s,anchor_y)
    shift=max(0,float(np.max(line+6.35-y_ground[ia:ib+1])))
    rail_y[ia:ib+1]=line-shift
    # The neighbouring Hockley covered sections share a coherent inferred cutting
    # floor; source DTM streets/roofs must not become the running surface.
    hockley_masks=[(s>=t["start"])&(s<=t["end"]) for t in tunnels[1:3]]
    hockley_ground=y_ground[np.logical_or.reduce(hockley_masks)]
    hockley_floor=min(float(np.min(hockley_ground)-6.35),float(np.interp(station_by_id["JEQ"]["s"],s,rail_y)))
    corridor=(s>=tunnels[1]["start"])&(s<=tunnels[2]["end"])
    rail_y[corridor]=hockley_floor
    for i in range(1,len(rail_y)):
        rail_y[i]=min(rail_y[i],rail_y[i-1]+.03*(s[i]-s[i-1]))
    for i in range(len(rail_y)-2,-1,-1):
        rail_y[i]=min(rail_y[i],rail_y[i+1]+.03*(s[i+1]-s[i]))
    for t in tunnels:
        interior=(s>=t["start"]+24)&(s<=t["end"]-24)
        t["minimumModelCover"]=round(float(np.min(y_ground[interior]-rail_y[interior]-t["clearHeight"])),2)
        t["profileRule"]="supplied estimated multi-gradient profile" if t["id"]=="snow-hill-tunnel" else "straight inferred bore with terrain-cover constraint"
    xyz=np.column_stack([xy[:,0],rail_y,xy[:,1]])
    for st in stations:
        st["position"][1]=round(float(np.interp(st["s"],s,rail_y)),2)
    def route_height(p):
        _,k=tree.query(np.asarray(p));return rail_y[k]
    def lifted(p, kind="ground"):
        p=np.asarray(p)
        yy=ground.sample(p)
        if kind=="rail":
            dist,_=tree.query(p)
            yy=np.where(dist<35, route_height(p), gaussian_filter1d(yy,sigma=2)+.25)
        elif kind=="road":
            raw=yy+.12
            yy=gaussian_filter1d(raw,sigma=2) if len(p)>3 else raw
            # Endpoints are shared by road fragments. Pinning them to the same
            # canonical ground sample prevents independent smoothing from opening
            # a gap at the source-way junction. Structural overrides remain typed.
            yy[0],yy[-1]=raw[0],raw[-1]
        return rounded(np.column_stack([p[:,0],yy,p[:,1]]))

    tiles=defaultdict(lambda:{"buildings":[],"roads":[],"land":[],"platforms":[]})
    def tile_for(p):
        return f"{math.floor(p[0]/TILE_SIZE)}_{math.floor(p[1]/TILE_SIZE)}"
    def near(p, distance=700):
        return float(tree.query(np.mean(p,axis=0))[0])<=distance
    for el in groups["buildings"]:
        shapes=paths(el.get("d",""))
        if not shapes:continue
        p=shapes[0]
        if not near(p):continue
        name=title(el);ident=re.search(r"(?:way|relation)/\d+",name)
        height=re.search(r"height ([\d.]+) m",name)
        c=np.mean(p,axis=0); ys=ground.sample(p)
        h=float(height.group(1)) if height else 7.8
        area=abs(np.sum(p[:,0]*np.roll(p[:,1],1)-p[:,1]*np.roll(p[:,0],1)))/2
        style="industrial" if area>500 else "house"
        if any(k in name.lower() for k in ["church","chapel"]):style="church"
        if any(k in name.lower() for k in ["tower","apartments","hotel"]):style="urban"
        tiles[tile_for(c)]["buildings"].append({"id":ident.group(0) if ident else f"building-{len(tiles)}","footprint":rounded(p),"y":round(float(np.max(ys)),2),"height":h,"style":style,"name":name.split(" · ")[0] if " · " in name else "","confidence":"mapped footprint; height/style estimate"})
    for el in groups["roads"]:
        name=title(el);ident=re.search(r"way/\d+",name);roadclass=re.search(r" · ([a-z_]+);",name)
        for pi,p in enumerate(join_subpaths(paths(el.get("d","")))):
            if not near(p,850):continue
            p=simplify(p,10)
            center=p[len(p)//2]
            road={"id":(ident.group(0) if ident else "road")+f"/{pi}","points":lifted(p,"road"),"width":float(el.get("stroke-width",5.5)),"kind":roadclass.group(1) if roadclass else "unclassified","name":name.split(" · ")[0] if not name.startswith("way/") else "","confidence":"mapped source geometry; ground-based inferred profile"}
            tiles[tile_for(center)]["roads"].append(road)
    for el in groups["land"]:
        ps=paths(el.get("d",""))
        if not ps or not near(ps[0],900):continue
        p=ps[0];c=np.mean(p,axis=0);name=title(el);kind=name.rsplit(" · ",1)[-1]
        tiles[tile_for(c)]["land"].append({"id":name.split(" · ")[0],"kind":kind,"footprint":rounded(simplify(p,12)),"y":round(ground.sample(c),2)})
    platforms=[]
    for el in groups["platforms"]:
        ps=paths(el.get("d",""))
        if not ps:continue
        p=ps[0];c=np.mean(p,axis=0);chain,k,distance=project(c)
        st=min(stations,key=lambda a:abs(a["s"]-chain))
        item={"id":title(el).split(" · ")[0],"footprint":rounded(p),"y":round(rail_y[k]+.915,2),"station":st["id"],"s":round(chain,2),"confidence":"source platform polygon; generated rail-relative elevation"}
        platforms.append(item);tiles[tile_for(c)]["platforms"].append(item)

    tracks=[]
    for el in groups["rail"]:
        if el.get("stroke")=="#16816f":continue
        for i,p in enumerate(paths(el.get("d",""))):
            if not near(p,1000):continue
            name=title(el);ident=name.split(" · ")[0]
            tracks.append({"id":ident+f"/{len(tracks)}","sourceWay":ident,"points":lifted(simplify(p,6),"rail"),"kind":"mapped-adjacent","confidence":"mapped geometry; inferred elevation and operational use"})

    structures=[]
    civils=ET.parse(REF / "maps/dorridge-snow-hill-civils.svg").getroot()
    for g in civils.findall(SVG+"g"):
        label=title(g)
        if not label or "source ways" not in label:continue
        el=g.find(SVG+"path")
        if el is None:continue
        polys=paths(el.get("d",""))
        if not polys:continue
        p=polys[0];center=np.mean(p,axis=0);chain,k,dist=project(center)
        if dist>750:continue
        ident=label.split(" · ")[0];kind=ident.split("/")[0]
        kind={"rail-bridge":"railBridge","road_bridge":"roadBridge","footbridge":"footbridge"}.get(kind,kind)
        centered=p-center
        _,_,axes=np.linalg.svd(centered,full_matrices=False);axis=axes[0]
        along=centered@axis;across=centered@axes[1]
        length=float(np.ptp(along));width=max(float(np.ptp(across)),1.8)
        deck=ground.sample(center)
        if dist<60:
            deck=float(rail_y[k])+(6.4 if kind in ["roadBridge","footbridge"] else -.5)
        supports=[]
        for c in g.findall(SVG+"circle"):
            a=np.array([float(c.get("cx")),float(c.get("cy"))]);supports.append([round(a[0],2),round(ground.sample(a),2),round(a[1],2)])
        way_match=re.search(r"source ways \[([^]]+)\]",label)
        source_ways=[v.strip() for v in way_match.group(1).split(",")] if way_match else []
        under_routes=[]
        for under in g.findall(SVG+"path")[1:]:
            under_title=title(under);match=re.search(r"/under/(\d+)",under_title);up=paths(under.get("d",""))
            if match and up:
                lower=up[0];floor=deck-5.9
                under_routes.append({"id":"way/"+match.group(1),"points":rounded(np.column_stack([lower[:,0],np.full(len(lower),floor),lower[:,1]])),"width":float(under.get("stroke-width",5.5)),"confidence":"source lower-opening geometry; clearance-derived level inferred"})
        structures.append({"id":ident,"type":kind,"position":[round(center[0],2),round(deck,2),round(center[1],2)],"points":rounded(np.column_stack([np.vstack([center+axis*along.min(),center+axis*along.max()])[:,0],np.full(2,deck),np.vstack([center+axis*along.min(),center+axis*along.max()])[:,1]])),"footprint":rounded(p),"length":round(length,2),"width":round(width,2),"angle":round(math.atan2(axis[0],axis[1]),6),"sourceWayIds":source_ways,"underRoutes":under_routes,"s":round(chain,2),"distanceToRoute":round(dist,2),"supports":supports,"source":label,"confidence":"source model footprint; engineered dimensions/elevations inferred"})
    structures.extend(tunnels)
    for t in tunnels:
        k=int(np.searchsorted(s,t["s"]));t["position"]=rounded(xyz[k]);t["points"]=[rounded(xyz[int(np.searchsorted(s,t["start"]))]),rounded(xyz[min(int(np.searchsorted(s,t["end"])),len(s)-1)])]
    relations=defaultdict(list)
    for structure in structures:
        if structure["type"] in ["roadBridge","footbridge"]:
            for wid in structure.get("sourceWayIds",[]):relations["way/"+wid].append({"structure":structure["id"],"relation":"on","y":structure["position"][1]})
        for under in structure.get("underRoutes",[]):relations[under["id"]].append({"structure":structure["id"],"relation":"under","y":under["points"][0][1]})
    for contents in tiles.values():
        for road in contents["roads"]:
            source_id="/".join(road["id"].split("/")[:2])
            if source_id in relations:road["gradeRelations"]=relations[source_id]

    # Retain node identities from the exported source graph. Do not connect every
    # plan intersection; IDs, not spatial coincidence, establish graph topology.
    rail_ref=ET.parse(REF / "maps/dorridge-snow-hill-rails.svg").getroot()
    network_group=next(g for g in rail_ref.iter(SVG+"g") if g.get("data-layer")=="network")
    edges=[];nodes={}
    for el in network_group:
        label=title(el)
        if el.tag==SVG+"path":
            match=re.search(r"graph (\d+) → (\d+)",label)
            ps=paths(el.get("d",""))
            if not match or not ps:continue
            p=ps[0];a,b=match.groups()
            for nid,point in [(a,p[0]),(b,p[-1])]:nodes.setdefault(nid,{"id":nid,"position":lifted(np.array([point]),"rail")[0],"edges":[]})
            ways=re.findall(r"source ways \[([^]]+)\]",label)
            edge={"id":label.split(" · ")[0],"from":a,"to":b,"points":lifted(simplify(p,6),"rail"),"sourceWayIds":[v.strip() for blob in ways for v in blob.split(",")],"confidence":"source node connectivity; direction/aspects/interlocking not supplied"}
            edges.append(edge);nodes[a]["edges"].append(edge["id"]);nodes[b]["edges"].append(edge["id"])
    turnouts=[]
    for node in nodes.values():
        if len(node["edges"])<3:continue
        pos=node["position"];chain,k,distance=project([pos[0],pos[2]])
        if distance>18:continue
        turnouts.append({"id":"source-point-"+node["id"],"position":pos,"s":round(chain,2),"sourceNode":node["id"],"edges":node["edges"],"confidence":"source graph branch node; switch geometry/state authoring required"})

    # Crossing locations visible in footage/mapping are authoring anchors only.
    # Keep them distinct from the operational records the simulator constructs.
    crossing_anchors=[("blakedown-crossing","Mill Lane, Blakedown","BKD",-70), ("cradley-crossing","Cradley Heath crossing","CRA",85), ("langley-crossing","Langley Green crossing","LGG",80), ("bentley-heath-crossing","Bentley Heath crossing","DDG",-650)]
    crossings=[]
    for cid,name,sid,offset in crossing_anchors:
        chain=station_by_id[sid]["s"]+offset;k=int(np.searchsorted(s,chain))
        crossings.append({"id":cid,"name":name,"s":round(chain,2),"position":rounded(xyz[k]),"confidence":"reference-correlated authoring anchor; exact road/crossing type/detection unverified"})

    disambiguate_building_parts(tiles)
    disambiguate_water_parts(tiles)
    tile_index=[]
    for ident,contents in sorted(tiles.items()):
        a,b=[int(v) for v in ident.split("_")];bounds=[a*1000,b*1000,(a+1)*1000,(b+1)*1000]
        json_write(OUT/"tiles"/(ident+".json"),{"id":ident,"bounds":bounds,**contents})
        tile_index.append({"id":ident,"url":"data/tiles/"+ident+".json","bounds":bounds,"counts":{k:len(v) for k,v in contents.items()}})
    terrain=ground.write()
    chainages=rounded(s)
    if any(b<=a for a,b in zip(chainages,chainages[1:])):raise ValueError("Serialized route chainages must increase strictly")
    route={"version":1,"origin":ORIGIN,"crs":"EPSG:27700","verticalDatum":"ODN metres","coordinateConvention":"X east; Y up; Z south","length":round(float(s[-1]),2),"points":rounded(xyz),"chainages":chainages,"stations":stations,"tracks":tracks,"platforms":platforms,"structures":structures,"tunnels":tunnels,"turnouts":turnouts,"crossings":crossings,"network":{"nodes":list(nodes.values()),"edges":edges,"scope":"supplied detailed Snow Hill–Dorridge source graph"},"tiles":tile_index,"terrain":terrain,"provenance":{"horizontalRoute":"references/atlas/maps/dorridge-kidderminster-overview.svg green selected driving-route curve; resampled at 8 m","railHeights":"inferred from supplied EA terrain with 3% grade envelope; Snow Hill uses the supplied estimated profile; other tunnel portal intervals inferred","signalling":"Operational signal/aspect/interlocking survey absent; runtime simulator records must be labelled inferred","attribution":["© OpenStreetMap contributors, ODbL","© Environment Agency copyright and/or database right 2022, OGL v3.0"],"rawSourceDataPresent":False}}
    json_write(OUT/"route.json",route)
    counts={"routeMetres":route["length"],"routeVertices":len(xyz),"stations":len(stations),"tracks":len(tracks),"platforms":len(platforms),"structures":len(structures),"sourceGraphNodes":len(nodes),"sourceGraphEdges":len(edges),"sourcePointNodesNearRoute":len(turnouts),"tiles":len(tile_index),**{k:sum(len(v[k]) for v in tiles.values()) for k in ["buildings","roads","land"]}}
    validation={"counts":counts,"stationOrder":"pass","coordinateValuesFinite":bool(np.isfinite(xyz).all()),"maximumModelGrade":round(float(np.max(abs(np.diff(rail_y)/np.diff(s)))),5),"sourceRouteSha256":hashlib.sha256((REF/"maps/dorridge-kidderminster-overview.svg").read_bytes()).hexdigest(),"status":"geographic extraction verified; operational and visual acceptance pending","blockers":["Date-specific operational signal/block/interlocking records absent","Old Hill/Hockley portal positions and exact rail elevations inferred","Atlas source geometry is model-derived, not independent survey","Local human recognition and RTX-class performance tests not performed"]}
    json_write(OUT/"data-validation.json",validation)
    print(json.dumps(counts,indent=2))
    for st in stations:print(st["id"],st["name"],st["s"],st["position"][1])


def build_adjacent_services():
    """Build bounded independent paths from cached OSM node-identity geometry.

    adjacent-source.json retains the exact source ways/nodes and response hashes
    from four successful, bounded OpenStreetMap API map requests. No network is
    required to regenerate these services.
    """
    import heapq
    sources=json.loads((OUT/"adjacent-source.json").read_text())
    sets={x["id"]:x for x in sources["source_sets"]}
    route=json.loads((OUT/"route.json").read_text())
    stations={x["id"]:x for x in route["stations"]}
    ground=Ground()

    def geometry(source,way):
        return np.array([source["nodes"][n]["position"] for n in way["nodes"] if n in source["nodes"]],float)

    def graph_path(source,start_point,end_point):
        nodes={k:np.array(v["position"]) for k,v in source["nodes"].items()};graph=defaultdict(list)
        for way in source["ways"]:
            for a,b in zip(way["nodes"],way["nodes"][1:]):
                if a not in nodes or b not in nodes:continue
                d=float(np.linalg.norm(nodes[b]-nodes[a]));graph[a].append((b,d,way["id"]));graph[b].append((a,d,way["id"]))
        start=min(graph,key=lambda x:np.linalg.norm(nodes[x]-start_point));end=min(graph,key=lambda x:np.linalg.norm(nodes[x]-end_point))
        ds={start:0.0};prev={};queue=[(0.0,start)]
        while queue:
            cost,node=heapq.heappop(queue)
            if node==end:break
            if cost>ds[node]:continue
            for nxt,w,wid in graph[node]:
                v=cost+w
                if v<ds.get(nxt,float("inf")):ds[nxt]=v;prev[nxt]=(node,wid);heapq.heappush(queue,(v,nxt))
        if end not in ds:raise ValueError("Required adjacent source route is disconnected")
        ids=[end];ways=[]
        while ids[-1]!=start:
            before,wid=prev[ids[-1]];ids.append(before);ways.append(wid)
        ids.reverse();ways.reverse()
        return np.array([nodes[x] for x in ids]),list(dict.fromkeys(ways)),ids

    def profile(points,kind,center=None):
        p=resample(points,8)
        ss=np.r_[0,np.cumsum(np.linalg.norm(np.diff(p,axis=0),axis=1))]
        yy=gaussian_filter1d(ground.sample(p)+.26,sigma=3)
        if kind=="shuttle":
            yy=np.interp(ss,[ss[0],ss[-1]],[stations["SBJ"]["position"][1],yy[-1]])
        if kind=="emu":
            c=np.array(stations["SGB"]["position"])[[0,2]];i=int(np.argmin(np.linalg.norm(p-c,axis=1)));mid=ss[i]
            target=stations["SGB"]["position"][1]-7.0
            weight=np.clip((450-np.abs(ss-mid))/320,0,1)
            yy=np.minimum(yy,yy*(1-weight)+target*weight)
        # Only lower the inferred ground profile: avoid suddenly raising a path
        # through a bridge/underpass to satisfy a neighbouring high raster cell.
        for i in range(1,len(yy)):yy[i]=min(yy[i],yy[i-1]+.03*(ss[i]-ss[i-1]))
        for i in range(len(yy)-2,-1,-1):yy[i]=min(yy[i],yy[i+1]+.03*(ss[i+1]-ss[i]))
        return np.column_stack([p[:,0],yy,p[:,1]])

    services=[]
    source=sets["stourbridge"]
    raw,way_ids,node_ids=graph_path(source,np.array(stations["SBJ"]["position"])[[0,2]],np.array([-9544,-4195]))
    p=profile(raw,"shuttle")
    services.append({"id":"stourbridge-town-shuttle","kind":"shuttle","cars":1,"points":rounded(p),"cycleSeconds":600,"overhead":False,"source":"OpenStreetMap source-node path: Stourbridge Town Branch Line, ways "+",".join(way_ids),"confidence":"mapped horizontal branch; DTM/endpoint-inferred vertical profile; representative non-WTT cycle","metadata":{"stock":"Class139","start":"Stourbridge Junction branch bay","end":"Stourbridge Town","sourceSet":"stourbridge","sourceWayIds":way_ids,"sourceNodeIds":node_ids,"independentNetwork":True,"requiresOwnTrack":True,"bidirectionalShuttle":True,"speedMps":9,"dwellSeconds":30}})

    source=sets["metro"]
    center=np.array(stations["THW"]["position"])[[0,2]]
    for index,way in enumerate(source["ways"]):
        raw=geometry(source,way);p=resample(raw,8);ss=np.r_[0,np.cumsum(np.linalg.norm(np.diff(p,axis=0),axis=1))]
        i=int(np.argmin(np.linalg.norm(p-center,axis=1)));mask=np.abs(ss-ss[i])<=850
        p=profile(p[mask],"tram")
        services.append({"id":"hawthorns-metro-"+str(index+1),"kind":"tram","cars":3,"points":rounded(p),"cycleSeconds":220+index*50,"overhead":True,"source":"OpenStreetMap railway=tram, way/"+way["id"],"confidence":"mapped tram alignment/electrification; inferred vertical profile and representative cycle","metadata":{"stock":"Metro","sourceSet":"metro","sourceWayIds":[way["id"]],"tags":way["tags"],"independentNetwork":True,"requiresOwnTrack":True,"speedMps":12}})

    source=sets["galton"]
    # Select one actual electrified Stour Valley through way. The source-node
    # shape crosses the selected route instead of running parallel beside it.
    way=next(x for x in source["ways"] if x["id"]=="157462102")
    subset={**source,"ways":[w for w in source["ways"] if "Rugby" in w["tags"].get("name","")]}
    graph=defaultdict(set)
    for w in subset["ways"]:
        for a,b in zip(w["nodes"],w["nodes"][1:]):graph[a].add(b);graph[b].add(a)
    component={way["nodes"][0]};todo=list(component)
    while todo:
        for node in graph[todo.pop()]:
            if node not in component:component.add(node);todo.append(node)
    ends=sorted((n for n in component if len(graph[n])==1),key=int)
    if len(ends)!=2:raise ValueError("Ambiguous crossing-line source component; refuse invented connection")
    raw,way_ids,node_ids=graph_path(subset,np.array(source["nodes"][ends[0]]["position"]),np.array(source["nodes"][ends[1]]["position"]))
    raw=resample(raw,8);ss=np.r_[0,np.cumsum(np.linalg.norm(np.diff(raw,axis=0),axis=1))];c=np.array(stations["SGB"]["position"])[[0,2]];i=int(np.argmin(np.linalg.norm(raw-c,axis=1)));raw=raw[np.abs(ss-ss[i])<=950];p=profile(raw,"emu")
    services.append({"id":"galton-crossing-emu","kind":"emu","cars":4,"points":rounded(p),"cycleSeconds":260,"overhead":True,"source":"OpenStreetMap electrified Rugby–Birmingham–Stafford connected ways "+",".join(way_ids),"confidence":"mapped distinct crossing alignment/electrification; lower rail level inferred 7m below Snow Hill line","metadata":{"stock":"CrossingEMU","sourceSet":"galton","sourceWayIds":way_ids,"sourceNodeIds":node_ids,"tags":way["tags"],"independentNetwork":True,"requiresOwnTrack":True,"crossingUnderMain":True,"mainlineS":stations["SGB"]["s"],"mainlineClearanceMetres":7,"speedMps":20}})

    source=sets["heritage"]
    way=next(x for x in source["ways"] if x["id"]=="4016362")
    p=resample(geometry(source,way),8);c=np.array(stations["KID"]["position"])[[0,2]];ss=np.r_[0,np.cumsum(np.linalg.norm(np.diff(p,axis=0),axis=1))];i=int(np.argmin(np.linalg.norm(p-c,axis=1)));p=p[np.abs(ss-ss[i])<=180];p=profile(p,"heritage")
    services.append({"id":"kidderminster-heritage-stock","kind":"heritage","cars":3,"points":rounded(p),"cycleSeconds":0,"overhead":False,"source":"OpenStreetMap preserved Severn Valley Railway way/4016362","confidence":"mapped preserved railway/operator; static representative heritage coaches, no scheduled movement asserted","metadata":{"stock":"Heritage","static":True,"sourceSet":"heritage","sourceWayIds":[way["id"]],"tags":way["tags"],"independentNetwork":True,"requiresOwnTrack":True,"speedMps":0}})

    for service in services:
        p=np.array(service["points"]);service["metadata"]["pathLengthMetres"]=round(float(np.linalg.norm(np.diff(p,axis=0),axis=1).sum()),2)
        assert len(p)>3 and np.isfinite(p).all()
    document={"version":1,"crs":"EPSG:27700","origin":ORIGIN,"coordinateConvention":"X east,Y ODN up,Z south","services":services,"sources":[{"id":x["id"],"url":x["url"],"retrieved":x["retrieved"],"response_sha256":x["response_sha256"]} for x in sources["source_sets"]],"attribution":"© OpenStreetMap contributors, ODbL","scope":"Independent adjacent-network appearance/representative activity, no mainline route authorities or timetable claims","gaps":["Precise rail elevations, structural clearances and current service diagrams not independently surveyed","The Galton lower-level height is a clearance-based inference and needs compatible terrain/bridge support geometry","The source API snapshot is a fresh retrieval; its date-specific 2026 infrastructure equivalence remains unverified"]}
    json_write(OUT/"adjacent-services.json",document)
    print(json.dumps([{k:s[k] for k in ["id","kind","cars"]}|{"points":len(s["points"]),"length":s["metadata"]["pathLengthMetres"]} for s in services],indent=2))


def build_opposing_track():
    """Recover a continuous left-side counterpart from mapped rail geometry.

    Source node/way continuity and platform exclusion are enforced for candidates.
    Missing source intervals are interpolated explicitly and never presented as
    independently mapped track. A 3.3m swept-clearance correction is separately
    recorded rather than silently moving the supplied selected driving curve.
    """
    path=OUT/'route.json';route=json.loads(path.read_text());base=np.asarray(route['points']);xz=base[:,[0,2]];ss=np.asarray(route['chainages']);count=len(base)
    heading=np.gradient(xz,axis=0);heading/=np.linalg.norm(heading,axis=1)[:,None];right=np.column_stack([-heading[:,1],heading[:,0]])
    starts=[];ends=[];way_ids=[];endpoint_ways=defaultdict(set)
    for track in route['tracks']:
        p=np.asarray(track['points'])[:,[0,2]];wid=track['sourceWay']
        for endpoint in [p[0],p[-1]]:endpoint_ways[tuple(np.round(endpoint/.05).astype(int))].add(wid)
        for a,b in zip(p,p[1:]):
            if np.linalg.norm(b-a)>.1:starts.append(a);ends.append(b);way_ids.append(wid)
    connected=defaultdict(set)
    for ways in endpoint_ways.values():
        for way in ways:connected[way].update(ways)
    a=np.asarray(starts);b=np.asarray(ends);ab=b-a;tree=cKDTree((a+b)/2);_,near=tree.query(xz,k=min(64,len(a)))
    aa=a[near];vv=ab[near];denominator=np.sum(vv*heading[:,None,:],axis=2)
    t=np.divide(np.sum((xz[:,None,:]-aa)*heading[:,None,:],axis=2),denominator,out=np.full_like(denominator,np.nan),where=abs(denominator)>1e-6)
    foot=aa+vv*t[:,:,None]
    delta=foot-xz[:,None,:];offset=np.sum(delta*right[:,None,:],axis=2);along=np.abs(np.sum(delta*heading[:,None,:],axis=2));alignment=np.abs(np.sum(vv*heading[:,None,:],axis=2))/np.linalg.norm(vv,axis=2)
    valid=(offset < -1.8)&(offset > -38)&(t>=-.001)&(t<=1.001)&(alignment>.94)

    def inside(point,polygon):
        x,z=point;state=False
        for u,v in zip(polygon,np.roll(polygon,-1,axis=0)):
            if (u[1]>z)!=(v[1]>z) and x<(v[0]-u[0])*(z-u[1])/(v[1]-u[1])+u[0]:state=not state
        return state
    platform_masks=[]
    for platform in route['platforms']:
        p=np.asarray(platform['footprint']);center=p.mean(axis=0);k=int(np.argmin(np.linalg.norm(xz-center,axis=1)));axis=np.linalg.svd(p-center,full_matrices=False)[2][0]
        if np.linalg.norm(xz[k]-center)<55 and abs(axis@heading[k])>.85:platform_masks.append((p.min(axis=0),p.max(axis=0),p,platform['id']))
    rejected=0
    for i in range(count):
        for j in np.flatnonzero(valid[i]):
            q=foot[i,j]
            for mn,mx,p,pid in platform_masks:
                if np.all(q>=mn) and np.all(q<=mx) and inside(q,p):valid[i,j]=False;rejected+=1;break

    candidates=[]
    for i in range(count):
        cs=[]
        for j in np.flatnonzero(valid[i]):
            v=float(offset[i,j]);wid=way_ids[int(near[i,j])];local=abs(abs(v)-4.0)*.22+(1-float(alignment[i,j]))*25+float(along[i,j])*.1
            item={'offset':v,'way':wid,'local':local,'point':foot[i,j]}
            match=next((k for k,c in enumerate(cs) if abs(c['offset']-v)<.14),None)
            if match is None:cs.append(item)
            elif local<cs[match]['local']:cs[match]=item
        cs.sort(key=lambda c:c['local']);candidates.append(cs[:12]+[None])
    costs=[];back=[]
    for i,cs in enumerate(candidates):
        values=[];prior=[]
        for c in cs:
            local=45 if c is None else c['local']
            if i==0:values.append(local);prior.append(-1);continue
            best=float('inf');best_k=-1;ds=max(ss[i]-ss[i-1],1)
            for k,old in enumerate(candidates[i-1]):
                if old is None or c is None:penalty=7 if old is not c else 0
                else:
                    change=abs(c['offset']-old['offset'])
                    if change>max(1.15,ds*.15):continue
                    if old['way']!=c['way'] and c['way'] not in connected[old['way']]:continue
                    if np.linalg.norm(c['point']-old['point'])>ds*1.4+2:continue
                    penalty=change*change*5+(0 if c['way']==old['way'] else .15)
                value=costs[i-1][k]+local+penalty
                if value<best:best=value;best_k=k
            values.append(best);prior.append(best_k)
        costs.append(values);back.append(prior)
    index=int(np.argmin(costs[-1]));chosen=[None]*count
    for i in range(count-1,-1,-1):chosen[i]=candidates[i][index];index=back[i][index]
    known=np.array([c is not None for c in chosen]);raw=np.array([c['offset'] if c is not None else np.nan for c in chosen]);raw_candidates=raw.copy();tunnel_mask=np.zeros(count,dtype=bool);tunnel_inferences=[]
    for tunnel in route['tunnels']:
        mask=(ss>=tunnel['start'])&(ss<=tunnel['end']);tunnel_mask|=mask;known[mask]=False;raw[mask]=np.nan
        tunnel_inferences.append({'id':tunnel['id'],'start':tunnel['start'],'end':tunnel['end'],'offset':-3.6,'reason':'Opposing bore geometry is not independently surveyed; sparse exported adjacent splines can fan outside the two-track bore. Explicit 3.6m double-track inference replaces those artifacts.'})
    valid_ix=np.flatnonzero(known)
    if not len(valid_ix):raise ValueError('No mapped opposing track can be recovered')
    interpolated=np.interp(ss,ss[valid_ix],raw[valid_ix]);interpolated[tunnel_mask]=-3.6;safe=np.minimum(interpolated,-3.3)
    # Clamp only source-uncertain gap transitions. Mapped candidates have already
    # passed a maximum 1.15m/8m lateral change criterion; never cross side zero.
    for _ in range(2):
        for indices in [range(1,count),range(count-2,-1,-1)]:
            for i in indices:
                j=i-1 if indices.step>0 else i+1;limit=.145*abs(ss[i]-ss[j]);safe[i]=np.clip(safe[i],safe[j]-limit,safe[j]+limit)
    safe=np.minimum(safe,-3.3)
    platform_adjustments=[]
    # Interpolated source gaps and separation/slope corrections must also pass
    # polygon exclusion. Move only farther left around a conflicting platform,
    # then propagate the same lateral-slope bound into approaches. This is an
    # explicit authoring correction; never cut the platform to hide a bad track.
    for iteration in range(10):
        changed=False
        for i in range(count):
            q=xz[i]+right[i]*safe[i]
            for mn,mx,p,pid in platform_masks:
                if not (np.all(q>=mn) and np.all(q<=mx) and inside(q,p)):continue
                relative=p-xz[i];along_poly=relative@heading[i];offset_poly=relative@right[i];crossings=[]
                for j in range(len(p)):
                    k=(j+1)%len(p)
                    if (along_poly[j]>0)!=(along_poly[k]>0):crossings.append(offset_poly[j]+(offset_poly[k]-offset_poly[j])*(-along_poly[j])/(along_poly[k]-along_poly[j]))
                if crossings:
                    target=min(crossings)-.08
                    if target<safe[i]-.001:
                        platform_adjustments.append({'s':round(float(ss[i]),2),'platform':pid,'before':round(float(safe[i]),3),'after':round(float(target),3)})
                        safe[i]=target;changed=True;q=xz[i]+right[i]*safe[i]
        if not changed:break
        for i in range(1,count):safe[i]=min(safe[i],safe[i-1]+.145*(ss[i]-ss[i-1]))
        for i in range(count-2,-1,-1):safe[i]=min(safe[i],safe[i+1]+.145*(ss[i+1]-ss[i]))
    def buffered_intervals(i,radius=1.55):
        intervals=[]
        for mn,mx,p,pid in platform_masks:
            relative=p-xz[i];u=relative@heading[i];v=relative@right[i]
            if u.min()>radius or u.max()<-radius:continue
            roots=[]
            for j in range(len(p)):
                k=(j+1)%len(p);ua,va,ub,vb=u[j],v[j],u[k],v[k];du,dv=ub-ua,vb-va;length=math.hypot(du,dv)
                if length<1e-8:continue
                if (ua>0)!=(ub>0):roots.append(va+(vb-va)*(-ua)/(ub-ua))
                # Intersection of the edge's finite-width strip with u=0.
                if abs(du)>1e-8:
                    center=va-dv*ua/du;half=radius*length/abs(du);lo,hi=center-half,center+half
                    if abs(dv)>1e-8:
                        bound1=va+du*ua/dv;bound2=va+(length*length+du*ua)/dv;lo=max(lo,min(bound1,bound2));hi=min(hi,max(bound1,bound2))
                    elif not (0<=-ua/du<=1):lo,hi=1,0
                    if lo<hi:intervals.append((float(lo),float(hi)))
                elif abs(ua)<=radius:
                    intervals.append((float(min(va,vb)),float(max(va,vb))))
                for ue,ve in [(ua,va),(ub,vb)]:
                    if abs(ue)<=radius:
                        half=math.sqrt(max(0,radius*radius-ue*ue));intervals.append((float(ve-half),float(ve+half)))
            roots.sort()
            for j in range(0,len(roots)-1,2):intervals.append((float(roots[j]),float(roots[j+1])))
        merged=[]
        for lo,hi in sorted(intervals):
            if merged and lo<=merged[-1][1]+.001:merged[-1]=(merged[-1][0],max(hi,merged[-1][1]))
            else:merged.append((lo,hi))
        return merged
    low=np.full(count,-38.0);high=np.full(count,-3.3);preferred=safe.copy();infeasible_corridor=[]
    for i in range(count):
        intervals=buffered_intervals(i);free=[];cursor=-38.0
        for lo,hi in intervals:
            if hi<=cursor or lo>=-3.3:continue
            if lo>cursor:free.append((cursor,min(lo-.015,-3.3)))
            cursor=max(cursor,hi+.015)
        if cursor<=-3.3:free.append((cursor,-3.3))
        choices=[(abs(float(np.clip(preferred[i],lo,hi))-preferred[i]),lo,hi) for lo,hi in free if hi>=lo]
        if choices:
            distance,lo,hi=min(choices)
            if distance<=1.8:
                low[i],high[i]=lo,hi;preferred[i]=np.clip(preferred[i],lo,hi)
            else:infeasible_corridor.append(i)
        else:infeasible_corridor.append(i)
    low[tunnel_mask]=-3.6;high[tunnel_mask]=-3.6;preferred[tunnel_mask]=-3.6
    # Project the local free intervals into a globally reachable Lipschitz path.
    # An infeasible raw-source corridor is recorded, rather than jumping to a
    # different track beyond a whole station platform.
    for _ in range(2):
        for indices in [range(1,count),range(count-2,-1,-1)]:
            for i in indices:
                j=i-1 if indices.step>0 else i+1;limit=.145*abs(ss[i]-ss[j]);lo=max(low[i],low[j]-limit);hi=min(high[i],high[j]+limit)
                if lo<=hi:low[i],high[i]=lo,hi
                else:infeasible_corridor.append(i);low[i],high[i]=-38,-3.3
    safe[0]=np.clip(preferred[0],low[0],high[0])
    for i in range(1,count):
        limit=.145*(ss[i]-ss[i-1]);lo=max(low[i],safe[i-1]-limit);hi=min(high[i],safe[i-1]+limit)
        if lo<=hi:safe[i]=np.clip(preferred[i],lo,hi)
        else:infeasible_corridor.append(i);safe[i]=np.clip(preferred[i],safe[i-1]-limit,safe[i-1]+limit)
    safe=np.minimum(safe,-3.3)
    def signed_edge_distance(point,polygon):
        edge=np.roll(polygon,-1,axis=0)-polygon;length2=np.sum(edge*edge,axis=1);t=np.divide(np.sum((point-polygon)*edge,axis=1),length2,out=np.zeros(len(edge)),where=length2>0);t=np.clip(t,0,1);distance=float(np.min(np.linalg.norm(point-polygon-edge*t[:,None],axis=1)))
        return -distance if inside(point,polygon) else distance
    swept_conflicts=[]
    for lane,offsets in [('source',np.zeros(count)),('opposing',safe)]:
        for i,q in enumerate(xz+right*offsets[:,None]):
            for mn,mx,p,pid in platform_masks:
                if np.all(q>=mn-1.55) and np.all(q<=mx+1.55):
                    distance=signed_edge_distance(q,p)
                    if distance<1.549:swept_conflicts.append({'lane':lane,'s':round(float(ss[i]),2),'platform':pid,'clearance':round(distance,3),'required':1.55,'edgeAdjustmentDeficit':round(1.55-distance,3),'status':'raw footprint/fitted-rail incompatibility; derived edge authoring or source review required'})
    gaps=[];corrections=[]
    def intervals(mask):
        spans=[];start=None
        for i,v in enumerate(mask):
            if v and start is None:start=i
            if start is not None and (not v or i==len(mask)-1):
                end=i if v else i-1;spans.append((start,end));start=None
        return spans
    for lo,hi in intervals(~known):
        spans_tunnel=bool(np.any(tunnel_mask[lo:hi+1]))
        gaps.append({'start':round(float(ss[lo]),2),'end':round(float(ss[hi]),2),'samples':hi-lo+1,'reason':'Two-track tunnel geometry explicitly inferred; see tunnelGeometryInference' if spans_tunnel else 'No connected platform-clear near-parallel source counterpart at these samples; interpolated between mapped neighbours','confidence':'inferred geometry; not source-verified'})
    for lo,hi in intervals(np.abs(safe-interpolated)>.02):
        corrections.append({'start':round(float(ss[lo]),2),'end':round(float(ss[hi]),2),'maximumMetres':round(float(np.max(abs(safe[lo:hi+1]-interpolated[lo:hi+1]))),3),'reason':'3.3m centre separation, smooth transition or 1.55m platform-edge authoring against an unverified fitted primary curve; not a surveyed source adjustment'})
    points=np.column_stack([xz[:,0]+right[:,0]*safe,base[:,1],xz[:,1]+right[:,1]*safe])
    collisions=[]
    for i,q in enumerate(points[:,[0,2]]):
        for mn,mx,p,pid in platform_masks:
            if np.all(q>=mn) and np.all(q<=mx) and inside(q,p):collisions.append({'s':round(float(ss[i]),2),'platform':pid});break
    route['opposingOffsets']=rounded(safe,3)
    route['opposingTrack']={'points':rounded(points),'mappedOffsets':[round(float(v),3) if np.isfinite(v) else None for v in raw],'rawCandidateOffsets':[round(float(v),3) if np.isfinite(v) else None for v in raw_candidates],'sourceWayIds':[c['way'] if c and known[i] else None for i,c in enumerate(chosen)],'mappedSampleCount':int(known.sum()),'inferredSampleCount':int((~known).sum()),'correctedMappedSampleCount':int(np.sum(known & (np.abs(safe-np.nan_to_num(raw,nan=0))>.02))),'mappedSampleMeaning':'A source candidate exists before explicit authoring corrections; final positions are not all exact source positions','minimumSeparation':round(float(np.min(abs(safe))),3),'maximumLateralSlope':round(float(np.max(abs(np.diff(safe)/np.diff(ss)))),4),'platformCandidateRejections':rejected,'platformAvoidanceAdjustments':platform_adjustments,'platformSweptClearanceConflicts':swept_conflicts,'infeasibleSourceCorridorSamples':sorted(set(infeasible_corridor)),'tunnelGeometryInference':tunnel_inferences,'gaps':gaps,'authoringCorrections':corrections,'platformIntrusionsAfterCorrection':collisions,'source':'Mapped adjacent rail centrelines in supplied overview SVG; connected-way dynamic-program selection, left-side counterpart, platform-polygon exclusion','confidence':'mapped horizontal candidates with explicit missing-source interpolation, tunnel inference and physical-clearance authoring corrections; operational directions unverified','directionNote':'Chosen left-side counterpart aligns typical UK running for KID→DDG relative to the original DDG→KID selected source line; current permitted directions/interlocking are not surveyed','status':'raw platform swept-clearance incompatibilities recorded' if swept_conflicts else 'continuous model path; source gaps/authoring corrections remain explicit'}
    json_write(path,route)
    validation_path=OUT/'data-validation.json';report=json.loads(validation_path.read_text())
    report['opposingTrack']={k:route['opposingTrack'][k] for k in ['mappedSampleCount','inferredSampleCount','minimumSeparation','maximumLateralSlope','platformCandidateRejections','gaps','authoringCorrections','platformIntrusionsAfterCorrection','platformSweptClearanceConflicts','infeasibleSourceCorridorSamples','status']};json_write(validation_path,report)
    print(json.dumps({'mapped':int(known.sum()),'inferred':int((~known).sum()),'gaps':len(gaps),'corrections':len(corrections),'minimumSeparation':route['opposingTrack']['minimumSeparation'],'lateralSlope':route['opposingTrack']['maximumLateralSlope'],'platformIntrusions':len(collisions)}))
    for station in route['stations']:
        print(station['id'],round(float(np.interp(station['s'],ss,safe)),3))


def disambiguate_building_parts(tiles):
    """Give separate mapped polygons stable IDs under their shared OSM source."""
    groups=defaultdict(list)
    for tile_id,tile in tiles.items():
        for building in tile['buildings']:
            source=building.get('sourceId',building['id']);groups[source].append((tile_id,building))
    changed=set()
    for source,parts in groups.items():
        if len(parts)<2:continue
        for tile_id,building in parts:
            footprint=json.dumps(building['footprint'],separators=(',',':'))
            ident=source+'/part/'+hashlib.sha256(footprint.encode()).hexdigest()[:12]
            if building['id']!=ident or building.get('sourceId')!=source:
                building['id']=ident;building['sourceId']=source;changed.add(tile_id)
    return changed


def update_cached_building_ids():
    route=json.loads((OUT/'route.json').read_text());tiles={}
    for entry in route['tiles']:tiles[entry['id']]=json.loads((ROOT/'public'/entry['url']).read_text())
    changed=disambiguate_building_parts(tiles)
    for ident in changed:json_write(OUT/'tiles'/(ident+'.json'),tiles[ident])
    print(json.dumps({'buildingPartTilesUpdated':sorted(changed)}))


def disambiguate_water_parts(tiles):
    groups=defaultdict(list)
    for tile_id,tile in tiles.items():
        for water in tile.get('land',[]):
            if water.get('kind')=='water':groups[water.get('sourceId',water['id'])].append((tile_id,water))
    changed=set()
    for source,parts in groups.items():
        if len(parts)<2:continue
        for tile_id,water in parts:
            footprint=json.dumps(water['footprint'],separators=(',',':'))
            ident=source+'/part/'+hashlib.sha256(footprint.encode()).hexdigest()[:12]
            if water['id']!=ident or water.get('sourceId')!=source:
                water['id']=ident;water['sourceId']=source;changed.add(tile_id)
    return changed


def update_cached_water_ids():
    route=json.loads((OUT/'route.json').read_text());tiles={}
    for entry in route['tiles']:tiles[entry['id']]=json.loads((ROOT/'public'/entry['url']).read_text())
    changed=disambiguate_water_parts(tiles)
    for ident in changed:json_write(OUT/'tiles'/(ident+'.json'),tiles[ident])
    print(json.dumps({'waterPartTilesUpdated':sorted(changed)}))


def build_road_surfaces():
    """Share centroid-owned source road paths across terrain tile boundaries.

    Runtime filters these precomputed bounds before engineering local profiles;
    the owning tile still controls the rendered road and vehicle path.
    """
    route=json.loads((OUT/'route.json').read_text())
    roads={};sources=[]
    for tile in sorted(route['tiles'],key=lambda t:t['id']):
        path=ROOT/'public'/tile['url'].lstrip('/');raw=path.read_bytes()
        sources.append({'path':str(path.relative_to(ROOT)),'sha256':hashlib.sha256(raw).hexdigest()})
        for feature in json.loads(raw)['roads']:
            points=feature.get('points',[])
            if len(points)<2:continue
            key=(feature['id'],json.dumps(points,separators=(',',':')))
            bounds=[min(p[0] for p in points),min(p[2] for p in points),max(p[0] for p in points),max(p[2] for p in points)]
            roads[key]={**feature,'bounds':bounds}
    result={'version':1,'generatedBy':'python scripts/build_route.py --roads','source':'Supplied overview SVG road paths already exported to centroid-owned source tiles; no new road geometry, height or grade classification introduced','confidence':'mapped horizontal geometry; source-ground-based inferred height profiles; see SOURCE-GAPS.md','coordinateSystem':{'x':'E-400000','y':'metres ODN','z':'280000-N'},'runtimeUse':'Filter bounds against tile plus support margin, engineer deterministically in ID order for terrain/support only; retain tile ownership for mesh/traffic generation','sources':sources,'roads':[roads[k] for k in sorted(roads)]}
    json_write(OUT/'road-surfaces.json',result)
    print(json.dumps({'roadSurfaces':len(result['roads']),'bytes':(OUT/'road-surfaces.json').stat().st_size}))


def build_land_surfaces():
    """Export shared water support while preserving each source polygon/level."""
    route=json.loads((OUT/'route.json').read_text());water=[];sources=[]
    for tile in sorted(route['tiles'],key=lambda t:t['id']):
        path=ROOT/'public'/tile['url'].lstrip('/');raw=path.read_bytes()
        sources.append({'path':str(path.relative_to(ROOT)),'sha256':hashlib.sha256(raw).hexdigest()})
        for feature in json.loads(raw).get('land',[]):
            fp=feature.get('footprint',[])
            if feature.get('kind')!='water' or len(fp)<3:continue
            bounds=[min(p[0] for p in fp),min(p[1] for p in fp),max(p[0] for p in fp),max(p[1] for p in fp)]
            water.append({**feature,'bounds':bounds,'ownerTile':tile['id']})
    water.sort(key=lambda f:(f['id'],f['bounds']))
    result={'version':1,'generatedBy':'python scripts/build_route.py --land','source':'Supplied source-tile water polygons and existing inferred levels; no additional polygons or surveyed heights','runtimeUse':'Shared terrain-support water polygons filtered by bounds; rendering retains ownerTile','sources':sources,'water':water}
    json_write(OUT/'land-surfaces.json',result)
    print(json.dumps({'waterSurfaces':len(water),'bytes':(OUT/'land-surfaces.json').stat().st_size}))


if __name__=="__main__":
    import sys
    if "--water-ids" in sys.argv:
        update_cached_water_ids()
        build_road_surfaces()
        build_land_surfaces()
    elif "--building-ids" in sys.argv:
        update_cached_building_ids()
        build_road_surfaces()
        build_land_surfaces()
    elif "--land" in sys.argv:
        build_land_surfaces()
    elif "--roads" in sys.argv:
        build_road_surfaces()
    elif "--adjacent" in sys.argv:
        build_adjacent_services()
    elif "--opposing" in sys.argv:
        build_opposing_track()
    else:
        main()
        build_opposing_track()
        build_road_surfaces()
        build_land_surfaces()
