// const express = require("express");
// const mongoose = require("mongoose");
// const Order = require("./models/order");
// const amqp = require("amqplib");
// const config = require("./config");

// class App {
//   constructor() {
//     this.app = express();
//     this.connectDB();
//     this.setupOrderConsumer();
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

//   async setupOrderConsumer() {
//     console.log("Connecting to RabbitMQ...");
  
//     setTimeout(async () => {
//       try {
//         const amqpServer = "amqp://guest:guest@thaian_rabbitmq:5672";
//         const connection = await amqp.connect(amqpServer);
//         console.log("Connected to RabbitMQ");
//         const channel = await connection.createChannel();
//         await channel.assertQueue("orders");
  
//         channel.consume("orders", async (data) => {
//           // Consume messages from the order queue on buy
//           console.log("Consuming ORDER service");
//           const { products, username, orderId } = JSON.parse(data.content);
  
//           const newOrder = new Order({
//             products,
//             user: username,
//             totalPrice: products.reduce((acc, product) => acc + product.price, 0),
//           });
  
//           // Save order to DB
//           await newOrder.save();
  
//           // Send ACK to ORDER service
//           channel.ack(data);
//           console.log("Order saved to DB and ACK sent to ORDER queue");
  
//           // Send fulfilled order to PRODUCTS service
//           // Include orderId in the message
//           const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
//           channel.sendToQueue(
//             "products",
//             Buffer.from(JSON.stringify({ orderId, user, products: savedProducts, totalPrice }))
//           );
//         });
//       } catch (err) {
//         console.error("Failed to connect to RabbitMQ:", err.message);
//       }
//     }, 10000); // add a delay to wait for RabbitMQ to start in docker-compose
//   }



//   start() {
//     this.server = this.app.listen(config.port, () =>
//       console.log(`Server started on port ${config.port}`)
//     );
//   }

//   async stop() {
//     await mongoose.disconnect();
//     this.server.close();
//     console.log("Server stopped");
//   }
// }

// module.exports = App;


//test:
const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const Order = require("./models/order");
const config = require("./config");
require('dotenv').config(); // Đảm bảo .env được đọc

class App {
  constructor() {
    this.app = express();
    // Khởi tạo là null để kiểm tra
    this.channel = null; 
    this.connection = null;
  }

  // Dùng hàm async init để đảm bảo mọi thứ kết nối xong mới chạy
  async init() {
    this.setMiddlewares();
    await this.connectDB();
    await this.setupOrderConsumer();
  }

  async connectDB() {
    try {
      // Sửa lại: Dùng config.mongoURI
      await mongoose.connect(config.mongoURI);
      console.log("Order Service: MongoDB connected");
    } catch (error) {
      console.error("Order Service: MongoDB connection error:", error);
      process.exit(1); // Thoát nếu không kết nối được DB
    }
  }

  async setupOrderConsumer() {
    console.log("Order Service: Connecting to RabbitMQ...");
    try {
      // Sửa lại: Dùng config.rabbitMQURI
      this.connection = await amqp.connect(config.rabbitMQURI);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertQueue(config.orderQueue, { durable: false });
      await this.channel.assertQueue(config.productQueue, { durable: false });
      console.log("Order Service: RabbitMQ connected and queues asserted.");

      // Bắt đầu lắng nghe tin nhắn từ hàng đợi 'orders'
      this.channel.consume(config.orderQueue, async (data) => {
        if (data !== null) {
          try {
            console.log("Order Service: Consuming message from 'orders' queue");
            const { products, username, orderId } = JSON.parse(data.content);

            // Tính toán tổng giá
            const totalPrice = products.reduce((acc, p) => acc + p.price, 0);

            const newOrder = new Order({
              products: products.map(p => p._id), // Chỉ lưu ID sản phẩm
              user: username,
              totalPrice: totalPrice,
            });

            await newOrder.save();
            console.log("Order Service: Order saved to DB.");
            
            // Gửi tin nhắn phản hồi về cho service 'product'
            // Gửi lại đầy đủ thông tin đơn hàng để product service cập nhật
            const responsePayload = {
              orderId,
              products,
              totalPrice,
              user: username,
              status: 'completed' // Trạng thái cuối cùng
            };

            this.channel.sendToQueue(
              config.productQueue,
              Buffer.from(JSON.stringify(responsePayload))
            );
            console.log("Order Service: Sent confirmation to 'products' queue.");

            // Gửi ACK sau khi đã xử lý xong và gửi phản hồi
            this.channel.ack(data);

          } catch (consumeError) {
            console.error("Error processing message:", consumeError);
            // NACK để message có thể được xử lý lại (nếu cần)
            this.channel.nack(data, false, false);
          }
        }
      });
    } catch (err) {
      console.error("Order Service: Failed to connect to RabbitMQ:", err.message);
      process.exit(1); // Thoát nếu không kết nối được RabbitMQ
    }
  }

  start() {
    // Service này không cần mở cổng HTTP, nó chỉ chạy nền để xử lý message
    console.log(`Order service is running in the background...`);
  }

  async stop() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    await mongoose.disconnect();
    console.log("Order service stopped gracefully.");
  }
}

module.exports = App;

