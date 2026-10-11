"""Local Chromium helpers, extracted from the previously verified native checks."""
from contextlib import contextmanager
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import threading

@contextmanager
def serve(folder):
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self, *_):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=folder))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield 'http://127.0.0.1:' + str(server.server_port)
    finally:
        server.shutdown()
        server.server_close()
        thread.join()

def ready(page, url):
    response = page.goto(url, wait_until='networkidle')
    page.locator('img[loading=lazy]').evaluate_all('imgs=>imgs.forEach(i=>i.loading="eager")')
    page.wait_for_function('[...document.images].every(i=>i.complete)')
    page.evaluate('Promise.all([400,500,600].map(w=>document.fonts.load(w+" 16px Poppins")))')
    page.evaluate('document.fonts.ready')
    return response.status

def states(page):
    card = page.locator('.cards a.card').first
    properties = ['backgroundColor', 'color', 'outlineColor', 'outlineStyle', 'outlineWidth', 'outlineOffset']
    def style():
        return card.evaluate('(n,ps)=>Object.fromEntries(ps.map(p=>[p,getComputedStyle(n)[p]]))', properties)
    page.mouse.move(0, 0)
    page.locator('body').click(position={'x': 1, 'y': 1})
    normal = style()
    card.hover()
    hover = style()
    page.mouse.move(0, 0)
    page.keyboard.press('Tab')
    card.focus()
    focus = style()
    return {'normal': normal, 'hover': hover, 'focus': focus,
            'keyboard_focus_visible': card.evaluate('n=>n.matches(":focus-visible")')}

OBSERVE = '''() => ({width:innerWidth,scroll_width:document.documentElement.scrollWidth,h1:document.querySelectorAll('main h1').length,
 images:[...document.images].filter(i=>i.getAttribute('src')).map(i=>{
  let n=i,faded=[];while(n){if(parseFloat(getComputedStyle(n).opacity)<1)faded.push(n.tagName+'.'+n.className);n=n.parentElement;}
  return {src:i.getAttribute('src'),decoded:i.complete&&i.naturalWidth>0,faded};
 }),
 frames:[...document.querySelectorAll('.card-media')].map(n=>{
  const r=n.getBoundingClientRect(),i=n.querySelector('img').getBoundingClientRect();
  return {landscape:n.classList.contains('card-media-landscape'),width:r.width,height:r.height,image_width:i.width,image_height:i.height};
 }),
 relationship_counts:Object.fromEntries([...document.querySelectorAll('[data-relationship]')].map(n=>[n.dataset.relationship,n.querySelectorAll('a.card').length])),
 card_images_not_zoomed:![...document.querySelectorAll('.card-image')].some(i=>i.closest('[data-image-overlay]')),
})'''

STYLE = '''selectors => Object.fromEntries(Object.entries(selectors).map(([selector,props])=>{
 const n=document.querySelector(selector),s=n?getComputedStyle(n):null;
 return [selector,s?Object.fromEntries(props.map(p=>[p,s[p]])):null];
}))'''
