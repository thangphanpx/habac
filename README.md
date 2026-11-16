# Ngân Hà EC — HTML / CSS / JavaScript template

Website doanh nghiệp môi trường, dùng HTML/CSS/JS thuần. Không cần npm, framework hoặc CDN. Font và hình ảnh nằm trong project; mở trực tiếp `index.html` cũng hoạt động.

## Xem website

Mở `index.html`, hoặc chạy:

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Truy cập **http://127.0.0.1:8080/**.

## Cấu trúc

- `index.html`: trang chủ.
- `gioi-thieu.html`: giới thiệu doanh nghiệp.
- `dich-vu.html`, `dich-vu/*.html`: danh mục và ba trang dịch vụ.
- `thiet-bi.html`, `thiet-bi/*.html`: danh mục và năm trang thiết bị.
- `du-an.html`: thư viện 12 ảnh, lọc danh mục và phóng to ảnh.
- `lien-he.html`: liên hệ và chuẩn bị email tư vấn.
- `assets/styles.css`: thiết kế, responsive và trạng thái tương tác.
- `assets/app.js`: menu, bộ lọc, lightbox, kiểm tra form và hiệu ứng.
- `assets/nojs.css`: điều hướng khi JavaScript bị tắt.
- `assets/fonts/`: Hanken Grotesk, kèm giấy phép OFL.
- `assets/images/`: hình ảnh WebP và logo từ dữ liệu có sẵn.
- `scripts/build.py`: nội dung và template dùng chung để tạo lại toàn bộ HTML.
- `scripts/legacy-routes.json`: danh sách đường dẫn cũ cần giữ tương thích.
- `scripts/check.py`: kiểm tra link, anchor, hình ảnh, font và cấu trúc HTML.
- `dist/`: **bản website sạch để bàn giao hoặc đưa lên hosting**. Không chứa thư viện cũ, cache HTTrack hay file thiết kế gốc.

Có 14 trang chính và 39 trang tương thích đường dẫn cũ. Các trang cũ dùng cùng nội dung và giao diện mới, không chuyển hướng bằng JavaScript.

## Chỉnh sửa

Có thể chỉnh HTML, CSS và JS trực tiếp trong `dist/` rồi sử dụng ngay.

Để quản lý nội dung dùng chung, chỉnh `scripts/build.py` và `assets/`, sau đó chạy:

```powershell
python scripts/build.py
python scripts/check.py
node --check assets/app.js
```

Lệnh build tạo lại HTML ở thư mục gốc và cập nhật `dist/`. Những chỉnh sửa trực tiếp trên HTML sẽ được thay bằng nội dung từ template khi build lại. Python chỉ phục vụ tạo file; website chạy hoàn toàn tĩnh.

## Hoạt động của form

Nút liên hệ nhanh luôn hiện trên mọi trang dưới dạng ba bong bóng tròn bên phải: gọi **0987 810 694**, nhắn **Zalo**, gửi **nganhaec@gmail.com**. Trên desktop cố định góc dưới và xếp dọc; trên điện thoại xếp ngang trong hàng riêng dưới header để không che nội dung. Chạm/bấm để mở kênh liên hệ. Không có chức năng kéo thả; các liên kết hoạt động cả khi tắt JavaScript.

Form kiểm tra tên, điện thoại và định dạng email. Khi hợp lệ, form tạo liên kết mở ứng dụng email với nội dung đã điền. **Chưa có backend nhận thông tin**; yêu cầu chỉ được gửi sau khi người dùng bấm gửi trong ứng dụng email. Có nút gọi điện, liên kết email và Zalo để liên hệ trực tiếp. Dữ liệu form không được lưu vào trình duyệt.

## Thiết kế và nội dung

Phần mở đầu đã trở lại bản **“Vì dòng chảy xanh”** với ảnh thiên nhiên phủ rộng, chữ trắng và nút xanh non. Các phần tiếp theo dùng nền trắng lạnh, xanh mực và sắc bạc hà; font Hanken Grotesk lưu cục bộ. Các phần công trình, thiết bị, quy trình và FAQ có bố cục riêng; footer mở bằng wordmark lớn. Mục “Đã đồng hành cùng” nằm trong một dải nền riêng, bốn cột đều trên desktop và hai cột trên tablet/mobile. Thiết kế được xây dựng độc lập với website cũ và dự án phòng khám.

Trang chủ có cụm chọn giải pháp tương tác, cập nhật hình ảnh, phạm vi công việc và liên kết đến trang chi tiết. Có thể dùng chuột, cảm ứng hoặc phím mũi tên/Home/End. Khi tắt JavaScript, cả ba giải pháp vẫn hiện đầy đủ.

