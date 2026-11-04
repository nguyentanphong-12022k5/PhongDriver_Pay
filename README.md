# 🛵 PhongDriver Pay - Quản Lý Doanh Thu & Tiết Kiệm Chạy Grab

> **Ứng dụng Web Single Page Application (SPA) hoàn chỉnh, mượt mà trên Mobile & Desktop dành cho các Bác tài Grab (GrabBike, GrabCar, GrabFood).**  
> Quản lý doanh thu, cước khách, tiền thưởng, tiền tip, chi phí xăng xe, cơm nước, bảo dưỡng, trích quỹ tiết kiệm và tính lương thực nhận đút túi.

---

## 🌟 Tính Năng Nổi Bật

### 1. 📱 Giao Diện Mobile-First & Desktop Tối Ưu Cho Bác Tài
- **Trên Điện Thoại**:
  - Giao diện thẻ (Card-based), nút bấm lớn (48px+ touch targets), bố trí thumb-friendly dễ dàng thao tác một tay khi đang dừng đèn đỏ hoặc nghỉ ngơi ngoài đường.
  - Các nút tăng giảm nhanh: `+0.5h`, `+1 cuốc`, `+5km` và cộng tiền nhanh: `+20k`, `+50k`, `+100k`, `+200k`, `+500k`.
  - Thanh điều hướng cố định dưới đáy màn hình (Mobile Bottom Navigation) với nút **(+) Nhập Ca** nổi bật ngay ngón tay cái.
- **Trên Máy Tính (Desktop)**:
  - Dashboard toàn cảnh với các thẻ KPI trực quan, bảng dữ liệu lịch sử đầy đủ tính năng tìm kiếm, xem phân bổ chi tiết từng ca.
  - Biểu đồ xu hướng doanh thu / chi phí / lãi ròng (Bar & Line chart) và biểu đồ tròn cơ cấu chi phí (Doughnut chart).
- **Chế Độ Ban Đêm (Dark Mode / Light Mode)**:
  - Tông màu đen/xám chuẩn OLED chống chói mắt khi chạy xe ban đêm, tự động lưu lựa chọn vào LocalStorage.

---

### 2. 🌕 Lịch Dương & Lịch Âm Việt Nam Tích Hợp Sẵn
- Sử dụng thuật toán thiên văn Âm lịch Việt Nam chuẩn múi giờ UTC+7 (TS. Hồ Ngọc Đức).
- Tự động chuyển đổi từ ngày Dương sang Âm lịch kèm theo Can Chi (Canh Thân, Ất Tỵ,...).
- Đánh dấu nổi bật:
  - **Mùng 1 (Đầu tháng)** & **Hôm Rằm (Ngày Vọng - 15 ÂL)**.
  - Các ngày Tết và Lễ truyền thống: Tết Nguyên Đán (30 Tết, Mùng 1 - 3), Giỗ Tổ Hùng Vương (10/3 ÂL), Phật Đản, Tết Đoan Ngọ (5/5 ÂL), Vu Lan Báo Hiếu (15/7 ÂL), Tết Trung Thu, Tiễn Ông Táo Chầu Trời (23 Chạp), 30/4, 1/5, 2/9...
- Bộ lọc thời gian linh hoạt:
  - **Hôm nay**
  - **Hôm qua**
  - **Tuần này**
  - **Tháng này**
  - **Năm nay**
  - **Tất cả**
  - **Tùy chọn khoảng ngày (Từ ngày ... đến ngày ...)**

---

### 3. ✍️ Form Nhập Liệu Ca Chạy Hàng Ngày
- **Thông tin cuốc chạy**: Số giờ online, số cuốc xe hoàn thành, số Km đã chạy.
- **Doanh thu**:
  - Cước nhận từ khách / cuốc xe trên App (VNĐ).
  - Thưởng (ngọc, mốc cuốc, thưởng nóng ca cao điểm).
  - Tiền Tip từ khách.
- **Chi phí vận hành**:
  - Tiền xăng xe.
  - Tiền ăn uống trong ca chạy (cơm trưa, cà phê, nước mía).
  - Tiền bảo dưỡng/sửa xe/thay nhớt + ô ghi chú chi tiết.
- **Chi tiêu đột xuất / Khác**:
  - Thêm không giới hạn các khoản chi kèm tên lý do + số tiền (mua đồ gia đình, đóng phạt, đóng quỹ, vá xe dính đinh...).
- **Trích quỹ Tiết Kiệm**:
  - Chọn nhanh hoặc nhập số tiền muốn cất riêng vào ngày hôm đó (50k, 100k, 150k, 200k/ngày).
- **Xem trước tức thì (Live Preview)**: Form tự động tính ngay số tiền đút túi và tiền mặt còn lại khi bạn đang gõ phím.

---

### 4. 🧮 Logic Tính Toán & 5 Chỉ Số Cốt Lõi

$$\text{[1] Tổng Thu Nhập Gộp} = \text{Cước App} + \text{Thưởng} + \text{Tip}$$

$$\text{[2] Tổng Chi Phí} = \text{Xăng xe} + \text{Ăn uống} + \text{Bảo dưỡng} + \text{Chi tiêu đột xuất}$$

$$\text{[3] Thu Nhập Ròng (Lãi thực nhận đút túi)} = \text{[1]} - \text{[2]}$$

