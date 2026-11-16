"""Generate the static template and preserve the mirrored site's old HTML routes."""
from pathlib import Path
from html import escape
import json
import os
import shutil

ROOT = Path(__file__).resolve().parents[1]
COMPANY = 'Công ty TNHH Môi trường và Xây dựng Ngân Hà'
ADDRESS = 'Số 15, ngách 27, ngõ 302, đường 416, Kim Sơn, Sơn Tây, Hà Nội'
SERVICES = [
    dict(slug='xu-ly-nuoc-thai-sinh-hoat', title='Nước thải sinh hoạt', subtitle='Thiết kế và thi công', image='plant',
         intro='Giải pháp xử lý nước thải cho khu dân cư, tòa nhà, cơ sở dịch vụ và công trình công cộng.',
         description='Khảo sát nguồn thải, lựa chọn công nghệ và bố trí hệ thống theo mặt bằng thực tế. Đồng hành từ thiết kế đến lắp đặt, chạy thử và hướng dẫn vận hành.',
         scope=['Khảo sát lưu lượng và đặc tính nước thải','Đề xuất công nghệ và phương án bố trí','Thiết kế công nghệ, xây dựng và hệ thống điện','Thi công, lắp đặt thiết bị và đường ống','Chạy thử và hiệu chỉnh hệ thống','Bàn giao tài liệu và hướng dẫn vận hành']),
    dict(slug='xu-ly-nuoc-thai-cong-nghiep', title='Nước thải công nghiệp', subtitle='Thiết kế và thi công', image='hero',
         intro='Thiết kế hệ thống xử lý nước thải phù hợp với quy trình sản xuất và đặc tính nguồn thải của nhà máy.',
         description='Phân tích yêu cầu công nghệ, công suất và điều kiện xây dựng. Kết hợp các công đoạn xử lý phù hợp, chú trọng khả năng vận hành và bảo trì lâu dài.',
         scope=['Khảo sát quy trình sản xuất và nguồn thải','Đánh giá yêu cầu xử lý và công suất','Lựa chọn giải pháp sinh học, hóa lý phù hợp','Thiết kế và thi công các hạng mục xử lý','Lắp đặt thiết bị và tủ điều khiển','Chạy thử, bàn giao và hỗ trợ kỹ thuật']),
    dict(slug='tu-van-ho-so-moi-truong', title='Hồ sơ môi trường', subtitle='Tư vấn và đồng hành', image='consulting',
         intro='Hỗ trợ doanh nghiệp rà soát nhu cầu, chuẩn bị thông tin và triển khai hồ sơ môi trường theo từng dự án.',
         description='Tiếp nhận thông tin về loại hình hoạt động, quy mô và hiện trạng dự án. Làm rõ phạm vi công việc, tài liệu cần chuẩn bị và kế hoạch phối hợp trước khi triển khai.',
         scope=['Tiếp nhận thông tin và rà soát nhu cầu','Tư vấn danh mục tài liệu cần chuẩn bị','Khảo sát thực tế tại cơ sở','Hỗ trợ xây dựng và hoàn thiện hồ sơ','Phối hợp giải trình, bổ sung thông tin','Bàn giao và hướng dẫn quản lý hồ sơ']),
]
PRODUCTS = [
    dict(slug='may-khuay', title='Máy khuấy', use='Khuấy trộn trong bể xử lý', text='Thiết bị khuấy trộn hỗ trợ phân bố dòng chảy và duy trì độ đồng đều trong bể. Lựa chọn theo thể tích bể, đặc tính chất lỏng và yêu cầu công nghệ.', criteria=['Thể tích, hình dạng và chiều sâu bể','Môi chất và yêu cầu khuấy trộn','Vật liệu, công suất và kiểu lắp đặt']),
    dict(slug='bom-dat-can', title='Bơm đặt cạn', use='Bơm chuyển và tuần hoàn', text='Giải pháp bơm lắp đặt ngoài chất lỏng, phục vụ cấp nước, bơm chuyển hoặc tuần hoàn. Cần xác định lưu lượng và cột áp trước khi lựa chọn.', criteria=['Lưu lượng và cột áp làm việc','Đặc tính chất lỏng cần bơm','Điều kiện hút, đẩy và vị trí lắp đặt']),
    dict(slug='may-thoi-khi-long-tech', title='Máy thổi khí Long Tech', use='Cấp khí cho hệ thống xử lý', text='Thiết bị cấp khí cho các công đoạn xử lý nước thải. Ngân Hà tư vấn lựa chọn theo nhu cầu cấp khí và điều kiện vận hành thực tế.', criteria=['Lưu lượng khí và áp suất yêu cầu','Độ sâu bể và tổn thất đường ống','Nguồn điện, độ ồn và chế độ vận hành']),
    dict(slug='may-thoi-khi-shinmaywa', title='Máy thổi khí Shinmaywa', use='Thiết bị cấp khí', text='Tư vấn thiết bị cấp khí Shinmaywa phù hợp với phương án công nghệ. Model và cấu hình được xác nhận trong báo giá cụ thể.', criteria=['Nhu cầu oxy của hệ thống','Phương án bố trí và cấp khí','Model, phụ kiện và chế độ bảo trì']),
    dict(slug='bom-chim-nuoc-thai', title='Bơm chìm nước thải', use='Thu gom và vận chuyển nước thải', text='Thiết bị bơm làm việc ngập trong chất lỏng tại hố thu hoặc bể chứa. Chọn bơm dựa trên lưu lượng, cột áp và đặc tính tạp chất trong nước thải.', criteria=['Lưu lượng và cột áp yêu cầu','Kích thước và tính chất tạp chất','Độ sâu lắp đặt và chế độ điều khiển']),
]
PROJECTS = [
    ('hero','Hệ thống xử lý nước thải','Công trình xử lý và bể công nghệ','water'),
    ('industrial','Trạm xử lý tại nhà máy','Hạ tầng xử lý nước thải công nghiệp','water'),
    ('filtration','Cụm lọc và đường ống','Lắp đặt thiết bị xử lý nước','equipment'),
    ('plant','Bể xử lý nước thải','Hạng mục bể và thiết bị công nghệ','water'),
    ('control','Tủ điện điều khiển','Điều khiển hệ thống tại công trình','equipment'),
    ('installation','Lắp đặt bồn công nghệ','Thi công và lắp đặt tại hiện trường','construction'),
    ('pipework','Đường ống công nghệ','Hệ thống đường ống và phụ kiện','equipment'),
    ('pumps','Cụm máy tại công trình','Bố trí thiết bị phục vụ vận hành','equipment'),
    ('tanks','Cụm bồn xử lý','Lắp đặt các công đoạn xử lý','construction'),
    ('system','Hệ thống lọc nước','Cụm thiết bị và đường ống công nghệ','equipment'),
    ('construction','Thi công bể xử lý','Hạng mục xây dựng tại hiện trường','construction'),
    ('aeration','Vận hành bể công nghệ','Hệ thống tại công trình thực tế','water'),
]

