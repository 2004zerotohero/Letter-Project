# Birthday Letter 💌

Website thư sinh nhật tương tác bằng HTML + CSS + JavaScript thuần, phong cách hồng pastel lãng mạn.

## Chạy trên máy
1. Giải nén `birthday-letter-project.zip`.
2. Mở thư mục `birthday-letter` trong Visual Studio Code.
3. Cài extension **Live Server** nếu chưa có.
4. Mở `index.html`, nhấn **Go Live**.

## Các file chính
- `index.html`: cấu trúc trang, phong bì, lời chúc và nút nhạc.
- `style.css`: màu sắc, bố cục responsive và hiệu ứng mở/đóng thư.
- `script.js`: điều khiển mở/đóng thư, trái tim bay và nhạc nền.

## Cá nhân hóa
- Sửa lời chúc trong `index.html`, bên trong `id="letterMessage"`.
- Sửa lời chào ở `class="letter-greeting"`.
- Sửa chữ ký trong `id="signature"`.
- Sửa tiêu đề ban đầu trong `id="headline"`.
- Chỉnh màu ở phần `:root` đầu `style.css`.

## Nhạc nền
Nhạc nền được tạo bằng Web Audio API trong `script.js`, nên không cần tải file MP3. Trình duyệt thường chặn tự động phát âm thanh; người nhận cần nhấn nút **Bật nhạc** ở góc trên bên phải. Có thể thay giai điệu bằng cách chỉnh mảng `melody` và `bass` trong `script.js`.

## Đưa lên Internet và tạo QR
1. Đưa các file trong thư mục lên GitHub hoặc triển khai trực tiếp bằng phương thức kéo-thả được Netlify hỗ trợ.
2. Mở https://www.netlify.com/ và triển khai website.
3. Mở URL HTTPS trên điện thoại để kiểm tra.
4. Tạo QR từ URL đó, sau đó thử quét bằng một thiết bị khác trước khi in/gửi.

Lưu ý: lời chúc nằm trong mã nguồn phía trình duyệt, nên bất kỳ ai có đường link đều có thể đọc được. Đây không phải hệ thống thư được bảo vệ bằng mật khẩu.
