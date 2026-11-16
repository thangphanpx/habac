import { sql } from './db'

const img = (name: string) => `/assets/images/${name}.webp`

const services = [
  { slug: 'xu-ly-nuoc-thai-sinh-hoat', title: 'Nước thải sinh hoạt', subtitle: 'Thiết kế và thi công', image: img('plant'),
    intro: 'Giải pháp xử lý nước thải cho khu dân cư, tòa nhà, cơ sở dịch vụ và công trình công cộng.',
    description: 'Khảo sát nguồn thải, lựa chọn công nghệ và bố trí hệ thống theo mặt bằng thực tế. Đồng hành từ thiết kế đến lắp đặt, chạy thử và hướng dẫn vận hành.',
    scope: ['Khảo sát lưu lượng và đặc tính nước thải', 'Đề xuất công nghệ và phương án bố trí', 'Thiết kế công nghệ, xây dựng và hệ thống điện', 'Thi công, lắp đặt thiết bị và đường ống', 'Chạy thử và hiệu chỉnh hệ thống', 'Bàn giao tài liệu và hướng dẫn vận hành'] },
  { slug: 'xu-ly-nuoc-thai-cong-nghiep', title: 'Nước thải công nghiệp', subtitle: 'Thiết kế và thi công', image: img('hero'),
    intro: 'Thiết kế hệ thống xử lý nước thải phù hợp với quy trình sản xuất và đặc tính nguồn thải của nhà máy.',
    description: 'Phân tích yêu cầu công nghệ, công suất và điều kiện xây dựng. Kết hợp các công đoạn xử lý phù hợp, chú trọng khả năng vận hành và bảo trì lâu dài.',
    scope: ['Khảo sát quy trình sản xuất và nguồn thải', 'Đánh giá yêu cầu xử lý và công suất', 'Lựa chọn giải pháp sinh học, hóa lý phù hợp', 'Thiết kế và thi công các hạng mục xử lý', 'Lắp đặt thiết bị và tủ điều khiển', 'Chạy thử, bàn giao và hỗ trợ kỹ thuật'] },
  { slug: 'tu-van-ho-so-moi-truong', title: 'Hồ sơ môi trường', subtitle: 'Tư vấn và đồng hành', image: img('consulting'),
    intro: 'Hỗ trợ doanh nghiệp rà soát nhu cầu, chuẩn bị thông tin và triển khai hồ sơ môi trường theo từng dự án.',
    description: 'Tiếp nhận thông tin về loại hình hoạt động, quy mô và hiện trạng dự án. Làm rõ phạm vi công việc, tài liệu cần chuẩn bị và kế hoạch phối hợp trước khi triển khai.',
    scope: ['Tiếp nhận thông tin và rà soát nhu cầu', 'Tư vấn danh mục tài liệu cần chuẩn bị', 'Khảo sát thực tế tại cơ sở', 'Hỗ trợ xây dựng và hoàn thiện hồ sơ', 'Phối hợp giải trình, bổ sung thông tin', 'Bàn giao và hướng dẫn quản lý hồ sơ'] },
]

const products = [
  { slug: 'may-khuay', title: 'Máy khuấy', use_text: 'Khuấy trộn trong bể xử lý', body: 'Thiết bị khuấy trộn hỗ trợ phân bố dòng chảy và duy trì độ đồng đều trong bể. Lựa chọn theo thể tích bể, đặc tính chất lỏng và yêu cầu công nghệ.', criteria: ['Thể tích, hình dạng và chiều sâu bể', 'Môi chất và yêu cầu khuấy trộn', 'Vật liệu, công suất và kiểu lắp đặt'] },
  { slug: 'bom-dat-can', title: 'Bơm đặt cạn', use_text: 'Bơm chuyển và tuần hoàn', body: 'Giải pháp bơm lắp đặt ngoài chất lỏng, phục vụ cấp nước, bơm chuyển hoặc tuần hoàn. Cần xác định lưu lượng và cột áp trước khi lựa chọn.', criteria: ['Lưu lượng và cột áp làm việc', 'Đặc tính chất lỏng cần bơm', 'Điều kiện hút, đẩy và vị trí lắp đặt'] },
  { slug: 'may-thoi-khi-long-tech', title: 'Máy thổi khí Long Tech', use_text: 'Cấp khí cho hệ thống xử lý', body: 'Thiết bị cấp khí cho các công đoạn xử lý nước thải. Ngân Hà tư vấn lựa chọn theo nhu cầu cấp khí và điều kiện vận hành thực tế.', criteria: ['Lưu lượng khí và áp suất yêu cầu', 'Độ sâu bể và tổn thất đường ống', 'Nguồn điện, độ ồn và chế độ vận hành'] },
  { slug: 'may-thoi-khi-shinmaywa', title: 'Máy thổi khí Shinmaywa', use_text: 'Thiết bị cấp khí', body: 'Tư vấn thiết bị cấp khí Shinmaywa phù hợp với phương án công nghệ. Model và cấu hình được xác nhận trong báo giá cụ thể.', criteria: ['Nhu cầu oxy của hệ thống', 'Phương án bố trí và cấp khí', 'Model, phụ kiện và chế độ bảo trì'] },
  { slug: 'bom-chim-nuoc-thai', title: 'Bơm chìm nước thải', use_text: 'Thu gom và vận chuyển nước thải', body: 'Thiết bị bơm làm việc ngập trong chất lỏng tại hố thu hoặc bể chứa. Chọn bơm dựa trên lưu lượng, cột áp và đặc tính tạp chất trong nước thải.', criteria: ['Lưu lượng và cột áp yêu cầu', 'Kích thước và tính chất tạp chất', 'Độ sâu lắp đặt và chế độ điều khiển'] },
]