def icon(name='arrow'):
    paths = {'arrow':'<path d="M5 12h14M13 6l6 6-6 6"/>','phone':'<path d="M6 3H3v3c0 8.3 6.7 15 15 15h3v-3l-5-2-2 2a13 13 0 0 1-8-8l2-2-2-5Z"/>','menu':'<path d="M4 7h16M4 12h16M4 17h16"/>','up':'<path d="M12 19V5M6 11l6-6 6 6"/>'}
    paths['email'] = '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>'
    return f'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>'

def render_page(path, title, description, content, active='', canonical=None):
    path = Path(path)
    prefix = os.path.relpath(ROOT, ROOT/path.parent).replace('\\','/')
    def url(target): return f'{prefix}/{target}'
    def photo(name, alt, cls='', eager=False):
        return f'<img src="{url("assets/images/"+name+".webp")}" width="1200" height="900" alt="{escape(alt)}" class="{cls}" loading="{"eager" if eager else "lazy"}" decoding="async"{ " fetchpriority=\"high\"" if eager else ""}>'
    nav = [('dich-vu.html','Giải pháp','services'),('du-an.html','Công trình','projects'),('gioi-thieu.html','Về Ngân Hà','about'),('thiet-bi.html','Thiết bị','equipment')]
    links = ''.join(f'<a href="{url(href)}"'+(' aria-current="page"' if active==key else '')+f'>{label}</a>' for href,label,key in nav)
    header = f'''<a class="skip-link" href="#main">Đến nội dung chính</a>
<header class="site-header"><div class="wrap header-inner"><a class="brand" href="{url('index.html')}" aria-label="Ngân Hà EC, trang chủ"><span class="brand-name">ngân hà<span class="brand-suffix">ec</span></span><span class="brand-description">Môi trường &amp; Xây dựng</span></a><button class="menu-toggle" aria-expanded="false" aria-controls="main-nav">Menu {icon('menu')}</button><nav class="nav" id="main-nav" aria-label="Điều hướng chính">{links}<a class="btn" href="{url('lien-he.html')}"{' aria-current="page"' if active=='contact' else ''}>Cùng trao đổi {icon()}</a></nav></div></header>'''
    footer = f'''<section class="contact-band"><div class="wrap"><div><h2>Bắt đầu một<br>dòng chảy mới.</h2><p>Một cuộc trao đổi hôm nay.<br>Một giải pháp phù hợp cho ngày mai.</p></div><div class="band-actions"><a class="contact-orbit" href="{url('lien-he.html')}" aria-label="Liên hệ tư vấn">{icon()}</a><div><a class="text-link" href="{url('lien-he.html')}">Cùng trao đổi</a><a class="contact-phone" href="tel:0987810694">0987 810 694</a></div></div></div></section>
<footer class="site-footer"><div class="wrap"><div class="footer-grid"><div><strong>{COMPANY}</strong><p>Giải pháp kỹ thuật hôm nay.<br>Giá trị môi trường lâu dài.</p><p class="footer-address">{ADDRESS}</p></div><div><strong>Khám phá</strong><ul><li><a href="{url('gioi-thieu.html')}">Về Ngân Hà</a></li><li><a href="{url('dich-vu.html')}">Giải pháp môi trường</a></li><li><a href="{url('thiet-bi.html')}">Thiết bị xử lý nước</a></li><li><a href="{url('du-an.html')}">Công trình thực tế</a></li></ul></div><div><strong>Luôn sẵn sàng lắng nghe</strong><ul><li><a href="tel:0987810694">0987 810 694</a></li><li><a href="mailto:nganhaec@gmail.com">nganhaec@gmail.com</a></li><li><a href="https://zalo.me/0987810694" target="_blank" rel="noopener noreferrer">Kết nối qua Zalo</a></li></ul></div></div><p class="footer-name">ngân hà.</p><div class="footer-bottom"><p>© Ngân Hà EC</p><p>Ảnh thiên nhiên: <a href="https://unsplash.com/photos/yQJfvo_9eBs" target="_blank" rel="noopener noreferrer">Rod Long / Unsplash</a></p><a href="#top">Về đầu trang {icon('up')}</a></div></div></footer>'''
    footer += f'''<aside class="contact-bubbles" aria-label="Liên hệ nhanh với Ngân Hà"><a class="contact-bubble bubble-email" href="mailto:nganhaec@gmail.com" aria-label="Gửi email đến nganhaec@gmail.com" title="Gửi email">{icon('email')}<span>Email</span></a><a class="contact-bubble bubble-zalo" href="https://zalo.me/0987810694" target="_blank" rel="noopener noreferrer" aria-label="Nhắn Zalo cho Ngân Hà, 0987 810 694" title="Nhắn Zalo"><b aria-hidden="true">Zalo</b><span>Nhắn Zalo</span></a><a class="contact-bubble bubble-phone" href="tel:0987810694" aria-label="Gọi Ngân Hà, 0987 810 694" title="Gọi 0987 810 694">{icon('phone')}<span>Gọi ngay</span></a></aside>'''
    html = f'''<!doctype html>
<html lang="vi" id="top"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)} | Ngân Hà EC</title><meta name="description" content="{escape(description)}"><meta name="theme-color" content="#153c52"><link rel="canonical" href="{url(canonical or path.as_posix())}"><link rel="icon" href="{url('assets/images/logo.png')}"><link rel="preload" href="{url('assets/fonts/hanken-grotesk-variable.ttf')}" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="{url('assets/styles.css')}"><script src="{url('assets/app.js')}" defer></script><noscript><link rel="stylesheet" href="{url('assets/nojs.css')}"></noscript><meta property="og:title" content="{escape(title)} | Ngân Hà EC"><meta property="og:description" content="{escape(description)}"><meta property="og:type" content="website"><meta property="og:locale" content="vi_VN"></head><body>{header}<main id="main">{content(url,photo)}</main>{footer}</body></html>'''
    destination=ROOT/path
    destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_text(html.replace('><', '>\n<')+'\n',encoding='utf-8')

