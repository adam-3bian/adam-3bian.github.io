#!/usr/bin/env python3
"""Verify every migrated article's metadata, reading layout and category neighbours."""
from pathlib import Path
import json,os,re,yaml
from urllib.parse import urlsplit
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];URL=os.environ.get('SITE_URL','http://127.0.0.1:4200/').rstrip('/')+'/'
OUT=Path(os.environ.get('REPORT_ROOT',ROOT/'reports/posts'));OUT.mkdir(parents=True,exist_ok=True)
posts=[]
for file in (ROOT/'_posts').glob('*.md'):
 _,meta,body=file.read_text().split('---',2);posts.append((yaml.safe_load(meta),body))
readings={};results=[];prefix=urlsplit(URL).path.rstrip('/')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE'),args=['--no-sandbox']);page=b.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 for width in [390,1440]:
  page.set_viewport_size({'width':width,'height':1000})
  for index,(data,body) in enumerate(posts):
   assert page.goto(URL+data['permalink'].lstrip('/')).status==200
   page.evaluate('document.fonts.ready');assert page.locator('h1').count()==1;assert page.locator('.detail-aside,.record-portrait').count()==0;assert page.locator('.page-heading .page-summary').count()==0
   assert page.locator('.article-category').inner_text().strip()
   reading=page.locator('.reading-time').inner_text();assert re.fullmatch(r'[1-9]\d* min read',reading);readings[data['slug']]=int(reading.split()[0])
   assert '*' not in page.locator('.article-byline').inner_text()
   assert page.locator('.article-byline .author a').evaluate_all('ns=>ns.map(n=>n.getAttribute("href"))')==[prefix+'/people/'+credit['person']+'/' for credit in data['post'].get('authors',[]) if credit.get('person')]
   assert page.locator('.article-lead').count()==int(bool(data.get('image',{}).get('src')))
   neighbours=[d for d,t in posts if d['post']['category']==data['post']['category'] and d['slug']!=data['slug']]
   links=page.locator('[aria-labelledby="related-title"] a.catalog-card');assert links.count()==min(3,len(neighbours));assert data['permalink'] not in links.evaluate_all('ns=>ns.map(n=>n.getAttribute("href"))')
   if neighbours:
    assert page.locator('#related-title').inner_text()=='Where Next?' and page.locator('[aria-labelledby="related-title"] img').count()==0
    assert page.locator('#related-posts-title').count()==1, 'Existing article-related fragments remain available'
   assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1'),(width,data['slug'])
   if width==1440:
    box=page.locator('.article-shell > .reading-content').bounding_box();shell=page.locator('.article-shell').bounding_box();assert abs((box['x']-shell['x'])-((shell['x']+shell['width'])-(box['x']+box['width'])))<1
   if index<4:
    page.add_script_tag(path=os.environ['AXE_PATH']);violations=page.evaluate("async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))");assert not violations,(width,data['slug'],violations)
   results.append({'width':width,'slug':data['slug'],'reading_minutes':readings[data['slug']]})
 shortest,longest=min(posts,key=lambda p:len(p[1].split())),max(posts,key=lambda p:len(p[1].split()))
 assert readings[longest[0]['slug']]>readings[shortest[0]['slug']],'Reading estimates must derive from article length'
 assert not errors,errors;b.close()
(OUT/'results.json').write_text(json.dumps(results,indent=2)+'\n')
print('Articles: 96 responsive checks, metadata/byline order, derived reading times, feature images, centred reading columns, category neighbours and eight axe audits passed.')
