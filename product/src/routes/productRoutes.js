const express = require("express");
const ProductController = require("../controllers/productController");
const isAuthenticated = require("../utils/isAuthenticated");

const router = express.Router();
const productController = new ProductController();

router.post("/", isAuthenticated, productController.createProduct);
router.post("/buy", isAuthenticated, productController.createOrder);
router.get("/", isAuthenticated, productController.getProducts);

//phần 8: làm thêm nè - lấy danh sách hóa đơn
router.get("/buy/:orderId", isAuthenticated, productController.getOrderStatus);


module.exports = router;




