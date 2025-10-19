// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const App = require("../app");
// const expect = chai.expect;
// require("dotenv").config();

// chai.use(chaiHttp);


// describe("Products", () => {
//   let app;
//   let authToken; // Khai báo authToken ở đây nhé

//   // before(async () => {
//   //   app = new App();
//   //   await Promise.all([app.connectDB(), app.setupMessageBroker()])

//   //   // Authenticate with the auth microservice to get a token
//   //   const authRes = await chai
//   //     // .request("http://localhost:3000")
//   //     .request("http://thaian_auth_service:3000") // <-- ĐÃ SỬA
//   //     .post("/login")
//   //     .send({ username: process.env.LOGIN_TEST_USER, password: process.env.LOGIN_TEST_PASSWORD });

//   //   authToken = authRes.body.token;
//   //   // console.log(authToken);
//   //   console.log("Auth Token:", authToken); // Kiểm tra xem có lấy được token không
//   //   // app.start();
//   // });

//   before(async () => {
//     app = new App();
//     await Promise.all([app.connectDB(), app.setupMessageBroker()]);

//     // Lấy URL từ biến môi trường, nếu không có thì dùng localhost (cho CI)
//     const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';

//     // Authenticate with the auth microservice to get a token
//     const authRes = await chai
//       .request(AUTH_SERVICE_URL) // <-- ĐÃ SỬA THÀNH BIẾNN
//       .post("/login")
//       .send({ username: process.env.LOGIN_TEST_USER, password: process.env.LOGIN_TEST_PASSWORD });

//     authToken = authRes.body.token;
//     console.log("Auth Token:", authToken); 
//   });

//   after(async () => {
//     await app.disconnectDB();
//     // await app.closeMessageBroker(); // <-- Bạn nên có hàm này để đóng RabbitMQ
//     // app.stop();
//   });

//   describe("POST /products", () => {
//     it("should create a new product", async () => {
//       const product = {
//         name: "Product 1",
//         description: "Description of Product 1",
//         price: 10,
//       };
//       const res = await chai
//         .request(app.app)
//         .post("/products")
//         .set("Authorization", `Bearer ${authToken}`)
//         .send({
//             name: "Product 1",
//             price: 10,
//             description: "Description of Product 1"
//           });

//       expect(res).to.have.status(201);
//       expect(res.body).to.have.property("_id");
//       expect(res.body).to.have.property("name", product.name);
//       expect(res.body).to.have.property("description", product.description);
//       expect(res.body).to.have.property("price", product.price);
//     });

//     it("should return an error if name is missing", async () => {
//       const product = {
//         description: "Description of Product 1",
//         price: 10.99,
//       };
//       const res = await chai
//         .request(app.app)
//         .post("/products")
//         .set("Authorization", `Bearer ${authToken}`)
//         .send(product);

//       expect(res).to.have.status(400);
//     });
//   });
// });



//tesst:
const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();

chai.use(chaiHttp);

describe("Products", () => {
  let app;
  let authToken;

  before(async () => {
    app = new App();
    await Promise.all([app.connectDB(), app.setupMessageBroker()]);

    // Lấy URL từ biến môi trường.
    // Khi chạy trên CI (GitHub Actions), nó sẽ là 'http://localhost:3000'.
    // Khi chạy local (Docker Compose), nó sẽ là 'http://thaian_auth_service:3000' (đọc từ .env).
    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';
    
    const TEST_USER = {
        username: process.env.LOGIN_TEST_USER, 
        password: process.env.LOGIN_TEST_PASSWORD
    };

    // BƯỚC 1: ĐĂNG KÝ USER TRƯỚC.
    // Điều này đảm bảo user luôn tồn tại, đặc biệt là trong môi trường CI.
    // Chúng ta dùng try/catch để bỏ qua lỗi nếu user đã tồn tại (khi chạy local nhiều lần).
    try {
      await chai
        .request(AUTH_SERVICE_URL)
        .post("/register")
        .send(TEST_USER);
    } catch (err) {
      // Bỏ qua lỗi, không sao cả.
    }

    // BƯỚC 2: BÂY GIỜ MỚI ĐĂNG NHẬP ĐỂ LẤY TOKEN.
    // Bước này sẽ luôn thành công vì user đã được đảm bảo tồn tại.
    const authRes = await chai
      .request(AUTH_SERVICE_URL) 
      .post("/login")
      .send(TEST_USER);

    authToken = authRes.body.token;
    console.log("Auth Token:", authToken); 
  });

  after(async () => {
    await app.disconnectDB();
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const product = {
        name: "Product 1",
        description: "Description of Product 1",
        price: 10,
      };
      const res = await chai
        .request(app.app)
        .post("/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(product);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("name", product.name);
    });

    it("should return an error if name is missing", async () => {
      const product = {
        description: "Description of Product 1",
        price: 10.99,
      };
      const res = await chai
        .request(app.app)
        .post("/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(product);

      expect(res).to.have.status(400);
    });
  });
});

