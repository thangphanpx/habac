import { Link, createFileRoute, getRouteApi } from '@tanstack/react-router'
import { ProcessSection } from '../../components/sections'
import { Icon, Intro, Photo, asset, pageHead } from '../../components/site'

export const Route = createFileRoute('/_site/gioi-thieu')({
  head: () => pageHead('Về Ngân Hà', 'Tìm hiểu chuyên môn, phạm vi hoạt động và cách Ngân Hà triển khai công trình môi trường.'),
  component: About,
})

function About() {
  const site = getRouteApi('/_site').useLoaderData()
  return (
    <>
      <Intro title="Về Ngân Hà" text="Kết nối chuyên môn môi trường và năng lực xây dựng trong từng giải pháp xử lý nước." />
      <section className="section">
        <div className="wrap content-split">
          <div className="prose">
            <h2>Chuyên môn từ thực tế</h2>
            <p>{site.company} cung cấp dịch vụ tư vấn, thiết kế, xây dựng, lắp đặt các hệ thống xử lý nước và nước thải, đồng thời cung cấp thiết bị môi trường.</p>
            <p>Theo hồ sơ giới thiệu, Ngân Hà có hơn 15 năm kinh nghiệm, với đội ngũ chuyên gia và kỹ sư trong các lĩnh vực công nghệ môi trường, công nghệ sinh hóa và xây dựng.</p>
            <p>Những giải pháp được giới thiệu bao gồm công nghệ sinh học SBR, MBBR, MBR và các phương án kết hợp hóa lý. Công nghệ cụ thể được lựa chọn theo đặc tính nguồn thải và yêu cầu của từng dự án.</p>
            <h2>Phạm vi hoạt động</h2>
            <ul>
              <li>Tư vấn và hỗ trợ triển khai hồ sơ môi trường.</li>
              <li>Thiết kế, thi công hệ thống xử lý nước cấp và nước thải.</li>
              <li>Cung cấp, lắp đặt thiết bị và hệ thống điều khiển.</li>
              <li>Cải tạo, hiệu chỉnh và hướng dẫn vận hành hệ thống.</li>
            </ul>
            <Link className="text-link" to="/dich-vu">Xem giải pháp &amp; dịch vụ <Icon /></Link>
          </div>
          <figure className="service-detail-image" data-reveal>
            <Photo src={asset('pipework')} alt="Đường ống công nghệ tại công trình" />
            <figcaption>Hình ảnh công trình trong thư viện Ngân Hà.</figcaption>
          </figure>
        </div>
      </section>
      <section className="section services-section">
        <div className="wrap intro-layout">
          <div data-reveal>
            <h2>Vận hành<br />bền vững.</h2>
            <p>Một hệ thống hiệu quả cần phương án phù hợp, thiết bị đồng bộ và người vận hành hiểu rõ công nghệ.</p>
            <p>Ngân Hà làm rõ phạm vi công việc, phối hợp trong thi công và trao đổi các yêu cầu bàn giao từ đầu dự án.</p>
          </div>
          <div className="intro-pictures" data-reveal>
            <Photo src={asset('control')} alt="Tủ điện điều khiển của hệ thống" />
            <Photo src={asset('filtration')} alt="Hệ thống lọc nước thực tế" />
          </div>
        </div>
      </section>
      <ProcessSection />
    </>
  )
}
