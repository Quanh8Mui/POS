# POS

## Hướng dẫn cài đặt và chạy

### Chạy bằng Docker

1. Sao chép `backend/.env.example` thành `backend/.env`
2. Khởi động Docker Compose:
   ```bash
   docker compose up --build
   ```
3. Backend sẽ chạy tại `http://localhost:8000`
4. Frontend placeholder sẽ chạy tại `http://localhost:3000`

### Kết nối PostgreSQL bằng DBeaver

- Host: `localhost`
- Port: `5432`
- Database: `pos`
- Username: `postgres`
- Password: `postgres`

### Cấu trúc thư mục

- `README.md` — Hướng dẫn cài đặt và chạy
- `docker-compose.yml` — Cấu hình Docker Compose (tuỳ chọn)
- `.github/workflows/ci.yml` — Pipeline CI/CD (tuỳ chọn)
- `docs/requirements.md` — Phân tích yêu cầu
- `docs/database-design.md` — Thiết kế database + dữ liệu mẫu
- `docs/api-docs.md` — Tài liệu API
- `docs/test-plan.md` — Kế hoạch test
- `docs/test-cases.xlsx` — Test cases (Excel)
- `docs/test-report.md` — Báo cáo test
- `docs/test-summary.md` — Tóm tắt test
- `docs/test-data/` — Dữ liệu test
- `docs/automation/` — Test tự động và báo cáo
- `docs/screenshots/` — Ảnh chụp màn hình demo
- `weekly-reports/` — Báo cáo tiến độ hàng tuần
- `backend/` — Mã nguồn backend
- `frontend/` — Mã nguồn frontend
- `database/` — Script SQL và migrations

### Ghi chú

Hiện tại các thư mục và file được tạo trước để giữ cấu trúc. Bạn có thể bổ sung nội dung theo tiến độ phát triển.