const projects = [
  ['hero', 'Hệ thống xử lý nước thải', 'Công trình xử lý và bể công nghệ', 'water'],
  ['industrial', 'Trạm xử lý tại nhà máy', 'Hạ tầng xử lý nước thải công nghiệp', 'water'],
  ['filtration', 'Cụm lọc và đường ống', 'Lắp đặt thiết bị xử lý nước', 'equipment'],
  ['plant', 'Bể xử lý nước thải', 'Hạng mục bể và thiết bị công nghệ', 'water'],
  ['control', 'Tủ điện điều khiển', 'Điều khiển hệ thống tại công trình', 'equipment'],
  ['installation', 'Lắp đặt bồn công nghệ', 'Thi công và lắp đặt tại hiện trường', 'construction'],
  ['pipework', 'Đường ống công nghệ', 'Hệ thống đường ống và phụ kiện', 'equipment'],
  ['pumps', 'Cụm máy tại công trình', 'Bố trí thiết bị phục vụ vận hành', 'equipment'],
  ['tanks', 'Cụm bồn xử lý', 'Lắp đặt các công đoạn xử lý', 'construction'],
  ['system', 'Hệ thống lọc nước', 'Cụm thiết bị và đường ống công nghệ', 'equipment'],
  ['construction', 'Thi công bể xử lý', 'Hạng mục xây dựng tại hiện trường', 'construction'],
  ['aeration', 'Vận hành bể công nghệ', 'Hệ thống tại công trình thực tế', 'water'],
]

const settings = {
  company: 'Công ty TNHH Môi trường và Xây dựng Ngân Hà',
  address: 'Số 15, ngách 27, ngõ 302, đường 416, Kim Sơn, Sơn Tây, Hà Nội',
  phone: '0987 810 694',
  email: 'nganhaec@gmail.com',
}

await Promise.all(Object.entries(settings).map(([key, value]) =>
  sql`insert into settings (key, value) values (${key}, ${value}) on conflict do nothing`))

const isEmpty = async (table: string) => (await sql`select 1 from ${sql(table)} limit 1`).length === 0
const insertAll = (table: string, rows: object[]) =>
  Promise.all(rows.map((row, position) => sql`insert into ${sql(table)} ${sql({ ...row, position })}`))

if (await isEmpty('services')) await insertAll('services', services)
if (await isEmpty('products')) await insertAll('products', products.map(p => ({ ...p, image: img('pumps') })))
if (await isEmpty('projects')) {
  await insertAll('projects', projects.map(([image, title, description, category]) => ({ title, description, category, image: img(image) })))
}

if (await isEmpty('users')) {
  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env
  if (!email || !password || password.length < 10) throw new Error('Cần ADMIN_EMAIL và ADMIN_PASSWORD (>= 10 ký tự) trong .env để tạo quản trị viên đầu tiên')
  const password_hash = await Bun.password.hash(password)
  await sql`insert into users ${sql({ email: email.toLowerCase(), name: 'Quản trị viên', password_hash, role: 'admin' })}`
  console.log(`Đã tạo quản trị viên ${email}`)
}
console.log('Seed xong.')
await sql.close()
