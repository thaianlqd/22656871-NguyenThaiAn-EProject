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



//ok tui hiểu rồi:
// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const App = require("../app");
// const expect = chai.expect;
// require("dotenv").config();

// chai.use(chaiHttp);

// describe("Products", () => {
//   let app;
//   let authToken;

//   before(async () => {
//     app = new App();
//     await Promise.all([app.connectDB(), app.setupMessageBroker()]);

//     // Lấy URL từ biến môi trường.
//     // Khi chạy trên CI (GitHub Actions), nó sẽ là 'http://localhost:3000'.
//     // Khi chạy local (Docker Compose), nó sẽ là 'http://thaian_auth_service:3000' (đọc từ .env).
//     const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';
    
//     const TEST_USER = {
//         username: process.env.LOGIN_TEST_USER, 
//         password: process.env.LOGIN_TEST_PASSWORD
//     };

//     // BƯỚC 1: ĐĂNG KÝ USER TRƯỚC.
//     // Điều này đảm bảo user luôn tồn tại, đặc biệt là trong môi trường CI.
//     // Chúng ta dùng try/catch để bỏ qua lỗi nếu user đã tồn tại (khi chạy local nhiều lần).
//     try {
//       await chai
//         .request(AUTH_SERVICE_URL)
//         .post("/register")
//         .send(TEST_USER);
//     } catch (err) {
//       // Bỏ qua lỗi, không sao cả.
//     }

//     // BƯỚC 2: BÂY GIỜ MỚI ĐĂNG NHẬP ĐỂ LẤY TOKEN.
//     // Bước này sẽ luôn thành công vì user đã được đảm bảo tồn tại.
//     const authRes = await chai
//       .request(AUTH_SERVICE_URL) 
//       .post("/login")
//       .send(TEST_USER);

//     authToken = authRes.body.token;
//     console.log("Auth Token:", authToken); 
//   });

//   after(async () => {
//     await app.disconnectDB();
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
//         .send(product);

//       expect(res).to.have.status(201);
//       expect(res.body).to.have.property("_id");
//       expect(res.body).to.have.property("name", product.name);
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


//test: thêm phần get

// const chai = require("chai");
// const chaiHttp = require("chai-http");
// const App = require("../app");
// const expect = chai.expect;
// require("dotenv").config();

// chai.use(chaiHttp);

// describe("Products", () => {
//   let app;
//   let authToken;
//   // BIẾN MỚI: Dùng để lưu các sản phẩm đã được tạo trong test
//   let createdProducts = []; 

//   before(async () => {
//     app = new App();
//     // Giả sử app.init() đã được thêm vào để xử lý race condition
//     if (app.init) {
//         await app.init();
//     } else {
//         // Fallback cho cấu trúc cũ
//         await Promise.all([app.connectDB(), app.setupMessageBroker()]);
//     }

//     const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';
//     const TEST_USER = {
//         username: process.env.LOGIN_TEST_USER, 
//         password: process.env.LOGIN_TEST_PASSWORD
//     };

//     try {
//       await chai.request(AUTH_SERVICE_URL).post("/register").send(TEST_USER);
//     } catch (err) { /* Bỏ qua lỗi nếu user đã tồn tại */ }

//     const authRes = await chai.request(AUTH_SERVICE_URL).post("/login").send(TEST_USER);
//     authToken = authRes.body.token;
//   });

//   after(async () => {
//       if (app.stop) {
//           await app.stop();
//       } else {
//           await app.disconnectDB();
//       }
//   });

//   describe("POST /products", () => {
//     it("should create a new product", async () => {
//       const product = {
//         name: "Test Book",
//         description: "A very good book",
//         price: 15,
//       };
//       const res = await chai
//         .request(app.app)
//         .post("/products")
//         .set("Authorization", `Bearer ${authToken}`)
//         .send(product);

//       expect(res).to.have.status(201);
//       expect(res.body).to.have.property("_id");
//       expect(res.body.name).to.equal(product.name);

//       // THÊM MỚI: Lưu sản phẩm vừa tạo vào biến để dùng cho test GET
//       createdProducts.push(res.body);
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

