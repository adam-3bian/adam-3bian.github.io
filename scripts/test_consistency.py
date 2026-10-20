#!/usr/bin/env python3
"""Review the compact navigation contract, brand surfaces and image fallbacks."""
import json,os
from pathlib import Path
import yaml
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
URL=os.environ.get('SITE_URL','http://127.0.0.1:4200/').rstrip('/')+'/'
OUT=Path(os.environ.get('REPORT_ROOT',ROOT/'reports/consistency'));OUT.mkdir(parents=True,exist_ok=True)
AXE=Path(os.environ.get('AXE_PATH','/workspace/work/browser-tools/node_modules/axe-core/axe.min.js'))
config=yaml.safe_load((ROOT/'_config.yml').read_text())
def links(items):
    result=[]
    for item in items:
        if item.get('url'):result.append((item['url'],item['title']))
        result+=links(item.get('subcategories',[]))+links(item.get('links',[]))
    return result
expected=links(config['navigation']['header'])
routes=['','alliance/','build/','news-and-events/','people/?view=grid','alliance/leadership/members/?view=list','alliance/leadership/members/?view=grid','people/adam-finney/','news-and-events/events-and-archive/cheri-blossoms/','alliance/membership/contact/','discover/resources/videos-and-presentations/']
results=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE'),args=['--no-sandbox'])
    for width in [320,390,768,1000,1440]:
        for route in routes:
            page=b.new_page(viewport={'width':width,'height':1000},reduced_motion='reduce')
            assert page.goto(URL+route).status==200
            page.evaluate('document.fonts.ready')
            assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1'),(width,route)
            actual=page.locator('#primary-navigation a').evaluate_all("ns=>ns.map(n=>[n.getAttribute('href'),n.textContent.trim()])")
            prefix='/' + URL.split('/',3)[3].strip('/') if URL.split('/',3)[3].strip('/') else ''
            wanted=[[(prefix+u if u.startswith('/') else u),t] for u,t in expected]
            assert actual==wanted,(route,'mega-menu options changed')
            assert page.locator('a a,a button').count()==0
            assert page.locator('.listing-notes,.catalog-context,.catalog-summary,.catalog-hint').count()==0
            assert 'Introduction' not in page.locator('.card-kicker').all_text_contents()
            for label in page.locator('.eyebrow,.card-kicker').all():
                assert label.evaluate("e=>getComputedStyle(e).textTransform")=='none'
                assert label.evaluate("e=>parseFloat(getComputedStyle(e).fontSize)")>=14
            # Writing must meet an opaque, plain surface before any gradient surround.
            def assert_plain_text_surfaces():
                failures=page.evaluate(r"""()=>{
                  const bad=[],walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
                  while(walk.nextNode()){
                    const text=walk.currentNode,e=text.parentElement;
                    if(!text.textContent.trim()||!e||e.closest('script,style,noscript,svg,[hidden],[inert]'))continue;
                    const range=document.createRange();range.selectNodeContents(text);
                    if(!range.getBoundingClientRect().width||getComputedStyle(e).visibility!=='visible')continue;
                    for(let n=e;n;n=n.parentElement){
                      const s=getComputedStyle(n);
                      if(s.backgroundImage!=='none'){bad.push({text:text.textContent.trim().slice(0,60),surface:n.className});break;}
                      const rgb=s.backgroundColor.match(/[\d.]+/g)||[];
                      if(rgb.length===3||(rgb.length===4&&Number(rgb[3])===1))break;
                    }
                  }
                  return bad;
                }""")
                assert not failures,(width,route,'text over decoration',failures)
            assert_plain_text_surfaces()
            if '?view=' in route:
                assert page.locator('[data-catalog-list]').evaluate('e=>getComputedStyle(e).backgroundImage')=='none'
                assert page.locator('a.catalog-card').first.evaluate('e=>getComputedStyle(e).boxShadow')!='none'
            if route=='discover/resources/videos-and-presentations/':
                assert page.locator('.card-kicker').count()==0
                assert page.locator('.record-list a.catalog-card').first.evaluate('e=>getComputedStyle(e).boxShadow')!='none'
            nav=page.locator('main a.catalog-card').first
            if nav.count():
                nav.hover();page.wait_for_timeout(50)
                assert nav.evaluate("e=>getComputedStyle(e).textDecorationLine")=='none'
                for heading in nav.locator('h2,h3').all():assert heading.evaluate('e=>getComputedStyle(e).textDecorationLine')=='none'
                nav.focus();assert nav.evaluate('e=>getComputedStyle(e).outlineStyle')!='none'
            cta=page.locator('.site-call-to-action .card')
            assert cta.locator('.card-action').inner_text()=='Get the newsletter →'
            assert cta.evaluate("e=>getComputedStyle(e).backgroundColor")=='rgb(21, 43, 59)'
            assert cta.evaluate("e=>getComputedStyle(e).backgroundImage")=='none'
            assert cta.locator('h2').evaluate('e=>getComputedStyle(e).color')=='rgb(255, 255, 255)'
            assert cta.evaluate('e=>getComputedStyle(e).borderTopWidth')=='0px'
            # Both resting and interactive colours must stay opaque and readable.
            cta.hover()
            assert cta.evaluate("e=>getComputedStyle(e).backgroundColor")=='rgb(27, 58, 76)'
            assert cta.locator('h2').evaluate('e=>getComputedStyle(e).color')=='rgb(255, 255, 255)'
            cta.focus()
            assert cta.evaluate('e=>getComputedStyle(e).outlineStyle')!='none'
            page.mouse.move(0,0)
            cta.evaluate('e=>e.blur()')
            if route=='':
                hero=page.locator('.hero')
                assert hero.evaluate("e=>{const s=getComputedStyle(e);return [s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth]}")==['0px','0px','1px','0px']
                track=page.locator('.slider-track')
                assert 'linear-gradient' in track.evaluate('e=>getComputedStyle(e).backgroundImage')
                assert track.evaluate('e=>getComputedStyle(e).boxShadow')!='none'
            band=page.locator('.site-call-to-action')
            assert band.evaluate('e=>getComputedStyle(e).backgroundImage')=='none'
            assert band.evaluate('e=>getComputedStyle(e).backgroundColor')=='rgba(18, 87, 112, 0.92)'
            if route.startswith('people/?'):
                assert page.locator('.catalog-media').count()==111
                first=page.locator('[data-title="A. Theodore Markettos"]')
                assert first.locator('.placeholder-image').count()==1
                assert first.locator('img').get_attribute('alt')==''
                for box in page.locator('.catalog-media').evaluate_all('ns=>ns.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height}))'):
                    assert abs(box['w']-box['h'])<1,(width,box)
            if route.startswith('alliance/leadership/members/'):
                assert page.locator('[data-catalog-list] >li').count()==52
                assert page.locator('[data-catalog-list] .member-badge').count()==21
                assert page.locator('[data-catalog-list] .catalog-media').count()==52
                # Check real geometry with short/long titles and absent badges.
                members=page.locator('[data-catalog-list] .catalog-card').evaluate_all("""nodes=>nodes.map(n=>{
                  const rect=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,height:r.height};};
                  return {card:rect(n),title:rect(n.querySelector('h2')),footer:rect(n.querySelector('.catalog-footer')),
                    badge:rect(n.querySelector('.member-badge')),action:rect(n.querySelector('.catalog-action')),
                    mediaBorder:getComputedStyle(n.querySelector('.catalog-media')).borderTopWidth};
                })""")
                for member in members:
                    card,title,footer,badge,action=[member[k] for k in ['card','title','footer','badge','action']]
                    assert member['mediaBorder']=='0px'
                    assert footer['right']<=card['right']-12 and footer['x']>=card['x']+12,(width,route,member)
                    assert title['right']<=footer['x']+1 or title['bottom']<=footer['y']+1,(width,'overlap',member)
                    if badge:
                        assert badge['right']+6<=action['x'],(width,'badge overlaps arrow',member)
                        assert abs(badge['y']+badge['height']/2-action['y']-action['height']/2)<1
                if '?view=grid' in route:
                    # Every card in a row, with or without membership, shares a footer baseline.
                    for member in members:
                        assert abs(member['card']['bottom']-member['footer']['bottom']-(17 if width<768 else 21))<1,(width,member)
                elif width>=768:
                    positions=[m['badge']['x'] for m in members if m['badge']]
                    assert max(positions)-min(positions)<1,(width,'unaligned membership badges')
            if route in ['alliance/','build/','news-and-events/']:
                destinations=page.locator('.index-navigation a,.index-more a').evaluate_all('ns=>ns.map(n=>n.getAttribute("href"))')
                assert len(destinations)==len(set(destinations)),(route,'repeated category options')
            if route=='alliance/membership/contact/':
                assert page.locator('.form-panel form,.form-panel :disabled').count()==0
                assert 'preview' not in page.locator('main').inner_text().lower()
                assert page.locator('.form-panel a.button').get_attribute('href')=='https://cheri-alliance.org/contact/#contact_form'
                headings=page.locator('#where-next,#related-pages').evaluate_all('ns=>ns.map(n=>{const s=getComputedStyle(n);return [s.fontSize,s.fontWeight,s.textTransform,s.color]})')
                assert headings[0]==headings[1],headings
            if route=='people/adam-finney/':
                assert page.locator('.related-content .cards-grid').count()==0
                assert page.locator('.related-content .catalog-meta').count()==0
            # Open the actual light mega-menu during accessibility audits.
            if route=='alliance/':
                if page.locator('#hamburger').is_visible():page.locator('#hamburger').click()
                trigger=page.locator('#primary-navigation > ul > li >button').nth(3)
                trigger.focus();page.keyboard.press('Enter')
                assert trigger.get_attribute('aria-expanded')=='true'
                assert trigger.locator('.menu-indicator').inner_text()=='▲'
                if width<1000:page.locator('#nav-4 .menu-group-toggle').first.click()
                assert page.locator('#nav-4').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgb(18, 87, 112)'
                group=page.locator('#nav-4 .menu-group-title:visible').first
                assert group.evaluate('e=>getComputedStyle(e).fontSize')=='18px'
                assert group.evaluate('e=>getComputedStyle(e).color')=='rgb(185, 226, 241)'
                assert page.locator('#nav-4').evaluate('e=>getComputedStyle(e).boxShadow')!='none'
                assert_plain_text_surfaces()
            violations=[]
            if width in [390,1440]:
                page.add_script_tag(path=str(AXE))
                violations=page.evaluate("async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))")
                assert not violations,(width,route,violations)
            results.append({'width':width,'route':route,'violations':violations})
            page.close()
    page=b.new_page()
    page.goto(URL+'people/?view=grid')
    page.route('**/missing-portrait.jpg',lambda route:route.abort())
    photo=page.locator('[data-title="Adam Finney"] img')
    photo.evaluate("e=>e.src='/missing-portrait.jpg'")
    page.wait_for_function("(()=>{const i=document.querySelector('[data-title=\"Adam Finney\"] img');return i.classList.contains('placeholder-image')&&i.complete&&i.naturalWidth>0})()")
    assert photo.get_attribute('alt')==''
    page.close()
    nojs=b.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
    page=nojs.new_page();page.goto(URL+'people/')
    assert page.locator('[data-catalog-list]>li:visible').count()==111
    assert page.locator('.placeholder-image').count()>0
    page.goto(URL+'alliance/');assert page.locator('.index-navigation a').count()==18
    b.close()
(OUT/'results.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps({'responsive_views':len(results),'axe_views':len(routes)*2,'menu_options':len(expected),'no_javascript':'passed'}))