def intro(url, title, text, parent=None):
    extra=f'<a href="{url(parent[0])}">{parent[1]}</a><span aria-hidden="true">/</span>' if parent else ''
    return f'<section class="page-intro"><div class="wrap"><nav class="breadcrumb" aria-label="Đường dẫn"><a href="{url("index.html")}">Trang chủ</a><span aria-hidden="true">/</span>{extra}<span aria-current="page">{title}</span></nav><h1>{title}</h1><p>{text}</p></div></section>'

def service_rows(url, photo):
    return ''.join(f'''<article class="service-row">{photo(s['image'],s['title'])}<div data-reveal><h3>{s['title']}</h3></div><div data-reveal data-delay="70"><p>{s['intro']}</p><a class="text-link" href="{url('dich-vu/'+s['slug']+'.html')}">Tìm hiểu dịch vụ {icon()}</a></div></article>''' for s in SERVICES)

def process(photo):
    stages=[('Khảo sát & lắng nghe','Tiếp nhận nhu cầu, khảo sát hiện trạng và làm rõ các điều kiện kỹ thuật của công trình.'),('Đề xuất & thống nhất','Trình bày phương án công nghệ, phạm vi công việc, tiến độ và chi phí để cùng thống nhất.'),('Triển khai & kiểm soát','Thiết kế, thi công và lắp đặt theo phương án đã duyệt; phối hợp xuyên suốt quá trình thực hiện.'),('Bàn giao & đồng hành','Chạy thử, hướng dẫn vận hành và hỗ trợ kỹ thuật sau khi bàn giao hệ thống.')]
    images=['consulting','pipework','installation','control']
    return '<section class="section process-section"><div class="wrap process-layout"><div data-reveal><h2>Rõ ràng<br>từng bước.</h2><p>Từ lần trao đổi đầu tiên đến khi hệ thống vận hành. Bạn luôn biết công trình đang ở đâu và bước tiếp theo là gì.</p></div><ol class="process-list">'+''.join(f'<li data-reveal data-delay="{i*70}">{photo(images[i],t)}<h3>{t}</h3><p>{p}</p></li>' for i,(t,p) in enumerate(stages))+'</ol></div></section>'

