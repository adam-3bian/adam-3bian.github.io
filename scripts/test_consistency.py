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
routes=['','alliance/','build/','news-and-events/','people/?view=grid','alliance/leadership/members/?view=list','alliance/leadership/members/?view=grid','people/adam-finney/','news-and-events/events-and-archive/cheri-blossoms/','alliance/membership/contact/','discover/resources/videos-and-presentations/','policies/competition-law-statement/']
results=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE'),args=['--no-sandbox'])
    for width in [320,390,768,1024,1440,1920]:
        for route in routes:
            page=b.new_page(viewport={'width':width,'height':1000},reduced_motion='reduce')
            assert page.goto(URL+route).status==200
            page.evaluate('document.fonts.ready')
            assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1'),(width,route)
            if page.locator('.breadcrumb-band').count():
                assert page.locator('.breadcrumb-band').evaluate("e=>{const s=getComputedStyle(e),panel=getComputedStyle(document.querySelector('.page-surface'));return s.borderTopWidth==='1px'&&s.borderBottomWidth==='1px'&&s.borderTopStyle==='solid'&&s.borderBottomStyle==='solid'&&s.borderTopColor===s.borderBottomColor&&s.borderTopColor===panel.borderTopColor}"), (width,route,'Shared subtle breadcrumb separators')
            actual=page.locator('#primary-navigation a').evaluate_all("ns=>ns.map(n=>[n.getAttribute('href'),n.textContent.trim()])")
            prefix='/' + URL.split('/',3)[3].strip('/') if URL.split('/',3)[3].strip('/') else ''
            wanted=[[(prefix+u if u.startswith('/') else u),t] for u,t in expected]
            assert actual==wanted,(route,'mega-menu options changed')
            assert page.locator('a a,a button').count()==0
            assert page.locator('.listing-notes,.catalog-context,.catalog-summary,.catalog-hint').count()==0
            assert 'Introduction' not in page.locator('.card-kicker').all_text_contents()
            for label in page.locator('.record-status,.card-kicker').all():
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
                assert nav.evaluate("e=>['Top','Right','Bottom','Left'].every(s=>getComputedStyle(e)['border'+s+'Width']==='0px')")
                for heading in nav.locator('h2,h3').all():assert heading.evaluate('e=>getComputedStyle(e).textDecorationLine')=='none'
                nav.focus();assert nav.evaluate('e=>getComputedStyle(e).outlineStyle')!='none'
            cta=page.locator('.site-call-to-action .promotional-panel')
            action=cta.locator('a.button-primary')
            assert action.count()==1 and cta.locator('a').count()==1
            assert cta.evaluate("e=>e.tagName")=='DIV'
            assert action.locator('span').inner_text()=='Get the newsletter'
            assert action.get_attribute('href')==prefix+'/news-and-events/news-and-analysis/subscribe-newsletter/'
            # Light pages use a filled Contact Us action; geometry stays shared.
            for button in page.locator('.button:visible:not(:disabled)').all():
                style=button.evaluate("e=>{const s=getComputedStyle(e);return {background:s.backgroundColor,colour:s.color,radius:s.borderRadius,height:e.getBoundingClientRect().height,padding:s.padding,gap:s.columnGap}}")
                contact=page.locator('body').get_attribute('data-theme')=='light' and button.evaluate("e=>e.matches('.navigation-contact > .button')")
                background,colour=('rgb(18, 87, 112)','rgb(255, 255, 255)') if contact else ('rgb(255, 255, 255)','rgb(18, 87, 112)')
                assert (style['background'],style['colour'])==(background,colour),(width,route,button.inner_text(),style)
                assert style['radius']=='10px' and style['height']>=48 and style['padding']=='12px 16px' and style['gap']=='12px',(width,route,button.inner_text(),style)
            gaps=page.evaluate("()=>{const h=document.querySelector('.site-header').getBoundingClientRect(),m=document.querySelector('main').getBoundingClientRect(),n=document.querySelector('.site-call-to-action').getBoundingClientRect(),f=document.querySelector('.site-footer').getBoundingClientRect();const b=document.querySelector('.breadcrumb-band'), hero=document.querySelector('.hero,.page-heading').getBoundingClientRect(),p=document.querySelector('.promotional-panel').getBoundingClientRect(),fs=document.querySelector('.footer-surface').getBoundingClientRect();return [hero.top-(b?b.getBoundingClientRect().bottom:h.bottom),fs.top-p.bottom]}")
            assert gaps==[16,16],(width,route,'Global frame gaps',gaps)
            if route=='':
                assert page.locator('[data-section-cards] > .content-panel').evaluate_all("ns=>ns.length>0&&ns.every(n=>parseFloat(getComputedStyle(n).paddingLeft)>=24)"),'Homepage panels retain interior padding'
            assert cta.evaluate("e=>getComputedStyle(e).backgroundColor")=='rgb(21, 43, 59)'
            assert cta.evaluate("e=>getComputedStyle(e).backgroundImage")=='none'
            assert cta.locator('h2').evaluate('e=>getComputedStyle(e).color')=='rgb(255, 255, 255)'
            assert cta.evaluate('e=>getComputedStyle(e).borderTopWidth')=='1px'
            assert cta.evaluate('e=>getComputedStyle(e).cursor')!='pointer'
            # The passive panel does not change when hovered; only the actual action does.
            cta.hover()
            assert cta.evaluate("e=>getComputedStyle(e).backgroundColor")=='rgb(21, 43, 59)'
            assert cta.evaluate("e=>getComputedStyle(e).boxShadow")=='none'
            action.hover();action.focus()
            assert action.evaluate('e=>getComputedStyle(e).outlineStyle')!='none'
            assert action.evaluate('e=>e.getBoundingClientRect().height')>=48
            assert_plain_text_surfaces()
            page.mouse.move(0,0);action.evaluate('e=>e.blur()')
            for heading in page.locator('.site-footer .menu-group-title').all():
                assert heading.evaluate('e=>getComputedStyle(e).color')=='rgb(255, 255, 255)'
                geometry=heading.evaluate("e=>{const a=e.parentElement.querySelector('a'),r=a.getBoundingClientRect();return {title:e.getBoundingClientRect().left,text:r.left+parseFloat(getComputedStyle(a).paddingLeft),linkWidth:r.width,columnWidth:a.closest('li').getBoundingClientRect().width}}")
                assert abs(geometry['title']-geometry['text'])<1 and geometry['linkWidth']<geometry['columnWidth'],(width,route,'Footer alignment and hover width',geometry)
            if route=='policies/competition-law-statement/':
                assert page.locator('.page-heading .eyebrow').count()==0
                assert page.locator('.page-heading').inner_text().splitlines()[0]=='Competition Law Statement'
                assert page.locator('.related-content .catalog-meta,.related-content .card-kicker').count()==0
                assert 'PDF takes precedence' in page.locator('.record-body').inner_text()
                pdf=page.locator('.detail-aside a.is-primary')
                assert 'Download official PDF' in pdf.inner_text()
                assert 'competition.pdf' in pdf.get_attribute('href')
                assert pdf.locator('.icon').count()==1
                assert pdf.evaluate('e=>e.getBoundingClientRect().height')>=48
                assert page.locator('.detail-aside .resource-panel').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgba(0, 0, 0, 0)'
            if route=='':
                hero=page.locator('.hero')
                assert hero.evaluate("e=>{const s=getComputedStyle(e);return [s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth]}")==['1px','1px','1px','1px']
                track=page.locator('.slider-track')
                surround=page.locator('.slider')
                assert surround.evaluate("e=>{const s=getComputedStyle(e);return s.backgroundImage==='none'&&s.backgroundColor==='rgba(0, 0, 0, 0)'&&s.padding==='0px'&&s.boxShadow==='none'}"), 'The slider has no additional visual surround'
                assert track.evaluate('e=>getComputedStyle(e).boxShadow')!='none'
                assert page.locator('[data-section-cards] > .content-panel').evaluate_all("ns=>{const colour=getComputedStyle(document.querySelector('.slide-link')).backgroundColor,shadow=getComputedStyle(document.querySelector('.slider-track')).boxShadow;return ns.length>0&&ns.every(n=>getComputedStyle(n).backgroundColor===colour&&getComputedStyle(n).boxShadow===shadow)}"), 'Homepage panels share the slide colour and shadow'
            band=page.locator('.site-call-to-action')
            assert band.evaluate('e=>getComputedStyle(e).backgroundImage')=='none'
            assert band.evaluate('e=>getComputedStyle(e).backgroundColor')=='rgba(0, 0, 0, 0)'
            assert band.evaluate('e=>getComputedStyle(e).backgroundColor')==page.locator('.site-footer').evaluate('e=>getComputedStyle(e).backgroundColor')
            closing=page.locator('.promotional-panel,.footer-surface').evaluate_all("ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,colour:getComputedStyle(n).backgroundColor}})")
            assert closing[0]==closing[1],('closing surfaces must align and share colour',closing)
            if route.startswith('people/?'):
                assert page.locator('.catalog-media').count()==63
                first=page.locator('[data-title="A. Theodore Markettos"]')
                assert first.locator('img,.catalog-media').count()==0
                for box in page.locator('.catalog-media').evaluate_all('ns=>ns.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height}))'):
                    assert abs(box['w']-box['h'])<1,(width,box)
            if route.startswith('alliance/leadership/members/'):
                assert page.locator('[data-catalog-list] >li').count()==51
                assert page.locator('[data-catalog-list] .member-badge').count()==21
                assert page.locator('.member-badge').first.evaluate('e=>getComputedStyle(e).backgroundColor')=='rgba(0, 0, 0, 0)'
                assert page.locator('.member-badge').first.evaluate('e=>getComputedStyle(e).boxShadow')=='none'
                assert page.locator('[data-catalog-list] .catalog-media').count()==51
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
                        assert abs(member['card']['bottom']-member['footer']['bottom']-24)<1,(width,member)
                elif width>=768:
                    positions=[m['badge']['x'] for m in members if m['badge']]
                    assert max(positions)-min(positions)<1,(width,'unaligned membership badges')
            if route in ['alliance/','build/','news-and-events/']:
                destinations=page.locator('.category-sections a').evaluate_all('ns=>ns.map(n=>n.getAttribute("href"))')
                assert destinations and len(destinations)==len(set(destinations)),(route,'missing or repeated category options')
            if route=='alliance/membership/contact/':
                assert page.locator('.form-panel form[data-local-form]').count()==1
                assert page.locator('.form-panel input,.form-panel select,.form-panel textarea').count()==5
                assert page.locator('.form-panel a.button').count()==0
                assert page.locator('.form-panel button[type=submit][disabled][hidden]').count()==1
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
                if page.locator('#hamburger').is_visible():page.locator('#nav-4 .menu-group-toggle').first.click()
                assert page.locator('#nav-4').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgb(255, 255, 255)'
                group=page.locator('#nav-4 .menu-group-title:visible').first
                assert group.evaluate('e=>getComputedStyle(e).fontSize')=='18px'
                assert group.evaluate('e=>getComputedStyle(e).color')=='rgb(18, 87, 112)'
                if not page.locator('#hamburger').is_visible():assert page.locator('#nav-4').evaluate('e=>getComputedStyle(e).boxShadow')!='none'
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
    page.wait_for_function("!document.querySelector('[data-title=\"Adam Finney\"] .catalog-media')")
    page.close()
    nojs=b.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
    page=nojs.new_page();page.goto(URL+'people/')
    assert page.locator('[data-catalog-list]>li:visible').count()==111
    assert page.locator('.placeholder-image').count()==0
    page.goto(URL+'alliance/');assert page.locator('.category-links a').count()==18
    page.goto(URL+'alliance/membership/contact/')
    assert page.locator('.form-panel input,.form-panel select,.form-panel textarea').count()==5
    assert page.locator('.form-panel a.button').count()==0
    assert page.locator('.form-panel button[type=submit][disabled][hidden]').count()==1
    b.close()
(OUT/'results.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps({'responsive_views':len(results),'axe_views':len(routes)*2,'menu_options':len(expected),'no_javascript':'passed'}))
