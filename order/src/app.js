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




//=> thai an - update:
// const express = require("express");
// const mongoose = require("mongoose");
// const amqp = require("amqplib");
// const Order = require("./models/order");
// const config = require("./config");

// class App {
//   constructor() {
//     this.app = express();
//     // Không gọi hàm async trong constructor nữa
//   }

//   // Tạo hàm init để xử lý các tác vụ bất đồng bộ một cách an toàn
//   async init() {
//     try {
//       await this.connectDB();
//       await this.setupOrderConsumer();
//     } catch (error) {
//       console.error("Failed to initialize Order Service:", error);
//       process.exit(1); // Thoát ứng dụng nếu không kết nối được
//     }
//   }

//   async connectDB() {
//     await mongoose.connect(config.mongoURI);
//     console.log("Order Service: MongoDB connected");
//   }

//   async disconnectDB() {
//     await mongoose.disconnect();
//     console.log("Order Service: MongoDB disconnected");
//   }

//   async setupOrderConsumer() {
//     console.log("Order Service: Connecting to RabbitMQ...");
    
//     // Đọc URI từ config, không hardcode
//     const connection = await amqp.connect(config.rabbitMQURI);
//     const channel = await connection.createChannel();
//     console.log("Order Service: RabbitMQ connected");

//     // Khai báo cả 2 queue với durable: true để đảm bảo nhất quán
//     await channel.assertQueue(config.rabbitMQQueue, { durable: true }); // 'orders' queue
//     await channel.assertQueue(config.productQueue, { durable: true });  // 'products' queue

//     console.log(`Order Service: Waiting for messages in queue '${config.rabbitMQQueue}'...`);

//     channel.consume(config.rabbitMQQueue, async (data) => {
//       if (data === null) return;

//       console.log("Order Service: Received a new order request.");
//       const { products, username, orderId } = JSON.parse(data.content.toString());

//       const newOrder = new Order({
//         products,
//         user: username,
//         totalPrice: products.reduce((acc, product) => acc + product.price, 0),
//       });

//       await newOrder.save();
//       console.log("Order Service: Order saved to DB.");
      
//       // Gửi ACK (Acknowledgement) để báo cho RabbitMQ biết tin nhắn đã được xử lý xong
//       channel.ack(data);

//       // Gửi tin nhắn "hoàn thành" trở lại cho product-service
//       // Dùng tên queue từ config
//       channel.sendToQueue(
//         config.productQueue, 
//         Buffer.from(JSON.stringify({ orderId, ...newOrder.toJSON() }))
//       );
//       console.log(`Order Service: Sent completion message back to queue '${config.productQueue}'.`);
//     });
//   }

//   start() {
//     this.server = this.app.listen(config.port, () =>
//       console.log(`Order Service started on port ${config.port}. This service has no HTTP routes.`)
//     );
//   }

//   async stop() {
//     if (this.server) {
//         this.server.close();
//     }
//     await this.disconnectDB();
//     console.log("Order Service stopped");
//   }
// }

// module.exports = App;

//thái an - update: bản chính thức:
//=> thai an - update:
const express = require("express");
const mongoose = require("mongoose");
const amqp = require("amqplib");
const Order = require("./models/order");
const config = require("./config");

// HÀM CHỜ (THÊM MỚI)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class App {
  constructor() {
    this.app = express();
    // THÊM MỚI: Khai báo để lưu trữ kết nối
    this.amqpConnection = null;
    this.amqpChannel = null;
    this.server = null;
  }

  // SỬA LẠI HÀM INIT (Giống product)
  async init() {
    // Bỏ try-catch
    this.connectDBWithRetry(); // Không await
    this.setupOrderConsumerWithRetry(); // Không await
  }

  // TẠO MỚI: Hàm connect DB với logic "thử lại"
  async connectDBWithRetry() {
    let connected = false;
    while (!connected) {
      try {
        await mongoose.connect(config.mongoURI);
        connected = true;
        console.log("Order Service: MongoDB connected (finally!)");
      } catch (error) {
        console.log(
          "Order Service: MongoDB connection failed. Retrying in 5 seconds..."
        );
        await sleep(5000); // Chờ 5s rồi thử lại
      }
    }
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("Order Service: MongoDB disconnected");
  }

  // TẠO MỚI: Hàm connect RabbitMQ với logic "thử lại"
  async setupOrderConsumerWithRetry() {
    let connected = false;
    while (!connected) {
      try {
        console.log("Order Service: Connecting to RabbitMQ...");
        
        // Đọc URI từ config
        this.amqpConnection = await amqp.connect(config.rabbitMQURI);
        this.amqpChannel = await this.amqpConnection.createChannel();
        
        console.log("Order Service: RabbitMQ connected (finally!)");
        connected = true; // Đánh dấu kết nối thành công

        // === Bắt đầu logic nghiệp vụ CHỈ SAU KHI kết nối thành công ===

        // Khai báo cả 2 queue
        await this.amqpChannel.assertQueue(config.rabbitMQQueue, { durable: true }); // 'orders'
        await this.amqpChannel.assertQueue(config.productQueue, { durable: true }); // 'products'

        console.log(
          `Order Service: Waiting for messages in queue '${config.rabbitMQQueue}'...`
        );

        // Bắt đầu "lắng nghe"
        this.amqpChannel.consume(config.rabbitMQQueue, async (data) => {
          if (data === null) return;

          try {
            console.log("Order Service: Received a new order request.");
            const { products, username, orderId } = JSON.parse(
              data.content.toString()
            );

            const newOrder = new Order({
              products,
              user: username,
              totalPrice: products.reduce(
                (acc, product) => acc + product.price,
                0
              ),
            });

            await newOrder.save();
            console.log("Order Service: Order saved to DB.");

            // Gửi tin nhắn "hoàn thành" trở lại cho product-service
            this.amqpChannel.sendToQueue(
              config.productQueue,
              Buffer.from(JSON.stringify({ orderId, ...newOrder.toJSON() }))
            );
            
            console.log(
              `Order Service: Sent completion message back to queue '${config.productQueue}'.`
            );

            // Gửi ACK (Acknowledgement) cuối cùng để báo đã xử lý xong
            this.amqpChannel.ack(data);

          } catch (consumeError) {
            console.error("Order Service: Error processing message:", consumeError);
            // Gửi NACK (Negative Ack) để RabbitMQ biết tin nhắn xử lý lỗi
            // false = không re-queue tin nhắn này, tránh lặp vô tận
            this.amqpChannel.nack(data, false, false);
          }
        });
        
      } catch (error) {
        // Đây là catch của "thử lại"
        console.log(
          "Order Service: RabbitMQ connection failed. Retrying in 5 seconds..."
        );
        await sleep(5000); // Chờ 5s rồi thử lại
      }
    }
  }

  start() {
    this.server = this.app.listen(config.port, () =>
      console.log(
        `Order Service started on port ${config.port}. This service has no HTTP routes.`
      )
    );
  }

  async stop() {
    if (this.server) {
      this.server.close();
    }
    await this.disconnectDB();
    
    // THÊM MỚI: Đóng kết nối RabbitMQ khi stop
    try {
      if (this.amqpChannel) await this.amqpChannel.close();
      if (this.amqpConnection) await this.amqpConnection.close();
      console.log("Order Service: RabbitMQ connection closed.");
    } catch (error) {
      console.error("Order Service: Error closing RabbitMQ connection", error);
    }
    
    console.log("Order Service stopped");
  }
}

module.exports = App;
