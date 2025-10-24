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


// test: thêm phần get product

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

//=> thai an - update: đặt hàng
const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();


chai.use(chaiHttp);

describe("Products", () => {
  let app;
  let authToken;
  // BIẾN NÀY RẤT QUAN TRỌNG: Dùng để lưu sản phẩm đã tạo
  let createdProducts = []; 
  // BIẾN MỚI: Dùng để lưu orderId
  let orderId = null;

  before(async () => {
    app = new App();
    if (app.init) {
      await app.init();
    } else {
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
      expect(res.body.name).to.equal(product.name);

      // Lưu sản phẩm vừa tạo vào biến để dùng cho các test sau
      createdProducts.push(res.body);
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

  describe("GET /products", () => {
    it("should return a list of products", async () => {
      const res = await chai
        .request(app.app)
        .get("/products")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("array");

      // Kiểm tra xem mảng trả về có chứa sản phẩm đã tạo ở trên không
      const foundProduct = res.body.find(p => p._id === createdProducts[0]._id);
      expect(foundProduct).to.not.be.undefined;
      expect(foundProduct.name).to.equal("Test Book");
    });
  });

  // --- PHẦN MỚI THÊM VÀO ĐỂ TEST ĐẶT HÀNG ---
  describe("POST /products/buy", () => {
    it("should create a new order and receive a completion status", async () => {
      // Đảm bảo rằng chúng ta đã có sản phẩm để đặt hàng từ test trước
      if (createdProducts.length === 0) {
        throw new Error("Cannot run order test without a product.");
      }

      const productToOrder = createdProducts[0];

      const res = await chai
        .request(app.app)
        .post("/products/buy")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ ids: [productToOrder._id] }); // Gửi mảng chứa ID của sản phẩm

      // Kiểm tra các điều kiện của một đơn hàng thành công
      expect(res).to.have.status(201);
      expect(res.body).to.have.property("status", "completed");
      expect(res.body).to.have.property("totalPrice", productToOrder.price);
      expect(res.body.products).to.be.an("array").with.lengthOf(1);
      expect(res.body.products[0]._id).to.equal(productToOrder._id);

      // Lưu lại orderId để dùng cho test tiếp theo
      orderId = res.body.orderId; 
    });
  });

  // --- PHẦN TEST XEM ĐƠN HÀNG BẰNG ID ---
  describe("GET /products/buy/:id", () => {
    it("should return the order details by orderId", async () => {
      // Kiểm tra xem đã có orderId từ test trước chưa
      if (!orderId) {
        throw new Error("Cannot fetch order without a valid orderId.");
      }

      const res = await chai
        .request(app.app)
        .get(`/products/buy/${orderId}`)
        .set("Authorization", `Bearer ${authToken}`);

      // Kiểm tra phản hồi
      expect(res).to.have.status(200);
      expect(res.body).to.have.property("orderId", orderId);
      expect(res.body).to.have.property("status");
      expect(res.body).to.have.property("totalPrice");
      expect(res.body.products).to.be.an("array").that.is.not.empty;

      // Kiểm tra sản phẩm trong đơn hàng
      const orderedProduct = res.body.products[0];
      expect(orderedProduct).to.have.property("_id", createdProducts[0]._id);
      expect(orderedProduct.name).to.equal(createdProducts[0].name);
    });
  });

  // --- THÊM PHẦN NÀY VÀO TRƯỚC DẤU NGOẶC ĐÓNG CUỐI CÙNG ---
  describe("GET /products/:id", () => {
    it("should return the product details by id", async function() { // Thêm function để dùng this
        this.timeout(5000); // Thêm timeout nhỏ đề phòng DB chậm
        expect(createdProducts.length).to.be.greaterThan(0);
        const productToFetch = createdProducts[0]; 
        const targetId = productToFetch._id;

        // --- DEBUG LOGGING ---
        console.log(`[Test GET /:id] Attempting to fetch product with ID: ${targetId}`);
        console.log(`[Test GET /:id] Type of ID: ${typeof targetId}`);

        // Thử query trực tiếp từ DB trong test xem có tìm thấy không
        try {
            const productInDb = await Product.findById(targetId);
            console.log(`[Test GET /:id] Direct DB query result: ${productInDb ? 'FOUND' : 'NOT FOUND (null)'}`);
        } catch(dbError){
            console.error("[Test GET /:id] Error querying DB directly:", dbError);
        }
        // --- END DEBUG ---

        const res = await chai
          .request(app.app) 
          .get(`/products/${targetId}`) 
          .set("Authorization", `Bearer ${authToken}`);

        console.log(`[Test GET /:id] API response status: ${res.status}`);
        console.log(`[Test GET /:id] API response body:`, JSON.stringify(res.body));

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("_id", targetId); 
    });

    it("should return 404 if product id does not exist", async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString(); 
      const res = await chai
        .request(app.app) 
        .get(`/products/${nonExistentId}`) 
        .set("Authorization", `Bearer ${authToken}`);
      expect(res).to.have.status(404);
    });

    it("should return 400 if product id format is invalid", async () => {
        const invalidId = '123'; 
        const res = await chai
          .request(app.app) 
          .get(`/products/${invalidId}`) 
          .set("Authorization", `Bearer ${authToken}`);
        expect(res).to.have.status(400); 
      });
  });




});







