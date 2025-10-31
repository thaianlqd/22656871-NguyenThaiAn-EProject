// require("dotenv").config(); // Load .env ngay từ đầu, trước mọi module khác

// const express = require("express");
// const mongoose = require("mongoose");
// const config = require("./config");
// const authMiddleware = require("./middlewares/authMiddleware");
// const AuthController = require("./controllers/authController");

// class App {
//   constructor() {
//     this.app = express();
//     this.authController = new AuthController();
//     this.connectDB();
//     this.setMiddlewares();
//     this.setRoutes();
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
//     this.app.post("/login", (req, res) => this.authController.login(req, res));
//     this.app.post("/register", (req, res) => this.authController.register(req, res));
//     this.app.get("/dashboard", authMiddleware, (req, res) => res.json({ message: "Welcome to dashboard" }));
//   }

//   start() {
//     this.server = this.app.listen(3000, () => console.log("Server started on port 3000"));
//   }

//   async stop() {
//     await mongoose.disconnect();
//     this.server.close();
//     console.log("Server stopped");
//   }
// }

// module.exports = App;


//=> thai an - update:
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
//tets thư viện
const morgan = require('morgan');
const authMiddleware = require("./middlewares/authMiddleware");
const AuthController = require("./controllers/authController");

class App {
  constructor() {
    this.app = express();
    this.authController = new AuthController();
    this.setMiddlewares();
    this.setRoutes();
  }

  // --- THÊM MỚI ---
  // Di chuyển các tác vụ bất đồng bộ vào hàm init()
  async init() {
    try {
      await this.connectDB();
    } catch (error) {
      console.error("Auth Service: Failed to initialize application:", error);
      process.exit(1);
    }
  }

  async connectDB() {
    await mongoose.connect(config.mongoURI);
    console.log("Auth Service: MongoDB connected");
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("Auth Service: MongoDB disconnected");
  }

  setMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    // --- (2) "NHÉT" MORGAN VÀO ĐÂY NÈ NÍ ---
    // 'dev' là định dạng log: "GET /login 401 12.345 ms"
    this.app.use(morgan("dev"));
  }

  setRoutes() {
    this.app.post("/login", (req, res) => this.authController.login(req, res));
    this.app.post("/register", (req, res) => this.authController.register(req, res));
    this.app.get("/dashboard", authMiddleware, (req, res) => res.json({ message: "Welcome to dashboard" }));
  }

  start() {
    this.server = this.app.listen(3000, () => console.log("Auth Service started on port 3000"));
  }

  async stop() {
    if (this.server) {
      this.server.close();
    }
    await this.disconnectDB();
    console.log("Auth Service stopped");
  }
}

module.exports = App;
