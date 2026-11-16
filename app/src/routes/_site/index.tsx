import { useState, type KeyboardEvent } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { FaqSection, ProcessSection } from '../../components/sections'
import { Icon, Photo, asset, pageHead } from '../../components/site'
import { getHomeFn } from '../../lib/public.functions'

export const Route = createFileRoute('/_site/')({
  loader: () => getHomeFn(),
  head: () => pageHead('Giải pháp xử lý nước thải', 'Thiết kế, thi công xử lý nước thải, tư vấn hồ sơ môi trường và thiết bị xử lý nước tại Ngân Hà EC.'),
  component: Home,
})

const SOLUTION_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End']

function nextSolution(key: string, index: number, count: number) {
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  return (index + (key === 'ArrowRight' ? 1 : -1) + count) % count
}

function Home() {
  const { services, products, projects } = Route.useLoaderData()
  const [active, setActive] = useState(0)

  const onSolutionKey = (event: KeyboardEvent, index: number) => {
    if (!SOLUTION_KEYS.includes(event.key)) return
    event.preventDefault()
    const next = nextSolution(event.key, index, services.length)
    document.getElementById(`solution-choice-${next}`)?.focus()
    setActive(next)
  }

  return (
    <>
      <section className="home-hero">
        <div className="hero-landscape">
          <Photo src={asset('river')} alt="Dòng nước uốn quanh rừng ngập mặn tại Broome, Australia. Ảnh Rod Long." eager />
        </div>
        <div className="wrap hero-content">
          <h1>Vì dòng chảy<br />xanh.</h1>
          <div className="hero-message">
            <p>Giải pháp xử lý nước và môi trường.<br />Vững kỹ thuật. Bền tương lai.</p>
            <Link className="btn btn-lime" to="/lien-he">Cùng trao đổi <Icon /></Link>
          </div>
        </div>
        <a className="hero-discover" href="#giai-phap" aria-label="Khám phá giải pháp">Khám phá giải pháp <span aria-hidden="true">↓</span></a>
      </section>

      <section className="section belief-section">
        <div className="wrap belief-layout">
          <div className="experience" data-reveal>
            <p className="experience-number">15<span>+</span></p>
            <p>Năm kinh nghiệm<br />trong lĩnh vực môi trường</p>
            <Link className="text-link" to="/gioi-thieu">Câu chuyện Ngân Hà <Icon /></Link>
          </div>
          <div className="belief-copy">
            <h2 data-reveal>Kỹ thuật vững.<br />Đồng hành lâu dài.</h2>
            <p className="statement" data-reveal>Hiểu nguồn nước. Hiểu công trình.<br />Để mỗi giải pháp đều có cơ sở.</p>
            <p data-reveal>Ngân Hà kết nối tư vấn môi trường, thiết kế công nghệ và thi công thực tế. Chúng tôi bắt đầu từ điều kiện riêng của từng công trình để xây dựng hệ thống phù hợp, dễ vận hành và thuận tiện bảo trì.</p>
          </div>
        </div>
      </section>

      <section className="section solutions-section" id="giai-phap">
        <div className="wrap">
          <div className="section-head">
            <h2 data-reveal>Đúng giải pháp.<br />Đúng nhu cầu.</h2>
            <p data-reveal>Từ nước thải sinh hoạt đến sản xuất công nghiệp. Chọn nhu cầu của bạn để tìm hiểu phạm vi Ngân Hà có thể đồng hành.</p>
          </div>
          <div className="solution-controls" role="group" aria-label="Chọn giải pháp">
            {services.map((service, index) => (
              <button key={service.id} id={`solution-choice-${index}`} className="solution-choice" aria-pressed={index === active} aria-controls={`solution-${index}`}
                onClick={() => setActive(index)} onKeyDown={event => onSolutionKey(event, index)}>
                {service.title}
              </button>
            ))}
          </div>
          <div className="solution-panels solutions-ready" data-reveal>
            {services.map((service, index) => (
              <article key={service.id} className="solution-panel" id={`solution-${index}`} hidden={index !== active}>
                <div className="solution-photo"><Photo src={service.image} alt={service.title} /></div>
                <div className="solution-copy">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <ul>{service.scope.slice(0, 3).map(item => <li key={item}>{item}</li>)}</ul>
                  <Link className="btn" to="/dich-vu/$slug" params={{ slug: service.slug }}>Khám phá giải pháp <Icon /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section work-section">
        <div className="wrap">
          <div className="section-head">
            <h2 data-reveal>Từ bản vẽ<br />đến thực tế.</h2>
            <div data-reveal>
              <p>Công nghệ được kiểm chứng qua từng hạng mục lắp đặt, từng kết nối và từng hệ thống hoàn thiện.</p>
              <Link className="text-link" to="/du-an">Thư viện công trình <Icon /></Link>
            </div>
          </div>
          <div className="work-grid">
            {projects.map(project => (
              <Link key={project.id} className="project-item" to="/du-an" data-reveal>
                <div className="photo"><Photo src={project.image} alt={project.title} /></div>
                <div className="project-caption"><h3>{project.title}</h3><p>{project.description}</p></div>
              </Link>
            ))}
          </div>
          <div className="client-strip" aria-labelledby="clients-title" data-reveal>
            <h3 id="clients-title">Đã đồng hành cùng</h3>
            <ul className="client-list" aria-label="Các đơn vị đã đồng hành">
              <li>Arrow Genetics</li><li>PNG Việt Nam</li><li>Yamani Dynasty</li><li>Bao bì Thiên Hà</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section equipment-section">
        <div className="wrap equipment-layout">
          <div data-reveal>
            <h2>Hiệu quả từ<br />từng thiết bị.</h2>
            <p>Đúng công suất. Phù hợp công nghệ.<br />Thuận tiện vận hành và bảo trì.</p>
            <Photo src={asset('pumps')} alt="Cụm thiết bị tại công trình" className="equipment-photo" />
            <Link className="text-link" to="/thiet-bi">Tìm thiết bị phù hợp <Icon /></Link>
          </div>
          <div className="equipment-list" data-reveal>
            {products.map(product => (
              <Link key={product.id} to="/thiet-bi/$slug" params={{ slug: product.slug }}>
                <div>{product.title}<span>{product.use_text}</span></div>
                <span className="equipment-indicator" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ProcessSection />
      <FaqSection />
    </>
  )
}
