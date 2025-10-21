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
const config = require("./config");

class App {
  constructor() {
    this.app = express();
    this.connection = null;
    this.channel = null;
  }

  async init() {
    await this.connectDB();
    await this.setupOrderConsumer();
  }

  async connectDB() {
    try {
      await mongoose.connect(config.mongoURI);
      console.log("Order Service: MongoDB connected");
    } catch (error) {
      console.error("Order Service: MongoDB connection error:", error);
      process.exit(1);
    }
  }

  async setupOrderConsumer() {
    console.log("Order Service: Connecting to RabbitMQ...");
    try {
      this.connection = await amqp.connect(config.rabbitMQURI);
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(config.orderQueue, { durable: true });
      await this.channel.assertQueue(config.productQueue, { durable: true });
      console.log("Order Service: Connected to RabbitMQ and queues asserted. Waiting for messages...");
  
      this.channel.consume(config.orderQueue, async (data) => {
        if (data !== null) {
          // --- BƯỚC DEBUG: Thêm log chi tiết ---
          console.log("--- ORDER SERVICE: MESSAGE RECEIVED ---");
          const messageContent = data.content.toString();
          console.log("Raw message content:", messageContent);

          try {
            const { products, username, orderId } = JSON.parse(messageContent);
            console.log(`Processing orderId: ${orderId} for user: ${username}`);
    
            const newOrder = new Order({
              products,
              user: username,
              totalPrice: products.reduce((acc, product) => acc + product.price, 0),
            });
            console.log("Attempting to save order to DB...");
    
            await newOrder.save();
            console.log("Order saved to DB successfully!");
    
            this.channel.ack(data);
    
            const responsePayload = { orderId, user: newOrder.user, products: newOrder.products, totalPrice: newOrder.totalPrice };
            this.channel.sendToQueue(
              config.productQueue,
              Buffer.from(JSON.stringify(responsePayload))
            );
            console.log("--- ORDER SERVICE: CONFIRMATION SENT ---");

          } catch (error) {
            console.error("!!! ORDER SERVICE: CRITICAL ERROR processing message !!!");
            console.error(error); // In ra toàn bộ lỗi
            this.channel.nack(data, false, false); 
          }
        }
      });
    } catch (err) {
      console.error("Order Service: Failed to connect to RabbitMQ:", err.message);
      process.exit(1);
    }
  }

  start() {
    const port = config.port || 3002;
    this.server = this.app.listen(port, () =>
      console.log(`Order service started (but only consumes messages)`)
    );
  }
}

module.exports = App;



