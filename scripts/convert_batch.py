#!/usr/bin/env python3
"""Convert a declared batch from immutable captures; fail on rendered differences."""
import argparse, csv, hashlib, json, re, subprocess, html
from pathlib import Path
from urllib.parse import urljoin, urlsplit
import yaml
from bs4 import BeautifulSoup, NavigableString, Comment
from markdownify import MarkdownConverter
from capture import ROOT, write_csv
from state import update_conversion,CONVERSION_FIELDS
from site_model import document, collections, canonical_url, canonical_signature

def editorial_class(name):
    """Keep semantic styling, without importing CMS-specific presentation."""
    return not (name.startswith(('elementor-', 'wp-', 'widget-', 'tablepress'))
                or name in {'entry-title', 'source-div-text'})

class Converter(MarkdownConverter):
    """Editorial content uses Kramdown only; presentation belongs to layouts."""
    def escape(self,text,parent_tags):
        misc=self.options['escape_misc'];self.options['escape_misc']=False
        try:escaped=super().escape(text,parent_tags)
        finally:self.options['escape_misc']=misc
        for c in ('[',']','#','`'):escaped=escaped.replace(c,'\\'+c)
        escaped=re.sub(r'(?<!\\)\|',r'\\|',escaped)
        return html.escape(escaped,quote=False)
    def attributes(self,el,extra=()):
        attrs=[]
        if el.get('id'):attrs.append('id="'+str(el['id']).replace('"','&quot;')+'"')
        attrs.extend('.'+c for c in list(el.get('class',[]))+list(extra) if editorial_class(c))
        return '\n{: '+' '.join(attrs)+' }' if attrs else ''
    def emphasis(self,text,marker):
        core=text.strip()
        if not core:return text
        before=text[:len(text)-len(text.lstrip())];after=text[len(text.rstrip()):]
        return before+marker+core+marker+after
    def convert_strong(self,el,text,parent_tags):return self.emphasis(text,'**')
    convert_b=convert_strong
    def convert_em(self,el,text,parent_tags):return self.emphasis(text,'*')
    convert_i=convert_em
    def convert_section(self,el,text,parent_tags):return '\n\n'+text+'\n\n'
    convert_article=convert_section
    convert_aside=convert_section
    def convert_figure(self,el,text,parent_tags):
        return '\n\n'+text.strip()+self.attributes(el)+'\n\n'
    def convert_p(self,el,text,parent_tags):
        text=re.sub(r'(?<!\\)\|',r'\\|',text)
        result=super().convert_p(el,text,parent_tags).rstrip()
        return result+self.attributes(el)+'\n\n'
    def convert_img(self,el,text,parent_tags):
        markdown=super().convert_img(el,text,set(parent_tags)-{'_inline'})
        role=self.options.get('image_classes',{}).get(el.get('src'))
        if role not in {'image-left','image-right','image-full'}:raise ValueError('Image lacks browser-backed alignment evidence')
        inline=' .image-inline' if self.options.get('inline_images',{}).get(el.get('src')) else ''
        dimensions=''.join(' '+name+'="'+str(el[name])+'"' for name in ('width','height') if el.get(name) and str(el[name]).isdigit())
        return markdown+'{: .'+role+inline+dimensions+' }'
    def convert_a(self,el,text,parent_tags):
        if el.select('h1,h2,h3,h4,h5,h6,p,div,section'):
            # A linked card becomes linked headings and paragraphs with the same destination.
            from copy import deepcopy
            fragments=[]
            for child in el.children:
                if isinstance(child,Comment):continue
                if isinstance(child,NavigableString):
                    if child.strip():fragments.append('['+self.escape(str(child),parent_tags)+']('+el['href']+')')
                    continue
                node=deepcopy(child)
                if node.name in {'h1','h2','h3','h4','h5','h6','p'}:
                    anchor=BeautifulSoup('<a></a>','html.parser').a;anchor['href']=el['href']
                    for inner in list(node.contents):anchor.append(inner.extract())
                    node.append(anchor)
                elif not node.select('h1,h2,h3,h4,h5,h6,p,div,section'):
                    value=self.process_tag(node,parent_tags=set()).strip()
                    fragments.append('['+value+']('+el['href']+')\n{: .source-card-label }')
                    continue
                else:
                    for leaf in node.select('h1,h2,h3,h4,h5,h6,p'):
                        anchor=BeautifulSoup('<a></a>','html.parser').a;anchor['href']=el['href']
                        for inner in list(leaf.contents):anchor.append(inner.extract())
                        leaf.append(anchor)
                fragments.append(self.process_tag(node,parent_tags=set()))
            return '\n\n'+'\n\n'.join(fragments)+'\n\n'
        return super().convert_a(el,text,parent_tags)
    def convert_div(self,el,text,parent_tags):
        if not el.select('p,h1,h2,h3,h4,h5,h6,ul,ol,dl,dt,dd,pre,blockquote,table,div,section,article,figure') and el.get_text(strip=True):
            return '\n\n'+text.strip()+self.attributes(el,('source-div-text',))+'\n\n'
        return '\n\n'+text+'\n\n'
    def convert_nav(self,el,text,parent_tags):
        if 'breadcrumbs' in el.get('class',[]):return '\n\n'+text.strip()+'\n{: .source-breadcrumbs }\n\n'
        return '\n\n'+text.strip()+self.attributes(el)+'\n\n'
    def convert_hN(self,n,el,text,parent_tags):
        output=super().convert_hN(n,el,text,parent_tags).rstrip()
        return output+self.attributes(el)+'\n\n'
    def convert_table(self,el,text,parent_tags):
        rows=el.select('tr');out=[]
        for i,row in enumerate(rows):
            cells=row.find_all(['td','th'],recursive=False)
            if any(c.get('rowspan') or c.get('colspan') for c in cells):raise ValueError('Spanned table needs an explicit Markdown representation')
            values=[self.process_tag(c,parent_tags={'table'}).strip().rsplit('|',1)[0].strip().replace('\n',' ') for c in cells]
            values=[re.sub(r'(?<!\\)\|',r'\\|',v) for v in values]
            if i==0 and not row.select('th'):out.append('| '+' | '.join('---' for _ in cells)+' |')
            out.append('| '+' | '.join(values)+' |')
            if i==0 and row.select('th'):out.append('| '+' | '.join('---' for _ in cells)+' |')
        return '\n\n'+'\n'.join(out)+self.attributes(el)+'\n\n'
    def convert_dl(self,el,text,parent_tags):
        lines=[]
        for child in el.find_all(['dt','dd']):
            value=''.join(self.process_tag(n,parent_tags={'dl'}) if not isinstance(n,NavigableString) else self.process_text(n,parent_tags={'dl'}) for n in child.children).strip()
            if child.name=='dt':lines.extend(['',value])
            else:lines.append(': '+value.replace('\n','\n  '))
        return '\n\n'+'\n'.join(lines).strip()+self.attributes(el)+'\n\n'
    def convert_pre(self,el,text,parent_tags):
        value=el.get_text();runs=re.findall(r'~+',value);fence='~'*max([3]+[len(r)+1 for r in runs])
        language=''
        code=el.find('code')
        if code:
            language=next((c[len('language-'):] for c in code.get('class',[]) if c.startswith('language-')),'')
        return '\n\n'+fence+language+'\n'+value.rstrip('\n')+'\n'+fence+'\n\n'
    def convert_figcaption(self,el,text,parent_tags):
        return '\n\n'+text.strip()+self.attributes(el,('image-caption',))+'\n\n'
    def convert_span(self,el,text,parent_tags):
        if 'elementor-post-info__item' in el.get('class',[]):return ' '.join(text.split())
        if 'collection-tag' in el.get('class',[]):return '*'+text.strip()+'*{: .collection-tag }'
        return text
    def convert_time(self,el,text,parent_tags):return '*'+text.strip()+'*{: .source-date }'
    def convert_svg(self,el,text,parent_tags):return ''  # decorative SVG icons have no published text