//   // --- PHẦN MỚI THÊM VÀO ---
//   describe("GET /products", () => {
//     it("should return a list of products", async () => {
//       const res = await chai
//         .request(app.app)
//         .get("/products")
//         .set("Authorization", `Bearer ${authToken}`);

//       // Kiểm tra xem request có thành công không
//       expect(res).to.have.status(200);

//       // Kiểm tra xem kết quả trả về có phải là một mảng không
//       expect(res.body).to.be.an("array");

//       // Kiểm tra xem mảng trả về có chứa sản phẩm mà chúng ta đã tạo ở trên không
//       const foundProduct = res.body.find(p => p._id === createdProducts[0]._id);
//       expect(foundProduct).to.not.be.undefined;
//       expect(foundProduct.name).to.equal("Test Book");
//     });
//   });
// });





//tets: thêm phần tạo hóa đơn

const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();

chai.use(chaiHttp);

describe("Products", () => {
  let app;
  let authToken;
  let createdProducts = []; 

  before(async function() {
    // Tăng thời gian chờ cho bước setup vì nó phải kết nối nhiều thứ
    this.timeout(15000); 

    app = new App();
    // Giả sử app.init() đã được thêm vào để xử lý race condition
    if (app.init) {
        await app.init();
    } else {
        // Fallback cho cấu trúc cũ
        await Promise.all([app.connectDB(), app.setupMessageBroker()]);
    }

    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';
    const TEST_USER = {
        username: process.env.LOGIN_TEST_USER, 
        password: process.env.LOGIN_TEST_PASSWORD
    };

    try {
      await chai.request(AUTH_SERVICE_URL).post("/register").send(TEST_USER);
    } catch (err) { /* Bỏ qua lỗi nếu user đã tồn tại */ }

    const authRes = await chai.request(AUTH_SERVICE_URL).post("/login").send(TEST_USER);
    authToken = authRes.body.token;
  });

  after(async () => {
      if (app.stop) {
          await app.stop();
      } else {
          await app.disconnectDB();
      }
  });

  describe("POST /products", () => {
    it("should create a new product", async () => {
      const product = {
        name: "Test Book",
        description: "A very good book",
        price: 15,
      };
      const res = await chai
        .request(app.app)
        .post("/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(product);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("_id");
      createdProducts.push(res.body);
    });

    it("should return an error if name is missing", async () => {
      const res = await chai
        .request(app.app)
        .post("/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ description: "No name", price: 10 });

      expect(res).to.have.status(400);
    });
  });

  describe("GET /products", () => {
    it("should return a list of products", async () => {
      const res = await chai
        .request(app.app)
        .get("/products")
        .set("Authorization", `Bearer ${authToken}`);
  
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");
      const foundProduct = res.body.find(p => p._id === createdProducts[0]._id);
      expect(foundProduct).to.not.be.undefined;
    });
  });

  // --- PHẦN MỚI THÊM VÀO ---
  describe("POST /products/buy", function() {
    // Tăng thời gian chờ cho bộ test này vì nó phải chờ RabbitMQ giao tiếp
    this.timeout(30000); 

    it("should create a new order and return completed status", async () => {
      // Đảm bảo rằng đã có sản phẩm để mua
      expect(createdProducts.length).to.be.greaterThan(0, "Phải tạo sản phẩm trước khi có thể mua");

      // Lấy ID của sản phẩm đã tạo ở trên
      const productIds = createdProducts.map(p => p._id);
      const res = await chai
        .request(app.app)
        .post("/products/buy")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ ids: productIds }); // Gửi yêu cầu mua sản phẩm

      // Kiểm tra xem request có thành công không
      expect(res).to.have.status(201);

      // Kiểm tra xem trạng thái trả về có phải là 'completed' không 
      // (chứng tỏ đã nhận được phản hồi từ service 'order')
      expect(res.body).to.have.property("status", "completed");
      expect(res.body).to.have.property("orderId");
      expect(res.body.products[0]._id).to.equal(createdProducts[0]._id);
    });
  });
