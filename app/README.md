# Ngân Hà EC — bản động

TanStack Start (React, SSR) + Hono (API) + PostgreSQL, chạy trên Bun. Giao diện công khai giữ nguyên thiết kế bản tĩnh (`../assets/styles.css`); nội dung dịch vụ, thiết bị, công trình, thông tin công ty và yêu cầu liên hệ nay nằm trong database và quản lý tại `/admin`.

## Chạy lần đầu

```bash
cd app
bun install
cp .env.example .env        # đổi DB_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD
bun run db:up               # PostgreSQL trong Docker, cổng 5436
bun run db:migrate          # tạo bảng
bun run db:seed             # nạp nội dung hiện có + tạo quản trị viên đầu tiên
bun run dev                 # http://localhost:30001  (admin: /admin)
```

Production: `bun run build` rồi `bun run start` (cổng mặc định 3000, đổi bằng biến `PORT`). Khi chạy sau HTTPS đặt `COOKIE_SECURE=true`.

Kiểm tra: `bun run build`, `bun run typecheck`, `bun run test` (test API chạy trên PostgreSQL thật, cần `db:up` + `db:migrate`). Build cập nhật các kiểu route trước khi typecheck.

## Deploy Vercel

Dự án Vercel `ngan-ha-ec-demo` dùng bản động trong thư mục `app/`, Bun 1.4 và Nitro preset `vercel`. Bản HTML tĩnh và cấu hình ở thư mục gốc chỉ dành cho bản bàn giao cũ.

- Database: Neon Free, vùng Singapore; dùng `DATABASE_URL` có SSL do integration cung cấp.
- Ảnh upload: Vercel Blob **private**, đã liên kết cùng project; dùng `BLOB_READ_WRITE_TOKEN` hoặc OIDC (`BLOB_STORE_ID`). Đường dẫn công khai vẫn là `/uploads/<tên-ảnh>`, do API phục vụ.
- Đặt `COOKIE_SECURE=true` cho production. Không đưa `.env` hay token vào Git.
- Khởi tạo schema bằng `db:migrate`, rồi `db:seed` với biến môi trường production được nạp an toàn. `ADMIN_EMAIL` và `ADMIN_PASSWORD` chỉ cần cho lần tạo quản trị viên đầu tiên, không cần lưu trên Vercel.
- Tài khoản quản trị production của lần triển khai này được lưu cục bộ trong `.vercel/admin.env` (Git và upload bỏ qua). Mật khẩu được sinh ngẫu nhiên; nên đổi sau lần đăng nhập đầu tiên tại `/admin/account`.
- Từ `app/`, chạy `vercel --prod` để cập nhật project đã liên kết. Khi import từ GitHub, chọn nhánh `design/ngan-ha` và Root Directory là `app`; không dùng cấu hình static `dist/` ở thư mục gốc.

Ảnh tối đa **4 MiB** để cả multipart nằm dưới giới hạn request 4.5 MB của Vercel Functions. Nội dung ảnh được kiểm tra trước khi lưu. Blob lưu bền vững qua các lần deploy; local không cấu hình Blob vẫn dùng `UPLOAD_DIR`. Không chạy test tích hợp trên database production.

## Cấu trúc

- `src/routes/_site/*` — trang công khai (đọc DB qua server function khi SSR).
- `src/routes/admin/*` — trang quản trị (chỉ chạy ở trình duyệt, gọi `/api/admin/*`).
- `src/server/api.ts` — toàn bộ API Hono, gắn vào Start ở `src/routes/api/$.ts`. Cũng phục vụ ảnh tải lên ở `/uploads/*`.
- `src/server/schema.sql`, `seed.ts` — schema và dữ liệu mẫu.
- `src/lib/permissions.ts` — vai trò và quyền (dùng chung server + giao diện).
- `src/lib/legacy.ts` — chuyển hướng 301 từ URL `.html` và URL của website nganhaec.com cũ.

## Phân quyền

| Vai trò | Dịch vụ / Thiết bị / Công trình / Ảnh | Yêu cầu tư vấn | Thông tin công ty | Người dùng |
|---|:-:|:-:|:-:|:-:|
| Quản trị viên (`admin`) | ✓ | ✓ | ✓ | ✓ |
| Biên tập nội dung (`editor`) | ✓ | | | |
| Chăm sóc khách hàng (`support`) | | ✓ | | |

Quyền được kiểm tra ở server cho mọi API và đọc lại từ DB ở mỗi request, nên đổi vai trò hoặc khóa tài khoản có hiệu lực ngay. Ẩn menu ở giao diện chỉ để tiện dùng. Quản trị viên không thể tự hạ quyền, khóa hoặc xóa chính mình.

Thêm vai trò mới: sửa `ROLES` trong `src/lib/permissions.ts` và danh sách `check (role in …)` trong `schema.sql`.

## Bảo mật đã có

Mật khẩu băm argon2id (`Bun.password`); phiên lưu hash trong DB, cookie `HttpOnly` + `SameSite=Lax`; kiểm tra Origin cho mọi request ghi dạng form/upload; giới hạn thử đăng nhập và gửi form liên hệ; ô ẩn chống bot; ảnh tải lên được kiểm tra bằng chữ ký file (PNG/JPG/WebP/GIF, ≤ 4 MiB, không nhận SVG); ảnh trong bài chỉ nhận đường dẫn nội bộ.

## Giới hạn đã biết

- Bộ giới hạn tốc độ nằm trong RAM của một tiến trình; chạy nhiều instance cần Redis hoặc bảng DB.
- Local: ảnh tải lên lưu ở thư mục `uploads/` trên đĩa (đặt `UPLOAD_DIR`, nhớ backup hoặc mount volume). Vercel dùng Blob; ảnh bị thay/xóa khỏi nội dung không tự dọn khỏi kho lưu.
- Văn bản trang chủ, giới thiệu, quy trình và FAQ vẫn nằm trong code (`src/routes/_site/index.tsx`, `src/components/sections.tsx`), chưa sửa được ở admin.
- Địa chỉ IP lấy từ `X-Forwarded-For`; chỉ đáng tin khi chạy sau reverse proxy của bạn.
- Chưa gửi email/thông báo khi có yêu cầu mới; xem trong admin.
