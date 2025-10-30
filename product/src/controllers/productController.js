// const Product = require("../models/product");
// const messageBroker = require("../utils/messageBroker");
// const uuid = require('uuid');

// /**
//  * Class to hold the API implementation for the product services
//  */
// class ProductController {

//   constructor() {
//     this.createOrder = this.createOrder.bind(this);
//     this.getOrderStatus = this.getOrderStatus.bind(this);
//     this.ordersMap = new Map();

//     // SỬA LỖI: Không còn tự động lắng nghe ở đây nữa.
//     // Việc lắng nghe sẽ được kích hoạt từ một nơi khác (app.js) sau khi kết nối đã sẵn sàng.
//   }

//   // // SỬA LỖI: Tạo một hàm riêng để lắng nghe RabbitMQ
//   // // Hàm này sẽ được gọi bởi app.js SAU KHI RabbitMQ đã kết nối thành công.
//   // listenForMessages() {
//   //   console.log("Product Controller is now listening for messages...");
//   //   messageBroker.consumeMessage("products", (orderData) => {
//   //     try {
//   //       if (!orderData || !orderData.orderId) {
//   //           console.warn("Received invalid message from 'products' queue:", orderData);
//   //           return;
//   //       }
//   //       const { orderId } = orderData;
//   //       const order = this.ordersMap.get(orderId);
//   //       if (order) {
//   //         // Cập nhật trạng thái và toàn bộ dữ liệu đơn hàng trong bộ nhớ tạm
//   //         this.ordersMap.set(orderId, { ...order, ...orderData, status: 'completed' });
//   //         console.log(`Order ${orderId} status updated to completed.`);
//   //       }
//   //     } catch (error) {
//   //         console.error("Error processing message from 'products' queue:", error);
//   //     }
//   //   });
//   // }

//   async createProduct(req, res, _next) { // <-- Đổi thành '_next'
//     try {
//       const token = req.headers.authorization;
//       if (!token) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }
//       const product = new Product(req.body);

//       const validationError = product.validateSync();
//       if (validationError) {
//         return res.status(400).json({ message: validationError.message });
//       }

//       await product.save({ timeout: 30000 });

//       res.status(201).json(product);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Server error" });
//     }
//   }

//   async createOrder(req, res, _next) {
//     //note: cứ tạm như này trước đã :v phần quantity từ từ để sau
//     try {
//       const token = req.headers.authorization;
//       if (!token) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }
  
//       const { ids } = req.body;
//       const products = await Product.find({ _id: { $in: ids } });
  
//       const orderId = uuid.v4(); // Generate a unique order ID
//       this.ordersMap.set(orderId, { 
//         status: "pending", 
//         products, 
//         username: req.user.username
//       });
  
//       await messageBroker.publishMessage("orders", {
//         products,
//         username: req.user.username,
//         orderId, // include the order ID in the message to orders queue
//       });

//       //test nha
//       messageBroker.consumeMessage("products", (data) => {
//         const orderData = JSON.parse(JSON.stringify(data));
//         const { orderId } = orderData;
//         const order = this.ordersMap.get(orderId);
//         if (order) {
//           // update the order in the map
//           this.ordersMap.set(orderId, { ...order, ...orderData, status: 'completed' });
//           console.log("Updated order:", order);
//         }
//       });
      
  
//       // Long polling until order is completed
//       let order = this.ordersMap.get(orderId);
      
//       while (order.status !== 'completed') {
//         await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second before checking status again
//         order = this.ordersMap.get(orderId);
//       }
  
//       // Once the order is marked as completed, return the complete order details
//       return res.status(201).json(order);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Server error" });
//     }
//   }
  
//  //phần 8: làm thêm nè - lấy danh sách hóa đơn
//   async getOrderStatus(req, res, _next) {
//     const { orderId } = req.params;
//     const order = this.ordersMap.get(orderId);
//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }
//     return res.status(200).json(order);
//   }



//   async getProducts(req, res, _next) {
//     try {
//       const token = req.headers.authorization;
//       if (!token) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }
//       const products = await Product.find({});

//       res.status(200).json(products);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Server error" });
//     }
//   }

 
  
// }

// module.exports = ProductController;


//=> thai an - update:
const Product = require("../models/product");
const messageBroker = require("../utils/messageBroker");
const uuid = require('uuid');

const mongoose = require("mongoose");

class ProductController {
  constructor() {
    this.createOrder = this.createOrder.bind(this);
    this.getOrderStatus = this.getOrderStatus.bind(this);
    this.ordersMap = new Map();
  }

  /**
   * This method is called ONLY ONCE when the application starts.
   * It creates a single consumer to listen for completion messages from the order-service.
   */
  listenForOrderCompletion() {
    console.log("Product Controller is now listening for 'products' queue...");
    messageBroker.consumeMessage("products", (orderData) => {
      try {
        if (!orderData || !orderData.orderId) {
          console.warn("Received invalid message from 'products' queue:", orderData);
          return;
        }
        const { orderId } = orderData;
        const order = this.ordersMap.get(orderId);
        if (order) {
          // Update the order status and its data in the temporary map
          this.ordersMap.set(orderId, { ...order, ...orderData, status: 'completed' });
          console.log(`Order ${orderId} status updated to 'completed'.`);
        }
      } catch (error) {
        console.error("Error processing message from 'products' queue:", error);
      }
    });
  }

  async createProduct(req, res, _next) {
    try {
      const product = new Product(req.body);
      const validationError = product.validateSync();
      if (validationError) {
        return res.status(400).json({ message: validationError.message });
      }
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async createOrder(req, res, _next) {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Product IDs are required." });
      }

      const products = await Product.find({ _id: { $in: ids } });
      if (products.length !== ids.length) {
        return res.status(404).json({ message: "One or more products not found." });
      }

      const orderId = uuid.v4();

      // Store the initial state of the order
      this.ordersMap.set(orderId, {
        status: "pending",
        products,
        username: req.user.username
      });

      // Publish the message to the order-service
      await messageBroker.publishMessage("orders", {
        products,
        username: req.user.username,
        orderId,
      });

      // Start the long-polling process to wait for the result
      const startTime = Date.now();
      const timeout = 30000; // 30 seconds timeout

      let order = this.ordersMap.get(orderId);
      while (order && order.status !== 'completed' && (Date.now() - startTime < timeout)) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
        order = this.ordersMap.get(orderId);
      }

      // // Delete the order from the map after processing to save memory => phần này không cần xóa nên bỏ qua
      // this.ordersMap.delete(orderId);
      

      if (!order || order.status !== 'completed') {
        console.log(`Order ${orderId} timed out.`);
        return res.status(408).json({ message: "Order processing timed out." });
      }
      
      return res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getOrderStatus(req, res, _next) {
    const { orderId } = req.params;
    const order = this.ordersMap.get(orderId);
    if (!order) {
      // If not in map, it might have been completed and deleted, or never existed.
      return res.status(404).json({ message: 'Order not found or already completed.' });
    }
    return res.status(200).json(order);
  }

  async getProducts(req, res, _next) {
    try {
      const products = await Product.find({});
      res.status(200).json(products);
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  //phần 8: phần thêm vào đây nè xem san pham = id 2
  async getid(req, res){
    const product =  await Product.findById(req.params.id);

    res.status(200).json(product);
  }
  

  // async getProductById(req, res) {
    // const product = await Product.findById(req.params.id);

    // if(!product){
    //   return res.status(404).json({message: "product not found"});
    // }

    // res.status(200).json(product);
  // }


}

module.exports = ProductController;