def faqs(photo):
    items=[('Ngân Hà cung cấp những dịch vụ nào?','Ngân Hà thiết kế, thi công hệ thống xử lý nước và nước thải sinh hoạt, công nghiệp; tư vấn hồ sơ môi trường; cung cấp và lắp đặt thiết bị xử lý nước.'),('Cần chuẩn bị gì để được tư vấn?','Bạn có thể cung cấp loại hình công trình, vị trí, lưu lượng dự kiến và nhu cầu xử lý. Nếu đã có bản vẽ hoặc tài liệu hiện trạng, hãy gửi thêm để đội ngũ kỹ thuật trao đổi cụ thể.'),('Chi phí được xác định như thế nào?','Chi phí phụ thuộc vào công suất, đặc tính nguồn thải, công nghệ, mặt bằng và phạm vi công việc. Ngân Hà trao đổi thông tin và khảo sát trước khi đề xuất báo giá.'),('Có hỗ trợ sau khi bàn giao không?','Phạm vi hướng dẫn vận hành, hỗ trợ kỹ thuật và bảo hành được thống nhất trong từng hợp đồng. Hãy trao đổi yêu cầu cụ thể với Ngân Hà trước khi triển khai.')]
    return '<section class="section faq-section"><div class="wrap faq-layout"><div class="faq-copy"><h2 data-reveal>Trước khi<br>bắt đầu.</h2><p>Một vài điều bạn có thể đang quan tâm trước khi trao đổi cùng Ngân Hà.</p><div class="faq-list">'+''.join(f'<details data-reveal><summary>{q}</summary><p>{a}</p></details>' for q,a in items)+'</div></div><figure class="faq-photo" data-reveal>'+photo('pipework','Chi tiết đường ống tại công trình Ngân Hà')+'<figcaption>Chú trọng từng kết nối.<br>Vững vàng cả hệ thống.</figcaption></figure></div></section>'