def clean_main(soup,url):
    main=soup.select_one('main')
    selector='main'
    if main is None:
        candidates=[soup.body] if urlsplit(url).path=='/linux-roadmap/toc.html' else soup.select('body > div.elementor')
        if len(candidates)!=1: raise ValueError('Ambiguous source main content boundary')
        main=candidates[0];selector='body' if urlsplit(url).path=='/linux-roadmap/toc.html' else 'body > div.elementor'
    for x in main.select('script,style'): x.decompose()
    for x in main.select('[href]'): x['href']=urljoin(url,x['href'])
    for x in main.select('[src]'): x['src']=urljoin(url,x['src'])
    return main,selector

def normalized(text): return re.sub(r'\s+',' ',text).strip()
BLOCKS=set('p div section article h1 h2 h3 h4 h5 h6 li ul ol dl dt dd table tr td th nav aside figure blockquote pre br'.split())
def meaningful_text(node):
    if isinstance(node,Comment):return ''
    if isinstance(node,NavigableString):return str(node)
    text=''.join(meaningful_text(child) for child in node.children)
    return ' '+text+' ' if node.name in BLOCKS else text
def text(node):return normalized(meaningful_text(node))
def semantic_dom(soup):
    """Normalize equivalent paragraph containers, never their content or order."""
    soup=BeautifulSoup(str(soup),'html5lib')
    for caption in soup.select('figcaption'):caption.name='p'
    for node in soup.select('div,nav'):
        if node.get_text(strip=True) and not node.select('p,h1,h2,h3,h4,h5,h6,ul,ol,dl,dt,dd,pre,blockquote,table,div,section,article,figure'):
            node.name='p'
    for node in soup.select('li'):
        # Tight and loose Markdown lists represent the same single paragraph.
        if not node.find(['p','ul','ol','dl','pre','blockquote','div','section','article','h1','h2','h3','h4','h5','h6'],recursive=False):
            paragraph=soup.new_tag('p')
            for child in list(node.contents):paragraph.append(child.extract())
            node.append(paragraph)
    return soup

