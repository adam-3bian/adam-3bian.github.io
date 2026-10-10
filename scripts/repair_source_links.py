#!/usr/bin/env python3
"""Correct two source fragment typos using the headings actually published there."""
import json
from pathlib import Path
from capture import ROOT
repairs=[
 ('https://cheri-alliance.github.io/events/cheri-blossoms-conference-2026/#recordings-slides','/events/cheri-blossoms-conference-2026/#recordings-slides','/events/cheri-blossoms-conference-2026/#recordings--slides'),
 ('https://cheri-alliance.github.io/events/cybersecurity-by-design-conference-2024/#talks','/events/cybersecurity-by-design-conference-2024/#talks','/events/cybersecurity-by-design-conference-2024/#talks--slides')]
routes=json.loads((ROOT/'reports/route-map.json').read_text());checks=[]
for original,broken,fixed in repairs:
    paths=[]
    for folder in ['pages']+['_'+n for n in __import__('yaml').safe_load((ROOT/'_config.yml').read_text())['collections']]:
        for file in (ROOT/folder).rglob('*.md'):
            text=file.read_text();updated=text.replace('('+broken+')','('+fixed+')')
            if updated!=text:file.write_text(updated);paths.append(str(file.relative_to(ROOT)))
    routes[original]=fixed
    checks.append({'source_reference':original,'canonical_target':fixed,'changed_paths':paths,'evidence':'Existing source heading ID; original source fragment has no target','status':'repaired'})
(ROOT/'reports/route-map.json').write_text(json.dumps(routes,indent=2)+'\n')
(ROOT/'reports/source-link-repairs.json').write_text(json.dumps(checks,indent=2)+'\n')
print('Two source fragment typos map to their actual published heading IDs.')
