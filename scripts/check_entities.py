#!/usr/bin/env python3
"""Audit canonical references, role flags and citations against source evidence."""
import hashlib,json,re
from pathlib import Path
import yaml
from capture import ROOT,write_csv
from site_model import collections,document
records=[r for r in json.loads((ROOT/'reports/capture-index.json').read_text())['records'] if r.get('conversion_status')=='converted']
by_path={r['local_path']:r for r in records};by_url={r['url']:r for r in records}
groups=collections();proofs=json.loads((ROOT/'reports/relationship-evidence.json').read_text())
proof_index={(p['path'],p['field'],str(p['value'])):p for p in proofs}
checks=[];manifest=[]
def signature(row):
    path='reports/validation/'+hashlib.sha256(row['url'].encode()).hexdigest()[:16]+'/source-signature.json'
    return path,json.loads((ROOT/path).read_text())
def refs(value):return value if isinstance(value,list) else [value] if value else []
for group,items in groups.items():
    for identifier,item in items.items():
        path,meta=item['path'],item['meta']
        assert 'cheri-alliance.' not in identifier,path
        assert not any(key in meta for key in ('layout','source_url','slug')),path
        relation_list=[]
        for field,target_group in [('organization','organisations'),('speakers','people'),('authors','people')]:
            values=refs(meta.get(field));assert len(values)==len(set(values)),path
            for target in values:
                assert target in groups[target_group],(path,field,target)
                proof=proof_index[(path,field,str(target))]
                if field=='organization':
                    source=signature(by_url[proof['source_url']])[1]
                    definitions=source['definitions']
                    assert any(v==['dt','Organisation'] and definitions[i+1]==['dd',proof['published_label']] for i,v in enumerate(definitions[:-1]))
                    assert proof['published_name'] in proof['published_label']
                    assert proof['target_title']==groups['organisations'][target]['meta']['title']
                elif field=='speakers':
                    source=signature(by_url[proof['source_url']])[1]
                    assert any(url.rstrip('/')==proof['profile_url'].rstrip('/') for url,label in source['links'])
                elif field=='authors':
                    paper=next(p for p in json.loads((ROOT/'reports/paper-validation.json').read_text()) if p['local_path']==path)
                    assert proof['published_name'] in paper['named_authors']
                    assert proof['published_name'] in paper['source_signature']['text']
                checks.append({'path':path,'field':field,'target':target,'source_url':proof['source_url'],'status':'passed'})
                relation_list.append(field+': '+target)
        for role in ('member','speaker'):
            if meta.get(role) is not None:
                assert meta[role] is True,(path,role)
                assert (path,role,'True') in proof_index or (role=='speaker' and any(p['field']=='speakers' and p['value']==identifier for p in proofs)),path
                checks.append({'path':path,'field':role,'value':True,'status':'passed'})
        row=by_path.get(path)
        manifest.append({'entity_slug':identifier,'entity_type':group,'source_url':row['url'] if row else '',
                         'relationship':' | '.join(relation_list),'relationship_evidence':'reports/relationship-evidence.json','verification_status':'source-backed'})
board=yaml.safe_load((ROOT/'_data/governing-board.yml').read_text())
assert all(isinstance(p,str) for p in board)
assert len(board)==len(set(board))
board_source=by_url['https://cheri-alliance.github.io/alliance/leadership/governing-board/']
source=signature(board_source)[1]
for person in board:
    assert person in groups['people']
    target=by_path[groups['people'][person]['path']]
    assert [target['url'],groups['people'][person]['meta']['title']] in source['links']
    checks.append({'path':'_data/governing-board.yml','field':'member','target':person,'status':'passed'})
# Minimal records contain names actually published in an affiliation or a citation.
for derived in json.loads((ROOT/'reports/derived-content.json').read_text()):
    meta,body=document(derived['path']);assert meta=={'title':derived['title']},derived['path']
    assert body.strip()=='# '+derived['title'],derived['path']
    if derived['type']=='organisation-name':
        source=signature(by_url[derived['source_url']])[1]
        assert derived['title'] in derived['source_label']
        assert derived['source_label'] in source['text']
    else:
        assert derived['title'] in derived['source_names']
        for paper_id in derived['papers']:
            assert Path(derived['path']).stem in groups['papers'][paper_id]['meta']['authors']
            paper=next(p for p in json.loads((ROOT/'reports/paper-validation.json').read_text()) if p['slug']==paper_id)
            assert any(name in paper['named_authors'] for name in derived['source_names'])
    checks.append({'path':derived['path'],'scope':'Published name and derived links; no invented biography or affiliation','status':'passed'})
assert [p.name for p in (ROOT/'_data').glob('*')]==['governing-board.yml']
write_csv(ROOT/'reports/entity-manifest.csv',manifest,['entity_slug','entity_type','source_url','relationship','relationship_evidence','verification_status'])
(ROOT/'reports/entity-validation.json').write_text(json.dumps(checks,indent=2)+'\n')
print(f'PASS: {sum(len(v) for v in groups.values())} collection records, {len(checks)} reference/role/name checks and {len(board)} governing board references. Only governing-board.yml remains in _data.')
