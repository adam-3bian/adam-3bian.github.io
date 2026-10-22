#!/usr/bin/env python3
"""Cross-engine checks for the corporate surface and disclosure contracts."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get("SITE_URL", "http://127.0.0.1:4200/").rstrip("/") + "/"
OUT = Path(os.environ.get("REPORT_ROOT", ROOT / "reports/corporate"))
OUT.mkdir(parents=True, exist_ok=True)
AXE = Path(os.environ.get("AXE_PATH", "/workspace/work/browser-tools/node_modules/axe-core/axe.min.js"))
ENGINES = os.environ.get("BROWSERS", "chromium").split(",")
ROUTES = [
    "", "alliance/", "alliance/leadership/members/?view=list",
    "alliance/leadership/members/?view=grid", "people/?view=grid",
    "people/a-theodore-markettos/", "people/mike-eftimakis/",
    "organisations/axiomise-ltd/", "papers/cheriot-complete-memory-safety-for-embedded-devices/",
    "reports/an-introduction-to-cheri/", "adopt/assurance-and-adoption/x730-certification/", "repositories/cheribsd/",
    "events/cheri-blossoms-conference-2025/", "groups/marketing/",
    "guides/install-a-toolchain/", "policies/competition-law-statement/",
    "discover/resources/glossary/", "discover/understand/how-does-cheri-work/",
    "news/ai-doesnt-need-a-kill-switch-it-needs-boundaries/",
    "alliance/membership/contact/", "404.html",
]
WIDTHS = [320, 390, 768, 1024, 1440, 1920]
results = []
errors = []


def ready(page):
    page.evaluate("document.fonts.ready")


def check_keyboard_entry(page, width):
    """Follow the native Tab order from page entry, independently of pointer use."""
    roots = page.locator("#primary-navigation > ul > li > .submenu-toggle")
    visited = []
    trace = []
    for _ in range(24):
        page.keyboard.press("Tab")
        active = page.locator(":focus")
        trace.append(active.evaluate("e=>({tag:e.tagName,id:e.id,text:e.textContent.trim().slice(0,60)})") if active.count() else None)
        if active.count() and active.get_attribute("id") == "hamburger":
            page.keyboard.press("Enter")
            assert active.get_attribute("aria-expanded") == "true"
        elif active.count() and active.evaluate("e=>e.matches('#primary-navigation > ul > li > .submenu-toggle')"):
            index = active.evaluate("e=>Array.from(document.querySelectorAll('#primary-navigation > ul > li > .submenu-toggle')).indexOf(e)")
            assert index == len(visited), (width, "Native Tab order", trace)
            assert active.evaluate("e=>getComputedStyle(e).outlineStyle") != "none", (width, "Tab focus", trace)
            page.keyboard.press("Enter")
            assert active.get_attribute("aria-expanded") == "true"
            page.keyboard.press("Escape")
            assert active.get_attribute("aria-expanded") == "false"
            assert roots.nth(index).evaluate("e=>e===document.activeElement")
            assert active.evaluate("e=>getComputedStyle(e).outlineStyle") != "none", (width, "Escape focus", trace)
            visited.append(index)
            if len(visited) == roots.count():
                break
    assert len(visited) == roots.count(), (width, "All root menus reachable with Tab", trace)
    page.keyboard.press("Tab")
    assert page.locator(".navigation-contact .button").evaluate("e=>e===document.activeElement"), (width, "Contact Us follows the root menus")
    if page.locator("#hamburger").is_visible():
        page.keyboard.press("Escape")
        assert page.locator("#hamburger").get_attribute("aria-expanded") == "false"


def check_disclosures(page, width):
    """Approaching a trigger never changes its state; the first click opens it."""
    page.mouse.move(0, 0)
    hamburger = page.locator("#hamburger")
    if hamburger.is_visible():
        hamburger.click()
    roots = page.locator("#primary-navigation > ul > li > .submenu-toggle")
    for trigger in roots.all():
        assert trigger.get_attribute("aria-expanded") == "false"
        trigger.hover()
        assert trigger.get_attribute("aria-expanded") == "false", "Hover must not open navigation"
        trigger.click()
        assert trigger.get_attribute("aria-expanded") == "true", "First click must open navigation"
        menu = page.locator("#" + trigger.get_attribute("aria-controls"))
        assert menu.is_visible()
        assert menu.evaluate("e=>[e,...e.querySelectorAll('a,.submenu-row,.menu-group-toggle')].every(n=>['TopLeft','TopRight','BottomRight','BottomLeft'].every(corner=>getComputedStyle(n)['border'+corner+'Radius']==='10px'))"), (width, "All menu and row corners share the container radius")
        assert menu.evaluate("e=>getComputedStyle(e).backgroundColor") == "rgb(255, 255, 255)"
        assert trigger.locator(".menu-indicator").inner_text() == "▲"
        assert trigger.locator(".menu-indicator").get_attribute("aria-hidden") == "true"
        assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 1")
        if hamburger.is_visible():
            group = menu.locator(".menu-group-toggle").first
            if group.count():
                group.click()
                assert group.get_attribute("aria-expanded") == "true"
                assert menu.locator("a:visible").count() > 0
                page.keyboard.press("Escape")
                assert group.get_attribute("aria-expanded") == "false"
                assert group.evaluate("e=>e===document.activeElement")
        trigger.click()
        assert trigger.get_attribute("aria-expanded") == "false", "Second click must close navigation"
    roots.first.click()
    roots.last.click()
    assert roots.first.get_attribute("aria-expanded") == "false"
    assert roots.last.get_attribute("aria-expanded") == "true"
    page.mouse.click(2, 950)
    assert roots.last.get_attribute("aria-expanded") == "false"
    if hamburger.is_visible():
        assert hamburger.get_attribute("aria-expanded") == "false"


with sync_playwright() as playwright:
    for engine in ENGINES:
        print(f"Checking {engine} at {URL}", flush=True)
        options = {"headless": True}
        if engine == "chromium":
            options["args"] = ["--no-sandbox"]
            if os.environ.get("CHROMIUM_EXECUTABLE"):
                options["executable_path"] = os.environ["CHROMIUM_EXECUTABLE"]
        browser = getattr(playwright, engine).launch(**options)
        for width in WIDTHS:
            context = browser.new_context(viewport={"width": width, "height": 1000}, reduced_motion="reduce")
            page = context.new_page()
            page.on("pageerror", lambda error: errors.append(str(error)))
            for route in ROUTES:
                response = page.goto(URL + route)
                assert response.status == 200, (engine, width, route, response.status)
                ready(page)
                assert page.locator("h1").count() == 1, (engine, width, route, "page heading")
                assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 1"), (engine, width, route)
                assert page.locator("a a, a button, a input").count() == 0
                if route == "404.html":
                    assert page.locator("a.navigation-choice").count() == 3
                    assert page.locator("main table").count() == 0
                decorative = page.locator(".catalog-card:not(a),.record-portrait,.detail-aside,.citation-block,.glossary-entry,.glossary-index")
                assert decorative.evaluate_all("ns=>ns.every(e=>['Top','Right','Bottom','Left'].every(side=>parseFloat(getComputedStyle(e)['border'+side+'Width'])===0))"), (engine, width, route, "decorative border")
                if route:
                    assert page.locator('a.catalog-card, a.card').evaluate_all("ns=>ns.every(e=>['Top','Right','Bottom','Left'].every(side=>getComputedStyle(e)['border'+side+'Width']==='1px'))"), (engine,width,route,'Visible light card borders')
                assert page.locator('.hero,.page-heading,.page-surface,.promotional-panel,.footer-surface').evaluate_all("ns=>ns.every(e=>['Top','Right','Bottom','Left'].every(side=>parseFloat(getComputedStyle(e)['border'+side+'Width'])===1))"), (engine, width, route, "framed regions")
                ui = page.locator(".button,.catalog-card,.catalog-action,.member-badge,.submenu-toggle,.menu-group-title,.page-heading,.record-facts")
                assert ui.evaluate_all("""ns=>ns.every(e=>['color','backgroundColor'].every(p=>{
                  const c=(getComputedStyle(e)[p].match(/[\\d.]+/g)||[]).map(Number);
                  return c.length<3 || !(c[0]>c[1]*1.4 && c[0]>c[2]*1.4 && c[0]>80);
                }))"""), (engine, width, route, "red interface colour")
                cards = page.locator("a.catalog-card")
                if cards.count():
                    card = cards.first
                    assert card.evaluate("e=>getComputedStyle(e).boxShadow") != "none"
                    card.hover()
                    assert card.evaluate("e=>getComputedStyle(e).textDecorationLine") == "none"
                    assert card.evaluate("e=>getComputedStyle(e).borderTopWidth") == ('1px' if route else '0px')
                if route in ["", "alliance/"]:
                    check_keyboard_entry(page, width)
                    check_disclosures(page, width)
                violations = []
                if width in [390, 1440] and route in [
                    "", "alliance/", "alliance/leadership/members/?view=grid",
                    "papers/cheriot-complete-memory-safety-for-embedded-devices/",
                    "policies/competition-law-statement/", "discover/resources/glossary/",
                ]:
                    page.add_script_tag(path=str(AXE))
                    violations = page.evaluate("""async()=>(await axe.run(document,{
                      runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}
                    })).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))""")
                    assert not violations, (engine, width, route, violations)
                results.append({"engine": engine, "width": width, "route": route, "violations": violations})
            context.close()
        # Exercise a docked, scrollable desktop panel in a short viewport.
        page = browser.new_page(viewport={"width": 1440, "height": 300})
        page.goto(URL)
        trigger = page.locator("#primary-navigation > ul > li > .submenu-toggle").nth(3)
        trigger.click()
        menu = page.locator("#" + trigger.get_attribute("aria-controls"))
        geometry = menu.evaluate("e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}}")
        assert geometry["top"] >= 0 and geometry["bottom"] <= 300 and geometry["left"] >= 0 and geometry["right"] <= 1440, (engine, geometry)
        menu.locator("a").last.focus()
        assert menu.locator("a").last.evaluate("e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight}")
        page.close()
        # A larger browser default font must preserve navigation and content.
        page = browser.new_page(viewport={"width": 1024, "height": 1000})
        for route in ["", "people/?view=grid", "policies/competition-law-statement/"]:
            page.goto(URL + route)
            page.add_style_tag(content="html { font-size: 200%; }")
            ready(page)
            assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 1"), (engine, route, "200% text")
            controls = page.locator(".catalog-toolbar input,.catalog-toolbar select")
            assert controls.evaluate_all("""nodes=>nodes.every(e=>{
              const s=getComputedStyle(e);
              const available=e.clientHeight-parseFloat(s.paddingTop)-parseFloat(s.paddingBottom);
              const line=parseFloat(s.lineHeight)||parseFloat(s.fontSize)*1.2;
              return available+1>=line && e.scrollHeight<=e.clientHeight+1;
            })"""), (engine, route, "200% control text is clipped")
        page.close()
        # Tap is independently exercised; mouse hover tests cannot stand in for touch.
        context = browser.new_context(has_touch=True, viewport={"width": 390, "height": 844})
        page = context.new_page()
        page.goto(URL)
        page.locator("#hamburger").tap()
        trigger = page.locator("#primary-navigation > ul > li > .submenu-toggle").last
        trigger.tap()
        assert trigger.get_attribute("aria-expanded") == "true"
        trigger.tap()
        assert trigger.get_attribute("aria-expanded") == "false"
        context.close()
        # Native records and links remain available without enhancement.
        context = browser.new_context(java_script_enabled=False, viewport={"width": 390, "height": 844})
        page = context.new_page()
        page.goto(URL + "people/")
        assert page.locator("[data-catalog-list] > li:visible").count() == 111
        assert page.locator("#primary-navigation a:visible").count() == page.locator("#primary-navigation a").count() == 85
        page.goto(URL + "discover/resources/glossary/")
        assert page.locator("[data-glossary-entry]:visible").count() == 46
        context.close()
        # A failed enhancement script restores the native navigation as well.
        page = browser.new_page(viewport={"width": 390, "height": 844})
        page.route("**/assets/js/navigation.js", lambda route: route.abort())
        page.goto(URL)
        page.wait_for_function("!document.documentElement.classList.contains('navigation-pending')")
        assert page.locator("#primary-navigation a:visible").count() == page.locator("#primary-navigation a").count() == 85
        page.close()
        browser.close()

assert not errors, errors
report = {"engines": ENGINES, "route_viewport_checks": len(results), "widths": WIDTHS, "checks": results, "javascript_errors": errors}
(OUT / "results.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps({key: value for key, value in report.items() if key != "checks"}))
