#!/usr/bin/env python3
"""Fresh native Chromium audit: SITE REFERENCE_SITE PROJECT_PARENT.

Visits every editorial record at four widths. Uses the separately extracted ZIP
for computed-style checks; blocks external requests during local verification.
"""
import json
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright
from browser_support import serve, ready, OBSERVE, states
OUT = Path(__file__).with_name('evidence')
WIDTHS = [375, 768, 1024, 1440]
CONTACT = '/alliance/membership/contact/'
NEWSLETTER = '/news-and-events/news-and-analysis/subscribe-newsletter/'
records = json.loads((OUT / 'input-inventory.json').read_text())['records']
views, comparisons, menus, touch, forms, overlays, fallbacks, resources = [], [], [], [], [], [], [], []
failures, console_errors, request_errors = [], [], []
STYLE = '''selectors => Object.fromEntries(Object.entries(selectors).map(([selector,props])=>{
 const [element,pseudo]=selector.split('::'), n=document.querySelector(element);
 const s=n?getComputedStyle(n,pseudo?'::'+pseudo:null):null;
 return [selector,s?Object.fromEntries(props.map(p=>[p,s[p].replaceAll(location.origin,'')])):null];
}))'''
PROPS = {'body':['fontFamily','fontSize','fontWeight','lineHeight','color','backgroundColor'],
 'body::before':['backgroundImage','backgroundRepeat','backgroundSize','opacity'],
 'main':['maxWidth','paddingLeft','paddingRight','backgroundColor'],
 'header':['paddingLeft','paddingRight','backgroundColor'], '.brand img':['height','width','opacity'],
 '.hero':['padding','backgroundColor','color'], '.hero h1':['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing'],
 '.site-call-to-action':['padding','backgroundColor'], 'footer':['padding','backgroundColor','color']}
CARD_PROPS = {'.cards':['gap','gridTemplateColumns'], '.cards .card':['padding','backgroundColor','color','opacity'],
 '.cards .card :is(h2,h3)':['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing'],
 '.card-media':['aspectRatio','marginBottom'], '.card .meta':['fontSize','lineHeight']}
SCREENSHOTS = {'/':'home', '/discover/':'discover','/people/robert-watson/':'people-robert-watson',
 '/organisations/codasip/':'organisations-codasip', '/news/one-bug-is-all-it-takes/':'news-one-bug-is-all-it-takes',
 '/alliance/leadership/governing-board/':'alliance-leadership-governing-board',
 '/events/cheritech26/':'event', CONTACT:'contact', '/policies/privacy/':'policy'}

def fast_ready(page, url):
    response = page.goto(url, wait_until='load')
    page.locator('img[loading=lazy]').evaluate_all('imgs=>imgs.forEach(i=>i.loading="eager")')
    page.wait_for_function('[...document.images].every(i=>i.complete)')
    page.evaluate('document.fonts.ready')
    return response.status


def settled(page):
    page.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')


def observe(page, route, status):
    observation = {'route':route, 'status':status, **page.evaluate(OBSERVE)}
    observation.update(page.evaluate('''() => ({
      font_loaded:[400,500,600].every(w=>document.fonts.check(w+' 16px Poppins')),
      search_nodes:document.querySelectorAll('input[type=search],[role=search],#search-results,a[href="/search/"]').length,
      empty_cards:[...document.querySelectorAll('.card')].filter(n=>!n.textContent.trim()&&!n.querySelector('img')).length,
      nested_links:document.querySelectorAll('a a').length,
      card_overflow:[...document.querySelectorAll('.cards .card')].filter(n=>n.scrollWidth>n.clientWidth+1).map(n=>n.innerText.slice(0,120)),
      onward:document.querySelectorAll('[aria-labelledby=where-next]').length,
      related:document.querySelectorAll('[aria-labelledby=related-pages]').length
    })'''))
    okay = (status == 200 and observation['h1'] == 1 and observation['scroll_width'] <= observation['width']+1
        and all(i['decoded'] and not i['faded'] for i in observation['images']) and observation['font_loaded']
        and not observation['search_nodes'] and not observation['empty_cards'] and not observation['nested_links']
        and not observation['card_overflow'] and observation['onward'] <= 1 and observation['related'] <= 1)
    observation['correct'] = okay
    if not okay: failures.append({'route':route,'width':observation['width'],'kind':'view'})
    return observation

