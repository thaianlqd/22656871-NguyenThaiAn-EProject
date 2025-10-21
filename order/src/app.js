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
const Order = require("./models/order");
const amqp = require("amqplib");
const config = require("./config"); // <-- SỬ DỤNG FILE CONFIG

class App {
  constructor() {
    this.app = express();
    // Không gọi các hàm async ở đây nữa, chuyển vào init()
  }

  // SỬA LỖI: Thêm hàm init() để đảm bảo mọi thứ khởi động đúng thứ tự
  async init() {
    await this.connectDB();
    await this.setupOrderConsumer();
  }

  async connectDB() {
    try {
      // Bỏ các option cũ, Mongoose v7+ không cần nữa
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
      // SỬA LỖI: Sử dụng URI từ file config, và bỏ setTimeout
      const connection = await amqp.connect(config.rabbitMQURI);
      const channel = await connection.createChannel();

      // Đảm bảo cả 2 queue đều tồn tại
      await channel.assertQueue(config.orderQueue);
      await channel.assertQueue(config.productQueue);
      console.log("Order Service: Connected to RabbitMQ and queues asserted.");
  
      channel.consume(config.orderQueue, async (data) => {
        if (data !== null) {
          console.log("Order Service: Consuming message from 'orders' queue");
          try {
            const { products, username, orderId } = JSON.parse(data.content);
    
            const newOrder = new Order({
              products,
              user: username,
              totalPrice: products.reduce((acc, product) => acc + product.price, 0),
            });
    
            await newOrder.save();
            console.log("Order Service: Order saved to DB.");
    
            channel.ack(data);
    
            // Gửi message xác nhận về cho service product
            const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
            channel.sendToQueue(
              config.productQueue, // SỬA LỖI: Dùng tên queue từ config
              Buffer.from(JSON.stringify({ orderId, user, products: savedProducts, totalPrice }))
            );
            console.log("Order Service: Confirmation sent to 'products' queue.");

          } catch (error) {
            console.error("Order Service: Error processing message:", error);
            // Báo cho RabbitMQ biết message bị lỗi
            channel.nack(data, false, false); 
          }
        }
      });
    } catch (err) {
      console.error("Order Service: Failed to connect to RabbitMQ:", err.message);
      process.exit(1); // Thoát nếu không kết nối được RabbitMQ
    }
  }

  // start() không cần thiết vì service này không có API, nhưng cứ để đây
  start() {
    const port = config.port || 3002;
    this.server = this.app.listen(port, () =>
      console.log(`Order service started (but only consumes messages)`)
    );
  }
}

module.exports = App;


