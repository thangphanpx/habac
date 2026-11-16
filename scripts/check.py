"""Check generated HTML, local assets and anchors using Python's standard library."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re

ROOT=Path(__file__).resolve().parents[1]
PAGES=list(ROOT.glob('*.html'))+list((ROOT/'dich-vu').glob('*.html'))+list((ROOT/'thiet-bi').glob('*.html'))+list((ROOT/'nganhaec.com').rglob('*.html'))

class Page(HTMLParser):
    def __init__(self,path):
        super().__init__(convert_charrefs=True)
        self.path=path
        self.ids=[]
        self.refs=[]
        self.h1=0
        self.lang=None
        self.images=[]
        self.feed(path.read_text(encoding='utf-8'))
    def handle_starttag(self,tag,items):
        attrs=dict(items)
        if 'id' in attrs:self.ids.append(attrs['id'])
        if tag=='html':self.lang=attrs.get('lang')
        if tag=='h1':self.h1+=1
        if tag in ('a','link','img','script'):
            ref=attrs.get('href' if tag in ('a','link') else 'src')
            if ref:self.refs.append(ref)
        if tag=='img':self.images.append(attrs)

parsed={p.resolve():Page(p) for p in PAGES}
errors=[]
for path,page in parsed.items():
    label=path.relative_to(ROOT)
    if page.lang!='vi':errors.append(f'{label}: missing Vietnamese language')
    if page.h1!=1:errors.append(f'{label}: expected one h1, got {page.h1}')
    if len(page.ids)!=len(set(page.ids)):errors.append(f'{label}: duplicate IDs')
    for image in page.images:
        if 'alt' not in image:errors.append(f'{label}: image missing alt')
    for ref in page.refs:
        url=urlsplit(ref)
        if url.scheme or url.netloc:continue
        target=(path.parent/unquote(url.path)).resolve() if url.path else path
        if not target.is_file():errors.append(f'{label}: missing local target {ref}');continue
        if url.fragment and target in parsed and unquote(url.fragment) not in parsed[target].ids:
            errors.append(f'{label}: missing anchor {ref}')
    content=path.read_text(encoding='utf-8')
    if re.search(r'&(?:ocirc|acirc|agrave|ecirc|iacute|nbsp)(?!;)',content):
        errors.append(f'{label}: malformed Vietnamese entity')
for ref in re.findall(r'url\([\'"]?([^\)\'\"]+)',(ROOT/'assets/styles.css').read_text(encoding='utf-8')):
    if not (ROOT/'assets'/ref).is_file():errors.append(f'CSS: missing {ref}')
if errors:raise SystemExit('\n'.join(errors))
print(f'PASS: {len(PAGES)} HTML pages; all local links, anchors, images and fonts resolve.')