def home(url,photo):
    controls=''.join(f'<button class="solution-choice" data-solution="{i}" aria-pressed="{"true" if i==0 else "false"}" aria-controls="solution-{i}">{s["title"]}</button>' for i,s in enumerate(SERVICES))
    panels=''.join(f'''<article class="solution-panel" id="solution-{i}"><div class="solution-photo">{photo(s['image'],s['title'])}</div><div class="solution-copy"><h3>{s['title']}</h3><p>{s['description']}</p><ul>{''.join(f'<li>{scope}</li>' for scope in s['scope'][:3])}</ul><a class="btn" href="{url('dich-vu/'+s['slug']+'.html')}">Khám phá giải pháp {icon()}</a></div></article>''' for i,s in enumerate(SERVICES))
    work=[('system','Hệ thống xử lý nước','Thiết bị & công nghệ'),('installation','Lắp đặt tại hiện trường','Thi công & lắp đặt'),('filtration','Cụm lọc và đường ống','Thiết bị xử lý nước')]
    projects=''.join(f'<a class="project-item" href="{url("du-an.html")}" data-reveal><div class="photo">{photo(im,title)}</div><div class="project-caption"><h3>{title}</h3><p>{desc}</p></div></a>' for im,title,desc in work)
    equipment=''.join(f'<a href="{url("thiet-bi/"+p["slug"]+".html")}"><div>{p["title"]}<span>{p["use"]}</span></div><span class="equipment-indicator" aria-hidden="true">↗</span></a>' for p in PRODUCTS)
    return f'''<section class="home-hero"><div class="wrap"><div class="hero-heading"><h1><span>Nguồn nước sạch.</span><span>Giá trị bền lâu.</span></h1><div class="hero-message"><p>Ngân Hà thiết kế, thi công hệ thống xử lý nước và tư vấn môi trường cho doanh nghiệp.</p><a class="btn" href="{url('lien-he.html')}">Trao đổi dự án {icon()}</a></div></div><div class="hero-composition"><figure class="hero-engineering">{photo('installation','Lắp đặt bồn xử lý tại hiện trường',eager=True)}<figcaption>Từ năng lực kỹ thuật</figcaption></figure><figure class="hero-landscape">{photo('river','Dòng nước giữa rừng ngập mặn tại Broome, Australia. Ảnh Rod Long.',eager=True)}</figure></div></div></section>
<section class="section belief-section"><div class="wrap belief-layout"><div class="experience" data-reveal><p class="experience-number">15<span>+</span></p><p>Năm kinh nghiệm<br>trong lĩnh vực môi trường</p><a class="text-link" href="{url('gioi-thieu.html')}">Câu chuyện Ngân Hà {icon()}</a></div><div class="belief-copy"><h2 data-reveal>Kỹ thuật vững.<br>Đồng hành lâu dài.</h2><p class="statement" data-reveal>Hiểu nguồn nước. Hiểu công trình.<br>Để mỗi giải pháp đều có cơ sở.</p><p data-reveal>Ngân Hà kết nối tư vấn môi trường, thiết kế công nghệ và thi công thực tế. Chúng tôi bắt đầu từ điều kiện riêng của từng công trình để xây dựng hệ thống phù hợp, dễ vận hành và thuận tiện bảo trì.</p></div></div></section>
<section class="section solutions-section" id="giai-phap"><div class="wrap"><div class="section-head"><h2 data-reveal>Đúng giải pháp.<br>Đúng nhu cầu.</h2><p data-reveal>Từ nước thải sinh hoạt đến sản xuất công nghiệp. Chọn nhu cầu của bạn để tìm hiểu phạm vi Ngân Hà có thể đồng hành.</p></div><div class="solution-controls" role="group" aria-label="Chọn giải pháp" hidden>{controls}</div><div class="solution-panels" data-reveal>{panels}</div></div></section>
<section class="section work-section"><div class="wrap"><div class="section-head"><h2 data-reveal>Từ bản vẽ<br>đến thực tế.</h2><div data-reveal><p>Công nghệ được kiểm chứng qua từng hạng mục lắp đặt, từng kết nối và từng hệ thống hoàn thiện.</p><a class="text-link" href="{url('du-an.html')}">Thư viện công trình {icon()}</a></div></div><div class="work-grid">{projects}</div><div class="client-strip"><p>Đã đồng hành cùng</p><div><span>Arrow Genetics</span><span>PNG Việt Nam</span><span>Yamani Dynasty</span><span>Bao bì Thiên Hà</span></div></div></div></section>
<section class="section equipment-section"><div class="wrap equipment-layout"><div data-reveal><h2>Hiệu quả từ<br>từng thiết bị.</h2><p>Đúng công suất. Phù hợp công nghệ.<br>Thuận tiện vận hành và bảo trì.</p>{photo('pumps','Cụm thiết bị tại công trình','equipment-photo')}<a class="text-link" href="{url('thiet-bi.html')}">Tìm thiết bị phù hợp {icon()}</a></div><div class="equipment-list" data-reveal>{equipment}</div></div></section>
{process(photo)}{faqs(photo)}'''

