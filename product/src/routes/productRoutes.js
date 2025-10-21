// const express = require("express");
// const ProductController = require("../controllers/productController");
// const isAuthenticated = require("../utils/isAuthenticated");

// const router = express.Router();
// const productController = new ProductController();

// router.post("/", isAuthenticated, productController.createProduct);
// router.post("/buy", isAuthenticated, productController.createOrder);
// router.get("/", isAuthenticated, productController.getProducts);

// //phần 8: làm thêm nè - lấy danh sách hóa đơn
// router.get("/buy/:orderId", isAuthenticated, productController.getOrderStatus);


// module.exports = router;



const express = require("express");
const isAuthenticated = require("../utils/isAuthenticated");
// Bỏ dòng require ProductController đi vì chúng ta không tạo mới ở đây

// SỬA LỖI: Chuyển toàn bộ file thành một hàm export ra ngoài.
// Hàm này sẽ nhận vào một 'productController' từ bên ngoài (từ app.js).
module.exports = function(productController) {
  const router = express.Router();

  // Bây giờ, tất cả các route sẽ sử dụng CÙNG MỘT productController
  // mà app.js đã tạo ra.
  router.post("/", isAuthenticated, productController.createProduct);
  router.get("/", isAuthenticated, productController.getProducts);
  router.post("/buy", isAuthenticated, productController.createOrder);
  router.get("/buy/:orderId", isAuthenticated, productController.getOrderStatus);

  return router;
};