with serve(sys.argv[1]) as site, serve(sys.argv[2]) as reference, serve(sys.argv[3]) as project, sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    context = browser.new_context(reduced_motion='reduce')
    context.route('**/*',lambda r:r.continue_() if r.request.url.startswith(('http://127.0.0.1:','data:')) else r.abort())
    page = context.new_page()
    page.on('pageerror',lambda e:console_errors.append({'page':page.url,'error':str(e)}))
    page.on('console',lambda m:console_errors.append({'page':page.url,'error':m.text}) if m.type=='error' else None)
    page.on('requestfailed',lambda r:request_errors.append({'url':r.url,'error':r.failure}))
    page.on('response',lambda r:resources.append({'url':r.url,'status':r.status}) if r.status>=400 or r.request.resource_type in ['font','stylesheet','script'] else None)
    for index,record in enumerate(records):
        route=record['route'];status=fast_ready(page,site+route)
        for width in WIDTHS:
            page.set_viewport_size({'width':width,'height':1000});settled(page)
            views.append(observe(page,route,status))
            if route in SCREENSHOTS and (width in [375,1440] or route=='/'):
                page.screenshot(path=str(OUT/f'after-{SCREENSHOTS[route]}-{width}.png'),full_page=True)
        if index % 80 == 0:print(f'Checked {index+1}/{len(records)} editorial routes at all four widths',flush=True)
    # Root and project builds must produce equivalent responsive behaviour.
    for route in ['/', '/discover/', '/people/robert-watson/', '/events/cheritech26/', CONTACT, NEWSLETTER]:
        status=fast_ready(page,project+'/cheri-preview'+route)
        for width in WIDTHS:
            page.set_viewport_size({'width':width,'height':1000});settled(page)
            views.append(observe(page,'/cheri-preview'+route,status))
    for width in WIDTHS:
        page.set_viewport_size({'width':width,'height':1000})
        for route, ref_route in [('/', '/real-slider/'),('/discover/','/light-hub/'),('/people/anthony-fox/','/about/')]:
            ready(page,site+route);actual=page.evaluate(STYLE,PROPS)
            ready(page,reference+ref_route);expected=page.evaluate(STYLE,PROPS)
            comparisons.append({'width':width,'route':route,'actual':actual,'reference':expected,'correct':actual==expected})
        ready(page,site+'/news/');actual=page.evaluate(STYLE,CARD_PROPS);actual_states=states(page)
        ready(page,reference+'/news/');expected=page.evaluate(STYLE,CARD_PROPS);expected_states=states(page)
        comparisons.append({'width':width,'route':'/news/','actual':actual,'reference':expected,
                            'states_match':actual_states==expected_states,'correct':actual==expected and actual_states==expected_states})
    # Exercise every primary category and every nested group with a keyboard.
    for width in WIDTHS:
        page.set_viewport_size({'width':width,'height':1000});ready(page,site+'/')
        stacked=page.locator('#hamburger').is_visible()
        for i in range(5):
            if stacked and page.locator('#hamburger').get_attribute('aria-expanded')!='true':page.locator('#hamburger').click()
            toggle=page.locator('#primary-navigation > ul > li > button').nth(i)
            toggle.focus();toggle.press('ArrowDown');menu=page.locator('#'+toggle.get_attribute('aria-controls'))
            assert menu.is_visible()
            groups=menu.locator('.menu-group-toggle')
            group_results=[]
            for group in groups.all():
                if stacked:group.focus();group.press('ArrowDown')
                child=page.locator('#'+group.get_attribute('aria-controls'))
                link=child.locator('a:visible').first;link.focus()
                correct=link.evaluate('n=>n.matches(":focus-visible")') and child.locator('a:visible').count()>0
                if stacked:
                    page.keyboard.press('Escape')
                    correct=correct and group.evaluate('n=>n===document.activeElement') and not child.is_visible()
                group_results.append({'title':group.inner_text(),'correct':correct})
            rect=menu.bounding_box();fits=rect['x']>=-1 and rect['x']+rect['width']<=width+1
            page.keyboard.press('Escape')
            restored=toggle.evaluate('n=>n===document.activeElement')
            menus.append({'width':width,'category':toggle.inner_text(),'groups':group_results,
                          'correct':fits and restored and toggle.get_attribute('aria-expanded')=='false' and all(g['correct'] for g in group_results)})
        if stacked:page.keyboard.press('Escape')
    # Real touch events, including each nested group on phone and tablet.
    for width in [375,768]:
        ctx=browser.new_context(has_touch=True,reduced_motion='reduce',viewport={'width':width,'height':1000})
        q=ctx.new_page();ready(q,site+'/');q.locator('#hamburger').tap()
        for toggle in q.locator('#primary-navigation > ul > li > button').all():
            toggle.tap();menu=q.locator('#'+toggle.get_attribute('aria-controls'));okay=menu.is_visible()
            for group in menu.locator('.menu-group-toggle').all():
                group.tap();child=q.locator('#'+group.get_attribute('aria-controls'));okay=okay and child.is_visible() and child.locator('a:visible').count()>0
                group.tap();okay=okay and not child.is_visible()
            toggle.tap();touch.append({'width':width,'category':toggle.inner_text(),'correct':okay and not menu.is_visible()})
        ctx.close()
    for route in [CONTACT,NEWSLETTER]:
        ready(page,site+route);requests=[];listener=lambda r:requests.append({'method':r.method,'url':r.url});page.on('request',listener)
        fields=page.locator('.form-panel input,.form-panel textarea,.form-panel select');labels=[]
        for field in fields.all():
            labels.append(page.locator('label[for="'+field.get_attribute('id')+'"]').count()==1)
            if field.evaluate('n=>n.tagName')=='SELECT':field.select_option(index=1)
            else:field.fill('preview@example.invalid' if field.get_attribute('type')=='email' else 'Local preview check')
            field.press('Enter')
        page.wait_for_timeout(150);page.remove_listener('request',listener)
        forms.append({'route':route,'fields':fields.count(),'requests':requests,
                      'correct':all(labels) and not requests and page.locator('.form-panel button').is_disabled()
                         and page.locator('.form-panel form').count()==0 and page.url==site+route})
    for width in WIDTHS:
        page.set_viewport_size({'width':width,'height':1000});ready(page,site+'/people/robert-watson/')
        link=page.locator('[data-image-overlay]').first;link.focus();link.press('Enter');dialog=page.locator('#image-dialog')
        bounds=dialog.bounding_box();opened=dialog.is_visible() and bounds['width']<=width and bounds['height']<=1000
        page.keyboard.press('Escape');settled(page)
        overlays.append({'width':width,'correct':opened and not dialog.is_visible() and link.evaluate('n=>n===document.activeElement')})
    nojs=browser.new_context(java_script_enabled=False)
    q=nojs.new_page()
    for route in ['/', '/discover/', '/people/robert-watson/', CONTACT, NEWSLETTER]:
        for width in [375,1440]:
            q.set_viewport_size({'width':width,'height':1000});ready(q,site+route)
            checks={'navigation_visible':all(n.is_visible() for n in q.locator('#primary-navigation a').all()),
                    'fits':q.evaluate('document.documentElement.scrollWidth<=innerWidth')}
            if route=='/':checks.update(cards=q.locator('[data-section-cards] > section').count()==5,
                first_slide=q.locator('.slide').first.is_visible(),others_hidden=not q.locator('.slide').nth(1).is_visible())
            if route in [CONTACT,NEWSLETTER]:checks.update(disabled=q.locator('.form-panel button').is_disabled(),no_form=q.locator('.form-panel form').count()==0)
            fallbacks.append({'route':route,'width':width,'checks':checks,'correct':all(checks.values())})
    nojs.close();context.close();browser.close()
result={'views':views,'computed_style_comparisons':comparisons,'keyboard_menus':menus,'touch_menus':touch,
        'forms':forms,'image_dialogs':overlays,'no_javascript':fallbacks,
        'resources':resources,'console_errors':console_errors,'request_errors':request_errors,'failures':failures}
(OUT/'browser.json').write_text(json.dumps(result,indent=2)+'\n')
assert not failures and not console_errors and not request_errors, 'See full browser evidence'
assert all(r['correct'] for r in comparisons+menus+touch+forms+overlays+fallbacks), 'See functional or style evidence'
assert all(r['status']<400 for r in resources)
print(f'{len(views)} responsive views, {len(comparisons)} ZIP style comparisons, {len(menus)} keyboard category flows, '
      f'{len(touch)} touch category flows, {len(forms)} form checks, {len(overlays)} image dialogs and {len(fallbacks)} no-JS views pass.')