Ảnh mở đầu: **Rod Long**, dòng nước giữa rừng ngập mặn tại Broome, Australia, theo [Unsplash License](https://unsplash.com/license). Đây là ảnh thiên nhiên tạo bối cảnh môi trường; nguồn ảnh hiển thị ở footer và trong `assets/images/CREDITS.md`. Hình ảnh công trình lấy từ bản website trong project, tối ưu thành WebP. Ảnh tư vấn là ảnh minh họa đã có trong website cũ.

Nguồn cũ có tên pháp nhân không thống nhất: tiêu đề ghi “Công ty TNHH Môi trường và Xây dựng Ngân Hà”, một số đoạn giới thiệu ghi “Công ty Cổ phần Phát triển Ngân Hà”. Template dùng tên trong tiêu đề. Cần xác nhận lại tên pháp nhân, địa chỉ và thông tin kinh nghiệm khi đưa vào vận hành thực tế.

Ảnh chứng nhận và ảnh sản phẩm trong bản sao cũ bị thiếu; cache cũng không có dữ liệu ảnh. Template không hiển thị chứng nhận hỏng, không tự tạo giấy chứng nhận, thông số hoặc giá sản phẩm. Giữ đủ năm nhóm thiết bị; các trang thiết bị hướng dẫn thông tin cần cung cấp để được báo giá. Nên bổ sung ảnh đúng model và bản chứng nhận hiện hành khi có tài liệu gốc.

## Kiểm tra

Báo cáo thiết kế và ảnh trước/sau nằm trong `.taste-skill/`. Bản HTML trước khi chỉnh sửa được lưu tại `.taste-skill/original/legacy-html.zip`.

Không có video công trình trong dữ liệu nguồn; sử dụng ảnh và chuyển động phóng nhẹ trên ảnh thiên nhiên. Hiệu ứng tự tắt với `prefers-reduced-motion`. Bộ lọc ảnh và lightbox hỗ trợ bàn phím; thư viện ảnh vẫn mở được ảnh gốc khi tắt JavaScript.

Kiểm tra bản mới: 14 trang ở 5 kích thước (320, 390, 768, 1024, 1440px), link/ảnh/font của 53 trang, menu, bộ chọn giải pháp, gallery và form. Báo cáo hình ảnh trang chủ ở `.taste-skill/v3/`; các bản trước được giữ để đối chiếu. Thư mục kiểm tra cục bộ được Git bỏ qua.

## Git

Remote `origin`: `https://github.com/thangphanpx/habac.git`. Nhánh làm việc: `design/ngan-ha`, dựa trên lịch sử `origin/master`. Bản động nằm trong `app/`; bản tĩnh và dữ liệu nguồn cũ được giữ để đối chiếu. Push qua HTTPS với tài khoản có quyền ghi vào repo. Không đưa `.env`, token, cache hay file thiết kế mới vào commit. Không tự tạo hoặc cập nhật ZIP.

Để đăng website, đưa **nội dung bên trong `dist/`** lên static hosting. Các thư mục HTTrack và tài nguyên cũ ở ngoài `dist/` được giữ để đối chiếu, không cần tải lên hosting.

## Demo trên Vercel

**Bản động mới:** triển khai từ thư mục `app/`, gồm admin, PostgreSQL và ảnh upload bền vững. Xem [hướng dẫn bản động](app/README.md#deploy-vercel). Các cấu hình static bên dưới chỉ mô tả bản HTML trước đây; không dùng để deploy bản động.

Demo công khai: **https://ngan-ha-ec-demo.vercel.app/**. Dự án `ngan-ha-ec-demo`, scope `phanthang1994s-projects`. Bản demo được deploy bằng CLI; chưa kết nối tự động deploy từ GitHub.

`vercel.json` chọn website tĩnh, bỏ bước cài đặt/build trên máy chủ và phục vụ `dist/`. `.vercelignore` chỉ cho phép upload `dist/` và cấu hình Vercel. Thư mục `.vercel/` chứa liên kết dự án cục bộ và được Git bỏ qua.

Sau khi chỉnh nội dung, chạy `python scripts/build.py` và `python scripts/check.py` trước khi deploy. Dùng `vercel --prod` từ thư mục gốc để cập nhật bản demo đã liên kết. Nếu import repo qua Vercel, chọn nhánh `design/ngan-ha`; cấu hình output đã có trong repo. Bản build `dist/` được lưu trong Git nên Vercel không cần Python để chạy website.