def signature(soup,mappings=None):
    mappings=mappings or {};soup=semantic_dom(soup)
    def original(value):return mappings.get(value,value)
    links=[]
    for x in soup.select('a[href]'):
        href=original(x.get('href'));label=text(x)
        if links and links[-1][0]==href:links[-1]=(href,normalized(links[-1][1]+' '+label))
        else:links.append((href,label))
    return {'text':text(soup),
            'headings':[(x.name,text(x),x.get('id')) for x in soup.select('h1,h2,h3,h4,h5,h6')],
            'paragraphs':[text(x) for x in soup.select('p') if text(x) and 'source-card-label' not in x.get('class',[])],
            'lists':[(x.name,text(x)) for x in soup.select('ul,ol,li')],
            'tables':[(x.name,text(x)) for x in soup.select('table,tr,th,td')],
            'links':links,
            'images':[(original(x.get('src')),x.get('alt','')) for x in soup.select('img')],
            'definitions':[(x.name,text(x)) for x in soup.select('dt,dd')],
            'code_blocks':[x.get_text().rstrip('\n') for x in soup.select('pre')]}

def content_collection(url,soup):
    path=urlsplit(url).path.strip('/');parts=path.split('/')
    if len(parts)==2 and parts[0]=='people':return 'people'
    if len(parts)==2 and parts[0] in {'members','member'} and parts[1] not in {'page','index.html'}:return 'organisations'
    if len(parts)==2 and parts[0]=='events':return 'events'
    if path.startswith('alliance/leadership/working-groups/') and len(parts)==4:return 'groups'
    if path.startswith('build/software-ecosystem/') and len(parts)==3:return 'software'
    if path.startswith('build/platforms/') and len(parts)==3 and parts[-1] not in {'platform-comparison','cheri-products'}:return 'software' if parts[-1]=='simulators' else 'hardware'
    if path.startswith('adopt/assurance-and-adoption/cheri-enabled-products/') and len(parts)==4:return 'hardware'
    if path.startswith('build/developers/') and len(parts)==3:return 'guides'
    if path.startswith('alliance/legal-and-policies/') or 'policy' in parts[-1] or path.startswith(('legal-and-policies/','alliance/about-and-governance/')) and parts[-1] in {'trademark','legal-and-policies'}:return 'policies'
    if len(parts)==2 and parts[0]=='news' and urlsplit(url).hostname=='cheri-alliance.github.io':return 'news'
    if soup.select_one('[data-elementor-type="single-post"]'):return 'news'
    return None

