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



//tesst lan 1:
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




//test hoan chinh:
const chai = require("chai");
const chaiHttp = require("chai-http");
const App = require("../app");
const expect = chai.expect;
require("dotenv").config();

chai.use(chaiHttp);

describe("Products", () => {
  let app;
  let authToken;
  let createdProduct; // Variable to store the created product

  before(async () => {
    app = new App();
    // Wait for DB and Message Broker to connect
    await app.connectDB();
    await app.setupMessageBroker();


    const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3000';
    const TEST_USER = {
        username: process.env.LOGIN_TEST_USER, 
        password: process.env.LOGIN_TEST_PASSWORD
    };

    // Step 1: Register the user to ensure they exist
    try {
      await chai.request(AUTH_SERVICE_URL).post("/register").send(TEST_USER);
    } catch (err) {
      // Ignore error if user already exists
    }

    // Step 2: Now, login to get the token
    const authRes = await chai.request(AUTH_SERVICE_URL).post("/login").send(TEST_USER);
    authToken = authRes.body.token;
  });

  after(async () => {
    await app.disconnectDB();
  });

  // ===============================================
  // YOUR OLD TEST CASES (Still here)
  // ===============================================
  describe("POST /products", () => {
    it("should create a new product", async () => {
      const productData = {
        name: "Laptop Test",
        description: "A powerful laptop for testing",
        price: 1200,
      };
      const res = await chai
        .request(app.app)
        .post("/products")
        .set("Authorization", `Bearer ${authToken}`)
        .send(productData);

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("_id");
      expect(res.body).to.have.property("name", productData.name);
      
      // Save the created product for later tests
      createdProduct = res.body; 
    });

    it("should return an error if name is missing", async () => {
      const product = {
        description: "Description without name",
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

  // ===============================================
  // NEW TEST CASE: GET /products
  // ===============================================
  describe("GET /products", () => {
    it("should return a list of products", async () => {
        const res = await chai
            .request(app.app)
            .get("/products")
            .set("Authorization", `Bearer ${authToken}`);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        // Check if the returned list contains the product we just created
        expect(res.body.some(p => p._id === createdProduct._id)).to.be.true;
    });
  });

  // ===============================================
  // NEW TEST CASES: Buy product and check order
  // ===============================================
  describe("POST /products/buy and GET /products/buy/:orderId", () => {
    let newOrder;

    it("should create a new order and return completed status", async function() {
        this.timeout(30000); // Increase timeout for this test because of long-polling

        const res = await chai
            .request(app.app)
            .post("/products/buy")
            .set("Authorization", `Bearer ${authToken}`)
            .send({ ids: [createdProduct._id] }); // Buy the product created above

        expect(res).to.have.status(201);
        expect(res.body).to.have.property("status", "completed");
        expect(res.body).to.have.property("orderId");
        expect(res.body.products[0]).to.have.property("_id", createdProduct._id);

        // Save the new order for the next test
        newOrder = res.body;
    });

    it("should get the status of the created order", async () => {
        const res = await chai
            .request(app.app)
            .get(`/products/buy/${newOrder.orderId}`) // Use the orderId from the previous test
            .set("Authorization", `Bearer ${authToken}`);

        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal(newOrder); // Check if the returned data matches
    });
  });
});

