#!/usr/bin/env python3
"""Read-only final source comparison: one worker per site and declared crawl delay."""
import hashlib,json,time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
from urllib.parse import urlsplit
from bs4 import BeautifulSoup
from capture import ROOT,request
from convert_batch import clean_main,signature
rows=[r for r in json.loads((ROOT/'reports/capture-index.json').read_text())['records'] if r.get('conversion_status')=='converted']
# Exact aliases are already checked against captures. Request one primary body per local file.
unique={}
for row in rows:unique.setdefault(row['local_path'],row)
path=ROOT/'reports/live-source-validation.json'
results=[]
def check_host(host):
    checked=[];delay=10 if host=='cheri-alliance.org' else .35
    for row in unique.values():
        if row['source_site']!=host:continue
        time.sleep(delay)
        result={'source_url':row['url'],'path':row['local_path'],'checked_at':datetime.now(timezone.utc).isoformat()}
        try:
            status,final,content_type,raw=request(row['url'])
            assert status==200 and 'html' in content_type,(status,content_type)
            target=ROOT/'sources/live-final-pass'/host/(hashlib.sha256(row['url'].encode()).hexdigest()+'.html')
            target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
            current,_=clean_main(BeautifulSoup(raw,'html5lib'),final)
            expected=json.loads((ROOT/'reports/validation'/hashlib.sha256(row['url'].encode()).hexdigest()[:16]/'source-signature.json').read_text())
            actual=json.loads(json.dumps(signature(current)))
            differences={key:{'captured':expected[key],'live':actual[key]} for key in actual if expected[key]!=actual[key]}
            result.update(http_status=status,final_url=final,snapshot_path=str(target.relative_to(ROOT)),sha256=hashlib.sha256(raw).hexdigest(),status='changed' if differences else 'passed',differences=differences)
        except Exception as error:result.update(status='failed',reason=str(error))
        checked.append(result)
        if len(checked)%25==0:print(host,len(checked),'pages checked',flush=True)
    print(host,len(checked),'completed',flush=True)
    return checked
with ThreadPoolExecutor(max_workers=2) as pool:
    for checked in pool.map(check_host,('cheri-alliance.github.io','cheri-alliance.org')):results+=checked
path.write_text(json.dumps(results,indent=2,ensure_ascii=False)+'\n')
summary={status:sum(r['status']==status for r in results) for status in ('passed','changed','failed')}
print(summary,flush=True)
if summary['changed'] or summary['failed']:raise SystemExit(1)
