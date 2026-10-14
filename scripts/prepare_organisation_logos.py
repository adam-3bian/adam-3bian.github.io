#!/usr/bin/env python3
"""Generate self-contained SVG display masks while retaining original artwork."""
import base64
import argparse
import hashlib
import json
from html import escape
from pathlib import Path

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true', help='Verify saved masks match their original source artwork')
args = parser.parse_args()
logos = json.loads((root / '_data/organisation-logos.json').read_text())
for logo in logos:
    source = root / logo['source'].lstrip('/')
    original = source.read_bytes()
    mime = 'image/jpeg' if source.suffix in ('.jpg', '.jpeg') else 'image/png'
    data = 'data:' + mime + ';base64,' + base64.b64encode(original).decode()
    w, h = logo['width'], logo['height']
    image = f'<image href="{data}" width="{w}" height="{h}"/>'
    if 'clip_ellipse' in logo:
        cx, cy, rx, ry = logo['clip_ellipse']
        definitions = f'<clipPath id="canvas"><ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}"/></clipPath>'
        displayed = image.replace('/>', ' clip-path="url(#canvas)"/>')
    else:
        # Mask almost-white canvas; RGB in the displayed image stays untouched.
        definitions = '<filter id="white-canvas" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -10 -10 -10 0 29.4"/></filter>'
        mask = image.replace('/>', ' filter="url(#white-canvas)"/>')
        if 'preserve_rectangle' in logo:
            x, y, width, height = logo['preserve_rectangle']
            mask += f'<rect x="{x}" y="{y}" width="{width}" height="{height}" fill="white"/>'
        definitions += f'<mask id="canvas" maskUnits="userSpaceOnUse" x="0" y="0" width="{w}" height="{h}">{mask}</mask>'
        displayed = image.replace('/>', ' mask="url(#canvas)"/>')
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title"><title id="title">{escape(logo["title"])} logo</title><defs>{definitions}</defs>{displayed}</svg>\n'
    output = root / logo['output'].lstrip('/')
    if args.check:
        assert output.read_text() == svg, f'Regenerate {output.relative_to(root)}'
    else:
        output.write_text(svg)
    # Two embeds are needed for the mask; each retains the exact source bytes.
    embeds = [part.split('"', 1)[0] for part in svg.split('href="')[1:]]
    assert embeds and all(base64.b64decode(value.split(',', 1)[1]) == original for value in embeds)
    print(logo['slug'], hashlib.sha256(original).hexdigest())
