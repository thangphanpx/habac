import { Photo, asset } from './site'

const STAGES = [
  { title: 'Khảo sát & lắng nghe', text: 'Tiếp nhận nhu cầu, khảo sát hiện trạng và làm rõ các điều kiện kỹ thuật của công trình.', image: 'consulting' },
  { title: 'Đề xuất & thống nhất', text: 'Trình bày phương án công nghệ, phạm vi công việc, tiến độ và chi phí để cùng thống nhất.', image: 'pipework' },
  { title: 'Triển khai & kiểm soát', text: 'Thiết kế, thi công và lắp đặt theo phương án đã duyệt; phối hợp xuyên suốt quá trình thực hiện.', image: 'installation' },
  { title: 'Bàn giao & đồng hành', text: 'Chạy thử, hướng dẫn vận hành và hỗ trợ kỹ thuật sau khi bàn giao hệ thống.', image: 'control' },
]

const FAQS = [
  { question: 'Ngân Hà cung cấp những dịch vụ nào?', answer: 'Ngân Hà thiết kế, thi công hệ thống xử lý nước và nước thải sinh hoạt, công nghiệp; tư vấn hồ sơ môi trường; cung cấp và lắp đặt thiết bị xử lý nước.' },
  { question: 'Cần chuẩn bị gì để được tư vấn?', answer: 'Bạn có thể cung cấp loại hình công trình, vị trí, lưu lượng dự kiến và nhu cầu xử lý. Nếu đã có bản vẽ hoặc tài liệu hiện trạng, hãy gửi thêm để đội ngũ kỹ thuật trao đổi cụ thể.' },
  { question: 'Chi phí được xác định như thế nào?', answer: 'Chi phí phụ thuộc vào công suất, đặc tính nguồn thải, công nghệ, mặt bằng và phạm vi công việc. Ngân Hà trao đổi thông tin và khảo sát trước khi đề xuất báo giá.' },
  { question: 'Có hỗ trợ sau khi bàn giao không?', answer: 'Phạm vi hướng dẫn vận hành, hỗ trợ kỹ thuật và bảo hành được thống nhất trong từng hợp đồng. Hãy trao đổi yêu cầu cụ thể với Ngân Hà trước khi triển khai.' },
]

export function ProcessSection() {
  return (
    <section className="section process-section">
      <div className="wrap process-layout">
        <div data-reveal>
          <h2>Rõ ràng<br />từng bước.</h2>
          <p>Từ lần trao đổi đầu tiên đến khi hệ thống vận hành. Bạn luôn biết công trình đang ở đâu và bước tiếp theo là gì.</p>
        </div>
        <ol className="process-list">
          {STAGES.map((stage, index) => (
            <li key={stage.title} data-reveal data-delay={index * 70}>
              <Photo src={asset(stage.image)} alt={stage.title} />
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function FaqSection() {
  return (
    <section className="section faq-section">
      <div className="wrap faq-layout">
        <div className="faq-copy">
          <h2 data-reveal>Trước khi<br />bắt đầu.</h2>
          <p>Một vài điều bạn có thể đang quan tâm trước khi trao đổi cùng Ngân Hà.</p>
          <div className="faq-list">
            {FAQS.map(item => (
              <details key={item.question} data-reveal>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
        <figure className="faq-photo" data-reveal>
          <Photo src={asset('pipework')} alt="Chi tiết đường ống tại công trình Ngân Hà" />
          <figcaption>Chú trọng từng kết nối.<br />Vững vàng cả hệ thống.</figcaption>
        </figure>
      </div>
    </section>
  )
}