def about(url,photo):
    return intro(url,'Về Ngân Hà','Kết nối chuyên môn môi trường và năng lực xây dựng trong từng giải pháp xử lý nước.')+f'''<section class="section"><div class="wrap content-split"><div class="prose"><h2>Chuyên môn từ thực tế</h2><p>{COMPANY} cung cấp dịch vụ tư vấn, thiết kế, xây dựng, lắp đặt các hệ thống xử lý nước và nước thải, đồng thời cung cấp thiết bị môi trường.</p><p>Theo hồ sơ giới thiệu, Ngân Hà có hơn 15 năm kinh nghiệm, với đội ngũ chuyên gia và kỹ sư trong các lĩnh vực công nghệ môi trường, công nghệ sinh hóa và xây dựng.</p><p>Những giải pháp được giới thiệu bao gồm công nghệ sinh học SBR, MBBR, MBR và các phương án kết hợp hóa lý. Công nghệ cụ thể được lựa chọn theo đặc tính nguồn thải và yêu cầu của từng dự án.</p><h2>Phạm vi hoạt động</h2><ul><li>Tư vấn và hỗ trợ triển khai hồ sơ môi trường.</li><li>Thiết kế, thi công hệ thống xử lý nước cấp và nước thải.</li><li>Cung cấp, lắp đặt thiết bị và hệ thống điều khiển.</li><li>Cải tạo, hiệu chỉnh và hướng dẫn vận hành hệ thống.</li></ul><a class="text-link" href="{url('dich-vu.html')}">Xem giải pháp &amp; dịch vụ {icon()}</a></div><figure class="service-detail-image" data-reveal>{photo('pipework','Đường ống công nghệ tại công trình')}<figcaption>Hình ảnh công trình trong thư viện Ngân Hà.</figcaption></figure></div></section>
<section class="section services-section"><div class="wrap intro-layout"><div data-reveal><h2>Vận hành<br>bền vững.</h2><p>Một hệ thống hiệu quả cần phương án phù hợp, thiết bị đồng bộ và người vận hành hiểu rõ công nghệ.</p><p>Ngân Hà làm rõ phạm vi công việc, phối hợp trong thi công và trao đổi các yêu cầu bàn giao từ đầu dự án.</p></div><div class="intro-pictures" data-reveal>{photo('control','Tủ điện điều khiển của hệ thống')}{photo('filtration','Hệ thống lọc nước thực tế')}</div></div></section>{process(photo)}'''

def services_page(url,photo):
    return intro(url,'Giải pháp & dịch vụ','Từ đặc tính nguồn thải đến phương án công nghệ. Ngân Hà hỗ trợ doanh nghiệp trong từng giai đoạn triển khai.')+f'<section class="section"><div class="wrap">{service_rows(url,photo)}</div></section>'+process(photo)+faqs(photo)

def service_detail(service):
    def content(url,photo):
        scope=''.join(f'<li data-reveal>{item}</li>' for item in service['scope'])
        return intro(url,service['title'],service['intro'],('dich-vu.html','Dịch vụ'))+f'''<section class="section"><div class="wrap content-split"><div class="prose"><h2>Phương án theo công trình</h2><p>{service['description']}</p><h2>Phạm vi triển khai</h2><ul class="scope-list">{scope}</ul><h2>Thông tin để bắt đầu</h2><p>Hãy chia sẻ loại hình dự án, vị trí công trình, nhu cầu hiện tại và các tài liệu bạn đã có. Đội ngũ Ngân Hà sẽ trao đổi để làm rõ yêu cầu trước khi đề xuất phương án.</p><a class="btn" href="{url('lien-he.html')}?dich-vu={service['title']}">Liên hệ tư vấn {icon()}</a></div><figure class="service-detail-image" data-reveal>{photo(service['image'],service['title'])}<figcaption>{'Trao đổi và chuẩn bị thông tin hồ sơ.' if service['image']=='consulting' else 'Hình ảnh công trình trong thư viện Ngân Hà.'}</figcaption></figure></div></section>'''+process(photo)
    return content

def equipment_page(url,photo):
    catalog=''.join(f'<article class="catalog-item" data-reveal><h2>{p["title"]}</h2><div><p>{p["text"]}</p><a class="text-link" href="{url("thiet-bi/"+p["slug"]+".html")}">Thông tin thiết bị {icon()}</a></div><a class="btn" href="{url("lien-he.html")}?dich-vu=Thiết bị môi trường">Yêu cầu báo giá</a></article>' for p in PRODUCTS)
    return intro(url,'Thiết bị môi trường','Lựa chọn thiết bị theo yêu cầu công nghệ. Trao đổi trực tiếp để được tư vấn model, cấu hình và báo giá.')+f'<section class="section"><div class="wrap"><div class="catalog">{catalog}</div><p class="catalog-note">Giá, thông số kỹ thuật, xuất xứ, phụ kiện và điều kiện bảo hành được xác nhận trong từng báo giá. Vui lòng gửi yêu cầu công suất và điều kiện lắp đặt để Ngân Hà tư vấn cụ thể.</p></div></section>'