def main():
    parser=argparse.ArgumentParser();parser.add_argument('batch');args=parser.parse_args()
    urls=json.loads(Path(args.batch).read_text()); index=json.loads((ROOT/'reports/capture-index.json').read_text())
    records={r['url']:r for r in index['records']};checks=[]
    decisions=json.loads((ROOT/'reports/layout-decisions.json').read_text()) if (ROOT/'reports/layout-decisions.json').exists() else {}
    assets=json.loads((ROOT/'reports/asset-index.json').read_text()) if (ROOT/'reports/asset-index.json').exists() else {}
    routes=json.loads((ROOT/'reports/route-map.json').read_text()) if (ROOT/'reports/route-map.json').exists() else {}
    downloaded={a['local_path']:a for a in assets.values() if a.get('download_status')=='downloaded'}
    for url in urls:
        if urlsplit(url).query:raise ValueError('Convert the canonical page, not a query alias: '+url)
        record=records[url]; raw=(ROOT/record['snapshot_path']).read_bytes()
        assert hashlib.sha256(raw).hexdigest()==record['sha256'],'Capture checksum changed'
        soup=BeautifulSoup(raw,'html5lib');main_content,selector=clean_main(soup,record['final_url'])
        if main_content.select('form,video,audio'):
            raise ValueError(f'{url}: image/media/form pages need asset/layout pipeline; cannot enter text-only batch')
        source=signature(main_content);source_html=str(main_content);mappings={};image_classes={};inline_images={}
        for el in main_content.select('img[src],a[href]'):
            attr='src' if el.name=='img' else 'href';original=el[attr]
            asset=assets.get(original)
            # Keep declared same-entity repairs when reconverting a source with a 404 image.
            replacement=next((local.lstrip('/') for local,source_url in record.get('asset_mapping',{}).items() if source_url==original),None)
            if replacement in downloaded:asset=downloaded[replacement]
            if el.name=='img' and (not asset or asset.get('download_status')!='downloaded'):
                if not asset or asset.get('http_status')!=404:raise ValueError(f'Missing original image asset: {original}')
                decision=decisions.get(url,{}).get(original)
                if not decision:raise ValueError('Unavailable source image still needs layout evidence: '+original)
                image_classes[original]=decision['class'];inline_images[original]=decision.get('inline',False)
            if asset and asset.get('download_status')=='downloaded':
                local_asset=ROOT/asset['local_path']
                assert hashlib.sha256(local_asset.read_bytes()).hexdigest()==asset['sha256'],'Asset checksum changed'
                el[attr]='/'+asset['local_path'];mappings[el[attr]]=original
                if el.name=='img':
                    decision=decisions.get(url,{}).get(original)
                    if not decision:raise ValueError('Image lacks page-specific browser layout evidence: '+original)
                    image_classes[el[attr]]=decision['class'];inline_images[el[attr]]=decision.get('inline',False)
        markdown=Converter(heading_style='ATX',bullets='-',strong_em_symbol='*',escape_misc=True,autolinks=False,image_classes=image_classes,inline_images=inline_images).convert_soup(main_content)
        markdown=re.sub(r'(\]\()([^\n)]+)(\))',lambda m:m[1]+canonical_url(m[2],routes)+m[3],markdown)
        # Render the Markdown and compare against the immutable source before saving.
        rendered=subprocess.run([str(ROOT/'scripts/ruby.sh'),str(ROOT/'scripts/render.rb')],input=markdown,text=True,capture_output=True,check=True).stdout
        target=json.loads(json.dumps(signature(BeautifulSoup(rendered,'html.parser'),mappings)))
        expected=canonical_signature(source,routes)
        differences={key:{'source':expected[key],'output':target[key]} for key in source if expected[key]!=target[key]}
        host=urlsplit(url).hostname; relative=urlsplit(url).path.strip('/') or 'index'
        collection=content_collection(url,soup)
        previous_local=record.get('local_path')
        local=ROOT/previous_local if previous_local else ((ROOT/('_'+collection)/(relative.split('/')[-1]+'.md')) if collection else ROOT/'pages'/((('reference/' if relative.endswith('.html') else '')+relative)+'.md'))
        if not previous_local and local.exists():
            if host=='cheri-alliance.org':local=local.with_name(local.stem+'-original.md')
            if local.exists():raise ValueError('Distinct source content needs an explicit canonical path: '+str(local))
        local.parent.mkdir(parents=True,exist_ok=True)
        title_node=main_content.select_one('h1') or soup.title
        title=title_node.get_text(' ',strip=True) if title_node else Path(urlsplit(url).path).name
        canonical_collection=local.relative_to(ROOT).parts[0]
        route=record.get('local_route') or ('/'+canonical_collection[1:]+'/'+local.stem+'/' if canonical_collection.startswith('_') else ('/' if relative=='index' else '/'+str(local.relative_to(ROOT/'pages')).removesuffix('.md')+('' if relative.endswith('.html') else '/')))
        fm=document(str(local.relative_to(ROOT)))[0] if local.exists() else {'title':title}
        for key in ('layout','source_url','slug'):fm.pop(key,None)
        if canonical_collection.startswith('_'):fm.pop('permalink',None)
        else:fm['permalink']=route
        if canonical_collection=='_organisations' and urlsplit(url).path.startswith(('/members/','/member/')):fm['member']=True
        if local.stem.endswith('-original'):fm['alternate']=True
        if collection=='people' and 'organization' not in fm:
            registry=collections()['organisations']
            for label in main_content.select('dt'):
                value=label.find_next_sibling('dd')
                if label.get_text(strip=True)=='Organisation' and value:
                    matches=[slug for slug,organisation in registry.items() if organisation['meta'].get('title')==value.get_text(strip=True)]
                    if len(matches)==1:fm['organization']=matches[0]
        if differences:raise ValueError(f'{url}: complete source comparison failed: {list(differences)}')
        local.write_text('---\n'+yaml.safe_dump(fm,sort_keys=False,allow_unicode=True)+'---\n\n'+markdown.strip()+'\n')
        if previous_local and previous_local!=str(local.relative_to(ROOT)):
            (ROOT/previous_local).unlink(missing_ok=True)
        slug=hashlib.sha256(url.encode()).hexdigest()[:16]
        evidence=ROOT/'reports'/'validation'/slug;evidence.mkdir(parents=True,exist_ok=True)
        (evidence/'rendered.html').write_text(rendered)
        (evidence/'source-content.html').write_text(source_html)
        (evidence/'source-signature.json').write_text(json.dumps(source,ensure_ascii=False,indent=2)+'\n')
        (evidence/'comparison.json').write_text(json.dumps({'url':url,'selector':selector,'asset_mapping':mappings,'checks':{k:k not in differences for k in source},'differences':differences},ensure_ascii=False,indent=2)+'\n')
        checks.append({'url':url,'local_path':str(local.relative_to(ROOT)),'main_content_checks':'passed' if not differences else 'failed',
                       'failed_checks':','.join(differences),'source_selector':selector,'evidence_path':str(evidence.relative_to(ROOT)),
                       'verification_status':'unverified','reason':'Reconverted body passed; build, relationship and browser checks must be refreshed',
                       'suspected_source_placeholder':bool(re.search(r'lorem ipsum|placeholder|coming soon|will appear',source['text'],re.I))})
        record.update(asset_mapping=mappings,local_path=str(local.relative_to(ROOT)),local_route=route,conversion_status='converted',verification_status='unverified',
                      reason_if_unresolved=checks[-1]['reason'],main_content_checks=checks[-1]['main_content_checks'])
        print(url,checks[-1]['main_content_checks'],','.join(differences),flush=True)
    changes={url:{**{k:records[url][k] for k in CONVERSION_FIELDS if k in records[url]},'expected_sha256':records[url]['sha256']} for url in urls}
    index=update_conversion(changes)
    validation_path=ROOT/'reports/content-validation.csv'
    previous_checks={r['url']:r for r in csv.DictReader(validation_path.open())} if validation_path.exists() else {}
    previous_checks.update({r['url']:r for r in checks})
    write_csv(validation_path,list(previous_checks.values()),list(checks[0]))
    (ROOT/'sitemap.json').write_text(json.dumps(index['records'],indent=2)+'\n')
    write_csv(ROOT/'reports/url-inventory.csv',index['records'],['source_site','url','canonical_url','title','parent_url','discovered_from','discovery_method','content_type','http_status','fetch_status','conversion_status','verification_status','local_path','reason_if_unresolved'])
    if any(row['main_content_checks']=='failed' for row in checks): raise SystemExit(1)

if __name__=='__main__':main()
