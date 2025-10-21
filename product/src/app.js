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


//test:
const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const messageBroker = require("./utils/messageBroker");
const productsRouter = require("./routes/productRoutes");
const ProductController = require("./controllers/productController");
require("dotenv").config();

class App {
  constructor() {
    this.app = express();
    // Khởi tạo controller trước để có thể sử dụng trong toàn bộ class
    this.productController = new ProductController();
  }

  // SỬA LỖI: Thêm một hàm init() để xử lý các tác vụ bất đồng bộ (async)
  // Đây là "nhạc trưởng" đảm bảo mọi thứ chạy đúng thứ tự.
  async init() {
    this.setMiddlewares();
    // Truyền controller đã được khởi tạo vào router khi thiết lập
    this.setRoutes(this.productController); 
    await this.connectDB();
    // Quan trọng: Kết nối RabbitMQ xong rồi mới bắt đầu lắng nghe
    await this.setupMessageBroker();
  }

  async connectDB() {
    try {
      await mongoose.connect(config.mongoURI);
      console.log("Product Service: MongoDB connected");
    } catch (error) {
      console.error("Product Service: MongoDB connection error:", error);
      process.exit(1);
    }
  }

  setMiddlewares() {
    this.app.use(express.json());
  }

  // Sửa lại hàm này để nó nhận vào controller
  setRoutes(controller) {
    this.app.use("/products", productsRouter(controller));
  }

  // SỬA LỖI: Hàm này đảm bảo kết nối RabbitMQ xong...
  async setupMessageBroker() {
    await messageBroker.connect();
    // ...rồi mới ra lệnh cho controller bắt đầu lắng nghe.
    this.productController.listenForMessages();
  }

  start() {
    this.server = this.app.listen(config.port || 3001, () =>
      console.log(`Server started on port ${config.port || 3001}`)
    );
  }

  async stop() {
    if (this.server) {
      this.server.close();
    }
    await mongoose.disconnect();
    if (messageBroker.close) {
      await messageBroker.close();
    }
  }
}

module.exports = App;

