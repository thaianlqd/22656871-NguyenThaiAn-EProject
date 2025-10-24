Dự án Microservices E-commerce Cơ bản

Đây là một dự án ví dụ minh họa kiến trúc microservices được xây dựng bằng Node.js, Express, MongoDB, và RabbitMQ. Dự án đi kèm với quy trình CI/CD hoàn chỉnh sử dụng GitHub Actions.

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
Mỗi service (auth, product, order) đều yêu cầu một file .env riêng trong thư mục gốc của nó. Bạn cần tạo các file này theo cấu trúc sau:

auth/.env:

MONGODB_AUTH_URI=mongodb://thaian_mongodb:27017/ThaianAuthService
JWT_SECRET=your_strong_jwt_secret # Thay bằng một chuỗi bí mật mạnh
RABBITMQ_URI=amqp://guest:guest@thaian_rabbitmq:5672 # (Nếu service auth cần)


product/.env:

MONGODB_PRODUCT_URI=mongodb://thaian_mongodb:27017/ThaianProductService
JWT_SECRET=your_strong_jwt_secret # Phải giống với auth service
RABBITMQ_URI=amqp://guest:guest@thaian_rabbitmq:5672
AUTH_SERVICE_URL=http://thaian_auth_service:3000 # Dùng cho test khi chạy docker-compose exec
LOGIN_TEST_USER=testuser # Dùng cho test
LOGIN_TEST_PASSWORD=password # Dùng cho test


order/.env:

MONGODB_ORDER_URI=mongodb://thaian_mongodb:27017/ThaianOrderService
JWT_SECRET=your_strong_jwt_secret # Phải giống với auth service
RABBITMQ_URI=amqp://guest:guest@thaian_rabbitmq:5672


api-gateway/.env: (Nếu có) Thường không cần biến môi trường đặc biệt.

Khởi chạy hệ thống:

docker-compose up -d --build


Lệnh này sẽ build các Docker image và khởi động tất cả các container. API Gateway sẽ chạy ở http://localhost:3003.

Chạy Tests (Trên môi trường Docker)

Sau khi chạy docker-compose up -d, bạn có thể chạy test cho từng service:

# Chạy test cho Auth Service
docker-compose exec thaian_auth_service npm test

# Chạy test cho Product Service
docker-compose exec thaian_product_service npm test

# Chạy test cho Order Service
docker-compose exec thaian_order_service npm test


Quy trình CI/CD (GitHub Actions)

Dự án này sử dụng GitHub Actions (.github/workflows/main.yml) để tự động hóa:

Trigger: Chạy khi có push hoặc pull_request vào nhánh main.

Job test:

Khởi động MongoDB & RabbitMQ bằng Docker.

Cài đặt dependencies (npm ci) & chạy tests (npm test) cho auth và order.

Khởi động auth & order service trong nền.

Cài đặt dependencies & chạy tests integration cho product (bao gồm giao tiếp RabbitMQ).

Chạy ESLint để kiểm tra code style.

Job build-docker: (Chạy sau khi test thành công)

Đăng nhập Docker Hub.

Build & Push Docker image cho từng service lên Docker Hub.

API Endpoints (Qua API Gateway - http://localhost:3003)

Auth Service:

POST /auth/register - Đăng ký. Body: { "username": "...", "password": "..." }

POST /auth/login - Đăng nhập. Body: { "username": "...", "password": "..." }

GET /auth/dashboard - Ví dụ endpoint cần xác thực. (Header: Authorization: Bearer <token>)

Product Service:

POST /products - Tạo sản phẩm. (Header: Authorization: Bearer <token>). Body: { "name": "...", "price": ..., "description": "..." }

GET /products - Lấy danh sách sản phẩm. (Header: Authorization: Bearer <token>)

GET /products/:id - Lấy chi tiết sản phẩm. (Header: Authorization: Bearer <token>)

POST /products/buy - Đặt hàng. (Header: Authorization: Bearer <token>). Body: { "ids": ["productId1", "productId2"] }

GET /products/buy/:orderId - Lấy trạng thái đơn hàng. (Header: Authorization: Bearer <token>)

Lưu ý: Tiền tố /auth, /products có thể thay đổi tùy cấu hình API Gateway.

Cấu trúc thư mục

.
├── .github/
│   └── workflows/
│       └── main.yml         # GitHub Actions Workflow
├── api-gateway/             # API Gateway Service
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── auth/                    # Auth Service
│   ├── src/                 # Mã nguồn (controllers, services, models...)
│   ├── test/                # Files test
│   ├── Dockerfile
│   ├── package.json
│   └── .env                 # File biến môi trường (tạo thủ công)
├── order/                   # Order Service
│   ├── src/
│   ├── test/
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── product/                 # Product Service
│   ├── src/
│   ├── test/
│   ├── Dockerfile
│   ├── package.json
│   └── .env
├── .eslintrc.js             # Cấu hình ESLint chung
├── .gitignore
├── docker-compose.yml       # Cấu hình Docker Compose cho môi trường local
└── README.md                # File bạn đang đọc
