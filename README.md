README.md - Dự Án Microservices E-Commerce
Giới Thiệu
Dự án này là một hệ thống microservices đơn giản bằng Node.js, mô phỏng ứng dụng e-commerce với các chức năng chính: xác thực người dùng (auth), quản lý sản phẩm (product), và xử lý đơn hàng (order). Hệ thống sử dụng:

API Gateway: Proxy request đến các service con.
Auth Service: Đăng ký, đăng nhập, JWT authentication (MongoDB lưu user).
Product Service: Tạo/sản phẩm, mua hàng (RabbitMQ gửi message đến order).
Order Service: Consume message từ RabbitMQ, lưu đơn hàng (MongoDB).
RabbitMQ: Message broker cho giao tiếp async giữa services.
MongoDB: Cơ sở dữ liệu cho auth, product, order (3 instances riêng).

Hệ thống được orchestrate bằng Docker Compose, hỗ trợ dev local dễ dàng.
Yêu Cầu Hệ Thống

Node.js v18+.
Docker và Docker Compose (v2+).
MongoDB (tích hợp qua Docker, không cần cài local).
RabbitMQ (tích hợp qua Docker).

Cài Đặt

Clone project (giả sử đã có):
textgit clone <repo-url>
cd 22656871-NguyenThaiAn-EProject

Cài dependencies cho từng service (nếu chưa):

Di chuyển đến từng folder (auth, product, order, api-gateway):
textcd auth && npm install && cd ..
cd product && npm install && cd ..
cd order && npm install && cd ..
cd api-gateway && npm install && cd ..



Chạy hệ thống:
textdocker-compose up -d --build

Chờ 2-3 phút (RabbitMQ start chậm).
Kiểm tra: docker ps (5 containers Up: rabbitmq, api-gateway, auth, order, product).


Dừng hệ thống:
textdocker-compose down -v  # -v xóa data nếu cần reset


Cấu Trúc Folder
text22656871-NguyenThaiAn-EProject/
├── api-gateway/
│   ├── index.js  # Proxy routes
│   ├── package.json
│   └── Dockerfile
├── auth/
│   ├── src/
│   │   ├── app.js  # Express app, routes /login, /register, /dashboard
│   │   ├── config.js
│   │   ├── controllers/authController.js
│   │   ├── middlewares/authMiddleware.js
│   │   ├── models/user.js
│   │   └── services/authService.js
│   ├── package.json
│   └── Dockerfile
├── order/
│   ├── src/
│   │   ├── app.js  # Consume RabbitMQ queue "orders"
│   │   ├── config.js
│   │   └── models/order.js
│   ├── package.json
│   └── Dockerfile
├── product/
│   ├── src/
│   │   ├── app.js  # Publish message to RabbitMQ, long polling order
│   │   ├── config.js
│   │   └── utils/messageBroker.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml  # Orchestrate services + RabbitMQ
└── README.md
Cách Test API (Sử Dụng Postman)
Tất cả request qua gateway (localhost:3003). Sử dụng body raw JSON, header Content-Type: application/json.

Register User:

POST /auth/register
Body: {"username": "testuser", "password": "password123"}
Response: 201, { "_id": "...", "username": "testuser" }.


Login:

POST /auth/login
Body giống trên.
Response: 200, { "token": "eyJhbGciOiJIUzI1NiIs..." }. Copy token.


Create Product (cần token):

POST /products
Headers: Authorization: Bearer <token>
Body: {"name": "iPhone 15", "price": 20000000, "description": "Smartphone"}
Response: 201, product object với _id.


Get Products:

GET /products
Headers: Authorization: Bearer <token>
Response: 200, array products.


Buy Order (kích hoạt RabbitMQ):

POST /products/buy
Headers: Authorization: Bearer <token>
Body: {"ids": ["_id_product_từ_bước_3"]}
Response: 201, order details (chờ 5-10s long polling).


RabbitMQ UI: Mở http://localhost:15672 (user: guest, pass: guest) để xem queue "orders" và "products".

Troubleshooting

Lỗi kết nối RabbitMQ (ENOTFOUND): Sửa code dùng process.env.RABBITMQ_URI thay hard-code.
404 Not Found: Kiểm tra rewrite path trong gateway (strip/prepend prefix match route service).
ECONNREFUSED MongoDB: Sửa URI port internal 27017 trong env yml.
Treo lâu: Tăng timeout Postman (Settings → Request timeout = 0), hoặc check logs real-time docker-compose logs -f <service>.
Cảnh báo deprecation: Cập nhật npm packages (npm update trong folder), rebuild service.

Góp Phần

Fork repo, tạo branch, pull request.
Liên hệ: [email hoặc GitHub].

Dự án được xây dựng dựa trên Node.js, Express, Mongoose, AMQPLib. Cảm ơn bạn đã sử dụng!!