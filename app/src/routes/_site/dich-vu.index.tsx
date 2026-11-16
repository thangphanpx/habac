import { Link, createFileRoute } from '@tanstack/react-router'
import { FaqSection, ProcessSection } from '../../components/sections'
import { Icon, Intro, Photo, pageHead } from '../../components/site'
import { getServicesFn } from '../../lib/public.functions'

export const Route = createFileRoute('/_site/dich-vu/')({
  loader: () => getServicesFn(),
  head: () => pageHead('Giải pháp & dịch vụ', 'Thiết kế và thi công xử lý nước thải sinh hoạt, công nghiệp; tư vấn hồ sơ môi trường.'),
  component: Services,
})

function Services() {
  const services = Route.useLoaderData()
  return (
    <>
      <Intro title="Giải pháp & dịch vụ" text="Từ đặc tính nguồn thải đến phương án công nghệ. Ngân Hà hỗ trợ doanh nghiệp trong từng giai đoạn triển khai." />
      <section className="section">
        <div className="wrap">
          {services.map(service => (
            <article key={service.id} className="service-row">
              <Photo src={service.image} alt={service.title} />
              <div data-reveal><h3>{service.title}</h3></div>
              <div data-reveal data-delay="70">
                <p>{service.intro}</p>
                <Link className="text-link" to="/dich-vu/$slug" params={{ slug: service.slug }}>Tìm hiểu dịch vụ <Icon /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <ProcessSection />
      <FaqSection />
    </>
  )
}
