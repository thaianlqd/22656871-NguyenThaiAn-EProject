Dự án Microservices E-commerce Cơ bản

Đây là một dự án ví dụ minh họa kiến trúc microservices được xây dựng bằng Node.js, Express, MongoDB, và RabbitMQ, đi kèm với quy trình CI/CD hoàn chỉnh sử dụng GitHub Actions.

Giới thiệu

Dự án mô phỏng một hệ thống thương mại điện tử đơn giản bao gồm các dịch vụ cốt lõi:

Auth Service: Quản lý việc đăng ký, đăng nhập và xác thực người dùng bằng JSON Web Tokens (JWT).

Product Service: Quản lý thông tin sản phẩm (tạo, xem danh sách, xem chi tiết) và khởi tạo quy trình đặt hàng.

Order Service: Lắng nghe các yêu cầu đặt hàng, xử lý, lưu trữ thông tin đơn hàng vào cơ sở dữ liệu và gửi thông báo xác nhận.

API Gateway: Đóng vai trò là cổng vào duy nhất cho tất cả các request từ client, điều hướng đến các service tương ứng.

Giao tiếp giữa Product Service và Order Service được thực hiện bất đồng bộ thông qua RabbitMQ, giúp tăng tính linh hoạt và khả năng phục hồi của hệ thống.

Công nghệ sử dụng

Backend: Node.js, Express.js

Database: MongoDB (với Mongoose ODM)

Message Broker: RabbitMQ (với amqplib)

Xác thực: JSON Web Token (JWT), bcryptjs

Containerization: Docker, Docker Compose

CI/CD: GitHub Actions

Testing: Mocha, Chai

Linting: ESLint

Bắt đầu

Yêu cầu

Docker: https://docs.docker.com/get-docker/

Docker Compose: Thường được cài đặt cùng với Docker Desktop.

Cài đặt và Chạy (Sử dụng Docker Compose)

Clone repository:

git clone <your-repository-url>
cd <your-repository-name>


Thiết lập Biến Môi trường:
Mỗi service (auth, product, order) đều yêu cầu một file .env riêng trong thư mục gốc của nó. Bạn cần tạo các file này dựa trên các file .env.example (nếu có) hoặc theo cấu trúc sau:

auth/.env:

MONGODB_AUTH_URI=mongodb://thaian_mongodb:27017/ThaianAuthService
JWT_SECRET=thaiansecret # Thay bằng một chuỗi bí mật mạnh hơn
RABBITMQ_URI=amqp://guest:guest@thaian_rabbitmq:5672 # (Nếu service auth cần)


product/.env:

MONGODB_PRODUCT_URI=mongodb://thaian_mongodb:27017/ThaianProductService
JWT_SECRET=thaiansecret # Phải giống với auth service
RABBITMQ_URI=amqp://guest:guest@thaian_rabbitmq:5672
AUTH_SERVICE_URL=http://thaian_auth_service:3000 # Dùng cho test
LOGIN_TEST_USER=your_test_user # Dùng cho test
LOGIN_TEST_PASSWORD=your_test_password # Dùng cho test


order/.env:

MONGODB_ORDER_URI=mongodb://thaian_mongodb:27017/ThaianOrderService
JWT_SECRET=thaiansecret # Phải giống với auth service
RABBITMQ_URI=amqp://guest:guest@thaian_rabbitmq:5672


api-gateway/.env: (Nếu có) Thường không cần biến môi trường đặc biệt, nhưng bạn có thể thêm nếu muốn cấu hình port.

Khởi chạy hệ thống:

docker-compose up -d --build


Lệnh này sẽ build các Docker image (nếu chưa có) và khởi động tất cả các container trong chế độ nền. API Gateway sẽ chạy ở http://localhost:3003.

Chạy Tests (Trên môi trường Docker)

Sau khi chạy docker-compose up -d, bạn có thể chạy test cho từng service bằng lệnh docker-compose exec:

# Chạy test cho Auth Service
docker-compose exec thaian_auth_service npm test

# Chạy test cho Product Service
docker-compose exec thaian_product_service npm test

# Chạy test cho Order Service
docker-compose exec thaian_order_service npm test


Quy trình CI/CD

Dự án này sử dụng GitHub Actions để tự động hóa quy trình CI/CD, bao gồm các bước:

Trigger: Chạy mỗi khi có push hoặc pull_request vào nhánh main.

Job test:

Khởi động các container MongoDB và RabbitMQ.

Cài đặt dependencies (npm ci) và chạy tests (npm test) cho từng service (auth, order, product).

Khởi động auth và order service trong nền.

Chạy test integration cho product service (bao gồm cả giao tiếp RabbitMQ).

Chạy ESLint để kiểm tra chất lượng code.

Job build-docker: (Chỉ chạy nếu job test thành công)

Đăng nhập vào Docker Hub.

Build Docker image cho từng service (auth, product, order, api-gateway).

Đẩy (push) các image đã build lên Docker Hub với tag latest.

API Endpoints (Thông qua API Gateway - Port 3003)

Auth Service:

POST /auth/register: Đăng ký người dùng mới. Body: { "username": "...", "password": "..." }

POST /auth/login: Đăng nhập. Body: { "username": "...", "password": "..." }

GET /auth/dashboard: Endpoint ví dụ cần xác thực (yêu cầu header Authorization: Bearer <token>).

Product Service:

POST /products: Tạo sản phẩm mới (yêu cầu token). Body: { "name": "...", "price": ..., "description": "..." }

GET /products: Lấy danh sách sản phẩm (yêu cầu token).

GET /products/:id: Lấy chi tiết sản phẩm (yêu cầu token).

POST /products/buy: Đặt hàng (yêu cầu token). Body: { "ids": ["productId1", "productId2"] }

GET /products/buy/:orderId: Lấy trạng thái đơn hàng (yêu cầu token).

Lưu ý: Các endpoint trên là ví dụ, bạn có thể cần điều chỉnh tiền tố (/auth, /products) tùy theo cấu hình API Gateway.

Cấu trúc thư mục (Ví dụ)

.
├── auth/                 # Auth Service
│   ├── src/
│   ├── test/
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── product/              # Product Service
│   ├── src/
│   ├── test/
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── order/                # Order Service
│   ├── src/
│   ├── test/
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── api-gateway/          # API Gateway
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── .github/workflows/    # GitHub Actions workflow
│   └── main.yml
├── .eslintrc.js          # Cấu hình ESLint chung
├── .gitignore
├── docker-compose.yml    # Cấu hình Docker Compose
└── README.md             # File bạn đang đọc