$$\text{[4] Quỹ Tiết Kiệm Tích Lũy} = \sum \text{Tiền trích quỹ tiết kiệm}$$

$$\text{[5] Tiền Mặt Còn Lại Để Tiêu} = \text{[3]} - \text{[4]}$$

#### 📈 Chỉ số hiệu suất tài xế:
- **Lương trung bình / Giờ**: $\frac{\text{Doanh thu}}{\text{Số giờ chạy}}$ & $\frac{\text{Lãi ròng}}{\text{Số giờ chạy}}$
- **Doanh thu trung bình / Km**: $\frac{\text{Doanh thu}}{\text{Số Km}}$
- **Chi phí vận hành / Km**: $\frac{\text{Tổng chi phí}}{\text{Số Km}}$
- **Doanh thu trung bình / Cuốc**: $\frac{\text{Doanh thu}}{\text{Số cuốc}}$
- **Tỷ suất lợi nhuận ròng (%)**: $\frac{\text{Lãi ròng}}{\text{Tổng doanh thu}} \times 100\%$
- **Thanh tiến độ Mục tiêu ngày**: Đặt mục tiêu (ví dụ 500.000đ/ngày), tự động bắn pháo hoa ăn mừng khi đạt 100%!

---

### 5. 💾 Quản Lý Dữ Liệu & Sao Lưu An Toàn
- **Tự động lưu LocalStorage**: Mọi thao tác thêm, sửa, xóa đều được lưu lập tức trên trình duyệt, không bao giờ mất khi F5 hay đóng app.
- **Xuất file Excel (`.xlsx`)**: Xuất báo cáo bảng chấm công và thu nhập chuẩn tiếng Việt có dấu, định dạng số, tổng kết dòng cuối.
- **Nhập file Excel / JSON**: Khôi phục hoặc chuyển đổi dữ liệu dễ dàng giữa điện thoại và máy tính.
- **Dữ liệu mẫu (Mock Data)**: Tích hợp sẵn 7 ngày gần nhất với số liệu thực tế để trải nghiệm ngay lập tức.
- **Cài đặt cá nhân hóa**: Đổi tên tài xế, loại phương tiện (GrabBike, GrabCar, GrabFood), đặt mục tiêu doanh thu ngày.

---

## 🛠 Công Nghệ Sử Dụng

- **Frontend**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 6+
- **Styling**: Tailwind CSS (Dark/Light mode class-based)
- **Icons**: Lucide Icons
- **Biểu đồ**: Chart.js 4 + React-Chartjs-2
- **Xử lý Excel**: SheetJS (`xlsx`)
- **Hiệu ứng**: Canvas-Confetti
- **Thuật toán Âm Lịch**: Astronomical UTC+7 Vietnamese Lunar Engine

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu hệ thống:
- Đã cài đặt **Node.js** (v18 trở lên).

### 2. Khởi chạy chế độ phát triển (Development):
```bash
# Cài đặt thư viện (nếu chưa cài)
npm install

# Khởi chạy dev server (port 3000)
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:3000`

### 3. Đóng gói bản Production (Build):
```bash
npm run build
```
Thư mục `dist/` sẽ được tạo ra chứa mã nguồn tối ưu hóa sẵn sàng triển khai lên Vercel, Netlify, GitHub Pages hoặc chạy nội bộ.

---

## 📁 Cấu Trúc Thư Mục

```
PhongDriver_Pay/
├── public/
│   └── favicon.svg           # Icon xe máy Grab
├── src/
│   ├── components/
│   │   ├── ChartsView.tsx     # Biểu đồ xu hướng & cơ cấu chi phí
│   │   ├── FilterBar.tsx      # Bộ lọc Hôm nay/Tuần/Tháng/Khoảng ngày & Lịch Âm
│   │   ├── HistoryTable.tsx   # Danh sách lịch sử ca chạy (Desktop table & Mobile cards)
│   │   ├── KpiCards.tsx       # 5 thẻ chỉ số chính & thanh mục tiêu ngày
│   │   ├── MobileBottomNav.tsx# Thanh điều hướng ngón tay cái cho Mobile
│   │   ├── Navbar.tsx         # Thanh tiêu đề, thông tin tài xế, dark mode
│   │   ├── SettingsModal.tsx  # Cài đặt mục tiêu, xuất/nhập Excel & JSON
│   │   └── ShiftFormModal.tsx # Form nhập liệu ca chạy với bàn phím nhanh
│   ├── types/
│   │   └── index.ts           # Định nghĩa cấu trúc dữ liệu TypeScript
│   ├── utils/
│   │   ├── calculations.ts    # Logic tính toán 5 chỉ số và KPI tài xế
│   │   ├── excel.ts           # Xuất/nhập file Excel (.xlsx) và JSON
│   │   ├── lunar.ts           # Thuật toán Âm Lịch Việt Nam & Lễ Tết
│   │   └── storage.ts         # Lưu trữ LocalStorage & Dữ liệu mẫu 7 ngày
│   ├── App.tsx                # Trang chính Single Page Application
│   ├── index.css              # Tailwind base & custom utilities
│   ├── main.tsx               # Điểm khởi tạo ứng dụng React
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

*Chúc các Bác tài chạy xe vạn dặm bình an, nổ cuốc liên tục và tích lũy tiết kiệm thật nhiều! 🛵💨*