def product_detail(product):
    def content(url,photo):
        return intro(url,product['title'],product['use'],('thiet-bi.html','Thiết bị'))+f'<section class="section"><div class="wrap content-split"><div class="prose"><h2>Thông tin lựa chọn</h2><p>{product["text"]}</p><h2>Yêu cầu kỹ thuật cần có</h2><ul>'+''.join(f'<li>{c}</li>' for c in product['criteria'])+f'''</ul><h2>Tư vấn &amp; báo giá</h2><p>Liên hệ Ngân Hà để xác nhận model, thông số, phụ kiện, thời gian cung cấp và phương án lắp đặt. Cấu hình cụ thể phụ thuộc vào yêu cầu của từng hệ thống.</p><a class="btn" href="{url('lien-he.html')}?dich-vu=Thiết bị môi trường">Yêu cầu báo giá {icon()}</a></div><figure class="service-detail-image" data-reveal>{photo('pumps','Cụm thiết bị lắp đặt tại công trình Ngân Hà')}<figcaption>Cụm thiết bị tại công trình. Liên hệ để nhận hình ảnh và thông số model cần mua.</figcaption></figure></div></section>'''
    return content

def projects_page(url,photo):
    categories={'water':'Hệ thống xử lý','equipment':'Thiết bị & đường ống','construction':'Thi công & lắp đặt'}
    filters='<button class="filter" data-filter="all" aria-pressed="true">Tất cả</button>'+''.join(f'<button class="filter" data-filter="{key}" aria-pressed="false">{value}</button>' for key,value in categories.items())
    gallery=''.join(f'<figure class="gallery-item" data-category="{cat}" data-reveal><a class="gallery-open" href="{url("assets/images/"+im+".webp")}" aria-label="Phóng to: {title}">{photo(im,title)}</a><figcaption>{title}<span>{desc}</span></figcaption></figure>' for im,title,desc,cat in PROJECTS)
    return intro(url,'Thư viện công trình','Hình ảnh hệ thống, thiết bị và hoạt động thi công từ thư viện dự án Ngân Hà.')+f'''<section class="section"><div class="wrap"><div class="filters" hidden role="group" aria-label="Lọc hình ảnh">{filters}</div><p class="filter-status" role="status">{len(PROJECTS)} hình ảnh · Tất cả</p><div class="gallery-grid">{gallery}</div></div></section><dialog class="lightbox" aria-label="Ảnh công trình phóng to"><div class="lightbox-inner"><img class="lightbox-image" alt="" width="1200" height="900"><p class="lightbox-caption" aria-live="polite"></p><div class="lightbox-actions"><button data-prev>Ảnh trước</button><button class="close-dialog" autofocus>Đóng ảnh</button><button data-next>Ảnh tiếp</button></div></div></dialog>'''

def contact_page(url,photo):
    options=''.join(f'<option>{s}</option>' for s in ['Nước thải sinh hoạt','Nước thải công nghiệp','Hồ sơ môi trường','Thiết bị môi trường','Nhu cầu khác'])
    return intro(url,'Bắt đầu từ một trao đổi','Chia sẻ nhu cầu của bạn. Ngân Hà sẽ cùng bạn làm rõ yêu cầu kỹ thuật và hướng triển khai phù hợp.')+f'''<section class="section"><div class="wrap contact-layout"><div><h2>Kết nối với Ngân Hà</h2><dl class="contact-data"><div><dt>Điện thoại tư vấn</dt><dd><a href="tel:0987810694">0987 810 694</a></dd></div><div><dt>Email</dt><dd><a href="mailto:nganhaec@gmail.com">nganhaec@gmail.com</a></dd></div><div><dt>Văn phòng</dt><dd class="address">{ADDRESS}</dd></div></dl><a class="text-link" href="https://www.google.com/maps/search/?api=1&amp;query=15+ngach+27+ngo+302+duong+416+Kim+Son+Son+Tay+Ha+Noi" target="_blank" rel="noopener noreferrer">Tìm đường đến văn phòng {icon()}</a><p><a class="text-link" href="https://zalo.me/0987810694" target="_blank" rel="noopener noreferrer">Trao đổi qua Zalo {icon()}</a></p></div><form class="contact-form" action="mailto:nganhaec@gmail.com" method="post" enctype="text/plain"><h2>Thông tin cần tư vấn</h2><div class="form-grid"><label class="field">Họ và tên *<input name="name" autocomplete="name" required maxlength="100" placeholder="Nguyễn Văn An"></label><label class="field">Số điện thoại *<input name="phone" type="tel" autocomplete="tel" required maxlength="24" placeholder="Số điện thoại liên hệ"></label><label class="field field-full">Email<input name="email" type="email" autocomplete="email" maxlength="160" placeholder="ten@doanhnghiep.vn"></label><label class="field field-full">Bạn đang quan tâm đến<select name="service">{options}</select></label><label class="field field-full">Nội dung trao đổi<textarea name="message" maxlength="2500" placeholder="Loại hình công trình, vị trí, công suất dự kiến hoặc nhu cầu của bạn…"></textarea></label></div><p class="form-note" id="email-note">Form giúp bạn soạn email gửi Ngân Hà qua ứng dụng email trên thiết bị. Thông tin chỉ được gửi khi bạn xác nhận gửi email. Các trường có dấu * là bắt buộc.</p><button class="btn" type="submit" aria-describedby="email-note">Chuẩn bị email tư vấn {icon()}</button><div class="form-result" role="status" tabindex="-1" hidden></div><noscript><p class="form-note">Bạn có thể gọi 0987 810 694 hoặc gửi email trực tiếp đến nganhaec@gmail.com.</p></noscript></form></div></section>'''

