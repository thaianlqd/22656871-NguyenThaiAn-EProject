// const express = require("express");
// const mongoose = require("mongoose");
// const config = require("./config");
// const MessageBroker = require("./utils/messageBroker");
// const productsRouter = require("./routes/productRoutes");
// require("dotenv").config();

// class App {
//   constructor() {
//     this.app = express();
//     this.connectDB();
//     this.setMiddlewares();
//     this.setRoutes();
//     this.setupMessageBroker();
//   }

//   async connectDB() {
//     await mongoose.connect(config.mongoURI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("MongoDB connected");
//   }

//   async disconnectDB() {
//     await mongoose.disconnect();
//     console.log("MongoDB disconnected");
//   }

//   setMiddlewares() {
//     this.app.use(express.json());
//     this.app.use(express.urlencoded({ extended: false }));
//   }

//   setRoutes() {
//     this.app.use("/products", productsRouter);
//   }

//   setupMessageBroker() {
//     MessageBroker.connect();
//   }

//   start() {
//     this.server = this.app.listen(3001, () =>
//       console.log("Server started on port 3001")
//     );
//   }

//   // async stop() {
//   //   await mongoose.disconnect();
//   //   this.server.close();
//   //   console.log("Server stopped");
//   // }
//   async stop() {
//     // Thêm dòng kiểm tra này
//     if (this.server) {
//       this.server.close();
//     }
//     await mongoose.disconnect();
//     console.log("Server stopped");
//   }
// }

// module.exports = App;


//=> thai an - update:
const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const MessageBroker = require("./utils/messageBroker");
// SỬA ĐỔI: Import cả router và controller instance từ file routes
const { router: productsRouter, productController } = require("./routes/productRoutes");
require("dotenv").config();

class App {
  constructor() {
    this.app = express();
    // Di chuyển các tác vụ bất đồng bộ ra khỏi constructor
    this.setMiddlewares();
    this.setRoutes();
  }

  // TẠO MỚI: Dùng hàm async init() để khởi động an toàn
  async init() {
    try {
      await this.connectDB();
      await this.setupMessageBroker();
      // Bắt đầu lắng nghe tin nhắn CHỈ SAU KHI RabbitMQ đã kết nối thành công
      productController.listenForOrderCompletion();
    } catch (error) {
      console.error("Product Service: Failed to initialize application:", error);
      process.exit(1); // Thoát ứng dụng nếu khởi tạo thất bại
    }
  }

  async connectDB() {
    await mongoose.connect(config.mongoURI);
    console.log("Product Service: MongoDB connected");
  }

  setMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  setRoutes() {
    // API Gateway sẽ xử lý tiền tố /products
    this.app.use("/products", productsRouter);
  }

  async setupMessageBroker() {
    // SỬA ĐỔI: Dùng await để đảm bảo kết nối hoàn tất
    await MessageBroker.connect();
  }

  start() {
    this.server = this.app.listen(config.port, () =>
      console.log(`Product Service started on port ${config.port}`)
    );
  }

  async stop() {
    if (this.server) {
      this.server.close();
    }
    await mongoose.disconnect();
    await MessageBroker.close(); // Thêm đóng kết nối RabbitMQ
    console.log("Product Service stopped");
  }
}

module.exports = App;




