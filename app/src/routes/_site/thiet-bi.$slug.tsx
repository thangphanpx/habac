import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { Icon, Intro, Photo, pageHead } from '../../components/site'
import { getProductFn } from '../../lib/public.functions'

export const Route = createFileRoute('/_site/thiet-bi/$slug')({
  // URL cũ dạng /thiet-bi/ten.html -> URL sạch
  beforeLoad: ({ params }) => {
    if (params.slug.endsWith('.html')) throw redirect({ href: `/thiet-bi/${params.slug.slice(0, -'.html'.length)}`, statusCode: 301 })
  },
  loader: ({ params }) => getProductFn({ data: params.slug }),
  head: ({ loaderData }) => pageHead(loaderData?.title ?? 'Thiết bị', loaderData?.body ?? ''),
  component: ProductDetail,
})

function ProductDetail() {
  const product = Route.useLoaderData()
  return (
    <>
      <Intro title={product.title} text={product.use_text} parent={<Link to="/thiet-bi">Thiết bị</Link>} />
      <section className="section">
        <div className="wrap content-split">
          <div className="prose">
            <h2>Thông tin lựa chọn</h2>
            <p>{product.body}</p>
            <h2>Yêu cầu kỹ thuật cần có</h2>
            <ul>{product.criteria.map(item => <li key={item}>{item}</li>)}</ul>
            <h2>Tư vấn &amp; báo giá</h2>
            <p>Liên hệ Ngân Hà để xác nhận model, thông số, phụ kiện, thời gian cung cấp và phương án lắp đặt. Cấu hình cụ thể phụ thuộc vào yêu cầu của từng hệ thống.</p>
            <Link className="btn" to="/lien-he" search={{ 'dich-vu': 'Thiết bị môi trường' }}>Yêu cầu báo giá <Icon /></Link>
          </div>
          <figure className="service-detail-image" data-reveal>
            <Photo src={product.image} alt={product.title} />
            <figcaption>Liên hệ để nhận hình ảnh và thông số model cần mua.</figcaption>
          </figure>
        </div>
      </section>
    </>
  )
}