def build():
    pages=[('index.html','Giải pháp xử lý nước thải', 'Thiết kế, thi công xử lý nước thải, tư vấn hồ sơ môi trường và thiết bị xử lý nước tại Ngân Hà EC.',home,'home'),('gioi-thieu.html','Về Ngân Hà', 'Tìm hiểu chuyên môn, phạm vi hoạt động và cách Ngân Hà triển khai công trình môi trường.',about,'about'),('dich-vu.html','Giải pháp & dịch vụ','Thiết kế và thi công xử lý nước thải sinh hoạt, công nghiệp; tư vấn hồ sơ môi trường.',services_page,'services'),('thiet-bi.html','Thiết bị môi trường','Máy khuấy, máy thổi khí, bơm đặt cạn và bơm chìm. Tư vấn lựa chọn thiết bị môi trường.',equipment_page,'equipment'),('du-an.html','Thư viện công trình','Hình ảnh công trình, hệ thống và thiết bị thực tế từ thư viện Ngân Hà.',projects_page,'projects'),('lien-he.html','Liên hệ tư vấn','Liên hệ Ngân Hà EC qua số 0987 810 694 hoặc nganhaec@gmail.com.',contact_page,'contact')]
    for s in SERVICES: pages.append(('dich-vu/'+s['slug']+'.html',s['title'],s['intro'],service_detail(s),'services'))
    for p in PRODUCTS: pages.append(('thiet-bi/'+p['slug']+'.html',p['title'],p['text'],product_detail(p),'equipment'))
    for args in pages: render_page(*args)
    old_routes=json.loads((ROOT/'scripts/legacy-routes.json').read_text(encoding='utf-8'))
    route_map={}
    for route in old_routes:
        old=route['path']
        name=Path(old).name
        if name.startswith('gioithieu'): target='gioi-thieu.html'
        elif name.startswith('lienhe'): target='lien-he.html'
        elif name.startswith('thuvienanh'): target='du-an.html'
        elif '/sanpham/' in old: target='thiet-bi/'+name
        elif 'thiet-bi-' in name: target='thiet-bi.html'
        elif 'tu-van-' in name: target='dich-vu/tu-van-ho-so-moi-truong.html'
        elif 'cong-nghiep' in name: target='dich-vu/xu-ly-nuoc-thai-cong-nghiep.html'
        elif 'sinh-hoat' in name: target='dich-vu/xu-ly-nuoc-thai-sinh-hoat.html'
        else: target='dich-vu.html'
        source=next(p for p in pages if p[0]==target)
        render_page(old,*source[1:],canonical=source[0])
        route_map[old]=target
    render_page('nganhaec.com/index.html',*pages[0][1:],canonical='index.html')
    (ROOT/'.taste-skill').mkdir(exist_ok=True)
    (ROOT/'.taste-skill/route-map.json').write_text(json.dumps(route_map,ensure_ascii=False,indent=2),encoding='utf-8')
    output=ROOT/'dist'
    output.mkdir(exist_ok=True)
    for source in [*(ROOT/p[0] for p in pages),*(ROOT/p['path'] for p in old_routes),ROOT/'nganhaec.com/index.html',*(ROOT/'assets').rglob('*')]:
        if not source.is_file():continue
        target=output/source.relative_to(ROOT)
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(source,target)
    print(f'Generated {len(pages)} primary pages and {len(old_routes)+1} compatible legacy pages.')
    print('Clean deployment output: dist/')

if __name__=='__main__': build()
