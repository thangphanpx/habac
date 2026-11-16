import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { ProcessSection } from '../../components/sections'
import { Icon, Intro, Photo, pageHead } from '../../components/site'
import { getServiceFn } from '../../lib/public.functions'

export const Route = createFileRoute('/_site/dich-vu/$slug')({
  // URL cũ dạng /dich-vu/ten.html -> URL sạch
  beforeLoad: ({ params }) => {
    if (params.slug.endsWith('.html')) throw redirect({ href: `/dich-vu/${params.slug.slice(0, -'.html'.length)}`, statusCode: 301 })
  },
  loader: ({ params }) => getServiceFn({ data: params.slug }),
  head: ({ loaderData }) => pageHead(loaderData?.title ?? 'Dịch vụ', loaderData?.intro ?? ''),
  component: ServiceDetail,
})

function ServiceDetail() {
  const service = Route.useLoaderData()
  return (
    <>
      <Intro title={service.title} text={service.intro} parent={<Link to="/dich-vu">Dịch vụ</Link>} />
      <section className="section">
        <div className="wrap content-split">
          <div className="prose">
            <h2>Phương án theo công trình</h2>
            <p>{service.description}</p>
            <h2>Phạm vi triển khai</h2>
            <ul className="scope-list">{service.scope.map(item => <li key={item} data-reveal>{item}</li>)}</ul>
            <h2>Thông tin để bắt đầu</h2>
            <p>Hãy chia sẻ loại hình dự án, vị trí công trình, nhu cầu hiện tại và các tài liệu bạn đã có. Đội ngũ Ngân Hà sẽ trao đổi để làm rõ yêu cầu trước khi đề xuất phương án.</p>
            <Link className="btn" to="/lien-he" search={{ 'dich-vu': service.title }}>Liên hệ tư vấn <Icon /></Link>
          </div>
          <figure className="service-detail-image" data-reveal>
            <Photo src={service.image} alt={service.title} />
            <figcaption>Hình ảnh trong thư viện Ngân Hà.</figcaption>
          </figure>
        </div>
      </section>
      <ProcessSection />
    </>
  )
}
