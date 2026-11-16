import { Link, createFileRoute } from '@tanstack/react-router'
import { Icon, Intro, pageHead } from '../../components/site'
import { getProductsFn } from '../../lib/public.functions'

export const Route = createFileRoute('/_site/thiet-bi/')({
  loader: () => getProductsFn(),
  head: () => pageHead('Thiết bị môi trường', 'Máy khuấy, máy thổi khí, bơm đặt cạn và bơm chìm. Tư vấn lựa chọn thiết bị môi trường.'),
  component: Equipment,
})

function Equipment() {
  const products = Route.useLoaderData()
  return (
    <>
      <Intro title="Thiết bị môi trường" text="Lựa chọn thiết bị theo yêu cầu công nghệ. Trao đổi trực tiếp để được tư vấn model, cấu hình và báo giá." />
      <section className="section">
        <div className="wrap">
          <div className="catalog">
            {products.map(product => (
              <article key={product.id} className="catalog-item" data-reveal>
                <h2>{product.title}</h2>
                <div>
                  <p>{product.body}</p>
                  <Link className="text-link" to="/thiet-bi/$slug" params={{ slug: product.slug }}>Thông tin thiết bị <Icon /></Link>
                </div>
                <Link className="btn" to="/lien-he" search={{ 'dich-vu': 'Thiết bị môi trường' }}>Yêu cầu báo giá</Link>
              </article>
            ))}
          </div>
          <p className="catalog-note">Giá, thông số kỹ thuật, xuất xứ, phụ kiện và điều kiện bảo hành được xác nhận trong từng báo giá. Vui lòng gửi yêu cầu công suất và điều kiện lắp đặt để Ngân Hà tư vấn cụ thể.</p>
        </div>
      </section>
    </>
  )
}
